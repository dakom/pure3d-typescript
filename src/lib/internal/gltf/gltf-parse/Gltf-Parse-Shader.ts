import {
    WebGlVertexArrayData, 
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
import { GLTF_PARSE_getPrimitiveAttributeKeys, GLTF_PARSE_sortPrimitiveAttributeKeys } from '../gltf-parse/Gltf-Parse-Primitive-Attributes';

import {GltfExtensions} from "../gltf-parse/extensions/Gltf-Parse-Extensions";

//These need to be called via bridge/setup
export const GLTF_PARSE_getInitialShaderConfig_Primitive = (data:GltfData) => (originalIds:{nodeId: number, meshId: number, primitiveId: number}) => (primitive:GltfPrimitive):GltfShaderConfig_Primitive => 
    GltfExtensions
        .map(ext => ext.initialShaderConfig_Primitive)
        .reduce((acc, val) => (acc = val (data) (originalIds) (primitive) (acc), acc), 
            getCoreInitialShaderConfig_Primitive(data) (originalIds) (primitive)
        );

export const GLTF_PARSE_getInitialShaderConfig_Scene = (data:GltfData) => (scene:GltfScene):GltfShaderConfig_Scene =>  
    GltfExtensions
        .map(ext => ext.initialShaderConfig_Scene)
        .reduce((acc, val) => (acc = val (data) (scene) (acc), acc), 
            {} as GltfShaderConfig_Scene
        );


const getCoreInitialShaderConfig_Primitive = (data:GltfData) => (originalIds:{nodeId: number, meshId: number, primitiveId: number}) => (primitive:GltfPrimitive):GltfShaderConfig_Primitive => {
    const gltf = data.original;

    const originalNode = data.original.nodes[originalIds.nodeId];

    const originalPrimitive = data.original.meshes[originalIds.meshId].primitives[originalIds.primitiveId];

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
    const shaderConfig:GltfShaderConfig_Primitive = {
        nMorphWeights,
        nPositionMorphs,
        nNormalMorphs,
        nTangentMorphs,
        nSkinJoints,
        alphaMode: (material && material.alphaMode) ? material.alphaMode : GltfMaterialAlphaMode.OPAQUE,
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
        unlit: false
    }

    return shaderConfig;
}


