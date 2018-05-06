import {
    WebGlConstants,
    WebGlRenderer,
    WebGlBufferData,
    WebGlBufferInfo,
    GltfIbl,
    GltfIblDataAssets,
    GltfIblCubeMap,
    GltfIblData,
    GltfIblTextures,
    GLTF_ORIGINAL,
    GLTF_ORIGINAL_MeshPrimitive,
    GltfDataAssets
} from "../../../../../Types"; 

import { Future, parallel } from 'fluture';
import { fetchImage, fetchJsonUrl } from 'fluture-loaders';
import { createCubeTextureFromTarget, createTextureFromTarget} from "../../../../../exports/webgl/WebGl-Textures";
import { prepWebGlRenderer } from '../../../init/Gltf-Init';
import {getBasePath} from "../../../../common/Basepath";

export const GLTF_PARSE_hasIbl = (gltf:GLTF_ORIGINAL):boolean => {
    
    //TODO inspect gltf itself
    return true; 
}

export const GLTF_PARSE_loadIblAssets = ({gltf, coreData}:{gltf:GLTF_ORIGINAL, coreData: any}):Future<any, GltfDataAssets> => {
    if(!GLTF_PARSE_hasIbl(gltf)) {
        return Future.of(coreData);
    }

    const path = "static/world/world.json"; //TODO - inspect gltf itself
    
    
    return (fetchJsonUrl(path) as Future<any, GltfIblData>)
        .chain(envData => {
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
                    })
                    .map(imageMap => ({envData, imageMap}))
        })
        .map(ibl => Object.assign({}, coreData, {extensions:
                Object.assign({}, coreData.extensions, {ibl})
        }));
}

export const GLTF_PARSE_createIblData = ({gltf, assets, renderer}:{renderer:WebGlRenderer, gltf: GLTF_ORIGINAL, assets: GltfDataAssets}): GltfIbl => {
    prepWebGlRenderer(renderer);

    const gl = renderer.gl;
    const {envData, imageMap} = assets.extensions.ibl;


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

    const makeCubeMapTexture = (images: Map<string, HTMLImageElement>) => (cubeMap: GltfIblCubeMap): WebGLTexture => {
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
    } as GltfIblTextures

    envData.cubeMaps.forEach(cubeMap => {
        textures.cubeMaps[cubeMap.name] = makeCubeMapTexture(imageMap)(cubeMap)
    })


    //TODO, get from GLTF
    const light = {
        scaleDiffBaseMR: Float64Array.from([0.0, 0.0, 0.0, 0.0]),
        scaleFGDSpec: Float64Array.from([0.0, 0.0, 0.0, 0.0]),
        scaleIBLAmbient: Float64Array.from([1.0, 1.0, 0.0, 0.0]),
    }

    return {data: envData, textures, light };
}

