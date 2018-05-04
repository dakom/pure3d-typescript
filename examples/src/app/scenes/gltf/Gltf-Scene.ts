import {GltfScene, updateNodeListTransforms, Camera, getDefaultIblLight, createGltfAnimator, GltfNodeKind, GltfBridge, loadGltfBridge, WebGlConstants, WebGlRenderer} from "lib/Lib";
import {ModelInfo, Model} from "./Gltf-Models";
import {updateCamera, getInitialCamera} from "./Gltf-Camera";
import {PointerEventStatus} from "input-senders";

export const startGltf = (renderer:WebGlRenderer) => ({modelPath, modelInfo}:{modelPath:string, modelInfo:ModelInfo}) => 
    loadGltfBridge({
        renderer, 
        environmentPath: "static/world/world.json", 
        gltfPath: modelPath, 
        config: { }
    }).map(bridge => {


        const animate = createGltfAnimator(bridge.data.animations.map(animation => ({
            animation,
            loop: true
        })));


        const nodes = bridge.data.original.scene !== undefined
            ?   bridge.getOriginalSceneNodes(0)
            :   bridge.allNodes;

        const {camera, controls} = getInitialCamera (bridge) (modelInfo.model)

        const ibl = getDefaultIblLight();

        let scene:GltfScene = {
            ibl,
            camera,
            nodes: updateNodeListTransforms ({
                updateLocal: true,
                updateModel: true,
                updateView: true,
                camera
            })
            (null)
            (nodes)
        }


        controls.enable();
        
        return [
            (frameTs:number) => {

                scene = Object.assign({}, scene, {
                    camera: updateCamera(controls) (scene.camera), 
                    nodes: updateNodeListTransforms ({
                        updateLocal: true,
                        updateModel: true,
                        updateView: true,
                        camera: scene.camera
                    })
                    (null)
                    (animate(frameTs) (scene.nodes))
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

