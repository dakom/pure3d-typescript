import { createWebGlBuffers} from './WebGl-DataBuffers';
import { createTextureSwitcher} from './WebGl-Textures';
import { createVertexArrays} from './WebGl-VertexArrays';
import { createAttributes} from './WebGl-Attributes';
import {getMajorVersion} from "./WebGl-Version";
import {WebGlVertexArrayData, WebGlAttributeActivateOptions, WebGlBufferInfo,WebGlBufferData, WebGlRendererOptions} from "../../Types";


export const createWebGlRenderer = (opts: WebGlRendererOptions) => {
    const { canvas, contextAttributes } = opts;

    const gl: WebGLRenderingContext = (() => {
        if (opts.gl !== undefined) {
            return opts.gl;
        }
        
        let _gl;
        if (opts.version === undefined || opts.version === 2) {
            try {
                _gl = canvas.getContext("webgl2", contextAttributes);

            } catch (e) {
                _gl = undefined;
            }

            if (!_gl) {
                console.warn("Failed to initialize webgl2, trying webgl1 as a fallback...");
            } else {
                return _gl;
            }
        }

        try {
            _gl = canvas.getContext("webgl", contextAttributes) || canvas.getContext("experimental-webgl", contextAttributes);
        } catch (e) {
            _gl = undefined;
        }

        if (!_gl) {
            console.warn("Unable to initialize webgl1");
        }

        return _gl;
    })();


    const version = getMajorVersion(gl);

    const lastScreenSize = {
        width: NaN,
        height: NaN
    }


    const resize = ({ width, height }: { width: number, height: number }) => {

        if (lastScreenSize.width !== width || lastScreenSize.height !== height) {

            canvas.setAttribute('width', width.toString());
            canvas.setAttribute('height', height.toString());

            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

            lastScreenSize.width = width;
            lastScreenSize.height = height;
        }
    }

    const flagMap = new Map<number, boolean>();

    const glToggle = (setting: number) => (flag: boolean) => {
        if (!flagMap.has(setting) || flagMap.get(setting) !== flag) {
            flagMap.set(setting, flag);

            if (flag) {
                gl.enable(setting);
            } else {
                gl.disable(setting);
            }
        }
    }


    const buffers = createWebGlBuffers(gl);

    const extensionMap = new Map<string, any>();
    const getExtension = (extName: string): any => {
        if (!extensionMap.has(extName)) {
            const ext = gl.getExtension(extName);
            if(!ext) {
                console.warn("Could not create extension", extName);
            }
            extensionMap.set(extName, ext);
        }

        return extensionMap.get(extName);
    }

    let depthFunc;
    const glDepthFunc = (func:number) => {
        if(func !== depthFunc) {
            gl.depthFunc(func);
            depthFunc = func;
        }
    }

    let _blendRgbSource, _blendRgbDest, _blendAlphaSource, _blendAlphaDest;
    const glBlendFunc = ([srcFactor, destFactor]:[number, number]) => { 
        if(srcFactor !== _blendRgbSource || destFactor !== _blendRgbDest
          || srcFactor !== _blendAlphaSource || destFactor !== _blendAlphaDest) {
            gl.blendFunc(srcFactor, destFactor);
            _blendRgbSource = srcFactor;
            _blendAlphaSource = srcFactor;
            _blendRgbDest = destFactor;
            _blendAlphaDest = destFactor;
        }
    }

    const glBlendFuncSeparate = ([srcRgbFactor, destRgbFactor]:[number, number]) => ([srcAlphaFactor, destAlphaFactor]:[number, number]) => { 
        if(srcRgbFactor !== _blendRgbSource || destRgbFactor !== _blendRgbDest
          || srcAlphaFactor !== _blendAlphaSource || destAlphaFactor !== _blendAlphaDest) {
            gl.blendFuncSeparate(srcRgbFactor, destRgbFactor, srcAlphaFactor, destAlphaFactor);
            _blendRgbSource = srcRgbFactor;
            _blendAlphaSource = srcAlphaFactor;
            _blendRgbDest = destRgbFactor;
            _blendAlphaDest = destAlphaFactor;
        }
    }

    let _blendRgbEquation, _blendAlphaEquation;
    const glBlendEquation = (equation:number) => {
        if(_blendRgbEquation !== equation || _blendAlphaEquation !== equation) {
            gl.blendEquation(equation);
            _blendRgbEquation = equation;
            _blendAlphaEquation = equation;
        }
    }
    const glBlendEquationSeparate = ([rgbEquation, alphaEquation]:[number, number]) => {
        if(_blendRgbEquation !== rgbEquation || _blendAlphaEquation !== alphaEquation) {
            gl.blendEquationSeparate(rgbEquation, alphaEquation);
            _blendRgbEquation = rgbEquation;
            _blendAlphaEquation = alphaEquation;
        }
    }

    const textureSwitcher = createTextureSwitcher(gl);


    const attributes = createAttributes({
        gl,
        buffers,
    });

    const vertexArrays = createVertexArrays({
        getExtension,
        gl, 
        version,
        buffers
    });

    return {
        resize,
        canvas,
        gl,
        buffers,
        attributes,
        vertexArrays,
        ...textureSwitcher,
        glToggle,
        glDepthFunc,
        glBlendFunc,
        glBlendFuncSeparate,
        glBlendEquation,
        glBlendEquationSeparate,
        getExtension,
        version,
        extras: {}
    }


}
