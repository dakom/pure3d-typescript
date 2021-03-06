import {
    WebGlConstants,
    WebGlRenderer,
    WebGlBufferData,
    WebGlBufferInfo,
    GltfShaderConfig_Primitive,
    GltfShaderConfig_Scene,
    GltfPrimitive,
    GltfIblShaderConfig,
    WebGlShaderSource,
    GltfData,
    CameraNode,
    GltfMeshNode,
    GltfNode,
    GltfScene,
    GltfIblExtensionName,
    GltfIblDataAssets,
    GltfIblJson,
    GltfIblData,
    GLTF_ORIGINAL,
    GLTF_ORIGINAL_MeshPrimitive,
    GLTF_ORIGINAL_Node,
    GLTF_ORIGINAL_Scene,
    GltfDataAssets,
    PerspectiveCameraSettings,
    OrthographicCameraSettings,
    LightNode,
    DirectionalLight,
    PointLight,
    SpotLight,
    GLTF_PARSE_Extension,
    GltfIblConfig
} from "../../../../../Types"; 

import { createCubeTextureFromTarget, createTextureFromTarget} from "../../../../../exports/webgl/WebGl-Textures";
import { prepWebGlRenderer } from '../../../init/Gltf-Init';
import {getBasePath} from "../../../../common/Basepath";
import {fetchJson, fetchImage} from "../../../../common/FetchUtils";


import {
    createScene,
    createNode,
    initialShaderConfig_Primitive,
    runtimeShaderConfig_Primitive,
    runtimeShaderConfig_Scene,
} from "../Gltf-Parse-Extensions-Defaults";

const getIblConfig = (gltf:GLTF_ORIGINAL):GltfIblConfig => {
    if(gltf.extensionsUsed && gltf.extensionsUsed.indexOf(GltfIblExtensionName) !== -1) {
        return gltf.extensions[GltfIblExtensionName]
    }
    return null; 
}


const loadAssets = ({gltf, coreData}:{gltf:GLTF_ORIGINAL, coreData: any}):Promise<GltfDataAssets> => {
    const config = getIblConfig(gltf);
    const path = config ? config.path : "";

    if(path === "") {
        return Promise.resolve(coreData);
    }

    
    
    return fetchJson(path)
        .then(jsonData => {
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

                const imagePromises = imageUrls.map(url => fetchImage(basePath + url).then(img => ({url, img})));

                return Promise.all(imagePromises) 
                    .then(ldrs => {
                        const m = new Map<string, HTMLImageElement>();

                        ldrs.forEach(ldr => {
                            m.set(ldr.url, ldr.img);
                        });

                        return m;
                    })
                    .then(imageMap => ({jsonData, imageMap}))
        })
        .then(ibl => Object.assign({}, coreData, {extensions:
                Object.assign({}, coreData.extensions, {ibl})
        }));
}

const createData = ({gltf, assets, renderer}:{renderer:WebGlRenderer, gltf: GLTF_ORIGINAL, assets: GltfDataAssets}) => (data:GltfData): GltfData => {
    if(!assets.extensions.ibl) {
        return data
    }

    prepWebGlRenderer(renderer);

    const gl = renderer.gl;
    const {jsonData, imageMap} = assets.extensions.ibl;


    const makeBrdfTexture =
        createTextureFromTarget
    ({
        gl,
        format: jsonData.brdf.colorSpace,

        setParameters: () => {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false as any); // https://github.com/Microsoft/TypeScript/issues/27542
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
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false as any); // https://github.com/Microsoft/TypeScript/issues/27542
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

    const ibl = {
        brdf: makeBrdfTexture(imageMap.get(jsonData.brdf.url)),
        cubeMaps: {} as any,
        useLod: false
    }

    Object.keys(jsonData.cubeMaps).forEach(cubeMapName => {
        const cubeMap = jsonData.cubeMaps[cubeMapName];
        if(cubeMap.urls.length > 1) {
           ibl.useLod = true;
        }
        ibl.cubeMaps[cubeMapName] = makeCubeMapTexture(imageMap) (cubeMapName) (jsonData.cubeMaps[cubeMapName]);
    })


    return Object.assign({}, data, {extensions: 
        Object.assign({}, data.extensions, {ibl})
    });
}


const initialShaderConfig_Scene = (data:GltfData) => (scene:GltfScene) => (shaderConfig:GltfShaderConfig_Scene):GltfShaderConfig_Scene => 
    data.extensions.ibl 
        ?   Object.assign({}, shaderConfig, { 
                ibl: {
                        useLod: data.extensions.ibl.useLod
                    }
                }
            )

        :   shaderConfig;



const getShaderSource = (data:GltfData) => (sceneShaderconfig:GltfShaderConfig_Scene) => (primitiveShaderConfig: GltfShaderConfig_Primitive) => (source:WebGlShaderSource):WebGlShaderSource => { 
    if(data.extensions.ibl) {
        const defines = [];

        defines.push("USE_IBL");

        if(data.extensions.ibl.useLod) {
            defines.push("USE_TEX_LOD");
        }

        const defineString = defines.map(value => `#define ${value} 1\n`).join('');
        return Object.assign({}, source, {
            vertex: defineString + source.vertex,
            fragment: defineString + source.fragment
        })

    }

    return source;
}

export const GLTF_PARSE_Extension_Ibl:GLTF_PARSE_Extension = {
    loadAssets,
    createData,
    createScene,
    createNode,
    initialShaderConfig_Primitive,
    runtimeShaderConfig_Primitive,
    initialShaderConfig_Scene,
    runtimeShaderConfig_Scene,
    getShaderSource
}
