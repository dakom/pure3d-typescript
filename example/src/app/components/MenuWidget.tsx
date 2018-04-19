import * as React from "react";
import {MODEL_LIST_SIMPLE, MODEL_LIST_COMPLEX, MODEL_LIST_PBR1, MODEL_LIST_PBR2, MODEL_LIST_FEATURETEST, ModelContext} from "../models/Models";
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
    }
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

        {items.map(key =>
            <MenuItem key={key} onClick={() => handleSelected(key) }>{key}</MenuItem>
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
const alertMessage =
`Different formats, where available, are set via adding or removing "_BINARY" and "_EMBEDDED" in the hash url.\n\n`
+ `For example, the following are all different formats of the same GLTF:\n\n`
+ `#DAMAGED_HELMET\n#DAMAGED_HELMET_EMBEDDED\n#DAMAGED_HELMET_BINARY\n\n`
+ `Also, some models are intended to be moved around, others are not.\n\n`
+ `So if the camera "pops" or feels off, know that it's in the domain of the *demo* code for not handling this case.\n`
+ `It is not a bug in the renderer itself :D`;

const _NavBar = (props) => {
    const {classes} = props;
    return ( 
        <ModelContext.Consumer>
        {({model, changeModel}) => 
            {// <Dropdown label="Choose a Model" options={Object.keys(MODEL) as Array<MODEL>} onSelectedItem={changeModel} initialItem={model} />}

                return (
                    <AppBar position="static" className={classes.appBar}>
                        <Toolbar>
                            <PopupMenuButton menuKey="1" {...props} items={MODEL_LIST_SIMPLE} label="Simple"/>
                            <PopupMenuButton menuKey="2" {...props} items={MODEL_LIST_COMPLEX} label="Complex" />
                            <PopupMenuButton menuKey="3" {...props} items={MODEL_LIST_PBR1} label="PBR Set 1"/>
                            <PopupMenuButton menuKey="4" {...props} items={MODEL_LIST_PBR2} label="PBR Set 2" />
                            <PopupMenuButton menuKey="5" {...props} items={MODEL_LIST_FEATURETEST} label="Feature Test"/>
                            <Typography variant="title" color="inherit" className={classes.flex}>
                                Pure3D Tests (samples from <a className={classes.link} href="http://github.com/khronosGroup/glTF-Sample-Models">Khronos</a>)
                            </Typography>
                            <Button 
                                className={classes.repoButton} 
                                variant="raised" 
                                onClick={() => alert(alertMessage)}
                            >
                                <b>Notes</b>
                            </Button>
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
        }   
        </ModelContext.Consumer>
    );
}

const NavBar = withStyles(topStyles) (_NavBar);


export class MenuWidget extends React.Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {selectedMenu: null, drawer: false};
    }
    
    render() {
        return <div> 
            {!this.state.drawer &&
                
                <div style={{marginLeft: "10px", marginTop: "10px"}}>
                            <Button
                            color="inherit"               
                variant="fab" 
                                onClick={() => this.setState({drawer: true})}
                            >
                <MenuIcon />
                </Button>
                </div>
            }
            <SwipeableDrawer
            anchor="top"
          open={this.state.drawer}
          onClose={() => this.setState({drawer: false})}
          onOpen={() => this.setState({drawer: true})}
        >
            
            <NavBar 
            selectedMenu={this.state.selectedMenu} 
            handlePopupMenu={selectedMenu => 
                this.setState({ selectedMenu }) 
            } 
            handleSelected={sel => {
                this.props.handleSelected(sel);
                this.setState({selectedMenu: null, drawer: false});
            }}
            />
            </SwipeableDrawer>
        </div>
    }
}
