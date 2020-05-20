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
import LinkIcon from '@material-ui/icons/Link';

import AMCharDetails from './AMCharDetails'
import ComicCharDetails from './ComicCharDetails'
import CharacterThumbNail from './CharacterThumbNail'

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
import { submitWaifu } from '../redux/actions/dataActions'

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
    height: "300px",
    width: "200px",
    filter: "brightness(0.75)",
    transition: "transform .1s",
    overflow: "inherit"
  },
  cardRaised:{
    transform: "scale(1.1)",
    filter: "brightness(1)",
  },
  tooltip: {
    fontSize: "15px",
    maxWidth: 'none',
  },
  fab: {
    position: 'absolute',
    top: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

const SearchCharacterCard = ({ props, card, style, columnIndex }) => {
  const exClasses = useStyles();
  const [raised, setRaised] = useState(false)
  const [isSelected, setIsSelected] = useState(false)
  const [grow, setGrow] = useState(false)

  const cardTitle = card == null ? '' : card.name.length >= 18 ? card.name.slice(0,18) + "..." : card.name
  const img = card == null || card.img == '' ? 'https://images-na.ssl-images-amazon.com/images/I/51XYjrkAYuL._AC_SY450_.jpg' : card.img
  const timeout = (columnIndex + 1) * 500;
  
  if(card.link == null){
    card.link = `https://www.anime-planet.com/characters/${card.id}`
  }
  const isSubmitted = useSelector( state => {
    return state.data.waifuList.length > 0 && state.data.waifuList.map(x => x.link).includes(card.link);
  });

  const canSubmit = useSelector( state => {
    return state.user.credentials.submitSlots > 0 && !isSubmitted;
  });

  var isSearchView = false;
  if(window.location.pathname == "/search")
    isSearchView = true;

  const selectCard = (event) => {
    setIsSelected(true)
    setGrow(true)
  }
  const closeView = () =>{
    setGrow(false)
    setTimeout(() => {
      setIsSelected(false)
    }, 650);
  }
  
  return(
    <>
      <CharacterThumbNail selectCard={selectCard} card={card} style={style} columnIndex={columnIndex} />

      {
        isSelected ?
          <Grow
            in={grow}
            style={{ transformOrigin: '0 0 0' }}
            timeout={500}
          >
            <Grid container alignItems="center" justify="center" style={{height: "100%", position: "fixed", zIndex:"10", backgroundColor: "#00000091" }} >
              <ClickAwayListener onClickAway={() => closeView()}>
                <Grid item xs={10} style={{ height: "75%" }}>
                  <Grid container item xs={12} style={{ height:"100%" }}>
                    <Grid item xs={4} style={{ height:"100%" }}>
                      <Paper style={{position:"relative", backgroundImage: "url("+img+")", backgroundPosition:"top", backgroundSize:"cover",
                        height: "100%",width:"100%",borderRadius: "20px 0px 0px 20px", display:"flex", alignItems:"flex-end", justifyContent:"center"}}>
                          
                          <Fab size="medium" aria-label={"Votes"} className={exClasses.fab} color={"primary"} onClick={() => window.open(card.link, '_blank')}>
                            <LinkIcon />
                          </Fab>

                          {isSearchView == true ?
                            <>
                              {canSubmit  ? <Button variant="contained" color="primary" onClick={() => submitWaifu(card) } className={exClasses.button}>Submit</Button> : <></>}
                              {isSubmitted ? <Grid container alignItems="center" justify="center" style={{height:"100%", backgroundColor:"#00000096" }}>
                                <Typography style={{color:"red", fontFamily:"Edo", fontSize:"12em", transform:"rotate(-55deg)"}}>SUBMITTED</Typography>
                              </Grid> : <></>}
                            </>
                            :
                            <></>
                          }
                      </Paper>
                    </Grid>

                    <Grid item xs={8} style={{ height:"100%" }}>
                      <Paper style={{borderRadius: "0px 20px 20px 0px"}} className="cardDetails">
                        {card.type == "Anime-Manga" ? <AMCharDetails card={card}/> : <ComicCharDetails card={card} />}
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
  );
}

export default SearchCharacterCard;