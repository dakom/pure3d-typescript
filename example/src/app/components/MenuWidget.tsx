import * as React from "react";
import {MODEL, ModelContext} from "./Models";
//import {Button, AppBar, ToolBar, IconButton, MenuIcon, Typography} from "material-ui";
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Menu, {MenuItem} from "material-ui/Menu";
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
        marginLeft: -12,
        marginRight: 20,
    },
    link: {
        color: 'white'
    }
};

const menuStyles = {
}

const _PopupMenu = (props) => {
    const {classes, anchorEl, handlePopupMenu, handleSelected} = props;
    return <Menu 
        id="model-menu" 
        open={anchorEl ? true : false} 
        anchorEl={anchorEl} 
        onClose={() => handlePopupMenu(null)}
    >

        {(Object.keys(MODEL) as Array<MODEL>).map(key =>
            <MenuItem key={key} onClick={() => handleSelected(key) }>{key}</MenuItem>
        )}

    </Menu>; //console.log(Menu);
    
}

const PopupMenu = withStyles(menuStyles) (_PopupMenu);

const _NavBar = (props) => {
    console.log(props);

    const {classes, anchorEl, handlePopupMenu, handleSelected} = props;
    return ( 
        <ModelContext.Consumer>
        {({model, changeModel}) => 
            {// <Dropdown label="Choose a Model" options={Object.keys(MODEL) as Array<MODEL>} onSelectedItem={changeModel} initialItem={model} />}

                return (
                    <AppBar position="static" className={classes.appBar}>
                        <Toolbar>
                            <IconButton onClick={handlePopupMenu} className={classes.menuButton} color="inherit" aria-label="Menu">
                                <MenuIcon />
                            </IconButton>
                            <Typography variant="title" color="inherit" className={classes.flex}>
                                Pure3D Tests (samples from <a className={classes.link} href="http://github.com/khronosGroup/glTF-Sample-Models">Khronos Repo</a>)
                            </Typography>
                            <Button color="inherit" onClick={() => document.location.href = "https://github.com/dakom/pure3d"}>View Source</Button>
                        </Toolbar>
                    <PopupMenu handleSelected={handleSelected} handlePopupMenu={handlePopupMenu} anchorEl={anchorEl} />
                    
                    </AppBar>    
                )
            }
        }   
        </ModelContext.Consumer>
    );
}

const NavBar = withStyles(topStyles) (_NavBar);

export class MenuWidget extends React.Component<any, any> {
    constructor(props) {
        super(props);
        console.log(props);
        this.state = {anchorEl: null};
    }
    
    render() {
        return <NavBar 
            anchorEl={this.state.anchorEl} 
            handlePopupMenu={evt => 
                this.setState({
                    anchorEl: evt ? evt.currentTarget : null
                }) 
            } 
            handleSelected={sel => {
                this.props.handleSelected(sel);
                this.setState({anchorEl: null});
            }}
            />
        
    }
}
