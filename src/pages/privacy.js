import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import React, { Component, PureComponent, useCallback } from 'react';

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

class Privacy extends Component {
  constructor() {
		super();
		this.state = {};
	}

	componentDidMount(){
	}

	render (){
		const {classes} = this.props;

		return (
			<div style={{height: "100%", width:"100%", position:"relative"}}>
				<Grid container alignItems="center" justify="center" style={{height: "100%"}}>
					<Grid container alignItems="center" justify="center" item xs={6} style={{height:"75%"}}>
						<Paper style={{height: "100%", width: "100%", backgroundColor: "rgba(0,0,0,.75)"}}>
							<Grid container alignItems="center" justify="center" style={{height: "100%"}}>
								<Grid container justify="center" item xs={11} style={{height: "150px"}}>
									<Typography style={{textAlign: "center", color: "white", fontSize: "65px"}}>Waifu Draft Privacy Policy:</Typography>
									<Typography style={{textAlign: "center", color: "white", fontSize: "30px"}}>Waifu Draft (Site & App) only keeps records of the following:</Typography>
								</Grid>
								
								<Grid container alignItems="center" justify="center" item xs={9} style={{height: "calc(100% - 250px)"}}>
									<Grid item xs={12} style={{height: "calc(100% - 150px)"}}>
										<Typography style={{textAlign: "center", color: "white", fontSize: "25px"}}>-Email</Typography>
										<Typography style={{textAlign: "center", color: "white", fontSize: "25px"}}>-User's Phone Token (created when making push notifications)</Typography>
										<Typography style={{textAlign: "center", color: "white", fontSize: "25px"}}>-Camera/Photos</Typography>
									</Grid>
								</Grid>
							</Grid>
						</Paper>
					</Grid>
				</Grid>
			</div>
		)
	}
}

export default (withStyles(styles)(Privacy));