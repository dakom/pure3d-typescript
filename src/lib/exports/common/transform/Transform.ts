import { mat4, quat, vec3} from 'gl-matrix';

import {createVec3, createVec4, createQuat, createMat4} from "../array/Array";
import {
  Camera,
  Transform,
  Transform_TRS,
  TypedNumberArray,
  TransformUpdateOptions,
  NumberArray
} from '../../../Types';


export const getTrsFromMatrix = (matrix:NumberArray):Transform_TRS => {
    const scale = mat4.getScaling(createVec3(), matrix);
    const scaledMatrix = mat4.scale(createMat4(), matrix, [1/scale[0], 1/scale[1], 1/scale[2]]);

    return {
        translation: mat4.getTranslation(createVec3(), matrix),
        rotation: mat4.getRotation(createVec4(), scaledMatrix),
        scale

    }
}

export const getMatrixFromTrs = (trs:Transform_TRS):NumberArray => 
    mat4.fromRotationTranslationScale(createMat4(), trs.rotation, trs.translation, trs.scale);

export const getModelMatrix = (parentModelMatrix:NumberArray) => (localMatrix:NumberArray):NumberArray =>
    parentModelMatrix
        ?   mat4.multiply(createMat4(), parentModelMatrix, localMatrix)
        :   localMatrix.slice();


export const getNormalMatrix = (modelMatrix:NumberArray):NumberArray => 
    mat4.transpose(mat4.create(), mat4.invert(mat4.create(), modelMatrix)) 

export const getViewMatrices = (camera:Camera) => (modelMatrix:NumberArray):{modelViewMatrix: NumberArray, modelViewProjectionMatrix: NumberArray} => {
    const modelViewMatrix = mat4.multiply(mat4.create(), camera.view, modelMatrix);
    const modelViewProjectionMatrix = mat4.multiply(mat4.create(), camera.projection, modelViewMatrix);
    
    return {
        modelViewMatrix,
        modelViewProjectionMatrix
    }
}

export const updateTransform = (opts:TransformUpdateOptions) => (parentModelMatrix:NumberArray) => (transform:Transform):Transform => {

    const localMatrix = opts.updateLocal ? getMatrixFromTrs(transform.trs) : transform.localMatrix;

    const modelMatrix = opts.updateModel ? getModelMatrix(parentModelMatrix) (localMatrix) : transform.modelMatrix;
    const normalMatrix = opts.updateModel && transform.normalMatrix
        ?   getNormalMatrix(modelMatrix)
        :   undefined;

    const {modelViewMatrix, modelViewProjectionMatrix} = opts.updateView ? getViewMatrices (opts.camera) (modelMatrix) : transform;


    return Object.assign({}, transform, {
        localMatrix, modelMatrix, normalMatrix, modelViewMatrix, modelViewProjectionMatrix
    });
}

//Non-essential helpers
export const UP_AXIS = Float64Array.from([0,1,0]);
export const ORIGIN_AXIS = Float64Array.from([0,0,0]);

export const getDirectionFromMatrix = (mat:NumberArray):NumberArray => {
    const qRot =  mat4.getRotation(createQuat(), mat);
    const vRes = vec3.transformQuat(createVec3(), [-1,1,0], qRot);

    return vRes; 
}
