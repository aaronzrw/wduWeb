import React, { Component, PureComponent, useCallback } from 'react'
import watch from 'redux-watch'
import axios from 'axios'
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import { makeStyles } from '@material-ui/core/styles';
import _ from 'lodash';

//Components
import Loading from '../media/Loading.mp4'
import SearchFilters from './SearchFilters'
import { submitWaifu } from '../redux/actions/dataActions'

// MUI Stuff
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Tooltip from '@material-ui/core/Tooltip';
import Fab from '@material-ui/core/Fab';
import Divider from '@material-ui/core/Divider';

import Grow from '@material-ui/core/Grow';
import Zoom from '@material-ui/core/Zoom';
import Slide from '@material-ui/core/Slide';

//icons
import SearchIcon from '@material-ui/icons/Search';
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { FixedSizeGrid as VirtGrid, FixedSizeList as List } from 'react-window';
import AutoSizer from "react-virtualized-auto-sizer";

import { Scrollbars } from 'react-custom-scrollbars';

// Redux stuff
import { connect, useSelector } from 'react-redux';
import store from '../redux/store';
import {
    LOADING_UI,
    STOP_LOADING_UI
  } from '../redux/types';

class Aliases extends PureComponent {
  render (){
    const item = this.props.data[this.props.index];
    return (
      <div style={this.props.style}>
        <Typography align="center" style={{fontFamily:"Edo", fontSize:"15px"}}>{item}</Typography>
      </div>
    )
  }
}

class Teams extends PureComponent {
  render (){
    const item = this.props.data[this.props.index];
    return (
      <div style={this.props.style}>
        <Typography align="center" style={{fontFamily:"Edo", fontSize:"15px"}}>{item}</Typography>
      </div>
    )
  }
}

const CustomScrollbars = ({ onScroll, forwardedRef, style, children }) => {
  const refSetter = useCallback(
    (scrollbarsRef) => {
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

const aliasRef = React.createRef();
const teamRef = React.createRef();

const ComicCharDetails = ({ card }) => {
  const displayName = `${card.name} ${card.currentAlias != "" && card.currentAlias != card.name ? "- " + card.currentAlias : ""}`

  return(
    <Grid container style={{height: "100%"}}>

      {/* Name */}
      <Grid container item xs={12} alignItems="center" justify="center" style={{height:"75px"}}>
        <Typography align="center" style={{fontFamily:"Edo", fontSize:"45px"}}>{displayName}</Typography>
      </Grid>

      <Divider style={{width:"100%"}} />
      
      <Grid container item xs={12} style={{height:"calc(100% - 75px)"}}>
        <Grid container alignItems="center" justify="center" item xs={12} style={{height:"200px", backgroundColor:"#dcdcdc"}}>
          {card.quote != "" ?
            <div style={{width:"98%"}}>
              <Typography className="quote" style={{fontFamily:"Edo", fontSize: "1vw", margin:"0px", textAlign:"center"}}>
                {card.quote.replace('—', '-').split('" -')[0].trim() + '"'}
              </Typography>

              <Typography className="quote" style={{fontFamily:"Edo", fontSize: "1vw", margin:"0px", textAlign:"center"}}>
                {'-' + card.quote.replace('—', '-').split('" -')[1].trim()}
              </Typography>
            </div>
          :<></>
          }
        </Grid>

        {/* Aliases */}
        <Grid container item xs={6} style={{height: "calc(100% - 200px)"}}>
          <Grid item xs={12} style={{height: "50px"}}>
            <Typography align="center" style={{fontFamily:"Edo", fontSize:"30px"}}>Aliases</Typography>
          </Grid>
          <Grid container item xs={12} style={{height: "calc(100% - 50px)"}}>
            <AutoSizer>
              {({height, width}) =>
              {
                return (
                  <List
                    outerRef={aliasRef}
                    outerElementType={CustomScrollbarsVirtualList}
                    height={height}
                    itemData={ _.cloneDeep(card.aliases)}
                    itemCount={ _.cloneDeep(card.aliases).length}
                    itemSize={50}
                    width={width}
                  >
                    {Aliases}
                  </List>
                )
              }}
            </AutoSizer>
          </Grid>
        </Grid>
          {/* Teams */}
        <Grid container item xs={6} style={{height: "calc(100% - 200px)"}}>
          <Grid item xs={12} style={{height: "50px"}}>
            <Typography align="center" style={{fontFamily:"Edo", fontSize:"30px"}}>Teams</Typography>
          </Grid>
          <Grid item container xs={12} style={{height: "calc(100% - 50px)"}}>
            <AutoSizer>
              {({height, width}) =>
              {
                return (
                  <List
                    outerRef={teamRef}
                    outerElementType={CustomScrollbarsVirtualList}
                    height={height}
                    itemData={ _.cloneDeep(card.teams)}
                    itemCount={ _.cloneDeep(card.teams).length}
                    itemSize={50}
                    width={width}
                  >
                    {Teams}
                  </List>
                )
              }}
            </AutoSizer>
          </Grid>
        </Grid>            
      </Grid>
    </Grid>
  );
}

export default ComicCharDetails;