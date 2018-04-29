export type WebGlVertexData = ArrayBuffer | ArrayBufferLike | ArrayBufferView;

export interface WebGlBufferInfo extends WebGlBufferData{
    buffer: WebGLBuffer
};

export interface WebGlBufferData {
    target: GLenum,
    usagePattern: GLenum,
    data: WebGlVertexData,
}

