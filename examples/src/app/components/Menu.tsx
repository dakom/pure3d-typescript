import * as React from "react";
//import {Button, AppBar, ToolBar, IconButton, MenuIcon, Typography} from "material-ui";
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import Menu, {MenuItem} from "material-ui/Menu";
import AddIcon from '@material-ui/icons/Add';
import SwipeableDrawer from 'material-ui/SwipeableDrawer';
import MenuIcon from '@material-ui/icons/Menu';
import {withRouter} from "react-router-dom";
import HomeIcon from '@material-ui/icons/Home';
import blue from 'material-ui/colors/blue';

const topStyles = {
    appBar: {
        background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    },
    root: {
        flexGrow: 1,
    },
    flex: {
        flex: 1,
    },
    menuButton: {
        background: 'primary',
        marginLeft: -12,
        marginRight: 20,
    },
    repoButton: {
        background: 'sandybrown',
        color: "white"
    },
    link: {
        color: 'white'
    },
};

const PopupMenu = (props) => {
    const {classes, items, anchorEl, handlePopupMenu, handleSelected, visible} = props;

    return <Menu 
        id="model-menu" 
        open={visible} 
        anchorEl={anchorEl} 
        getContentAnchorEl={null}
        onClose={() => handlePopupMenu(null)}
        anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
    >

        {items.map(([label, key]) =>
            <MenuItem key={key} onClick={() => handleSelected(key) }>{label}</MenuItem>
        )}

    </Menu>; //console.log(Menu);
    
}

const PopupMenuButton = (props) => {
    const {label,items,menuKey, handlePopupMenu, List, classes, handleSelected, selectedMenu} = props;
    return (
        <div>
            <Button 
                onClick={evt => handlePopupMenu([menuKey, evt.currentTarget])}
                className={classes.menuButton} 
                color="secondary"
                variant="raised"
                aria-label="Menu"
            >
                <Typography variant="title" color="inherit" className={classes.flex}>
                    {label}
                </Typography>
            </Button>
            <PopupMenu 
                items={items}
                visible={selectedMenu && selectedMenu[0] === menuKey ? true : false}
                handleSelected={handleSelected} 
                handlePopupMenu={handlePopupMenu} 
                anchorEl={selectedMenu ? selectedMenu[1] : null} 
            />
        </div>
    )
}

const _NavBar = (props) => {
    const {classes, buttons, alertMessage, onHome} = props;
    return ( 
                    <AppBar position="static" className={classes.appBar}>
                
                        <Toolbar>
                            <Button onClick={onHome}>
                                <HomeIcon color="primary" />
                            </Button>
                            {buttons.map(({label, items}) => {
                              return <PopupMenuButton key={label} menuKey={label} {...props} items={items} label={label} /> 
                            })}
                            
                            <Typography variant="title" color="inherit" className={classes.flex}>
                                Pure3D Tests 
                            </Typography>
                            {alertMessage && 
                                <Button 
                                    className={classes.repoButton} 
                                    variant="raised" 
                                    onClick={() => alert(alertMessage)}
                                >
                                    <b>Notes</b>
                                </Button>
                            }
                            <Button 
                                className={classes.repoButton} 
                                variant="raised" 
                                onClick={() => document.location.href = "https://github.com/dakom/pure3d"}
                            >
                                <b>Github Repo</b>
                            </Button>
                        </Toolbar>
                    
                    </AppBar>    
                )
}

const NavBar = withStyles(topStyles) (_NavBar);


export class _TopMenu extends React.Component<{history, basePage, buttons, alertMessage}, any> {
    constructor(props) {
        super(props);
        this.state = {selectedMenu: null, drawer: true};
    }
    
    render() {

        const openButton = !this.state.drawer 
            ? <div style={{marginLeft: "10px", marginTop: "10px"}}>
                <Button color="inherit" variant="fab" 
                    onClick={() => this.setState({drawer: true})}
                >
                    <MenuIcon />
                </Button>
               </div>
               
            : null;

       return ( 
            <div>
                {openButton} 

                <SwipeableDrawer
                    anchor="top"
                    open={this.state.drawer}
                    onClose={() => this.setState({drawer: false})}
                    onOpen={() => this.setState({drawer: true})}
                >

                    <NavBar
                        onHome={() => this.props.history.push('/')}
                        buttons={this.props.buttons}
                        alertMessage={this.props.alertMessage}
                        selectedMenu={this.state.selectedMenu} 
                        handlePopupMenu={selectedMenu => 
                            this.setState({ selectedMenu }) 
                        } 
                        handleSelected={sel => {
                            this.props.history.push(`/${this.props.basePage}/${sel}`); 
                            this.setState({selectedMenu: null, drawer: false});
                        }}
                    />
                </SwipeableDrawer>
            </div>
       ) 
    }
}

export const TopMenu = withRouter(_TopMenu);
