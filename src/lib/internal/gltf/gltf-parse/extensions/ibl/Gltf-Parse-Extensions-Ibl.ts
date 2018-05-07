import {
    WebGlConstants,
    WebGlRenderer,
    WebGlBufferData,
    WebGlBufferInfo,
    GltfIbl,
    GltfIblDataAssets,
    GltfIblJson,
    GltfIblData,
    GLTF_ORIGINAL,
    GLTF_ORIGINAL_MeshPrimitive,
    GltfDataAssets
} from "../../../../../Types"; 

import { Future, parallel } from 'fluture';
import { fetchImage, fetchJsonUrl } from 'fluture-loaders';
import { createCubeTextureFromTarget, createTextureFromTarget} from "../../../../../exports/webgl/WebGl-Textures";
import { prepWebGlRenderer } from '../../../init/Gltf-Init';
import {getBasePath} from "../../../../common/Basepath";

const hasIbl = (gltf:GLTF_ORIGINAL):boolean => {
    
    //TODO inspect gltf itself
    return true; 
}

export const GLTF_PARSE_loadIblAssets = ({gltf, coreData}:{gltf:GLTF_ORIGINAL, coreData: any}):Future<any, GltfDataAssets> => {
    if(!hasIbl(gltf)) {
        return Future.of(coreData);
    }

    const path = "static/world/world.json"; //TODO - inspect gltf itself
    
    
    return (fetchJsonUrl(path) as Future<any, GltfIblJson>)
        .chain(jsonData => {
                const basePath = getBasePath(path);

                const imageUrls  = Array<string>();

                imageUrls.push(jsonData.brdf.url);

                const cubeMapNames = Object.keys(jsonData.cubeMaps);

                cubeMapNames.forEach(cubeMapName => {
                    const cubeMap = jsonData.cubeMaps[cubeMapName];

                    cubeMap.urls.forEach(list => {
                        list.forEach(url => {
                            imageUrls.push(cubeMapName + "/" + url);
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
                    .map(imageMap => ({jsonData, imageMap}))
        })
        .map(ibl => Object.assign({}, coreData, {extensions:
                Object.assign({}, coreData.extensions, {ibl})
        }));
}

export const GLTF_PARSE_createIblData = ({gltf, assets, renderer}:{renderer:WebGlRenderer, gltf: GLTF_ORIGINAL, assets: GltfDataAssets}): GltfIblData => {
    prepWebGlRenderer(renderer);

    const gl = renderer.gl;
    const {jsonData, imageMap} = assets.extensions.ibl;


    const makeBrdfTexture =
        createTextureFromTarget
    ({
        gl,
        format: jsonData.brdf.colorSpace,

        setParameters: () => {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
            gl.texParameteri(WebGlConstants.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(WebGlConstants.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(WebGlConstants.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(WebGlConstants.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        }
    })

    const makeCubeMapTexture = (images: Map<string, HTMLImageElement>) => (cubeMapName:string) => ({colorSpace, urls}:{colorSpace:number, urls: Array<Array<string>>}): WebGLTexture => {
        const faces = ["posX", "negX", "posY", "negY", "posZ", "negZ"];


        let mipLevels = [];
        urls.forEach(list => {
            const mipLevel = {};

            list.forEach((url, faceIndex) => {
                const img = images.get(cubeMapName + "/" + url);
                mipLevel[faces[faceIndex]] = img;
            })

            mipLevels.push(mipLevel);
        });

        return createCubeTextureFromTarget({
            gl,
            format: colorSpace, 
            setParameters: opts => {
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                if (urls.length > 1) {
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

    const data = {
        brdf: makeBrdfTexture(imageMap.get(jsonData.brdf.url)),
        cubeMaps: {} as any,
        useLod: false
    }

    Object.keys(jsonData.cubeMaps).forEach(cubeMapName => {
        const cubeMap = jsonData.cubeMaps[cubeMapName];
        if(cubeMap.urls.length > 1) {
            data.useLod = true;
        }
        data.cubeMaps[cubeMapName] = makeCubeMapTexture(imageMap) (cubeMapName) (jsonData.cubeMaps[cubeMapName]);
    })


    return data 
}


export const GLTF_PARSE_createIblScene = (gltf:GLTF_ORIGINAL):GltfIbl =>  {
    //TODO, get from GLTF
    
    return {
        scaleDiffBaseMR: Float64Array.from([0.0, 0.0, 0.0, 0.0]),
        scaleFGDSpec: Float64Array.from([0.0, 0.0, 0.0, 0.0]),
        scaleIBLAmbient: Float64Array.from([1.0, 1.0, 0.0, 0.0]),
    }
}
