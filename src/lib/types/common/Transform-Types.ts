import {TypedNumberArray} from "./Math-Types";
import {Camera} from "./Camera-Types";

export interface Transform {
    //updating this is free but typically won't change display
    trs: Transform_TRS;

    //this could be done with every change to trs or just on frame tick
    //it's not actually uploaded to buffer, so higher-fidelity is allowed
    localMatrix:Array<number>;

    //from model's local space to world space
    //also not uploaded to buffer so kept in higher fidelity
    modelMatrix:Array<number>;
 
    //normals to world space
    normalMatrix?: Float32Array;

   
    //from model's local space to view space
    modelViewMatrix?: Float32Array;

    //from model's local space to clip space
    modelViewProjectionMatrix?: Float32Array;
    
}

export interface Transform_TRS {
    translation: Array<number>;
    rotation: Array<number>;
    scale: Array<number>;
}

export interface TransformUpdateOptions {
    updateLocal: boolean;
    updateModel: boolean;
    updateView: boolean;
    camera?:Camera; 
}
