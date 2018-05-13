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
    GLTF_PARSE_Extension,
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


const loadAssets = ({gltf, coreData}:{gltf:GLTF_ORIGINAL, coreData: any}):Future<any, GltfDataAssets> => 
        Future.of(coreData);

const createData = ({gltf, assets, renderer}:{renderer:WebGlRenderer, gltf: GLTF_ORIGINAL, assets: GltfDataAssets}) => (data:GltfData): GltfData => 
       data


const createScene = (gltf:GLTF_ORIGINAL) => (originalScene:GLTF_ORIGINAL_Scene) => (scene:GltfScene):GltfScene =>  {
    
    const config = getConfig(gltf);
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


const createNode = (gltf:GLTF_ORIGINAL) => (originalNode:GLTF_ORIGINAL_Node) => (node:GltfNode):GltfNode => {

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

export const GLTF_PARSE_Extension_Lights:GLTF_PARSE_Extension = {
    loadAssets,
    createData,
    createScene,
    createNode
};
