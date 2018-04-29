import {createShader} from "../../exports/webgl/WebGl-Shaders";

export type WebGlShader = ReturnType<typeof createShader>;

export interface WebGlShaderSource {
    vertex: string;
    fragment: string;
}
