import * as React from "react";
import * as ReactDOM from "react-dom";
import {HashRouter as Router,withRouter, Switch, Route, Link } from "react-router-dom";
import {Home} from "./components/Home";
import {Demo} from "./components/Demo";
import "./Main.css";

export const buildMode = process.env['NODE_ENV'];
export const buildVersion =  process.env['BUILD_VERSION'];
export const isProduction = buildMode === "production" ? true : false;
export const AppContext = React.createContext({buildMode, buildVersion, isProduction });

console.log(`%cPure3D v${buildVersion} (${buildMode} mode)`, 'color: #4286f4; font-size: large; font-family: "Comic Sans MS", cursive, sans-serif');

const _Demo = props => (
    <Demo 
        menuOptions={{
                ibl: true,
                //ibl: false,
                //lights: true,
                lights: false,
                bakedCamera: true
        }}
       
        {...props}
    />
)

const App = () => {
    return (
        <AppContext.Provider value={{buildMode, buildVersion, isProduction}}>
	<Router>
		<Switch>
                       <Route exact path="/" component={Home} /> 
			<Route path="/:section/:scene?" component={_Demo} />
		</Switch>
	</Router>
        </AppContext.Provider>
    )
}

ReactDOM.render(<App />, document.getElementById("app"));
