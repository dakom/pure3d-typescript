import { GLTF_ORIGINAL, GLTF_ORIGINAL_Material, GltfData, GltfMaterial, GltfMaterialAlphaMode } from '../../../Types';



export const GLTF_PARSE_createMaterialForPrimitive = ({gltf, materialId, data}:{gltf: GLTF_ORIGINAL, materialId: number, data: GltfData}):GltfMaterial => {
  const _m = gltf.materials[materialId] as Readonly<GLTF_ORIGINAL_Material>;
  const material = {} as GltfMaterial;

  material.metallicRoughnessValues = Float32Array.from([1.0, 1.0]);
  material.baseColorFactor = Float32Array.from([1.0, 1.0, 1.0, 1.0]);

  if(_m.pbrMetallicRoughness) {
    if(_m.pbrMetallicRoughness.metallicFactor !== undefined) {
      material.metallicRoughnessValues[0] = _m.pbrMetallicRoughness.metallicFactor;
    }

    if(_m.pbrMetallicRoughness.roughnessFactor !== undefined) {
      material.metallicRoughnessValues[1] = _m.pbrMetallicRoughness.roughnessFactor;
    }

    if(_m.pbrMetallicRoughness.baseColorFactor !== undefined) {
      material.baseColorFactor = Float32Array.from(_m.pbrMetallicRoughness.baseColorFactor);
    }

    if(_m.pbrMetallicRoughness.baseColorTexture !== undefined) {
      material.baseColorSamplerIndex = _m.pbrMetallicRoughness.baseColorTexture.index;
    }

    if(_m.pbrMetallicRoughness.metallicRoughnessTexture !== undefined) {
      material.metallicRoughnessSamplerIndex = _m.pbrMetallicRoughness.metallicRoughnessTexture.index;
    }
  }

  if (_m.normalTexture !== undefined) {
    const scale = _m.normalTexture.scale !== undefined ? _m.normalTexture.scale : 1.0;

    material.normal = {
      scale,
      samplerIndex: _m.normalTexture.index
    }
  }

  if (_m.occlusionTexture !== undefined) {
    const strength = _m.occlusionTexture.strength !== undefined ? _m.occlusionTexture.strength : 1.0;
    material.occlusion = {
      strength,
      samplerIndex: _m.occlusionTexture.index
    }
  }


  if (_m.emissiveTexture !== undefined) {
    material.emissiveSamplerIndex = _m.emissiveTexture.index;
  }

  if(_m.emissiveFactor !== undefined) {
    material.emissiveFactor = Float32Array.from(_m.emissiveFactor);
  }

  if(_m.alphaMode) {
    switch(_m.alphaMode) {
      case "OPAQUE": material.alphaMode = GltfMaterialAlphaMode.OPAQUE; break;
      case "BLEND":  material.alphaMode = GltfMaterialAlphaMode.BLEND; break;
      case "MASK": material.alphaMode = GltfMaterialAlphaMode.MASK; break;
      default: material.alphaMode = GltfMaterialAlphaMode.OTHER; break;
    }
  }
  

  material.alphaCutoff = _m.alphaCutoff;
  
  return material;
}
