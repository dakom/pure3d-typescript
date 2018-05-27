import {WebGlRenderer, WebGlBufferData, WebGlBufferInfo} from "../../../Types";

const HAS_PREPPED = Symbol();

//This only happens once and it won't hurt to call when in doubt
//Only used at init/loading
export const prepWebGlRenderer = (renderer: WebGlRenderer) => {

  if (renderer.extras[HAS_PREPPED] !== true) {
    if (renderer.version > 1) {
      throw new Error("GLTF Renderering only supports WebGL 1.0 for now");
    }


    renderer.getExtension('OES_standard_derivatives');
    renderer.getExtension('EXT_shader_texture_lod');
    renderer.getExtension('EXT_SRGB');

    renderer.gl.enable(renderer.gl.DEPTH_TEST);

    renderer.gl.depthFunc(renderer.gl.LEQUAL);

    renderer.extras[HAS_PREPPED] = true;
  }

}
