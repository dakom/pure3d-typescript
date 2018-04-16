import * as React from "react";



export enum MODEL {
  NONE = "",

  SIMPLE_SPARSE_ACCESSOR_EMBEDDED = "SimpleSparseAccessor/glTF-Embedded/SimpleSparseAccessor.gltf",
  SIMPLE_SPARSE_ACCESSOR = "SimpleSparseAccessor/glTF/SimpleSparseAccessor.gltf",
  SIMPLE_MORPH_EMBEDDED = "SimpleMorph/glTF-Embedded/SimpleMorph.gltf",
  SIMPLE_MORPH = "SimpleMorph/glTF-Embedded/SimpleMorph.gltf",

  SIMPLE_MESHES_EMBEDDED = "SimpleMeshes/glTF-Embedded/SimpleMeshes.gltf",
  SIMPLE_MESHES = "SimpleMeshes/glTF/SimpleMeshes.gltf",
  ANIMATED_MORPH_SPHERE_BINARY = "AnimatedMorphSphere/glTF-Binary/AnimatedMorphSphere.glb", 
  ANIMATED_MORPH_SPHERE = "AnimatedMorphSphere/glTF/AnimatedMorphSphere.gltf",
  MORPH_CUBE_ANIMATED_BINARY = "AnimatedMorphCube/glTF-Binary/AnimatedMorphCube.glb", 
  MORPH_CUBE_ANIMATED = "AnimatedMorphCube/glTF/AnimatedMorphCube.gltf",
  TRIANGLE_ANIMATED_EMBEDDED = "AnimatedTriangle/glTF-Embedded/AnimatedTriangle.gltf",
  TRIANGLE_ANIMATED = "AnimatedTriangle/glTF/AnimatedTriangle.gltf",
  TRIANGLE_EMBEDDED = "Triangle/glTF-Embedded/Triangle.gltf",
  TRIANGLE = "Triangle/glTF/Triangle.gltf",
  TRIANGLE_WITHOUT_INDICES = "TriangleWithoutIndices/glTF/TriangleWithoutIndices.gltf",
  
  
  DAMAGED_HELMET =  "DamagedHelmet/glTF/DamagedHelmet.gltf",
  DAMAGED_HELMET_EMBEDDED = "DamagedHelmet/glTF-Embedded/DamagedHelmet.gltf",
  DAMAGED_HELMET_BINARY = "DamagedHelmet/glTF-Binary/DamagedHelmet.glb",

 
  
  
 
  //DAMAGED_HELMET_PBR_REPO =  "DamagedHelmet/glTF/pbr-repo/DamagedHelmet.gltf"


}

export const MODEL_CAMERA_POSITIONS = new Map<MODEL, Array<number>>();

//MODEL_POSITIONS.set(MODEL.DAMAGED_HELMET_PBR_REPO, [0,0,-4]);
MODEL_CAMERA_POSITIONS.set(MODEL.MORPH_CUBE_ANIMATED, [4,4,4])
MODEL_CAMERA_POSITIONS.set(MODEL.MORPH_CUBE_ANIMATED_BINARY, [4,4,4]);
MODEL_CAMERA_POSITIONS.set(MODEL.ANIMATED_MORPH_SPHERE_BINARY, [4,4,4]);
MODEL_CAMERA_POSITIONS.set(MODEL.SIMPLE_SPARSE_ACCESSOR, [-4,0,4]);
MODEL_CAMERA_POSITIONS.set(MODEL.SIMPLE_SPARSE_ACCESSOR_EMBEDDED, [-4,0,4]);

export const MODEL_ENVIRONMENT_EMPTY = new Set<MODEL>();

//MODEL_ENVIRONMENT_EMPTY.add(MODEL.SIMPLE_MESHES);
//MODEL_ENVIRONMENT_EMPTY.add(MODEL.SIMPLE_MESHES_EMBEDDED);

export const ModelContext = (React as any).createContext({
  model: MODEL.NONE,
  changeModel: (model:MODEL) => {}
});