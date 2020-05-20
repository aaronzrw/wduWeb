import React, { Component, PureComponent, useCallback } from "react";
import axios from 'axios'
import moment from 'moment';
import PropTypes from 'prop-types';

import CounterInput from "react-counter-input";
import _ from 'lodash';

import UserProfileImg from '../components/UserProfileImg'
import CharacterThumbNail from '../components/CharacterThumbNail'

import {logoutUser} from '../redux/actions/userActions'
import {openPoll, closePoll, updateTrade} from '../redux/actions/dataActions'

// MUI Stuff
import { makeStyles, useTheme } from '@material-ui/core/styles';
import withStyles from '@material-ui/core/styles/withStyles';

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
import Badge from '@material-ui/core/Badge';
import Fade from '@material-ui/core/Fade';
import Fab from '@material-ui/core/Fab';
import Zoom from '@material-ui/core/Zoom';
import Grow from '@material-ui/core/Grow';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import Divider from '@material-ui/core/Divider';
import NotesIcon from '@material-ui/icons/Notes';
import Collapse from '@material-ui/core/Collapse';
import TextField from '@material-ui/core/TextField';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import HowToVoteIcon from '@material-ui/icons/HowToVote';
import CardActionArea from '@material-ui/core/CardActionArea';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

//Icons
import SwapHorizIcon from '@material-ui/icons/SwapHoriz';
import PeopleIcon from "@material-ui/icons/People";

import { FixedSizeGrid as VirtGrid, FixedSizeList as List } from 'react-window';
import AutoSizer from "react-virtualized-auto-sizer";
import { Scrollbars } from 'react-custom-scrollbars';

// Redux stuff
import watch from 'redux-watch'
import store from '../redux/store';
import { connect, useSelector } from 'react-redux';
import {
    SET_POLL_WAIFUS,
    LOADING_UI,
    STOP_LOADING_UI
	} from '../redux/types';
	
/*global FB*/

const styles = (theme) => ({
	...theme.spreadThis,
  media: {
    height: 250,
  },
  large: {
    width: theme.spacing(7),
    height: theme.spacing(7),
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
});

const SmallAvatar = withStyles((theme) => ({
	root: {
		width: 22,
		height: 22,
		border: `2px solid ${theme.palette.background.paper}`,
	},
}))(Avatar);


const UserWaifus = ({ data , columnIndex, rowIndex, style }) => {
  if(data[0][rowIndex] == undefined || data[0][rowIndex][columnIndex] == undefined)
    return <></>

	const card = data[0][rowIndex][columnIndex];
	const selectedCard = data[1];

  return <CharacterThumbNail card={card} style={style} columnIndex={columnIndex} selectCard={selectedCard}/>
}

class Trades extends PureComponent {
  render() {
    // Access the items array using the "data" prop:
    const item = this.props.data[0][this.props.index];
		const isToUser = item.to.husbandoId == store.getState().user.credentials.userId;
    const users = [this.props.data[1]].concat(this.props.data[2]);

    const fromUser = users.filter(x => x.userId == item.from.husbandoId)[0];
    const toUser = users.filter(x => x.userId == item.to.husbandoId)[0];
 
    const fromWaifus = item.from.waifus ?? [];
    const toWaifus = item.to.waifus ?? [];

		const bgRowColor = this.props.index % 2 != 0 ? "#ffffff3b" : "black";

		var canAccept = false;
		if(item.from.points <= fromUser.points && item.from.submitSlots <= fromUser.submitSlots &&
			item.to.points <= toUser.points && item.to.submitSlots <= toUser.submitSlots){
				var tt = _.difference(fromWaifus.map(x => x.link), fromUser.waifus.map(x => x.link)).length;
				var te = _.difference(toWaifus.map(x => x.link), toUser.waifus.map(x => x.link)).length;
				canAccept = tt == 0 && te == 0 && !store.getState().data.poll.isActive;
		}

    return (
      <div style={this.props.style}>
        <Grid container spacing={1} style={{height:"100%", position:"relative", backgroundColor: bgRowColor}}>
          {/* From */}
          <Grid container alignItems="center" justify="center" item xs={6}>
            <Grid  container alignItems="center" justify="center"  item xs={4}>
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
              <Grid item xs={12} style={{height:"calc(100% - 100px)"}}>
                <AutoSizer>
                  {({height, width}) =>
                  {
                    var columnWidth = 150;
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
              <Grid item xs={12} style={{height:"calc(100% - 100px)"}}>
                <AutoSizer>
                  {({height, width}) =>
                  {
                    var columnWidth = 150;
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
            </Grid>
            <Grid container alignItems="center" justify="center" item xs={4}>
              <Grid container alignItems="center" justify="center" item xs={12}>
                <img src={toUser.img} style={{height:"100px", width:"100px", clipPath:"circle(50%)"}} />
              </Grid>
              <Grid item xs={12}>
                <Typography style={{color:"white", fontFamily:"Edo", fontSize:"25px", textAlign:"center"}}>{toUser.userName}</Typography>
              </Grid>
            </Grid>
          </Grid>
          
          <div style={{position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", height:"75%", width:"3px", backgroundColor:"white"}} />
          <div style={{position:"absolute", zIndex:1, bottom:"-4px", left:"50%", transform:"translate(-50%,-50%)", height:"4px", width:"75%", backgroundColor:"white"}} />
					<div style={{display:"flex", alignItems:"center", justifyContent:"center", position:"absolute", zIndex:1, bottom:"-40px", left:"50%", transform:"translate(-50%,-50%)", width:"75%"}} >
						<Button variant="contained" color="primary" disabled={!isToUser || !canAccept}
							onClick={() => updateTrade(item, "Accepted")} style={{border:"solid 1px white", color:"white", fontFamily: "Edo", fontSize:"15px", margin:"0px 10px", height:"40px"}}>Accept</Button>
						<Button variant="contained" color="primary"
							onClick={() => updateTrade(item, isToUser ? "Rejected" : "Cancelled")}
							style={{border:"solid 1px white", color:"white", fontFamily: "Edo", fontSize:"15px", margin:"0px 10px", height:"40px"}}>
								{isToUser ? "Reject" : "Cancel"}
						</Button>
					</div>
        </Grid>
      </div>
    );
  }
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

class Profile extends Component {
  constructor() {
    super();
    this.state = {
			loading: store.getState().data.loading,
			pollIsActive: store.getState().data.poll.isActive,
			userInfo: {...store.getState().user.credentials, waifus: store.getState().user.waifus },
			users: store.getState().user.otherUsers,
			trades: store.getState().data.trades.filter(x => x.from.husbandoId == store.getState().user.credentials.userId ||
				x.to.husbandoId == store.getState().user.credentials.userId),
			showCharTab: true,
		};

		this.selectedCard = this.selectedCard.bind(this);

		let dataReducerWatch = watch(store.getState, 'data')
		let userReducerWatch = watch(store.getState, 'user')
		store.subscribe(dataReducerWatch((newVal, oldVal, objectPath) => {
			this.setState({ ...newVal })
		}))
		store.subscribe(userReducerWatch((newVal, oldVal, objectPath) => {
			this.setState({userInfo: {...newVal.credentials, waifus: newVal.waifus } })
		}))

	}

	componentDidMount(){
	}

	selectedCard(card){
		console.log(card)
	}
	

	render (){
		const {classes} = this.props;

		return (
			<Grid container justify="center" style={{height:"100%", padding: "8px"}}>
				<Grid container item xs={12} style={{height:"100%"}}>
					<Grid container item xs={4} style={{height:"100%", backgroundColor:"white"}}>
						<Grid container justify="center" alignItems="center" item xs={12} style={{height:"225px"}}>
							<div style={{width:"200px", height:"200px"}}>
								<UserProfileImg user={this.state.userInfo} />
							</div>
							{/* <img src={this.state.userInfo.img} style={{width:"200px", height:"200px", clipPath:"circle(50%)"}} /> */}
						</Grid>
						
						<Grid container justify="center" item xs={12} style={{height:"calc(100% - 225px)"}}>
							<Grid container item xs={12} style={{height:"calc(100% - 50px)"}}>
								<Grid item xs={12} style={{height:"100px"}}>
									<Typography style={{fontFamily:"Edo", fontSize:"35px", textAlign:"center"}}>{this.state.userInfo.userName}</Typography>
									<Typography style={{/* fontFamily:"Edo", */ fontSize:"25px", textAlign:"center"}}>{this.state.userInfo.email}</Typography>
								</Grid>

								<Divider style={{width:"50%", margin:"10px auto auto"}} />

								<Grid item xs={12} style={{height:"calc(100% - 100px)"}}>
									<Typography style={{fontFamily:"Edo", fontSize:"35px", textAlign:"center"}}>Points - {this.state.userInfo.points}</Typography>
									<Typography style={{fontFamily:"Edo", fontSize:"35px", textAlign:"center"}}>Rank Coins - {this.state.userInfo.rankCoins}</Typography>
									<Typography style={{fontFamily:"Edo", fontSize:"35px", textAlign:"center"}}>Stat Coins - {this.state.userInfo.statCoins}</Typography>
									<Typography style={{fontFamily:"Edo", fontSize:"35px", textAlign:"center"}}>Submit Slots - {this.state.userInfo.submitSlots}</Typography>
								</Grid>
							</Grid>

							<Grid container alignItems="center" justify="center" item xs={12} style={{height:"50px"}}>
								<Button variant="contained" color="primary" onClick={logoutUser} style={{fontFamily: "Edo", fontSize:"15px", height:""}}>LogOut</Button>
								{this.state.userInfo.isAdmin ?<Button variant="contained" color="primary" onClick={closePoll} style={{fontFamily: "Edo", fontSize:"15px", height:""}}>closePoll</Button>:<></>}
								{this.state.userInfo.isAdmin ?<Button variant="contained" color="primary" onClick={openPoll} style={{fontFamily: "Edo", fontSize:"15px", height:""}}>openPoll</Button>:<></>}								
							</Grid>
						</Grid>
					</Grid>

					<Grid container item xs={8} style={{height:"100%", border:"solid 1px white"}}>
					{this.state.showCharTab ?
						<>
							<Grid item xs={12} style={{height:"75px", borderBottom:"solid 1px white"}}>
								<Typography align="center" style={{fontFamily:"Edo", fontSize:"45px", color:"white"}}>Characters</Typography>
							</Grid>
							<Grid item xs={12} style={{height:"calc(100% - 75px)"}}>
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
												itemData={[ data, this.selectedCard, {...this.props} ]}
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
										var data = _.cloneDeep(this.state.trades);

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
					
					<Zoom in={true} style={{transitionDelay: '350ms'}} unmountOnExit >
						<Fab size="medium" aria-label={"Chars"} className={classes.charFab} color={"primary"} onClick={() => this.setState({showCharTab: true})}>
							<PeopleIcon />
						</Fab>
					</Zoom>
				
					<Zoom in={true} style={{transitionDelay: '350ms'}} unmountOnExit >
						<Fab size="medium" aria-label={"Trades"} className={classes.tradesFab} color={"primary"} onClick={() => this.setState({showCharTab: false})}>
							<SwapHorizIcon />
						</Fab>
					</Zoom>
				</Grid>
			</Grid>
		)
	}
}

export default (withStyles(styles)(Profile));