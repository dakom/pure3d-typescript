import * as React from "react";

export interface Model {
    primary: string;
    label?: string;
    urls: {
        [key:string]: string
    },
    cameraPosition?: Float64Array;
    cameraLookAt?: Float64Array;
    noIbl?:boolean;
}

export interface ModelInfo {
    model:Model;
    url: string;
}

//First just set the main asset that will show in the dropdown
export const MODEL_LIST_SIMPLE:Array<Model> = [
    {
        primary: "CAMERAS",
        urls: {        
            "CAMERAS": "Cameras/glTF/Cameras.gltf",
            "CAMERAS_EMBEDDED": "Cameras/glTF-Embedded/Cameras.gltf",
        },
    },
    {
        primary: "SIMPLE_SPARSE_ACCESSOR",
        urls: {
            "SIMPLE_SPARSE_ACCESSOR_EMBEDDED":  "SimpleSparseAccessor/glTF-Embedded/SimpleSparseAccessor.gltf",
            "SIMPLE_SPARSE_ACCESSOR":  "SimpleSparseAccessor/glTF/SimpleSparseAccessor.gltf",
        },
        cameraPosition: Float64Array.from([0,2,10]),
        cameraLookAt: Float64Array.from([0,2,0])
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
        cameraPosition: Float64Array.from([4,4,4])
    },
    {
        primary: "MORPH_CUBE_ANIMATED_BINARY", 
        label: "MORPH_CUBE_ANIMATED",
        urls: {
            "MORPH_CUBE_ANIMATED_BINARY":  "AnimatedMorphCube/glTF-Binary/AnimatedMorphCube.glb",
            "MORPH_CUBE_ANIMATED":  "AnimatedMorphCube/glTF/AnimatedMorphCube.gltf",
        },
        cameraPosition: Float64Array.from([4,4,4])
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
        cameraPosition: Float64Array.from([-4,-4,4]),
        cameraLookAt: Float64Array.from([0,0,0])
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
        cameraPosition: Float64Array.from([-4,-4,4]),
        cameraLookAt: Float64Array.from([0,0,0])
    },
    {
        primary: "BOX_TEXTURED",
        label: "BOX_TEXTURED",
        urls: {
            "BOX_TEXTURED_GLOSSY": "BoxTextured/glTF-pbrSpecularGlossiness/BoxTextured.gltf",
            "BOX_TEXTURED_EMBEDDED": "BoxTextured/glTF-Embedded/BoxTextured.gltf",
            "BOX_TEXTURED_BINARY": "BoxTextured/glTF-Binary/BoxTextured.glb",
            "BOX_TEXTURED": "BoxTextured/glTF/BoxTextured.gltf",
        },
        cameraPosition: Float64Array.from([-4,-4,4]),
        cameraLookAt: Float64Array.from([0,0,0])
    },
    {
        primary: "BOX_NPOT",
        label: "BOX_NPOT",
        urls: {
            "BOX_NPOT_GLOSSY": "BoxTexturedNonPowerOfTwo/glTF-pbrSpecularGlossiness/BoxTexturedNonPowerOfTwo.gltf",
            "BOX_NPOT_EMBEDDED": "BoxTexturedNonPowerOfTwo/glTF-Embedded/BoxTexturedNonPowerOfTwo.gltf",
            "BOX_NPOT_BINARY": "BoxTexturedNonPowerOfTwo/glTF-Binary/BoxTexturedNonPowerOfTwo.glb",
            "BOX_NPOT": "BoxTexturedNonPowerOfTwo/glTF/BoxTexturedNonPowerOfTwo.gltf",
        },
        cameraPosition: Float64Array.from([-4,-4,4]),
        cameraLookAt: Float64Array.from([0,0,0])
    },
    {
        primary: "BOX_VERTEX_COLORS",
        label: "BOX_VERTEX_COLORS",
        urls: {
            "BOX_VERTEX_COLORS_EMBEDDED": "BoxVertexColors/glTF-Embedded/BoxVertexColors.gltf",
            "BOX_VERTEX_COLORS_BINARY": "BoxVertexColors/glTF-Binary/BoxVertexColors.glb",
            "BOX_VERTEX_COLORS": "BoxVertexColors/glTF/BoxVertexColors.gltf",
        },
        cameraPosition: Float64Array.from([-4,-4,4]),
        cameraLookAt: Float64Array.from([0,0,0])
    },
    {primary: "DUCK_BINARY",
        label: "DUCK",
        urls: {
            "DUCK_GLOSSY": "Duck/glTF-pbrSpecularGlossiness/Duck.gltf",
            "DUCK_DRACO": "Duck/glTF-Draco/Duck.gltf",
            "DUCK_EMBEDDED": "Duck/glTF-Embedded/Duck.gltf",
            "DUCK_BINARY": "Duck/glTF-Binary/Duck.glb",
            "DUCK": "Duck/glTF/Duck.gltf",
        },
        cameraPosition: Float64Array.from([4,1,4]),
        cameraLookAt: Float64Array.from([0,1,0])
    },

    {primary: "2CYLINDER_ENGINE_BINARY",
        label: "2CYLINDER_ENGINE",
        urls: {
            "2CYLINDER_ENGINE_GLOSSY": "2CylinderEngine/glTF-pbrSpecularGlossiness/2CylinderEngine.gltf",
            "2CYLINDER_ENGINE_DRACO": "2CylinderEngine/glTF-Draco/2CylinderEngine.gltf",
            "2CYLINDER_ENGINE_EMBEDDED": "2CylinderEngine/glTF-Embedded/2CylinderEngine.gltf",
            "2CYLINDER_ENGINE_BINARY": "2CylinderEngine/glTF-Binary/2CylinderEngine.glb",
            "2CYLINDER_ENGINE": "2CylinderEngine/glTF/2CylinderEngine.gltf",
        },
    },
    {primary: "SAW_BINARY",
        label: "SAW",
        urls: {
            "SAW_GLOSSY": "ReciprocatingSaw/glTF-pbrSpecularGlossiness/ReciprocatingSaw.gltf",
            "SAW_DRACO": "ReciprocatingSaw/glTF-Draco/ReciprocatingSaw.gltf",
            "SAW_EMBEDDED": "ReciprocatingSaw/glTF-Embedded/ReciprocatingSaw.gltf",
            "SAW_BINARY": "ReciprocatingSaw/glTF-Binary/ReciprocatingSaw.glb",
            "SAW": "ReciprocatingSaw/glTF/ReciprocatingSaw.gltf",
        },
    },
    {primary: "GEARBOX_BINARY",
        label: "GEARBOX",
        urls: {
            "GEARBOX_GLOSSY": "GearboxAssy/glTF-pbrSpecularGlossiness/GearboxAssy.gltf",
            "GEARBOX_DRACO": "GearboxAssy/glTF-Draco/GearboxAssy.gltf",
            "GEARBOX_EMBEDDED": "GearboxAssy/glTF-Embedded/GearboxAssy.gltf",
            "GEARBOX_BINARY": "GearboxAssy/glTF-Binary/GearboxAssy.glb",
            "GEARBOX": "GearboxAssy/glTF/GearboxAssy.gltf",
        },
    },
    {primary: "BUGGY_BINARY",
        label: "BUGGY",
        urls: {
            "BUGGY_GLOSSY": "Buggy/glTF-pbrSpecularGlossiness/Buggy.gltf",
            "BUGGY_DRACO": "Buggy/glTF-Draco/Buggy.gltf",
            "BUGGY_EMBEDDED": "Buggy/glTF-Embedded/Buggy.gltf",
            "BUGGY_BINARY": "Buggy/glTF-Binary/Buggy.glb",
            "BUGGY": "Buggy/glTF/Buggy.gltf",
        },
    },
]

export const MODEL_LIST_ANIMATIONS:Array<Model> = [
    {primary: "BOX_ANIMATED_BINARY",
        label: "BOX_ANIMATED",
        urls: {
            "BOX_ANIMATED_GLOSSY": "BoxAnimated/glTF-pbrSpecularGlossiness/BoxAnimated.gltf",
            "BOX_ANIMATED_DRACO": "BoxAnimated/glTF-Draco/BoxAnimated.gltf",
            "BOX_ANIMATED_EMBEDDED": "BoxAnimated/glTF-Embedded/BoxAnimated.gltf",
            "BOX_ANIMATED_BINARY": "BoxAnimated/glTF-Binary/BoxAnimated.glb",
            "BOX_ANIMATED": "BoxAnimated/glTF/BoxAnimated.gltf",
        },        
        cameraPosition: Float64Array.from([0,2,10]),
    },
    {primary: "MILK_TRUCK_BINARY",
        label: "MILK_TRUCK",
        urls: {
            "MILK_TRUCK_GLOSSY": "CesiumMilkTruck/glTF-pbrSpecularGlossiness/CesiumMilkTruck.gltf",
            "MILK_TRUCK_DRACO": "CesiumMilkTruck/glTF-Draco/CesiumMilkTruck.gltf",
            "MILK_TRUCK_EMBEDDED": "CesiumMilkTruck/glTF-Embedded/CesiumMilkTruck.gltf",
            "MILK_TRUCK_BINARY": "CesiumMilkTruck/glTF-Binary/CesiumMilkTruck.glb",
            "MILK_TRUCK": "CesiumMilkTruck/glTF/CesiumMilkTruck.gltf",
        },        
        cameraPosition: Float64Array.from([0,2,10]),
    },
    {primary: "RIGGED_SIMPLE_BINARY",
        label: "RIGGED_SIMPLE",
        urls: {
            "RIGGED_SIMPLE_GLOSSY": "RiggedSimple/glTF-pbrSpecularGlossiness/RiggedSimple.gltf",
            "RIGGED_SIMPLE_DRACO": "RiggedSimple/glTF-Draco/RiggedSimple.gltf",
            "RIGGED_SIMPLE_EMBEDDED": "RiggedSimple/glTF-Embedded/RiggedSimple.gltf",
            "RIGGED_SIMPLE_BINARY": "RiggedSimple/glTF-Binary/RiggedSimple.glb",
            "RIGGED_SIMPLE": "RiggedSimple/glTF/RiggedSimple.gltf",
        },        
        cameraPosition: Float64Array.from([0,0,30]),
    },
    {primary: "RIGGED_FIGURE_BINARY",
        label: "RIGGED_FIGURE",
        urls: {
            "RIGGED_FIGURE_GLOSSY": "RiggedFigure/glTF-pbrSpecularGlossiness/RiggedFigure.gltf",
            "RIGGED_FIGURE_DRACO": "RiggedFigure/glTF-Draco/RiggedFigure.gltf",
            "RIGGED_FIGURE_EMBEDDED": "RiggedFigure/glTF-Embedded/RiggedFigure.gltf",
            "RIGGED_FIGURE_BINARY": "RiggedFigure/glTF-Binary/RiggedFigure.glb",
            "RIGGED_FIGURE": "RiggedFigure/glTF/RiggedFigure.gltf",
        },        
        cameraPosition: Float64Array.from([0,0,5]),
    },
    {primary: "CESIUM_MAN_BINARY",
        label: "CESIUM_MAN",
        urls: {
            "CESIUM_MAN_GLOSSY": "CesiumMan/glTF-pbrSpecularGlossiness/CesiumMan.gltf",
            "CESIUM_MAN_DRACO": "CesiumMan/glTF-Draco/CesiumMan.gltf",
            "CESIUM_MAN_EMBEDDED": "CesiumMan/glTF-Embedded/CesiumMan.gltf",
            "CESIUM_MAN_BINARY": "CesiumMan/glTF-Binary/CesiumMan.glb",
            "CESIUM_MAN": "CesiumMan/glTF/CesiumMan.gltf",
        },        
        cameraPosition: Float64Array.from([0,0,5]),
    },
    {primary: "MONSTER_BINARY",
        label: "MONSTER",
        urls: {
            "MONSTER_GLOSSY": "Monster/glTF-pbrSpecularGlossiness/Monster.gltf",
            "MONSTER_DRACO": "Monster/glTF-Draco/Monster.gltf",
            "MONSTER_EMBEDDED": "Monster/glTF-Embedded/Monster.gltf",
            "MONSTER_BINARY": "Monster/glTF-Binary/Monster.glb",
            "MONSTER": "Monster/glTF/Monster.gltf",
        },        
        cameraPosition: Float64Array.from([0,0,30]),
    },
    {primary: "BRAINSTEM_BINARY",
        label: "BRAINSTEM",
        urls: {
            "BRAINSTEM_GLOSSY": "BrainStem/glTF-pbrSpecularGlossiness/BrainStem.gltf",
            "BRAINSTEM_DRACO": "BrainStem/glTF-Draco/BrainStem.gltf",
            "BRAINSTEM_EMBEDDED": "BrainStem/glTF-Embedded/BrainStem.gltf",
            "BRAINSTEM_BINARY": "BrainStem/glTF-Binary/BrainStem.glb",
            "BRAINSTEM": "BrainStem/glTF/BrainStem.gltf",
        },        
        cameraPosition: Float64Array.from([0,0,5]),
    },
    {primary: "VIRTUAL_CITY_BINARY",
        label: "VIRTUAL_CITY",
        urls: {
            "VIRTUAL_CITY_GLOSSY": "VC/glTF-pbrSpecularGlossiness/VC.gltf",
            "VIRTUAL_CITY_DRACO": "VC/glTF-Draco/VC.gltf",
            "VIRTUAL_CITY_EMBEDDED": "VC/glTF-Embedded/VC.gltf",
            "VIRTUAL_CITY_BINARY": "VC/glTF-Binary/VC.glb",
            "VIRTUAL_CITY": "VC/glTF/VC.gltf",
        },        
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
    .concat(MODEL_LIST_ANIMATIONS)
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
    convertMenu(["Animations", MODEL_LIST_ANIMATIONS]),
    convertMenu(["PBR 1", MODEL_LIST_PBR1]),
    convertMenu(["PBR 2", MODEL_LIST_PBR2]),
    convertMenu(["Tests", MODEL_LIST_FEATURETEST])
]
//export const MODEL_LIST_ALL =
            
            //Object.keys(MODEL_LIST_ALTERNATES).reduce((acc, val) => acc.concat(MODEL_LIST_ALTERNATES[val]), []))
    

