import {vec3, mat4} from "gl-matrix";

export const getCameraView = (modelMatrix:Array<number>) => 
    mat4.invert(mat4.create(),modelMatrix);

export const getCameraPosition = (modelMatrix:Array<number>) =>
    mat4.getTranslation(vec3.create(), modelMatrix) as Float32Array; //not really tested yet - only affects fragment shader
