import { WebGlConstants } from 'webgl-simple';

export const GLTF_PARSE_ACCESSOR_TYPE_SIZE = {
  'SCALAR': 1,
  'VEC2': 2,
  'VEC3': 3,
  'VEC4': 4,
  'MAT2': 4,
  'MAT3': 9,
  'MAT4': 16
};

export const GLTF_PARSE_COMPONENT_BYTE_SIZE = {
  [WebGlConstants.BYTE]: 1,
  [WebGlConstants.UNSIGNED_BYTE]: 1,
  [WebGlConstants.SHORT]: 2,
  [WebGlConstants.UNSIGNED_SHORT]: 2,
  [WebGlConstants.UNSIGNED_INT]: 4,
  [WebGlConstants.FLOAT]: 4
}