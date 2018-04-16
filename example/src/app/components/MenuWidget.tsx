import * as React from "react";
import {Dropdown} from "./Dropdown";
import {MODEL, ModelContext} from "./Models";

export const MenuWidget = () => (
  <div>
    <ModelContext.Consumer>
      {({model, changeModel}) => <Dropdown label="Choose a Model" options={Object.keys(MODEL) as Array<MODEL>} onSelectedItem={changeModel} initialItem={model} />}
    </ModelContext.Consumer>
  </div>
)