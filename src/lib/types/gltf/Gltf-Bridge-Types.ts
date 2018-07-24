import {
    WebGlRenderer,
    GltfNode,
    GltfData,
    Camera,
    GLTF_ORIGINAL,
    GltfInitConfig,
    GltfScene,
    GltfDataAssets,
    GltfCameraNode,
    GltfAnimator
} from "../../Types";
import {Future} from "fluture";

export interface GltfBridge {
    renderer: WebGlRenderer;
    getAllNodes: () => Array<GltfNode>;
    getData: () => GltfData;
    getOriginalScene: (camera:Camera) => (sceneNumber:number) => GltfScene; 
    getCameraNode: (index:number) => GltfCameraNode;
    loadFile: (path:string) => Future<XMLHttpRequest, {gltf: GLTF_ORIGINAL, glbBuffers: Array<ArrayBuffer>}>;  
    loadAssets: 
        ({gltf, basePath, glbBuffers}:{gltf:GLTF_ORIGINAL, basePath?: string, glbBuffers:Array<ArrayBuffer>})
            => Future<any, GltfDataAssets>;
    start: ({gltf, assets, config}:{gltf: GLTF_ORIGINAL, assets: GltfDataAssets,  config:GltfInitConfig})
            => void;
    renderScene: (scene:GltfScene) => void;
    updateScene: (animate:GltfAnimator) => (frameTs:number) => (scene:GltfScene) => GltfScene;
    updateShaderConfigs:  (scene:GltfScene) => GltfScene;
}
