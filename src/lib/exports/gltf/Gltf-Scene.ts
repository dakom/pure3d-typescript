import {
    GltfScene, 
    Camera, 
    LightKind, 
    GltfNodeKind, 
    LightNode, 
    GltfMeshNode, 
    CameraNode, 
    GltfIbl,
    AmbientLight,
    DirectionalLight,
    PointLight,
    SpotLight
} from "../../Types";

//TODO - implement with Flatbuffers

export const serializeScene = (scene:GltfScene):any => {
  return scene;
}

export const parseScene = (bytes:any):GltfScene => {
  return bytes;
}
