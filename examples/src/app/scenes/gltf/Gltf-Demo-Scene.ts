import {GltfScene, GLTF_ORIGINAL, updateNodeListTransforms, Camera, GltfNode, createGltfAnimator, GltfNodeKind, GltfBridge, loadGltf, WebGlConstants, WebGlRenderer} from "lib/Lib";
import {ModelInfo, Model} from "./Gltf-Models";
import {updateCamera, getInitialGltfCamera} from "../../utils/Camera";
import {PointerEventStatus} from "input-senders";

const addEnvironment = (gltf:GLTF_ORIGINAL) => {
    //Todo - add in PBR / IBL settings
    return gltf;
}

export const startGltf = (renderer:WebGlRenderer) => ({modelPath, modelInfo}:{modelPath:string, modelInfo:ModelInfo}) => 
    loadGltf({
        renderer, 
        path: modelPath, 
        config: { },
        mapper: modelInfo.model.addEnvironment ? addEnvironment : g => g
    })
    //.chain(bridge => bridge.loadEnvironment("static/world/world/json"))
    .map(bridge => {


        const animate = createGltfAnimator(bridge.getData().animations.map(animation => ({
            animation,
            loop: true
        })));


        const nodes = bridge.getData().original.scene !== undefined
            ?   bridge.getOriginalSceneNodes(0)
            :   bridge.getAllNodes();

        const {camera, controls} = getInitialGltfCamera (bridge) (modelInfo.model)


        let scene:GltfScene = {
            camera,
            nodes: updateNodeListTransforms <GltfNode>({
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

