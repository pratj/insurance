import React from 'react';
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import HomeIcon from '@material-ui/icons/Home';
import AssessmentIcon from '@material-ui/icons/Assessment';
import BusinessIcon from '@material-ui/icons/Business';
import LoyaltyIcon from '@material-ui/icons/Loyalty';
import InfoIcon from '@material-ui/icons/Info';
import { useHistory } from "react-router";
import ShoppingBasketIcon from '@material-ui/icons/ShoppingBasket';
 import useGeoLocation from '../geolocation/useGeoLocation'
 import "./MiniDrawer.css"
import { Button } from '@material-ui/core';

import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  footer: {
    width: 800,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
      alignItems: 'center',
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
}));

export default function MiniDrawer({RenderComponent, location}) {

  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
   const geoLocation= useGeoLocation();

  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const itemsList = [
    {
      text: "Home",
      icon: <HomeIcon/>,
      onClick: () => history.push("/")
    },
    {
      text: "Services",
      icon: <BusinessIcon/>,
      subMenu: [{
        text: "",
      icon: <BusinessIcon/>,
      text: "Services",
      icon: <BusinessIcon/>,
      }]
    },
    {
      text: "Partners",
      icon: <LoyaltyIcon/>
    },
    {
      text: "Products",
      icon: <ShoppingBasketIcon/>,
      onClick: () => history.push("/products")
    },
    {
      text: "About Us",
      icon: <InfoIcon/>
    }
  ]

  const locationData = location

  // const useStyles = makeStyles({
  //   ,
  // });
  const classesFooter = useStyles();
  const [value, setValue] = React.useState(0);
  
  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
        style={{ background: "gold" }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={clsx(classes.menuButton, {
              [classes.hide]: open,
            })}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h4" noWrap style={{cursor: 'pointer', fontFamily: 'Righteous, cursive',color: 'white', alignItems: 'center'}} onClick={() => history.push("/")} >
            {/* <img style={{width: "35px", height:"35px" }} src="https://www.freeiconspng.com/uploads/insurance-icon-10.png"/> */}
            <Button style={{borderRadius:"99999999px", backgroundColor:"#d1a515"}}><img src="favicon.ico" style={{width: "35px", height:"35px" }} /></Button>
            &nbsp;&nbsp;Insurance Bazaar
          </Typography>
        </Toolbar>
      </AppBar>
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
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </div>
        <Divider />
        <List>
          {itemsList.map((item) => {
            const {text, icon, onClick} = item
            return (
              <ListItem button key={text} onClick={onClick}>
                {icon && <ListItemIcon>{icon}</ListItemIcon>}
                <ListItemText primary={text}/>
              </ListItem>
            )
          })}
        </List>
      </Drawer>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        {typeof location.location.state === 'undefined' ? <RenderComponent/> : <RenderComponent locationData={location}/>}
        {/* <div>
          {
            geoLocation.loaded ? JSON.stringify(geoLocation): "Location data not available yet."
          }
        </div> */}
        
        
        
      </main>
      
    </div>
  );
}