import {NumberArray, GltfIblLight} from "../../Types";

export const getDefaultIblLight = ():GltfIblLight => {
  return {
    scaleDiffBaseMR: Float64Array.from([0.0, 0.0, 0.0, 0.0]),
    scaleFGDSpec: Float64Array.from([0.0, 0.0, 0.0, 0.0]),
    scaleIBLAmbient: Float64Array.from([1.0, 1.0, 0.0, 0.0]),
  } 
}

/*
export const getDefaultLighting = ():GltfLights => {
  const _lightColor = [255, 255, 255];
  const lightScale = 1.0
  const _lightRotation = 75;
  const _lightPitch = 40;
 
  const rot = _lightRotation * Math.PI / 180;
  const pitch = _lightPitch * Math.PI / 180;
 
  const color = [lightScale * _lightColor[0] / 255, lightScale * _lightColor[1] / 255, lightScale * _lightColor[2] / 255];
  const direction = [Math.sin(rot) * Math.cos(pitch), Math.sin(pitch), Math.cos(rot) * Math.cos(pitch)];

  return {
    directional: { direction, color },
    scaleDiffBaseMR: NumberArray.from([0.0, 0.0, 0.0, 0.0]),
    scaleFGDSpec: NumberArray.from([0.0, 0.0, 0.0, 0.0]),
    scaleIBLAmbient: NumberArray.from([1.0, 1.0, 0.0, 0.0])
  } 
}
*/
