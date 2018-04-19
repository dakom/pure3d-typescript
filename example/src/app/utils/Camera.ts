import {mat4} from "gl-matrix";
import {GltfCamera} from "lib/Lib";

const getDefaultPerspectiveProjection = () => {
  return mat4.perspective(mat4.create(), 45.0 * Math.PI / 180.0, window.innerWidth / window.innerHeight, 0.01, 100.0);
}

export const getCameraLook = ([cameraPosition, cameraLook]:[Array<number>, Array<number>]):GltfCamera => {
    const projection = getDefaultPerspectiveProjection();
    const view = mat4.lookAt(new Array(16), cameraPosition, cameraLook,[0,1,0]);

    const position = Float32Array.from(cameraPosition);

    return {position, view, projection};
}
//taken from the khronos demo repo
export const getCameraOrbit = ({yaw, pitch, roll, translate}:{yaw: number, pitch:number, roll:number, translate: number}):GltfCamera => {
  const position = [
    -translate * Math.sin(roll) * Math.cos(-pitch),
    -translate * Math.sin(-pitch),
    translate * Math.cos(roll) * Math.cos(-pitch)
  ];

  // Update view matrix
  const xRotation = mat4.fromRotation(mat4.create(), roll, [0,1,0]);
  const yRotation = mat4.fromRotation(mat4.create(), pitch, [1,0,0]);
  
  const view = mat4.multiply(mat4.create(), yRotation, xRotation);
  
  view[14] = -translate;

  return {position: Float32Array.from(position), view, projection: getDefaultPerspectiveProjection()}
}
