import { createWebGlRenderer, WebGlConstants, WebGlRenderer, createSimpleTextureFromTarget  } from "lib/Lib";
import { createQuadRenderer, SHADER_ID as quadShaderId } from "./quad-renderer/Quad-Renderer";
import {fetchImage} from "fluture-loaders";
import { mat4 } from "gl-matrix";
import {Future} from "fluture";

export const startQuad =  (renderer:WebGlRenderer) => (assetPath:string) => { 


  //Setup element renderers
  const renderQuad = createQuadRenderer(renderer);
  //Setup camera
  const cameraMatrix = mat4.ortho(new Float64Array(16) as any, 0, window.innerWidth, 0, window.innerHeight, 0, 1);

  //Load texture
  return fetchImage(assetPath + "sprites/fireball/fireball.png")
    .map(img => [img, createSimpleTextureFromTarget({gl: renderer.gl, alpha: true, flipY: true}) (img)])
    .map(([img, texture]:[HTMLImageElement, WebGLTexture]) => {
      //Setup element
      const quadElement = {
        img,
        rendererId: quadShaderId,
        width: img.naturalWidth,
        height: img.naturalHeight,
        texture,
        clipSpace: mat4.multiply(mat4.create(), cameraMatrix as any, mat4.fromTranslation(mat4.create(), [(window.innerWidth - img.naturalWidth)/2,(window.innerHeight - img.naturalHeight)/2,0])) //position in top-left corner
      }

      //render!
      return () => {
        renderer.gl.clear(WebGlConstants.COLOR_BUFFER_BIT | WebGlConstants.DEPTH_BUFFER_BIT);
        renderQuad(quadElement);
 
      }
    });
}

  
