import {createVertexArrays} from "../../exports/webgl/WebGl-VertexArrays";

export type WebGlVertexArrays = ReturnType<typeof createVertexArrays>
export interface WebGlVertexArrayData {
  elementBufferId?: Symbol,

  data: Array<{
    attributeName: string, 
    bufferId: Symbol,
    size:GLint,  
    usagePattern?: GLenum, 
    type:GLenum, 
    normalized?:GLboolean, 
    stride?:GLsizei,
    offset?:GLintptr
  }>
};
