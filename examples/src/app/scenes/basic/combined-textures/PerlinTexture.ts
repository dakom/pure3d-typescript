import {PerlinNoise} from "./PerlinNoise";
import { createWebGlRenderer, WebGlConstants, WebGlRenderer, createSimpleTextureFromTarget  } from "lib/Lib";

interface PerlinOptions {
  gl: WebGLRenderingContext;
  width: number;
  height: number;
  size: [number, number, number]; 
  colorMapper: ({x,y,noise}:{x:number, y:number, noise:number}) => Array<number>;
}



export const createPerlinTexture = (opts:PerlinOptions):WebGLTexture => {
  const {gl, width, height, size, colorMapper} = opts;

  const canvas = document.createElement("canvas") as HTMLCanvasElement;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");

  const canvasData = ctx.createImageData(width, height);

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
        // Index of the pixel in the array
        const normalized_x = x/width; 
        const normalized_y = y/height;
        const noise = PerlinNoise(size[0]*x, size[1]*y, size[2]*1); //we're just using 2D but it's still nice to specify a custom sizeZ!
        const color =  colorMapper({x, y, noise});

        const dataIndex = (x + y * width) * 4;    
        canvasData.data[dataIndex] = color[0];
        canvasData.data[dataIndex + 1] = color[1];
        canvasData.data[dataIndex + 2] = color[2];
        canvasData.data[dataIndex + 3] = color[3];

    }
  }

  ctx.putImageData(canvasData, 0, 0);

  return createSimpleTextureFromTarget({gl, alpha: true}) (canvas);
}