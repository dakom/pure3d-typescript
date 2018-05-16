import {createShader} from "../../exports/webgl/WebGl-Shaders";

export type WebGlShaderInterruptHandler = (gl:WebGLRenderingContext) => (program:WebGLProgram) => void;

export type WebGlShader = ReturnType<typeof createShader>;

export interface WebGlShaderSource {
    vertex: string;
    fragment: string;
}
