import * as React from "react";
import * as ReactDOM from "react-dom";
import {MenuWidget} from "./components/MenuWidget";
import {GltfWidget} from "./components/GltfWidget";

import {MODEL, ModelContext} from "./components/Models";
import "./Main.css";

const buildMode = process.env['NODE_ENV'];
const buildVersion = process.env['BUILD_VERSION'];
export const isProductionBuild = buildMode === "production" ? true : false;

console.log(`%cGltf-Simple v${buildVersion} (${buildMode} mode)`, 'color: #4286f4; font-size: large; font-family: "Comic Sans MS", cursive, sans-serif');

export const AppContext = (React as any).createContext();

class App extends React.Component<{}, {model:MODEL}> {

  constructor(props:{}) {
    super(props);

    const loc = location.hash.replace('#', '');
    if(Object.keys(MODEL).indexOf(loc) !== -1) {
      this.state = {model: loc as MODEL};
    } else {
      this.state = {model: MODEL.NONE};
    }

    this.changeModel = this.changeModel.bind(this);
  }

  changeModel(model:MODEL) {
    this.setState({model});
  }

  render() {
    return <div>
      <AppContext.Provider value={{isProductionBuild, buildMode, buildVersion}} >
        <ModelContext.Provider value={{model: this.state.model, changeModel: this.changeModel}}>
          <MenuWidget />
          <GltfWidget/>
          <a className="sourceCode" href="https://github.com/dakom/gltf-simple">View Source</a>
        </ModelContext.Provider>
      </AppContext.Provider>
    </div>
  }
}


ReactDOM.render(<App />, document.getElementById("app"));