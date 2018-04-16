import { GLTF_ORIGINAL, GLTF_ORIGINAL_Camera, GltfCamera } from '../../Types';

export const GLTF_PARSE_getCamera = (original:GLTF_ORIGINAL_Camera):GltfCamera => {
  
  return undefined; //TODO
}

export const GLTF_PARSE_hasDefaultCamera = (original:GLTF_ORIGINAL):boolean => 
  (original.cameras && original.cameras.length > 0);

export const GLTF_PARSE_getDefaultCamera = (original:GLTF_ORIGINAL):GltfCamera => 
  GLTF_PARSE_getCamera(original.cameras[0]);