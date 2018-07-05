import {
    GltfMaterialAlphaMode,
    GltfLightNode,
    GltfCameraNode,
    GltfMeshNode,
    OrthographicCameraSettings,
    CameraNode,
    PerspectiveCameraSettings,
    GLTF_ORIGINAL,
    GLTF_ORIGINAL_Material,
    GLTF_ORIGINAL_MeshPrimitive,
    GltfNode,
    GltfData,
    GltfShaderConfig_Primitive,
    GltfShaderConfig_Scene,
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
//TODO - speed has been optimized but need to test thoroughly for correctness (was roughly tested)
//https://stackoverflow.com/questions/17398578/hash-algorithm-for-variable-size-boolean-array?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa

    const baseArray = new Uint8Array(18);
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

export const getShaderHash = (sceneConfig:GltfShaderConfig_Scene) => (primitiveConfig:GltfShaderConfig_Primitive):string => {


    if(primitiveConfig.hasNormalAttributes) {
        baseArray[0] = 1;
    }
    if(primitiveConfig.hasTangentAttributes) {
        baseArray[1] = 1;
    }
    if(primitiveConfig.hasUvAttributes) {
        baseArray[2] = 1;
    }
    if(primitiveConfig.hasColorAttributes) {
        baseArray[3] = 1;
    }
    if(primitiveConfig.hasBaseColorMap) {
        baseArray[4] = 1;
    }
    if(primitiveConfig.hasNormalMap) {
        baseArray[5] = 1;
    }
    if(primitiveConfig.hasEmissiveMap) {
        baseArray[6] = 1;
    }
    if(primitiveConfig.hasMetalRoughnessMap) {
        baseArray[7] = 1;
    }
    if(primitiveConfig.hasOcclusionMap) {
        baseArray[8] = 1;
    }
    if(primitiveConfig.manualSRGB) {
        baseArray[9] = 1;
    }
    if(primitiveConfig.fastSRGB) {
        baseArray[10] = 1;
    }

    baseArray[11] = primitiveConfig.alphaMode === GltfMaterialAlphaMode.BLEND ? 0 : 1;
    baseArray[12] = primitiveConfig.alphaMode === GltfMaterialAlphaMode.MASK ? 0 : 1;
    baseArray[13] = primitiveConfig.alphaMode === GltfMaterialAlphaMode.OPAQUE ? 0 : 1;
   

    if(sceneConfig.ibl) {
        baseArray[14] = 1;
        if(sceneConfig.ibl.useLod) {
            baseArray[15] = 1;
        }
    }
    if(sceneConfig.unlit) {
        baseArray[16] = 1;
    }



    if(sceneConfig.lights) {
        baseArray[17] = 1;

        //Light instances get their own array - 10 * 3 = 30 possibilities
            for(let i = 0; i < sceneConfig.lights.nDirectionalLights; i++) {
                lightsArray[i] = 1;
            }

            for(let i = 0; i < sceneConfig.lights.nPointLights; i++) {
                lightsArray[10 + i] = 1;
            }

            for(let i = 0; i < sceneConfig.lights.nSpotLights; i++) {
                lightsArray[20 + i] = 1;
            }
    }


    for(let i = 0; i < primitiveConfig.nPositionMorphs; i++) {
        morphsArray[i]
    }

    for(let i = 0; i < primitiveConfig.nNormalMorphs; i++) {
        morphsArray[8 + i]
    }
    for(let i = 0; i < primitiveConfig.nTangentMorphs; i++) {
        morphsArray[16 + i]
    }
    for(let i = 0; i < primitiveConfig.nMorphWeights; i++) {
        morphsArray[24 + i]
    }

    for(let i = 0; i < primitiveConfig.nSkinJoints; i++) {
        skinArray[i] = 1;
    }

    const shaderKey = 
        hashBooleans32(baseArray).toString()
    "-" + hashBooleans32(morphsArray).toString()
        + "-" + hashBooleans32(skinArray).toString()
        + "-" + hashBooleans32(lightsArray).toString();

    return shaderKey;

}

export const shaderConfigBenchmark = (sceneConfig:GltfShaderConfig_Scene) => (primitiveConfig:GltfShaderConfig_Primitive) => {
    const t = performance.now();
    for(let i = 0; i < 5000; i++) {
        getShaderHash(sceneConfig);
    }
    console.log(performance.now() - t);
}

/*
const _lookup = new Map();
const FINAL = Symbol();

export const getShaderSymbol = (config:GltfShaderConfig):Symbol => {

    let lookup = _lookup;

    const setLookup = key => {
        if(!lookup.has(key)) {
            lookup.set(key, new Map());
        }

        lookup = lookup.get(key);
    }
    

    setLookup(config.hasNormalAttributes);
    setLookup(config.hasTangentAttributes);
    setLookup(config.hasUvAttributes);
    setLookup(config.hasColorAttributes);
    setLookup(config.hasBaseColorMap);
    setLookup(config.hasNormalMap);
    setLookup(config.hasEmissiveMap);
    setLookup(config.hasMetalRoughnessMap);
    setLookup(config.hasOcclusionMap);
    setLookup(config.manualSRGB);
    setLookup(config.fastSRGB);
    if(config.extensions.ibl) {
        setLookup(true);
        setLookup(config.extensions.ibl.useLod);
    } else {
        setLookup(false);
    }

    setLookup(config.extensions.unlit ? true : false);

    if(config.extensions.lights) {
        setLookup(true);

        setLookup(config.extensions.lights.hasAmbient);
        setLookup(config.extensions.lights.nDirectionalLights);
        setLookup(config.extensions.lights.nPointLights);
        setLookup(config.extensions.lights.nSpotLights);
    } else {
        setLookup(false);
    }

    setLookup(config.nPositionMorphs);
    setLookup(config.nNormalMorphs);
    setLookup(config.nTangentMorphs);
    setLookup(config.nMorphWeights);
    setLookup(config.nSkinJoints);
   
    if(!lookup.has(FINAL)) {
        lookup.set(FINAL, Symbol());
    }

    return lookup.get(FINAL);

}
*/


