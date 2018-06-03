import { createWebGlBuffers} from './WebGl-DataBuffers';
import { createShader} from './WebGl-Shaders';
import { createTextureSwitcher} from './WebGl-Textures';
import {getMajorVersion} from "./WebGl-Version";
import {WebGlBufferInfo,WebGlBufferData, WebGlRendererOptions} from "../../Types";


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

    let _sFactor, _dFactor;
    const glBlendFunc = (sFactor:number) => (dFactor:number) => {
        if(sFactor !== _sFactor || dFactor !== _dFactor) {
            gl.blendFunc(sFactor, dFactor);
            _sFactor = sFactor;
            _dFactor = dFactor;
        }
    }

    const textureSwitcher = createTextureSwitcher(gl);

    return {
        resize,
        canvas,
        gl,
        buffers,
        ...textureSwitcher,
        glToggle,
        glDepthFunc,
        glBlendFunc,
        getExtension,
        version,
        extras: {}
    }


}
