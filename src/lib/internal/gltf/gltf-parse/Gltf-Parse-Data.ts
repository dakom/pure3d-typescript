import { Future, parallel } from 'fluture';
import { fetchArrayBufferUrl, fetchImage, loadImageFromArrayBuffer } from 'fluture-loaders';
import { GltfInitConfig, WebGlRenderer, WebGlShader, WebGlBufferData, WebGlBufferInfo} from '../../../Types';

import { GLTF_ORIGINAL, GltfData, GltfDataAssets } from '../../../Types';
import { prepWebGlRenderer } from '../init/Gltf-Init';
import { GLTF_PARSE_createAttributes} from './Gltf-Parse-Data-Attributes';
import { GLTF_PARSE_createAnimations } from './Gltf-Parse-Data-Animation';
import { GLTF_PARSE_createTextures } from './Gltf-Parse-Data-Textures';
import {GltfExtensions} from "./extensions/Gltf-Parse-Extensions";

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
            image.bufferView !== undefined
                ? loadImageFromArrayBuffer({ data: getImageBufferData(image.bufferView), mimeType: image.mimeType })
                : image.uri.indexOf("data:") === 0
                    ? fetchImage(image.uri) //untested
                    : fetchImage(basePath + image.uri)
        )
    )
}


//Tools for processing and loading data

export const GLTF_PARSE_LoadDataAssets = ({basePath, gltf, glbBuffers}:{basePath:string, gltf:GLTF_ORIGINAL, glbBuffers?:Array<ArrayBuffer>}):Future<any, GltfDataAssets> => 
    GltfExtensions
        .map(ext => ext.loadAssets)
        .reduce((acc, fn) => (acc = acc.chain(coreData => fn({gltf, coreData})), acc),
            loadBuffers({basePath, gltf, glbBuffers})
                .chain((buffers: Array<ArrayBuffer>) => 
                    loadImages({basePath, gltf, buffers})
                        .map(imageElements => ({
                            buffers, imageElements, extensions: {}
                        }))
                )
        );


export const GLTF_PARSE_CreateData = ({ gltf, assets, renderer, config }: { config: GltfInitConfig, gltf: GLTF_ORIGINAL, assets: GltfDataAssets, renderer: WebGlRenderer}): GltfData => {
    prepWebGlRenderer(renderer);

    const {imageElements, buffers} = assets;

    const textures = GLTF_PARSE_createTextures({ renderer, gltf, imageElements });

    const attributes = GLTF_PARSE_createAttributes({ gltf, buffers, renderer });
    
    const animations = GLTF_PARSE_createAnimations({ gltf, buffers});

    const shaders = new Map<string, WebGlShader>();
    
    return GltfExtensions
        .map(ext => ext.createData)
        .reduce((acc, val) => (acc = val ({gltf, assets, renderer}) (acc), acc), 
        {
            original: gltf,
            animations,
            attributes,
            textures,
            shaders,
            initConfig: config,
            extensions: {}
        }
    );

}
