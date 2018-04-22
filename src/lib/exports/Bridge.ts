import { Future, parallel } from 'fluture';
import { fetchJsonUrl, fetchArrayBuffer, fetchImage, fetchArrayBufferUrl } from 'fluture-loaders';
import { WebGlRenderer, createCubeTextureFromTarget, createTextureFromTarget, WebGlConstants } from 'webgl-simple';

import {
    GLTF_PARSE_CreateData,
    GLTF_PARSE_LoadDataAssets
} from '../internal/gltf-parse/Gltf-Parse-Data';
import {GltfLightNode, GltfMeshNode, GltfNodeKind, GLTF_ORIGINAL, GltfScene, GltfCamera, GltfNode, GltfInitConfig, GltfData, GltfEnvironment, GltfEmptyEnvironment, GltfPbrEnvironment, GltfPbrEnvironmentCubeMap, GltfPbrEnvironmentData, GltfPbrEnvironmentTextures, TypedNumberArray } from '../Types';
import { GLTF_PARSE_getOriginalFromArrayBuffer } from "../internal/gltf-parse/Gltf-Parse-File";
import {GLTF_PARSE_createPrimitives} from "../internal/gltf-parse/Gltf-Parse-Primitives";
import {GLTF_PARSE_getNodes} from "../internal/gltf-parse/Gltf-Parse-Nodes";
import { prepWebGlRenderer } from '../internal/webgl/WebGl-Helpers';
import { getBasePath } from "../internal/utils/Basepath";
import { loadGltfPbrEnvironmentImages, createGltfPbrEnvironment, createGltfEmptyEnvironment } from "../internal/environment/Environment-Helpers";
import {serializeScene, parseScene} from "./Scene";
import { createRendererThunk } from '../internal/renderer/Renderer-Thunk';

/*
  Generally speaking, users create a world and then copy/modify the resulting scene
  This is because the original scene is created at the same time as setting the cache

  Still, there are a few slightly different helpers to allow *loading* the world in a variety of ways
 */

//The usual entry point
export const loadGltfBridge = ({ renderer, environmentPath, gltfPath, config }: { renderer: WebGlRenderer, environmentPath?: string, gltfPath: string, config: GltfInitConfig }): Future<any, GltfBridge> => {
    const controller = new GltfBridge(renderer);

    return controller.loadEnvironment(environmentPath)
        .chain(() => controller.loadGltf({ path: gltfPath, config }))
        .map(() => controller);
}

//But environment/gltf can be loaded separately (untested so far)
export class GltfBridge {
    private _allNodes:Array<GltfNode>;
    private _data: GltfData;
    private _environment: GltfEnvironment;

    constructor(private _renderer: WebGlRenderer) { }

    private _loadData(path: string): Future<any, GltfData> {
        return fetchArrayBufferUrl(path)
        .map(GLTF_PARSE_getOriginalFromArrayBuffer)
        .chain(([gltf, glbBuffers]) =>
            GLTF_PARSE_LoadDataAssets({ basePath: getBasePath(path), gltf, glbBuffers })
            .map(assets => [gltf, assets] as [GLTF_ORIGINAL, any])
        )
        .map(([gltf, assets]) =>
            GLTF_PARSE_CreateData({
                ...assets, gltf, renderer: this._renderer,
            })
        )
        .map(data => this._data = data)
    }

    private _loadEnvironment(path: string): Future<any, GltfEnvironment> {
        return path === undefined || path === null || path === ""
        ? Future.of(createGltfEmptyEnvironment())
        : (fetchJsonUrl(path) as Future<any, any>)
        .chain((envData: GltfPbrEnvironmentData) =>
            loadGltfPbrEnvironmentImages({ path, envData })
            .map(imageMap => createGltfPbrEnvironment({ renderer: this._renderer, envData, imageMap }))
        )
        .map(environment => this._environment = environment);
    }

    private _initNodes(config: GltfInitConfig) {

        const gltf = this._data.original;


        const primitives = GLTF_PARSE_createPrimitives({
            renderer: this.renderer, 
            environment: this.environment, 
            data: this._data, 
            config
        });


        this._allNodes = GLTF_PARSE_getNodes({gltf, primitives});

    }


    public loadGltf({ path, config }: { path: string, config: GltfInitConfig }): Future<any, void> {
        return this._loadData(path)
        .map(() => this._initNodes(config));
    }

    public loadEnvironment(path: string): Future<any, GltfEnvironment> {
        return this._loadEnvironment(path);
    }

    public renderScene(scene:GltfScene) {
        const renderThunks = new Map<number, Array<() => void>>();
        const meshList = new Array<GltfMeshNode>();
        const lightList = new Array<GltfLightNode>();
        const addToRenderList = (list:Array<any>) => (pred:((n:GltfNode) => boolean)) => (node:GltfNode) => {
            if(pred(node)) {   
                list.push(node);
            }
            if(node.children) {
                node.children.forEach(node => addToRenderList (list) (pred) (node));
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
                node => node.kind === GltfNodeKind.LIGHT ? true : false
            )
        );


        meshList.forEach(node => 
            node.primitives.forEach(primitive => {
                if (!renderThunks.has(primitive.shaderIdLookup)) {
                    renderThunks.set(primitive.shaderIdLookup, []);
                }

                renderThunks
                    .get(primitive.shaderIdLookup)
                    .push(createRendererThunk({ 
                        bridge: this,
                        node,
                        primitive,
                        lightList,
                        ibl: scene.ibl
                    }));
            })
        );

        renderThunks.forEach(thunks => thunks.forEach(fn => fn()));
    }

    public get allNodes() {
        return this._allNodes;
    }

    public getOriginalSceneNodes(sceneNumber:number) {
        const originalScene = this.data.original.scenes[sceneNumber];

        return this._allNodes.filter((node, idx) => originalScene.nodes.indexOf(idx) !== -1);
    }

    public get renderer() {
        return this._renderer;
    }

    public get data() {
        return this._data;
    }

    public get environment() {
        return this._environment;
    }
}


