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
import { FormControl, FormGroup, FormControlLabel } from 'material-ui/Form';
import Checkbox from 'material-ui/Checkbox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import Select from 'material-ui/Select';
import Input, {InputLabel} from "material-ui/Input";

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

const _TopNavBar = (props:any) => {
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

const TopNavBar = withStyles(topStyles) (_TopNavBar) as any;


export class _TopMenu extends React.Component<{history, basePage, buttons, alertMessage, menuOptions, onOptions}, any> {
    constructor(props) {
        super(props);
       
        const drawer = props.match.params.scene
            ?   false
            :   true;

        this.state = {selectedMenu: null, drawer};
    }
    
    render() {

        const {basePage, onOptions} = this.props;
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

                    <TopNavBar
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

                {basePage === "gltf" &&
                    <GltfMenu menuOptions={this.props.menuOptions} onOptions={this.props.onOptions} />
                }
                </SwipeableDrawer>
            </div>
       ) 
    }
}

export const TopMenu = withRouter(_TopMenu);


const _GltfMenu = ({menuOptions, classes }:{menuOptions: any, classes: any }) => {

    const handleCheckboxChange = name => event => menuOptions.onChange(Object.assign({}, menuOptions, {
        [name]: event.target.checked
    }));

    const handleSelectChange = name => event => menuOptions.onChange(Object.assign({}, menuOptions, {
        [name]: event.target.value
    }));

        return (
<Toolbar>
            <Typography variant="title" color="inherit" classes={{title: classes.title}} >                        
                Gltf Options:
            </Typography>
            
        <FormGroup row>

        <FormControlLabel
          control={
            <Checkbox
              checked={menuOptions.ibl}
              onChange={handleCheckboxChange("ibl")}
              />
          }
          label="IBL"
            />
        <FormControlLabel
          control={
            <Checkbox
              checked={menuOptions.lights}
              onChange={handleCheckboxChange('lights')}
              color="primary"
            />
          }
          label="Lights"
        />
        <FormControl>
                <Select
                    value={menuOptions.selectedCamera}
                    onChange={handleSelectChange('selectedCamera')}
                    input={<Input name="camera" id="camera-readonly" />}
                >
                <MenuItem value={-1}><em>Camera: Default / Manual</em></MenuItem>
                {menuOptions.cameras.map((camera, cameraIndex) => 
                    <MenuItem key={cameraIndex} value={cameraIndex}><em>Camera: {camera}</em></MenuItem>
                )}
                </Select>
        </FormControl>
            </FormGroup>
            </Toolbar>
        )
    }


export const GltfMenu = withStyles({
    title: {
        marginRight: "10px"
    }
}) (_GltfMenu) as any
