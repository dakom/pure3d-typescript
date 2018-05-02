
import {createOrbitCamera} from "../../../exports/common/camera/OrbitCamera";

export interface Camera {
  view: Float64Array; 
  projection: Float64Array;
}

export interface PositionCamera extends Camera {
    position: Float64Array;
}

export type OrbitCamera = ReturnType<typeof createOrbitCamera>;
