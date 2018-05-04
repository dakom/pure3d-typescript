import {GltfScene, updateNodeListTransforms, Camera, getDefaultIblLight, createGltfAnimator, GltfNodeKind, GltfBridge, loadGltfBridge, WebGlConstants, WebGlRenderer} from "lib/Lib";
import {ModelInfo, Model} from "./Gltf-Models";
import {getInitialCamera} from "./Gltf-Camera";
import {PointerEventStatus} from "input-senders";
import * as createControls from "orbit-controls";


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

        let camera = getInitialCamera (bridge) (modelInfo.model)

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

        /*addInputListener(PointerEventStatus.START) (evt => scene = cameraUpdateStart(evt) (scene));
        addInputListener(PointerEventStatus.MOVE) (evt => scene = cameraUpdateMove(evt) (scene));
        addInputListener(PointerEventStatus.END) (evt => scene = cameraUpdateEnd (evt) (scene));
        */

        const controls = createControls();
        
        return (frameTs:number) => {
            scene = Object.assign({}, scene, {
                nodes: updateNodeListTransforms ({
                    updateLocal: true,
                    updateModel: true,
                    updateView: true,
                    camera: scene.camera
                })
                (null)
                (animate(frameTs) (scene.nodes))
            })

                
            controls.update();
           //copyInto?
            //
            bridge.renderer.gl.clear(WebGlConstants.COLOR_BUFFER_BIT | WebGlConstants.DEPTH_BUFFER_BIT); 
            bridge.renderScene(scene);
        }
    });

