
export interface WebGlUniformCache {
  uniformLocations: Map<string, WebGLUniformLocation>;
  uniformValues: Map<string, Array<number> | Float32Array | Int32Array>;
  uniformSingleValues: Map<string, number>;
  uniformMatrixTranspose: Map<string, boolean>;
}
