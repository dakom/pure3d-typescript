import {WebGlBufferInfo, WebGlBufferData} from "../../Types";

export const createWebGlBuffers = (gl:WebGLRenderingContext) => {
    const infoMap = new Map<Symbol, WebGlBufferInfo>();
    
    const bind = (sym:Symbol):void => {
        const info = infoMap.get(sym);
        gl.bindBuffer(info.target, info.buffer);
    }

    const assign = (sym:Symbol) => (bData:WebGlBufferData):void => {
        const info = infoMap.has(sym)
            ?   infoMap.get(sym)
            :   {buffer: gl.createBuffer()} as WebGlBufferInfo;

        info.data = bData.data;
        info.target = bData.target;
        info.usagePattern = bData.usagePattern;

        infoMap.set(sym, info as WebGlBufferInfo);

        bind(sym);
       
        //typecasting to any since coercion into TypedArray for webgl2 is responsibility of caller
        gl.bufferData(info.target, info.data as any, info.usagePattern);
    }

   

    const get = (sym:Symbol):WebGlBufferInfo => infoMap.get(sym);

    return {assign, get, bind};

}


