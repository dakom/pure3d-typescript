import {NumberArray} from "../array/Array-Types";
import {Camera} from "../camera/Camera-Types";

export interface Transform {
    //updating this is free but typically won't change display
    trs: Transform_TRS;

    //this could be done with every change to trs or just on frame tick
    localMatrix:NumberArray;

    //from model's local space to world space
    modelMatrix:NumberArray;
 
    //normals to world space
    normalMatrix?: NumberArray;

   
    //from model's local space to view space
    modelViewMatrix?: NumberArray;

    //from model's local space to clip space
    modelViewProjectionMatrix?: NumberArray;
    
}

export interface Transform_TRS {
    translation: NumberArray; 
    rotation: NumberArray; 
    scale: NumberArray; 
}

export interface TransformUpdateOptions {
    updateLocal: boolean;
    updateModel: boolean;
    updateView: boolean;
    camera?:Camera; 
}
