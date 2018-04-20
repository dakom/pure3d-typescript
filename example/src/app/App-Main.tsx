import * as React from "react";
import * as ReactDOM from "react-dom";
import {MenuWidget} from "./components/MenuWidget";
import {GltfWidget} from "./components/GltfWidget";

import {getModel, ModelInfo} from "./models/Models";
import "./Main.css";

const buildMode = process.env['NODE_ENV'];
const buildVersion = process.env['BUILD_VERSION'];
export const isProductionBuild = buildMode === "production" ? true : false;

console.log(`%cPure3D v${buildVersion} (${buildMode} mode)`, 'color: #4286f4; font-size: large; font-family: "Comic Sans MS", cursive, sans-serif');


export const ModelContext = (React as any).createContext()

class App extends React.Component<{}, {modelInfo:ModelInfo}> {

  constructor(props:{}) {
    super(props);

    const loc = location.hash.replace('#', '');
    this.state = {modelInfo:  getModel(loc)}

    this.changeModel = this.changeModel.bind(this);
  }

  changeModel(modelName:string) {
    const modelInfo = getModel(modelName);
    if(modelInfo) {
        if(history.replaceState) {
            history.replaceState(null, null, '#' + modelName);
        }
        else {
            location.hash = '#' + modelName;
        }
    }


    this.setState({modelInfo});
  }

  render() {
    return (
        <ModelContext.Provider value={{modelInfo: this.state.modelInfo, changeModel: this.changeModel, isProductionBuild}}>
          <MenuWidget />
          <GltfWidget />
        </ModelContext.Provider>
    );
  }
}


ReactDOM.render(<App />, document.getElementById("app"));
