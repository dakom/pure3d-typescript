import {
  GLTF_ORIGINAL,
  GLTF_ORIGINAL_Material,
  GLTF_ORIGINAL_MeshPrimitive,
  GltfEnvironment,
  GltfPbrEnvironment,
  GltfEmptyEnvironment,
  GltfInitConfig,
  GltfEnvironmentKind,
  GltfShaderKind
} from '../../Types';
import { GLTF_PARSE_getPrimitiveAttributeKeys, GLTF_PARSE_sortPrimitiveAttributeKeys } from './Gltf-Parse-Primitive-Attributes';


import pbrVertexShader from "../shaders/Pbr-Shader-Vertex.glsl";
import pbrFragmentShader from "../shaders/Pbr-Shader-Fragment.glsl";
import emptyVertexShader from "../shaders/Empty-Shader-Vertex.glsl";
import emptyFragmentShader from "../shaders/Empty-Shader-Fragment.glsl";

const PbrDefines = [
  //vertex
  "HAS_NORMALS",
  "HAS_TANGENTS",
  "HAS_UV",


  //fragment
  "USE_IBL",
  "HAS_BASECOLORMAP",
  "HAS_NORMALMAP",
  "HAS_EMISSIVEMAP",
  "HAS_METALROUGHNESSMAP",
  "HAS_OCCLUSIONMAP",
  "MANUAL_SRGB",
  "SRGB_FAST_APPROXIMATION",
  "USE_TEX_LOD",
];

const EmptyDefines = [
   
]

const hasAttribute = (gltf:GLTF_ORIGINAL) => (attr: string): boolean => {

  let flag = false;

  gltf.meshes.every(mesh => mesh.primitives.every((primitive: GLTF_ORIGINAL_MeshPrimitive) => {
    flag = Object.keys(primitive.attributes).indexOf(attr) !== -1;
    return !flag;
  }));

  return flag;
}

const getEmptyDefines = ({ config, environment, gltf, originalPrimitive }: { environment: GltfEmptyEnvironment, gltf: GLTF_ORIGINAL, config: GltfInitConfig, originalPrimitive: GLTF_ORIGINAL_MeshPrimitive }): Array<string> => {
  return EmptyDefines.filter(str => {
    switch (str) {
      
      default: return false;
    }
  });
}

const getPbrDefines = ({ config, environment, gltf, originalPrimitive }: { environment: GltfPbrEnvironment, gltf: GLTF_ORIGINAL, config: GltfInitConfig, originalPrimitive: GLTF_ORIGINAL_MeshPrimitive }): Array<string> => {

  const hasMaterial = (pred: ((m: GLTF_ORIGINAL_Material) => boolean)): boolean =>
    gltf.materials && gltf.materials.length
      ? gltf.materials.findIndex(pred) !== -1
      : false;

  return PbrDefines.filter(str => {
    switch (str) {
      //vertex
      case "HAS_NORMALS": return hasAttribute (gltf) ("NORMAL");
      case "HAS_TANGENTS": return hasAttribute (gltf) ("TANGENT");
      case "HAS_UV": return hasAttribute (gltf) ("TEXCOORD_0");

      //fragment
      
      case "USE_IBL": return environment.data.brdf !== undefined;
      case "HAS_BASECOLORMAP": return hasMaterial(material => material.pbrMetallicRoughness !== undefined && material.pbrMetallicRoughness.baseColorTexture !== undefined);
      case "HAS_NORMALMAP": return hasMaterial(material => material.normalTexture !== undefined);
      case "HAS_EMISSIVEMAP": return hasMaterial(material => material.emissiveTexture !== undefined);
      case "HAS_METALROUGHNESSMAP": return hasMaterial(material => material.pbrMetallicRoughness !== undefined && material.pbrMetallicRoughness.metallicRoughnessTexture !== undefined);
      case "HAS_OCCLUSIONMAP": return hasMaterial(material => material.occlusionTexture !== undefined);
      case "MANUAL_SRGB": return config.manualSRGB === true;
      case "SRGB_FAST_APPROXIMATION": return config.fastSRGB === true;
      case "USE_TEX_LOD": return environment.data.cubeMaps.length && environment.data.cubeMaps.findIndex(maps => maps.urls.length > 1) !== -1;

      default: return false;
    }
  });
}

const getDynamicVertexShader = (originalPrimitive:GLTF_ORIGINAL_MeshPrimitive) => (vs:string):string => {
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

export const GLTF_PARSE_getPrimitiveShaderSources = ({config, environment, gltf, originalPrimitive }: { environment: GltfEnvironment, gltf: GLTF_ORIGINAL, config: GltfInitConfig, originalPrimitive: GLTF_ORIGINAL_MeshPrimitive }) => {
  const shaderKind:GltfShaderKind = 
    (environment.kind === GltfEnvironmentKind.PBR_IBL && originalPrimitive.material !== undefined)
    ? GltfShaderKind.PBR
    : GltfShaderKind.EMPTY;

  const definesList = shaderKind === GltfShaderKind.PBR
    ? getPbrDefines({config, environment: environment as GltfPbrEnvironment, gltf, originalPrimitive})
    : getEmptyDefines({config, environment: environment as GltfEmptyEnvironment, gltf, originalPrimitive});

  const vertexShaderSource = shaderKind === GltfShaderKind.PBR
    ? pbrVertexShader
    : emptyVertexShader;

  const fragmentShaderSource = shaderKind === GltfShaderKind.PBR
    ? pbrFragmentShader
    : emptyFragmentShader;

  const defines = definesList.map(value => `#define ${value} 1\n`).join('');
  
  const vertex = defines + getDynamicVertexShader(originalPrimitive) (vertexShaderSource);
  const fragment = defines + fragmentShaderSource;
  
  return {vertex, fragment, shaderKind};
}