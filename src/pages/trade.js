import React, { Component, PureComponent, useCallback } from "react";
import _ from 'lodash';
import CounterInput from "react-counter-input";

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

import KeyboardBackspaceIcon from "@material-ui/icons/KeyboardBackspace";
import CloseIcon from '@material-ui/icons/Close';
import SwapHorizIcon from '@material-ui/icons/SwapHoriz';
import PeopleIcon from "@material-ui/icons/People";

import Grow from "@material-ui/core/Grow";
import Zoom from "@material-ui/core/Zoom";
import Slide from "@material-ui/core/Slide";
import Divider from '@material-ui/core/Divider';
import ClickAwayListener from "@material-ui/core/ClickAwayListener";

import { FixedSizeGrid as VirtGrid, FixedSizeList as List } from 'react-window';
import AutoSizer from "react-virtualized-auto-sizer";
import { Scrollbars } from 'react-custom-scrollbars';

import { useTheme } from '@material-ui/core/styles';

import {submitTrade} from '../redux/actions/dataActions'
import AMCharDetails from '../components/AMCharDetails'
import ComicCharDetails from '../components/ComicCharDetails'
import CharacterThumbNail from '../components/CharacterThumbNail'


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
  closeFab: {
    position: "absolute",
    top: theme.spacing(2),
    right: theme.spacing(2),
  },
	charFab:{
    position: 'absolute',
    bottom: theme.spacing(9),
    right: theme.spacing(2),
	},
  tradesFab:{
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
	},
  returnFab: {
    position: "absolute",
    bottom: theme.spacing(2),
    left: theme.spacing(2),
  },
	counterText:{
    color:"white",
    fontSize:"25px",
    position: 'absolute',
		bootom: theme.spacing(2)
	}
});

const CardItem = ({ data , columnIndex, rowIndex, style }) => {
  const [raised, setRaised] = React.useState(false);
  if(data[0][rowIndex] == undefined || data[0][rowIndex][columnIndex] == undefined)
    return <></>

  const user = data[0][rowIndex][columnIndex];
  const selectedUser = data[1];
  const { classes } = data[2];
  const timeout = (columnIndex + 1) * 500;
      
  const raiseCard = (isRaised) => {
    setRaised(isRaised);
  };
  
  return (
    <Grow
      key={user.userId}
      in={true}
      style={{ transformOrigin: "0 0 0" }}
      timeout={timeout}
    >
      <Grid container alignItems="center" justify="center" style={style}>
        <Grid container style={{height:"100%", padding:"8px"}}>
          <Card
            raised={raised}
            style={{overflow: "inherit", height:"100%", border:"solid 1px white",
              backgroundColor:"transparent", position:"relative"}}
            className={`${classes.card} ${raised ? classes.cardRaised : ""}`}
            onMouseEnter={() => raiseCard(true)}
            onMouseLeave={() => raiseCard(false)}
          >
            <CardActionArea onClick={() => selectedUser(user)} style={{height: "100%"}}>
              <Grid container style={{ height: "100%", border:"solid 1px white", position:"relative"}} >
                <div style={{ height: "100px", width: "100px", filter: "drop-shadow(-1px 6px 3px rgba(50, 50, 0, 0.5))",
                  position:"absolute", top:"50px", left:"50%", transform: "translate(-50%, -50%)"}}>
                  <img src={user.img} style={{ height: "100%", width: "100%", clipPath:"circle(50%)"}} />
                </div>
                  
                <Grid item xs={12} style={{height:"50px", backgroundColor:"white"}}/>
                
                <Grid container item xs={12} style={{height:"calc(100% - 50px)", backgroundColor:"rgba(0, 189, 180, 0.22)"}}>
                  <Grid item xs={12} style={{height:"50px"}} />

                  <Grid container item xs={12} style={{height:"calc(100% - 50px)"}}>
                    <Grid item xs={12} >
                      <Typography style={{fontFamily:"Edo", fontSize:"35px", textAlign:"center", color:"white"}}>{user.userName}</Typography>
                    </Grid>
                    <Grid item xs={12} >
                      <Typography style={{fontFamily:"Edo", fontSize:"25px", textAlign:"center", color:"white"}}>Points - {user.points}</Typography>
                    </Grid>
                    <Grid item xs={12} >
                      <Typography style={{fontFamily:"Edo", fontSize:"25px", textAlign:"center", color:"white"}}>Waifus - {user.waifus.length}</Typography>
                    </Grid>
                    <Grid item xs={12} >
                      <Typography style={{fontFamily:"Edo", fontSize:"25px", textAlign:"center", color:"white"}}>Submit Slots - {user.submitSlots}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
    </Grow>
  )
}

const UserWaifus = ({ data , columnIndex, rowIndex, style }) => {
  const [raised, setRaised] = React.useState(false);
  if(data[0][rowIndex] == undefined || data[0][rowIndex][columnIndex] == undefined)
    return <></>
      
  const card = data[0][rowIndex][columnIndex];
  const selectCard = data[1]
  return (
    <CharacterThumbNail card={card} style={style} columnIndex={columnIndex} selectCard={selectCard}/>
  )
}

class Trades extends PureComponent {
  render() {
    // Access the items array using the "data" prop:
    const item = this.props.data[0][this.props.index];
    const users = [this.props.data[1]].concat(this.props.data[2]);

    const fromUser = users.filter(x => x.userId == item.from.husbandoId)[0];
    const toUser = users.filter(x => x.userId == item.to.husbandoId)[0];
 
    const fromWaifus = item.from.waifus;
    const toWaifus = item.to.waifus;

    const bgRowColor = this.props.index % 2 != 0 ? "#ffffff3b" : "black"
    return (
      <div style={this.props.style}>
        <Grid container spacing={1} style={{height:"100%", position:"relative", backgroundColor: bgRowColor}}>
          {/* From */}
          <Grid container alignItems="center" justify="center" item xs={6}>
            <Grid item xs={4}>
              <Grid container alignItems="center" justify="center" item xs={12}>
                <img src={fromUser.img} style={{height:"100px", width:"100px", clipPath:"circle(50%)"}} />
              </Grid>
              <Grid item xs={12}>
                <Typography style={{color:"white", fontFamily:"Edo", fontSize:"25px", textAlign:"center"}}>{fromUser.userName}</Typography>
              </Grid>
            </Grid>
            <Grid container item xs={8} style={{height:"100%"}}>
              <Grid item xs={12} style={{height:"50px"}}>
                <Typography style={{color:"white", fontFamily:"Edo", fontSize:"35px", textAlign:"center"}}>Points - {item.from.points}</Typography>
              </Grid>
              <Grid item xs={12} style={{height:"50px"}}>
                <Typography style={{color:"white", fontFamily:"Edo", fontSize:"35px", textAlign:"center"}}>Submit Slots - {item.from.submitSlots}</Typography>
              </Grid>
              {fromWaifus.length > 0 ?
                <Grid item xs={12} style={{height:"calc(100% - 100px)"}}>
                  <AutoSizer>
                    {({height, width}) =>
                    {
                      var columnWidth = 100;
                      var columnCount = Math.floor(width / columnWidth)
                      if((width/columnCount) > columnCount)
                        columnWidth = (width/columnCount)
    
                      var data = _.chunk(_.cloneDeep(fromWaifus), columnCount);
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
                          rowHeight={150}
                          columnCount={columnCount}
                          columnWidth={columnWidth}
                          itemData={[ data, () => console.log("Do Nothing"), {...this.props} ]}
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
              :<></>}
            </Grid>
          </Grid>

          {/* To */}
          <Grid container alignItems="center" justify="center" item xs={6}>
            <Grid container item xs={8} style={{height:"100%"}}>
              <Grid item xs={12} style={{height:"50px"}}>
                <Typography style={{color:"white", fontFamily:"Edo", fontSize:"35px", textAlign:"center"}}>Points - {item.to.points}</Typography>
              </Grid>
              <Grid item xs={12} style={{height:"50px"}}>
                <Typography style={{color:"white", fontFamily:"Edo", fontSize:"35px", textAlign:"center"}}>Submit Slots - {item.to.submitSlots}</Typography>
              </Grid>
              {toWaifus.length > 0 ?
                <Grid item xs={12} style={{height:"calc(100% - 100px)"}}>
                  <AutoSizer>
                    {({height, width}) =>
                    {
                      var columnWidth = 250;
                      var columnCount = Math.floor(width / columnWidth)
                      if((width/columnCount) > columnCount)
                        columnWidth = (width/columnCount)
    
                      var data = _.chunk(_.cloneDeep(toWaifus), columnCount);
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
                          rowHeight={150}
                          columnCount={columnCount}
                          columnWidth={columnWidth}
                          itemData={[ data, () => console.log("Do Nothing"), {...this.props} ]}
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
              :<></>}
            </Grid>
            <Grid item xs={4}>
              <Grid container alignItems="center" justify="center" item xs={12}>
                <img src={toUser.img} style={{height:"100px", width:"100px", clipPath:"circle(50%)"}} />
              </Grid>
              <Grid item xs={12}>
                <Typography style={{color:"white", fontFamily:"Edo", fontSize:"25px", textAlign:"center"}}>{toUser.userName}</Typography>
              </Grid>
            </Grid>
          </Grid>
          
          <div style={{position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", height:"75%", width:"3px", backgroundColor:"white"}} />
          <div style={{position:"absolute", bottom:"0px", left:"50%", transform:"translate(-50%,-50%)", height:"3px", width:"75%", backgroundColor:"white"}} />
        </Grid>
      </div>
    );
  }
}

const TradeWaifus = ({ data , columnIndex, rowIndex, style }) => {
  if(data[0][rowIndex] == undefined || data[0][rowIndex][columnIndex] == undefined)
    return <></>    
      
  const card = data[0][rowIndex][columnIndex];
  const user = data[1];
  const tradeWaifus = data[2];
  const selectTradeWaifu = data[3];
  
  var cardStyle = _.cloneDeep(style);
  delete cardStyle.top;
  delete cardStyle.left;

  const isSelected = tradeWaifus.includes(card.link)
  return (
    <div style={style}>
      <div style={{position:"absolute", zIndex:1, top:"0", right:"0", height:"25px", width:"25px"}}>
        <div className={`tradeWaifu ${isSelected ? "tradeWaifuSelected" : ''}`} />
      </div>
      <CharacterThumbNail card={card} style={cardStyle} columnIndex={columnIndex} selectCard={() => selectTradeWaifu(user, card)}/>
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
export class Trade extends Component {
    constructor(props) {
      super(props);
      this.state = {
        loading: false,
        pollIsActive: store.getState().data.poll.weekly.isActive,
        userInfo: {...store.getState().user.credentials, waifus: store.getState().user.waifus },
        users: store.getState().user.otherUsers,
        trades: store.getState().data.trades,
        tradeFrom: {
          points: 0,
          submitSlots: 0,
          waifus: []
        },
        tradeTo: {
          points: 0,
          submitSlots: 0,
          waifus: []
        },
        validTrade:false,
        showCharTab: true,
        makeTrade: false,
        selectedUser: null,
      };

      this.selectedUser = this.selectedUser.bind(this)
      this.selectTradeWaifu = this.selectTradeWaifu.bind(this)
      this.closeView = this.closeView.bind(this)
      
      let dataReducerWatch = watch(store.getState, 'data')
      store.subscribe(dataReducerWatch((newVal, oldVal, objectPath) => {
        this.setState({ ...newVal })
      }))

      let userReducerWatch = watch(store.getState, 'user')
      store.subscribe(userReducerWatch((newVal, oldVal, objectPath) => {
        this.setState({users: newVal.otherUsers, userInfo: newVal.credentials })
      }))
    }    

    async componentDidMount() {
    }

    selectedUser(user){
      console.log(user)
      this.setState({selectedUser: user})
    }
    
    selectTradeWaifu(user,waifu){
      var from = this.state.tradeFrom;
      var to = this.state.tradeTo;
      if(user == "From"){
        if(from.waifus.map(x => x).includes(waifu.link))//if already selected then remove
          from.waifus = from.waifus.filter(x => x != waifu.link);
        else
          from.waifus.push(waifu.link)
      }
      else{
        var to = this.state.tradeTo;
        if(to.waifus.map(x => x).includes(waifu.link))//if already selected then remove
          to.waifus = to.waifus.filter(x => x != waifu.link);
        else
          to.waifus.push(waifu.link)
      }

      var isValid = false;
      if(from.points != 0 || from.submitSlots != 0 || from.waifus.length != 0)
        if(to.points != 0 || to.submitSlots != 0 || to.waifus.length != 0)
          isValid = true

      this.setState({tradeFrom: from, tradeTo: to, validTrade: isValid})
    }

    closeView(){
      this.setState({selectedUser: null, makeTrade: false, showCharTab: true,
        tradeFrom: {
          points: 0,
          submitSlots: 0,
          waifus: []
        },
        tradeTo: {
          points: 0,
          submitSlots: 0,
          waifus: []
        },
        validTrade:false})
    }

    async submitTrade(){
      var from = this.state.tradeFrom;
      var to = this.state.tradeTo;

      from.husbandoId = this.state.userInfo.userId;
      to.husbandoId = this.state.selectedUser.userId;

      var trade={
        from,
        to
      }

      await submitTrade(trade);
      this.setState({makeTrade: false, showCharTab: false,
        tradeFrom: {
          points: 0,
          submitSlots: 0,
          waifus: []
        },
        tradeTo: {
          points: 0,
          submitSlots: 0,
          waifus: []
        },
        validTrade:false})
    }

    render() {
      var {classes} = this.props;
      return (
        <>
          <div style={{height: "100%", width:"100%"}}>
            {this.state.loading ? <></>
              :
              <Grid container style={{height: "100%", width:"100%", padding:"16px"}}>
                <AutoSizer>
                  {({height, width}) =>
                    {
                      var columnWidth = 300;
                      var columnCount = Math.floor(width / columnWidth)
                      if((width/columnCount) > columnCount)
                        columnWidth = (width/columnCount)
    
                      var data = _.chunk(_.cloneDeep(this.state.users), columnCount);
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
                          rowHeight={300}
                          columnCount={columnCount}
                          columnWidth={columnWidth}
                          itemData={[ data, this.selectedUser, {...this.props} ]}
                          outerElementType={CustomScrollbarsVirtualList}
                          onScroll={({scrollTop}) => {
                              this.currScroll = scrollTop;
                          }}
                        >
                            {CardItem}
                        </VirtGrid>
                      )
                    }}
                </AutoSizer>
              </Grid>
            }
          </div>
          
          { this.state.selectedUser != null ?
            <Grow in={true} style={{ transformOrigin: "0 0 0" }} timeout={500}>
              <Grid container style={{height:"100%", position:"absolute", zIndex:"1px", top:"0",left:"0", backgroundColor:"#000000bf"}}>
                <ClickAwayListener onClickAway={() => this.closeView()}>
                  <Grid container justify="center" style={{height:"100%", padding: "8px", position:"absolute", top:"50%",left:"50%", transform:"translate(-50%,-50%)"}}>
                  {!this.state.makeTrade ?
                    <Grid container item xs={12} style={{height:"100%"}}>
                      <Grid container item xs={4} style={{height:"100%", backgroundColor:"white"}}>
                        <Grid container justify="center" alignItems="center" item xs={12} style={{height:"225px"}}>
                          <div style={{width:"200px", height:"200px",filter: "drop-shadow(-1px 6px 3px rgba(50, 50, 0, 0.5))"}}>
                            <img src={this.state.selectedUser.img} style={{width:"200px", height:"200px", clipPath:"circle(50%)"}} />
                          </div>
                          
                        </Grid>
                        
                        <Grid container justify="center" item xs={12} style={{height:"calc(100% - 225px)"}}>
                          <Grid container item xs={12} style={{height:"calc(100% - 50px)"}}>
                            <Grid item xs={12} style={{height:"100px"}}>
                              <Typography style={{fontFamily:"Edo", fontSize:"35px", textAlign:"center"}}>{this.state.selectedUser.userName}</Typography>
                            </Grid>

                            <Divider style={{width:"50%", margin:"10px auto auto"}} />

                            <Grid item xs={12} style={{height:"calc(100% - 100px)"}}>
                              <Typography style={{fontFamily:"Edo", fontSize:"35px", textAlign:"center"}}>Points - {this.state.selectedUser.points}</Typography>
                              <Typography style={{fontFamily:"Edo", fontSize:"35px", textAlign:"center"}}>Rank Coins - {this.state.selectedUser.rankCoins}</Typography>
                              <Typography style={{fontFamily:"Edo", fontSize:"35px", textAlign:"center"}}>Stat Coins - {this.state.selectedUser.statCoins}</Typography>
                              <Typography style={{fontFamily:"Edo", fontSize:"35px", textAlign:"center"}}>Submit Slots - {this.state.selectedUser.submitSlots}</Typography>
                            </Grid>
                          </Grid>
                        
                          <Grid container alignItems="center" justify="center" item xs={12} style={{height:"50px"}}>
                            <Button variant="contained" color="primary" onClick={() => this.setState({makeTrade: true})}
                              style={{fontFamily: "Edo", fontSize:"15px", height:"80%"}}>Start Trade</Button>
                          </Grid>
                        </Grid>
                      </Grid>

                      <Grid container item xs={8} style={{height:"100%", border:"solid 1px white"}}>
                        {this.state.showCharTab ?
                          <>
                            <Grid item xs={12} style={{height:"75px", borderBottom:"solid 1px white", backgroundColor:"black"}}>
                              <Typography align="center" style={{fontFamily:"Edo", fontSize:"45px", color:"white"}}>Characters</Typography>
                            </Grid>
                            <Grid item xs={12} style={{height:"calc(100% - 75px)", backgroundColor:"black"}}>
                              <AutoSizer>
                                {({height, width}) =>
                                {
                                  var columnWidth = 220;
                                  var columnCount = Math.floor(width / columnWidth)
                                  if((width/columnCount) > columnCount)
                                    columnWidth = (width/columnCount)
                
                                  var data = _.chunk(_.cloneDeep(this.state.selectedUser.waifus), columnCount);
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
                                      itemData={[ data, () => console.log("Do Nothing"), {...this.props} ]}
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
                          </>
                        :
                          <>
                            <Grid item xs={12} style={{height:"75px", borderBottom:"solid 1px white", backgroundColor:"black"}}>
                              <Typography align="center" style={{fontFamily:"Edo", fontSize:"45px", color:"white"}}>Trades</Typography>
                            </Grid>
                            <Grid item xs={12} style={{height:"calc(100% - 75px)", backgroundColor:"black"}}>
                              <AutoSizer>
                                {({height, width}) =>
                                {
                                  var data = _.cloneDeep(this.state.trades.filter(x => x.from.husbandoId == this.state.selectedUser.userId ||
                                    x.to.husbandoId == this.state.selectedUser.userId));

                                  return (
                                    <List
                                      outerRef={outerRef}
                                      outerElementType={CustomScrollbarsVirtualList}
                                      height={height}
                                      itemData={[data, this.state.userInfo, this.state.users]}
                                      itemCount={data.length}
                                      itemSize={350}
                                      width={width}
                                    >
                                      {Trades}
                                    </List>
                                  )
                                }}
                              </AutoSizer>
                            </Grid>
                          </>
                        }
                      </Grid>
                    
                      <Zoom
                        in={true}
                        style={{
                          transitionDelay: '350ms',
                        }}
                        unmountOnExit
                      >
                        <Fab size="medium" aria-label={"Chars"} className={classes.charFab} color={"primary"} onClick={() => this.setState({showCharTab: true})}>
                          <PeopleIcon />
                        </Fab>
                      </Zoom>
                      
                      <Zoom
                          in={true}
                          style={{
                            transitionDelay: '350ms',
                          }}
                          unmountOnExit
                        >
                          <Fab size="medium" aria-label={"Trades"} className={classes.tradesFab} color={"primary"} onClick={() => this.setState({showCharTab: false})}>
                            <SwapHorizIcon />
                          </Fab>
                        </Zoom>
                    </Grid>
                  :
                    <Grid container spacing={2} item xs={12} style={{height:"100%", backgroundColor:"rgba(0,0,0,.6)"}}>
                      
                      <Slide direction="down" in={this.state.makeTrade} timeout={1000}  mountOnEnter unmountOnExit>
                        <Grid container item xs={6} style={{height:"100%"}}>
                          
                          <Grid item xs={12} style={{height:"50px"}}>
                            <Typography style={{color:"white",fontFamily:"Edo", fontSize:"35px", textAlign:"center"}}>{this.state.userInfo.userName}</Typography>
                          </Grid>
                          
                          <Grid container item xs={12} style={{height:"calc(100% - 50px)",borderTop:"solid 3px white", borderRight:"solid 3px white"}}>
                            <Grid container item xs={12} style={{height:"50px", borderBottom:"solid 3px white"}}>
                                <Grid container alignItems="baseline"item xs={6}>
                                  <Grid item xs={5}>
                                    <Typography align="center" style={{fontFamily:"Edo", fontSize:"25px", color:"white"}}>Points</Typography>
                                  </Grid>
                                  <Grid item xs={7}>
                                    <CounterInput
                                      btnStyle={{color:"white", fontSize:"25px"}}
                                      inputStyle={{ width:"100px", fontFamily:"Edo", fontSize:"25px", color:"white" }}
                                      count={this.state.tradeFrom.points}
                                      min={0}
                                      max={this.state.userInfo.points}
                                      onCountChange={count => {
                                        var from = this.state.tradeFrom;
                                        var to = this.state.tradeTo;
                                        from.points = count;
                                        
                                        var isValid = false;
                                        if(from.points != 0 || from.submitSlots != 0 || from.waifus.length != 0)
                                          if(to.points != 0 || to.submitSlots != 0 || to.waifus.length != 0)
                                            isValid = true

                                        this.setState({tradeFrom: from, validTrade: isValid})
                                      }}
                                    />
                                  </Grid>
                                </Grid>
                                <Grid container alignItems="baseline" item xs={6}>
                                  <Grid item xs={5}>
                                    <Typography align="center" style={{fontFamily:"Edo", fontSize:"25px", color:"white"}}>Submit Slots</Typography>
                                  </Grid>
                                  <Grid item xs={7}>
                                    <CounterInput
                                      btnStyle={{color:"white", fontSize:"25px"}}
                                      inputStyle={{ width:"100px", fontFamily:"Edo", fontSize:"25px", color:"white" }}
                                      count={this.state.tradeFrom.submitSlots}
                                      min={0}
                                      max={this.state.userInfo.submitSlots}
                                      onCountChange={count => {
                                        var from = this.state.tradeFrom;
                                        var to = this.state.tradeTo;
                                        var isValid = false;
                                        if(from.points != 0 || from.submitSlots != 0 || from.waifus.length != 0)
                                          if(to.points != 0 || to.submitSlots != 0 || to.waifus.length != 0)
                                            isValid = true

                                        from.submitSlots = count;
                                        this.setState({tradeFrom: from, validTrade: isValid})
                                      }}
                                    />
                                  </Grid>
                                </Grid>
                              </Grid>
                              
                            <Grid item xs={12} style={{height:"calc(100% - 50px)"}}>
                              <AutoSizer>
                                {({height, width}) =>
                                {
                                  var columnWidth = 220;
                                  var columnCount = Math.floor(width / columnWidth)
                                  if((width/columnCount) > columnCount)
                                    columnWidth = (width/columnCount)
                
                                  var data = _.chunk(_.cloneDeep(this.state.userInfo.waifus), columnCount)
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
                                      itemData={[ data, "From", this.state.tradeFrom.waifus, this.selectTradeWaifu, {...this.props} ]}
                                      outerElementType={CustomScrollbarsVirtualList}
                                      onScroll={({scrollTop}) => {
                                        this.currScroll = scrollTop;
                                      }}
                                    >
                                    {TradeWaifus}
                                    </VirtGrid>
                                  )
                                }}
                              </AutoSizer>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Slide>

                      <Slide direction="up" in={this.state.makeTrade} timeout={1000} mountOnEnter unmountOnExit>
                        <Grid container item xs={6} style={{height:"100%"}}>
                          <Grid item xs={12} style={{height:"50px"}}>
                            <Typography style={{color:"white",fontFamily:"Edo", fontSize:"35px", textAlign:"center"}}>{this.state.selectedUser.userName}</Typography>
                          </Grid>

                          <Grid container item xs={12} style={{height:"calc(100% - 50px)",borderTop:"solid 3px white", borderLeft:"solid 3px white"}}>
                            <Grid container item xs={12}style={{height:"50px", borderBottom:"solid 3px white"}}>
                              <Grid container alignItems="baseline"item xs={6}>
                                <Grid item xs={5}>
                                  <Typography align="center" style={{fontFamily:"Edo", fontSize:"25px", color:"white"}}>Points</Typography>
                                </Grid>
                                <Grid item xs={7}>
                                  <CounterInput
                                    btnStyle={{color:"white", fontSize:"25px"}}
                                    inputStyle={{ width:"100px", fontFamily:"Edo", fontSize:"25px", color:"white" }}
                                    count={this.state.tradeTo.points}
                                    min={0}
                                    max={this.state.selectedUser.points}
                                    onCountChange={count => {
                                      var from = this.state.tradeFrom;
                                      var to = this.state.tradeTo;
                                      var isValid = false;
                                      if(from.points != 0 || from.submitSlots != 0 || from.waifus.length != 0)
                                        if(to.points != 0 || to.submitSlots != 0 || to.waifus.length != 0)
                                          isValid = true

                                      to.points = count;
                                      this.setState({tradeTo: to, validTrade: isValid})
                                    }}
                                  />
                                </Grid>
                              </Grid>
                              <Grid container alignItems="baseline" item xs={6}>
                                <Grid item xs={5}>
                                  <Typography align="center" style={{fontFamily:"Edo", fontSize:"25px", color:"white"}}>Submit Slots</Typography>
                                </Grid>
                                <Grid item xs={7}>
                                  <CounterInput
                                    btnStyle={{color:"white", fontSize:"25px"}}
                                    inputStyle={{ width:"100px", fontFamily:"Edo", fontSize:"25px", color:"white" }}
                                    count={this.state.tradeTo.submitSlots}
                                    min={0}
                                    max={this.state.selectedUser.submitSlots}
                                    onCountChange={count => {
                                      var from = this.state.tradeFrom;
                                      var to = this.state.tradeTo;
                                      var isValid = false;
                                      if(from.points != 0 || from.submitSlots != 0 || from.waifus.length != 0)
                                        if(to.points != 0 || to.submitSlots != 0 || to.waifus.length != 0)
                                          isValid = true

                                      to.submitSlots = count;
                                      this.setState({tradeTo: to, validTrade: isValid})
                                    }}
                                  />
                                </Grid>
                              </Grid>
                            </Grid>
                            
                            <Grid item xs={12} style={{height:"calc(100% - 50px)"}}>
                              <AutoSizer>
                                  {({height, width}) =>
                                  {
                                    var columnWidth = 220;
                                    var columnCount = Math.floor(width / columnWidth)
                                    if((width/columnCount) > columnCount)
                                      columnWidth = (width/columnCount)
                  
                                    var data = _.chunk(_.cloneDeep(this.state.selectedUser.waifus), columnCount);
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
                                        itemData={[ data, "To", this.state.tradeTo.waifus,  this.selectTradeWaifu, {...this.props} ]}
                                        outerElementType={CustomScrollbarsVirtualList}
                                        onScroll={({scrollTop}) => {
                                          this.currScroll = scrollTop;
                                        }}
                                      >
                                      {TradeWaifus}
                                      </VirtGrid>
                                    )
                                  }}
                                </AutoSizer>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Slide>
                      
                      <Button variant="contained" color="primary" onClick={() => this.submitTrade()}
                        style={{fontFamily: "Edo", fontSize:"15px", height: "50px", color:"white", border: "solid 1px white",
                        position: "absolute", zIndex: 1, bottom: "8px", left: "50%", transform: "translate(-50%,-50%)"}}
                        disabled={!this.state.validTrade}>Confirm Trade</Button>
                      <Zoom
                        in={true}
                        style={{
                          transitionDelay: "250ms",
                        }}
                        unmountOnExit
                      >
                        <Fab
                          aria-label={"return"}
                          className={classes.returnFab}
                          color={"secondary"}
                          onClick={() => this.setState({makeTrade: false})}
                        >
                          <KeyboardBackspaceIcon />
                        </Fab>
                      </Zoom>
              
                    </Grid>
                  }
                  </Grid>
                </ClickAwayListener>

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
                    onClick={() => this.closeView()}
                  >
                    <CloseIcon />
                  </Fab>
                </Zoom>
              </Grid>    
            </Grow>
          :
            <></>
          }
        </>
      )
    }
}

export default (withStyles(styles)(Trade));
