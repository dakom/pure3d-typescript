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
        cameraPosition: Float64Array.from([0,0,.1]),
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
        primary: "AVOCADO_BINARY", 
        label: "AVOCADO",
        urls: {
            "AVOCADO":   "Avocado/glTF/Avocado.gltf",
            "AVOCADO_EMBEDDED":  "Avocado/glTF-Embedded/Avocado.gltf",
            "AVOCADO_BINARY":  "Avocado/glTF-Binary/Avocado.glb",
            "AVOCADO_GLOSSY": "Avocado/glTF-pbrSpecularGlossiness/Avocado.gltf",
            "AVOCADO_DRACO": "Avocado/glTF-Draco/Avocado.gltf",
        },
        cameraPosition: Float64Array.from([0,0,.2]),
    },
    {
        primary: "BARRAMUNDI_FISH_BINARY", 
        label: "BARRAMUNDI_FISH",
        urls: {
            "BARRAMUNDI_FISH":   "BarramundiFish/glTF/BarramundiFish.gltf",
            "BARRAMUNDI_FISH_EMBEDDED":  "BarramundiFish/glTF-Embedded/BarramundiFish.gltf",
            "BARRAMUNDI_FISH_BINARY":  "BarramundiFish/glTF-Binary/BarramundiFish.glb",
            "BARRAMUNDI_FISH_GLOSSY": "BarramundiFish/glTF-pbrSpecularGlossiness/BarramundiFish.gltf",
            "BARRAMUNDI_FISH_DRACO": "BarramundiFish/glTF-Draco/BarramundiFish.gltf",
        },
        cameraPosition: Float64Array.from([0,0,2]),
    },
    {
        primary: "BOOM_BOX_BINARY", 
        label: "BOOM_BOX",
        urls: {
            "BOOM_BOX":   "BoomBox/glTF/BoomBox.gltf",
            "BOOM_BOX_EMBEDDED":  "BoomBox/glTF-Embedded/BoomBox.gltf",
            "BOOM_BOX_BINARY":  "BoomBox/glTF-Binary/BoomBox.glb",
            "BOOM_BOX_GLOSSY": "BoomBox/glTF-pbrSpecularGlossiness/BoomBox.gltf",
            "BOOM_BOX_DRACO": "BoomBox/glTF-Draco/BoomBox.gltf",
        },
        cameraPosition: Float64Array.from([0,0,.05]),
    },
    {
        primary: "CORSET_BINARY", 
        label: "CORSET",
        urls: {
            "CORSET":   "Corset/glTF/Corset.gltf",
            "CORSET_EMBEDDED":  "Corset/glTF-Embedded/Corset.gltf",
            "CORSET_BINARY":  "Corset/glTF-Binary/Corset.glb",
            "CORSET_GLOSSY": "Corset/glTF-pbrSpecularGlossiness/Corset.gltf",
            "CORSET_DRACO": "Corset/glTF-Draco/Corset.gltf",
        },
        cameraPosition: Float64Array.from([0,0,.2]),
    },
    {
        primary: "DAMAGED_HELMET_BINARY", 
        label: "DAMAGED_HELMET",
        urls: {
            "DAMAGED_HELMET":   "DamagedHelmet/glTF/DamagedHelmet.gltf",
            "DAMAGED_HELMET_EMBEDDED":  "DamagedHelmet/glTF-Embedded/DamagedHelmet.gltf",
            "DAMAGED_HELMET_BINARY":  "DamagedHelmet/glTF-Binary/DamagedHelmet.glb",
        }
    },
    {
        primary: "FLIGHT_HELMET",
        label: "FLIGHT_HELMET",
        urls: {
            "FLIGHT_HELMET":   "FlightHelmet/glTF/FlightHelmet.gltf",
            "FLIGHT_HELMET_EMBEDDED":  "FlightHelmet/glTF-Embedded/FlightHelmet.gltf",
            "FLIGHT_HELMET_BINARY":  "FlightHelmet/glTF-Binary/FlightHelmet.glb",
            "FLIGHT_HELMET_GLOSSY": "FlightHelmet/glTF-pbrSpecularGlossiness/FlightHelmet.gltf",
            "FLIGHT_HELMET_DRACO": "FlightHelmet/glTF-Draco/FlightHelmet.gltf",
        },
        cameraPosition: Float64Array.from([0,0,1]),
    },
    {
        primary: "LANTERN_BINARY", 
        label: "LANTERN",
        urls: {
            "LANTERN":   "Lantern/glTF/Lantern.gltf",
            "LANTERN_EMBEDDED":  "Lantern/glTF-Embedded/Lantern.gltf",
            "LANTERN_BINARY":  "Lantern/glTF-Binary/Lantern.glb",
            "LANTERN_GLOSSY": "Lantern/glTF-pbrSpecularGlossiness/Lantern.gltf",
            "LANTERN_DRACO": "Lantern/glTF-Draco/Lantern.gltf",
        },
        cameraPosition: Float64Array.from([0,0,60]),
    },
    {
        primary: "WATER_BOTTLE_BINARY", 
        label: "WATER_BOTTLE",
        urls: {
            "WATER_BOTTLE":   "WaterBottle/glTF/WaterBottle.gltf",
            "WATER_BOTTLE_EMBEDDED":  "WaterBottle/glTF-Embedded/WaterBottle.gltf",
            "WATER_BOTTLE_BINARY":  "WaterBottle/glTF-Binary/WaterBottle.glb",
            "WATER_BOTTLE_GLOSSY": "WaterBottle/glTF-pbrSpecularGlossiness/WaterBottle.gltf",
            "WATER_BOTTLE_DRACO": "WaterBottle/glTF-Draco/WaterBottle.gltf",
        },
        cameraPosition: Float64Array.from([0,0,.7]),
    },
]

export const MODEL_LIST_PBR2:Array<Model> = [
    {
        primary: "TWO_SIDED_PLANE",
        label: "TWO_SIDED_PLANE",
        urls: {
            "TWO_SIDED_PLANE":   "TwoSidedPlane/glTF/TwoSidedPlane.gltf",
            "TWO_SIDED_PLANE_EMBEDDED":  "TwoSidedPlane/glTF-Embedded/TwoSidedPlane.gltf",
            "TWO_SIDED_PLANE_BINARY":  "TwoSidedPlane/glTF-Binary/TwoSidedPlane.glb",
            "TWO_SIDED_PLANE_GLOSSY": "TwoSidedPlane/glTF-pbrSpecularGlossiness/TwoSidedPlane.gltf",
            "TWO_SIDED_PLANE_DRACO": "TwoSidedPlane/glTF-Draco/TwoSidedPlane.gltf",
        },
        cameraPosition: Float64Array.from([0,0,2]),
    },
    {
        primary: "CUBE", 
        label: "CUBE",
        urls: {
            "CUBE":   "Cube/glTF/Cube.gltf",
            "CUBE_EMBEDDED":  "Cube/glTF-Embedded/Cube.gltf",
            "CUBE_BINARY":  "Cube/glTF-Binary/Cube.glb",
            "CUBE_GLOSSY": "Cube/glTF-pbrSpecularGlossiness/Cube.gltf",
            "CUBE_DRACO": "Cube/glTF-Draco/Cube.gltf",
        },
        cameraPosition: Float64Array.from([0,0,5]),
    },
    {
        primary: "ANIMATED_CUBE", 
        label: "ANIMATED_CUBE",
        urls: {
            "ANIMATED_CUBE":   "AnimatedCube/glTF/AnimatedCube.gltf",
            "ANIMATED_CUBE_EMBEDDED":  "AnimatedCube/glTF-Embedded/AnimatedCube.gltf",
            "ANIMATED_CUBE_BINARY":  "AnimatedCube/glTF-Binary/AnimatedCube.glb",
            "ANIMATED_CUBE_GLOSSY": "AnimatedCube/glTF-pbrSpecularGlossiness/AnimatedCube.gltf",
            "ANIMATED_CUBE_DRACO": "AnimatedCube/glTF-Draco/AnimatedCube.gltf",
        },
        cameraPosition: Float64Array.from([0,0,5]),
    },
    {
        primary: "SUZANNE", 
        label: "SUZANNE",
        urls: {
            "SUZANNE":   "Suzanne/glTF/Suzanne.gltf",
            "SUZANNE_EMBEDDED":  "Suzanne/glTF-Embedded/Suzanne.gltf",
            "SUZANNE_BINARY":  "Suzanne/glTF-Binary/Suzanne.glb",
            "SUZANNE_GLOSSY": "Suzanne/glTF-pbrSpecularGlossiness/Suzanne.gltf",
            "SUZANNE_DRACO": "Suzanne/glTF-Draco/Suzanne.gltf",
        },
        cameraPosition: Float64Array.from([0,0,5]),
    },
    {
        primary: "SCIFI_HELMET", 
        label: "SCIFI_HELMET",
        urls: {
            "SCIFI_HELMET":   "SciFiHelmet/glTF/SciFiHelmet.gltf",
            "SCIFI_HELMET_EMBEDDED":  "SciFiHelmet/glTF-Embedded/SciFiHelmet.gltf",
            "SCIFI_HELMET_BINARY":  "SciFiHelmet/glTF-Binary/SciFiHelmet.glb",
            "SCIFI_HELMET_GLOSSY": "SciFiHelmet/glTF-pbrSpecularGlossiness/SciFiHelmet.gltf",
            "SCIFI_HELMET_DRACO": "SciFiHelmet/glTF-Draco/SciFiHelmet.gltf",
        },
        cameraPosition: Float64Array.from([0,0,5]),
    },
];
export const MODEL_LIST_FEATURETEST:Array<Model> = [
    {
        primary: "ALPHA_BLEND_MODE", 
        label: "ALPHA_BLEND_MODE",
        urls: {
            "ALPHA_BLEND_MODE":   "AlphaBlendModeTest/glTF/AlphaBlendModeTest.gltf",
            "ALPHA_BLEND_MODE_EMBEDDED":  "AlphaBlendModeTest/glTF-Embedded/AlphaBlendModeTest.gltf",
            "ALPHA_BLEND_MODE_BINARY":  "AlphaBlendModeTest/glTF-Binary/AlphaBlendModeTest.glb",
            "ALPHA_BLEND_MODE_GLOSSY": "AlphaBlendModeTest/glTF-pbrSpecularGlossiness/AlphaBlendModeTest.gltf",
            "ALPHA_BLEND_MODE_DRACO": "AlphaBlendModeTest/glTF-Draco/AlphaBlendModeTest.gltf",
        },
        cameraPosition: Float64Array.from([0,0,7]),
    },
    {
        primary: "BOOM_BOX_AXES", 
        label: "BOOM_BOX_AXES",
        urls: {
            "BOOM_BOX_AXES":   "BoomBoxWithAxes/glTF/BoomBoxWithAxes.gltf",
            "BOOM_BOX_AXES_EMBEDDED":  "BoomBoxWithAxes/glTF-Embedded/BoomBoxWithAxes.gltf",
            "BOOM_BOX_AXES_BINARY":  "BoomBoxWithAxes/glTF-Binary/BoomBoxWithAxes.glb",
            "BOOM_BOX_AXES_GLOSSY": "BoomBoxWithAxes/glTF-pbrSpecularGlossiness/BoomBoxWithAxes.gltf",
            "BOOM_BOX_AXES_DRACO": "BoomBoxWithAxes/glTF-Draco/BoomBoxWithAxes.gltf",
        },
        cameraPosition: Float64Array.from([0,0,.1]),
    },
    {
        primary: "METAL_ROUGH_SPHERES", 
        label: "METAL_ROUGH_SPHERES",
        urls: {
            "METAL_ROUGH_SPHERES":   "MetalRoughSpheres/glTF/MetalRoughSpheres.gltf",
            "METAL_ROUGH_SPHERES_EMBEDDED":  "MetalRoughSpheres/glTF-Embedded/MetalRoughSpheres.gltf",
            "METAL_ROUGH_SPHERES_BINARY":  "MetalRoughSpheres/glTF-Binary/MetalRoughSpheres.glb",
            "METAL_ROUGH_SPHERES_GLOSSY": "MetalRoughSpheres/glTF-pbrSpecularGlossiness/MetalRoughSpheres.gltf",
            "METAL_ROUGH_SPHERES_DRACO": "MetalRoughSpheres/glTF-Draco/MetalRoughSpheres.gltf",
        },
        cameraPosition: Float64Array.from([0,0,15]),
    },
    {
        primary: "NORMAL_TANGENTS", 
        label: "NORMAL_TANGENTS",
        urls: {
            "NORMAL_TANGENTS":   "NormalTangentTest/glTF/NormalTangentTest.gltf",
            "NORMAL_TANGENTS_EMBEDDED":  "NormalTangentTest/glTF-Embedded/NormalTangentTest.gltf",
            "NORMAL_TANGENTS_BINARY":  "NormalTangentTest/glTF-Binary/NormalTangentTest.glb",
            "NORMAL_TANGENTS_GLOSSY": "NormalTangentTest/glTF-pbrSpecularGlossiness/NormalTangentTest.gltf",
            "NORMAL_TANGENTS_DRACO": "NormalTangentTest/glTF-Draco/NormalTangentTest.gltf",
        },
        cameraPosition: Float64Array.from([0,0,5]),
    },
    {
        primary: "ORIENTATION", 
        label: "ORIENTATION",
        urls: {
            "ORIENTATION":   "OrientationTest/glTF/OrientationTest.gltf",
            "ORIENTATION_EMBEDDED":  "OrientationTest/glTF-Embedded/OrientationTest.gltf",
            "ORIENTATION_BINARY":  "OrientationTest/glTF-Binary/OrientationTest.glb",
            "ORIENTATION_GLOSSY": "OrientationTest/glTF-pbrSpecularGlossiness/OrientationTest.gltf",
            "ORIENTATION_DRACO": "OrientationTest/glTF-Draco/OrientationTest.gltf",
        },
        cameraPosition: Float64Array.from([0,0,50]),
    },
    {
        primary: "TEXTURE_COORDINATE", 
        label: "TEXTURE_COORDINATE",
        urls: {
            "TEXTURE_COORDINATE":   "TextureCoordinateTest/glTF/TextureCoordinateTest.gltf",
            "TEXTURE_COORDINATE_EMBEDDED":  "TextureCoordinateTest/glTF-Embedded/TextureCoordinateTest.gltf",
            "TEXTURE_COORDINATE_BINARY":  "TextureCoordinateTest/glTF-Binary/TextureCoordinateTest.glb",
            "TEXTURE_COORDINATE_GLOSSY": "TextureCoordinateTest/glTF-pbrSpecularGlossiness/TextureCoordinateTest.gltf",
            "TEXTURE_COORDINATE_DRACO": "TextureCoordinateTest/glTF-Draco/TextureCoordinateTest.gltf",
        },
        cameraPosition: Float64Array.from([0,0,5]),
    },
    {
        primary: "TEXTURE_SETTINGS_BINARY", 
        label: "TEXTURE_SETTINGS",
        urls: {
            "TEXTURE_SETTINGS":   "TextureSettingsTest/glTF/TextureSettingsTest.gltf",
            "TEXTURE_SETTINGS_EMBEDDED":  "TextureSettingsTest/glTF-Embedded/TextureSettingsTest.gltf",
            "TEXTURE_SETTINGS_BINARY":  "TextureSettingsTest/glTF-Binary/TextureSettingsTest.glb",
            "TEXTURE_SETTINGS_GLOSSY": "TextureSettingsTest/glTF-pbrSpecularGlossiness/TextureSettingsTest.gltf",
            "TEXTURE_SETTINGS_DRACO": "TextureSettingsTest/glTF-Draco/TextureSettingsTest.gltf",
        },
        cameraPosition: Float64Array.from([0,0,20]),
    },
    {
        primary: "VERTEX_COLOR_BINARY", 
        label: "VERTEX_COLOR",
        urls: {
            "VERTEX_COLOR":   "VertexColorTest/glTF/VertexColorTest.gltf",
            "VERTEX_COLOR_EMBEDDED":  "VertexColorTest/glTF-Embedded/VertexColorTest.gltf",
            "VERTEX_COLOR_BINARY":  "VertexColorTest/glTF-Binary/VertexColorTest.glb",
            "VERTEX_COLOR_GLOSSY": "VertexColorTest/glTF-pbrSpecularGlossiness/VertexColorTest.gltf",
            "VERTEX_COLOR_DRACO": "VertexColorTest/glTF-Draco/VertexColorTest.gltf",
        },
        cameraPosition: Float64Array.from([0,0,5]),
    },
];

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
    

