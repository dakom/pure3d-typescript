import {
    GltfLightNode,
    GltfCameraNode,
    GltfScene, 
    Camera, 
    LightKind, 
    GltfNodeKind, 
    LightNode, 
    GltfMeshNode, 
    CameraNode, 
    GltfIblScene,
    AmbientLight,
    DirectionalLight,
    PointLight,
    SpotLight
} from "../../Types";

//TODO - implement with Flatbuffers

export const gltf_serializeScene = (scene:GltfScene):any => {
  return scene;
}

export const gltf_parseScene = (bytes:any):GltfScene => {
  return bytes;
}
