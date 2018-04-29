import {WebGlVertexArray, WebGlAttributeActivateOptions, WebGlBufferData, WebGlRenderer, WebGlShader, WebGlBufferInfo, WebGlShaderSource} from "../../Types";
import { createUniforms } from "./WebGl-Uniforms";
import {createVertexArrays} from "./WebGl-VertexArrays";
import {createAttributes} from "./WebGl-Attributes";

//the "any" here is actually WebGlShader but defining it as such would cause a circular reference
let current: any; 
const shaders = new Map<Symbol, WebGlShader>();

const _compileShader = (gl: WebGLRenderingContext) => (source: WebGlShaderSource): WebGLProgram => {
    let vShader: WebGLShader | Error;
    let fShader: WebGLShader | Error;
    const program = gl.createProgram();

    const dispose = () => {
        if (vShader !== undefined && (vShader instanceof WebGLShader)) {
            gl.deleteShader(vShader);
        }

        if (fShader !== undefined && (fShader instanceof WebGLShader)) {
            gl.deleteShader(fShader);
        }

        gl.deleteProgram(program);
    }

    const getShaderName = (shaderType: number): string => shaderType === gl.VERTEX_SHADER ? "vertex" : "fragment";

    const loadShader = (shaderType: number) => (sourceText: string): WebGLShader | Error => {
        const shader = gl.createShader(shaderType);
        gl.shaderSource(shader, sourceText);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const errorMessage = `${getShaderName(shaderType)} error: ` + gl.getShaderInfoLog(shader);
            throw new Error(errorMessage); //this _should_ be an exception
        }

        gl.attachShader(program, shader);
        return shader;
    }

    vShader = loadShader(gl.VERTEX_SHADER)(source.vertex);
    if (vShader instanceof Error) {
        dispose();
        return vShader;
    }

    fShader = loadShader(gl.FRAGMENT_SHADER)(source.fragment);
    if (fShader instanceof Error) {
        dispose();
        return fShader;
    }

    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        dispose();
        return new Error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
    }

    return program;
}

const _activateShader = (shaderId:Symbol) => {
    if (!current || current.shaderId !== shaderId) {
        current = shaders.get(shaderId);
        current.gl.useProgram(current.program);
    }

    return current;
}

export const activateShader = (shaderId: Symbol) => 
    _activateShader(shaderId) as WebGlShader;


export const createShader = ({renderer, shaderId, source}: {renderer:WebGlRenderer,shaderId: Symbol,source: WebGlShaderSource}) => {
    const {gl} = renderer;

    const program = _compileShader(gl)(source);

    const attributes = createAttributes({renderer, program});

    const shader = {
        gl,
        shaderId,
        program,
        uniforms: createUniforms({renderer, activateShader: () => _activateShader(shaderId)}),
        attributes,
        vertexArrays: createVertexArrays({renderer, program, getAttributeLocation: attributes.getLocation})
    };

    shaders.set(shaderId, shader);
    return shader;
}
