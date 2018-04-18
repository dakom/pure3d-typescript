import * as React from "react";

export const MODEL_LIST_PRIMITIVES = [
  "SIMPLE_SPARSE_ACCESSOR_EMBEDDED", 
  "SIMPLE_SPARSE_ACCESSOR", 
  "SIMPLE_MORPH_EMBEDDED", 
  "SIMPLE_MORPH", 

  "SIMPLE_MESHES_EMBEDDED", 
  "SIMPLE_MESHES", 
  "ANIMATED_MORPH_SPHERE_BINARY", 
  "ANIMATED_MORPH_SPHERE", 
  "MORPH_CUBE_ANIMATED_BINARY", 
  "MORPH_CUBE_ANIMATED", 
  "TRIANGLE_ANIMATED_EMBEDDED", 
  "TRIANGLE_ANIMATED", 
  "TRIANGLE_EMBEDDED", 
  "TRIANGLE", 
  "TRIANGLE_WITHOUT_INDICES", 
]

export const MODEL_LIST_ADVANCED = [
  "DAMAGED_HELMET", 
  "DAMAGED_HELMET_EMBEDDED", 
  "DAMAGED_HELMET_BINARY", 
]

export const MODEL_LIST_ALL =
    MODEL_LIST_PRIMITIVES
        .concat(MODEL_LIST_ADVANCED);

export const MODEL_URLS = new Map<string, string>();


  MODEL_URLS.set("SIMPLE_SPARSE_ACCESSOR_EMBEDDED",  "SimpleSparseAccessor/glTF-Embedded/SimpleSparseAccessor.gltf");
  MODEL_URLS.set("SIMPLE_SPARSE_ACCESSOR",  "SimpleSparseAccessor/glTF/SimpleSparseAccessor.gltf");
  MODEL_URLS.set("SIMPLE_MORPH_EMBEDDED",  "SimpleMorph/glTF-Embedded/SimpleMorph.gltf");
  MODEL_URLS.set("SIMPLE_MORPH",  "SimpleMorph/glTF-Embedded/SimpleMorph.gltf");

  MODEL_URLS.set("SIMPLE_MESHES_EMBEDDED",  "SimpleMeshes/glTF-Embedded/SimpleMeshes.gltf");
  MODEL_URLS.set("SIMPLE_MESHES",  "SimpleMeshes/glTF/SimpleMeshes.gltf");
  MODEL_URLS.set("ANIMATED_MORPH_SPHERE_BINARY",  "AnimatedMorphSphere/glTF-Binary/AnimatedMorphSphere.glb");
  MODEL_URLS.set("ANIMATED_MORPH_SPHERE",  "AnimatedMorphSphere/glTF/AnimatedMorphSphere.gltf");
  MODEL_URLS.set("MORPH_CUBE_ANIMATED_BINARY",  "AnimatedMorphCube/glTF-Binary/AnimatedMorphCube.glb",);
  MODEL_URLS.set("MORPH_CUBE_ANIMATED",  "AnimatedMorphCube/glTF/AnimatedMorphCube.gltf");
  MODEL_URLS.set("TRIANGLE_ANIMATED_EMBEDDED",  "AnimatedTriangle/glTF-Embedded/AnimatedTriangle.gltf");
  MODEL_URLS.set("TRIANGLE_ANIMATED",  "AnimatedTriangle/glTF/AnimatedTriangle.gltf");
  MODEL_URLS.set("TRIANGLE_EMBEDDED",  "Triangle/glTF-Embedded/Triangle.gltf");
  MODEL_URLS.set("TRIANGLE",  "Triangle/glTF/Triangle.gltf");
  MODEL_URLS.set("TRIANGLE_WITHOUT_INDICES",  "TriangleWithoutIndices/glTF/TriangleWithoutIndices.gltf");
  
  MODEL_URLS.set("DAMAGED_HELMET",   "DamagedHelmet/glTF/DamagedHelmet.gltf");
  MODEL_URLS.set("DAMAGED_HELMET_EMBEDDED",  "DamagedHelmet/glTF-Embedded/DamagedHelmet.gltf");
  MODEL_URLS.set("DAMAGED_HELMET_BINARY",  "DamagedHelmet/glTF-Binary/DamagedHelmet.glb");

export const MODEL_CAMERA_POSITIONS = new Map<string, Array<number>>();

//MODEL_POSITIONS.set(MODEL.DAMAGED_HELMET_PBR_REPO, [0,0,-4]);
MODEL_CAMERA_POSITIONS.set("MORPH_CUBE_ANIMATED", [4,4,4])
MODEL_CAMERA_POSITIONS.set("MORPH_CUBE_ANIMATED_BINARY", [4,4,4]);
MODEL_CAMERA_POSITIONS.set("ANIMATED_MORPH_SPHERE_BINARY", [4,4,4]);
MODEL_CAMERA_POSITIONS.set("SIMPLE_SPARSE_ACCESSOR", [-4,0,4]);
MODEL_CAMERA_POSITIONS.set("SIMPLE_SPARSE_ACCESSOR_EMBEDDED", [-4,0,4]);

export const MODEL_ENVIRONMENT_EMPTY = new Set<string>();

export const ModelContext = (React as any).createContext({
  model: "",
  changeModel: (model:string) => {}
});
