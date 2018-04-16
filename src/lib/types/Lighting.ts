export interface GltfLighting {
  //just one for now... might be nice to support extensions and more lights
  directional: GltfDirectionalLight; 
  
  scaleDiffBaseMR: Float32Array;
  scaleFGDSpec: Float32Array;
  scaleIBLAmbient: Float32Array;
}

export interface GltfDirectionalLight {
  direction: Float32Array;
  color: Float32Array;
}