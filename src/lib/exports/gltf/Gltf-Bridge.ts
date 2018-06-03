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
import {GltfExtensions} from "../../internal/gltf/gltf-parse/extensions/Gltf-Parse-Extensions";
import {createVec3} from "../common/array/Array";
import {updateNodeListTransforms} from "../common/nodes/Nodes";
import {updateRuntimeShaderConfig} from "../../internal/gltf/gltf-parse/Gltf-Parse-Primitive-Shader";
import {forEachNodes, findNode, countNodes } from "../common/nodes/Nodes";
import {updateCameraWithTransform, getCameraView, getCameraProjection} from "../common/camera/Camera";
import {renderScene as _renderScene} from "../../internal/gltf/renderer/Gltf-Renderer";
import {
WebGlRenderer,
    GltfCameraNode,
    CameraNode,
    CameraKind,
    NodeKind,
    WebGlBufferInfo,WebGlBufferData,
    LightNode,
    GltfMeshNode,
    GltfPrimitive,
    GltfNodeKind,
    GLTF_ORIGINAL,
    GLTF_ORIGINAL_Scene,
    GltfScene,
    Camera,
    GltfNode,
    GltfInitConfig,
    GltfData,
    TypedNumberArray,
    GltfIblScene,
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

export const gltf_load = ({ renderer, path, config, mapper }: GltfLoaderOptions) => {

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
            assets,
            config
        });

        const primitives = GLTF_PARSE_createPrimitives({ renderer, data });

        _data = data;
        _allNodes = GLTF_PARSE_getNodes({gltf, primitives, data, assets});
    }

    const updatePrimitives = (scene:GltfScene) => (mapper: (primitive:GltfPrimitive) => GltfPrimitive):GltfScene => {
            
        return Object.assign({}, scene, {
            nodes: scene.nodes.map(node =>
                node.kind === GltfNodeKind.MESH
                ?   Object.assign({}, node, {
                            primitives: node.primitives.map(primitive => mapper(primitive))
                    })
                :   node
            )
        }) as GltfScene;
    }


    const updateShaderConfigs = (scene:GltfScene):GltfScene => {
        return updatePrimitives (scene) (primitive => updateRuntimeShaderConfig({
                    data: _data,
                    primitive,
                    scene
        }))
    }

    const renderScene = (scene:GltfScene) => {
        _renderScene (renderer) (_data) (scene);
    }

    const getOriginalScene = (camera:Camera) => (sceneNumber:number) => {
        let nodes = [] 

        if(sceneNumber >= 0 && _data.original.scenes[sceneNumber]) {
            const sceneList = _data.original.scenes[sceneNumber].nodes;
            
            forEachNodes<GltfNode>(node => {
                if(sceneList.indexOf(node.originalNodeId) !== -1) {
                    nodes.push(node);
                } 
            }) (_allNodes);
        } else {
            nodes = _allNodes;
            console.warn("no scene specified! Expect duplicate nodes...");
        }


        const originalScene = sceneNumber >= 0 
            ?   _data.original.scenes[sceneNumber]
            :   {
                    nodes: _data.original.nodes.map((node, idx) => idx)
                }
            
        //const nodes =_allNodes.filter((node, idx) => originalScene.nodes.indexOf(idx) !== -1);

    

        const scene = 
            GltfExtensions
                .map(ext => ext.createScene)
                .reduce((acc, val) => 
                    acc = val (_data.original) (originalScene) (acc),
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

       //First time is mandatory - after that it's up to the caller
       return updateShaderConfigs(scene);

    }

    const getCameraNode = (index:number):GltfCameraNode => {
        const node = 
            findNode<GltfNode>
                (node => node.kind === NodeKind.CAMERA && node.cameraIndex === index)
                (_allNodes) as GltfCameraNode;

        if(!node) {
            return undefined;
        }

        const camera = Object.assign({}, node.camera);

        if(camera.kind === CameraKind.PERSPECTIVE && camera.aspectRatio === undefined) {
            camera.aspectRatio = renderer.canvas.width / renderer.canvas.height;
        }
        
        return Object.assign({}, node, {camera: updateCameraWithTransform(node.transform) ( camera)})
    }

    const bridge:GltfBridge = {
        renderer,
        getAllNodes: () => _allNodes,
        getData: () => _data,
        getOriginalScene,
        getCameraNode,
        loadFile,
        loadAssets,
        start,
        renderScene,
        updateShaderConfigs,
    };

    Object.assign(exports, bridge);

    return exports;
}


