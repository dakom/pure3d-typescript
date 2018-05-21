import {
    GltfIblScene,    
    GltfMeshNode,
    OrthographicCameraSettings,
    BaseCamera,
    CameraNode,
    PerspectiveCameraSettings,
    AmbientLight,
    GLTF_ORIGINAL,
    GLTF_ORIGINAL_Material,
    GLTF_ORIGINAL_MeshPrimitive,
    GltfData,
    GltfShaderConfig,
    GltfInitConfig,
    WebGlRenderer,
    WebGlBufferInfo,
    WebGlBufferData,
    WebGlAttributeActivateOptions,
    LightNode,
    GltfScene,
    GltfPrimitive,
    WebGlShaderSource
} from '../../../Types';
import { GLTF_PARSE_getPrimitiveAttributeKeys, GLTF_PARSE_sortPrimitiveAttributeKeys } from '../gltf-parse/Gltf-Parse-Primitive-Attributes';
import {GLTF_PARSE_primitiveIsUnlit} from "../gltf-parse/extensions/unlit/Gltf-Parse-Extensions-Unlit";

import {GltfExtensions} from "../gltf-parse/extensions/Gltf-Parse-Extensions";

import { GLTF_PARSE_getAttributeLocation, GLTF_PARSE_attributeNames} from "../gltf-parse/Gltf-Parse-Data-Attributes";
import {createShader} from "../../../exports/webgl/WebGl-Shaders";

import vertexShaderSource from "./Gltf-Shader-Vertex.glsl";
import fragmentShaderSource from "./Gltf-Pbr-Shader-Fragment.glsl";
//import unlitFragmentShader from "./Gltf-Unlit-Shader-Fragment.glsl";

const getCoreInitialShaderConfig = ({data, primitive}:{data:GltfData, primitive:GltfPrimitive}):GltfShaderConfig => {
    const gltf = data.original;

    const originalPrimitive = data.original.meshes[primitive.originalMeshId].primitives[primitive.originalPrimitiveId];

    const hasAttribute = (originalPrimitive: GLTF_ORIGINAL_MeshPrimitive) => (attr: string): boolean => 
        Object.keys(originalPrimitive.attributes).indexOf(attr) !== -1;

    const material = primitive.material;
    
    const shaderConfig:GltfShaderConfig = {
        hasNormalAttributes: hasAttribute (originalPrimitive) ("NORMAL"),
        hasTangentAttributes: hasAttribute (originalPrimitive) ("TANGENT"),
        hasUvAttributes: hasAttribute (originalPrimitive) ("TEXCOORD_0"),

        hasColorAttributes: hasAttribute(originalPrimitive) ("COLOR_0"),
        hasBaseColorMap: material.baseColorSamplerIndex !== undefined,
        hasNormalMap: material.normal !== undefined,
        hasEmissiveMap: material.emissiveSamplerIndex !== undefined,
        hasMetalRoughnessMap: material.metallicRoughnessSamplerIndex !== undefined,
        hasOcclusionMap: material.occlusion !== undefined,
        manualSRGB: data.initConfig.manualSRGB === true,
        fastSRGB: data.initConfig.fastSRGB === true,
        extensions: {}
    }

    return shaderConfig;

            //case "USE_IBL": return shaderKind !== GltfShaderKind.PBR_UNLIT && data.extensions.ibl && data.extensions.ibl.brdf !== undefined;
            /*    
            case "USE_TEX_LOD": return (
                    shaderKind !== GltfShaderKind.PBR_UNLIT 
                    && data.extensions.ibl 
                    && data.extensions.ibl.useLod 
            );
            */
}

const getCoreRuntimeShaderConfig = ({data, scene, primitive}:{data:GltfData, scene:GltfScene, primitive:GltfPrimitive}) => (config:GltfShaderConfig):GltfShaderConfig => {
    return config;
}


const getCoreShaderSource = ({data, primitive }:{data:GltfData, primitive: GltfPrimitive }):WebGlShaderSource => {
    const gltf = data.original;
    const originalPrimitive = data.original.meshes[primitive.originalMeshId].primitives[primitive.originalPrimitiveId];

    const config = primitive.shaderConfig;

    const defines = [];

    if(config.hasNormalAttributes) {
        defines.push("HAS_NORMALS");
    }

    if(config.hasTangentAttributes) {
        defines.push("HAS_TANGENTS");
    }

    if(config.hasUvAttributes) {
        defines.push("HAS_UV");
    }

    if(config.hasColorAttributes) {
        defines.push("HAS_COLOR");
    }

    if(config.hasBaseColorMap) {
        defines.push("HAS_BASECOLORMAP");
    }

    if(config.hasNormalMap) {
        defines.push("HAS_NORMALMAP");
    }

    if(config.hasEmissiveMap) {
        defines.push("HAS_EMISSIVEMAP");
    }

    if(config.hasMetalRoughnessMap) {
        defines.push("HAS_METALROUGHNESSMAP");
    }

    if(config.hasOcclusionMap) {
        defines.push("HAS_OCCLUSIONMAP");
    }

    if(config.manualSRGB) {
        defines.push("MANUAL_SRGB");
    }

    if(config.fastSRGB) {
        defines.push("SRGB_FAST_APPROXIMATION");
    }

    const defineString = defines.map(value => `#define ${value} 1\n`).join('');

    const vertex = getCoreVertexShader (originalPrimitive) (defineString + vertexShaderSource);

    const fragment = getCoreFragmentShader(defineString + fragmentShaderSource);

    return {vertex, fragment}
}


const getCoreVertexShader = (originalPrimitive:GLTF_ORIGINAL_MeshPrimitive) => (vs:string):string => {
    const attributeKeys = GLTF_PARSE_getPrimitiveAttributeKeys(originalPrimitive);
    const {targets} = originalPrimitive;
    const shaderMorphVarLookup = {
        "POSITION": "m_Position",
        "NORMAL": "m_Normal",
        "TANGENT": "m_Tangent",
    }

    let MORPH_VARS = '';
    let MORPH_FUNCS = '';

    if(targets) {

        let morphIndex = 0;
        let weightIndex = 0;
        targets.forEach(target => {
            GLTF_PARSE_sortPrimitiveAttributeKeys(Object.keys(target)).forEach(key => {
                const aMorph = `a_Morph_${morphIndex}`;
                const aTarget = shaderMorphVarLookup[key];

                MORPH_VARS += `attribute vec4 ${aMorph};\n`;

                MORPH_FUNCS += `${aTarget} += (u_MorphWeights[${weightIndex}] * ${aMorph});\n`;

                morphIndex++;
            })
            weightIndex++;
        })

        MORPH_VARS += `uniform float u_MorphWeights[${weightIndex}];\n`;
    }

    return vs.replace("%MORPH_VARS%", MORPH_VARS).replace("%MORPH_FUNCS%", MORPH_FUNCS);
}

const getCoreFragmentShader = (fs:string):string => 
    fs;


//These need to be called via bridge/setup somehow
export const getInitialPrimitiveShaderConfig = ({data, primitive}:{data:GltfData, primitive:GltfPrimitive}):GltfShaderConfig => 
    GltfExtensions
        .map(ext => ext.setInitialShaderConfig)
        .reduce((acc, val) => (acc = val ({data, primitive}) (acc), acc), 
            getCoreInitialShaderConfig({data, primitive})
        );

export const getRuntimePrimitiveShaderConfig = ({data, primitive, scene}:{data:GltfData, scene:GltfScene, primitive:GltfPrimitive}) => (shaderConfig:GltfShaderConfig):GltfShaderConfig => 
    GltfExtensions
        .map(ext => ext.setRuntimeShaderConfig)
        .reduce((acc, val) => (acc = val ({data, scene, primitive}) (acc), acc), 
            getCoreRuntimeShaderConfig({data, scene, primitive}) (shaderConfig)
        );

export const getShaderSource = ({data, primitive}:{data:GltfData, primitive:GltfPrimitive}): WebGlShaderSource => 
    GltfExtensions
        .map(ext => ext.getShaderSource)
        .reduce((acc, val) => (acc = val ({data, primitive}) (acc), acc), 
            getCoreShaderSource({data, primitive})
        );

export const Gltf_GenerateShader = 
    ({renderer, lightList, scene, data, primitive}: 
    { 
        lightList: Array<LightNode>;
        scene: GltfScene;
        data:GltfData, 
        renderer: WebGlRenderer,
        primitive: GltfPrimitive,
    }) => {

   
    //change to check against primitive.shaderConfig, and compile from getShaderSource
    
    if (!data.shaders.has(shaderSource)) {
        const shader = createShader({
            shaderId: Symbol(),
            renderer,
            interruptHandler: setAttributeLocations,
            source: { vertex, fragment }
        });

        data.shaders.set(shaderSource, shader);
        //console.log(`new shader compiled`);
    } else {
        //console.log(`nice! re-using existing shader`);
    }

    const shader = data.shaders.get(shaderSource);


    return shader;
}

//For making sure attributes have the same number between shaders
//Passed to the core WebGlShader creator
const setAttributeLocations = gl => program => {
        GLTF_PARSE_attributeNames.forEach(aName => {
            const location = GLTF_PARSE_getAttributeLocation(aName);
            gl.bindAttribLocation(program, location, aName);
        });
    }
