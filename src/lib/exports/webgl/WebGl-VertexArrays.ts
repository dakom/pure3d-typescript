import {WebGlAttributeActivateOptions, WebGlBufferInfo, WebGlShader, WebGlVertexArrays, WebGlVertexArrayData, WebGlRenderer, WebGlBufferData, WebGlVertexData, WebGlConstants } from "../../Types";



export const createVertexArrays = ({renderer, getAttributeLocation}:{renderer:WebGlRenderer, getAttributeLocation: (aName:string) => number}) => {
  const _cache = new Map<Symbol, any>();
  const {gl, version} = renderer;
  let currentSym:Symbol;
    let ext;

  const _create = ():any => {
    if(version === 1) {
      if(ext === undefined || ext === null) {
        ext = gl.getExtension("OES_vertex_array_object");
      }
      return ext.createVertexArrayOES();
    } else {
      return (gl as any).createVertexArray();
    }
  }

  const _bind = (target):void => {
    if(version === 1) {
      if(ext === undefined || ext === null) {
        ext = gl.getExtension("OES_vertex_array_object");
      }
      return ext.bindVertexArrayOES(target);
    } else {
      return (gl as any).bindVertexArray(target);
    }
  }

  const activate = (sym:Symbol):void => {
    if(currentSym === sym) {
      return;
    }

    currentSym = sym;

    if(!_cache.has(sym)) {
      _cache.set(sym, _create());
    }

    _bind(_cache.get(sym));
  }

  const assign = (sym:Symbol) => (v:WebGlVertexArrayData):void => {
      activate(sym);

      if(v.elementBufferId) {
        renderer.buffers.bind(v.elementBufferId);
      }
      v.data.forEach(({attributeName, usagePattern, bufferId, size, type, normalized, stride, offset}) => {
        
        const location = getAttributeLocation(attributeName);
        const bufferInfo = renderer.buffers.get(bufferId);
  
        //there's no cache checks in the case of VAO - the set as a whole is toggled on/off
        renderer.buffers.bind(bufferId);
        gl.vertexAttribPointer( 
            location, 
            size, 
            type, 
            normalized === undefined ? false : normalized, 
            stride === undefined ? 0 : stride, 
            offset === undefined ? 0 : offset);
  
        gl.enableVertexAttribArray(location);
      });
  }

  

  const release = ():void => {
    if(currentSym !== null) {
      currentSym = null;
      _bind(null);
    }
  }

  return {activate, release, assign}
}


export const createVertexArraysForShader = ({renderer, shader}:{renderer:WebGlRenderer, shader:WebGlShader}) =>
    createVertexArrays({renderer, getAttributeLocation: shader.attributes.getLocation})
