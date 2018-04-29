
export type WebGLTextureSource = HTMLImageElement | HTMLCanvasElement | ArrayBufferView | HTMLVideoElement;

export interface WebGlTextureOptions {
    gl:WebGLRenderingContext;
    format:number;
    setParameters: (opts:Partial<WebGlTextureOptions>) => void;
    dataSize?:number; 
    width?:number;
    height?:number;
}

export interface WebGlSimpleTextureOptions {
    useMips?: boolean; 
    flipY?:boolean;
    wrapS?:number;
    wrapT?:number;
    filterMin?:number;
    filterMag?:number;
}

export type WebGlTextureCubeSource = {
    posX: WebGLTextureSource;
    posY: WebGLTextureSource;
    posZ: WebGLTextureSource;
    negX: WebGLTextureSource;
    negY: WebGLTextureSource;
    negZ: WebGLTextureSource;
 }
 
