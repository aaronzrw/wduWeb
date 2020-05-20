import React, { Component, createRef, forwardRef } from 'react';
import watch from 'redux-watch'
import _ from 'lodash';
import { ThemeProvider as MuiThemeProvider, makeStyles, withStyles } from '@material-ui/core/styles'
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import { withRouter, Link } from 'react-router-dom'
import videoBg from '../media/WDUBGmp4.mp4'
import Loading from '../media/Loading.gif'

//MUI Componets
import {
    responsiveFontSizes,
} from "@material-ui/core";
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Snackbar from '@material-ui/core/Snackbar';
import Backdrop from '@material-ui/core/Backdrop';

//MUI Labs
import MuiAlert from '@material-ui/lab/Alert';

//Icons
import HomeIcon from '@material-ui/icons/Home';
import PageviewIcon from '@material-ui/icons/Pageview';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';

//Redux
import store from '../redux/store';

import Navbar from './Navbar';
import themeObject from '../util/theme';

var wduTheme = createMuiTheme(themeObject);
wduTheme = responsiveFontSizes(wduTheme);
const styles = theme => ({
    container: {
        display: 'flex',
    },
    root: {
        display: 'flex',
    },
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: '#fff',
    },
});

function Alert(props){
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

class Layout extends Component {
    static displayName = Layout.name;
    constructor(props) {
        super(props);
        this.state = {
            height: this.props.height,
            width: this.props.width,
            loading: false,
            open: false,
        };

        let uiReducerWatch = watch(store.getState, 'UI')
        store.subscribe(uiReducerWatch((newVal, oldVal, objectPath) => {
            this.setState({ ...newVal })
        }))

        // //let snackBarWatch = watch(store.getState, 'snackReducer')
        // store.subscribe(uiReducerWatch((newVal, oldVal, objectPath) => {
        //     console.log({...newVal})
        //     this.setState({ ...newVal })
        // }))
        this.handleDrawerToggle = this.handleDrawerToggle.bind(this)
    }

    handleDrawerToggle(){
      this.setState({ open: !this.state.open });
    };  

    componentDidMount() {
    }

    handleSnackClose() {
        store.dispatch({ type: "CloseSnack", flag: false })
    }

    render() {
        const { classes } = this.props;

        return (
            <MuiThemeProvider theme={wduTheme}>
            <Backdrop className={classes.backdrop} open={this.state.loading}>
                <img src={Loading} className="Loading" alt="Loading" />
            </Backdrop>

              <Navbar/>
              <main className={"mainView"}>  
                <>
                  <video autoPlay muted loop style={{ position: "absolute", width: "65%",
                    left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}>
                    <source src={videoBg} type="video/mp4" />
                  </video>
                  <div style={{height:"100%", width:"100%", position:"relative", zIndex:"1"}}>
                    {this.props.children}
                  </div>
                </>
              </main>

                {/*<Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    open={this.state.snackbarObj.flag}
                    autoHideDuration={4000}
                    onClose={this.handleSnackClose}

                >
                    <Alert severity={this.state.snackbarObj.snacktype}>
                        {this.state.snackbarObj.msg}
                    </Alert>
                </Snackbar>*/}
            </MuiThemeProvider>
        );
    }
}

Layout.propTypes = {
    classes: PropTypes.object.isRequired,
    UI: PropTypes.object.isRequired
};

   
const mapStateToProps = (state) => ({
    count: 0,
    UI: state.UI
  });

export default connect(mapStateToProps)(withStyles(styles)(Layout));