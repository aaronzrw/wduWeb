import React, { Component, PureComponent, useCallback } from "react";
import _ from 'lodash';

// MUI Stuff
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import withStyles from "@material-ui/core/styles/withStyles";

import Grow from "@material-ui/core/Grow";
import Zoom from "@material-ui/core/Zoom";
import Slide from "@material-ui/core/Slide";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";

import { FixedSizeGrid as VirtGrid, FixedSizeList as List } from 'react-window';
import AutoSizer from "react-virtualized-auto-sizer";
import { Scrollbars } from 'react-custom-scrollbars';

import { useTheme } from '@material-ui/core/styles';

import AMCharDetails from '../components/AMCharDetails'
import ComicCharDetails from '../components/ComicCharDetails'
import CharacterThumbNail from '../components/CharacterThumbNail'
import { buyWaifu } from '../redux/actions/dataActions'

// Redux stuff
import watch from 'redux-watch'
import { connect } from 'react-redux';
import store from '../redux/store';
import {
    SET_POLL_WAIFUS,
    LOADING_DATA,
  } from '../redux/types';

const styles = (theme) => ({
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
});

const CardItem = ({ data , columnIndex, rowIndex, style }) => {
    if(data[0][rowIndex] == undefined || data[0][rowIndex][columnIndex] == undefined)
      return <></>
  
      const card = data[0][rowIndex][columnIndex];
      const selectedCard = data[1];
  
    return <CharacterThumbNail key={card.link} card={card} style={style} columnIndex={columnIndex} selectCard={selectedCard}/>
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
export class Shop extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            userInfo: store.getState().user.credentials,
            waifus: store.getState().data.waifuList.filter(x => x.husbandoId == "Shop"),
            card: null,
        };

        let dataReducerWatch = watch(store.getState, 'data')
        //let snackBarWatch = watch(store.getState, 'snackReducer')
        store.subscribe(dataReducerWatch((newVal, oldVal, objectPath) => {
            var shopWaifus = newVal.waifuList.filter(x => x.husbandoId == "Shop")
            this.setState({ waifus: shopWaifus })
        }))

        this.buyWaifu = this.buyWaifu.bind(this);
        this.selectedCard = this.selectedCard.bind(this);
        this.closeCardDetails = this.closeCardDetails.bind(this);
    }

    componentDidMount() {
    }

	selectedCard(card){
        this.setState({card})
		console.log(card)
	}
	closeCardDetails(){
		this.setState({ card: null })
	}
    async buyWaifu(){
        await buyWaifu(this.state.card);
        this.setState({card: null})
    }

    render() {
        var {classes} = this.props;
        return (
            <div style={{height: "100%", width:"100%"}}>
                <Grid container style={{height: "100%"}}>
                    <Grid container item xs={12} style={{height:"calc(100% - 50px)"}}>
                        <AutoSizer>
                            {({height, width}) =>
                            {
                                var columnWidth = 220;
                                var columnCount = Math.floor(width / columnWidth)
                                if((width/columnCount) > columnCount)
                                  columnWidth = (width/columnCount)
              
                                var data = _.chunk(_.cloneDeep(this.state.waifus), columnCount);
                                if(!_.isEmpty(data)){
                                  var missingItemCount = columnCount - data[data.length - 1].length;
                                  data[data.length - 1].concat(_.fill(Array(missingItemCount), null))
                                }
                                
                                return (
                                  <>
                                    {data.length > 0 ?
                                        
                                        <VirtGrid
                                            outerRef={outerRef}
                                            className="Grid"
                                            width={width}
                                            height={height}
                                            rowCount={data.length}
                                            rowHeight={320}
                                            columnCount={columnCount}
                                            columnWidth={columnWidth}
                                            itemData={[ data, this.selectedCard, {...this.props} ]}
                                            outerElementType={CustomScrollbarsVirtualList}
                                            onScroll={({scrollTop}) => {
                                                this.currScroll = scrollTop;
                                            }}
                                        >
                                            {CardItem}
                                        </VirtGrid>
                                    :
                                        <Grid container style={{height: `${height}px`, width: `${width}px`}}>
                                            <Grid container alignItems="center" justify="center"  item xs={12} style={{height: "100%", width:"100%"}}>
                                                <Typography align="center" style={{fontFamily:"Edo", fontSize:"90px", color:"white"}}>No Waifus To Purchase</Typography>
                                            </Grid>
                                        </Grid>
                                    }
                                    </>
                                )
                            }}
                        </AutoSizer>
                    </Grid>

                    <Grid container item xs={12} style={{height:"50px"}}>

                    </Grid>
                </Grid>
                
				{
					this.state.card ?
						<Grow
							in={true}
							style={{ transformOrigin: '0 0 0' }}
							timeout={500}
						>
							<Grid container alignItems="center" justify="center" style={{height: "100%", position: "absolute", top:"0", left: "0", zIndex:"10", backgroundColor: "#00000091" }} >
								<ClickAwayListener onClickAway={() => this.closeCardDetails()}>
									<Grid item xs={10} style={{ height: "75%" }}>
										<Grid container item xs={12} style={{ height:"100%" }}>
											<Grid item xs={4} style={{ height:"100%" }}>
												<Paper style={{backgroundImage: "url("+this.state.card.img+")", backgroundPosition:"top", backgroundSize:"cover",
													height: "100%",width:"100%",borderRadius: "20px 0px 0px 20px", display:"flex", alignItems:"flex-end", justifyContent:"center"}}>

                                                    {this.state.userInfo.points > (this.state.card.rank * 5) ? <Button variant="contained" color="primary" onClick={() => this.buyWaifu()} className={classes.button}>{`Buy - ${this.state.card.rank * 5}`}</Button> : <></>}
                                                </Paper>
											</Grid>
											
											<Grid item xs={8}>
												<Paper style={{borderRadius: "0px 20px 20px 0px"}} className="cardDetails">
													{this.state.card.type == "Anime-Manga" ? <AMCharDetails card={this.state.card}/> : <ComicCharDetails card={this.state.card} />}
												</Paper>
											</Grid>
										</Grid>
									</Grid>
								</ClickAwayListener>
							</Grid>
						</Grow>
					: <></>
				}
            </div>
        )
    }
}

export default (withStyles(styles)(Shop));
