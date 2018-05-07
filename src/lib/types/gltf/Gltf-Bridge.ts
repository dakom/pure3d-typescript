import {
    WebGlRenderer,
    GltfNode,
    GltfData,
    Camera,
    GLTF_ORIGINAL,
    GltfInitConfig,
    GltfScene,
    GltfDataAssets
} from "../../Types";
import {Future} from "fluture";

export interface GltfBridge {
    renderer: WebGlRenderer;
    getAllNodes: () => Array<GltfNode>;
    getData: () => GltfData;
    getOriginalScene: (camera:Camera) => (sceneNumber:number) => GltfScene; 
    getOriginalCameras: () => Array<Camera>;
    loadFile: (path:string) => Future<XMLHttpRequest, {gltf: GLTF_ORIGINAL, glbBuffers: Array<ArrayBuffer>}>;  
    loadAssets: 
        ({gltf, basePath, glbBuffers}:{gltf:GLTF_ORIGINAL, basePath?: string, glbBuffers:Array<ArrayBuffer>})
            => Future<any, GltfDataAssets>;
    start: ({gltf, assets, config}:{gltf: GLTF_ORIGINAL, assets: GltfDataAssets,  config:GltfInitConfig})
            => void;
    renderScene: (scene:GltfScene) => void; 
}
