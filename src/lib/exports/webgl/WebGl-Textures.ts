import {WebGlConstants, WebGlTextureOptions, WebGLTextureSource, WebGlTextureCubeSource, WebGlSimpleTextureOptions} from "../../Types";

 const faceTargetFromKey = (key:string):number => {
     switch(key) {
         case "posX": return WebGlConstants.TEXTURE_CUBE_MAP_POSITIVE_X;
         case "negX": return WebGlConstants.TEXTURE_CUBE_MAP_NEGATIVE_X;
         case "posY": return WebGlConstants.TEXTURE_CUBE_MAP_POSITIVE_Y;
         case "negY": return WebGlConstants.TEXTURE_CUBE_MAP_NEGATIVE_Y;
         case "posZ": return WebGlConstants.TEXTURE_CUBE_MAP_POSITIVE_Z;
         case "negZ": return WebGlConstants.TEXTURE_CUBE_MAP_NEGATIVE_Z;
     }
 }

 export const createTextureSwitcher = (gl:WebGLRenderingContext) => {
    const activeTextureMap = new Map<number, {target: number, texture: WebGLTexture}>();

    const _switchTexture = (target:number) => (samplerIndex:number) => (texture:WebGLTexture):WebGLTexture => {
        const skipSwitch = activeTextureMap.has(samplerIndex) && (() => {
            const cacheInfo = activeTextureMap.get(samplerIndex);
            return cacheInfo.target === target && cacheInfo.texture === texture;
        })();
    
        if(!skipSwitch) {
            gl.activeTexture(gl.TEXTURE0 + samplerIndex);
            gl.bindTexture(target, texture); 
            activeTextureMap.set(samplerIndex, {target, texture});
        }
    
        return texture;
        
    }
    
    return {
        switchTexture: _switchTexture(WebGlConstants.TEXTURE_2D),
        switchCubeTexture: _switchTexture(WebGlConstants.TEXTURE_CUBE_MAP) 
    }
 }


export const createTextureFromTarget = (opts:WebGlTextureOptions) => (targets: WebGLTextureSource | Array<WebGLTextureSource>): WebGLTexture => {
    
    const {gl} = opts;
    const texture = gl.createTexture();
    const bindTarget = WebGlConstants.TEXTURE_2D;
    const dataSize = opts.dataSize || gl.UNSIGNED_BYTE;

    gl.bindTexture(bindTarget, texture);
    opts.setParameters(opts);
    
    const mipTargets = Array.isArray(targets) ? targets : [targets];
    
    mipTargets.forEach((target, mipLevel) => {
        if(target instanceof Element) {
            gl.texImage2D(bindTarget, mipLevel, opts.format, opts.format, dataSize, target);
        } else {
            gl.texImage2D(bindTarget, mipLevel, opts.format, opts.width, opts.height, 0, opts.format, dataSize, target);
        }
    })
    
    
    return texture;
}

export const createCubeTextureFromTarget = (opts:WebGlTextureOptions) => (targets:Array<WebGlTextureCubeSource> | WebGlTextureCubeSource): WebGLTexture => {
    
    const {gl} = opts;
    const texture = gl.createTexture();
    const bindTarget = WebGlConstants.TEXTURE_CUBE_MAP;
    const dataSize = opts.dataSize || gl.UNSIGNED_BYTE;

    gl.bindTexture(bindTarget, texture);
    opts.setParameters(opts);
   
    const mipTargets = Array.isArray(targets) ? targets : [targets];

    mipTargets.forEach((mipTarget, mipLevel) => {
        Object.keys(mipTarget).forEach((key:keyof WebGlTextureCubeSource) => {
            
            const faceTarget = faceTargetFromKey(key);
            const target = mipTarget[key];
            
            if(target instanceof Element) {
                gl.texImage2D(faceTarget, mipLevel, opts.format, opts.format, dataSize, target);
            } else {
                gl.texImage2D(faceTarget, mipLevel, opts.format, opts.width, opts.height, 0, opts.format, dataSize, target);
            }
        })
    })
    
    return texture;
}



//only first param is set by user, second is set internally
export const textureSetterSimple = (opts:WebGlSimpleTextureOptions) => (_opts:Partial<WebGlTextureOptions>) => {
    const {gl, width, height} = _opts;

    const isPowerOf2 = (value:number):boolean => (value & (value - 1)) == 0;

    if (opts.flipY) {
        gl.pixelStorei(WebGlConstants.UNPACK_FLIP_Y_WEBGL, true);
    } else {
        gl.pixelStorei(WebGlConstants.UNPACK_FLIP_Y_WEBGL, false);
    }

    if (isPowerOf2(width) && isPowerOf2(height) && opts.useMips === true) {
        gl.generateMipmap(WebGlConstants.TEXTURE_2D);
    } else {
        gl.texParameteri(WebGlConstants.TEXTURE_2D, WebGlConstants.TEXTURE_WRAP_S, !opts.wrapS ? WebGlConstants.CLAMP_TO_EDGE : opts.wrapS);
        gl.texParameteri(WebGlConstants.TEXTURE_2D, WebGlConstants.TEXTURE_WRAP_T, !opts.wrapT ? WebGlConstants.CLAMP_TO_EDGE : opts.wrapT);
        gl.texParameteri(WebGlConstants.TEXTURE_2D, WebGlConstants.TEXTURE_MIN_FILTER, !opts.filterMin ? WebGlConstants.LINEAR : opts.filterMin);
        gl.texParameteri(WebGlConstants.TEXTURE_2D, WebGlConstants.TEXTURE_MAG_FILTER, !opts.filterMag ? WebGlConstants.LINEAR : opts.filterMag);
    }
}

export const createSimpleTextureFromTarget = (opts:WebGlSimpleTextureOptions & {alpha?:boolean; gl:WebGLRenderingContext}) => (target:WebGLTextureSource):WebGLTexture => 
    createTextureFromTarget({
        gl: opts.gl,
        format: opts.alpha ? WebGlConstants.RGBA : WebGlConstants.RGB,
        setParameters: textureSetterSimple(opts)
    })
    (target);
