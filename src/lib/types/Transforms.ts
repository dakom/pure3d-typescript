import {TypedNumberArray} from "./Math";
import {GltfCamera} from "./Camera";

export interface GltfTransform {
    //updated this is free
    trs: GltfTransform_TRS;

    //conversion of trs to matrix. 
    //this could be done with every change to trs or just on frame tick
    //it's not actually uploaded to buffer, so higher-fidelity is allowed
    localMatrix:Array<number>;

    //from model's local space to world space
    //also not uploaded to buffer
    modelMatrix:Array<number>;
 
    //normals to world space
    normalMatrix?: Float32Array;

   
    //from model's local space to view space
    modelViewMatrix?: Float32Array;

    //from model's local space to clip space
    modelViewProjectionMatrix?: Float32Array;
    
}

export interface GltfTransform_TRS {
    translation: Array<number>;
    rotation: Array<number>;
    scale: Array<number>;
}

export interface GltfTransformUpdateOptions {
    updateLocal: boolean;
    updateModel: boolean;
    updateView: boolean;
    camera?:GltfCamera; 
}
