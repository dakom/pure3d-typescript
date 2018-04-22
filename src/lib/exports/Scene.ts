import {GltfScene, GltfCamera, GltfLightKind, GltfNodeKind, GltfMeshNode, GltfCameraNode, GltfIblLight, GltfNode} from "../Types";

//TODO - implement with Flatbuffers

export const serializeScene = (scene:GltfScene):any => {
  return scene;
}

export const parseScene = (bytes:any):GltfScene => {
  return bytes;
}
