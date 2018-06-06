export interface WebGlVertexArrays {
    activate: (sym:Symbol) => void
    assign: (sym:Symbol) => (v:WebGlVertexArrayData) => void;
    release: () => void;
}

export interface WebGlVertexArrayData {
  elementBufferId?: Symbol,

  data: Array<{
    location: number,
    bufferId: Symbol,
    size:GLint,  
    usagePattern?: GLenum, 
    type:GLenum, 
    normalized?:GLboolean, 
    stride?:GLsizei,
    offset?:GLintptr
  }>
};
