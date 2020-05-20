import React, { Component, PureComponent, useCallback } from "react";
import watch from "redux-watch";
import axios from "axios";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
import _ from "lodash";
import Radium from 'radium';

//Components
import SearchFilters from "./SearchFilters";
import SearchCharacters from "./SearchCharacters";

// MUI Stuff
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import Tooltip from "@material-ui/core/Tooltip";
import Fab from "@material-ui/core/Fab";

import Grow from "@material-ui/core/Grow";
import Zoom from "@material-ui/core/Zoom";
import Slide from "@material-ui/core/Slide";

//icons
import SearchIcon from "@material-ui/icons/Search";
import KeyboardBackspaceIcon from "@material-ui/icons/KeyboardBackspace";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import PeopleIcon from "@material-ui/icons/People";

import { FixedSizeGrid as VirtGrid, FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

import { Scrollbars } from "react-custom-scrollbars";

// Redux stuff
import { connect } from "react-redux";
import store from "../redux/store";
import {
  SET_SEARCH_DATA,
  LOADING_DATA,
  LOADING_UI,
  STOP_LOADING_UI,
} from "../redux/types";

const styles = (theme) => ({
  ...theme.spreadThis,
  media: {
    height: 250,
  },
  large: {
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
  viewSelectContiner: {
    minHeight: "200px",
    maxHeight: "25%",
    height: "100%",
  },
  gridItem: {
    height: "50%",
  },
  card: {
    height: "300px",
    width: "200px",
    filter: "brightness(0.75)",
    transition: "transform .1s",
  },
  cardRaised: {
    transform: "scale(1.1)",
    filter: "brightness(1)",
  },
  tooltip: {
    fontSize: "15px",
    maxWidth: "none",
  },
  fab: {
    position: "absolute",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
  toTopFab: {
    position: "absolute",
    bottom: theme.spacing(10),
    right: theme.spacing(2),
  },
  allCharsFab: {
    position: "absolute",
    bottom: theme.spacing(2),
    right: theme.spacing(10),
  },
  returnFab: {
    position: "absolute",
    bottom: theme.spacing(2),
    left: theme.spacing(2),
  },
});

const CardItem = ({ data, columnIndex, rowIndex, style }) => {
  const props = data[1];
  const { classes } = props;
  const [raised, setRaised] = React.useState(false);
  const loadCharactersFunc = data[2];

  if (
    data[0][rowIndex] == undefined ||
    data[0][rowIndex][columnIndex] == undefined
  ) {
    return <></>;
  }

  const card = data[0][rowIndex][columnIndex];
  const cardTitle =
    card == null
      ? ""
      : card.name.length > 18
      ? card.name.slice(0, 18) + "..."
      : card.name;
  const img =
    card == null
      ? ""
      : card.img != ""
      ? card.img
      : "https://images-na.ssl-images-amazon.com/images/I/51XYjrkAYuL._AC_SY450_.jpg";
  const timeout = (columnIndex + 1) * 500;

  const selectCard = () => {
    loadCharactersFunc(card.name);
  };

  const raiseCard = (isRaised) => {
    setRaised(isRaised);
  };

  return (
    <>
      {card == null ? (
        <></>
      ) : (
        <Grow in={true} style={{ transformOrigin: "0 0 0" }} timeout={timeout}>
          <Grid container alignItems="center" justify="center" style={style}>
            <Card
              raised={raised}
              style={{overflow: "inherit"}}
              className={`${classes.card} ${raised ? classes.cardRaised : ""} gradient-border`}
              onMouseEnter={() => raiseCard(true)}
              onMouseLeave={() => raiseCard(false)}
            >
              <CardActionArea
                onClick={() => selectCard()}
                style={{
                  backgroundImage: "url(" + img + ")",
                  backgroundPosition: "top",
                  backgroundSize: "cover",
                  width: "100%",
                  height: "100%",
                }}
              >
                <div style={{ height: "80%" }} />

                <CardContent
                  style={{
                    height: "20%",
                    position: "relative",
                    backgroundColor: "rgba(0,0,0,.5)",
                    padding: "0px",
                  }}
                >
                  {cardTitle.includes("...") ? (
                    <Tooltip
                      TransitionComponent={Zoom}
                      title={card.name}
                      placement="top"
                      classes={{ tooltip: classes.tooltip }}
                    >
                      <Typography
                        align="center"
                        style={{
                          fontFamily: "Edo",
                          fontSize: "18px",
                          color: "white",
                          maxHeigt: "100%",
                          width: "100%",
                          margin: "auto",
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                        }}
                        variant="h5"
                        component="h2"
                      >
                        {cardTitle}
                      </Typography>
                    </Tooltip>
                  ) : (
                    <Typography
                      align="center"
                      style={{
                        fontFamily: "Edo",
                        fontSize: "18px",
                        color: "white",
                        maxHeigt: "100%",
                        width: "100%",
                        margin: "auto",
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                      }}
                      variant="h5"
                      component="h2"
                    >
                      {cardTitle}
                    </Typography>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grow>
      )}
    </>
  );
};

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

const animeRef = React.createRef();
const mangaRef = React.createRef();


export class SearchSeries extends Component {
  constructor(props) {
    super(props);

    var uniData = this.props.uniData;
    uniData.items.forEach(function (value, i) {
      value.id = i;
    });    

    this.state = {
      loading: false,
      data: [],
      origUniCharData: {
        'universe': this.props.uniData,
        'characters': this.props.charData
      },
      uniData: this.props.uniData,
      charData: this.props.charData,
      animes: this.props.uniData.items.filter(x => x.link.includes("/anime/")),
      mangas: this.props.uniData.items.filter(x => x.link.includes("/manga/")),
      view: this.props.view,
      searchLS: store.getState().data.searchItems,
      characterLS: store.getState().data.searchItems.characters[
        this.props.view
      ],
      showCharacterView: false,
      width: this.props.width,
      height: this.props.height,
      closeViewFunc: this.props.closeView,
      rowHeight: 320,
      searchOpen: false,
      selectedCat: null,
      //currCount: searchData.length,
    };

    this.showAMView = this.showAMView.bind(this);
    this.openSearch = this.openSearch.bind(this);
    this.closeSearch = this.closeSearch.bind(this);
    this.loadCharacters = this.loadCharacters.bind(this);
    this.closeCharacterView = this.closeCharacterView.bind(this);
    this.handleSeachTextChange = this.handleSeachTextChange.bind(this);
    this.handleSeachSelectChange = this.handleSeachSelectChange.bind(this);
    this.animeScroll = 0;
    this.mangaScroll = 0;
  }

  async componentDidMount() {
  }

  showAMView(){
    this.setState({ showCharacterView: false });
  }

  closeCharacterView() {

    this.setState({ showCharacterView: false });
    setTimeout(function () {
      if (animeRef.current != null) animeRef.current.scrollTo(0, this.animeScroll);
      if (mangaRef.current != null) mangaRef.current.scrollTo(0, this.mangaScroll);
    }, 500);
  }

  loadCharacters(selectedCat) {
    store.dispatch({ type: LOADING_UI });

    var charData = _.cloneDeep(this.state.origUniCharData['characters']);

    if (selectedCat != null) {
      charData = _.filter(charData, function (item) {
        if (item.animes.map((x) => x.toLowerCase()).includes(selectedCat.toLowerCase()) ||
          item.mangas.map((x) => x.toLowerCase()).includes(selectedCat.toLowerCase()))
          return true;
      });
    }

    this.setState({ charData, selectedCat, showCharacterView: true });
    store.dispatch({ type: STOP_LOADING_UI });
  }

  closeSearch() {
    this.setState({ searchOpen: false });
  }
  openSearch() {
    this.setState({ searchOpen: true });
  }

  handleSeachSelectChange(value) {
    var data = [];
    value = value || "";

    if (value != "" && value != null) {
      data = _.filter(this.state.searchData, function (item) {
        return item.name.toLowerCase().includes(value.toLowerCase());
      });
    } else {
      //if cleared then pull original display
      data = _.cloneDeep(this.state.preChunkData);
    }

  }

  handleSeachTextChange(value) {
    /* signal to React not to nullify the event object */

    var data = [];
    if (value != "" && value != null) {
      data = _.filter(this.state.searchData, function (item) {
        return item.name.toLowerCase().includes(value.toLowerCase());
      });
    } else {
      //if cleared then pull original display
      data = _.cloneDeep(this.state.preChunkData);
    }
  }
  
  render() {
    var { classes } = this.props;

    return (
      <div style={{ height: "100%", width: "100%" }}>
        {this.state.loading ? (
          <></>
        ) : (
          <>
            {!this.state.showCharacterView ? (
              <>
                <Grid container style={{height:"100%"}}>
                  {/* <Grid item xs={12} className="seriesBackground"/> */}
                    <Grid container spacing={2} item xs={12} style={{height:"100%"}}>
                      {/* Animes */}
                      <Grid item xs={6} style={{height:"100%"}}>
                        <Grid container item xs={12} alignItems="center" justify="center" style={{height: "50px"}}>
                          <Typography style={{fontFamily: "Edo", fontSize:"30px", textAlign:"center", color:"white"}}>
                            Animes
                          </Typography>
                        </Grid>
                        <Grid item xs={12} style={{height:"calc(100% - 50px)"}}>
                          <AutoSizer>
                            {({ height, width }) =>
                            {
                              var columnWidth = 220;
                              var columnCount = Math.floor(width / columnWidth)
                              if((width/columnCount) > columnCount)
                                columnWidth = (width/columnCount)
          
                              var data = _.chunk(_.cloneDeep(this.state.animes), columnCount);
                              if(!_.isEmpty(data)){
                                var missingItemCount = columnCount - data[data.length - 1].length;
                                data[data.length - 1].concat(_.fill(Array(missingItemCount), null))
                              }

                              return (
                                <VirtGrid
                                  className="Grid"
                                  outerRef={animeRef}
                                  width={width}
                                  height={height}
                                  rowCount={data.length}
                                  rowHeight={this.state.rowHeight}
                                  columnCount={columnCount}
                                  columnWidth={columnWidth}
                                  itemData={[
                                    data,
                                    { ...this.props },
                                    this.loadCharacters,
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
                                    this.animeScroll = scrollTop;
                                  }}
                                >
                                  {CardItem}
                                </VirtGrid>
                              )
                            }}
                          </AutoSizer>
                        </Grid>
                      </Grid>
                      
                      {/* Mangas */}
                      <Grid item xs={6} style={{height:"100%"}}>
                        <Grid container item xs={12} alignItems="center" justify="center" style={{height: "50px"}}>
                          <Typography style={{fontFamily: "Edo", fontSize:"30px", textAlign:"center", color:"white"}}>
                            Mangas
                          </Typography>
                        </Grid>
                        <Grid item xs={12} style={{height:"calc(100% - 50px)"}}>
                          <AutoSizer>
                            {({ height, width }) => 
                            {
                              var columnWidth = 220;
                              var columnCount = Math.floor(width / columnWidth)
                              if((width/columnCount) > columnCount)
                                columnWidth = (width/columnCount)
          
                              var data = _.chunk(_.cloneDeep(this.state.mangas), columnCount);
                              if(!_.isEmpty(data)){
                                var missingItemCount = columnCount - data[data.length - 1].length;
                                data[data.length - 1].concat(_.fill(Array(missingItemCount), null))
                              }

                              return (
                                <VirtGrid
                                  outRef={mangaRef}
                                  className="Grid"
                                  width={width}
                                  height={height}
                                  rowCount={data.length}
                                  rowHeight={this.state.rowHeight}
                                  columnCount={columnCount}
                                  columnWidth={columnWidth}
                                  itemData={[
                                    data,
                                    { ...this.props },
                                    this.loadCharacters,
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
                                    this.mangaScroll = scrollTop;
                                  }}
                                >
                                  {CardItem}
                                </VirtGrid>
                              )
                            }}
                          </AutoSizer>
                        </Grid>
                      </Grid>
                    </Grid>
                </Grid>

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
                    onClick={() =>{
                      if(this.state.showCharacterView)
                        this.showAMView()
                      else
                        this.state.closeViewFunc()
                    }}
                  >
                    <KeyboardBackspaceIcon />
                  </Fab>
                </Zoom>

                <Zoom
                  in={!this.state.searchOpen}
                  style={{
                    transitionDelay: "250ms",
                  }}
                  unmountOnExit
                >
                  <Fab
                    aria-label={"search"}
                    className={classes.fab}
                    color={"primary"}
                    onClick={this.openSearch}
                  >
                    <SearchIcon />
                  </Fab>
                </Zoom>

                <Zoom
                  in={!this.state.searchOpen}
                  style={{
                    transitionDelay: "350ms",
                  }}
                  unmountOnExit
                >
                  <Fab
                    size="medium"
                    aria-label={"Back To Back"}
                    className={classes.toTopFab}
                    color={"primary"}
                    onClick={this.scrollToTop}
                  >
                    <KeyboardArrowUpIcon />
                  </Fab>
                </Zoom>

                <Zoom
                  in={!this.state.searchOpen}
                  style={{
                    transitionDelay: "350ms",
                  }}
                  unmountOnExit
                >
                  <Fab
                    size="medium"
                    aria-label={"All Series Characters"}
                    className={classes.allCharsFab}
                    color={"primary"}
                    onClick={() => this.loadCharacters(null)}
                  >
                    <PeopleIcon />
                  </Fab>
                </Zoom>

                <Slide
                  direction="left"
                  in={this.state.searchOpen}
                  mountOnEnter
                  unmountOnExit
                >
                  <ClickAwayListener onClickAway={this.closeSearch}>
                    <Paper
                      elevation={4}
                      className={classes.paper}
                      style={{
                        height: "100%",
                        width: "400px",
                        position: "fixed",
                        right: "0",
                        top: "0",
                        zIndex: "5",
                      }}
                    >
                      {/* <SearchFilters
                        searchData={this.state.searchData}
                        selectedCats={[this.state.selectedCat]}
                        currCount={this.state.currCount}
                        view={this.state.view}
                        tags={this.state.tags}
                        updateGridData={this.updateGridData}
                        handleSeachTextChange={this.handleSeachTextChange}
                        handleSeachSelectChange={this.handleSeachSelectChange}
                      /> */}
                    </Paper>
                  </ClickAwayListener>
                </Slide>
              </>
            ) : (
              <>
                <Grow
                  in={true}
                  style={{ transformOrigin: "0 0 0" }}
                  timeout={1000}
                >
                  <SearchCharacters
                    searchData={_.cloneDeep(this.state.origUniCharData['characters'])}
                    charData={_.cloneDeep(this.state.charData)}
                    view={this.state.view}
                    selectedCats={[this.state.selectedCat]}
                    loadAllCharacters={this.loadCharacters}
                    width={this.state.width}
                    height={this.state.height}
                    closeCharacterView={this.closeCharacterView}
                  />
                </Grow>
              </>
            )}
          </>
        )}
      </div>
    );
  }
}

SearchSeries.propTypes = {
  classes: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  user: state.user,
});

export default connect(mapStateToProps)(withStyles(styles)(SearchSeries));
