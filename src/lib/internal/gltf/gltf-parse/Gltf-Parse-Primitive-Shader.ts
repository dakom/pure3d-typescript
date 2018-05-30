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
    GltfNode,
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
    WebGlShaderSource,
    GltfLightsShaderConfig,
} from '../../../Types';
import { GLTF_PARSE_getPrimitiveAttributeKeys, GLTF_PARSE_sortPrimitiveAttributeKeys } from '../gltf-parse/Gltf-Parse-Primitive-Attributes';
import {GLTF_PARSE_primitiveIsUnlit} from "../gltf-parse/extensions/unlit/Gltf-Parse-Extensions-Unlit";

import {GltfExtensions} from "../gltf-parse/extensions/Gltf-Parse-Extensions";

import { GLTF_PARSE_getAttributeLocation, GLTF_PARSE_attributeNames} from "../gltf-parse/Gltf-Parse-Data-Attributes";
import {createShader} from "../../../exports/webgl/WebGl-Shaders";

import vertexShaderSource from "../shaders/Gltf-Shader-Vertex.glsl";
import fragmentShaderSource from "../shaders/Gltf-Pbr-Shader-Fragment.glsl";
//import unlitFragmentShader from "./Gltf-Unlit-Shader-Fragment.glsl";

//These need to be called via bridge/setup somehow
export const GLTF_PARSE_getInitialShaderConfig = ({data, primitive }:{data:GltfData, primitive:GltfPrimitive }):GltfShaderConfig => 
    GltfExtensions
        .map(ext => ext.initialShaderConfig)
        .reduce((acc, val) => (acc = val ({data, primitive}) (acc), acc), 
            getCoreInitialShaderConfig({data, primitive})
        );

export const updateRuntimeShaderConfig = ({data, primitive, scene}:{data:GltfData, scene:GltfScene, primitive:GltfPrimitive}):GltfPrimitive=> {
   
    const shaderConfig = GltfExtensions
        .map(ext => ext.runtimeShaderConfig)
        .reduce((acc, val) => (acc = val ({data, scene, primitive}) (acc), acc), 
            getCoreRuntimeShaderConfig({data, scene, primitive}) 
        );

    return Object.assign({}, primitive, {shaderConfig});
}


//TODO - speed has been optimized but need to test thoroughly for correctness (was roughly tested)
//https://stackoverflow.com/questions/17398578/hash-algorithm-for-variable-size-boolean-array?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa

    const baseArray = new Uint8Array(15);
    const morphsArray = new Uint8Array(30);
    const skinArray = new Uint8Array(30);
    const lightsArray = new Uint8Array(30);


const hashBooleans32 = (xs:Uint8Array) => 
{
    let h = (1 << xs.length);
    for (let i = 0; i < xs.length; i++)
    {
        h = h | ((xs[i]) << (xs.length - i - 1));
    }
    return h;
}

const getShaderKey = (config:GltfShaderConfig):string => {


    if(config.hasNormalAttributes) {
        baseArray[0] = 1;
    }
    if(config.hasTangentAttributes) {
        baseArray[1] = 1;
    }
    if(config.hasUvAttributes) {
        baseArray[2] = 1;
    }
    if(config.hasColorAttributes) {
        baseArray[3] = 1;
    }
    if(config.hasBaseColorMap) {
        baseArray[4] = 1;
    }
    if(config.hasNormalMap) {
        baseArray[5] = 1;
    }
    if(config.hasEmissiveMap) {
        baseArray[6] = 1;
    }
    if(config.hasMetalRoughnessMap) {
        baseArray[7] = 1;
    }
    if(config.hasOcclusionMap) {
        baseArray[8] = 1;
    }
    if(config.manualSRGB) {
        baseArray[9] = 1;
    }
    if(config.fastSRGB) {
        baseArray[10] = 1;
    }

    if(config.extensions.ibl) {
        baseArray[11] = 1;
        if(config.extensions.ibl.useLod) {
            baseArray[12] = 1;
        }
    }
    if(config.extensions.unlit) {
        baseArray[13] = 1;
    }


    if(config.extensions.lights) {
        baseArray[14] = 1;
        if(config.extensions.lights.hasAmbient) {
            baseArray[15] = 1;
        }


        //Light instances get their own array - 10 * 3 = 30 possibilities
            for(let i = 0; i < config.extensions.lights.nDirectionalLights; i++) {
                lightsArray[i] = 1;
            }

            for(let i = 0; i < config.extensions.lights.nPointLights; i++) {
                lightsArray[10 + i] = 1;
            }

            for(let i = 0; i < config.extensions.lights.nSpotLights; i++) {
                lightsArray[20 + i] = 1;
            }
    }


    for(let i = 0; i < config.nPositionMorphs; i++) {
        morphsArray[i]
    }

    for(let i = 0; i < config.nNormalMorphs; i++) {
        morphsArray[8 + i]
    }
    for(let i = 0; i < config.nTangentMorphs; i++) {
        morphsArray[16 + i]
    }
    for(let i = 0; i < config.nMorphWeights; i++) {
        morphsArray[24 + i]
    }

    for(let i = 0; i < config.nSkinJoints; i++) {
        skinArray[i] = 1;
    }

    const shaderKey = 
        hashBooleans32(baseArray).toString()
    "-" + hashBooleans32(morphsArray).toString()
        + "-" + hashBooleans32(skinArray).toString()
        + "-" + hashBooleans32(lightsArray).toString();

    return shaderKey;

}

const shaderConfigBenchmark = (shaderConfig:GltfShaderConfig) => {
    const t = performance.now();
    for(let i = 0; i < 5000; i++) {
        getShaderKey(shaderConfig);
    }
    console.log(performance.now() - t);
}

export const generateShader = 
    ({renderer, data, primitive}: 
    { 
        data:GltfData, 
        renderer: WebGlRenderer,
        primitive: GltfPrimitive,
    }) => {


   //shaderConfigBenchmark(primitive.shaderConfig); 
    
    const shaderKey = getShaderKey(primitive.shaderConfig);

    if (!data.shaders.has(shaderKey)) {
        const source = getShaderSource({data, primitive});

        const shader = createShader({
            shaderId: Symbol(),
            renderer,
            interruptHandler: setAttributeLocations,
            source,
        });

        data.shaders.set(shaderKey, shader);
        //console.log(`new shader compiled`);
    } else {
        //console.log(`nice! re-using existing shader`);
    }

    const shader = data.shaders.get(shaderKey);


    return shader;
}

const getCoreInitialShaderConfig = ({data, primitive}:{data:GltfData, primitive:GltfPrimitive }):GltfShaderConfig => {
    const gltf = data.original;

    const originalNode = data.original.nodes[primitive.originalNodeId];

    const originalPrimitive = data.original.meshes[primitive.originalMeshId].primitives[primitive.originalPrimitiveId];

    const hasAttribute = (originalPrimitive: GLTF_ORIGINAL_MeshPrimitive) => (attr: string): boolean => 
        Object.keys(originalPrimitive.attributes).indexOf(attr) !== -1;

    const material = primitive.material;
   
    let nMorphWeights = 0;
    let nPositionMorphs = 0;
    let nNormalMorphs = 0;
    let nTangentMorphs = 0;
    let nSkinJoints = 0;
 
    if(originalNode.skin !== undefined) {
        const skin = data.original.skins[originalNode.skin];
        nSkinJoints = skin.joints.length;
    }
    
    if(originalPrimitive.targets) {
        originalPrimitive.targets.forEach(target => {
            GLTF_PARSE_sortPrimitiveAttributeKeys(Object.keys(target)).forEach(key => {
                switch(key) {
                    case "POSITION": nPositionMorphs++; break;
                    case "NORMAL": nNormalMorphs++; break;
                    case "TANGENT": nTangentMorphs++; break;
                    default: console.warn("unknown...", key);
                }
            })

            nMorphWeights++;
        })
    }
    const shaderConfig:GltfShaderConfig = {
        nMorphWeights,
        nPositionMorphs,
        nNormalMorphs,
        nTangentMorphs,
        nSkinJoints,
        hasNormalAttributes: hasAttribute (originalPrimitive) ("NORMAL"),
        hasTangentAttributes: hasAttribute (originalPrimitive) ("TANGENT"),
        hasUvAttributes: hasAttribute (originalPrimitive) ("TEXCOORD_0"),

        hasColorAttributes: hasAttribute(originalPrimitive) ("COLOR_0"),
        hasBaseColorMap: material && material.baseColorSamplerIndex !== undefined,
        hasNormalMap: material && material.normal !== undefined,
        hasEmissiveMap: material && material.emissiveSamplerIndex !== undefined,
        hasMetalRoughnessMap: material && material.metallicRoughnessSamplerIndex !== undefined,
        hasOcclusionMap: material && material.occlusion !== undefined,
        manualSRGB: data.initConfig.manualSRGB === true,
        fastSRGB: data.initConfig.fastSRGB === true,
        extensions: {}
    }

    return shaderConfig;
}

const getCoreRuntimeShaderConfig = ({data, scene, primitive}:{data:GltfData, scene:GltfScene, primitive:GltfPrimitive}): GltfShaderConfig => {
    return primitive.shaderConfig; 
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

    if(config.nSkinJoints) {
        defines.push("HAS_SKIN");
    }

    const defineString = defines.map(value => `#define ${value} 1\n`).join('');

    const vertex = getCoreVertexShader ({data, primitive}) (defineString + vertexShaderSource);

    const fragment = getCoreFragmentShader(defineString + fragmentShaderSource);

    return {vertex, fragment}
}


const getCoreVertexShader = ({data, primitive }:{data:GltfData, primitive: GltfPrimitive }) => (vs:string):string => {
    const originalNode = data.original.nodes[primitive.originalNodeId];
    const originalPrimitive = data.original.meshes[primitive.originalMeshId].primitives[primitive.originalPrimitiveId];
    const attributeKeys = GLTF_PARSE_getPrimitiveAttributeKeys(originalPrimitive);
    const {targets} = originalPrimitive;
    const shaderMorphVarLookup = {
        "POSITION": "m_Position",
        "NORMAL": "m_Normal",
        "TANGENT": "m_Tangent",
    }

    let MORPH_VARS = '';
    let MORPH_FUNCS = '';

    let morphIndex = 0;
    let weightIndex = 0;

    if(targets) {

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

    let SKIN_JOINT_COUNT = '';

    if(originalNode.skin !== undefined) {
        const skin = data.original.skins[originalNode.skin];
        SKIN_JOINT_COUNT = skin.joints.length.toString();
       
    }
    return vs
        .replace("%MORPH_VARS%", MORPH_VARS)
        .replace("%MORPH_FUNCS%", MORPH_FUNCS)
        .replace("%SKIN_JOINT_COUNT%", SKIN_JOINT_COUNT);
}

const getCoreFragmentShader = (fs:string):string => fs;

const getShaderSource = ({data, primitive}:{data:GltfData, primitive:GltfPrimitive}): WebGlShaderSource => 
    GltfExtensions
        .map(ext => ext.shaderSource)
        .reduce((acc, val) => (acc = val ({data, primitive}) (acc), acc), 
            getCoreShaderSource({data, primitive})
        );

//For making sure attributes have the same number between shaders
//Passed to the core WebGlShader creator
const setAttributeLocations = gl => program => {
        GLTF_PARSE_attributeNames.forEach(aName => {
            const location = GLTF_PARSE_getAttributeLocation(aName);
            gl.bindAttribLocation(program, location, aName);
        });
    }
