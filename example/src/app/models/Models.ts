import * as React from "react";

export interface Model {
    primary: string;
    label?: string;
    urls: {
        [key:string]: string
    },
    cameraPosition?: Array<number>;
    cameraLookAt?: Array<number>;
    cameraIndex?: number;
}

export interface ModelInfo {
    model:Model;
    url: string;
}

//First just set the main asset that will show in the dropdown
export const MODEL_LIST_SIMPLE:Array<Model> = [
    {
        primary: "CAMERA_PERSPECTIVE",
        urls: {        
            "CAMERA_PERSPECTIVE": "Cameras/glTF/Cameras.gltf",
            "CAMERA_PERSPECTIVE_EMBEDDED": "Cameras/glTF-Embedded/Cameras.gltf",
        },
        cameraIndex: 0
    },
    {
        primary: "CAMERA_ORTHOGRAPHIC",
        urls: {        
            "CAMERA_ORTHOGRAPHIC": "Cameras/glTF/Cameras.gltf",
            "CAMERA_ORTHOGRAPHIC_EMBEDDED": "Cameras/glTF-Embedded/Cameras.gltf",
        },
        cameraIndex: 1
    },
    {
        primary: "SIMPLE_SPARSE_ACCESSOR",
        urls: {
            "SIMPLE_SPARSE_ACCESSOR_EMBEDDED":  "SimpleSparseAccessor/glTF-Embedded/SimpleSparseAccessor.gltf",
            "SIMPLE_SPARSE_ACCESSOR":  "SimpleSparseAccessor/glTF/SimpleSparseAccessor.gltf",
        },
        cameraPosition: [0,2,10],
        cameraLookAt: [0,2,0]
    },
    {
        primary: "SIMPLE_MORPH", 
        urls: {
            "SIMPLE_MORPH_EMBEDDED":  "SimpleMorph/glTF-Embedded/SimpleMorph.gltf",
            "SIMPLE_MORPH":  "SimpleMorph/glTF-Embedded/SimpleMorph.gltf",
        }
    },
    {
        primary: "SIMPLE_MESHES", 
        urls: {
            "SIMPLE_MESHES_EMBEDDED":  "SimpleMeshes/glTF-Embedded/SimpleMeshes.gltf",
            "SIMPLE_MESHES":  "SimpleMeshes/glTF/SimpleMeshes.gltf",
        }
    },
    {
        primary: "ANIMATED_MORPH_SPHERE_BINARY", 
        label: "ANIMATED_MORPH_SPHERE",
        urls: {
            "ANIMATED_MORPH_SPHERE_BINARY":  "AnimatedMorphSphere/glTF-Binary/AnimatedMorphSphere.glb",
            "ANIMATED_MORPH_SPHERE":  "AnimatedMorphSphere/glTF/AnimatedMorphSphere.gltf",
        },
        cameraPosition: [4,4,4]
    },
    {
        primary: "MORPH_CUBE_ANIMATED_BINARY", 
        label: "MORPH_CUBE_ANIMATED",
        urls: {
            "MORPH_CUBE_ANIMATED_BINARY":  "AnimatedMorphCube/glTF-Binary/AnimatedMorphCube.glb",
            "MORPH_CUBE_ANIMATED":  "AnimatedMorphCube/glTF/AnimatedMorphCube.gltf",
        },
        cameraPosition: [4,4,4]
    },
    {
        primary: "TRIANGLE_ANIMATED", 
        urls: {
            "TRIANGLE_ANIMATED_EMBEDDED":  "AnimatedTriangle/glTF-Embedded/AnimatedTriangle.gltf",
            "TRIANGLE_ANIMATED":  "AnimatedTriangle/glTF/AnimatedTriangle.gltf",
        }
    },
    {
        primary: "TRIANGLE",
        urls: {
            "TRIANGLE_EMBEDDED":  "Triangle/glTF-Embedded/Triangle.gltf",
            "TRIANGLE":  "Triangle/glTF/Triangle.gltf",
        }
    },
    {
        primary: "TRIANGLE_WITHOUT_INDICES",
        urls: {
            "TRIANGLE_WITHOUT_INDICES":  "TriangleWithoutIndices/glTF/TriangleWithoutIndices.gltf",
        }
    }
]

export const MODEL_LIST_COMPLEX:Array<Model> = [
    {
        primary: "BOX_BINARY",
        label: "BOX",
        urls: {
            "BOX_GLOSSY": "Box/glTF-pbrSpecularGlossiness/Box.gltf",
            "BOX_DRACO": "Box/glTF-Draco/Box.gltf",
            "BOX_EMBEDDED": "Box/glTF-Embedded/Box.gltf",
            "BOX_BINARY": "Box/glTF-Binary/Box.glb",
            "BOX": "Box/glTF/Box.gltf",
        },
        cameraPosition: [-4,-4,4],
        cameraLookAt: [0,0,0]
    },
{
        primary: "BOX_INTERLEAVED",
        label: "BOX_INTERLEAVED",
        urls: {
            "BOX_INTERLEAVED_GLOSSY": "BoxInterleaved/glTF-pbrSpecularGlossiness/BoxInterleaved.gltf",
            "BOX_INTERLEAVED_EMBEDDED": "BoxInterleaved/glTF-Embedded/BoxInterleaved.gltf",
            "BOX_INTERLEAVED_BINARY": "BoxInterleaved/glTF-Binary/BoxInterleaved.glb",
            "BOX_INTERLEAVED": "BoxInterleaved/glTF/BoxInterleaved.gltf",
        },
        cameraPosition: [-4,-4,4],
        cameraLookAt: [0,0,0]
    },
]

export const MODEL_LIST_PBR1:Array<Model> = [
    {
        primary: "DAMAGED_HELMET_BINARY", 
        label: "DAMAGED_HELMET",
        urls: {
            "DAMAGED_HELMET":   "DamagedHelmet/glTF/DamagedHelmet.gltf",
            "DAMAGED_HELMET_EMBEDDED":  "DamagedHelmet/glTF-Embedded/DamagedHelmet.gltf",
            "DAMAGED_HELMET_BINARY":  "DamagedHelmet/glTF-Binary/DamagedHelmet.glb",
        }
    },
]

export const MODEL_LIST_PBR2:Array<Model> = [];
export const MODEL_LIST_FEATURETEST:Array<Model> = [];

/// END CONFIG
//

const allModels = MODEL_LIST_SIMPLE
    .concat(MODEL_LIST_COMPLEX)
    .concat(MODEL_LIST_PBR1)
    .concat(MODEL_LIST_PBR2)
    .concat(MODEL_LIST_FEATURETEST);

export const getModel = (name:string):ModelInfo => {
    let url:string;


    const model = allModels.find(model => {
            const urlKey = Object.keys(model.urls).find(mKey => mKey === name);
            if(urlKey !== undefined) {
                url = model.urls[urlKey];
                return true;
            }
            return false;
        });
    return model === undefined || url === undefined ? null : {model, url}
}

const convertMenu = ([label, models]:[string, Array<Model>]) => {
    return {
        label,
        items: models.map(model => [model.label ? model.label : model.primary, model.primary])
    }
}

export const MODEL_MENUS = [
    convertMenu(["Simple", MODEL_LIST_SIMPLE]),
    convertMenu(["Complex", MODEL_LIST_COMPLEX]),
    convertMenu(["PBR 1", MODEL_LIST_PBR1]),
    convertMenu(["PBR 2", MODEL_LIST_PBR2]),
    convertMenu(["Tests", MODEL_LIST_FEATURETEST])
]
//export const MODEL_LIST_ALL =
            
            //Object.keys(MODEL_LIST_ALTERNATES).reduce((acc, val) => acc.concat(MODEL_LIST_ALTERNATES[val]), []))
    

