import {
    GltfScene, 
    GLTF_ORIGINAL,
    GltfLightsExtensionName,
    GltfIblExtensionName,
    gltf_updateNodeTransforms,
    Camera,
    GltfNode,
    gltf_createAnimator,
    GltfNodeKind,
    GltfBridge,
    gltf_load, 
    WebGlConstants,
    WebGlRenderer} from "lib/Lib";
import {ModelInfo, Model} from "./Gltf-Models";
import {updateCamera, getInitialGltfCamera} from "../../utils/Camera";
import {PointerEventStatus} from "input-senders";
import {S} from "../../utils/Sanctuary";


const addExtensions = ({model, menuOptions}: {model:Model, menuOptions}) => {

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

        if(!menuOptions.ibl) {
            return gltf;
        }

        const meta = {
            path: "static/world/world.json",
            settings: {
                scaleDiffBaseMR: Float64Array.from([0.0, 0.0, 0.0, 0.0]),
                scaleFGDSpec: Float64Array.from([0.0, 0.0, 0.0, 0.0]),
                scaleIBLAmbient: Float64Array.from([1.0, 1.0, 0.0, 0.0]),
            }
        }

        return addExtension (GltfIblExtensionName) (meta) (gltf);
    }


    const addLights = (gltf:GLTF_ORIGINAL) => {
        if(!menuOptions.lights) {
            return gltf;
        }

        const meta = {
            lights: [

                {
                    "color": [
                        1.0,
                        1.0,
                        1.0
                    ],
                    "type": "ambient"
                },
                {
                    "spot": {
                        "innerConeAngle": 0.785398163397448,
                        "outerConeAngle": 1.57079632679,
                    },
                    "color": [
                        1.0,
                        1.0,
                        1.0
                    ],
                    "type": "spot"
                }
            ]
        }


        gltf.nodes.push({
            "extensions" : {
                "KHR_lights" : {
                    "light" : 1
                }
            }
        })

        if(gltf.scenes) {
            gltf.scenes[0].nodes.push(gltf.nodes.length-1)
           
            if(!gltf.scenes[0].extensions) {
                gltf.scenes[0].extensions = {}
            }

            Object.assign(gltf.scenes[0].extensions, {
                "KHR_lights": {
                    "light": 0
                }
            });
        }

        return addExtension (GltfLightsExtensionName) (meta) (gltf);
    }

    return S.pipe([
        addIbl,
        addLights
    ])
    
}

export const startGltf = (renderer:WebGlRenderer) => ({modelPath, modelInfo, menuOptions}:{modelPath:string, modelInfo:ModelInfo, menuOptions: any}) => 
    gltf_load({
        renderer, 
        path: modelPath, 
        config: { },
        mapper: addExtensions ({model: modelInfo.model, menuOptions})
    })
    //.chain(bridge => bridge.loadEnvironment("static/world/world/json"))
    .map(bridge => {
        const animate = gltf_createAnimator(bridge.getData().animations) ({loop: true});


        const {camera, controls, isControlled} = getInitialGltfCamera (bridge) (modelInfo.model) (menuOptions.bakedCamera)

        let scene = bridge.getOriginalScene(camera) (0);

        controls.enable();
       

        return [
            (frameTs:number) => {

                scene = bridge.updateShaderConfigs(scene);
                const nodes = animate (frameTs) (scene.nodes)


                scene = Object.assign({}, scene, {
                    camera: !isControlled
                        ?   scene.camera
                        :   updateCamera(controls) (scene.camera), 
                    nodes: gltf_updateNodeTransforms ({
                        updateLocal: true,
                        updateModel: true,
                        updateView: true,
                        camera: scene.camera
                    })
                    (nodes)
                });

                
                

                bridge.renderer.gl.clear(WebGlConstants.COLOR_BUFFER_BIT | WebGlConstants.DEPTH_BUFFER_BIT); 
                bridge.renderScene(scene);
            },
            () => {
                controls.disable();
                console.log("cleanup!");
            }
        ]
    });
