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
const graph = require('fbgraph');

  export async function getSearchData(){
    var returnObj = await firebase.storage().ref('filters/SearchFile.json').getDownloadURL()
    .then(function(url) {
      return fetch(url);
    })
    .then(response => response.json())
    .then((jsonData) => {
      return JSON.parse(lz.decompress(jsonData));
    })
    .catch((error) => {
      console.error(error)
    })

    store.dispatch({ type: SET_SEARCH_DATA, payload: returnObj });
    store.dispatch({ type: STOP_LOADING_UI });
  }

  export async function submitWeeklyVote(voteCount, waifu){
    store.dispatch({ type: LOADING_UI });

    var voteObj = {
      vote: voteCount,
      husbando: store.getState().user.credentials.userName,
      husbandoId: store.getState().user.credentials.userId,
      img: store.getState().user.credentials.img
    };

    await axios.post('/submitWeeklyVote', {waifuId: waifu.waifuId ,voteObj})
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

  export async function submitDailyVote(voteCount, waifu){
    store.dispatch({ type: LOADING_UI });

    var voteObj = {
      vote: voteCount,
      husbando: store.getState().user.credentials.userName,
      husbandoId: store.getState().user.credentials.userId,
      img: store.getState().user.credentials.img
    };
    
    await axios.post('/submitDailyVote', {waifuId: waifu.waifuId, voteObj})
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

  export function buyWaifu(waifu){
    var user = store.getState().user.credentials;
    var price = waifu.rank * 5;

    firebase.firestore().doc(`waifus/${waifu.waifuId}`).update({ husbando: user.userName, husbandoId: user.userId})
    .then(() => {
      return firebase.firestore().doc(`users/${user.userId}`).update({ points: user.points - price});
    })
    .then(() =>{
      store.dispatch({
        type: SET_SNACKBAR,
        payload: [{type:"success", message: `${waifu.name} was purchased`}]
      });
    })
    .catch((err) => {
      store.dispatch({
        type: SET_SNACKBAR,
        payload: [{type:"error", message: err.message}]
      });
    })
  }
  
  export function submitTrade(trade){
    var poll = store.getState().data.poll;
    if(!poll.isActive){
      store.dispatch({
        type: SET_SNACKBAR,
        payload: [{ type: "error", message: "Cannot Submit Trade During Active Poll" }]
      });
    }

    trade.status = "Active";

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
      userFightRec.waifusUsed.push(waifu.id)
      userFightRec.defeated = true;

/*       store.dispatch({
        type: SET_SNACKBAR,
        payload: [{ type: "Success", message: "You've Defeated The Boss!" }]
      }); */
    }
    else{
      if((bossFightObj.bossHp - totalDmg) > bossFightObj.defense)
      {
        fightResult = 2;
        rewardResult = "Waifu Lost And Was Sent To Shop!";
        userFightRec.waifusUsed.push(waifu.id)
        await waifu.ref.update({husbando: "Shop", husbando:""})

/*         store.dispatch({
          type: SET_SNACKBAR,
          payload: [{ type: "Warning", message: "Your Waifu Was Lost To The Shop" }]
        }); */
      }
      else
      {
        fightResult = 3;
        rewardResult = "Boss Not Defated. No Reward";
        userFightRec.waifusUsed.push(waifu.id)
      }
    }

    await boss.ref.update({fights})

    return {totalDmg, rolls, fightResult, rewardResult}
  }

  export const clearErrors = () => (dispatch) => {
    dispatch({ type: CLEAR_ERRORS });
  }

  export function setRealTimeListeners(){
    var token = JSON.parse(localStorage.authUser)
    var unSubUser = firebase.firestore().doc(`/users/${token.uid}`).onSnapshot(function(doc) {
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
          user.waifus.push({...doc.data(), id: doc.id});
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
        if(x.id != token.uid){
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
        var fromWaifus = waifus.filter(y => trade.from.waifus.includes(y.link))
        var toWaifus = waifus.filter(y => trade.to.waifus.includes(y.link))

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

    var unSubPollWaifus = firebase.firestore().collection("waifuPoll").onSnapshot(function(querySnapshot) {
      var poll = {
        weekly: [],
        daily: [],
      };
      try{
        querySnapshot.forEach(function(doc) {
          if(doc.data().husbando == "Poll")
            poll.weekly.push({...doc.data(), waifuId: doc.id})
          else
            poll.daily.push({...doc.data(), waifuId: doc.id})
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
/*           store.dispatch({
            type: SET_SNACKBAR,
            payload: [{ type: "info", message:  `${reward[x]} Points Added` }]
          }); */
          break;
        case "statCoins":
          result += `\n ${reward[x]} Stat Coins`
          user.ref.update({statCoins: user.data().statCoins + reward[x]})
/*           store.dispatch({
            type: SET_SNACKBAR,
            payload: [{ type: "info", message: `${reward[x]} Stat Coins Added` }]
          }); */
          break;
        case "rankCoins":
          result += `\n ${reward[x]} Rank Coins`
          user.ref.update({rankCoins: user.data().rankCoins + reward[x]})
/*           store.dispatch({
            type: SET_SNACKBAR,
            payload: [{ type: "info", message: `${reward[x]} Rank Coins Added` }]
          }); */
          break;
      }
    })

    return result;
  }
  
  export function closePoll(){
    firebase.firestore().doc(`/poll/weekly`).update({ isActive: false })
    .then(() => {
        return firebase.firestore().collection("users").get()
    })
    .then(async data => {
        return {users: data.docs, waifus: await firebase.firestore().collection("waifuPoll").get()}
    })
    .then(async (data) =>{
        const users = []
        data.users.forEach(x => { users.push(x.id) });

        const waifus = data.waifus;
        const ties = [];
        const shop = [];
        const winners = [];
        const waifuPollUpdates = [];
        let bonusWaifu = null;
        
        waifus.forEach(async (snapshot) => {
            const waifu = snapshot.data();
            const votes = waifu.votes;
            if(votes.length > 0){
                const topVotes = _.orderBy(votes, ['vote'], ['desc']);
                const maxVote = topVotes[0].vote;
    
                if(votes.filter((x)  => x.vote === maxVote).length > 1){ //theres a tie
                    if(waifu.rank === 1){//first tie so rank up and keep in poll
                        ties.push(waifu.link); //push link so we update all these waifus rank in loop
                        waifuPollUpdates.push({waifu: waifu.link, type: "Poll"})
                    } 
                    else{
                        shop.push(waifu.link); //push link so we update all these waifus rank in loop
                        waifuPollUpdates.push({waifu: waifu.link, type: "Shop"})
                    }
                }
                else{ //no tie theres a winner
                    const userExists = users.includes(topVotes[0].husbandoId);
                    winners.push({
                        husbando:  userExists ? topVotes[0].husbando : "Shop",
                        husbandoId: userExists ? topVotes[0].husbandoId : "",
                        waifu: waifu.link,
                        vote: topVotes[0].vote
                    })
                }
            }
            else { //no one voted so either add to tie or shop based on rank
                if(waifu.rank === 1) //first tie so rank up and keep in poll
                    ties.push(waifu.link); //push link so we update all these waifus rank in loop
                else
                    shop.push(waifu.link); //push link so we update all these waifus rank in loop
            }
        })
        
        if(winners.length > 0){
            const highestVote = _.orderBy(winners, ['vote'], ['desc']);
            const maxVote = highestVote[0].vote;
            const userExists = users.includes(highestVote[0].husbandoId);
            const type = userExists ? "Poll" : "Shop";
            if(highestVote.filter((x) => x.vote === maxVote).length > 1)//multiple people tied for highest vote no bonus given
                bonusWaifu = null;
            else{
                bonusWaifu = highestVote[0].waifu
                waifuPollUpdates.push({waifu: bonusWaifu, type})
            }
        }
        
        return {ties, shop, winners, bonusWaifu, waifuPollUpdates};
        //const pollResults = await determinePoll(waifus);
    })
    .then(async (results) => {

        await results.ties.forEach(async (x ) =>{
            await firebase.firestore().collection("waifus").where("link", "==", x).limit(1).get()
            .then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    return firebase.firestore().collection("waifus").doc(doc.id).update({rank: doc.data().rank + 1});
                });
            })
            .then(() => {
                return firebase.firestore().collection('pollLogs').add({ log: `${x} Added As A Tie`, timestamp: new Date() })
            })
            .catch((err) => {
                return firebase.firestore().collection('pollLogs').add({ log: err.message, timestamp: new Date() })
            })
        })

        await results.shop.forEach(async (x ) =>{
            await firebase.firestore().collection("waifus").where("link", "==", x).limit(1).get()
            .then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    console.log(doc.id, " => ", doc.data());
                    // Build doc ref from doc.id
                    return firebase.firestore().doc(`waifus/${doc.id}`).update({rank: doc.data().rank + 1, husbando: "Shop"});
                });
            })
            .then(() => {
                return firebase.firestore().collection('pollLogs').add({ log: `${x} Added to shop`, timestamp: new Date() })
            })
            .catch((err) => {
                return firebase.firestore().collection('pollLogs').add({ log: err.message, timestamp: new Date() })
            })
        })

        await results.winners.forEach(async (x ) => {
            const isTopVote = (results.bonusWaifu !== null && results.bonusWaifu === x.waifu) ? true: false;
            const husbando = x.husbando;
            const husbandoId = x.husbandoId;
            const waifu = x.waifu;

            await firebase.firestore().collection("waifus").where("link", "==", waifu).limit(1).get()
            .then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    console.log(doc.id, " => ", doc.data());
                    // Build doc ref from doc.id
                    let rank = doc.data().rank;
                    if(isTopVote)
                        rank = rank + 1
                    
                    firebase.firestore().doc(`waifus/${doc.id}`).update({rank, husbando, husbandoId})
                    .then(() =>{
                        return firebase.firestore().collection("waifuPoll").where("link", "==", waifu).limit(1).get()
                    })
                    .catch((err) => {
                        return firebase.firestore().collection('pollLogs').add({ log: err.message, timestamp: new Date() })
                    })
                });
            })
            .then(() => {
                return firebase.firestore().collection('pollLogs').add({ log: `${husbando} has won ${waifu}`, timestamp: new Date() })
            })
            .catch((err) => {
                return firebase.firestore().collection('pollLogs').add({ log: err.message, timestamp: new Date() })
            })
        })

        var submitGroup = _.chain(results.winners).groupBy("husbandoId").map((value, key) => ({ id: key, user: value })).value()
        Object.keys(submitGroup).forEach(async function(key) {
          var husbandoId = submitGroup[key].id
          var count = submitGroup[key].user.length;
          var husbando = submitGroup[key].user[0].husbando;

          if(husbando !== "Shop"){
            await firebase.firestore().doc(`users/${husbandoId}`).update({ submitSlots: count })
            .then(() => {
              return firebase.firestore().collection("pollLogs").add({ log: `${husbando} - ${husbandoId} Submit Slots Increased `,
                timestamp: new Date() })
            })
            .catch((err) => {
              return firebase.firestore().collection("pollLogs").add({ log: "User Doesnt Exist", timestamp: new Date() })
            })
          }
        });

        await results.waifuPollUpdates.forEach(async (x) => {
            await firebase.firestore().collection("waifuPoll").where("link", "==", x.waifu).limit(1).get()
            .then((data) => {
                data.forEach(doc => {
                    const waifuData = doc.data();
                    return doc.ref.update({rank: waifuData.rank + 1, husbando: x.type})
                })
            })
        })
        
        firebase.firestore().collection("pollLogs").add({ log: results, timestamp: new Date() })
        .catch((err) => {
            return firebase.firestore().collection('pollLogs').add({ log: err.message, timestamp: new Date() })
        })
        return firebase.firestore().collection("tasks").where("worker", "==", "openPoll").limit(1).get()
    })
    .then((data) => {
        if(data.empty){
            return null
        }
        else{
            const date = new Date()
            date.setDate(date.getDate() + 1);
            date.setHours(0,0,0,0);

            return data.docs[0].ref.update({ performAt: date, status: "scheduled" })
        }
    })
    .then(() => {
        return firebase.firestore().collection("pollLogs").add({ log: "Close Poll Complete - Open Poll Set", timestamp: new Date() })
    })
    .catch((err) => {
        return firebase.firestore().collection("pollLogs").add({ log: err.message, timestamp: new Date() })
    })
  }
  export function openPoll(){
    firebase.firestore().collection("waifuPoll").get()
      .then(async (data) => {
          data.forEach(rec => {
              rec.ref.delete()
              .catch((err) => {
                  return firebase.firestore().collection('pollLogs').add({ log: err.message, timestamp: new Date() })
              })
          })
          
          await firebase.firestore().collection("pollLogs").add({ log: "Delete All Current Waifus In Poll", timestamp: new Date() })
          .catch((err) => {
              return firebase.firestore().collection('pollLogs').add({ log: err.message, timestamp: new Date() })
          })
          return firebase.firestore().collection("waifus").get()
      })
      .then(async (waifus) => {
          const addWaifus = [];
          const pollWaifus = [];
          const waifuLinks = waifus.docs.map(x => x.data().link);
          let pollCount = waifus.docs.filter(x => x.data().husbando === "Poll").length;
          waifus.docs.filter(x => x.data().husbando === "Poll").forEach(x => {
              pollWaifus.push({...x.data(), waifuId: x.id});
          })

          if(pollCount < 3){
              const url = await firebase.storage().ref('filters/SearchFile.json').getDownloadURL()
              const returnWaifus = await fetch(url)
              .then(response => response.json())
              .then((jsonData) => {
                  return JSON.parse(lz.decompress(jsonData));
              })
              .then((data) => {
                const characters = data.characters
                characters['Anime-Manga'].items = characters['Anime-Manga'].items.filter(x => !waifuLinks.includes(x.link))
                characters['Marvel'].items = characters['Marvel'].items.filter(x => !waifuLinks.includes(x.link))
                characters['DC'].items = characters['DC'].items.filter(x => !waifuLinks.includes(x.link))

                  while(pollCount < 3){
                    var randomWaifu = getRandWaifu(characters)
                    if (addWaifus.map(x => x.link).includes(randomWaifu.link))
                        continue;
                    
                    addWaifus.push(randomWaifu);
                    pollCount = pollCount + 1
                  }
                  return firebase.firestore().collection("pollLogs").add({ log: {pollWaifus, addWaifus}, timestamp: new Date() })
              })
              .then(async() => {
                  return {pollWaifus, addWaifus};
              })
              .catch((error) => {
                  return firebase.firestore().collection('pollLogs').add({ log: error, timestamp: new Date() })
              })

              return returnWaifus;
          }
          else{
              await firebase.firestore().collection("pollLogs").add({ log: {pollWaifus, addWaifus}, timestamp: new Date() })
              .catch((err) => {
                  return firebase.firestore().collection('pollLogs').add({ log: err.message, timestamp: new Date() })
              })
              return {pollWaifus, addWaifus};
          }
      })
      .then(async (waifus) => {
          waifus.addWaifus.forEach(async x => {
              x.rank = 1; //since no one voted 
              x.attack = 1;
              x.defense = 1;
              x.husbando = "Poll";
              x.husbandoId = "";
              
              const newWaifu = x;

              await firebase.firestore().collection("waifus").add(x)
              .then((data) => {
                  newWaifu.waifuId = data.id;
                  newWaifu.votes = [];
                  waifus.pollWaifus.push(newWaifu);
              });
          });
          
          await firebase.firestore().collection("pollLogs").add({ log: waifus.pollWaifus, timestamp: new Date() })
          .catch((err) => {
              return firebase.firestore().collection('pollLogs').add({ log: err.message, timestamp: new Date() })
          })

          return waifus.pollWaifus;
      })
      .then(async (waifus) => {
          waifus.forEach(async x => {
              await firebase.firestore().collection("waifuPoll").add(x);
          });
          return firebase.firestore().collection("users").get()
      })
      .then(async (users) => {
          users.forEach(x => {
              x.ref.update({ submitSlots: 0 })
              .catch((err) => {
                  return firebase.firestore().collection('pollLogs').add({ log: err.message, timestamp: new Date() })
              })
          })
          
          await firebase.firestore().collection("pollLogs").add({ log: "All Submit Slots Have Been Reset", timestamp: new Date() })
          .catch((err) => {
              return firebase.firestore().collection('pollLogs').add({ log: err.message, timestamp: new Date() })
          })
          
          const date = new Date()
          date.setDate(date.getDate() + 6);
          date.setHours(0,0,0,0);
          return firebase.firestore().doc(`/poll/weekly`).update({ isActive: true, activeTill: date})
      })
      .then(() => {
          return firebase.firestore().collection("tasks").where("worker", "==", "closePoll").limit(1).get()
      })
      .then((data) => {
          if(data.empty)
              return null
          else{
              const date = new Date()
              date.setDate(date.getDate() + 6);
              date.setHours(0,0,0,0);
  
              return data.docs[0].ref.update({ performAt: date, status: "scheduled" })
          }
      })
      .then(() => {
          return firebase.firestore().collection("pollLogs").add({ log: "Poll Has Been Opened - Poll Will Close", timestamp: new Date() })
      })
      .catch((err) => {
          return firebase.firestore().collection('pollLogs').add({ log: err.message, timestamp: new Date() })
      })
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
  return Math.random() * (max - min) + min; 
}
