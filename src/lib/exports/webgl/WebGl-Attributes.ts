import {WebGlBufferInfo,WebGlBufferData, WebGlAttributeActivateOptions, WebGlRenderer} from "../../Types";

export const createAttributes = ({renderer, program}:{renderer:WebGlRenderer, program: WebGLProgram}) => {
  let currentBuffer:Symbol;
  let currentTarget:number;

  const _locationCache = new Map<string, number>();
  const {gl} = renderer;

  const forceLocation = ({aName, location}:{aName:string, location:number}) => {
    gl.bindAttribLocation(program, location, aName);
    _locationCache.set(aName, gl.getAttribLocation(program, aName));
  }

  const getLocation = (aName:string):number => {

    if(!_locationCache.has(aName)) {
      _locationCache.set(aName, gl.getAttribLocation(program, aName));
    }

    return _locationCache.get(aName);
  }

  const activateElements = (bufferId:Symbol):void => {
    
    const info = renderer.buffers.get(bufferId);
    
    
    if(currentBuffer !== bufferId || currentTarget !== info.target) {
        gl.bindBuffer(info.target, info.buffer);
        currentBuffer = bufferId;
        currentTarget = info.target;
    }
  }

  const activateData =  (aName:string) => (bufferId:Symbol) =>(opts:WebGlAttributeActivateOptions):void => {
    activateElements(bufferId); //isn't really elements here, but nicer than having a superfluous alias
    const location = getLocation(aName);

    gl.vertexAttribPointer( location, 
                            opts.size, 
                            opts.type, 
                            opts.normalized === undefined ? false : opts.normalized,
                            opts.stride === undefined ? 0 : opts.stride,
                            opts.offset === undefined ? 0 : opts.offset);
  
    gl.enableVertexAttribArray(location);
  
  }

  return {getLocation, activateElements, activateData, forceLocation};
}



