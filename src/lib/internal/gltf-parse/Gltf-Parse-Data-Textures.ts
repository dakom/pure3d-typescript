import { createTextureFromTarget, WebGlConstants, WebGlRenderer } from 'webgl-simple';

import { GLTF_ORIGINAL } from '../../Types';


const getColorSpaceForTextureId = ({ renderer, gltf, textureId }: { renderer: WebGlRenderer, gltf: GLTF_ORIGINAL, textureId: number }): number => {
  const defaultColorSpace = WebGlConstants.RGBA;
  const SRGB =
    renderer.version > 1
      ? renderer.gl["SRGB"] //not in type definitions yet
      : renderer.getExtension('EXT_SRGB')
        ? renderer.getExtension('EXT_SRGB').SRGB_EXT
        : defaultColorSpace;

  for (let i = 0; i < gltf.materials.length; i++) {
    const material = gltf.materials[i];
    if (material.emissiveTexture && material.emissiveTexture.index === textureId) {
      return SRGB;
    }

    if (material.normalTexture && material.normalTexture.index === textureId) {
      return WebGlConstants.RGBA;

    }

    if (material.occlusionTexture && material.occlusionTexture.index === textureId) {
      return WebGlConstants.RGBA;
    }
    if (material.pbrMetallicRoughness) {
      if (material.pbrMetallicRoughness.baseColorTexture && material.pbrMetallicRoughness.baseColorTexture.index === textureId) {
        return SRGB;
      }

      if (material.pbrMetallicRoughness.metallicRoughnessTexture && material.pbrMetallicRoughness.metallicRoughnessTexture.index === textureId) {
        return WebGlConstants.RGBA;
      }
    }
  }

  return defaultColorSpace;
}

export const GLTF_PARSE_createTextures = ({ renderer, gltf, imageElements }: { renderer: WebGlRenderer, gltf: GLTF_ORIGINAL, imageElements: Array<HTMLImageElement> }): Map<number, WebGLTexture> => {
  const textureMap = new Map<number, WebGLTexture>();
  const { gl } = renderer;

  if (gltf.textures) {
    gltf.textures.forEach((texture, textureId) => {
      const sampler = gltf.samplers[texture.sampler];
      const colorSpace = getColorSpaceForTextureId({ renderer, gltf, textureId });

      const wTexture = createTextureFromTarget
        ({
          gl,
          format: colorSpace,
          setParameters: () => {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
            gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
            gl.texParameteri(WebGlConstants.TEXTURE_2D, gl.TEXTURE_WRAP_S, !sampler.wrapS ? gl.REPEAT : sampler.wrapS);
            gl.texParameteri(WebGlConstants.TEXTURE_2D, gl.TEXTURE_WRAP_T, !sampler.wrapT ? gl.REPEAT : sampler.wrapT);
            gl.texParameteri(WebGlConstants.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, !sampler.filterMin ? gl.LINEAR : sampler.filterMin);
            gl.texParameteri(WebGlConstants.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, !sampler.filterMag ? gl.LINEAR : sampler.filterMag);
          }
        })
        (imageElements[texture.source]);

      textureMap.set(textureId, wTexture);
    });
  }

  return textureMap;
}