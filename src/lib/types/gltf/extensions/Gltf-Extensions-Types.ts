
import {
    GLTF_ORIGINAL,
    GLTF_ORIGINAL_Node,
    GLTF_ORIGINAL_Scene,
    GltfNode,
    GltfData,
    GltfScene,
    GltfDataAssets,
    CameraNode,
    WebGlRenderer,
} from "../../../Types"; 
import {Future} from "fluture";

export interface GLTF_PARSE_Extension {
    loadAssets : ({gltf, coreData}:{gltf:GLTF_ORIGINAL, coreData: any}) => Future<any, GltfDataAssets>;
    createData : ({gltf, assets, renderer}:{renderer:WebGlRenderer, gltf: GLTF_ORIGINAL, assets: GltfDataAssets}) => (data:GltfData) => GltfData;
    createScene : (gltf:GLTF_ORIGINAL) => (originalScene:GLTF_ORIGINAL_Scene) => (scene:GltfScene) => GltfScene;
    createNode : (gltf:GLTF_ORIGINAL) => (originalNode:GLTF_ORIGINAL_Node) => (node:GltfNode) => GltfNode;
}
