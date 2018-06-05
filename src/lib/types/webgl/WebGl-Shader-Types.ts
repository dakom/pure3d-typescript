import {WebGlRenderer} from "./WebGl-Renderer-Types";
import {createShader} from "../../exports/webgl/WebGl-Shaders";

export type WebGlShaderInterruptHandler = (renderer:WebGlRenderer) => (program:WebGLProgram) => void;

export type WebGlShader = ReturnType<typeof createShader>;

export interface WebGlShaderSource {
    vertex: string;
    fragment: string;
}
