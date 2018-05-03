import {NumberArray} from "../array/Array-Types";
import {createOrbitCamera} from "../../../exports/common/camera/OrbitCamera";

export interface Camera {
  view: NumberArray; 
  projection: NumberArray;
}

export interface PositionCamera extends Camera {
    position: NumberArray;
}

export type OrbitCamera = ReturnType<typeof createOrbitCamera>;
