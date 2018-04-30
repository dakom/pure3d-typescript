import { createWebGlRenderer, WebGlConstants, WebGlRenderer, createSimpleTextureFromTarget } from "lib/Lib";
import { createSpriteSheetRenderer, SHADER_ID as spriteSheetShaderId, SpriteSheetElement } from "./spritesheet-renderer/Spritesheet-Renderer";
import { mat4 } from "gl-matrix";
import {fetchImage} from "fluture-loaders";
import {Future} from "fluture";

const getRandomSequence = ():number => {
  const getRandomInt = (max) => Math.floor(Math.random() * Math.floor(max));
  return getRandomInt(7);
}


export const startSpriteSheet = (renderer:WebGlRenderer) => (assetPath:string) => {


  //Setup element renderers
  const renderSprites = createSpriteSheetRenderer(renderer);

  //Setup camera
  const cameraMatrix = mat4.ortho(new Float64Array(16) as any, 0, window.innerWidth, 0, window.innerHeight, 0, 1);

  //Load texture
  return fetchImage(assetPath + "sprites/fireball/fireball.png")
    .map(img => [img, createSimpleTextureFromTarget({ gl: renderer.gl, alpha: true, flipY: true})(img)])
    .map(([img, texture]: [HTMLImageElement, WebGLTexture]) => {
      

      const cellSize = [64, 64];
      const textureSize = [img.naturalWidth, img.naturalHeight];
      const nSequences = textureSize[1] / cellSize[1];
      
      //Setup element
      const sprite = {
        width: 64,
        height: 64,
        uvScale: Float32Array.from([cellSize[0] / textureSize[0], cellSize[1] / textureSize[1]]),
        texture,
        clipSpace: mat4.multiply(mat4.create(), cameraMatrix as any, mat4.fromTranslation(mat4.create(), [(window.innerWidth-64)/2, (window.innerHeight-64)/2, 0])) 
      }


      //frame tracking
      let frameNumber = 0;
      let seq = 4; 

      const getFrame = (n:number): SpriteSheetElement => {
        const xOffset = n * (cellSize[0] / textureSize[0]);
        const yOffset = ((nSequences - seq)-1) * (cellSize[1] / textureSize[1]); //not sure why the yOffset needs to be flipped, e.g. subtracting from nSequences - but it works :P
        return {
          ...sprite,
          uvOffset: Float32Array.from([xOffset, yOffset])
        }
      }

      //render!
      return () => {
        renderer.gl.clear(WebGlConstants.COLOR_BUFFER_BIT | WebGlConstants.DEPTH_BUFFER_BIT);
        renderSprites(getFrame(frameNumber++));

        if(frameNumber > 7) {
          frameNumber = 0;
        }

      }

      //Every 3 seconds change the fireball direction
      //Disabled since cleaning it up in demo would be hectic
      //setInterval(() => seq = getRandomSequence(), 3000);
    });
}
