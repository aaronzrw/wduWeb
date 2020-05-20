import React, { Component, createRef, forwardRef } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { connect, useSelector } from 'react-redux'
import { withRouter, Link } from 'react-router-dom'

import {logoutUser} from '../redux/actions/userActions'

//MUI Componets
import clsx from 'clsx';
import { makeStyles, withStyles, useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';
import Badge from '@material-ui/core/Badge';
import Avatar from '@material-ui/core/Avatar';
import Tooltip from '@material-ui/core/Tooltip';
import Popover from '@material-ui/core/Popover';
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Typography from '@material-ui/core/Typography';

import battleIcon from '../media/battle.png'

//Icons
import HomeIcon from '@material-ui/icons/Home';
import PageviewIcon from '@material-ui/icons/Pageview';
import MenuIcon from '@material-ui/icons/Menu';
import LocalAtmIcon from '@material-ui/icons/LocalAtm';
import SwapHorizIcon from '@material-ui/icons/SwapHoriz';

const drawerWidth = 240;
const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
  },
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButtonCenter: {
    margin: "auto"
  },
  menuButton: {
    marginRight: 36,
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9) + 1,
    },
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  avatar: {
    width: "40px",
    height: "40px",
  },
  popover: {
    pointerEvents: 'none',
  },
  paper: {
    padding: theme.spacing(1),
  },
  List: {
    paddingLeft: "0px",
    paddingRight: "0px",
  },
  ListItemIcon: {
    minWidth: "72px",
    display: "flex",
    justifyContent: "center"
  }
}));

const SmallAvatar = withStyles((theme) => ({
  root: {
    width: 20,
    height: 20,
    border: `2px solid ${theme.palette.background.paper}`,
  },
}))(Avatar);

export default function Navbar() {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false)
  const [anchorEl, setAnchorEl] = React.useState(null);

  const user = useSelector(state => state.user.credentials)

  const handleDrawerToggle = () =>{
    setOpen(!open);
  };

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };
  const popOverOpen = Boolean(anchorEl);

  return (
    <div>
      <CssBaseline />

      <Drawer
        variant="permanent"
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        })}
        classes={{
          paper: clsx({
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          }),
        }}
      >
        <div className={classes.toolbar}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            className={clsx({
              [classes.menuButton]: open,
              [classes.menuButtonCenter]: !open
            })}
          >
            <MenuIcon />
          </IconButton>
        </div>

        <Divider />
        <List>
          {/* Home */}
          <Link to={"/"}>
            <ListItem button className={classes.List}>
              <ListItemIcon className={classes.ListItemIcon}>
                <HomeIcon/>
              </ListItemIcon>
              <ListItemText primary={"Home"} />
            </ListItem>
          </Link>
          
          <Link to={"/search"}>
            <ListItem button className={classes.List}>
              <ListItemIcon className={classes.ListItemIcon}>
                <PageviewIcon/>
              </ListItemIcon>
              <ListItemText primary={"Search"} />
            </ListItem>
          </Link>
          
          <Link to={"/shop"}>
            <ListItem button className={classes.List}>
              <ListItemIcon className={classes.ListItemIcon}>
                <LocalAtmIcon/>
              </ListItemIcon>
              <ListItemText primary={"Shop"} />
            </ListItem>
          </Link>

          <Link to={"/trade"}>
            <ListItem button className={classes.List}>
              <ListItemIcon className={classes.ListItemIcon}>
                <SwapHorizIcon/>
              </ListItemIcon>
              <ListItemText primary={"Trade"} />
            </ListItem>
          </Link>
        
          <Link to={"/gauntlet"}>
            <ListItem button className={classes.List}>
              <ListItemIcon className={classes.ListItemIcon}>
                <img src={battleIcon} width="24px" height="24px"/>
              </ListItemIcon>
              <ListItemText primary={"Gauntlet"} />
            </ListItem>
          </Link>
        </List>
        
        <div style={{display: "flex", flex:1}} />

        <List style={{marginBottom:"15px"}}>
          <Link to={"/profile"}>
            <ListItem button className={classes.List} 
             /*  aria-owns={open ? 'mouse-over-popover' : undefined}
              aria-haspopup="true" */
              /* onMouseEnter={handlePopoverOpen} */
            >
              <ListItemIcon className={classes.ListItemIcon}>
                <Avatar alt={user.userName} src={user.img} className={classes.avatar} />
              </ListItemIcon>
              <ListItemText primary={"Profile"} />
            </ListItem>
          </Link>
        </List>
        
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handlePopoverClose}
          anchorOrigin={{
            vertical: 'center',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'center',
            horizontal: 'left',
          }}
          MenuListProps={{ onMouseLeave: handlePopoverClose }}
        >
          <MenuItem onClick={handlePopoverClose}>Profile</MenuItem>
          {/*<MenuItem onClick={handlePopoverClose}>My account</MenuItem>*/} 
          <MenuItem onClick={logoutUser}>Logout</MenuItem>
        </Menu>
      </Drawer>
    </div>
  )
}
