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
    NumberArray,
    WebGlRenderer} from "lib/Lib";
import {Future} from "fluture";
import {ModelInfo, Model, getModel} from "../../../gltf/Gltf-Models";
import {updateCamera, getInitialBasicCamera} from "../../../../utils/Camera";
import {PointerEventStatus} from "input-senders";
import {S} from "../../../../utils/Sanctuary";
import {addGltfExtensions} from "../../../../utils/Gltf-Mixin";
import {createSkybox} from "../../skybox/Skybox";
import {createLinesRenderer, getAxes} from "../../lines/Lines";
import * as createControls from "orbit-controls";


const getCameraList = (gltf:GLTF_ORIGINAL) => {

    if(!gltf.cameras || !gltf.cameras.length) {
        return []
    }

    return gltf.cameras.map((camera, idx) => {
        let str = idx.toString();
        if(camera.name) {
            str += " " + camera.name;
        }
        return str;
    });
}

const _getBridge = (renderer:WebGlRenderer) => (path:string) =>  {

    return gltf_load({
        renderer, 
        path,
        config: { },
    })
    //.chain(bridge => bridge.loadEnvironment("static/world/world/json"))
    .map(bridge => {

        let scene:GltfScene;

        const animate = gltf_createAnimator(bridge.getData().animations) ({loop: true});

        const render = (camera:Camera) => (frameTs:number) => {
                if(!scene) {
                    scene = bridge.getOriginalScene(camera) (0);
                }
                scene = bridge.updateShaderConfigs(scene);
                
               
                const nodes = animate (frameTs) (scene.nodes)
                 scene = Object.assign({}, scene, {
                    camera,
                    nodes: 
                        gltf_updateNodeTransforms ({
                            updateLocal: true,
                            updateModel: true,
                            updateView: true,
                            camera: camera
                        })
                        (nodes)
                });

                bridge.renderScene(scene);
        }

        return (render);
    });
}

export const startLightingPunctual = (renderer:WebGlRenderer) => ({basicPath, gltfPath}:{basicPath: string, gltfPath: string}) => {
        const axes = getAxes (5);

        const cameraPosition = [0,0,4];
        const cameraLook = [0,0,0];
        let camera = getInitialBasicCamera({position: cameraPosition, cameraLook: [0,0,0]});
        camera.zfar = 1000;
        const controls = createControls({
            position: cameraPosition, 
            target: cameraLook 
        });

        return (createSkybox(renderer) as Future<any, (camera:Camera) => (frameTs:number) => void>)
            .map(renderSkybox => ({
                renderSkybox,
                renderLines: createLinesRenderer(renderer)
            }))
            .chain(renderers => 
                _getBridge (renderer) (basicPath + "gltf-scenes/lighting-punctual/lighting-punctual.gltf")
                    .map(renderScene => Object.assign({}, renderers, {renderScene}))
            )
            .map(({renderSkybox, renderLines, renderScene}) => {
                controls.enable();

                return [
                    (frameTs:number) => {

                        camera = updateCamera ({ isControlled: true, controls, cameraNode: undefined }) (camera); 

                        renderer.gl.clear(WebGlConstants.COLOR_BUFFER_BIT | WebGlConstants.DEPTH_BUFFER_BIT); 
                        //renderers.map(render => render (camera) (frameTs));
                        //
                       
                        //renderSkybox (camera);
                        renderLines (camera) (axes);
                        renderScene (camera) (frameTs);

                    },
                    () => {
                        controls.disable(); 
                    }
                ]

            })
}
    
