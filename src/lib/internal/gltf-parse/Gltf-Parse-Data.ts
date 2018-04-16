import { Future, parallel } from 'fluture';
import { fetchArrayBufferUrl, fetchImage, loadImageFromArrayBuffer } from 'fluture-loaders';
import { WebGlRenderer, WebGlShader } from 'webgl-simple';

import { GLTF_ORIGINAL, GltfData } from '../../Types';
import { prepWebGlRenderer } from '../webgl/WebGl-Helpers';
import { GLTF_PARSE_createAccessorData } from './Gltf-Parse-Data-Accessors';
import { GLTF_PARSE_createAnimations } from './Gltf-Parse-Data-Animation';
import { GLTF_PARSE_createTextures } from './Gltf-Parse-Data-Textures';



//Pure data loaders

const loadBuffers = ({ basePath, gltf, glbBuffers }: { basePath: string, gltf: GLTF_ORIGINAL, glbBuffers?:Array<ArrayBuffer> }): Future<any, Array<ArrayBuffer>> => 
  parallel(Infinity, gltf.buffers.map((buffer, bufferIndex) =>
  glbBuffers !== undefined && bufferIndex < glbBuffers.length
      ? Future.of(glbBuffers[bufferIndex].slice(0, buffer.byteLength))
      : buffer.uri.indexOf("data:") === 0
        ? fetchArrayBufferUrl(buffer.uri)
        : fetchArrayBufferUrl(basePath + buffer.uri)
  ));

const loadImages = ({ basePath, gltf, buffers }: { basePath: string, gltf: GLTF_ORIGINAL, buffers: Array<ArrayBuffer> }): Future<any, Array<HTMLImageElement>> => {
  const getImageBufferData = (bufferViewId: number): ArrayBuffer => {
    const bufferView = gltf.bufferViews[bufferViewId];
    const bufferId = bufferView.buffer;
    const offset = bufferView.byteOffset === undefined ? 0 : bufferView.byteOffset;

    return buffers[bufferId].slice(offset, offset + bufferView.byteLength);
  }

  //load texture data
  return parallel(Infinity, !gltf.images || !gltf.images.length
    ? []
    : gltf.images.map(image => 
      image.bufferView
        ? loadImageFromArrayBuffer({ data: getImageBufferData(image.bufferView), mimeType: image.mimeType })
        : image.uri.indexOf("data:") === 0
          ? fetchImage(image.uri) //untested
          : fetchImage(basePath + image.uri)
    )
  )
}

//Tools for processing and loading data

export const GLTF_PARSE_LoadDataAssets = ({basePath, gltf, glbBuffers}:{basePath:string, gltf:GLTF_ORIGINAL, glbBuffers?:Array<ArrayBuffer>}) => 
  loadBuffers({basePath, gltf, glbBuffers})
    .chain((buffers: Array<ArrayBuffer>) => 
      loadImages({basePath, gltf, buffers})
        .map(imageElements => ({
          buffers, imageElements
        }))
      );
      
export const GLTF_PARSE_CreateData = ({ gltf, imageElements, renderer, buffers }: { gltf: GLTF_ORIGINAL, imageElements: Array<HTMLImageElement>, renderer: WebGlRenderer, buffers: Array<ArrayBuffer> }): GltfData => {
  prepWebGlRenderer(renderer);
  const textures = GLTF_PARSE_createTextures({ renderer, gltf, imageElements });
  const accessors = GLTF_PARSE_createAccessorData({ gltf, buffers, renderer });
  const animations = GLTF_PARSE_createAnimations({ gltf, accessors });
  const shaders = new Map<number, WebGlShader>();
  const vaoIds = new Map<number, Symbol>();
  return {
    original: gltf,
    animations,
    accessors,
    textures,
    shaders,
    vaoIds
  }
}
