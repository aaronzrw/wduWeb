import {
  SET_WEEKLY_POLL,
  SET_DAILY_POLL,
  SET_POLL_WAIFUS,
  SET_SEARCH_DATA,
  SET_TRADES,
  SET_SNACKBAR,
  SUBMIT_WAIFU,
  CLEAR_ERRORS,
  LOADING_DATA,
  STOP_LOADING_DATA,
  LOADING_UI,
  STOP_LOADING_UI,
  SET_OTHER_USERS,
  SET_WAIFU_LIST,
  UNSUB_SNAPSHOTS,
  SUB_SNAPSHOTS,
  SET_GAUNTLET,
  SET_USER
} from '../types';
import firebase, { firestore } from 'firebase/app';
import axios from 'axios';
import 'firebase/auth';
import store from '../store';
import jwtDecode from 'jwt-decode';
import _ from 'lodash'
import lz from "lz-string";  
import { user } from 'firebase-functions/lib/providers/auth';
const graph = require('fbgraph');

export async function getSearchData(){
  store.dispatch({ type: LOADING_UI });

  await axios.get('/getSearchData')
  .then( async (res) => {    
    return (await fetch(res.data)).json()
  })
  .then((data) => {
    data = JSON.parse(lz.decompress(data));
    store.dispatch({ type: SET_SEARCH_DATA, payload: data });
  })
  .catch((err) => {
    console.log(err)
  });
  
  store.dispatch({ type: STOP_LOADING_UI });
}

export async function useRankCoin(waifu){
  store.dispatch({ type: LOADING_UI });
  
  var user = store.getState().user.credentials;
	await firebase.firestore().doc(`waifus/${waifu.waifuId}`).get()
	.then(doc => {
		var stats = getBaseStats(doc.data().rank + 1);
		return doc.ref.update({ ...stats })
	})
	.then(() => {
		return firebase.firestore().doc(`users/${user.userId}`).get()
	})
	.then(doc => {
		return doc.ref.update({ rankCoins: doc.data().rankCoins - 1 });
	})
  .then(()=>{
    store.dispatch({
      type: SET_SNACKBAR,
      payload: {type: "success", message: `${waifu.name} Has Been Ranked Up`}
    });
  })
  .catch((error) => {
    store.dispatch({
      type: SET_SNACKBAR,
      payload: {type: "error", message: `Error Ranking Up Waifu`}
    });
  })

  store.dispatch({ type: STOP_LOADING_UI });
}

export async function useStatCoin(waifu, stats){
  store.dispatch({ type: LOADING_UI });
  
  var user = store.getState().user.credentials;
	await firebase.firestore().doc(`waifus/${waifu.waifuId}`).get()
	.then(doc => {
    var waifu = doc.data()
    waifu.attack = waifu.attack + stats.attack;
    waifu.defense = waifu.defense + stats.defense;
		
		return doc.ref.set(waifu)
	})
	.then(() => {
		return firebase.firestore().doc(`users/${user.userId}`).get()
	})
	.then(doc => {
		return doc.ref.update({ statCoins: doc.data().statCoins - (stats.attack + stats.defense) });
	})
  .then(()=>{
    store.dispatch({
      type: SET_SNACKBAR,
      payload: {type: "success", message: `${waifu.name}'s stats have been updated`}
    });
  })
  .catch((error) => {
    store.dispatch({
      type: SET_SNACKBAR,
      payload: {type: "error", message: `Error Using Stat Coin(s)`}
    });
  })

  store.dispatch({ type: STOP_LOADING_UI });
}

export function updateWaifuImg(waifu, imgUrl){
  store.dispatch({ type: LOADING_UI });
  
  firebase.firestore().doc(`waifus/${waifu.waifuId}`).update({img : imgUrl})

  store.dispatch({ type: STOP_LOADING_UI });
}

export async function submitVote(voteCount, waifu){
  store.dispatch({ type: LOADING_UI });

  var voteObj = {
    vote: voteCount,
    husbandoId: store.getState().user.credentials.userId,
    img: store.getState().user.credentials.img
  };
  
  await axios.post('/submitVote', {waifuId: waifu.waifuId, voteObj})
  .then((res) => {
    console.log(res.data)
  })
  .catch((err) => {
    store.dispatch({
      type: SET_SNACKBAR,
      payload: err
    });
  });
  
  store.dispatch({ type: STOP_LOADING_UI });
}

export async function submitWaifu(waifuData){
  store.dispatch({ type: LOADING_UI });
  
  await axios.post('/submitWaifu', waifuData)
  .then((res) => {
    console.log(res.data)
  })
  .catch((err) => {
    store.dispatch({
      type: SET_SNACKBAR,
      payload: err
    });
  });
  
  store.dispatch({ type: STOP_LOADING_UI });
}

export async function buyWaifu(waifu){
  store.dispatch({ type: LOADING_UI });

  await axios.post('/buyWaifu', waifu)
  .then((res) => {
    console.log(res.data)
  })
  .catch((err) => {
    store.dispatch({
      type: SET_SNACKBAR,
      payload: err
    });
  });
  
  store.dispatch({ type: STOP_LOADING_UI });
}

export function submitTrade(trade){
  // var weeklyPoll = store.getState().data.poll.weekly;
  // if(weeklyPoll.isActive){
  //   store.dispatch({
  //     type: SET_SNACKBAR,
  //     payload: [{ type: "error", message: "Cannot Submit Trade During Active Poll" }]
  //   });
  //   return
  // }

  trade.status = "Active";
  trade.createdDate = new Date();

  firebase.firestore().collection("trades").add({...trade})
  .then(() => {
    store.dispatch({
      type: SET_SNACKBAR,
      payload: [{ type: "success", message: "Trade Successfully Submitted" }]
    });
  })
  .catch((err) => {
    store.dispatch({
      type: SET_SNACKBAR,
      payload: [{ type: "error", message: "Error Submitting Trade" }]
    });
  });
}

export function updateTrade(trade, status){
  firebase.firestore().doc(`trades/${trade.id}`).update({status})
}

export async function fightBoss(bossFightObj){
  var uid = await firebase.auth().currentUser.uid;
  var waifu = (await firebase.firestore().doc(`waifus/${bossFightObj.waifuId}`).get())
  waifu = {...waifu.data(), waifuId: waifu.id}

  var boss = (await firebase.firestore().doc(`gauntlet/${bossFightObj.bossId}`).get())
  var fights = _.cloneDeep(boss.data().fights);
  var userFightRec = fights.filter(x => x.husbandoId == uid)
  if(_.isEmpty(userFightRec)){
    userFightRec = {
      husbandoId: uid,
      waifusUsed: [],
      defeated: false
    }
    fights.push(userFightRec);
    userFightRec = fights.filter(x => x.husbandoId == uid)[0];
  }
  else{
    userFightRec = userFightRec[0]
  }

  var rolls = [];
  for(var i = 0; i < bossFightObj.diceCount; i++){
    rolls.push(randomNumber(1, bossFightObj.attack))
  }

  var totalDmg = rolls.reduce((a, b) => a + b, 0);

  var rewardResult = "";
  var fightResult = 0;
  //calculates final result
  if(totalDmg > bossFightObj.bossHp){
    fightResult = 1;
    rewardResult = await buildBossRewardStr(bossFightObj.bossReward);
    userFightRec.waifusUsed.push(waifu.waifuId)
    userFightRec.defeated = true;

    /*store.dispatch({
      type: SET_SNACKBAR,
      payload: [{ type: "Success", message: "You've Defeated The Boss!" }]
    }); */
  }
  else{
    if((bossFightObj.bossHp - totalDmg) >= bossFightObj.defense)
    {
      fightResult = 2;
      rewardResult = "Waifu Lost And Was Sent To Shop!";
      userFightRec.waifusUsed.push(waifu.waifuId)
      await waifu.ref.update({husbandoId: "Shop"})

      /*store.dispatch({
        type: SET_SNACKBAR,
        payload: [{ type: "Warning", message: "Your Waifu Was Lost To The Shop" }]
      }); */
    }
    else
    {
      fightResult = 3;
      rewardResult = "Boss Not Defated. No Reward";
      userFightRec.waifusUsed.push(waifu.waifuId)
    }
  }

  await boss.ref.update({fights})

  return {totalDmg, rolls, fightResult, rewardResult}
}

export const clearErrors = () => (dispatch) => {
  dispatch({ type: CLEAR_ERRORS });
}

export async function setRealTimeListeners(userId){
  store.dispatch({ type: LOADING_UI });
  
  var unSubUser = await firebase.firestore().doc(`/users/${userId}`).onSnapshot(function(doc) {
    if (!doc.exists) {
      store.dispatch({
        type: SET_SNACKBAR,
        payload: [{ type: "info", message: "No User" }]
      });
      return;
    }

    var oldUser = _.cloneDeep(store.getState().user)
    var user = _.cloneDeep(store.getState().user)
    user.credentials = {...doc.data(), userId: doc.id};
    firebase.firestore().collection('waifus')
    .where('husbandoId', '==', user.credentials.userId).get()
    .then((data) => {
      user.waifus = [];
      data.forEach((doc) => {
        user.waifus.push({...doc.data(), waifuId: doc.id});
      });

      console.log(user);
      store.dispatch({
        type: SET_USER,
        payload: {credentials: user.credentials, waifus: user.waifus}
      });

      if(oldUser.credentials != null && !_.isEqual(oldUser.credentials, user.credentials)){
        store.dispatch({
          type: SET_SNACKBAR,
          payload: [{ type: "info", message: "User Data Updated" }]
        });
      }
    })
    .catch(err => {
    });
  });
  
  var unSubOtherUsers = firebase.firestore().collection('users').onSnapshot(async function(data) {
    var otherUsers = [];

    var waifus = store.getState().data.waifuList;
    if(waifus.length == 0){
      waifus = await firebase.firestore().collection('waifus').get()
      .then((data) => {
        var arr = [];
        data.forEach((doc) => {
          arr.push({...doc.data(), id: doc.id});
        });
        
        return arr
      })
      .catch(err => {
        console.log(err)
      });
    }

    data.forEach(x => {
      if(x.id != userId){
        var nUser = {
          userId: x.id,
          userName: x.data().userName,
          points: x.data().points,
          submitSlots: x.data().submitSlots,
          rankCoins: x.data().rankCoins,
          statCoins: x.data().statCoins,
          img: x.data().img,
          waifus: waifus.filter(y => y.husbandoId == x.id)
        };

        otherUsers.push(nUser);
      }
    })

    store.dispatch({
      type: SET_OTHER_USERS,
      payload: {otherUsers}
    });
  });
  
  var unSubTrades = firebase.firestore().collection('trades').onSnapshot(async function(data) {
    var trades = [];

    var waifus = store.getState().data.waifuList;
    if(waifus.length == 0){
      waifus = await firebase.firestore().collection('waifus').get()
      .then((data) => {
        var arr = [];
        data.forEach((doc) => {
          arr.push({...doc.data(), id: doc.id});
        });
        
        return arr
      })
      .catch(err => {
        console.log(err)
      });
    }

    data.forEach(x => {
      var trade = x.data();
      trade.id = x.id;
      var fromWaifus = waifus.filter(y => trade.from.waifus.includes(y.waifuId))
      var toWaifus = waifus.filter(y => trade.to.waifus.includes(y.waifuId))

      trade.from.waifus = fromWaifus;
      trade.to.waifus = toWaifus;

      trades.push(trade)
    })

    store.dispatch({
      type: SET_TRADES,
      payload: trades
    });
  });    
  
  var unSubWaifus = firebase.firestore().collection("waifus").onSnapshot(function(querySnapshot) {
    var waifus = [];
    querySnapshot.forEach(function(doc) {
      waifus.push({...doc.data(), waifuId: doc.id})
    });

    store.dispatch({ type: SET_WAIFU_LIST, payload: waifus });
  });

  var unSubPollWaifus = firebase.firestore().collection("waifuPoll").onSnapshot(async function(querySnapshot) {
    var poll = {
      weekly: [],
      daily: [],
    };

    try{
      var userList = await firebase.firestore().collection('users').get()
      .then((users) => {
        var templist = [];
  
        users.forEach((user) => {
          templist.push({ userId: user.id, userName: user.data().userName })
        })
  
        return templist
      })
      .catch((err) => {
        console.log(err)
      })

      querySnapshot.forEach(function(doc) {
        var waifu = doc.data();

        waifu.votes.forEach((vote) => {
          var user = userList.filter(x => x.userId == vote.husbandoId)[0].userName
          vote.husbando = user;
        })

        if(waifu.husbandoId == "Poll")
          poll.weekly.push({...waifu, waifuId: doc.id})
        else
          poll.daily.push({...waifu, waifuId: doc.id})
      });

      store.dispatch({
        type: SET_POLL_WAIFUS,
        payload: poll
      });
    }
    catch(err){
      console.log(err);
      store.dispatch({
        type: SET_POLL_WAIFUS,
        payload: {}
      });
    }
    store.dispatch({ type: STOP_LOADING_UI });
    store.dispatch({ type: STOP_LOADING_DATA });
  });
  
  var unSubWeeklyPoll = firebase.firestore().doc("poll/weekly").onSnapshot(function(doc) {
    try{
      var pollObj = {...doc.data()};
      store.dispatch({
        type: SET_WEEKLY_POLL,
        payload: pollObj
      });
    }
    catch(err){
      console.log(err);
      store.dispatch({
        type: SET_WEEKLY_POLL,
        payload: null
      });
    }
    store.dispatch({ type: STOP_LOADING_UI });
    store.dispatch({ type: STOP_LOADING_DATA });  
  });
  
  var unSubDailyPoll = firebase.firestore().doc("poll/daily").onSnapshot(function(doc) {
    try{
      var pollObj = {...doc.data()};

      store.dispatch({
        type: SET_DAILY_POLL,
        payload: pollObj
      });
    }
    catch(err){
      console.log(err);
      store.dispatch({
        type: SET_DAILY_POLL,
        payload: null
      });
    }
    store.dispatch({ type: STOP_LOADING_UI });
    store.dispatch({ type: STOP_LOADING_DATA });  
  });
  
  var unSubGauntlet = firebase.firestore().collection("gauntlet").onSnapshot(function(querySnapshot) {
    try{
      var bosses = [];
      querySnapshot.forEach(function(doc) {
        bosses.push({bossId: doc.id , ...doc.data()});
      });

      store.dispatch({
        type: SET_GAUNTLET,
        payload: bosses
      });
    }
    catch(err){
      console.log(err);
      store.dispatch({
        type: SET_GAUNTLET,
        payload: []
      });
    }
    store.dispatch({ type: STOP_LOADING_UI });
    store.dispatch({ type: STOP_LOADING_DATA });  
  });
  
  store.dispatch({ type: SUB_SNAPSHOTS, payload: {unSubUser, unSubOtherUsers, unSubWaifus, unSubPollWaifus, unSubDailyPoll, unSubWeeklyPoll, unSubTrades, unSubGauntlet} })
}

async function buildBossRewardStr(reward){
  var result = "Boss Was Defeated! Rewards Gained:";
  var rewards = _.keys(reward);
  var uid = await firebase.auth().currentUser.uid;
  var user = await firebase.firestore().doc(`users/${uid}`).get()

  rewards.forEach(x => {
    switch(x){
      case "points":
        result += `\n ${reward[x]} Points`
        user.ref.update({points: user.data().points + reward[x]})
        /*store.dispatch({
          type: SET_SNACKBAR,
          payload: [{ type: "info", message:  `${reward[x]} Points Added` }]
        }); */
        break;
      case "statCoins":
        result += `\n ${reward[x]} Stat Coins`
        user.ref.update({statCoins: user.data().statCoins + reward[x]})
        /*store.dispatch({
          type: SET_SNACKBAR,
          payload: [{ type: "info", message: `${reward[x]} Stat Coins Added` }]
        }); */
        break;
      case "rankCoins":
        result += `\n ${reward[x]} Rank Coins`
        user.ref.update({rankCoins: user.data().rankCoins + reward[x]})
        /*store.dispatch({
          type: SET_SNACKBAR,
          payload: [{ type: "info", message: `${reward[x]} Rank Coins Added` }]
        }); */
        break;
    }
  })

  return result;
}
  
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
  }

  return array;
}

function getRandWaifu(characters){
  let randChanceList = _.fill(Array(50), 1,).concat(_.fill(Array(25), 2)).concat(_.fill(Array(25), 3));
  let randItem = shuffle(randChanceList)[Math.floor(Math.random() * randChanceList.length)]

  let charSet = []
  switch(randItem){
    case 1:
      charSet = characters['Anime-Manga'].items
      break;
    case 2:
      charSet = characters['Marvel'].items
      break;
    case 3:
      charSet = characters['DC'].items
      break;
  }

  return shuffle(charSet)[Math.floor(Math.random() * charSet.length)]
}
function randomNumber(min, max) {  
  return Math.ceil(Math.random() * max); 
}

function getBaseStats(rank){
	var stats = { rank, attack: 1, defense: 1}
	switch (rank){
		case 1:
			stats.attack = 3;
			stats.defense = 1;
			break;
		case 2:
			stats.attack = 7;
			stats.defense = 5;
			break;
		case 3:
			stats.attack = 12;
			stats.defense = 10;
			break;
		case 4:
			stats.attack = 20;
			stats.defense = 15;
			break;
	}
	return stats;
}