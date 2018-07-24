
import {
    GltfScene, 
    GLTF_ORIGINAL,
    GltfLightsExtensionName,
    GltfIblExtensionName,
    gltf_updateNodeTransforms,
    Camera,
    GltfNode,
    gltf_findNodeById,
    gltf_createAnimator,
    GltfNodeKind,
    GltfBridge,
    gltf_load, 
    WebGlConstants,
    WebGlRenderer,
} from "lib/Lib";
import {ModelInfo, Model} from "../scenes/gltf/Gltf-Models";
import {updateCamera, getInitialGltfCamera} from "./Camera";
import {PointerEventStatus} from "input-senders";
import {S} from "./Sanctuary";
export const addGltfExtensions = (options: {ibl: boolean, lights: boolean}) => (model:Model) => {

    const addExtension = (name:string) => (meta:any) => (gltf:GLTF_ORIGINAL):GLTF_ORIGINAL => 
        Object.assign({}, gltf, {
            extensionsUsed:
                gltf.extensionsUsed
                    ?   gltf.extensionsUsed.concat([name])
                    :   [name],
                extensions:
                    gltf.extensions
                    ?   Object.assign({}, gltf.extensions, {
                            [name]: meta
                        })
                    :   {
                            [name]: meta
                        }
        });

    const addIbl = (gltf:GLTF_ORIGINAL) => {

        if(!options.ibl) {
            return gltf;
        }

        const meta = {
            path: "static/world/world.json",
        }

        return addExtension (GltfIblExtensionName) (meta) (gltf);
    }


    const addLights = (gltf:GLTF_ORIGINAL) => {
        if(!options.lights) {
            return gltf;
        }

        const meta = {
            lights: [

                {
                    "color": [ 1.0, 1.0, 1.0 ],
                    "intensity": 100.0,
                    //"intensity": 0.0,
                    "type": "point"
                },
                {
                    "color": [ 1.0, 0.0, 1.0 ],
                    "intensity": 1.0,
                    //"intensity": 0.0,
                    "type": "directional"
                },
                {
                    "spot": {
                        //"innerConeAngle": 0.785398163397448,
                        //"outerConeAngle": 1.57079632679,
                    },
                    "color": [
                        1.0,
                        1.0,
                        1.0
                    ],
                    //"intensity": 0.0,
                    "intensity": 40.0,
                    "type": "spot"
                },
            ]
        }


        gltf.nodes.push(
        {
            "translation": [-3,3,3],
            "extensions" : {
                [GltfLightsExtensionName]: {
                    "light" : 0
                }
            }
        },

        {
            //"rotation": [0.707, 0, 0, 0.707], //90, 0, 0 - pointing up
            //"rotation": [0, 0.707,  0, 0.707], //0, 90, 0 - pointing left
            //"rotation": [0, 0, 0.707,  0.707], //0, 0, 90 - no difference (straight)
            //"rotation": [.5, .5, .5, .5], //90, 90, 0

            "extensions" : {
                [GltfLightsExtensionName]: {
                    "light" : 1
                }
            }
        },
        {

            "translation": [0,0,-3],
            "rotation": [1, 0, 0, 0], 
            "extensions" : {
                [GltfLightsExtensionName]: {
                    "light" : 2
                }
            }
        }
        )

        if(gltf.scenes) {
            gltf.scenes[0].nodes.push(gltf.nodes.length-3);
            gltf.scenes[0].nodes.push(gltf.nodes.length-2);
            gltf.scenes[0].nodes.push(gltf.nodes.length-1);
        }

        return addExtension (GltfLightsExtensionName) (meta) (gltf);
    }

    return S.pipe([
        addIbl,
        addLights
    ])
    
}
