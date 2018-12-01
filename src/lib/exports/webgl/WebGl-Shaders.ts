import {WebGlVertexArrayData, WebGlAttributeActivateOptions, WebGlBufferData, WebGlRenderer, WebGlShader, WebGlBufferInfo, WebGlShaderSource, WebGlShaderInterruptHandler} from "../../Types";
import { createUniforms } from "./WebGl-Uniforms";

//the "any" here is actually WebGlShader but defining it as such would cause a circular reference
let current: any; 
const shaders = new Map<Symbol, WebGlShader>();

const _compileShader = ({renderer, source}:{renderer: WebGlRenderer, source: WebGlShaderSource}): WebGLProgram => {
    let vShader: WebGLShader | Error;
    let fShader: WebGLShader | Error;

    const {gl} = renderer;
    const program = gl.createProgram();

    const cleanupShaders = () => {
        if (vShader !== undefined && (vShader instanceof WebGLShader)) {
            gl.detachShader(program, vShader);
            gl.deleteShader(vShader);
        }

        if (fShader !== undefined && (fShader instanceof WebGLShader)) {
            gl.detachShader(program, fShader);
            gl.deleteShader(fShader);
        }
    }

    const cleanupAll = () => {
        cleanupShaders();
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
        cleanupAll();
        return vShader;
    }

    fShader = loadShader(gl.FRAGMENT_SHADER)(source.fragment);
    if (fShader instanceof Error) {
        cleanupAll();
        return fShader;
    }

    let location = 0;
    renderer.attributes.globalLocations.forEach(aName => {
        gl.bindAttribLocation(program, location, aName);
        location++;
    });

    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        cleanupAll();
        return new Error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
    }

    gl.useProgram(program);
    cleanupShaders();

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



export const createShader = ({renderer, shaderId, source}: {renderer:WebGlRenderer,shaderId: Symbol,source: WebGlShaderSource }) => {

    const program = _compileShader({source, renderer});


    const shader = {
        gl: renderer.gl,
        shaderId,
        program,
        uniforms: createUniforms({renderer, activateShader: () => _activateShader(shaderId)}),
    };

    shaders.set(shaderId, shader);
    return shader;
}
