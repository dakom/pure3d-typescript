import { convertTransformKind, getTransformMatrices } from '../../exports/Transforms';
import {
  GLTF_ORIGINAL_Node,
  GltfCamera,
  GltfData,
  GltfTransform,
  GltfTransformValues_Matrix,
  GltfTransformValues_TRS,
  GltfInitConfig,
  TypedNumberArray,
  GltfTransformKind
} from '../../Types';
import { GLTF_PARSE_primitiveHasAttribute } from './Gltf-Parse-Primitive-Attributes';


export const GLTF_PARSE_getNodeTransform = ({originalNode, parent, data, camera,config}:{originalNode:GLTF_ORIGINAL_Node, parent?:GltfTransform, camera:GltfCamera, data: GltfData, config:GltfInitConfig}):GltfTransform => {
  let values = 
    originalNode.matrix
      ? {
          kind: GltfTransformKind.MATRIX,
          matrix: originalNode.matrix
        } as GltfTransformValues_Matrix

      : (() => {
          const trs = {
            translation: [0.0, 0.0, 0.0],
            rotation: [0.0, 0.0, 0.0, 1.0],
            scale: [1.0, 1.0, 1.0]
          }
          Object.keys(trs).forEach(prop => {
           const nodeTrsProp = originalNode[prop]
            if (nodeTrsProp) {
              
              trs[prop] = nodeTrsProp;
            }
          });
  
          return {
            kind: GltfTransformKind.TRS,
            trs
          }
        })() as GltfTransformValues_TRS;

        
  if(config.transformKind) {
    values = convertTransformKind(config.transformKind) (values);
  }

  const hasNormals = data.original.meshes[originalNode.mesh].primitives.some(p => GLTF_PARSE_primitiveHasAttribute("NORMAL")(p));
  const matrices = getTransformMatrices({values, parent, hasNormals, camera, projection: config.projection});
  
  return {...values, ...matrices};
}