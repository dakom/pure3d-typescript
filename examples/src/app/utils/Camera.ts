import {mat4} from "gl-matrix";
import {PositionCamera} from "lib/Lib";

const getDefaultPerspectiveProjection = () => {
  return mat4.perspective(mat4.create(), 45.0 * Math.PI / 180.0, window.innerWidth / window.innerHeight, 0.01, 100.0);
}

export const getCameraLook = ([position, cameraLook]:[Float64Array, Float64Array]):PositionCamera => {
    const projection = getDefaultPerspectiveProjection();
    const view = mat4.lookAt(new Array(16), position, cameraLook,[0,1,0]);


    return {position, view, projection};
}
