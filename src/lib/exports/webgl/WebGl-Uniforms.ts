import {WebGlBufferInfo,WebGlBufferData,WebGlRenderer} from "../../Types";


export const createUniforms = ({renderer, activateShader}:{renderer:WebGlRenderer, activateShader: () => {program: WebGLProgram, shaderId: Symbol}}) => {
  const {gl} = renderer;
  
  const cache = {
    uniformLocations: new Map<string, WebGLUniformLocation>(),
    uniformValues: new Map<string, Array<number> | Float32Array | Int32Array>(),
    uniformSingleValues: new Map<string, number>(),
    uniformMatrixTranspose: new Map<string, boolean>()
  }

  
  const getLocation = (uName: string): WebGLUniformLocation => {
    const {program } = activateShader();

    if (!cache.uniformLocations.has(uName)) {
      cache.uniformLocations.set(uName, gl.getUniformLocation(program, uName))
    }

    return cache.uniformLocations.get(uName);
  }

  const validLocation = (loc:WebGLUniformLocation):boolean => 
    (loc !== null && loc !== undefined && loc != -1);
  

  const hasLocation = (uName:string):boolean =>
    validLocation(getLocation(uName));

  const _isEqual = (uName: string) => (values: Array<number> | Float32Array | Int32Array): boolean => {
    if (!cache.uniformValues.has(uName)) {
      return false;
    }

    const xs = cache.uniformValues.get(uName);

    if (xs.length !== values.length) {
      return false;
    }

    for (let i = 0; i < xs.length; i++) {
      if (xs[i] !== values[i]) {
        return false;
      }
    }

    return true;
  }

  

  const _assignCacheValues = (uName: string) => (values: Array<number> | Float32Array | Int32Array) => {
    //Must make a copy each time, otherwise it could be referencing the same object in subsequent calls
    //however - the cache is local only, so it's only setting the map the first time (subsequent is just writing to mutable space)
    if (!cache.uniformValues.has(uName)) {
      cache.uniformValues.set(uName, values.slice());
      return;
    }

    const target = cache.uniformValues.get(uName);

    for (let idx = 0; idx < values.length; idx++) {
      target[idx] = values[idx];
    }

  }

  

  const _setSingleValue = (setterFn: (loc: WebGLUniformLocation) => (value: number) => void) => (uName: string) => (value: number): void => {
    const values = [value];

    if (!cache.uniformSingleValues.has(uName) || cache.uniformSingleValues.get(uName) !== value) {
      cache.uniformSingleValues.set(uName, value);
      const loc = getLocation(uName);
      if (validLocation(loc)) {
        setterFn(loc)(value);
      }
    }
  }

  const _setValue = (setterFn: (loc: WebGLUniformLocation) => (values: (Array<number> | Float32Array | Int32Array)) => void) => (uName: string) => (values: Array<number> | Float32Array | Int32Array): void => {
    if (!_isEqual(uName)(values)) {
      _assignCacheValues(uName)(values);
      const loc = getLocation(uName);
      if (validLocation(loc)) {
        setterFn(loc)(values);
      }
    }
  }

  const _setMatrixValue = (setterFn: (loc: WebGLUniformLocation) => (transpose: boolean) => (values: (Array<number> | Float32Array)) => void) => (uName: string) => (transpose: boolean) => (values: Array<number> | Float32Array): void => {
    if (!cache.uniformMatrixTranspose.has(uName) || cache.uniformMatrixTranspose.get(uName) !== transpose || !_isEqual(uName)(values)) {
      _assignCacheValues(uName)(values);
      cache.uniformMatrixTranspose.set(uName, transpose);
      const loc = getLocation(uName);
      if (validLocation(loc)) {
        setterFn(loc)(transpose)(values);
      }
    }
  }

  const setters = {
    uniform1f: _setSingleValue(loc => v => gl.uniform1f(loc, v)),
    uniform1fv: _setValue(loc => v => gl.uniform1fv(loc, v as Array<number> | Float32Array)),
    uniform1i: _setSingleValue(loc => v => gl.uniform1i(loc, v)),
    uniform1iv: _setValue(loc => v => gl.uniform1iv(loc, v as Array<number> | Int32Array)),

    uniform2f: _setValue(loc => v => gl.uniform2f(loc, v[0], v[1])),
    uniform2fv: _setValue(loc => v => gl.uniform2fv(loc, v as Array<number> | Float32Array)),
    uniform2i: _setValue(loc => v => gl.uniform2i(loc, v[0], v[1])),
    uniform2iv: _setValue(loc => v => gl.uniform2iv(loc, v as Array<number> | Int32Array)),

    uniform3f: _setValue(loc => v => gl.uniform3f(loc, v[0], v[1], v[2])),
    uniform3fv: _setValue(loc => v => gl.uniform3fv(loc, v as Array<number> | Float32Array)),
    uniform3i: _setValue(loc => v => gl.uniform3i(loc, v[0], v[1], v[2])),
    uniform3iv: _setValue(loc => v => gl.uniform3iv(loc, v as Array<number> | Int32Array)),

    uniform4f: _setValue(loc => v => gl.uniform4f(loc, v[0], v[1], v[2], v[3])),
    uniform4fv: _setValue(loc => v => gl.uniform4fv(loc, v as Array<number> | Float32Array)),
    uniform4i: _setValue(loc => v => gl.uniform4i(loc, v[0], v[1], v[2], v[3])),
    uniform4iv: _setValue(loc => v => gl.uniform4iv(loc, v as Array<number> | Int32Array)),

    uniformMatrix2fv: _setMatrixValue(loc => t => v => gl.uniformMatrix2fv(loc, t, v)),
    uniformMatrix3fv: _setMatrixValue(loc => t => v => gl.uniformMatrix3fv(loc, t, v)),
    uniformMatrix4fv: _setMatrixValue(loc => t => v => gl.uniformMatrix4fv(loc, t, v)),
  }

  return {
    cache, 
    setters, 
    getLocation, 
    validLocation,
    hasLocation
  }
}



