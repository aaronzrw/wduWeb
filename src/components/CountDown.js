import React, { Component, forwardRef } from 'react'
import moment from 'moment';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
require('moment-countdown');

export default class Countdown extends Component {
  constructor(props) {
    super(props);
		this.state = {
			isActive: this.props.poll.isActive,
			activeTill: this.props.poll.activeTill,
			timeFormat:"MM DD YYYY, h:mm a",
			days: undefined,
			hours: undefined,
			minutes: undefined,
			seconds: undefined,
			type: this.props.type
		};
	}

	componentDidMount() {
		this.interval = setInterval(() => {
			const { activeTill, timeFormat } = this.state;
			const now = moment();
			const then = moment(activeTill, timeFormat);
			const date = moment(then).countdown()
			const days = date.days;
			const hours = date.hours;
			const minutes = date.minutes;
			const seconds = date.seconds;

			this.setState({ days, hours, minutes, seconds });
		}, 1000);
	}

	componentWillReceiveProps(props){
		this.setState({isActive: props.poll.isActive, activeTill: props.poll.activeTill , type: props.type})
		
		clearInterval(this.interval);
		this.interval = setInterval(() => {
			const { activeTill, timeFormat } = this.state;
			const now = moment();
			const then = moment(activeTill, timeFormat);
			const date = moment(then).countdown()
			const days = date.days.toString();
			const hours = date.hours.toString();
			const minutes = date.minutes.toString();
			const seconds = date.seconds.toString();

			this.setState({ days, hours, minutes, seconds });
		}, 1000);
	}

	componentWillUnmount() {
		if (this.interval)
			clearInterval(this.interval);
	}

	render() {
		const { days, hours, minutes, seconds } = this.state;
		
		if (!seconds) {
			return null;
		}

		return (
			<>
				<Grid container alignItems="center" justify="center" style={{height:"100%"}}>
					<Grid container alignItems="center" justify="center" item xs={6} style={{height:"100%"}}>
						<div className="countdown-wrapper" style={{ color: this.state.isActive ? "white" : "red" }}>
							<div className="countdown-item">
								{days}
								<span>days</span>
							</div>
							<div className="countdown-item">
								{hours}
								<span>hours</span>
							</div>
							<div className="countdown-item">
								{minutes}
								<span>minutes</span>
							</div>
							<div className="countdown-item">
								{seconds}
								<span>seconds</span>
							</div>

							<div className="countdown-BG"/>
							<div style={{height:"100%",position:"absolute", top:"50%", right:"calc(100% - 50px)", transform:"translate(-50%,-50%)"}}>
								<Typography style={{textAlign:"center", color:"white", fontFamily:"Edo", fontSize:"50px"}}>{this.state.type}</Typography>
							</div>

							{
								!this.state.isActive ?
									<div style={{height:"100%",position:"absolute", top:"50%", left:"calc(100% + 80px)", transform:"translate(-50%,-50%)"}}>
										<Typography style={{textAlign:"center", color:"red", fontFamily:"Edo", fontSize:"50px"}}>CLOSED</Typography>
									</div>
								:<></>
							}
						</div>

					</Grid>
				</Grid>
			</>
		);
	}
}