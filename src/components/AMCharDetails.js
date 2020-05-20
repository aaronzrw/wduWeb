import React, { Component, PureComponent, useCallback, useState } from 'react'
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
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';

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

class Row extends PureComponent {
  render() {
    // Access the items array using the "data" prop:
    const item = this.props.data[this.props.index];
 
    return (
      <div style={this.props.style}>
        <Typography align="center" style={{fontFamily:"Edo", fontSize:"15px"}}>{item}</Typography>
      </div>
    );
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

const animesRef = React.createRef();
const mangasRef = React.createRef();

const AMCharDetails = ({ card }) => {
  const img = card == null ? '' : card.img != '' ? card.img : 'https://images-na.ssl-images-amazon.com/images/I/51XYjrkAYuL._AC_SY450_.jpg'

  //Anime-Manga Variables
  const tags = card.tags.concat(card.traits);
  
  return(
    <Grid container style={{height: "100%"}}>

      {/* Name */}
      <Grid container item xs={12} alignItems="center" justify="center" style={{height:"75px"}}>
        <Typography align="center" style={{fontFamily:"Edo", fontSize:"45px"}}>{card.name}</Typography>
      </Grid>
      
      <Grid container alignItems="center" justify="center" item xs={12} style={{height:"200px", backgroundColor:"#dcdcdc"}}>
        {card.quote != "" ?
          <div style={{width:"98%"}}>
            <Typography className="quote" style={{fontFamily:"Edo", fontSize: "1vw", margin:"0px", textAlign:"center"}}>
              {card.desc}
            </Typography>
          </div>
        :<></>
        }
      </Grid>
      
      <Grid container item xs={12} style={{height:"calc(100% - 275px)"}}>
        {/* Tags */}
        <Grid container item xs={12} style={{height: "150px"}}>
          <Grid item xs={12} style={{height: "50px"}}>
            <Typography align="center" style={{fontFamily:"Edo", fontSize:"30px"}}>Characteristics</Typography>
          </Grid>
          <Grid container item xs={12} alignItems="center" justify="center" style={{height: "100px"}}>
            {tags.map(x => {
              return(
                <Grid key={x+"1"} item xs={Math.floor(12/tags.length)}>
                  <Typography key={x+"2"} align="center">{x}</Typography>
                </Grid>
              )
            })}
          </Grid>
        </Grid>

        {/* Appearances */}
        <Grid container item xs={12} style={{height: "calc(100% - 225px)"}}>
          <Grid container style={{width: "49%", height: "100%"}}>
            <Grid item xs={12} style={{height: "50px"}}>
              <Typography align="center" style={{fontFamily:"Edo", fontSize:"30px"}}>Animes</Typography>
            </Grid>
            <Grid item container xs={12} style={{height: "calc(100% - 50px)"}}>
              <AutoSizer>
                {({ height, width }) => (
                  <List
                    outerRef={animesRef}
                    outerElementType={CustomScrollbarsVirtualList}
                    height={height}
                    itemData={card.animes}
                    itemCount={card.animes.length}
                    itemSize={50}
                    width={width}
                  >
                    {Row}
                  </List>
                )}
              </AutoSizer>
            </Grid>
          </Grid>

          <Grid style={{width: "2%", display:"flex"}}>
            <Divider orientation="vertical" style={{height: "75%", margin: "auto" }} />
          </Grid>

          <Grid container style={{width: "49%", height: "100%"}}>
            <Grid item xs={12} style={{height: "50px"}}>
              <Typography align="center" style={{fontFamily:"Edo", fontSize:"30px"}}>Mangas</Typography>
            </Grid>

            <Grid container item xs={12} style={{height: "calc(100% - 50px)"}}>
              <AutoSizer>
                {({ height, width }) => (
                  <List
                    outerRef={mangasRef}
                    outerElementType={CustomScrollbarsVirtualList}
                    height={height}
                    itemData={card.mangas}
                    itemCount={card.mangas.length}
                    itemSize={50}
                    width={width}
                  >
                    {Row}
                  </List>
                )}
              </AutoSizer>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default AMCharDetails;