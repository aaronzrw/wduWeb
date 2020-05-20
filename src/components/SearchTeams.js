import React, { Component, PureComponent, useCallback } from "react";
import watch from "redux-watch";
import axios from "axios";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
import _ from "lodash";

//Components
import Loading from "../media/Loading.mp4";
import SearchFilters from "./SearchFilters";
import SearchCharacters from "./SearchCharacters";

// MUI Stuff
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Tooltip from "@material-ui/core/Tooltip";
import Fab from "@material-ui/core/Fab";

import Grow from "@material-ui/core/Grow";
import Zoom from "@material-ui/core/Zoom";
import Slide from "@material-ui/core/Slide";

//labs
import Autocomplete from "@material-ui/lab/Autocomplete";

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
              className={`${classes.card} ${raised ? classes.cardRaised : ""}`}
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

const outerRef = React.createRef();

export class SearchTeams extends Component {
  constructor(props) {
    super(props);

    var searchData = this.props.searchData;
    searchData.forEach(function (value, i) {
      value.id = i;
    });

    var columnWidth = 220;
    for (var i = 7; i >= 1; i--) {
      //start at 7 if cant fit then go down 1
      var width = Math.floor(this.props.width / i);

      if (width >= columnWidth) {
        columnWidth = width;
        break;
      }
    }
    var columnCount = Math.floor(this.props.width / columnWidth); //250size of each column

    this.state = {
      loading: true,
      data: [],
      searchData: searchData,
      tags: this.props.tags,
      view: this.props.view,
      searchLS: store.getState().data.searchItems,
      characterLS: store.getState().data.searchItems.characters[
        this.props.view
      ],
      showCharacterView: false,
      width: this.props.width,
      height: this.props.height,
      closeViewFunc: this.props.closeView,
      columnWidth,
      columnCount,
      rowHeight: 320,
      searchOpen: false,
      selectedCat: null,
      currCount: searchData.length,
      currScroll: 0,
    };

    this.updateGridData = this.updateGridData.bind(this);
    this.openSearch = this.openSearch.bind(this);
    this.closeSearch = this.closeSearch.bind(this);
    this.loadCharacters = this.loadCharacters.bind(this);
    this.closeCharacterView = this.closeCharacterView.bind(this);
    this.handleSeachSelectChange = this.handleSeachSelectChange.bind(this);
    this.handleSeachTextChange = this.handleSeachTextChange.bind(this);
  }

  async componentDidMount() {
    store.dispatch({ type: LOADING_UI });
    this.updateGridData(this.state.searchData);
  }

  updateGridData(dataList) {
    var data = [];
    if (dataList.length != 0) {
      data = _.chunk(dataList, this.state.columnCount);

      if (data[data.length - 1].length < this.state.columnCount) {
        //if there are missing objects then add null object
        var missingItemCount =
          this.state.columnCount - data[data.length - 1].length;

        for (var i = 0; i < missingItemCount; i++) {
          data[data.length - 1].push(null);
        }
      }
    }

    var rowCount = data.length;

    store.dispatch({ type: STOP_LOADING_UI });
    this.setState({ loading: false, data, preChunkData: dataList, rowCount });
    this.scrollToTop();
  }

  scrollToTop() {
    if (outerRef.current != undefined) {
      outerRef.current.scrollTo(0, 0);
    }
  }

  closeSearch() {
    this.setState({ searchOpen: false });
  }
  openSearch() {
    this.setState({ searchOpen: true });
  }

  async loadCharacters(selectedCat) {
    store.dispatch({ type: LOADING_UI });
    var view = this.state.view;

    var localObj = this.state.characterLS || {};
    var charData = [];
    if (selectedCat != null) {
      if (["Marvel", "DC"].includes(this.state.view)) {
        charData = _.filter(localObj.items, function (item) {
          if (
            item.teams
              .map((x) => x.toLowerCase())
              .includes(selectedCat.toLowerCase())
          )
            //check display name
            return true;
          else return false;
        });
      } else if ("Anime-Manga".includes(this.state.view)) {
        charData = _.filter(localObj.items, function (item) {
          if (
            item.animes
              .map((x) => x.toLowerCase())
              .includes(selectedCat.toLowerCase())
          )
            //check display name
            return true;
          if (
            item.mangas
              .map((x) => x.toLowerCase())
              .includes(selectedCat.toLowerCase())
          )
            //check current alias
            return true;
          else return false;
        });
      }
    } else {
      charData = localObj.items;
    }

    this.setState({ showCharacterView: true, charData, selectedCat });
    // }

    store.dispatch({ type: STOP_LOADING_UI });
  }

  async getCharacters(view) {
    return await axios
      .post("/getCharacters", view)
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  closeCharacterView() {
    var currScroll = this.state.currScroll;

    this.setState({ showCharacterView: false });
    setTimeout(function () {
      if (outerRef.current != null) outerRef.current.scrollTo(0, currScroll);
    }, 1000);
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

    this.updateGridData(data);
    this.setState({ currCount: data.length });
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

    this.updateGridData(data);
    this.setState({ currCount: data.length });
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
                <AutoSizer>
                  {({ height, width }) => (
                    <VirtGrid
                      outerRef={outerRef}
                      className="Grid"
                      width={width}
                      height={height}
                      rowCount={this.state.rowCount}
                      rowHeight={this.state.rowHeight}
                      columnCount={this.state.columnCount}
                      columnWidth={this.state.columnWidth}
                      itemData={[
                        this.state.data,
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
                        this.setState({ currScroll: scrollTop });
                      }}
                    >
                      {CardItem}
                    </VirtGrid>
                  )}
                </AutoSizer>

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
                    onClick={() => this.state.closeViewFunc()}
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
                    aria-label={"All Characters"}
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
                      <SearchFilters
                        searchData={this.state.searchData}
                        selectedCats={[this.state.selectedCat]}
                        currCount={this.state.currCount}
                        view={this.state.view}
                        tags={this.state.tags}
                        updateGridData={this.updateGridData}
                        handleSeachTextChange={this.handleSeachTextChange}
                        handleSeachSelectChange={this.handleSeachSelectChange}
                      />
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
                    searchData={this.state.characterLS.items}
                    charData={this.state.charData}
                    tags={this.state.searchData}
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

SearchTeams.propTypes = {
  classes: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  user: state.user,
});

export default connect(mapStateToProps)(withStyles(styles)(SearchTeams));
