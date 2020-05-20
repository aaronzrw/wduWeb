import React, { Component, PureComponent, useCallback } from 'react'
import watch from 'redux-watch'
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import _ from 'lodash';

//Components
import SearchFilters from './SearchFilters'
import SearchCharacterCard from './SearchCharacterCard'

// MUI Stuff
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Paper from '@material-ui/core/Paper';
import Fab from '@material-ui/core/Fab';

import Zoom from '@material-ui/core/Zoom';
import Slide from '@material-ui/core/Slide';


//icons
import SearchIcon from '@material-ui/icons/Search';
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import PeopleIcon from '@material-ui/icons/People';

import { FixedSizeGrid as VirtGrid, FixedSizeList as List } from 'react-window';
import AutoSizer from "react-virtualized-auto-sizer";

import { Scrollbars } from 'react-custom-scrollbars';

// Redux stuff
import { connect } from 'react-redux';
import store from '../redux/store';
import {
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
  toTopFab:{
    position: 'absolute',
    bottom: theme.spacing(10),
    right: theme.spacing(2)
  },
  allCharsFab:{
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(10),
  },
  returnFab: {
    position: 'absolute',
    bottom: theme.spacing(2),
    left: theme.spacing(2),
  },
  currentViewSearchBar:{
    position: 'absolute',
    bottom: theme.spacing(0),
    left: "50%",
    transform: "translate(-50%)",
    backgroundColor: "#fafafae6",
    border: "solid 1px primary",
    borderRadius: "10px 10px 0px 0px",
    padding: "4px 8px"
  }
});

const CardItem = ({ data , columnIndex, rowIndex, style }) => {
  if(data[0][rowIndex] == undefined || data[0][rowIndex][columnIndex] == undefined)
    return <></>

  const props = data[2];
  const card = data[0][rowIndex][columnIndex];
  card.type = data[1]

  return <SearchCharacterCard props={props} card={card} style={style} columnIndex={columnIndex}/>
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

function difference(object, base) {
  return _.transform(object, (result, value, key) => {
    if (!_.isEqual(value, base[key])) {
      result[key] = _.isObject(value) && _.isObject(base[key]) ? difference(value, base[key]) : value;
    }
  });
}

export class SeachCharacters extends Component {
  constructor(props) {
    super(props);
      
    var searchData = this.props.searchData;
    searchData.forEach(function (value, i) {
      value.id = i
    });
    
    var columnWidth = 220;
    for(var i=7; i >= 1; i--){//start at 7 if cant fit then go down 1
      var width = Math.floor(this.props.width/i);

      if(width >= columnWidth){
        columnWidth = width;
        break;
      }
    }
    var columnCount = Math.floor(this.props.width/columnWidth) //250size of each column
      
    this.state = {
      user: store.getState().user,
      loading: false,
      searchData: searchData,
      tags: this.props.tags,
      view: this.props.view,
      charData: this.props.charData,
      currCount: this.props.charData.length,
      selectedCats: [this.props.selectedCat],
      width: this.props.width,
      height: this.props.height,
      loadAllCharacters: this.props.loadAllCharacters,
      closeViewFunc: this.props.closeCharacterView,
      searchOpen: false,
      columnWidth,
      columnCount,
      rowHeight: 320,
    };
    
    let userReducerWatch = watch(store.getState, 'user')
    store.subscribe(userReducerWatch((newVal, oldVal, objectPath) => {
        this.setState({ ...newVal })
    }))

    this.openSearch = this.openSearch.bind(this)
    this.closeSearch = this.closeSearch.bind(this)
    this.handleSeachTextChange = this.handleSeachTextChange.bind(this)
    this.handleSeachSelectChange = this.handleSeachSelectChange.bind(this)
    this.currScroll = 0;
  }

  async componentDidMount(){
  }

  componentWillReceiveProps(props){
    var differences = difference(props, this.props)

    if(differences.charData != null){
      store.dispatch({ type: LOADING_UI })
      this.setState({ ...props })
      store.dispatch({ type: STOP_LOADING_UI })
    }
  }
  
  scrollToTop(){
    if(outerRef.current != undefined){
      outerRef.current.scrollTo(0,0)
    }
  }

  closeSearch(){
    this.setState({searchOpen: false})
  }

  openSearch(){
    this.setState({searchOpen: true})
  }

  selectCat(selectedCats){
    this.setState({selectedCats})
  }

  handleSeachSelectChange(value){
    value = value || ""
    var data = _.cloneDeep(this.state.searchData)

    if(value != "" && value != null){
      if(["Marvel","DC"].includes(this.state.view)){
        //check realnames, and aliases
        data = _.filter(this.state.searchData, function(item) {
          if(item.name.toLowerCase().includes(value.toLowerCase()) ||
            item.currentAlias.toLowerCase().includes(value.toLowerCase()) || 
            _.includes(item.realName.map(x => x.toLowerCase()), value) ||
            _.includes(item.aliases.map(x => x.toLowerCase()), value)) //check other alias name list
            return true
        });
      }
      else{
        data = _.filter(this.state.searchData,function(item){
          return item.name.toLowerCase().includes(value.toLowerCase());
        });
      }
    }
    
    this.setState({ charData:data })
  }

  handleSeachTextChange(value){
    /* signal to React not to nullify the event object */
    value = value || ""
    var data = _.cloneDeep(this.state.searchData)

    if(value != "" && value != null){
      if(["Marvel","DC"].includes(this.state.view)){
        //check realnames, and aliases
        data = _.filter(this.state.searchData, function(item) {
          if(item.name.toLowerCase().includes(value.toLowerCase()) ||
            item.currentAlias.toLowerCase().includes(value.toLowerCase()) || 
            _.includes(item.realName.map(x => x.toLowerCase()), value) ||
            _.includes(item.aliases.map(x => x.toLowerCase()), value)) //check other alias name list
            return true
        });
      }
      else{
        data = _.filter(this.state.searchData,function(item){
          return item.name.toLowerCase().includes(value.toLowerCase());
        });
      }
    }
    
    this.setState({ charData:data })
  }

  render() {
    var {classes} = this.props;

    return (
      <div style={{height: "100%", width:"100%"}}>              
        {
          this.state.loading ?
          <></>
          :
            <>
              <AutoSizer>
                {({height, width}) =>
                {
                  var columnWidth = 220;
                  var columnCount = Math.floor(width / columnWidth)
                  if((width/columnCount) > columnCount)
                    columnWidth = (width/columnCount)

                  var data = _.chunk(_.cloneDeep(this.state.charData), columnCount);
                  if(!_.isEmpty(data)){
                    var missingItemCount = columnCount - data[data.length - 1].length;
                    data[data.length - 1].concat(_.fill(Array(missingItemCount), null))
                  }
                  
                  return (
                    <VirtGrid
                      className="Grid"
                      width={width}
                      height={height}
                      rowCount={data.length}
                      rowHeight={this.state.rowHeight}
                      columnCount={columnCount}
                      columnWidth={columnWidth}
                      itemData={[data, this.state.view, {...this.props}
                      ]}
                      outerElementType={CustomScrollbarsVirtualList}
                      onScroll={({
                        horizontalScrollDirection,
                        scrollLeft,
                        scrollTop,
                        verticalScrollDirection,
                        scrollOffset,
                        scrollUpdateWasRequested,
                      }) => {
                        this.currScroll = scrollTop;
                      }}
                    >
                      {CardItem}
                    </VirtGrid>
                  )
                }}
              </AutoSizer>
              
              <Zoom
                in={true}
                style={{
                  transitionDelay: "250ms",
                }}
                unmountOnExit
              >
                <Fab aria-label={"return"} className={classes.returnFab} color={"secondary"} onClick={() => this.state.closeViewFunc() }>
                  <KeyboardBackspaceIcon />
                </Fab>
              </Zoom>

              <Zoom
                in={!this.state.searchOpen}
                style={{
                  transitionDelay: '250ms',
                }}
                unmountOnExit
              >
                <Fab aria-label={"search"} className={classes.fab} color={"primary"} onClick={this.openSearch}>
                  <SearchIcon />
                </Fab>
              </Zoom>

              <Zoom
                in={!this.state.searchOpen}
                style={{
                  transitionDelay: '350ms',
                }}
                unmountOnExit
              >
                <Fab size="medium" aria-label={"Back To Back"} className={classes.toTopFab} color={"primary"} onClick={this.scrollToTop}>
                  <KeyboardArrowUpIcon />
                </Fab>
              </Zoom>
              
              <Zoom
                in={!this.state.searchOpen}
                style={{
                  transitionDelay: '350ms',
                }}
                unmountOnExit
              >
                <Fab size="medium" aria-label={"All Characters"} className={classes.allCharsFab} color={"primary"} onClick={() => this.state.loadAllCharacters(null)}>
                  <PeopleIcon />
                </Fab>
              </Zoom>

              {/* <Zoom
                in={true}
                style={{
                  transform: "translate(-50%)}",
                  transitionDelay: '750ms',
                }}
                unmountOnExit
              >
                <Paper elevation={4} className={classes.currentViewSearchBar}>
                  <TextField style={{ width: "400px", height: "40px" }} placeholder="Search Current Characters"/>
                </Paper>
              </Zoom> */}

              <Slide direction="left" in={this.state.searchOpen} mountOnEnter unmountOnExit>
                <ClickAwayListener onClickAway={this.closeSearch}>
                  <Paper elevation={4} className={classes.paper} style={{ height: "100%", width:"400px", position: "fixed", right: "0", top:"0", zIndex:"5"}}>
                    <SearchFilters searchData={this.state.searchData} selectedCats={this.state.selectedCats} updateSelectedCat={this.selectCat}
                      currCount={this.state.charData.length} view={this.state.view} tags={this.state.tags}
                      handleSeachTextChange={this.handleSeachTextChange} handleSeachSelectChange={this.handleSeachSelectChange}/>
                  </Paper>
                </ClickAwayListener>
              </Slide>
            </>
        }
      </div>
    )
  }
}

export default (withStyles(styles)(SeachCharacters));
