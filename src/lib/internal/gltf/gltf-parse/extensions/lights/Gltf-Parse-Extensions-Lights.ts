
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
    GltfShaderConfig_Primitive,
    GltfShaderConfig_Scene,
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
    DirectionalLight,
    PointLight,
    SpotLight,
    GLTF_PARSE_Extension,
    GLTF_PARSE_Extension_Light,
    GLTF_PARSE_Extension_Lights_Config,
    GltfLights_MAX
} from "../../../../../Types"; 

import { createCubeTextureFromTarget, createTextureFromTarget} from "../../../../../exports/webgl/WebGl-Textures";
import { prepWebGlRenderer } from '../../../init/Gltf-Init';
import {getBasePath} from "../../../../common/Basepath";
import {forEachNodes} from "../../../../../exports/common/nodes/Nodes";

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
        const innerConeAngle = originalLight.spot && originalLight.spot.innerConeAngle !== undefined
            ?   originalLight.spot.innerConeAngle
            :   0;

        const outerConeAngle = originalLight.spot && originalLight.spot.outerConeAngle !== undefined
            ?   originalLight.spot.outerConeAngle
            :   Math.PI/4;

        light.angleScale = 1.0 / Math.max(0.001, Math.cos(innerConeAngle) - Math.cos(outerConeAngle));
        light.angleOffset = -Math.cos(outerConeAngle) * light.angleScale;
    }

    return light;
}

const loadAssets = ({gltf, coreData}:{gltf:GLTF_ORIGINAL, coreData: any}):Promise<GltfDataAssets> => 
        Promise.resolve(coreData);

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

const initialShaderConfig_Primitive = (data:GltfData) => (originalIds:{nodeId: number, meshId: number, primitiveId: number}) => (primitive:GltfPrimitive) => (shaderConfig:GltfShaderConfig_Primitive):GltfShaderConfig_Primitive => 
    shaderConfig;

const initialShaderConfig_Scene = (data:GltfData) => (scene:GltfScene) => (shaderConfig:GltfShaderConfig_Scene):GltfShaderConfig_Scene => 
    shaderConfig;

const runtimeShaderConfig_Primitive = (scene: GltfScene) => (primitive:GltfPrimitive) => (shaderConfig:GltfShaderConfig_Primitive):GltfShaderConfig_Primitive => 
    shaderConfig;

const runtimeShaderConfig_Scene = (scene: GltfScene) => (shaderConfig:GltfShaderConfig_Scene):GltfShaderConfig_Scene => {

    let nPointLights = 0;
    let nDirectionalLights = 0;
    let nSpotLights = 0;


    forEachNodes ((node:GltfNode) => {

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
    }) (scene.nodes);

    const config:GltfLightsShaderConfig = {
        nPointLights,
        nDirectionalLights,
        nSpotLights,
    }


    return Object.assign({}, shaderConfig, { lights: config });
}

const getDynamicFragmentShader = (data:GltfData) => (sceneShaderConfig:GltfShaderConfig_Scene) => (primitiveShaderConfig:GltfShaderConfig_Primitive) => (fs:string):string => {

    let LIGHTS_VARS = '';
    let LIGHTS_FUNCS = '';

    const dLen = sceneShaderConfig.lights.nDirectionalLights;
    const pLen = sceneShaderConfig.lights.nPointLights;
    const sLen = sceneShaderConfig.lights.nSpotLights;


    if(dLen) {
        LIGHTS_VARS += `uniform vec3 u_Light_Directional_Direction[${dLen}];\n`;
        LIGHTS_VARS += `uniform vec3 u_Light_Directional_Color[${dLen}];\n`;
        LIGHTS_VARS += `uniform float u_Light_Directional_Intensity[${dLen}];\n`;
  
        for(let i = 0; i < dLen; i++) {
            LIGHTS_FUNCS += `light = getDirectionalLight(
                fragment,
                u_Light_Directional_Direction[${i}],
                u_Light_Directional_Color[${i}],
                u_Light_Directional_Intensity[${i}]
            );\n`
            LIGHTS_FUNCS += `color += getColor(pbr, fragment, light);\n`;
        }
    }

    if(pLen) {
        LIGHTS_VARS += `uniform vec3 u_Light_Point_Position[${pLen}];\n`;
        LIGHTS_VARS += `uniform vec3 u_Light_Point_Color[${pLen}];\n`;
        LIGHTS_VARS += `uniform float u_Light_Point_Intensity[${pLen}];\n`;
    
        for(let i = 0; i < pLen; i++) {
            LIGHTS_FUNCS += `light = getPointLight(
                fragment,
                u_Light_Point_Position[${i}], 
                u_Light_Point_Color[${i}], 
                u_Light_Point_Intensity[${i}]
            );\n`
            LIGHTS_FUNCS += `color += getColor(pbr, fragment, light);\n`;
        }
    }

    if(sLen) {
        LIGHTS_VARS += `uniform vec3 u_Light_Spot_Position[${sLen}];\n`;
        LIGHTS_VARS += `uniform vec3 u_Light_Spot_Direction[${sLen}];\n`;
        LIGHTS_VARS += `uniform float u_Light_Spot_AngleScale[${sLen}];\n`;
        LIGHTS_VARS += `uniform float u_Light_Spot_AngleOffset[${sLen}];\n`;
        LIGHTS_VARS += `uniform vec3 u_Light_Spot_Color[${sLen}];\n`;
        LIGHTS_VARS += `uniform float u_Light_Spot_Intensity[${sLen}];\n`;


        for(let i = 0; i < sLen; i++) {
            LIGHTS_FUNCS += `light = getSpotLight(
                fragment,
                u_Light_Spot_Position[${i}], 
                u_Light_Spot_Direction[${i}], 
                u_Light_Spot_AngleScale[${i}], 
                u_Light_Spot_AngleOffset[${i}], 
                u_Light_Spot_Color[${i}], 
                u_Light_Spot_Intensity[${i}]
            );\n`
            LIGHTS_FUNCS += `color += getColor(pbr, fragment, light);\n`;
        }
    }

    return fs.replace("%PUNCTUAL_LIGHTS_VARS%", LIGHTS_VARS).replace("%PUNCTUAL_LIGHTS_FUNCS%", LIGHTS_FUNCS); 

}

const getShaderSource = (data:GltfData) => (sceneShaderConfig:GltfShaderConfig_Scene) => (primitiveShaderConfig: GltfShaderConfig_Primitive) => (source:WebGlShaderSource):WebGlShaderSource => {
    if(sceneShaderConfig.lights) {
        const defines = [];
        
        const {nPointLights, nDirectionalLights, nSpotLights} = sceneShaderConfig.lights;
        if(nPointLights > GltfLights_MAX || nDirectionalLights > GltfLights_MAX || nSpotLights > GltfLights_MAX) {
            console.warn(`Only ${GltfLights_MAX} lights of each kind are supported`);
        }

        if(!nPointLights && !nDirectionalLights && !nSpotLights) {
            return source;
        }

        defines.push("USE_PUNCTUAL_LIGHTS");

        const defineString = defines.map(value => `#define ${value} 1\n`).join('');
        return Object.assign({}, source, {
            vertex: defineString + source.vertex,
            fragment: getDynamicFragmentShader (data) (sceneShaderConfig) (primitiveShaderConfig) (defineString + source.fragment)
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
    initialShaderConfig_Primitive,
    runtimeShaderConfig_Primitive,
    initialShaderConfig_Scene,
    runtimeShaderConfig_Scene,
    getShaderSource
};
