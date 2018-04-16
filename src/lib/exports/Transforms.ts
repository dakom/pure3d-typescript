import { mat4 } from 'gl-matrix';

import {
  GltfCamera,
  GltfTransform,
  GltfTransformMatrices,
  GltfTransformValues,
  GltfTransformValues_Matrix,
  GltfTransformValues_TRS,
  TypedNumberArray,
  GltfTransformKind,
  GltfScene,
  GltfLighting,
  GltfNode
} from '../Types';

export const convertTransformKind = (kind: GltfTransformKind) => (values:GltfTransformValues):GltfTransformValues => 
  kind === values.kind
    ? values
    : (values.kind === GltfTransformKind.TRS)
      ?   {
            kind: GltfTransformKind.MATRIX,
            matrix: getLocalTransformMatrix(values)
          } as GltfTransformValues_Matrix
      :   (() => {
            //rotation will be wrong if we don't scale first
            const scale = mat4.getScaling(new Array(3), values.matrix);
            const scaledMatrix = mat4.scale(new Array(16), values.matrix, [1/scale[0], 1/scale[1], 1/scale[2]]);

            return {
              kind: GltfTransformKind.TRS,
              trs: {
                translation: mat4.getTranslation(new Array(3), values.matrix),
                rotation: mat4.getRotation(new Array(4), scaledMatrix),
                scale
              }
            } as GltfTransformValues_TRS
          })();

export const getLocalTransformMatrix = (values:GltfTransformValues):Array<number> =>
  (values.kind === GltfTransformKind.MATRIX)
      ? values.matrix.slice()
      : mat4.fromRotationTranslationScale(new Array<number>(16), values.trs.rotation, values.trs.translation, values.trs.scale);

export const getTransformMatrices = ({values, parent, hasNormals, camera, projection}:{values: Readonly<GltfTransformValues>, parent?:Readonly<GltfTransform>, projection:TypedNumberArray, camera:Readonly<GltfCamera>, hasNormals?:boolean}):GltfTransformMatrices => {
  const _tmp = mat4.create();

  const _localTransform = getLocalTransformMatrix(values);
      
  
  //TODO adjust based on parent. Note that this one can be mutable since it was created locally
  const model = parent ? mat4.clone(_localTransform) : mat4.clone(_localTransform);
  const _modelView = mat4.multiply(_tmp, camera.view, model);
  const modelViewProjection = mat4.multiply(mat4.create(), projection, _modelView);
  
  const matrices = {model, modelViewProjection} as GltfTransformMatrices;

  if (hasNormals) {
    const modelInverse = mat4.invert(_tmp, model);
    matrices.normal = mat4.transpose(mat4.create(), modelInverse);
  }

  return matrices;
}



export const updateTransform = ({transform, parent, camera, projection}:{transform:Readonly<GltfTransform>, camera:Readonly<GltfCamera>, projection:TypedNumberArray, parent?:Readonly<GltfTransform>}):GltfTransform => 
  Object.assign({}, transform,
    getTransformMatrices({
      values: transform,
      parent, 
      hasNormals: transform.normal !== undefined, 
      camera,
      projection
    })
  )

export const updateTransformsFrom = (path:Array<number>) => (scene:GltfScene):GltfScene => {

  //TODO - only update from path
  //TODO - pass parent

  const nodes = scene.nodes.map(node => 
    Object.assign({}, node, {
      transform: updateTransform({transform: node.transform, camera: scene.camera, projection: scene.projection})
    })
  )

  //simple immutable assignment, the only thing that changes is world->scene->nodes->transform
  return Object.assign({}, scene, {nodes})

}
    

export const updateTransforms = (scene:GltfScene): GltfScene => 
  updateTransformsFrom([0]) (scene);
