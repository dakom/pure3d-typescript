import { Future, parallel } from 'fluture';
import { fetchJsonUrl, fetchArrayBuffer, fetchImage, fetchArrayBufferUrl } from 'fluture-loaders';
import { WebGlRenderer, createCubeTextureFromTarget, createTextureFromTarget, WebGlConstants } from 'webgl-simple';

import {
  GLTF_PARSE_CreateData,
  GLTF_PARSE_LoadDataAssets
} from '../internal/gltf-parse/Gltf-Parse-Data';
import { GLTF_ORIGINAL, GltfScene, GltfCamera, GltfLighting, GltfNode, GltfInitConfig, GltfData, GltfEnvironment, GltfEmptyEnvironment, GltfPbrEnvironment, GltfPbrEnvironmentCubeMap, GltfPbrEnvironmentData, GltfPbrEnvironmentTextures, TypedNumberArray } from '../Types';
import { GLTF_PARSE_createScene } from '../internal/gltf-parse/Gltf-Parse-Scene';
import { GLTF_PARSE_getOriginalFromArrayBuffer } from "../internal/gltf-parse/Gltf-Parse-File";
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
  private _scene: GltfScene;
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

  private _initScene(config: GltfInitConfig) {
    this._scene = GLTF_PARSE_createScene({
      renderer: this._renderer,
      environment: this._environment,
      data: this._data,
      config
    });
  }

  public cloneOriginalScene() {
    return parseScene(serializeScene(this._scene));
  }

  public loadGltf({ path, config }: { path: string, config: GltfInitConfig }): Future<any, void> {
    return this._loadData(path)
      .map(() => this._initScene(config));
  }

  public loadEnvironment(path: string): Future<any, GltfEnvironment> {
    return this._loadEnvironment(path);
  }

  public renderScene(scene:GltfScene) {
    const renderThunks = new Map<number, Array<() => void>>();
  
    scene.nodes
      .filter(node => node.transform.model !== undefined)
      .forEach((node, nodeIndex) =>
        node.primitives.forEach((primitive, primitiveIndex) => {
          if (!renderThunks.has(primitive.shaderIdLookup)) {
            renderThunks.set(primitive.shaderIdLookup, []);
          }
  
          renderThunks
            .get(primitive.shaderIdLookup)
            .push(createRendererThunk({ bridge: this, scene, nodeIndex, primitiveIndex }));
        })
      )
  
    renderThunks.forEach(thunks => thunks.forEach(fn => fn()));
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


