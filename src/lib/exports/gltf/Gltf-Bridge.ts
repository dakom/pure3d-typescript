import { Future, parallel } from 'fluture';
import { fetchJsonUrl, fetchArrayBuffer, fetchImage, fetchArrayBufferUrl } from 'fluture-loaders';
import {mat4} from "gl-matrix";

import {
    GLTF_PARSE_CreateData,
    GLTF_PARSE_LoadDataAssets
} from '../../internal/gltf/gltf-parse/Gltf-Parse-Data';
import { GLTF_PARSE_getOriginalFromArrayBuffer } from "../../internal/gltf/gltf-parse/Gltf-Parse-File";
import {GLTF_PARSE_createPrimitives} from "../../internal/gltf/gltf-parse/Gltf-Parse-Primitives";
import {GLTF_PARSE_getNodes} from "../../internal/gltf/gltf-parse/Gltf-Parse-Nodes";
import { prepWebGlRenderer } from '../../internal/gltf/init/Gltf-Init';
import { getBasePath } from "../../internal/common/Basepath";
import {serializeScene, parseScene} from "./Gltf-Scene";
import { createRendererThunk } from '../../internal/gltf/renderer/Gltf-Renderer-Thunk';
import {GltfExtensions} from "../../internal/gltf/gltf-parse/extensions/Gltf-Parse-Extensions";
import {createVec3} from "../common/array/Array";
import {updateNodeListTransforms} from "../common/nodes/Nodes";

import {
WebGlRenderer,
    CameraNode,
    NodeKind,
    WebGlBufferInfo,WebGlBufferData,
    LightNode,
    GltfMeshNode,
    GltfNodeKind,
    GLTF_ORIGINAL,
    GLTF_ORIGINAL_Scene,
    GltfScene,
    Camera,
    GltfNode,
    GltfInitConfig,
    GltfData,
    TypedNumberArray,
    GltfIbl,
    GltfBridge,
    GltfDataAssets,
} from '../../Types';
/*
  Generally speaking, users create a world and then copy/modify the resulting scene
  This is because the original scene is created at the same time as setting the cache

  Still, there are a few slightly different helpers to allow *loading* the world in a variety of ways
 */

//simple helper - the usual entry point
export interface GltfLoaderOptions {
    renderer: WebGlRenderer;
    path: string;
    config?: GltfInitConfig;
    mapper?: (gltf:GLTF_ORIGINAL) => GLTF_ORIGINAL;
}

export const loadGltf = ({ renderer, path, config, mapper }: GltfLoaderOptions) => {

    const bridge = createGltfBridge(renderer);

    return bridge
        .loadFile(path)
        .chain(({gltf, glbBuffers}) => {
            gltf = mapper ? mapper(gltf) : gltf;

            return bridge.loadAssets({gltf, glbBuffers, basePath: getBasePath(path)})
                .map(assets => ({gltf, config, assets}));
            
        })
        .map(bridge.start)
        .map(() => bridge);
}

function createGltfBridge(renderer:WebGlRenderer) {
    const exports = {} as GltfBridge;

    let _allNodes:Array<GltfNode>;
    let _data: GltfData;

    const loadFile = (path:string) => 
        fetchArrayBufferUrl(path).map(GLTF_PARSE_getOriginalFromArrayBuffer)

    const loadAssets = ({gltf, basePath, glbBuffers}:{gltf:GLTF_ORIGINAL, basePath?: string, glbBuffers:Array<ArrayBuffer>}) => 
        GLTF_PARSE_LoadDataAssets({ basePath: basePath ? basePath : "", gltf, glbBuffers})

    const start = ({gltf, assets, config}:{gltf: GLTF_ORIGINAL, assets: GltfDataAssets, config:GltfInitConfig}) => {

        const data = GLTF_PARSE_CreateData({
            gltf, 
            renderer,
            assets        
        });

        const primitives = GLTF_PARSE_createPrimitives({
            renderer, 
            data,
            config
        });

        _data = data;
        _allNodes = GLTF_PARSE_getNodes({gltf, primitives, data});
    }



    const renderScene = (scene:GltfScene) => {

        const renderThunks = new Map<number, Array<() => void>>();
        const meshList = new Array<GltfMeshNode>();
        const lightList = new Array<LightNode>();
        const addToRenderList = (list:Array<any>) => (pred:((n:GltfNode) => boolean)) => (node:GltfNode) => {
            if(pred(node)) {   
                list.push(node);
            }
            if(node.children) {
                node.children.forEach((node:GltfNode) => addToRenderList (list) (pred) (node));
            }
        }
        scene.nodes.forEach(addToRenderList
            (meshList) 
            (
                node => node.kind === GltfNodeKind.MESH && node.transform && node.transform.modelViewProjectionMatrix ? true : false
            )
        );
        scene.nodes.forEach(addToRenderList
            (lightList) 
            (
                node => node.kind === NodeKind.LIGHT ? true : false
            )
        );


        meshList.forEach(node => 
            node.primitives.forEach(primitive => {
                if (!renderThunks.has(primitive.shaderId)) {
                    renderThunks.set(primitive.shaderId, []);
                }

                renderThunks
                    .get(primitive.shaderId)
                    .push(createRendererThunk({ 
                        renderer,
                        data: _data,
                        node,
                        primitive,
                        lightList,
                        scene
                    }));
            })
        );

        renderThunks.forEach(thunks => thunks.forEach(fn => fn()));
    }

    const getOriginalScene = (camera:Camera) => (sceneNumber:number) => {

        
        const originalScene = sceneNumber >= 0 
            ?   _data.original.scenes[sceneNumber]
            :   {
                    nodes: _allNodes.map((node, idx) => idx)
                }
            
        const nodes =_allNodes.filter((node, idx) => originalScene.nodes.indexOf(idx) !== -1);

    
        return GltfExtensions.map(ext => ext.createScene).reduce((acc, val) => acc = val (_data.original) (originalScene) (acc),
            {
                camera,
                extensions: {},
                nodes: updateNodeListTransforms <GltfNode>({
                    updateLocal: true,
                    updateModel: true,
                    updateView: true,
                    camera,
                })
                (null)
                (nodes)
            } as GltfScene
        );

    }

    const getOriginalCameras = ():Array<Camera> => {
       return _allNodes
            .filter(node => node.kind === NodeKind.CAMERA)
            .map((node:CameraNode) => {
                const camera:Camera = Object.assign({}, node.camera);
                camera.position = mat4.getTranslation(createVec3(), node.transform.localMatrix); 
                return camera
            });
    }

    const bridge:GltfBridge = {
        renderer,
        getAllNodes: () => _allNodes,
        getData: () => _data,
        getOriginalScene,
        getOriginalCameras,
        loadFile,
        loadAssets,
        start,
        renderScene
    };

    Object.assign(exports, bridge);

    return exports;
}


