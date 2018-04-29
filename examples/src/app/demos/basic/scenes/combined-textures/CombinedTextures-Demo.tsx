import { createWebGlRenderer, WebGlConstants, WebGlRenderer,createTextureFromTarget} from "lib/Lib";
import { createCombinedTexturesRenderer, SHADER_ID as combinedTexturesShaderId, CombinedTexturesElement } from "./combined-textures-renderer/Combined-Textures-Renderer";
import { mat4 } from "gl-matrix";
import { createPerlinTexture } from "./PerlinTexture";
import {createSolidTexture} from "./SolidTexture";
import {Future} from "fluture";
import {renderer} from "utils/renderer/ExampleRenderer";

const perlinGreyscale = ({ x, y, noise }: { x: number, y: number, noise: number }): Array<number> => {
  const color = Math.round(255 * noise);

  return [color, color, color, color];
}


export const startCombinedTextures =  () => {

  //Setup element renderer
  const renderTextures = createCombinedTexturesRenderer(renderer);
  
  //Setup camera
  const cameraMatrix = mat4.ortho(new Float64Array(16) as any, 0, window.innerWidth, 0, window.innerHeight, 0, 1);

  //Prepare textures
  const width = 512;
  const height = 512;

  const imgTexture = createSolidTexture({
    gl: renderer.gl,
    width,
    height,
    style: "#0000FF"
  });

  const noiseTexture = createPerlinTexture({
    gl: renderer.gl,
    width,
    height,
    size: [.02, .07, .02],
    colorMapper: perlinGreyscale
  });

  //Setup element
  const element: CombinedTexturesElement = {
    width,
    height,
    noiseTexture,
    imgTexture,
    clipSpace: mat4.multiply(mat4.create(), cameraMatrix as any, mat4.fromTranslation(mat4.create(), [0, window.innerHeight - height, 0])) //position in top-left corner
  }

  //render!
  return Future.of(() => {
    renderer.gl.clear(WebGlConstants.COLOR_BUFFER_BIT | WebGlConstants.DEPTH_BUFFER_BIT);
    renderTextures(element);
  })
}
