
import {
    GltfScene, 
    GLTF_ORIGINAL,
    gltf_createAnimator,
    gltf_load, 
    WebGlRenderer,
    gltf_updateScene
} from "lib/Lib";

export const startAudioSync = (renderer:WebGlRenderer) => (basicPath:string) => {
    return gltf_load({
        renderer,
        path: basicPath + "gltf-scenes/audio-sync/menorah.gltf",
    })
    .then(bridge => {

        let scene:GltfScene;

        const updateScene = gltf_updateScene (
            gltf_createAnimator(bridge.getData().animations) ({loop: true})
        );

        const render = (frameTs:number) => {
                if(!scene) {
                    scene = bridge.getOriginalScene(null) (0);
                    //scene.nodes[0].transform.trs.translation = translate
                }
                scene = updateScene(frameTs) (scene);
                bridge.renderScene(scene);
        }

        return [render, () => {}]
    });
}
    
