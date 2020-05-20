import React, { Component, PureComponent, useCallback } from 'react'
import watch from 'redux-watch'
import axios from 'axios'
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import _ from 'lodash';

import useMediaQuery from '@material-ui/core/useMediaQuery';
import ListSubheader from '@material-ui/core/ListSubheader';
import { useTheme, makeStyles } from '@material-ui/core/styles';

import Loading from '../media/Loading.mp4'

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

import Grow from '@material-ui/core/Grow';
import Zoom from '@material-ui/core/Zoom';
import Slide from '@material-ui/core/Slide';

//labs
import Autocomplete from '@material-ui/lab/Autocomplete';

//icons
import SearchIcon from '@material-ui/icons/Search';
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { FixedSizeGrid as VirtGrid, FixedSizeList as List, VariableSizeList } from 'react-window';
import AutoSizer from "react-virtualized-auto-sizer";

import { Scrollbars } from 'react-custom-scrollbars';

// Redux stuff
import { connect } from 'react-redux';
import store from '../redux/store';
import {
  SET_POLL_WAIFUS,
    LOADING_DATA,
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
  returnFab: {
    position: 'absolute',
    bottom: '0',
    left: '0',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
  listbox: {
    boxSizing: 'border-box',
    '& ul': {
      padding: 0,
      margin: 0,
    },
  },
});

const CardItem = ({ data , columnIndex, rowIndex, style }) => {
  const props = data[1];
  const {classes} = props;
  const [raised, setRaised] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  if(data[0][rowIndex] == undefined || data[0][rowIndex][columnIndex] == undefined){
    return <></>
  }

  const card = data[0][rowIndex][columnIndex];
  
  const cardTitle = card == null ? '' : card.name.length >= 18 ? card.name.slice(0,18) + "..." : card.name
  const img = card == null ? '' : card.img != '' ? card.img : 'https://images-na.ssl-images-amazon.com/images/I/51XYjrkAYuL._AC_SY450_.jpg'


  const timeout = (columnIndex + 1) * 500;

  const selectCard = () => {
    console.log("click")
  }

  const raiseCard = (isRaised) => {
    setRaised(isRaised)
  }

  return(
    <>
      {
        card == null ?
          <></>
        :
        <Grow
          in={true}
          style={{ transformOrigin: '0 0 0' }}
          timeout = {timeout}
        >
          <Grid container alignItems="center" justify="center"  style={style}>
              <Card raised={raised} className={`${classes.card} ${raised ? classes.cardRaised : ""}`}
                onMouseEnter={() => raiseCard(true)} onMouseLeave={() => raiseCard(false)}>
                <CardActionArea onClick={() => selectCard()} style={{ backgroundImage: "url("+img+")",
                  backgroundPosition:"top", backgroundSize:"cover", width:"100%", height:"100%"}}>

                  <div style={{ height: "80%" }} />

                  <CardContent style={{ height: "20%", position:"relative", backgroundColor: "rgba(0,0,0,.5)", padding:"0px" }}>
                    {cardTitle.includes("...") ?
                        <Tooltip TransitionComponent={Zoom} title={card.name} placement="top" classes={{ tooltip: classes.tooltip }}>
                          <Typography align="center" style={{ fontFamily: "Edo", fontSize: "18px", color: "white", maxHeigt: "100%", width: "100%", margin: "auto",
                            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)"}} variant="h5" component="h2">
                              {cardTitle}
                          </Typography>
                        </Tooltip>
                      :                      
                        <Typography align="center" style={{ fontFamily: "Edo", fontSize: "18px", color: "white", maxHeigt: "100%", width: "100%", margin: "auto",
                          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)"}} variant="h5" component="h2">
                            {cardTitle}
                        </Typography>
                    }
                  </CardContent>
                </CardActionArea>
              </Card>
          </Grid>
        </Grow>
      }
    </>
  );
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

const LISTBOX_PADDING = 8; // px

function renderRow(props) {
  const { data, index, style } = props;
  return React.cloneElement(data[index], {
    style: {
      ...style,
      top: style.top + LISTBOX_PADDING,
    },
  });
}

const OuterElementContext = React.createContext({});

const OuterElementType = React.forwardRef((props, ref) => {
  const outerProps = React.useContext(OuterElementContext);
  return <div ref={ref} {...props} {...outerProps} />;
});

function useResetCache(data) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current != null) {
      ref.current.resetAfterIndex(0, true);
    }
  }, [data]);
  return ref;
}
// Adapter for react-window
const ListboxComponent = React.forwardRef(function ListboxComponent(props, ref) {
  const { children, ...other } = props;
  const itemData = React.Children.toArray(children);
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'), { noSsr: true });
  const itemCount = itemData.length;
  const itemSize = smUp ? 36 : 48;

  const getChildSize = (child) => {
    if (React.isValidElement(child) && child.type === ListSubheader) {
      return 48;
    }

    return itemSize;
  };

  const getHeight = () => {
    if (itemCount > 8) {
      return 8 * itemSize;
    }
    return itemData.map(getChildSize).reduce((a, b) => a + b, 0);
  };

  const gridRef = useResetCache(itemCount);

  return (
    <div ref={ref}>
      <OuterElementContext.Provider value={other}>
        <VariableSizeList
          itemData={itemData}
          height={getHeight() + 2 * LISTBOX_PADDING}
          width="100%"
          ref={gridRef}
          outerElementType={OuterElementType}
          innerElementType="ul"
          itemSize={(index) => getChildSize(itemData[index])}
          overscanCount={5}
          itemCount={itemCount}
        >
          {renderRow}
        </VariableSizeList>
      </OuterElementContext.Provider>
    </div>
  );
});

ListboxComponent.propTypes = {
  children: PropTypes.node,
};

const renderGroup = (params) => [
  <ListSubheader key={params.key} component="div">
    {params.key}
  </ListSubheader>,
  params.children,
];

const outerRef = React.createRef();

export class SearchFilters extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
          searchData: this.props.searchData,
          selectedCats: this.props.selectedCats,
          currCount: this.props.currCount,
          tags: this.props.tags,
          view: this.props.view,
          searchText: "",
          handleSeachTextChange: this.props.handleSeachTextChange,
          handleSeachSelectChange: this.props.handleSeachSelectChange
        };

        this.searchTextChange = this.searchTextChange.bind(this)
        this.searchTextSelect = this.searchTextSelect.bind(this)
    }

    componentDidMount(){

    }
    
    searchTextSelect(value){
      this.state.handleSeachTextChange(value)
      this.setState({ searchText: value })
    }

    searchTextChange(event){
      /* signal to React not to nullify the event object */
      event.persist();
      
      if (!this.debouncedFn) {
        this.debouncedFn =  _.debounce(() => {
          var value = event.target.value || "";
          
          this.state.handleSeachTextChange(value)
          this.setState({ searchText: value })
        }, 300);
      }
      this.debouncedFn();
    }

  render() {
    var {classes} = this.props;
    var {listbox} = classes;

    return (
      <div style={{height: "100%", width:"100%"}}>
        <Grid container justify="center">            
          <Grid container item xs={12}>
            <Autocomplete
              id="virtualize-demo"
              style={{width: "100%"}}
              disableListWrap
              freeSolo
              ListboxComponent={ListboxComponent}
              renderGroup={renderGroup}
              onChange={(event, value) => this.searchTextSelect(value)}
              options={this.state.searchData.map((option) => option.name)}
              renderInput={(params) => <TextField {...params} onChange={ (event,value) => this.searchTextChange(event) } variant="outlined" label="Search By Name" />}
              renderOption={(option) => <Typography noWrap>{option}</Typography>}
            />
          </Grid>
            
            {/* {
              this.state.tags.length > 0 ?
              <Grid container justify="center" item xs={12}>
                <ExpansionPanel>
                  <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <Typography className={classes.heading}>Team Names</Typography>
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails>
                    <AutoSizer>
                      {({height, width}) => (
                        <VirtGrid 
                          columnCount={this.state.columnCount}
                          columnWidth={this.state.columnWidth}
                          height={height}
                          rowCount={this.state.rowCount}
                          rowHeight={this.state.rowHeight}
                          width={width}
                          itemData={{data: this.state.data, props: {...this.props}}}
                          outerElementType={CustomScrollbarsVirtualList}
                          outerRef={outerRef}
                          onScroll={({ scrollOffset, scrollUpdateWasRequested }) => {
                            if (scrollUpdateWasRequested) {
                              console.log(
                                "TODO: check scroll position",
                                scrollOffset,
                                outerRef.current.scrollHeight
                              );
                            }
                          }}
                        >
                          {CardItem}
                        </VirtGrid>
                      )}
                    </AutoSizer>
                  </ExpansionPanelDetails>
                </ExpansionPanel>
              </Grid>
              :
              <></>
            } */}
            
          <Grid container item xs={12} justify="center" style={{ width: "100%", position: "absolute", bottom: "0", left: "0px"}}>
            <Typography style={{ textAlign: "center", fontFamily: "Edo", fontSize: "30px"}}>
              {this.state.currCount + " Results"}
            </Typography>
          </Grid>
        </Grid>
      </div>
    )
  }
}

SearchFilters.propTypes = {
  classes: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
};
  
const mapStateToProps = (state) => ({
  user: state.user,
});
  
export default connect(mapStateToProps)(withStyles(styles)(SearchFilters));
