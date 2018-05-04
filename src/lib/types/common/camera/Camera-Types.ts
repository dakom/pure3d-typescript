import {NumberArray} from "../array/Array-Types";

export interface Camera {
  view: NumberArray; 
  projection: NumberArray;
}

export interface PositionCamera extends Camera {
    position: NumberArray;
}

