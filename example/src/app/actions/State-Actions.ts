import {Stream, StreamSink, Cell} from "sodiumjs";
import { getDefaultIblLight, GltfIblLight, GltfCamera, GltfBridge, GltfScene, GltfNodeKind, createGltfAnimator, updateNodeListTransforms, GltfAnimator } from 'lib/Lib';
import {getCameraLook, getCameraOrbit, getCameraOrbitPosition} from "../utils/Camera";

import {input} from "../frp/Input-FRP";
import { TickEventData, PointerEventData} from "input-sender";
import {S, Maybe} from "../utils/Sanctuary";
import {vec3, mat4} from "gl-matrix";
import {Model, ModelInfo} from "../models/Models";

export interface State {
    bridge:GltfBridge;
    scene:GltfScene;
    animate:GltfAnimator;
    camera: GltfCamera;
    controls: {
        yaw: number,
            roll: number,
            pitch: number,
            translate: number
    }
    pointer: {
        initial?: PointerEventData;
        lastMove?: PointerEventData;
    }
}

export interface FreshBridge {
    bridge: GltfBridge;
    modelInfo:ModelInfo;
}

export const createState = (mFreshBridge:Maybe<FreshBridge>) => (mState:Maybe<State>):Maybe<State> => {

    S.map(state => {
        if(state.world !== undefined) {
            //TODO, destroy world / assets rather than just have them go out of scope (e.g. gl.destroyTexture etc.)
        }
    }) (mState);

    return S.map((fresh:FreshBridge) => {
        const {bridge, modelInfo: {model}} = fresh;

        const animate = createGltfAnimator(bridge.data.animations.map(animation => ({
            animation,
            loop: true
        })));


        const nodes = bridge.data.original.scene !== undefined
            ?   bridge.getOriginalSceneNodes(0)
            :   bridge.allNodes;


        let cameraPosition:Array<number>;
        let camera:GltfCamera;
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

        const ibl = getDefaultIblLight(cameraPosition);
        //console.log(bridge.nodes);


        const scene:GltfScene = {
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

        //TODO: calculate initial roll and pitch where camera position is not 0,0

        return {
            bridge, 
            scene,
            camera,
            animate, 
            controls: {
                yaw: 0, roll: 0, pitch: 0, translate: vec3.distance(ibl.cameraPosition, [0,0,0])
            },
            pointer: {}
        } as State
    }) (mFreshBridge);
};

export const pointerStart = evt => S.map((state:State) => {
    return Object.assign({}, state, {
        pointer: Object.assign({}, state.pointer, {
            initial: evt
        })
    });
});

export const pointerMove = (evt:PointerEventData) => S.map((state:State) => {
    if(!state.pointer.initial) {
        return state;
    }

    if(state.pointer.lastMove) {
        //See ../utils/Camera
        const deltaX = evt.x - state.pointer.lastMove.x;
        const deltaY = evt.y - state.pointer.lastMove.y;

        const orbit = {
            yaw: state.controls.yaw,
            roll: state.controls.roll + (deltaX / 100),
            pitch: state.controls.pitch + (deltaY / 100),
            translate: state.controls.translate
        }

        const camera = getCameraOrbit(orbit);

        const cameraPosition = getCameraOrbitPosition(orbit);

        return Object.assign({}, state, {
            camera,

            scene: Object.assign({}, state.scene, {
                ibl: Object.assign({}, state.scene.ibl, {
                    cameraPosition
                })
            }),
            pointer: Object.assign({}, state.pointer, {
                initial: state.pointer.initial,
                lastMove: evt,
            }),
            controls: orbit 
        });

    }

    return Object.assign({}, state, {
        pointer: Object.assign({}, state.pointer, {
            initial: state.pointer.initial,
            lastMove: evt,
        })
    });
});

export const pointerEnd = evt => S.map((state:State) => {
    if(!state.pointer.initial) {
        return state;
    }

    return Object.assign({}, state, {
        pointer: {}
    });
});

export const onTick = (evt:TickEventData) => S.map((state:State) => 
    !state.animate
    ? state
    : Object.assign({}, state, {
        scene: 
        Object.assign({}, state.scene, {
            nodes: updateNodeListTransforms
            ({  
                updateLocal: true,
                updateModel: true,
                updateView: true,
                camera: state.camera
            })
            (null)
            (state.animate(evt.frameTs) (state.scene.nodes))
        })

    })
);
