import {WebGlVertexArrayData, WebGlAttributeActivateOptions,NumberArray, WebGlBufferInfo,WebGlBufferData,WebGlRenderer, TypedNumberArray} from "../../Types";

enum UNIFORM_TYPE {
    FLOAT,
    INT
}


export const createUniforms = ({renderer, activateShader}:{renderer:WebGlRenderer, activateShader: () => {program: WebGLProgram, shaderId: Symbol}}) => {
  const {gl} = renderer;
  
  const cache = {
    uniformLocations: new Map<string, WebGLUniformLocation>(),
    uniformValues: new Map<string, TypedNumberArray>(),
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

  const _isEqual = (uName: string) => (values: NumberArray): boolean => {
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

  

  const _assignCacheValues = (uType:UNIFORM_TYPE) => (uName: string) => (values: NumberArray) => {
    //Must make a copy each time for two reasons:
    //1. Otherwise it could be referencing the same object in subsequent calls
    //2. Normalizing to 32-bit values
    //However - the cache is local only, so it's only allocating the first time (subsequent is just writing to mutable space)
    if (!cache.uniformValues.has(uName)) {
        switch(uType) {
            case UNIFORM_TYPE.FLOAT:
                cache.uniformValues.set(uName, new Float32Array(values.length));
                break;
            case UNIFORM_TYPE.INT:
                cache.uniformValues.set(uName, new Int32Array(values.length));
                break;
        }
      return;
    }

    const target = cache.uniformValues.get(uName);

    for (let idx = 0; idx < values.length; idx++) {
      target[idx] = values[idx];
    }

  }

  

  const _setSingleValue = (setterFn: (loc: WebGLUniformLocation) => (value: number) => void) => (uName: string) => (value: number): void => {
    if (!cache.uniformSingleValues.has(uName) || cache.uniformSingleValues.get(uName) !== value) {
      cache.uniformSingleValues.set(uName, value);
      const loc = getLocation(uName);
      if (validLocation(loc)) {
        setterFn(loc)(value); //for single values it doesn't get converted
      }
    }
  }

  const _setValues = (uType:UNIFORM_TYPE) => (setterFn: (loc: WebGLUniformLocation) => (values:NumberArray) => void) => (uName: string) => (values: NumberArray): void => {
    if (!_isEqual(uName)(values)) {
      _assignCacheValues (uType) (uName)(values);
      const loc = getLocation(uName);
      if (validLocation(loc)) {
        setterFn(loc)(cache.uniformValues.get(uName)); //for arrays it needs to be grabbed from cache which set the appropriate type
      }
    }
  }

  const _setMatrixValues = (uType:UNIFORM_TYPE) => (setterFn: (loc: WebGLUniformLocation) => (transpose: boolean) => (values:NumberArray) => void) => (uName: string) => (transpose: boolean) => (values: NumberArray): void => {
    if (!cache.uniformMatrixTranspose.has(uName) || cache.uniformMatrixTranspose.get(uName) !== transpose || !_isEqual(uName)(values)) {
      _assignCacheValues (uType) (uName)(values);
      cache.uniformMatrixTranspose.set(uName, transpose);
      const loc = getLocation(uName);
      if (validLocation(loc)) {
        setterFn(loc)(transpose)(cache.uniformValues.get(uName));
      }
    }
  }

  const setters = {
    uniform1f: _setSingleValue(loc => (v:GLfloat) => gl.uniform1f(loc, v)),
    uniform1fv: _setValues (UNIFORM_TYPE.FLOAT) (loc => (v:Float32List) => gl.uniform1fv(loc, v)),
    uniform1i: _setSingleValue(loc => (v:GLint) => gl.uniform1i(loc, v)),
    uniform1iv: _setValues (UNIFORM_TYPE.INT) (loc => (v:Int32List) => gl.uniform1iv(loc, v)),

    uniform2f: _setValues (UNIFORM_TYPE.FLOAT) (loc => (v:Float32List) => gl.uniform2f(loc, v[0], v[1])),
    uniform2fv: _setValues (UNIFORM_TYPE.FLOAT) (loc => (v:Float32List) => gl.uniform2fv(loc, v)),
    uniform2i: _setValues (UNIFORM_TYPE.INT) (loc => (v:Int32List) => gl.uniform2i(loc, v[0], v[1])),
    uniform2iv: _setValues (UNIFORM_TYPE.INT) (loc => (v:Int32List) => gl.uniform2iv(loc, v)),

    uniform3f: _setValues (UNIFORM_TYPE.FLOAT) (loc => (v:Float32List) => gl.uniform3f(loc, v[0], v[1], v[2])),
    uniform3fv: _setValues (UNIFORM_TYPE.FLOAT) (loc => (v:Float32List) => gl.uniform3fv(loc, v)),
    uniform3i: _setValues (UNIFORM_TYPE.INT) (loc => (v:Int32List) => gl.uniform3i(loc, v[0], v[1], v[2])),
    uniform3iv: _setValues (UNIFORM_TYPE.INT) (loc => (v:Int32List) => gl.uniform3iv(loc, v)),

    uniform4f: _setValues (UNIFORM_TYPE.FLOAT) (loc => (v:Float32List) => gl.uniform4f(loc, v[0], v[1], v[2], v[3])),
    uniform4fv: _setValues (UNIFORM_TYPE.FLOAT) (loc => (v:Float32List) => gl.uniform4fv(loc, v)),
    uniform4i: _setValues (UNIFORM_TYPE.INT) (loc => (v:Int32List) => gl.uniform4i(loc, v[0], v[1], v[2], v[3])),
    uniform4iv: _setValues (UNIFORM_TYPE.INT) (loc => (v:Int32List) => gl.uniform4iv(loc, v)),

    uniformMatrix2fv: _setMatrixValues (UNIFORM_TYPE.FLOAT) (loc => t => (v:Float32List) => gl.uniformMatrix2fv(loc, t, v)),
    uniformMatrix3fv: _setMatrixValues (UNIFORM_TYPE.FLOAT) (loc => t => (v:Float32List) => gl.uniformMatrix3fv(loc, t, v)),
    uniformMatrix4fv: _setMatrixValues (UNIFORM_TYPE.FLOAT) (loc => t => (v:Float32List) => gl.uniformMatrix4fv(loc, t, v)),
  }

  return {
    cache, 
    setters, 
    getLocation, 
    validLocation,
    hasLocation
  }
}

