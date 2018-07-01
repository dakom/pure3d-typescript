
   /* Note - lights are different than other extensions since 
    * they are passed around really as part of the scene, for the sake of convenience (rather than scene.extensions for ambient, or hunting for nodes with extensions.light - lights are first-class citizens
    * For this reason, it is possible to "trick" the shader config by specifying the scene data directly rather than auto-loading it via KHR_Lights, though that typically wouldn't be used
    */
import {
    WebGlConstants,
    WebGlRenderer,
    WebGlBufferData,
    WebGlBufferInfo,
    GLTF_ORIGINAL,
    GLTF_ORIGINAL_Node,
    GLTF_ORIGINAL_Scene,
    GltfData,
    GltfShaderConfig,
    GltfLightsShaderConfig,
    GltfPrimitive,
    WebGlShaderSource,
    CameraNode,
    GltfNode,
    NodeKind,
    GltfLightsExtensionName,
    GltfMeshNode,
    GltfScene,
    GltfDataAssets,
    PerspectiveCameraSettings,
    OrthographicCameraSettings,
    Light,
    LightKind,
    LightNode,
    BaseCamera,
    DirectionalLight,
    PointLight,
    SpotLight,
    GLTF_PARSE_Extension,
    GLTF_PARSE_Extension_Light,
    GLTF_PARSE_Extension_Lights_Config,

} from "../../../../../Types"; 

import { Future, parallel } from 'fluture';
import { fetchImage, fetchJsonUrl } from 'fluture-loaders';
import { createCubeTextureFromTarget, createTextureFromTarget} from "../../../../../exports/webgl/WebGl-Textures";
import { prepWebGlRenderer } from '../../../init/Gltf-Init';
import {getBasePath} from "../../../../common/Basepath";


const getConfig = (gltf:GLTF_ORIGINAL):Array<GLTF_PARSE_Extension_Light> => {

    if(gltf.extensionsUsed && gltf.extensionsUsed.indexOf(GltfLightsExtensionName) !== -1) {

        return gltf.extensions[GltfLightsExtensionName].lights as Array<GLTF_PARSE_Extension_Light>
    }
    return null; 
}

const getLight = (originalLight:GLTF_PARSE_Extension_Light):Light => {
    const kindMap = {
        directional: LightKind.Directional,
        point: LightKind.Point,
        spot: LightKind.Spot
    }


    const light = {
        kind: kindMap[originalLight.type],
        color: originalLight.color 
            ?   Float64Array.from(originalLight.color)
            :   Float64Array.from([1.0,1.0,1.0]),
        intensity: originalLight.intensity !== undefined
            ?   originalLight.intensity
            :   1.0
    } as Light;

    if(light.kind === LightKind.Spot) {
        light.innerConeAngle = originalLight.spot && originalLight.spot.innerConeAngle !== undefined
            ?   originalLight.spot.innerConeAngle
            :   0;

        light.outerConeAngle = originalLight.spot && originalLight.spot.outerConeAngle !== undefined
            ?   originalLight.spot.outerConeAngle
            :   Math.PI/4;

    }

    return light;
}

const loadAssets = ({gltf, coreData}:{gltf:GLTF_ORIGINAL, coreData: any}):Future<any, GltfDataAssets> => 
        Future.of(coreData);

const createData = ({gltf, assets, renderer}:{renderer:WebGlRenderer, gltf: GLTF_ORIGINAL, assets: GltfDataAssets}) => (data:GltfData): GltfData => 
       data


const createScene = (gltf:GLTF_ORIGINAL) => (originalScene:GLTF_ORIGINAL_Scene) => (scene:GltfScene):GltfScene =>  scene;


const createNode = (gltf:GLTF_ORIGINAL) => (originalNode:GLTF_ORIGINAL_Node) => (node:GltfNode):GltfNode => {

    const config = getConfig(gltf);
  
    const nodeConfig:GLTF_PARSE_Extension_Lights_Config = originalNode.extensions && originalNode.extensions.hasOwnProperty(GltfLightsExtensionName)
        ?   originalNode.extensions[GltfLightsExtensionName]
        :   undefined; 

    if(!config || !nodeConfig) {
        return node;
    }

    const light = getLight(config[nodeConfig.light]);

    if(node.kind) {
        throw new Error("node cannot be both a light and some other kind...");
    }

    return Object.assign({}, node, {
        kind: NodeKind.LIGHT,
        light
    });

}

const initialShaderConfig = ({data, primitive}:{data:GltfData, primitive:GltfPrimitive}) => (shaderConfig:GltfShaderConfig):GltfShaderConfig => {
    return shaderConfig;
}

const runtimeShaderConfig = ({data, scene, primitive}:{data:GltfData, primitive:GltfPrimitive, scene: GltfScene}) => (shaderConfig:GltfShaderConfig):GltfShaderConfig => {

    let nPointLights = 0;
    let nDirectionalLights = 0;
    let nSpotLights = 0;

    scene.nodes.forEach(node => {
        if(node.kind === NodeKind.LIGHT) {
            switch(node.light.kind) {
                case LightKind.Directional:
                    nDirectionalLights++;
                    break;
                case LightKind.Point:
                    nPointLights++;
                    break;
                case LightKind.Spot:
                    nSpotLights++;
                    break;
            }
        }
    });



    const config:GltfLightsShaderConfig = {
        nPointLights,
        nDirectionalLights,
        nSpotLights,
    }


    return Object.assign({}, shaderConfig, 
        {
            extensions: Object.assign({}, shaderConfig.extensions, 
                {
                    lights: config
                }
            )
        }
    );
}

const getDynamicVertexShader = (primitive:GltfPrimitive) => (vs:string):string => 
    vs;


const getDynamicFragmentShader = (data:GltfData) => (primitive:GltfPrimitive) => (fs:string):string => {

    let LIGHTS_VARS = '';
    let LIGHTS_FUNCS = '';


    const dLen = primitive.shaderConfig.extensions.lights.nDirectionalLights;

    if(dLen) {
        LIGHTS_VARS += `uniform vec3 u_LightD_Direction[${dLen}];\n`;
        LIGHTS_VARS += `uniform vec3 u_LightD_Color[${dLen}];\n`;
        LIGHTS_VARS += `uniform float u_LightD_Intensity[${dLen}];\n`;

        for(let i = 0; i < dLen; i++) {
            LIGHTS_FUNCS += `color += getColor(pbr, getLight(normal, u_LightD_Direction[${i}], u_LightD_Color[${i}]));\n`
        }
    }

    LIGHTS_FUNCS = ''; //for now, until done debugging

    return fs.replace("%PUNCTUAL_LIGHTS_VARS%", LIGHTS_VARS).replace("%PUNCTUAL_LIGHTS_FUNCS%", LIGHTS_FUNCS); 

}

const shaderSource = ({data, primitive}:{data:GltfData, primitive: GltfPrimitive}) => (source:WebGlShaderSource):WebGlShaderSource => {


    if(primitive.shaderConfig.extensions.lights) {
        const defines = [];
        
        const {nPointLights, nDirectionalLights, nSpotLights} = primitive.shaderConfig.extensions.lights;
        if(nPointLights > 10 || nDirectionalLights > 10 || nSpotLights > 10) {
            console.warn("Only 10 lights of each kind are supported");
        }

        if(!nPointLights && !nDirectionalLights && !nSpotLights) {
            return source;
        }

        defines.push("USE_PUNCTUAL_LIGHTS");

        const defineString = defines.map(value => `#define ${value} 1\n`).join('');
        return Object.assign({}, source, {
            vertex: getDynamicVertexShader(primitive) (defineString + source.vertex),
            fragment: getDynamicFragmentShader (data) (primitive) (defineString + source.fragment)
        })
    } else {
        return source;
    }
}

export const GLTF_PARSE_Extension_Lights:GLTF_PARSE_Extension = {
    loadAssets,
    createData,
    createScene,
    createNode,
    initialShaderConfig,
    runtimeShaderConfig,
    shaderSource
};
