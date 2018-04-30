import { createWebGlRenderer, WebGlConstants, WebGlRenderer, createSimpleTextureFromTarget  } from "lib/Lib";

interface SolidOptions {
  gl: WebGLRenderingContext;
  width: number;
  height: number;
  style:string;
}

export const createSolidTexture = (opts:SolidOptions):WebGLTexture => {
  const {gl, width, height, style} = opts;

  const canvas = document.createElement("canvas") as HTMLCanvasElement;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");

  ctx.fillStyle = style;
  ctx.fillRect(0,0,width, height);

  return createSimpleTextureFromTarget({gl, alpha: true}) (canvas);
}
