
export interface WebGlVertexArray {
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
