import React, { Component } from "react";
import watch from "redux-watch";
import axios from "axios";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
import _ from "lodash";
import lz from "lz-string";
import { getSearchData } from '../redux/actions/dataActions';

// MUI Stuff
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Grow from "@material-ui/core/Grow";
import Popover from "@material-ui/core/Popover";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";

import { FixedSizeGrid as VirtGrid, FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

import SearchTeams from "../components/SearchTeams";
import SearchUniverses from "../components/SearchUniverses";

// Redux stuff
import { connect } from "react-redux";
import store from "../redux/store";
import {
  SET_CURRENT_POLL,
  LOADING_DATA,
  LOADING_UI,
  STOP_LOADING_UI,
  SET_SEARCH_DATA,
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
});

export class search extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchItems: store.getState().data.searchItems,
      waifuList: store.getState().data.waifuList,
      loading: true,
      tabIndex: 1,
      view: "",
      viewSelected: false,
      cards: [
        {
          id: 1,
          name: "Anime/Manga",
          view: "Anime-Manga",
          raised: false,
          img:
            "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/73b4b114-acd6-4484-9daf-599a5af85479/d2xp0po-60c4012a-a71f-48bf-a560-4d8f90c7f95d.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzczYjRiMTE0LWFjZDYtNDQ4NC05ZGFmLTU5OWE1YWY4NTQ3OVwvZDJ4cDBwby02MGM0MDEyYS1hNzFmLTQ4YmYtYTU2MC00ZDhmOTBjN2Y5NWQucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.k24BMIyLR_76OgLMG_YL_TZV_IIHObYS8Kx4m5qq-Hk",
        },
        {
          id: 2,
          name: "Marvel",
          view: "Marvel",
          raised: false,
          img:
            "https://firebasestorage.googleapis.com/v0/b/waifudraftunlimited.appspot.com/o/Marvel%20Covers%2FStorm.jpg?alt=media&token=0fed365b-921d-4cb9-922c-fd0beec2784b",
        },
        {
          id: 3,
          name: "DC",
          view: "DC",
          raised: false,
          img:
            "https://firebasestorage.googleapis.com/v0/b/waifudraftunlimited.appspot.com/o/DC%20Covers%2Fwonderwoman.jpg?alt=media&token=dd8e28ea-c3b6-4b33-9382-96b67086e009",
        },
      ],
      width: this.props.width,
      height: this.props.height,
    };

    this.switchViews = this.switchViews.bind(this);
    this.closeView = this.closeView.bind(this);
    this.raiseCard = this.raiseCard.bind(this);

    let dataReducerWatch = watch(store.getState, 'data')
    store.subscribe(dataReducerWatch((newVal, oldVal, objectPath) => {
      console.log({...newVal})
      this.setState({ ...newVal })
    }))
  }

  async componentDidMount() {
    if (_.isEmpty(this.state.searchItems)) {
      store.dispatch({ type: LOADING_UI });
      getSearchData();
    }
  }

  async switchViews(view) {
    var cards = this.state.cards;
    cards.forEach((card) => {
      card.raised = false;
    });

    this.setState({ viewSelected: view, view, cards });
  }

  raiseCard(id, raised) {
    var cards = this.state.cards;
    var card = cards.filter((x) => x.id == id)[0];
    card.raised = raised;
    this.setState({ cards });
  }

  closeView() {
    this.setState({ viewSelected: false });
  }

  render() {
    var { classes } = this.props;
    return (
      <div style={{ height: "100%", width: "100%" }}>
        {this.state.viewSelected == false ? (
          <Grid
            container
            alignItems="center"
            justify="center"
            style={{ height: "100%" }}
          >
            <Grid item xs={12}>
              <Grid item xs={12}></Grid>
            </Grid>

            <Grid
              container
              justify="center"
              item
              xs={12}
              style={{ padding: "10px" }}
            >
              <Grid container alignItems="center" justify="center" item xs={6}>
                {this.state.cards.map((card, index) => {
                  var timeout = (index + 1) * 500;
                  return (
                    <Grow
                      key={card.id}
                      in={true}
                      style={{ transformOrigin: "0 0 0" }}
                      timeout={timeout}
                    >
                      <Grid container justify="center" item xs={3}>
                        <Card
                          raised={card.raised}
                          className={`${classes.card} ${
                            card.raised ? classes.cardRaised : ""
                          }`}
                          onMouseEnter={() => this.raiseCard(card.id, true)}
                          onMouseLeave={() => this.raiseCard(card.id, false)}
                        >
                          <CardActionArea
                            onClick={() => this.switchViews(card.view)}
                            style={{
                              backgroundImage: "url(" + card.img + ")",
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
                                backgroundColor: "rgba(0,0,0,.25)",
                                padding: "0px",
                              }}
                            >
                              <Typography
                                align="center"
                                style={{
                                  fontFamily: "Edo",
                                  fontSize: "30px",
                                  color: "white",
                                  position: "absolute",
                                  top: "50%",
                                  left: "50%",
                                  transform: "translate(-50%, -50%)",
                                }}
                                variant="h5"
                                component="h2"
                              >
                                {card.name}
                              </Typography>
                            </CardContent>
                          </CardActionArea>
                        </Card>
                      </Grid>
                    </Grow>
                  );
                })}
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Grid item xs={12}></Grid>
            </Grid>
          </Grid>
        ) : (
          <>
            <Grow in={true} style={{ transformOrigin: "0 0 0" }} timeout={1000}>
              {this.state.view == "Anime-Manga" ? (
                <SearchUniverses
                  searchData={this.state.searchItems.views[this.state.view].items}
                  tags={this.state.searchItems.views[this.state.view].tags}
                  view={this.state.view}
                  width={this.state.width}
                  height={this.state.height}
                  closeView={this.closeView}
                />
              ) : (
                <SearchTeams
                  searchData={this.state.searchItems.views[this.state.view].items}
                  tags={this.state.searchItems.views[this.state.view].tags}
                  view={this.state.view}
                  width={this.state.width}
                  height={this.state.height}
                  closeView={this.closeView}
                />
              )}
            </Grow>
          </>
        )}
      </div>
    );
  }
}

search.propTypes = {
  classes: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  user: state.user,
});

export default connect(mapStateToProps)(withStyles(styles)(search));
