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

export interface GltfBridge {
    renderer: WebGlRenderer;
    getAllNodes: () => Array<GltfNode>;
    getData: () => GltfData;
    getOriginalScene: (camera?:Camera) => (sceneNumber:number) => GltfScene; 
    getCameraNode: (nodes:Array<GltfNode>) => (index:number) => GltfCameraNode;
    loadFile: (path:string) => Promise<{gltf: GLTF_ORIGINAL, glbBuffers: Array<ArrayBuffer>}>;  
    loadAssets: 
        ({gltf, basePath, glbBuffers}:{gltf:GLTF_ORIGINAL, basePath?: string, glbBuffers:Array<ArrayBuffer>})
            => Promise<GltfDataAssets>;
    start: ({gltf, assets, config}:{gltf: GLTF_ORIGINAL, assets: GltfDataAssets,  config:GltfInitConfig})
            => void;
    renderScene: (scene:GltfScene) => void;
}
