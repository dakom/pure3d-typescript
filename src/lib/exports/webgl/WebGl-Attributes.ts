import {WebGlBufferInfo,WebGlBufferData, WebGlBuffers, WebGlAttributeActivateOptions, WebGlRenderer} from "../../Types";

export const createAttributes = ({gl, buffers}:{gl: WebGLRenderingContext, buffers:WebGlBuffers}) => {
  let currentBuffer:Symbol;
  let currentTarget:number;

  const globalLocations = new Set<string>();

  const _perShaderCache = new Map<WebGLProgram, Map<string, number>>(); 
  const _globalCache = new Map<string, number>();

  const getLocationInShader = (program:WebGLProgram) => (aName:string):number => {
      if(!_perShaderCache.has(program)) {
          _perShaderCache.set(program, new Map<string, number>());
      }
      const cache = _perShaderCache.get(program);
      if(!cache.has(aName)) {
          cache.set(aName, gl.getAttribLocation(program, aName));
      }

      return cache.get(aName);
  }

  const getLocationInRenderer = (aName:string):number => {
      if(!_globalCache.has(aName)) {
            //For-of wasn't working across typescript and things...
            //This is a little ugly but it's totally fine since it's only on init
            //And by far most use-cases will be a cache hit
            let idx = 0;
            globalLocations.forEach(val => {
                if(!_globalCache.has(val)) {
                    _globalCache.set(val, idx);
                }
                idx++;
            })
      }

      return _globalCache.get(aName);
  }

  const activateElements = (bufferId:Symbol):void => {
    
    const info = buffers.get(bufferId);
    
    
    if(currentBuffer !== bufferId || currentTarget !== info.target) {
        gl.bindBuffer(info.target, info.buffer);
        currentBuffer = bufferId;
        currentTarget = info.target;
    }
  }

  const activateData =  (location:number) => (bufferId:Symbol) =>(opts:WebGlAttributeActivateOptions):void => {
    activateElements(bufferId); //isn't really elements here, but nicer than having a superfluous alias
    gl.vertexAttribPointer( location, 
                            opts.size, 
                            opts.type, 
                            opts.normalized === undefined ? false : opts.normalized,
                            opts.stride === undefined ? 0 : opts.stride,
                            opts.offset === undefined ? 0 : opts.offset);
  
    gl.enableVertexAttribArray(location);
  
  }

  return {globalLocations, getLocationInShader, getLocationInRenderer, activateElements, activateData };
}



