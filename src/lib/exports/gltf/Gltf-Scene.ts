import {GltfAnimator, GltfScene} from "../../Types";
import {gltf_createAnimator} from "./Gltf-Animation";
import {gltf_updateNodeTransforms} from "./Gltf-Nodes";
import {gltf_updateShaderConfigs} from "./Gltf-Shaders";

//These can be used from a worker thread
//The inner functions could also be called separately for more control

//TODO - Would be nice to create an optimised version that doesn't traverse the whole tree 3 times
export const gltf_updateAnimatedScene = (animate:GltfAnimator) => (frameTs:number) => (scene:GltfScene):GltfScene => 
        gltf_updateShaderConfigs(
            Object.assign({}, scene, {
                nodes: 
                    gltf_updateNodeTransforms ({
                        updateLocal: true,
                        updateModel: true,
                        updateView: true,
                        updateLightDirection: true,
                        camera: scene.camera
                    })
                    (animate (frameTs) (scene.nodes))
            })
        );


//TODO - Would be nice to create an optimised version that doesn't traverse the whole tree 2 times
export const gltf_updateStaticScene = (scene:GltfScene):GltfScene => 
        gltf_updateShaderConfigs(
            Object.assign({}, scene, {
                nodes: 
                    gltf_updateNodeTransforms ({
                        updateLocal: true,
                        updateModel: true,
                        updateView: true,
                        updateLightDirection: true,
                        camera: scene.camera
                    })
                    (scene.nodes)
            })
        );
