import React, { Component, PureComponent, useCallback } from "react";
import _ from 'lodash';

// MUI Stuff
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import withStyles from "@material-ui/core/styles/withStyles";
import Fab from "@material-ui/core/Fab";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import ButtonBase from '@material-ui/core/ButtonBase';

import CloseIcon from '@material-ui/icons/Close';
import KeyboardBackspaceIcon from "@material-ui/icons/KeyboardBackspace";

import Grow from "@material-ui/core/Grow";
import Zoom from "@material-ui/core/Zoom";
import Slide from "@material-ui/core/Slide";
import Divider from '@material-ui/core/Divider';
import ClickAwayListener from "@material-ui/core/ClickAwayListener";

import { FixedSizeGrid as VirtGrid, FixedSizeList as List } from 'react-window';
import AutoSizer from "react-virtualized-auto-sizer";
import { Scrollbars } from 'react-custom-scrollbars';

import { useTheme } from '@material-ui/core/styles';

import AMCharDetails from '../components/AMCharDetails'
import ComicCharDetails from '../components/ComicCharDetails'
import CharacterThumbNail from '../components/CharacterThumbNail'
import { fightBoss } from '../redux/actions/dataActions'

// Redux stuff
import watch from 'redux-watch'
import { connect } from 'react-redux';
import store from '../redux/store';
import {
    SET_POLL_WAIFUS,
    LOADING_DATA,
    SET_SNACKBAR
  } from '../redux/types';

const styles = (theme) => ({
  ...theme.spreadThis,
  media: {
    height: 250,
  },
  large: {
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
  card: {
    transition: "transform .1s",
  },
  cardRaised: {
    transform: "scale(1.1)",
  },
  returnFab: {
    position: "absolute",
    zIndex: 5,
    bottom: theme.spacing(2),
    left: theme.spacing(2),
  },
  closeFab: {
    position: "absolute",
    zIndex: 5,
    top: theme.spacing(2),
    right: theme.spacing(2),
  },
});

const UserWaifus = ({ data , columnIndex, rowIndex, style }) => {
  if(data[0][rowIndex] == undefined || data[0][rowIndex][columnIndex] == undefined)
    return <></>

	const card = data[0][rowIndex][columnIndex];
  const selectWaifu = data[1];
  const userRec = data[2];/* .waifusUsed.includes(card.id) */;
  let alreadyUsed = false;

  if(userRec != null)
    alreadyUsed = userRec.waifusUsed.includes(card.id);

  const cardStyle =_.cloneDeep(style);
  delete cardStyle.top;
  delete cardStyle.left;

  return(
    <div style={style}>
      <CharacterThumbNail card={card} style={cardStyle} columnIndex={columnIndex} selectCard={selectWaifu}/>
    </div>
  )
}

const CustomScrollbars = ({ onScroll, forwardedRef, style, children }) => {
  const refSetter = useCallback(
    scrollbarsRef => {
      if (scrollbarsRef) {
        forwardedRef(scrollbarsRef.view);
      } else {
        forwardedRef(null);
      }
    },
    [forwardedRef]
  );

  return (
    <Scrollbars
      ref={refSetter}
      style={{ ...style, overflow: "hidden" }}
      onScroll={onScroll}
    >
      {children}
    </Scrollbars>
  );
};

const CustomScrollbarsVirtualList = React.forwardRef((props, ref) => (
  <CustomScrollbars {...props} forwardedRef={ref} />
));

const outerRef = React.createRef();
export class Gauntlet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      userInfo: {...store.getState().user.credentials, waifus: _.orderBy(store.getState().user.waifus, ['rank'], ['desc']) },
      bosses: store.getState().data.bosses,
      selectedBoss: null,
      selectedWaifu: null,
      waifuRank: "",
      fightActive: false,
      fightCompleted: false,
      fightResult: 0,
      rolls: [],
      totalDmg: 0,
      userFightRec: null,
      showRules: false,
    };
    
    this.selectBoss = this.selectBoss.bind(this)
    this.selectWaifu = this.selectWaifu.bind(this)
    this.startFight = this.startFight.bind(this)

    let dataReducerWatch = watch(store.getState, 'data')
    store.subscribe(dataReducerWatch((newVal, oldVal, objectPath) => {
      var userFightRec = null;

      if(this.state.selectedBoss != null && !_.isEmpty(newVal.bosses.filter(x => x.bossId == this.state.selectedBoss.bossId))){
        var boss = newVal.bosses.filter(x => x.bossId == this.state.selectedBoss.bossId)[0];
        userFightRec = this.checkUserBossFight(boss);
      }

      this.setState({ ...newVal, userFightRec})
    }))

    let userReducerWatch = watch(store.getState, 'user')
    store.subscribe(userReducerWatch((newVal, oldVal, objectPath) => {
      this.setState({ userInfo: {...newVal.credentials, waifus: _.orderBy(newVal.waifus, ['rank'], ['desc']) }})
    }))
  }

  async componentDidMount() {
  }

  selectBoss(boss){
    var userFightRec = this.checkUserBossFight(boss)
    
    if(userFightRec != null && userFightRec.defeated){
      store.dispatch({
        type: SET_SNACKBAR,
        payload: [{ type: "Warning", message: "You've already defeated this boss" }]
      });
      return
    }

    this.setState({selectedBoss: boss, userFightRec})
  }

  checkUserBossFight(boss){
    var fights = _.cloneDeep(boss.fights);
    var userFightRec = fights.filter(x => x.husbandoId == this.state.userInfo.userId)
    if(_.isEmpty(userFightRec))
      userFightRec = null
    else
      userFightRec = userFightRec[0]

    return userFightRec;
  }

  selectWaifu(waifu){
    var alreadyUsed = false;
    if(this.state.userFightRec != null){
      if(this.state.userFightRec.defeated){
        store.dispatch({
          type: SET_SNACKBAR,
          payload: [{ type: "Warning", message: "You've already defeated this boss" }]
        });
        return
      }

      if(this.state.userFightRec.waifusUsed.includes(waifu.id)){
        alreadyUsed = this.state.userFightRec.waifusUsed.includes(waifu.id);
        store.dispatch({
          type: SET_SNACKBAR,
          payload: [{ type: "Warning", message: "Waifu Already Used To Fight This Boss" }]
        });
        return
      }
    }

    var rankClass = "";
    switch(waifu.rank){
        case 1: {rankClass = "trashRank"; break;}
        case 2: {rankClass = "bronzeRank"; break;}
        case 3: {rankClass = "silverRank"; break;}
        case 4: {rankClass = "goldRank"; break;}
    }

    this.setState({selectedWaifu: waifu, waifuRank: rankClass})
  }

  async startFight(){
    this.setState({fightActive: true});
    var bossFightObj = {
      waifuId: this.state.selectedWaifu.id,
      diceCount : this.state.selectedWaifu.rank,
      attack : this.state.selectedWaifu.attack,
      defense : this.state.selectedWaifu.defense,
      bossName : this.state.selectedBoss.name,
      bossHp : this.state.selectedBoss.hp,
      bossReward : this.state.selectedBoss.reward,
      bossId: this.state.selectedBoss.bossId
    }

    var result = await fightBoss(bossFightObj)
    
    setTimeout(function (){
      this.setState({fightCompleted: true, rolls: result.rolls, totalDmg: result.totalDmg, fightResult: result.fightResult, rewardResult: result.rewardResult})
    }.bind(this), 750)
  }

  render() {
    var {classes} = this.props;
    return (
      <>
        <div style={{height: "100%", width:"100%"}}>
          {this.state.loading ? <></>
            :
            <Grid container style={{height: "100%", width:"100%"}}>
              <Grow in={true} style={{ transformOrigin: "0 0 0" }} timeout={500}>
                <Grid container justify="center" style={{height:"100%", position:"absolute", zIndex:"1px", top:"0",left:"0", backgroundColor:"#000000bf"}}>
                  {this.state.bosses.map(boss => {
                    return (
                      <Grid key={boss.name} className="bossContainer" container item xs={4} onClick={() => this.selectBoss(boss)}>
                        <div className="bossCover" style={{backgroundImage: "url("+boss.img+")"}}>
                          <div style={{height:"100%",width:"100%", 
                            background: "linear-gradient(0deg, rgba(255,149,0,1) 0%, rgba(255,149,0,0.7) 25%, rgba(252,177,0,0.5) 100%)"}}/>
                        </div>
                          
                        <div className="bossThumbnail" >
                          <img src={boss.img} />
                        </div>
                        
                        <div className="bossHp">
                          <Typography>HP: {boss.hp}</Typography>
                        </div>
                        
                        <div className="bossName">
                          <Typography>{boss.name}</Typography>
                        </div>
                      </Grid>
                    )
                  })}
                </Grid>
              </Grow>
            </Grid>
          }
        </div>
      
        {this.state.selectedBoss != null ?
          <Grid container style={{height:"100%", position:"absolute", zIndex:3, top:0, left:0, backgroundColor:"rgba(0, 0, 0, 0.95)"}}>
            <Grid container item xs={5} style={{height:"100%"}}>
              {this.state.selectedWaifu == null ?
                <Grid className="waifuContainer" container item xs={12} style={{height:"100%"}} container item xs={12} style={{height:"100%"}}>
                  <AutoSizer>
                    {({height, width}) =>
                    {
                      var columnWidth = 220;
                      var columnCount = Math.floor(width / columnWidth)
                      if((width/columnCount) > columnCount)
                        columnWidth = (width/columnCount)

                      var data = _.chunk(_.cloneDeep(this.state.userInfo.waifus), columnCount);
                      if(!_.isEmpty(data)){
                        var missingItemCount = columnCount - data[data.length - 1].length;
                        data[data.length - 1].concat(_.fill(Array(missingItemCount), null))
                      }

                      return (
                        <VirtGrid
                          outerRef={outerRef}
                          className="Grid"
                          width={width}
                          height={height}
                          rowCount={data.length}
                          rowHeight={320}
                          columnCount={columnCount}
                          columnWidth={columnWidth}
                          itemData={[ data, this.selectWaifu, this.state.userFightRec, {...this.props} ]}
                          outerElementType={CustomScrollbarsVirtualList}
                          onScroll={({scrollTop}) => {
                            this.currScroll = scrollTop;
                          }}
                        >
                        {UserWaifus}
                        </VirtGrid>
                      )
                    }}
                  </AutoSizer>
                </Grid>
              :
              <Grid className={`${this.state.fightResult == 0 ? "selWaifuContainer" : 
                this.state.fightResult == 2 || this.state.fightResult == 3 ? "lossContainer" :
                this.state.fightResult == 1 ? "winContainer" : "selWaifuContainer"}`}
                container item xs={12} style={{pointerEvents: "none"}}>
                  <div className="waifuCover" style={{backgroundImage: "url("+this.state.selectedWaifu.img+")"}}>
                    <div className={this.state.waifuRank} style={{height:"100%",width:"100%"}}/>
                  </div>
                    
                  <div className="waifuThumbnail">
                    <img src={this.state.selectedWaifu.img} />
                  </div>
                  
                  <div className="waifuAttack">
                    <Typography>Atk: {this.state.selectedWaifu.attack}</Typography>
                  </div>
                  <div className="waifuDefense">
                    <Typography>Def: {this.state.selectedWaifu.defense}</Typography>
                  </div>
                </Grid>
              }
            </Grid>

            <Grid container item xs={2} style={{position:"relative"}}>
              <Grid alignContent="center" justify="center" container item xs={12}>
                <Grow in={!this.state.fightActive}>
                  <Button variant="contained" color="primary" disabled={this.state.selectedWaifu == null} onClick={this.startFight}
                    style={{color:"white", border:"solid 1px white", fontFamily:"TarrgetLaser", fontSize:"25px", width:"90%", height:"50px"}}>FIGHT</Button>
                </Grow>

                <Grow in={this.state.fightCompleted}>
                  <Grid container style={{display: this.state.fightCompleted ? "block" : "none", position:"relative"}}>
                    {this.state.rolls.length > 1 ?
                      <Grid justify="center" container item xs={12} style={{ position:"absolute", top:0, left:"50%", transform:"translate(-50%,-100%)"}}>
                        {this.state.rolls.map((roll, index) => 
                          {
                            var transitionDelay = (index+1) * 250;
                            return (
                              <Grid justify="center" container item xs={3}>
                                <div className="RollContainer" style={{animationDelay: `${transitionDelay}ms`}}>
                                  <Typography className="RollText">{roll}</Typography>
                                </div>
                              </Grid>
                            )
                          }
                        )}
                      </Grid>
                    :<></>
                    }
                    <Grid justify="center" container item xs={12} style={{position: "relative"}}>
                      <div className="totalDmgContainer">
                        <Typography className="totalText">Total</Typography>
                        <Typography className="totalDmgText">{this.state.totalDmg}</Typography>
                      </div>

                      <div className="rewardTextContainer">
                        <Typography className="rewardText">{this.state.rewardResult}</Typography>
                      </div>
                    </Grid>
                  </Grid>
                </Grow>
              </Grid>

              <Grid justify="center" container item xs={12} style={{position:"absolute", top:0,left:0}}>
                <Typography className="RulesBtn"
                onMouseEnter={() => this.setState({showRules: true})}
                onMouseLeave={() => this.setState({showRules: false})}>RULES</Typography>
                {this.state.showRules ?
                  <div className="RulesContainer">
                    <div className="Rules">
                      <Typography style={{color:"white",fontFamily:"Edo", fontSize:"15px"}}>
                      -Players choose a Waifu to go to battle by commenting with the name of one from their list.
                      </Typography>
                      <Typography style={{color:"white",fontFamily:"Edo", fontSize:"15px"}}>
                      - The enemy has a single HP stat. The Waifu’s total attack damage simply must be higher than
                      this number to win.
                      </Typography>
                      <Typography style={{color:"white",fontFamily:"Edo", fontSize:"15px"}}>
                      - Waifu have an attack stat that determines the max damage that has a chance to be rolled on a
                      digital die. (Example: An Attack of “4” means 1,2,3 or 4 could be rolled.)
                      </Typography>
                      <Typography style={{color:"white",fontFamily:"Edo", fontSize:"15px"}}>
                      - The rank of a waifu determines the number of rolls. (Higher rank, more rolls) The current ranks
                      are Trash, Bronze, Silver, and Gold.
                      </Typography>
                      <Typography style={{color:"white",fontFamily:"Edo", fontSize:"15px"}}>
                      - Adding all the roll results together gets the total attack damage.
                      </Typography>
                      <Typography style={{color:"white",fontFamily:"Edo", fontSize:"15px"}}>
                      - If the Waifu’s total damage is lower than the enemy HP, the difference is compared to their
                      Defense stat. If the difference is higher, the Waifu loses and goes to the Waifu dump, where
                      she can be purchased by any player again.
                      </Typography>
                      <Typography style={{color:"white",fontFamily:"Edo", fontSize:"15px"}}>
                      - The way to boost stats and rank up will be decided at a later time. So will PvP rules.
                      </Typography>
                      <Typography style={{color:"white",fontFamily:"Edo", fontSize:"15px"}}>
                      - Rewards could include rank ups, points, even stealing other waifus or sending them to the
                      dump.
                      </Typography>
                    </div>
                  </div>
                :<></>}
                
              </Grid>
            </Grid>

            <Grid className={`${this.state.fightResult == 0 ? "selBossContainer" : 
              this.state.fightResult == 1 || this.state.fightResult == 3 ? "lossContainer" :
              this.state.fightResult == 2 ? "winContainer" : "selBossContainer"}`}
              container item xs={5} style={{pointerEvents: "none"}}>
              <div className="bossCover" style={{backgroundImage: "url("+this.state.selectedBoss.img+")"}}>
                <div style={{height:"100%",width:"100%", 
                  background: "linear-gradient(0deg, rgba(255,149,0,1) 0%, rgba(255,149,0,0.7) 25%, rgba(252,177,0,0.5) 100%)"}}/>
              </div>
                
              <div className="bossThumbnail">
                <img src={this.state.selectedBoss.img} />
              </div>
              
              <div className="bossHp">
                <Typography>HP: {this.state.selectedBoss.hp}</Typography>
              </div>

              <div className="bossName">
                <Typography>{this.state.selectedBoss.name}</Typography>
              </div>
            </Grid>
            
            <Zoom
              in={this.state.selectedWaifu != null}
              style={{
                transitionDelay: "250ms",
              }}
              unmountOnExit
            >
              <Fab
                aria-label={"return"}
                className={classes.returnFab}
                color={"secondary"}
                onClick={() => this.setState({selectedWaifu: null, fightActive: false, fightCompleted: false, fightResult:0})}
              >
                <KeyboardBackspaceIcon />
              </Fab>
            </Zoom>
            <Zoom
              in={true}
              style={{
                transitionDelay: "250ms",
              }}
              unmountOnExit
            >
              <Fab
                aria-label={"close"}
                className={classes.closeFab}
                color={"secondary"}
                onClick={() => this.setState({selectedBoss:null, selectedWaifu:null, fightActive: false, fightCompleted: false, fightResult:0})}
              >
                <CloseIcon />
              </Fab>
            </Zoom>
          </Grid>
        :
          <></>
        }
      </>
    )
  }
}

export default (withStyles(styles)(Gauntlet));
