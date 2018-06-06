import {WebGlBuffers, WebGlAttributeActivateOptions, WebGlBufferInfo, WebGlShader, WebGlVertexArrays, WebGlVertexArrayData, WebGlRenderer, WebGlBufferData, WebGlVertexData, WebGlConstants } from "../../Types";


export const createVertexArrays = ({getExtension, gl, version, buffers}:{buffers: WebGlBuffers, getExtension: (str:string) => any, gl: WebGLRenderingContext, version: number}) => {
  const _cache = new Map<Symbol, any>();
  let currentSym:Symbol;

  const _create = ():any => {
    if(version === 1) {
      return getExtension("OES_vertex_array_object").createVertexArrayOES();
    } else {
      return (gl as any).createVertexArray();
    }
  }

  const _bind = (target):void => {
    if(version === 1) {
      return getExtension("OES_vertex_array_object").bindVertexArrayOES(target);
    } else {
      return (gl as any).bindVertexArray(target);
    }
  }

  const _activate = (force:boolean) => (sym:Symbol):void => {
    if(!force && currentSym === sym) {
      return;
    }

    currentSym = sym;

    if(!_cache.has(sym)) {
      _cache.set(sym, _create());
    }

    _bind(_cache.get(sym));
  }

  const assign = (sym:Symbol) => (v:WebGlVertexArrayData):void => {
      _activate (true) (sym);

      if(v.elementBufferId) {
        buffers.bind(v.elementBufferId);
      }
      v.data.forEach(({location, usagePattern, bufferId, size, type, normalized, stride, offset}) => {
        
        const bufferInfo = buffers.get(bufferId);
 

        //there's no cache checks in the case of VAO - the set as a whole is toggled on/off
        buffers.bind(bufferId);
        gl.vertexAttribPointer( 
            location, 
            size, 
            type, 
            normalized === undefined ? false : normalized, 
            stride === undefined ? 0 : stride, 
            offset === undefined ? 0 : offset);
  
        gl.enableVertexAttribArray(location);
      });

      release();
  }

  

  const release = ():void => {
    if(currentSym !== null) {
      currentSym = null;
      _bind(null);
    }
  }

  return {activate: _activate(false), release, assign}
}

/*
export const createVertexArraysForRenderer = (renderer:WebGlRenderer) =>
    createVertexArrays({renderer, getAttributeLocation: renderer.getGlobalAttributeLocation});

export const createVertexArraysForShader = ({renderer, shader}:{renderer:WebGlRenderer, shader:WebGlShader}) =>
    createVertexArrays({renderer, getAttributeLocation: shader.attributes.getLocation})
    */
