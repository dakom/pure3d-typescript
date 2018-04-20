import * as React from "react";

//First just set the main asset that will show in the dropdown
export const MODEL_LIST_SIMPLE = [
    "CAMERA_PERSPECTIVE",
    "CAMERA_ORTHOGRAPHIC",
  "SIMPLE_SPARSE_ACCESSOR", 
  "SIMPLE_MORPH", 
  "SIMPLE_MESHES", 
  "ANIMATED_MORPH_SPHERE_BINARY", 
  "MORPH_CUBE_ANIMATED_BINARY", 
  "TRIANGLE_ANIMATED", 
  "TRIANGLE", 
]

export const MODEL_LIST_COMPLEX= [
    "BOX_BINARY"
]

export const MODEL_LIST_PBR1 = [
  "DAMAGED_HELMET_BINARY", 
]

export const MODEL_LIST_PBR2 = [];
export const MODEL_LIST_FEATURETEST = [];


//Then list the alternates here. The alternates will automatically get the same camera settings as the dropdown
const MODEL_LIST_ALTERNATES = {
    "CAMERA_PERSPECTIVE": [
        "CAMERA_PERSPECTIVE_EMBEDDED"
    ],
    "CAMERA_ORTHOGRAPHIC": [
        "CAMERA_ORTHOGRAPHIC_EMBEDDED"
    ],
    "SIMPLE_SPARSE_ACCESSOR":[
        "SIMPLE_SPARSE_ACCESSOR_EMBEDDED", 
    ],

    "SIMPLE_MORPH": [
        "SIMPLE_MORPH_EMBEDDED", 
    ],
    "SIMPLE_MESHES": [
        "SIMPLE_MESHES_EMBEDDED", 
    ],
    "ANIMATED_MORPH_SPHERE_BINARY": [
        "ANIMATED_MORPH_SPHERE", 
    ],
    "MORPH_CUBE_ANIMATED_BINARY": [
        "MORPH_CUBE_ANIMATED", 
    ],
    "TRIANGLE_ANIMATED": [
        "TRIANGLE_ANIMATED_EMBEDDED", 
    ],
    "TRIANGLE": [
        "TRIANGLE_EMBEDDED", 
    ],

    "DAMAGED_HELMET_BINARY": [
        "TRIANGLE_WITHOUT_INDICES", 
        "DAMAGED_HELMET", 
        "DAMAGED_HELMET_EMBEDDED", 
    ],

    "BOX_BINARY": [
        "BOX",
        "BOX_GLOSSY",
        "BOX_EMBEDDED",
        "BOX_DRACO",
    ]
};


//Set all the URLS - these are required for each alternate as well (they are different paths afterall) 
export const MODEL_URLS = new Map<string, string>();

MODEL_URLS.set("BOX_GLOSSY", "Box/glTF-pbrSpecularGlossiness/Box.gltf");
MODEL_URLS.set("BOX_DRACO", "Box/glTF-Draco/Box.gltf");
MODEL_URLS.set("BOX_EMBEDDED", "Box/glTF-Embedded/Box.gltf");
MODEL_URLS.set("BOX_BINARY", "Box/glTF-Binary/Box.glb");
MODEL_URLS.set("BOX", "Box/glTF/Box.gltf");
MODEL_URLS.set("CAMERA_ORTHOGRAPHIC", "Cameras/glTF/Cameras.gltf");
MODEL_URLS.set("CAMERA_PERSPECTIVE", "Cameras/glTF/Cameras.gltf");
MODEL_URLS.set("CAMERA_ORTHOGRAPHIC_EMBEDDED", "Cameras/glTF-Embedded/Cameras.gltf");
MODEL_URLS.set("CAMERA_PERSPECTIVE_EMBEDDED", "Cameras/glTF-Embedded/Cameras.gltf");
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

//The default camera is hardcoded via demo purposes _or_ derived via gltf
//It can be overridden here
export const MODEL_CAMERA_POSITIONS = new Map<string, Array<number>>();

MODEL_CAMERA_POSITIONS.set("MORPH_CUBE_ANIMATED", [4,4,4])
MODEL_CAMERA_POSITIONS.set("MORPH_CUBE_ANIMATED_BINARY", [4,4,4]);
MODEL_CAMERA_POSITIONS.set("ANIMATED_MORPH_SPHERE_BINARY", [4,4,4]);
MODEL_CAMERA_POSITIONS.set("SIMPLE_SPARSE_ACCESSOR", [0,2,10]);
MODEL_CAMERA_POSITIONS.set("SIMPLE_SPARSE_ACCESSOR_EMBEDDED", [0,2,4]);
MODEL_CAMERA_POSITIONS.set("BOX_BINARY", [0,0,4]);

export const MODEL_CAMERA_LOOKAT = new Map<string, Array<number>>();
MODEL_CAMERA_LOOKAT.set("SIMPLE_SPARSE_ACCESSOR", [0,2,0]);

export const MODEL_CAMERA_INDEX = new Map<string, number>();
MODEL_CAMERA_INDEX.set("CAMERA_PERSPECTIVE", 0);
MODEL_CAMERA_INDEX.set("CAMERA_ORTHOGRAPHIC", 1);

export const MODEL_ENVIRONMENT_EMPTY = new Set<string>();

//////////////NOTHING MORE TO CONFIG FROM HERE/////////////////////////
Object.keys(MODEL_LIST_ALTERNATES).forEach(key => {
    const alts = MODEL_LIST_ALTERNATES[key];

    if(MODEL_CAMERA_POSITIONS.has(key)) {
        alts.forEach(altKey => MODEL_CAMERA_POSITIONS.set(altKey, MODEL_CAMERA_POSITIONS.get(key)));    
    }

    if(MODEL_CAMERA_LOOKAT.has(key)) {
        alts.forEach(altKey => MODEL_CAMERA_LOOKAT.set(altKey, MODEL_CAMERA_LOOKAT.get(key)));    
    }
    if(MODEL_CAMERA_INDEX.has(key)) {
        alts.forEach(altKey => MODEL_CAMERA_INDEX.set(altKey, MODEL_CAMERA_INDEX.get(key)));    
    }
});


export const MODEL_LIST_ALL =
    MODEL_LIST_SIMPLE
        .concat(MODEL_LIST_COMPLEX)
        .concat(MODEL_LIST_PBR1)
        .concat(MODEL_LIST_PBR2)
        .concat(MODEL_LIST_FEATURETEST)
        .concat(Object.keys(MODEL_LIST_ALTERNATES).reduce((acc, val) => acc.concat(MODEL_LIST_ALTERNATES[val]), []))
    

