import {createWebGlRenderer} from "../../exports/webgl/WebGl-Renderer";

export type WebGlRenderer = ReturnType<typeof createWebGlRenderer>;

export interface WebGlRendererOptions {
    canvas: HTMLCanvasElement,
    gl?: WebGLRenderingContext,
    contextAttributes?: WebGLContextAttributes,
    version?: 1 | 2
}

export type WebGlWrapper = (gl: WebGLRenderingContext) => WebGLRenderingContext;

