import * as React from "react";
import * as ReactDOM from "react-dom";
import {HashRouter as Router,withRouter, Switch, Route, Link } from "react-router-dom";
import {Gltf} from "./demos/gltf/Gltf-Main";
import {Basic} from "./demos/basic/Basic-Main";
import Button from "material-ui/Button";
import { withStyles } from 'material-ui/styles';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import "./Main.css";
export const buildMode = process.env['NODE_ENV'];
export const buildVersion =  process.env['BUILD_VERSION'];
export const isProduction = buildMode === "production" ? true : false;
export const AppContext = React.createContext({buildMode, buildVersion, isProduction });

console.log(`%cPure3D v${buildVersion} (${buildMode} mode)`, 'color: #4286f4; font-size: large; font-family: "Comic Sans MS", cursive, sans-serif');


const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
    button: {

    }
}) as any;

const Home = withRouter(withStyles(styles) (({classes, history}:{history: any, classes:any}) => (
    <div>
    <Typography align="center" variant="display3" gutterBottom>
        Pure3D Examples
    </Typography>
    <Grid container className={classes.root} >
            <Grid item xs={12}>
                <Grid container justify="center" spacing={16}> 
                    <Grid item> 
                        <Button size="large" variant="raised" color="primary" onClick={() => history.push("/gltf")}>GLTF</Button>
                    </Grid>
                    <Grid item>
                        <Button size="large" variant="raised" color="primary" onClick={() => history.push("/basic")}>Basic</Button>
                    </Grid>
                </Grid>
            </Grid>
    </Grid>
    </div>
)))

const App = () => {
    return (
        <AppContext.Provider value={{buildMode, buildVersion, isProduction}}>
	<Router>
		<Switch>
                       <Route exact path="/" component={Home} /> 
			<Route path="/gltf/:model?" component={Gltf} />
			<Route path="/basic/:scene?" component={Basic} />
		</Switch>
	</Router>
        </AppContext.Provider>
    )
}

ReactDOM.render(<App />, document.getElementById("app"));
