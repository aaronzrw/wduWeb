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
import { buyWaifu } from '../redux/actions/dataActions'

// Redux stuff
import watch from 'redux-watch'
import { connect } from 'react-redux';
import store from '../redux/store';
import {
    SET_POLL_WAIFUS,
    LOADING_DATA,
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
    bottom: theme.spacing(2),
    left: theme.spacing(2),
  },
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
            style={{overflow: "inherit", height:"100%", border:"solid 1px white", backgroundColor:"transparent", position:"relative"}}
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
  return (
    <CharacterThumbNail card={card} style={style} columnIndex={columnIndex} selectCard={() => console.log("Do Nothing")}/>
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
export class Roulette extends Component {
    constructor(props) {
      super(props);
      this.state = {
        loading: false,
        userInfo: {...store.getState().user.credentials, waifus: store.getState().user.waifus },
        users: store.getState().user.otherUsers,
        selectedUser: null,
      };

      this.selectedUser = this.selectedUser.bind(this)
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

    closeView(){
      this.setState({selectedUser: null})
    }

    render() {
        var {classes} = this.props;
        return (
          <>
          <div style={{height: "100%", width:"100%"}}>
            {this.state.loading ? <></>
              :
              <Grid container style={{height: "100%", width:"100%"}}>
                  <AutoSizer>
                      {({height, width}) =>
                      {
                        var columnWidth = 250;
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
                  <Grid container justify="center" style={{height:"90%", padding: "8px", position:"absolute", top:"50%",left:"50%", transform:"translate(-50%,-50%)"}}>
                    <Grid container item xs={12} style={{height:"100%"}}>
                      <Grid container item xs={4} style={{height:"100%", backgroundColor:"white"}}>
                        <Grid container justify="center" alignItems="center" item xs={12} style={{height:"225px"}}>
                          <div style={{width:"200px", height:"200px"}}>
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
                              <Typography style={{fontFamily:"Edo", fontSize:"35px", textAlign:"center"}}>Points - {this.state.userInfo.points}</Typography>
                              <Typography style={{fontFamily:"Edo", fontSize:"35px", textAlign:"center"}}>Rank Coins - {this.state.userInfo.rankCoins}</Typography>
                              <Typography style={{fontFamily:"Edo", fontSize:"35px", textAlign:"center"}}>Stat Coins - {this.state.userInfo.statCoins}</Typography>
                              <Typography style={{fontFamily:"Edo", fontSize:"35px", textAlign:"center"}}>Submit Slots - {this.state.userInfo.submitSlots}</Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>

                      <Grid container item xs={8} style={{height:"100%", border:"solid 1px white"}}>
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
                                  itemData={[ data, {...this.props} ]}
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
                      </Grid>
                    </Grid>
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
                    aria-label={"return"}
                    className={classes.returnFab}
                    color={"secondary"}
                    onClick={() => this.closeView()}
                  >
                    <KeyboardBackspaceIcon />
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

export default (withStyles(styles)(Roulette));
