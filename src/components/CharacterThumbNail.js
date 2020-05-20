import React, { useState } from 'react'
import PropTypes from 'prop-types';
import _ from 'lodash';
import { makeStyles } from '@material-ui/core/styles';

//Components
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Fab from '@material-ui/core/Fab';
import Divider from '@material-ui/core/Divider';

import AMCharDetails from './AMCharDetails'
import ComicCharDetails from './ComicCharDetails'


// MUI Stuff
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import Tooltip from '@material-ui/core/Tooltip';
import Grow from '@material-ui/core/Grow';
import Zoom from '@material-ui/core/Zoom';

// Redux stuff
import { useSelector } from 'react-redux';

const useStyles = makeStyles((theme) => ({
  ...theme.spreadThis,
  button: {
    minWidth: "300px",
    width: "80%",
    minHeight: "50px",
    height: "10%",
    marginBottom: "10px",
    backgroundColor: "rgba(255, 255, 255, 0.43)",
    fontFamily: "Edo",
    fontSize: "35px"
  },
  media: {
    height: 250,
  },
  large: {
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
  viewSelectContiner:{
    minHeight: "200px",
    maxHeight: "25%",
    height: "100%"
  },
  gridItem: {
    height: "50%"
  },
  card:{
    height: "90%",
    width: "90%",
    filter: "brightness(0.75)",
    transition: "transform .1s",
    overflow: "inherit"
  },
  cardRaised:{
    transform: "scale(1.05)",
    filter: "brightness(1)",
  },
  tooltip: {
    fontSize: "15px",
    maxWidth: 'none',
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
  returnFab: {
    position: 'absolute',
    bottom: '0',
    left: '0',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

const CharacterThumbNail = ({ card, style, columnIndex, selectCard }) => {
  if(card.link == null){
    card.link = `https://www.anime-planet.com/characters/${card.id}`
  }

  const exClasses = useStyles();
  const [raised, setRaised] = useState(false)

  const rankClass = useSelector( state => {
    if(state.data.waifuList.length > 0 && state.data.waifuList.map(x => x.link).includes(card.link)){
      var tempRankClass = "";
      switch(state.data.waifuList.filter(x => x.link == card.link)[0].rank){
        case 1: {tempRankClass = "trashRank"; break;}
        case 2: {tempRankClass = "bronzeRank"; break;}
        case 3: {tempRankClass = "silverRank"; break;}
        case 4: {tempRankClass = "goldRank"; break;}
      }

      return tempRankClass;
    };
  });

  const cardTitle = card == null ? '' : card.name.length >= 18 ? card.name.slice(0,18) + "..." : card.name
  const img = card == null ? '' : card.img != '' ? card.img : 'https://images-na.ssl-images-amazon.com/images/I/51XYjrkAYuL._AC_SY450_.jpg'
  const timeout = (columnIndex + 1) * 500;
  

  const isSubmitted = useSelector( state => {
    return state.data.waifuList.length > 0 && state.data.waifuList.map(x => x.link).includes(card.link);
  });

  var isSearchView = false;
  if(window.location.pathname == "/search")
    isSearchView = true;

  const raiseCard = (isRaised) => {
    setRaised(isRaised)
  }
  
  return(
    <Grow
      in={true}
      style={{ transformOrigin: '0 0 0' }}
      timeout = {timeout}
    >
      <Grid container alignItems="center" justify="center"  style={style}>
        <Card raised={raised} style={{overflow: "inherit"}} className={`${exClasses.card} ${raised ? exClasses.cardRaised : ""} gradient-border`}
          onMouseEnter={() => raiseCard(true)} onMouseLeave={() => raiseCard(false)}>
          <CardActionArea onClick={() => selectCard(card)} style={{position:"relative", backgroundImage: "url("+img+")",
            backgroundPosition:"top", backgroundSize:"cover", width:"100%", height:"100%"}}>
            <div className="statsContainer">
              <Typography className={[rankClass].join(' ')}>Attack: {card.attack}</Typography>
              <Typography className={[rankClass].join(' ')}>Defense: {card.defense}</Typography>
            </div>
            <Grid item xs={12} style={{ height: "80%" }}>
              {isSearchView == true ?
                <>
                  {isSubmitted ? <Grid container alignItems="center" justify="center" style={{height:"100%", backgroundColor:"#00000096" }}>
                    <Typography style={{color:"red", fontFamily:"Edo", fontSize:"3em", transform:"rotate(-55deg)"}}>SUBMITTED</Typography>
                  </Grid> : <></>}
                </>
                :
                <></>
              }
            </Grid>

            <CardContent className={[rankClass].join(' ')}  style={{ height: "20%", position:"relative", backgroundColor: "rgba(0,0,0,.5)", padding:"0px" }}>
              {cardTitle.includes("...") ?
                  <Tooltip TransitionComponent={Zoom} title={card.name} placement="top" classes={{ tooltip: exClasses.tooltip }}>
                    <Typography align="center" style={{ fontFamily: "Edo", fontSize: "calc(12px + 1em)", color: "white", maxHeigt: "100%", width: "100%", margin: "auto",
                      position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)"}} variant="h5" component="h2">
                        {cardTitle}
                    </Typography>
                  </Tooltip>
                :                      
                  <Typography align="center" style={{ fontFamily: "Edo", fontSize: "calc(12px + 1em)", color: "white", maxHeigt: "100%", width: "100%", margin: "auto",
                    position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)"}} variant="h5" component="h2">
                      {cardTitle}
                  </Typography>
              }
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>
    </Grow>
  );
}

export default CharacterThumbNail;