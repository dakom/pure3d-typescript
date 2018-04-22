import { mat4 } from 'gl-matrix';

import {
  GltfCamera,
  GltfTransform,
  GltfTransform_TRS,
  TypedNumberArray,
  GltfScene,
  GltfNode,
    GltfTransformUpdateOptions
} from '../Types';


export const getTrsFromMatrix = (matrix:Array<number>):GltfTransform_TRS => {
    const scale = mat4.getScaling(new Array(3), matrix);
    const scaledMatrix = mat4.scale(new Array(16), matrix, [1/scale[0], 1/scale[1], 1/scale[2]]);

    return {
        translation: mat4.getTranslation(new Array(3), matrix),
        rotation: mat4.getRotation(new Array(4), scaledMatrix),
        scale

    }
}

export const getMatrixFromTrs = (trs:GltfTransform_TRS):Array<number> => 
    mat4.fromRotationTranslationScale(new Array<number>(16), trs.rotation, trs.translation, trs.scale);

export const getModelMatrix = (parentModelMatrix:Array<number>) => (localMatrix:Array<number>):Array<number> =>
    parentModelMatrix
        ?   mat4.multiply(new Array(16), parentModelMatrix, localMatrix)
        :   localMatrix.slice();


export const getNormalMatrix = (modelMatrix:Array<number>):Float32Array => 
    mat4.transpose(mat4.create(), mat4.invert(mat4.create(), modelMatrix)) 

export const getViewMatrices = (camera:GltfCamera) => (modelMatrix:Array<number>):{modelViewMatrix: Float32Array, modelViewProjectionMatrix: Float32Array} => {
    const modelViewMatrix = mat4.multiply(mat4.create(), camera.view, modelMatrix);
    const modelViewProjectionMatrix = mat4.multiply(mat4.create(), camera.projection, modelViewMatrix);
    
    return {
        modelViewMatrix,
        modelViewProjectionMatrix
    }
}

export const updateTransform = (opts:GltfTransformUpdateOptions) => (parentModelMatrix:Array<number>) => (transform:GltfTransform):GltfTransform => {

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

export const updateNodeTransforms = (opts:GltfTransformUpdateOptions) => (parentModelMatrix:Array<number>) => (node:GltfNode):GltfNode => {
   const _update = (_parentModelMatrix:Array<number>) => (_node:GltfNode):GltfNode => {

        const t = updateTransform(opts) (_parentModelMatrix) (_node.transform)

        return !_node.children
            ? Object.assign({}, _node, {transform: t}) 
            : Object.assign({}, _node, {transform: t, children: _node.children.map(n => _update (t.modelMatrix) (n))});
    }
    return _update (parentModelMatrix) (node)
}

export const updateNodeListTransforms = (opts:GltfTransformUpdateOptions) => (parentModelMatrix:Array<number>) => (nodes:Array<GltfNode>):Array<GltfNode> =>
    nodes.map(updateNodeTransforms (opts) (parentModelMatrix));
