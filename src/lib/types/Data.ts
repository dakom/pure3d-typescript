import {WebGlAttributeActivateOptions, WebGlShader} from "webgl-simple";
import {GLTF_ORIGINAL, GltfAnimationData, TypedNumberArray} from "../Types";

export interface GltfData {
  original: GLTF_ORIGINAL,
  animations: Array<GltfAnimationData>;
  accessors: GltfAccessorData;
  textures: Map<number, WebGLTexture>;
  shaders: Map<number, WebGlShader>;
  vaoIds: Map<number, Symbol>;
}

export type GltfAccessorData = Map<number, {
  values: TypedNumberArray;
  strategy: WebGlAttributeActivateOptions;
  rendererBufferId: Symbol;
}>