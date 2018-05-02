import {TypedNumberArray} from "../array/Array-Types";
import {Camera} from "../camera/Camera-Types";

export interface Transform {
    //updating this is free but typically won't change display
    trs: Transform_TRS;

    //this could be done with every change to trs or just on frame tick
    //it's not actually uploaded to buffer, so higher-fidelity is allowed
    localMatrix:Float64Array;

    //from model's local space to world space
    modelMatrix:Float32Array;
 
    //normals to world space
    normalMatrix?: Float32Array;

   
    //from model's local space to view space
    modelViewMatrix?: Float32Array;

    //from model's local space to clip space
    modelViewProjectionMatrix?: Float32Array;
    
}

export interface Transform_TRS {
    translation: Float64Array; 
    rotation: Float64Array; 
    scale: Float64Array; 
}

export interface TransformUpdateOptions {
    updateLocal: boolean;
    updateModel: boolean;
    updateView: boolean;
    camera?:Camera; 
}
