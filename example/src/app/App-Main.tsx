import * as React from "react";
import * as ReactDOM from "react-dom";
import {MenuWidget} from "./components/MenuWidget";
import {GltfWidget} from "./components/GltfWidget";

import {MODEL_LIST_ALL} from "./models/Models";
import "./Main.css";

const buildMode = process.env['NODE_ENV'];
const buildVersion = process.env['BUILD_VERSION'];
export const isProductionBuild = buildMode === "production" ? true : false;

console.log(`%cPure3D v${buildVersion} (${buildMode} mode)`, 'color: #4286f4; font-size: large; font-family: "Comic Sans MS", cursive, sans-serif');


export const ModelContext = (React as any).createContext()

class App extends React.Component<{}, {model:string}> {

  constructor(props:{}) {
    super(props);

    const loc = location.hash.replace('#', '');
    if(MODEL_LIST_ALL.indexOf(loc) !== -1) {
      this.state = {model: loc };
    } else {
      this.state = {model: null};
    }

    this.changeModel = this.changeModel.bind(this);
  }

  changeModel(model:string) {
    if(model) {
        if(history.replaceState) {
            history.replaceState(null, null, '#' + model);
        }
        else {
            location.hash = '#' + model;
        }
    }
    this.setState({model});
  }

  render() {
    return (
        <ModelContext.Provider value={{model: this.state.model, changeModel: this.changeModel, isProductionBuild}}>
          <GltfWidget />
          <MenuWidget />
        </ModelContext.Provider>
    );
  }
}


ReactDOM.render(<App />, document.getElementById("app"));
