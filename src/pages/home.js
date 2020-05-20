import React, { Component, PureComponent, useCallback, useState } from 'react'
import moment from 'moment';
import PropTypes from 'prop-types';

import CounterInput from "react-counter-input";
import _ from 'lodash';

import AMCharDetails from '../components/AMCharDetails'
import ComicCharDetails from '../components/ComicCharDetails'
import CountDown from '../components/CountDown'

import TopVote from '../media/TopVote.png'
import { submitWeeklyVote, submitDailyVote } from '../redux/actions/dataActions'
import LinkIcon from '@material-ui/icons/Link';

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
import PeopleIcon from '@material-ui/icons/People';
import TextField from '@material-ui/core/TextField';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import HowToVoteIcon from '@material-ui/icons/HowToVote';
import CardActionArea from '@material-ui/core/CardActionArea';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

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

const styles = (theme) => ({
	...theme.spreadThis,
  media: {
    height: 250,
  },
  large: {
    width: theme.spacing(7),
    height: theme.spacing(7),
	},
	linkFab: {
    position: 'absolute',
    top: theme.spacing(2),
    right: theme.spacing(2),
	},
	voteFab:{
    position: 'absolute',
    bottom: theme.spacing(9),
    right: theme.spacing(2),
	},
  detailsFab:{
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
	},
	voteText:{
    position: 'absolute',
		bootom: theme.spacing(2)
	}
});

const SmallAvatar = withStyles((theme) => ({
	root: {
		width: 22,
		height: 22,
		border: `2px solid ${theme.palette.background.paper}`,
	},
}))(Avatar);

class Row extends PureComponent {
  render() {
    // Access the items array using the "data" prop:
    const item = this.props.data[this.props.index];
 
    return (
			<Grid container alignItems="center" justify="center" style={{...this.props.style}}>
				<Grid item xs={9} container alignItems="center" justify="center" style={{borderTop: "solid 1px black", borderBottom: "solid 1px black", height:"100%"}}>
					<Grid container alignItems="center" justify="center" item xs={2} style={{filter: "drop-shadow(-1px 6px 3px rgba(50, 50, 0, 0.5))", height:"100%"}}>
						<img src={item.img} style={{height:"75px", width:"75px", clipPath:"circle(50%)"}}/>
					</Grid>
					<Grid container alignItems="center" justify="flex-start" item xs={8} style={{height:"100%"}}>
        		<Typography align="center" style={{fontFamily:"Edo", fontSize:"35px"}}>{item.husbando}</Typography>
					</Grid>
					<Grid container alignItems="center" justify="center" item xs={2} style={{height:"100%"}}>
        		<Typography align="center" style={{fontFamily:"Edo", fontSize:"35px"}}>{item.vote}</Typography>
					</Grid>
				</Grid>
			</Grid>
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

class Home extends Component {
  constructor() {
		super();
		this.state = {
			card: null,
			topVote: null,
			showDetails: false,
			showVoteView: true,
			weeklyPollSelected: false,
			dailyPollSelected: false,
			loading: store.getState().data.loading,
			userInfo: store.getState().user.credentials,
			weeklyPoll: store.getState().data.poll.weekly,
			dailyPoll: store.getState().data.poll.daily,
			weeklyPollWaifus: store.getState().data.weeklyPollWaifus,
			dailyPollWaifus: store.getState().data.dailyPollWaifus,
			voteCount: 0,
		};
			
		this.setHasVoted = this.setHasVoted.bind(this)
		this.showWeeklyCardDetails = this.showWeeklyCardDetails.bind(this)
		this.showDailyCardDetails = this.showDailyCardDetails.bind(this)
		this.closeWeeklyCardDetails = this.closeWeeklyCardDetails.bind(this)
		this.closeDailyCardDetails = this.closeDailyCardDetails.bind(this)
		this.showVoteViewFunc = this.showVoteViewFunc.bind(this)
		this.showCharDetailsFunc = this.showCharDetailsFunc.bind(this)

		let dataReducerWatch = watch(store.getState, 'data')
		let userReducerWatch = watch(store.getState, 'user')

		store.subscribe(dataReducerWatch((newVal, oldVal, objectPath) => {
			newVal.weeklyPollWaifus = this.setHasVoted(newVal.weeklyPollWaifus)
			this.setState({ ...newVal, weeklyPoll: newVal.poll.weekly, dailyPoll: newVal.poll.daily, })
			if(this.state.card != null){
				if(this.state.card.husbando == "Poll")
					this.showWeeklyCardDetails(newVal.weeklyPollWaifus.filter(x => x.waifuId == this.state.card.waifuId)[0])
				else
					this.showDailyCardDetails(newVal.dailyPollWaifus.filter(x => x.waifuId == this.state.card.waifuId)[0])
			}
		}))

		store.subscribe(userReducerWatch((newVal, oldVal, objectPath) => {
			this.setState({ userInfo: newVal.credentials })
		}))
	}

	componentDidMount(){
		var pws = this.setHasVoted(this.state.weeklyPollWaifus)
		this.setState({weeklyPollWaifus: pws})
	}

	setHasVoted(pws){
		pws.forEach(x => {
			x.hasVoted = !_.isEmpty(x.votes.filter(y => y.husbandoId == this.state.userInfo.userId));
		})
		return pws;
	}

	showWeeklyCardDetails(card){
		var topVote = {vote: "None", img: "https://booking.lofoten.info/en//Content/img/missingimage.jpg"}
		var votes = _.orderBy(card.votes, ['vote'] ,['desc']);
		if(votes.length > 0){
			var maxVote = votes[0].vote;
			if(votes.filter(x => x.vote == maxVote).length > 1){
				//Theres A Tie
				topVote.vote = "TIE";
			}
			else{
				topVote = votes[0]
			}
		}
		
		this.setState({ card: card, topVote, showDetails: true, weeklyPollSelected: true })
	}
	showDailyCardDetails(card){
		var topVote = {vote: "None", img: "https://booking.lofoten.info/en//Content/img/missingimage.jpg"}
		if(this.state.dailyPoll.isActive){
			var votes = card.votes.filter(x => x.husbandoId == this.state.userInfo.userId);
			if(votes.length > 0){
				topVote = votes[0]
			}
		}
		else{
			var votes = _.orderBy(card.votes, ['vote'] ,['desc']);
			if(votes.length > 0){
				var maxVote = votes[0].vote;
				if(votes.filter(x => x.vote == maxVote).length > 1){
					//Theres A Tie
					topVote.vote = "TIE";
				}
				else{
					topVote = votes[0]
				}
			}
		}
		
		this.setState({ card: card, topVote, showDetails: true, dailyPollSelected: true })
	}

	closeWeeklyCardDetails(){
		this.setState({ showDetails: false, voteCount: 0, weeklyPollSelected: false })
	}
	
	closeDailyCardDetails(){
		this.setState({ showDetails: false, voteCount: 0, dailyPollSelected: false })
	}

	showVoteViewFunc(){
		this.setState({ showVoteView: true })
	}

	showCharDetailsFunc(){
		this.setState({ showVoteView: false })
	}

	/*updateVoteCount(userVote){
		this.setState({ voteCount })
	}*/

	render (){
		const {classes} = this.props;

		return (
			<div style={{height: "100%", width:"100%", position:"relative"}}>
				{
						this.state.loading ?
						<></>
					:
						<Grid container justify="center">
							<Grid container justify="center" alignItems="center" item xs={12} style={{height:"50%"}}>
								<Grid item xs={12} style={{height: "100px"}}>
									<CountDown poll={this.state.weeklyPoll} type={"WEEKLY"}/>
								</Grid>

								<Grid container justify="center" alignItems="center"  item xs={10} spacing={3} style={{ margin: "0px" }}>
										{this.state.weeklyPollWaifus.map((item, index) => {
											var rankClass = "";
											switch(item.rank){
													case 1: {rankClass = "trashRank"; break;}
													case 2: {rankClass = "bronzeRank"; break;}
													case 3: {rankClass = "silverRank"; break;}
													case 4: {rankClass = "goldRank"; break;}
											}

											var topVote = null;
											var votes = _.orderBy(item.votes, ['vote'] ,['desc']);
											if(votes.length > 0){
												var maxVote = votes[0].vote;
												if(votes.filter(x => x.vote == maxVote).length > 1)
													topVote = {husbando:"TIE", vote: maxVote, img: "https://booking.lofoten.info/en//Content/img/missingimage.jpg"}
												else
													topVote = votes[0]
											}

											var timeout = (index+1) * 500
											return(
												<Grow
													key={item.waifuId}
													in={true}
													style={{ transformOrigin: '0 0 0' }}
													timeout = {timeout}
												>
													<Grid key={item.waifuId} item xs={4} style={{ position:"relative" }}>                                        
														<Card className={[rankClass].join(' ')}  style={{backgroundColor:"transparent"}}
															/* onMouseEnter={ () => toggleShowVotes(item.waifuId, true) }
															onMouseLeave={ () => toggleShowVotes(item.waifuId, false) } */
															onClick={() => this.showWeeklyCardDetails(item)}>
															{
																topVote != null ?
																	<div style={{ position: "absolute", top: 0, right: 0, zIndex: "1" }}>
																		<Badge
																			overlap="circle"
																			anchorOrigin={{
																				vertical: 'bottom',
																				horizontal: 'right',
																			}}
																			badgeContent={<SmallAvatar style={{ fontFamily: "Edo"}}> {topVote.vote} </SmallAvatar>}
																		>
																			<Tooltip title={topVote.husbando} aria-label={topVote.husbando}>
																				<Avatar alt={topVote.husbando} src={topVote.img} className={classes.large} />
																			</Tooltip>
																		</Badge>
																	</div>
																:
																	<></>
															}

															<CardActionArea>
																<CardMedia
																	className={classes.media}
																	image={item.img}
																	title={item.name}
																/>
																<CardContent>
																	<Typography align="center" style={{ fontFamily: "Edo", fontSize: "30px" }} variant="h5" component="h2">
																		{item.name}
																	</Typography>
																		
																		{/*<Collapse in={ item.show }>
																		<Divider style={{ margin: "1em 0px"}} />
																	</Collapse> */}
																</CardContent>
															</CardActionArea>
														</Card>
													</Grid>
												</Grow>
											);
										})}
									</Grid>
								</Grid>
							<Grid container justify="center" alignItems="center" item xs={12} style={{height:"50%"}}>
								<Grid item xs={12} style={{height: "100px"}}>
									<CountDown poll={this.state.dailyPoll} type={"DAILY"} />
								</Grid>
								
								<Grid container justify="center" alignItems="center" item xs={10} spacing={3} style={{ margin: "0px" }}>
									{this.state.dailyPollWaifus.map((item, index) => {
										var rankClass = "";
										switch(item.rank){
												case 1: {rankClass = "trashRank"; break;}
												case 2: {rankClass = "bronzeRank"; break;}
												case 3: {rankClass = "silverRank"; break;}
												case 4: {rankClass = "goldRank"; break;}
										}
										
										var currUserVote = null
										var votes = _.orderBy(item.votes, ['vote'] ,['desc']);
										currUserVote = votes.filter(x => x.husbandoId == this.state.userInfo.userId);
										currUserVote = _.isEmpty(currUserVote.length) ? null : currUserVote[0];

										var timeout = (index+1) * 500
										return(
											<Grow
												key={item.waifuId}
												in={true}
												style={{ transformOrigin: '0 0 0' }}
												timeout = {timeout}
											>
												<Grid key={item.waifuId} item xs={3} style={{ position:"relative" }}>
													<Card className={[rankClass].join(' ')}  style={{backgroundColor:"transparent"}}
														/* onMouseEnter={ () => toggleShowVotes(item.waifuId, true) }
														onMouseLeave={ () => toggleShowVotes(item.waifuId, false) } */
														onClick={() => this.showDailyCardDetails(item)}>
														{
															currUserVote != null ?
																<div style={{ position: "absolute", top: 0, right: 0, zIndex: "1" }}>
																	<Badge
																		overlap="circle"
																		anchorOrigin={{
																			vertical: 'bottom',
																			horizontal: 'right',
																		}}
																		badgeContent={<SmallAvatar style={{ fontFamily: "Edo"}}> {currUserVote.vote} </SmallAvatar>}
																	>
																		<Tooltip title={currUserVote.husbando} aria-label={currUserVote.husbando}>
																			<Avatar alt={currUserVote.husbando} src={currUserVote.img} className={classes.large} />
																		</Tooltip>
																	</Badge>
																</div>
															:
																<></>
														}

														<CardActionArea>
															<CardMedia
																className={classes.media}
																image={item.img}
																title={item.name}
															/>
															<CardContent>
																<Typography align="center" style={{ fontFamily: "Edo", fontSize: "30px" }} variant="h5" component="h2">
																	{item.name}
																</Typography>
																	
																	{/*<Collapse in={ item.show }>
																	<Divider style={{ margin: "1em 0px"}} />
																</Collapse> */}
															</CardContent>
														</CardActionArea>
													</Card>
												</Grid>
											</Grow>
										);
									})}
								</Grid>
							</Grid>
						</Grid>
				}
	
				{
					this.state.weeklyPollSelected ?
					<>
						{
							this.state.showDetails ?
								<Grow
									in={true}
									style={{ transformOrigin: '0 0 0' }}
									timeout={500}
								>
									<Grid container alignItems="center" justify="center" style={{height: "100%", position: "absolute", top:"0", left: "0", zIndex:"10", backgroundColor: "#00000091" }} >
										<ClickAwayListener onClickAway={() => this.closeWeeklyCardDetails()}>
											<Grid item xs={10} style={{ height: "75%" }}>
												<Grid container item xs={12} style={{ height:"100%" }}>
													<Grid item xs={4} style={{ height:"100%" }}>
														<Paper style={{position:"relative", backgroundImage: "url("+this.state.card.img+")", backgroundPosition:"top", backgroundSize:"cover",
															height: "100%",width:"100%",borderRadius: "20px 0px 0px 20px", display:"flex", alignItems:"flex-end", justifyContent:"center"}}>
																<Fab size="medium" aria-label={"Votes"} className={classes.linkFab} color={"primary"} onClick={() => window.open(this.state.card.link, '_blank')}>
																	<LinkIcon />
																</Fab>
														</Paper>
													</Grid>
													
													<Grid item xs={8}>
														<Paper style={{borderRadius: "0px 20px 20px 0px"}} className="cardDetails">
															<>
																{ this.state.showVoteView ?
																		<Grid container item xs={12} style={{height: "100%"}}>
																			<Grid container alignItems="center" justify="center" item xs={12} style={{height: "200px"}}>
																				<div className="topVote">
																					<div style={{height:"100px", width:"100px", position: "absolute", top: "50%",
																						left: "50%", transform: "translate(-50%,-50%)", filter: "drop-shadow(-1px 6px 3px rgba(50, 50, 0, 0.5))"}}>
																						<img src={this.state.topVote.img} className="topVoteImg"/>
			
																						<Typography style={{position: "absolute", bottom: "-15%", left: "50%",
																							transform: "translate(-50%,-50%)", fontFamily:"Edo", fontSize:"25px", color:"white"}}>
																							{this.state.topVote.vote}
																						</Typography>
																					</div>
																					<img src={TopVote} />
																				</div>
																			</Grid>
			
																			<Grid item xs={12} style={{height: `calc(100% - ${!this.state.card.hasVoted || (this.state.userInfo.points == 0) ? "275px" : "200px"} )`}}>
																				<AutoSizer>
																					{({height, width}) =>
																					{
																						var data = _.orderBy(_.cloneDeep(this.state.card.votes), ["vote"], ['desc']);

																						return (
																							<List
																								outerRef={outerRef}
																								outerElementType={CustomScrollbarsVirtualList}
																								height={height}
																								width={width}
																								itemData={data}
																								itemCount={data.length}
																								itemSize={100}
																							>
																								{Row}
																							</List>
																						)
																					}}
																				</AutoSizer>
																			</Grid>
																			
																			{
																				this.state.weeklyPoll.isActive && !this.state.card.hasVoted && this.state.userInfo.points > 0 ?
																					<Grid container item xs={12} alignItems="center" justify="center" style={{height: "75px"}}>
																						<div style={{ borderTop: "1px solid #0000003b", borderBottom: "1px solid #0000003b", display: "flex",padding: "5px"}}>
																							<CounterInput
																								className={classes.voteText}
																								inputStyle={{ width:"100px", fontFamily:"Edo" }}
																								count={this.state.voteCount}
																								min={0}
																								max={this.state.userInfo.points}
																								onCountChange={count => this.setState({voteCount: count})}
																							/>
																							<Button disabled={this.state.voteCount == 0}
																								style={{ fontFamily:"Edo", marginLeft: "50px" }}
																								onClick={() => submitWeeklyVote(this.state.voteCount, this.state.card)}
																							>Submit Vote</Button>
																						</div>
																					</Grid>
																				: <></>
																			}
																		</Grid>
																	:
																		<>
																			{this.state.card.type == "Anime-Manga" ? <AMCharDetails card={this.state.card}/> : <ComicCharDetails card={this.state.card} />}
																		</>
																}
																
																<Zoom
																	in={true}
																	style={{
																		transitionDelay: '350ms',
																	}}
																	unmountOnExit
																>
																	<Fab size="medium" aria-label={"Votes"} className={classes.voteFab} color={"primary"} onClick={this.showVoteViewFunc}>
																		<HowToVoteIcon />
																	</Fab>
																</Zoom>
																
																<Zoom
																	in={true}
																	style={{
																		transitionDelay: '350ms',
																	}}
																	unmountOnExit
																>
																	<Fab size="medium" aria-label={"Details"} className={classes.detailsFab} color={"primary"} onClick={this.showCharDetailsFunc}>
																		<NotesIcon />
																	</Fab>
																</Zoom>
															</>
														</Paper>
													</Grid>
												</Grid>
											</Grid>
										</ClickAwayListener>
									</Grid>
								</Grow>
							: <></>
						}
					</>
					:<></>
				}
	
				{
					this.state.dailyPollSelected ?
					<>
						{
							this.state.showDetails ?
								<Grow
									in={true}
									style={{ transformOrigin: '0 0 0' }}
									timeout={500}
								>
									<Grid container alignItems="center" justify="center" style={{height: "100%", position: "absolute", top:"0", left: "0", zIndex:"10", backgroundColor: "#00000091" }} >
										<ClickAwayListener onClickAway={() => this.closeDailyCardDetails()}>
											<Grid item xs={10} style={{ height: "75%" }}>
												<Grid container item xs={12} style={{ height:"100%" }}>
													<Grid item xs={4} style={{ height:"100%" }}>
														<Paper style={{position:"relative", backgroundImage: "url("+this.state.card.img+")", backgroundPosition:"top", backgroundSize:"cover",
															height: "100%",width:"100%",borderRadius: "20px 0px 0px 20px", display:"flex", alignItems:"flex-end", justifyContent:"center"}}>
																<Fab size="medium" aria-label={"Votes"} className={classes.linkFab} color={"primary"} onClick={() => window.open(this.state.card.link, '_blank')}>
																	<LinkIcon />
																</Fab>
														</Paper>
													</Grid>
													
													<Grid item xs={8}>
														<Paper style={{borderRadius: "0px 20px 20px 0px"}} className="cardDetails">
															<>
																{ this.state.showVoteView ?
																		<Grid container item xs={12} style={{height: "100%"}}>
																			<Grid container alignItems="center" justify="center" item xs={12} style={{height: `${this.state.dailyPoll.isActive ? "calc(100% - 75px)" : "200px"}`}}>
																				<div className="topVote">
																					<div style={{height:"100px", width:"100px", position: "absolute", top: "50%",
																						left: "50%", transform: "translate(-50%,-50%)", filter: "drop-shadow(-1px 6px 3px rgba(50, 50, 0, 0.5))"}}>
																						<img src={this.state.topVote.img} className="topVoteImg"/>
			
																						<Typography style={{position: "absolute", bottom: "-15%", left: "50%",
																							transform: "translate(-50%,-50%)", fontFamily:"Edo", fontSize:"25px", color:"white"}}>
																							{this.state.topVote.vote}
																						</Typography>
																					</div>
																					<img src={TopVote} />
																				</div>
																			</Grid>
																			{
																				this.state.dailyPoll.isActive ?<></>
																				:
																				<>
																					<Grid item xs={12} style={{height: `calc(100% - 275px)`}}>
																						<AutoSizer>
																							{({height, width}) =>
																							{
																								var data = _.orderBy(_.cloneDeep(this.state.card.votes), ["vote"], ['desc']);
		
																								return (
																									<List
																										outerRef={outerRef}
																										outerElementType={CustomScrollbarsVirtualList}
																										height={height}
																										width={width}
																										itemData={data}
																										itemCount={data.length}
																										itemSize={100}
																									>
																										{Row}
																									</List>
																								)
																							}}
																						</AutoSizer>
																					</Grid>
																				</>
																			}
																			
																			{
																				this.state.dailyPoll.isActive && this.state.userInfo.points > 0 ?
																					<Grid container item xs={12} alignItems="center" justify="center" style={{height: "75px"}}>
																						<div style={{ borderTop: "1px solid #0000003b", borderBottom: "1px solid #0000003b", display: "flex",padding: "5px"}}>
																							<CounterInput
																								className={classes.voteText}
																								inputStyle={{ width:"100px", fontFamily:"Edo" }}
																								count={this.state.voteCount}
																								min={0}
																								max={this.state.userInfo.points}
																								onCountChange={count => this.setState({voteCount: count})}
																							/>
																							<Button disabled={this.state.voteCount == 0}
																								style={{ fontFamily:"Edo", marginLeft: "50px" }}
																								onClick={() => submitDailyVote(this.state.voteCount, this.state.card)}
																							>Submit Vote</Button>
																						</div>
																					</Grid>
																				: <></>
																			}
																		</Grid>
																	:
																		<>
																			{this.state.card.type == "Anime-Manga" ? <AMCharDetails card={this.state.card}/> : <ComicCharDetails card={this.state.card} />}
																		</>
																}
																
																<Zoom
																	in={true}
																	style={{
																		transitionDelay: '350ms',
																	}}
																	unmountOnExit
																>
																	<Fab size="medium" aria-label={"Votes"} className={classes.voteFab} color={"primary"} onClick={this.showVoteViewFunc}>
																		<HowToVoteIcon />
																	</Fab>
																</Zoom>
																
																<Zoom
																	in={true}
																	style={{
																		transitionDelay: '350ms',
																	}}
																	unmountOnExit
																>
																	<Fab size="medium" aria-label={"Details"} className={classes.detailsFab} color={"primary"} onClick={this.showCharDetailsFunc}>
																		<NotesIcon />
																	</Fab>
																</Zoom>
															</>
														</Paper>
													</Grid>
												</Grid>
											</Grid>
										</ClickAwayListener>
									</Grid>
								</Grow>
							: <></>
						}
					</>
					:<></>
				}
			</div>
		)
	}
}

export default (withStyles(styles)(Home));