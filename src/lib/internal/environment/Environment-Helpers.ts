import { Future, parallel } from 'fluture';
import { fetchImage } from 'fluture-loaders';
import { createCubeTextureFromTarget, createTextureFromTarget, WebGlConstants, WebGlRenderer } from 'webgl-simple';

import { getBasePath } from '../utils/Basepath';
import {
  GltfEmptyEnvironment,
  GltfEnvironmentKind,
  GltfPbrEnvironment,
  GltfPbrEnvironmentCubeMap,
  GltfPbrEnvironmentData,
  GltfPbrEnvironmentTextures,
} from '../../Types';
import { prepWebGlRenderer } from '../webgl/WebGl-Helpers';

//Not 100% clear if this is _really_ part of the gltf spec, or part of pbr (which is part of spec), or just an implementation detail
//But it is in the reference demo, and it's awesome - so why not? :P

//Caveat is that we need to specify the additional files in a proprietary json file (not part of the gltf file itself)

export const loadGltfPbrEnvironmentImages = ({path, envData}:{path:string, envData:GltfPbrEnvironmentData}) => {
  const basePath = getBasePath(path);
  
  const imageUrls  = Array<string>();

  imageUrls.push(envData.brdf.url);

  envData.cubeMaps.forEach(cubeMap => {
    cubeMap.urls.forEach(list => {
      list.forEach(url => {
        imageUrls.push(cubeMap.name + "/" + url);
      })
    })
  })

  const imageFutures = imageUrls.map(url => fetchImage(basePath + url).map(img => ({url, img})));

  return parallel(Infinity, imageFutures)
      .map(ldrs => {
        const m = new Map<string, HTMLImageElement>();
  
        ldrs.forEach(ldr => {
          m.set(ldr.url, ldr.img);
        });

        return m;
      });
}
export const createGltfPbrEnvironment = ({renderer, envData, imageMap}:{renderer:WebGlRenderer, envData:GltfPbrEnvironmentData, imageMap:Map<string, HTMLImageElement>}): GltfPbrEnvironment => {
    prepWebGlRenderer(renderer);

    const gl = renderer.gl;
    
    
  
    const makeBrdfTexture =
      createTextureFromTarget
        ({
          gl,
          format: envData.brdf.colorSpace,
          
          setParameters: () => {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
            gl.texParameteri(WebGlConstants.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(WebGlConstants.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(WebGlConstants.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(WebGlConstants.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          }
        })
  
    const makeCubeMapTexture = (images: Map<string, HTMLImageElement>) => (cubeMap: GltfPbrEnvironmentCubeMap): WebGLTexture => {
      const faces = ["posX", "negX", "posY", "negY", "posZ", "negZ"];
  
  
      let mipLevels = [];
      cubeMap.urls.forEach(list => {
        const mipLevel = {};
  
        list.forEach((url, faceIndex) => {
          const img = images.get(cubeMap.name + "/" + url);
          mipLevel[faces[faceIndex]] = img;
        })
  
        mipLevels.push(mipLevel);
      });
      
      return createCubeTextureFromTarget({
        gl,
        format: cubeMap.colorSpace, //SEEMS TO BE BUGGY!
        //format: WebGlConstants.RGBA,
        setParameters: opts => {
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
          gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          if (cubeMap.urls.length > 1) {
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          } else {
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          }
        }
      })
      (mipLevels);
    }

    const textures = {
      brdf: makeBrdfTexture(imageMap.get(envData.brdf.url)),
      cubeMaps: {}
    } as GltfPbrEnvironmentTextures

    envData.cubeMaps.forEach(cubeMap => {
      textures.cubeMaps[cubeMap.name] = makeCubeMapTexture(imageMap)(cubeMap)
    })


    return {kind: GltfEnvironmentKind.PBR_IBL, data: envData, textures };
  }

  export const createGltfEmptyEnvironment = ():GltfEmptyEnvironment => ({
    kind: GltfEnvironmentKind.EMPTY
  })