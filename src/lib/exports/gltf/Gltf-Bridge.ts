import {mat4} from "gl-matrix";

import {
    GLTF_PARSE_CreateData,
    GLTF_PARSE_LoadDataAssets
} from '../../internal/gltf/gltf-parse/Gltf-Parse-Data';
import { GLTF_PARSE_getOriginalFromArrayBuffer } from "../../internal/gltf/gltf-parse/Gltf-Parse-File";
import {GLTF_PARSE_createPrimitives} from "../../internal/gltf/gltf-parse/Gltf-Parse-Primitives";
import {GLTF_PARSE_createScene} from "../../internal/gltf/gltf-parse/Gltf-Parse-Scene";
import {GLTF_PARSE_getNodes} from "../../internal/gltf/gltf-parse/Gltf-Parse-Nodes";
import { getDefaultInitConfig, prepWebGlRenderer } from '../../internal/gltf/init/Gltf-Init';
import { getBasePath } from "../../internal/common/Basepath";
import {createVec3} from "../common/array/Array";
import {fetchArrayBuffer} from "../../internal/common/FetchUtils";
import {mapNodes, updateNodeListTransforms} from "../common/nodes/Nodes";
import {findNode, countNodes} from "../common/nodes/Nodes";
import {getCameraFromNodeAndCanvas} from "../common/camera/Camera";
import {
    setCameraPositionFromTransform,
    setCameraViewFromTransform,
    setCameraProjectionFromSettings
} from "../common/camera/Camera";
import {GltfAnimator} from "../../types/gltf/Gltf-Animation-Types";

import {renderScene as _renderScene} from "../../internal/gltf/renderer/Gltf-Renderer";
import {gltf_updateNodeTransforms} from "./Gltf-Nodes";
import {gltf_updateShaderConfigs} from "./Gltf-Shaders";

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
        .then(({gltf, glbBuffers}) => {
            gltf = mapper ? mapper(gltf) : gltf;
            return bridge.loadAssets({gltf, glbBuffers, basePath: getBasePath(path)})
                .then(assets => ({gltf, config, assets}));
            
        })
        .then(bridge.start)
        .then(() => bridge);
}

function createGltfBridge(renderer:WebGlRenderer) {
    const exports = {} as GltfBridge;

    let _allNodes:Array<GltfNode>;
    let _data: GltfData;

    const loadFile = (path:string) => 
        fetchArrayBuffer(path).then(GLTF_PARSE_getOriginalFromArrayBuffer)

    const loadAssets = ({gltf, basePath, glbBuffers}:{gltf:GLTF_ORIGINAL, basePath?: string, glbBuffers:Array<ArrayBuffer>}) => 
        GLTF_PARSE_LoadDataAssets({ basePath: basePath ? basePath : "", gltf, glbBuffers})

    const start = ({gltf, assets, config}:{gltf: GLTF_ORIGINAL, assets: GltfDataAssets, config?:GltfInitConfig}) => {

        const data = GLTF_PARSE_CreateData({
            gltf, 
            renderer,
            assets,
            config: config === undefined ? getDefaultInitConfig() : config
        });

        const primitives = GLTF_PARSE_createPrimitives({ renderer, data });

        _data = data;
        _allNodes = GLTF_PARSE_getNodes({gltf, primitives, data, assets});
    }



    const renderScene = (scene:GltfScene) => {
        _renderScene (renderer) (_data) (scene);
    }

    const getCameraNode = (nodes:Array<GltfNode>) => (index:number) :GltfCameraNode => {
        const node = 
            findNode<GltfNode>
                (node => node.kind === NodeKind.CAMERA && node.cameraIndex === index)
                (nodes) as GltfCameraNode;

        if(!node) {
            return undefined;
        }

        const camera = getCameraFromNodeAndCanvas(node) (renderer.canvas);
                        
        return Object.assign({}, node, {camera}) 
    }

    const getOriginalScene = (camera?:Camera) => (sceneNumber:number):GltfScene => {

        const partialScene = GLTF_PARSE_createScene 
                ({
                    renderer,
                    data: _data,
                    allNodes: _allNodes
                })
                (sceneNumber)

        //this might not be necessary since nodes are given transforms when created
        //but better safe than sorry!
        let nodes = updateNodeListTransforms <GltfNode>({
                            updateLocal: true,
                            updateModel: true,
                            updateView: false,
                            updateLightDirection: true,
                        })
                        (null)
                        (partialScene.nodes);

        if(camera == null) {
            const cameraNode = getCameraNode(nodes) (0);
            camera = cameraNode.camera;
        }

        nodes = gltf_updateNodeTransforms ({
            updateLocal: false,
            updateModel: false,
            updateView: true,
            updateLightDirection: false,
            camera
        }) (partialScene.nodes);

        return gltf_updateShaderConfigs (Object.assign({}, partialScene, {nodes, camera}) as GltfScene);
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
    };

    Object.assign(exports, bridge);

    return exports;
}


