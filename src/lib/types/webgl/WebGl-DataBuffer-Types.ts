export type WebGlVertexData = ArrayBuffer | ArrayBufferLike | ArrayBufferView;

export interface WebGlBufferInfo extends WebGlBufferData{
    buffer: WebGLBuffer
};

export interface WebGlBufferData {
    target: GLenum,
    usagePattern: GLenum,
    data: WebGlVertexData,
}

export interface WebGlBuffers {
    bind: (sym:Symbol) => void;
    assign: (sym:Symbol) => (bData:WebGlBufferData) => void;
    get: (sym:Symbol) => WebGlBufferInfo;
}

