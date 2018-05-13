import {
    WebGlConstants,
    WebGlRenderer,
    WebGlBufferData,
    WebGlBufferInfo,
    GLTF_ORIGINAL,
    GLTF_ORIGINAL_Node,
    GLTF_ORIGINAL_Scene,
    GltfData,
    CameraNode,
    GltfIbl,
    GltfNode,
    GltfLightsExtensionName,
    GltfMeshNode,
    GltfScene,
    GltfDataAssets,
    PerspectiveCameraSettings,
    OrthographicCameraSettings,
    LightNode,
    BaseCamera,
    AmbientLight,
    DirectionalLight,
    PointLight,
    SpotLight,
} from "../../../../../Types"; 

import { Future, parallel } from 'fluture';
import { fetchImage, fetchJsonUrl } from 'fluture-loaders';
import { createCubeTextureFromTarget, createTextureFromTarget} from "../../../../../exports/webgl/WebGl-Textures";
import { prepWebGlRenderer } from '../../../init/Gltf-Init';
import {getBasePath} from "../../../../common/Basepath";


const getConfig = (gltf:GLTF_ORIGINAL) => {

    if(gltf.extensionsUsed && gltf.extensionsUsed.indexOf(GltfLightsExtensionName) !== -1) {
        return gltf.extensions[GltfLightsExtensionName]
    }
    return null; 
}


export const GLTF_PARSE_loadLightsAssets = ({gltf, coreData}:{gltf:GLTF_ORIGINAL, coreData: any}):Future<any, GltfDataAssets> => 
        Future.of(coreData);

export const GLTF_PARSE_createLightsData = ({gltf, assets, renderer}:{renderer:WebGlRenderer, gltf: GLTF_ORIGINAL, assets: GltfDataAssets}) => (data:GltfData): GltfData => 
       data


export const GLTF_PARSE_createLightsScene = (data:GltfData) => (originalScene:GLTF_ORIGINAL_Scene) => (scene:GltfScene):GltfScene =>  {
    
    const config = getConfig(data.original);
    const sceneConfig = originalScene.extensions && originalScene.extensions.hasOwnProperty(GltfLightsExtensionName)
        ?   originalScene.extensions[GltfLightsExtensionName]
        :   undefined; 

    if(!config || !sceneConfig) {
        console.log("skipping lights for scene");
        return scene;
    }



    console.log("adding lights to scene (TODO)...");
    
    return scene;

    /*
    return Object.assign({}, scene, {extensions:
        Object.assign({}, scene.extensions, {lights: settings})
    });
    */

}


export const GLTF_PARSE_createLightsNode = (gltf:GLTF_ORIGINAL) => (originalNode:GLTF_ORIGINAL_Node) => (node:GltfNode):GltfNode => {

    const config = getConfig(gltf);
  
    const nodeConfig = originalNode.extensions && originalNode.extensions.hasOwnProperty(GltfLightsExtensionName)
        ?   originalNode.extensions[GltfLightsExtensionName]
        :   undefined; 

    if(!config || !nodeConfig) {
        console.log("skipping lights for node");
        return node;
    }

    console.log("adding lights to node (TODO)...");

    return node;
}
