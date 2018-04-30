import {GltfScene, updateNodeListTransforms, Camera, getDefaultIblLight, createGltfAnimator, GltfNodeKind, GltfBridge, loadGltfBridge, WebGlConstants, WebGlRenderer} from "lib/Lib";
import {ModelInfo, Model} from "./Gltf-Models";
import {mat4, vec3} from "gl-matrix";
import {getCameraLook, getCameraOrbit, getCameraOrbitPosition} from "utils/Camera";

const getInitialCamera = (bridge:GltfBridge) => (model:Model) => {
    let cameraPosition:Array<number>;
        let camera:Camera;
        if(model.cameraIndex !== undefined) {
            const cameraNode = bridge.allNodes.filter(node => node.kind === GltfNodeKind.CAMERA)[model.cameraIndex];
            if(cameraNode.kind === GltfNodeKind.CAMERA) {
                camera = cameraNode.camera;
                cameraPosition = mat4.getTranslation(vec3.create(), cameraNode.transform.localMatrix); 
            }

        } else if(model.cameraPosition !== undefined) {
            cameraPosition = model.cameraPosition !== undefined ? model.cameraPosition : [0,0,4];
            camera = getCameraLook([
                cameraPosition, 
                model.cameraLookAt !== undefined ? model.cameraLookAt : [0,0,0],
            ])
        } else {
            const initOrbit = {yaw: 0, pitch: 0, roll: 0, translate: 4};
            camera = getCameraOrbit(initOrbit);
            cameraPosition = getCameraOrbitPosition(initOrbit);
        }
    return {cameraPosition, camera};
}

export const startGltf = (renderer:WebGlRenderer) => (modelPath:string) => (modelInfo:ModelInfo) => 
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

        let {camera, cameraPosition} = getInitialCamera (bridge) (modelInfo.model)

        const ibl = getDefaultIblLight(cameraPosition);

        let scene:GltfScene = {
            ibl,
            nodes: updateNodeListTransforms ({
                updateLocal: true,
                updateModel: true,
                updateView: true,
                camera

            })
            (null)
            (nodes)
        }

        return (frameTs:number) => {
            scene = Object.assign({}, scene, {
                nodes: updateNodeListTransforms ({
                    updateLocal: true,
                    updateModel: true,
                    updateView: true,
                    camera
                })
                (null)
                (animate(frameTs) (scene.nodes))
            })

                
            bridge.renderer.gl.clear(WebGlConstants.COLOR_BUFFER_BIT | WebGlConstants.DEPTH_BUFFER_BIT); 
            bridge.renderScene(scene);
        }
    });

