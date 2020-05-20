import React, { Component, PureComponent, useCallback } from "react";
import watch from "redux-watch";
import axios from "axios";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
import _ from "lodash";

//Components
import Loading from "../media/Loading.mp4";
import SearchFilters from "./SearchFilters";
import SearchSeries from "./SearchSeries";
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
  const loadSeriesFunc = data[2];

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
    loadSeriesFunc(card.name);
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

const outerRef = React.createRef();

export class SearchUniverses extends Component {
  constructor(props) {
    super(props);

    var searchData = this.props.searchData;
    searchData.forEach(function (value, i) {
      value.id = i;
    });

    this.state = {
      loading: false,
      data: searchData,
      fullAMList: _.uniq(searchData.map(x => x.items.map(y => {return {name: y.name}}).flat()).flat()),
      searchData: searchData,
      tags: this.props.tags,
      view: this.props.view,
      searchLS: store.getState().data.searchItems,
      viewLS: store.getState().data.searchItems.views[this.props.view],
      characterLS: store.getState().data.searchItems.characters[this.props.view],
      showCharacterView: false,
      width: this.props.width,
      height: this.props.height,
      closeViewFunc: this.props.closeView,
      searchOpen: false,
      selectedCat: null,
      currScroll: 0,
    };

    this.openSearch = this.openSearch.bind(this);
    this.closeSearch = this.closeSearch.bind(this);
    this.loadAllCharacters = this.loadAllCharacters.bind(this);
    this.loadSeries = this.loadSeries.bind(this);
    this.closeCharacterView = this.closeCharacterView.bind(this);
    this.closeView = this.closeView.bind(this);
    this.handleSeachSelectChange = this.handleSeachSelectChange.bind(this);
    this.handleSeachTextChange = this.handleSeachTextChange.bind(this);
  }

  async componentDidMount() {
  }
  componentDidUpdate(nextProps){
    if(nextProps.height != this.state.height || nextProps.width != this.state.width){
      this.setState({height: nextProps.height, width: nextProps.width})
    }
  }

  scrollToTop(){
    if (outerRef.current != undefined) {
      outerRef.current.scrollTo(0, 0);
    }
  }
  closeSearch(){
    this.setState({ searchOpen: false });
  }
  openSearch(){
    this.setState({ searchOpen: true });
  }

  loadSeries(selectedCat) {
    store.dispatch({ type: LOADING_UI });

    var seriesData = _.filter(this.state.viewLS.items, function (item) {
      if (item.name.toLowerCase() == selectedCat.toLowerCase())
        return true;
    })[0];

    var amNames = seriesData.items.map(x => x.name.toLowerCase())
    var charData = _.cloneDeep(this.state.characterLS.items);
    charData = _.filter(charData, function (item) {
      if (item.animes.some(ele => amNames.includes(ele.toLowerCase())) ||
        item.mangas.some(ele => amNames.includes(ele.toLowerCase())))
        return true;
    })

    this.setState({ showSeriesView: true, showCharacterView: false, uniData: seriesData, charData, selectedCat });
    store.dispatch({ type: STOP_LOADING_UI });
  }

  loadAllCharacters(selectedCat) {
    store.dispatch({ type: LOADING_UI });

    var charData = _.cloneDeep(this.state.characterLS.items);

    if (selectedCat != null) {
      charData = _.filter(charData, function (item) {
        if (item.animes.map((x) => x.toLowerCase()).includes(selectedCat.toLowerCase()) ||
          item.mangas.map((x) => x.toLowerCase()).includes(selectedCat.toLowerCase()))
          return true;
      });
    }

    this.setState({ showCharacterView: true, showSeriesView: false, charData, selectedCat });
    store.dispatch({ type: STOP_LOADING_UI });
    // if(this.state.showCharacterView){
    //   return charData
    // }
    // else{
    //   this.setState({ showCharacterView: true, showSeriesView: false, charData, selectedCat });
    // }
  }

  closeCharacterView() {
    var currScroll = this.state.currScroll;

    this.setState({ showCharacterView: false });
    setTimeout(function () {
      if (outerRef.current != null) outerRef.current.scrollTo(0, currScroll);
    }, 500);
  }

  handleSeachSelectChange(value) {
    value = value || "";
    var data = _.cloneDeep(this.state.searchData);

    if (value != "" && value != null) {
      data = _.filter(data, function (item) {
        return item.name.toLowerCase().includes(value.toLowerCase()) || item.items.map(x => x.name.toLowerCase()).includes(value.toLowerCase());
      });
    }

    this.setState({ data });
    this.scrollToTop();
  }

  handleSeachTextChange(value) {
    value = value || "";
    var data = _.cloneDeep(this.state.searchData);

    if (value != "" && value != null) {
      data = _.filter(data, function (item) {
        return item.name.toLowerCase().includes(value.toLowerCase()) || item.items.map(x => x.name.toLowerCase()).includes(value.toLowerCase());
      });
    }

    this.setState({ data });
    this.scrollToTop();
  }

  closeView() {
    var currScroll = this.state.currScroll;

    this.setState({ showSeriesView: false });
    setTimeout(function () {
      if (outerRef.current != null) outerRef.current.scrollTo(0, currScroll);
    }, 500);
  }

  render() {
    var { classes } = this.props;

    return (
      <div style={{ height: "100%", width: "100%" }}>
        {this.state.loading ? (
          <></>
        ) : (
          <>
            {!this.state.showSeriesView && !this.state.showCharacterView ? (
              <>
                <AutoSizer>
                  {({ height, width }) => {
                    var columnWidth = 220;
                    var columnCount = Math.floor(width / columnWidth)
                    if((width/columnCount) > columnCount)
                      columnWidth = (width/columnCount)

                    var data = _.chunk(_.cloneDeep(this.state.data), columnCount);
                    if(!_.isEmpty(data)){
                      var missingItemCount = columnCount - data[data.length - 1].length;
                      data[data.length - 1].concat(_.fill(Array(missingItemCount), null))
                    }

                    return(
                      <VirtGrid
                        outerRef={outerRef}
                        className="Grid"
                        width={width}
                        height={height}
                        rowCount={data.length}
                        rowHeight={320}
                        columnCount={columnCount}
                        columnWidth={columnWidth}
                        itemData={[
                          data,
                          { ...this.props },
                          this.loadSeries,
                        ]}
                        outerElementType={CustomScrollbarsVirtualList}
                        onScroll={({
                          scrollTop,
                        }) => {
                          this.setState({ currScroll: scrollTop });
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
                    onClick={() => this.loadAllCharacters(null)}
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
                        searchData={this.state.fullAMList}
                        selectedCats={[this.state.selectedCat]}
                        currCount={this.state.data.length}
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
                {this.state.showSeriesView ? (
                  <Grow
                    in={true}
                    style={{ transformOrigin: "0 0 0" }}
                    timeout={1000}
                  >
                    <SearchSeries
                      view={this.state.view}
                      uniData={this.state.uniData}
                      charData={this.state.charData}
                      width={this.state.width}
                      height={this.state.height}
                      closeView={this.closeView}
                    />
                  </Grow>
                ) : (
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
                      loadAllCharacters={this.loadAllCharacters}
                      width={this.state.width}
                      height={this.state.height}
                      closeCharacterView={this.closeCharacterView}
                    />
                  </Grow>
                )}
              </>
            )}
          </>
        )}
      </div>
    );
  }
}

SearchUniverses.propTypes = {
  classes: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  user: state.user,
});

export default connect(mapStateToProps)(withStyles(styles)(SearchUniverses));
