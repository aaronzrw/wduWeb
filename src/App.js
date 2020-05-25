import React, { Component, createRef, forwardRef } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { withRouter, browserHistory } from 'react-router';
import watch from 'redux-watch';
import firebase from 'firebase/app'
import 'firebase/auth'

import axios from 'axios';
import _ from "lodash";
import lz from "lz-string";
import jwtDecode from 'jwt-decode';
import PropTypes from 'prop-types';
import Loading from './media/Loading.gif'

// Redux
import { Provider, connect } from 'react-redux';
import store from './redux/store';
import { SET_UNAUTHENTICATED,
  UNSUB_SNAPSHOTS,
  LOADING_DATA,
  LOADING_UI,
  STOP_LOADING_UI,
  SET_SEARCH_DATA } from './redux/types';

import { logoutUser, getUserData } from './redux/actions/userActions';

//MUI
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { ThemeProvider as MuiThemeProvider, makeStyles, withStyles } from '@material-ui/core/styles';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import Backdrop from '@material-ui/core/Backdrop';

// Components
import themeObject from './util/theme';

//pages
import './App.css';
import Home from './pages/home';
import Profile from './pages/profile';
import LoginSignUp from './pages/LoginSignUp';
import Trade from './pages/trade';
import Shop from './pages/shop';
import Search from './pages/search';
import Gauntlet from './pages/gauntlet';

import Layout from './components/Layout';

const theme = createMuiTheme(themeObject);

const styles = theme => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
});

axios.defaults.baseURL = 'https://us-central1-waifudraftunlimited.cloudfunctions.net/api';
//axios.defaults.baseURL = 'http://localhost:5000';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { width: 0, height: 0, loading: true, authenticated: false };
    firebase.auth().onAuthStateChanged(async function(authUser) {
      if(authUser != null){
        localStorage.setItem('authUser', JSON.stringify(authUser));
        getUserData(await authUser.getIdToken(), authUser.uid)
      }
      else{
        store.dispatch({ type: SET_UNAUTHENTICATED });
        store.dispatch({ type: UNSUB_SNAPSHOTS })
      }
    });

    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    
    let userReducerWatch = watch(store.getState, 'user')
    store.subscribe(userReducerWatch((newVal, oldVal, objectPath) => {
      this.setState({ ...newVal })
    }))
  }
  
  async componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
  }
  
  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
   }
  
  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  render() {
    const { classes } = this.props;
    var width = this.state.width - 73;
    var height = this.state.height;
    return (
      <>
        <MuiThemeProvider theme={theme}>
          {
          this.state.loading ?
            <Backdrop className={classes.backdrop} open={true}>
              <img src={Loading} className="Loading" alt="Loading" />
            </Backdrop>
          :
            <div style={{ height:this.state.height, width:this.state.width, position: "absolute", top: "0", left: "0" }}>                    
              {
                !this.state.authenticated ?
                  <LoginSignUp />
                :
                  <Layout>
                    <Route exact path="/" render={(props) => <Home {...props} height={height} width={width}  />}/>
                    <Route exact path="/Login" render={(props) => <LoginSignUp {...props} height={height} width={width}  />}/>
                    <Route exact path="/profile" render={(props) => <Profile {...props} height={height} width={width}  />}/>
                    <Route exact path="/search" render={(props) => <Search {...props} height={height} width={width}  />}/>
                    <Route exact path="/shop" render={(props) => <Shop {...props} height={height} width={width}  />}/>
                    <Route exact path="/trade" render={(props) => <Trade {...props} height={height} width={width}  />}/>
                    <Route exact path="/gauntlet" render={(props) => <Gauntlet {...props} height={height} width={width}  />}/>
                  </Layout>
              }
            </div>
        }
        </MuiThemeProvider>
      </>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  UI: PropTypes.object.isRequired
};

 
const mapStateToProps = (state) => ({
  count: 0,
  user: state.user,
  UI: state.UI
});

export default withRouter(connect(mapStateToProps)(withStyles(styles)(App)));
