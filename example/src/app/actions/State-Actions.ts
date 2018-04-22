import {Stream, StreamSink, Cell} from "sodiumjs";
import { GltfIblLight, GltfCamera, GltfBridge, GltfScene, createGltfAnimator, updateNodeListTransforms, GltfAnimator } from 'lib/Lib';
import {getCameraOrbit} from "../utils/Camera";

import {input} from "../frp/Input-FRP";
import { TickEventData, PointerEventData} from "input-sender";
import {S, Maybe} from "../utils/Sanctuary";
import {vec3, mat4} from "gl-matrix";


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
    bridge: GltfBridge,
    camera: GltfCamera,
    ibl: GltfIblLight
}

export const createState = (mFreshBridge:Maybe<FreshBridge>) => (mState:Maybe<State>):Maybe<State> => {
  
  S.map(state => {
    if(state.world !== undefined) {
      //TODO, destroy world / assets rather than just have them go out of scope (e.g. gl.destroyTexture etc.)
    }
  }) (mState);
  
  return S.map(({bridge, camera, ibl}:{bridge:GltfBridge, camera:GltfCamera, ibl: GltfIblLight}) => {
    const animate = createGltfAnimator(bridge.data.animations.map(animation => ({
      animation,
      loop: true
    })));


      console.log(bridge.nodes);


      const scene:GltfScene = {
          ibl,
          nodes: updateNodeListTransforms ({
              updateLocal: true,
              updateModel: true,
              updateView: true,
              camera

          })
          (null)
          (bridge.nodes)
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

    const yaw = state.controls.yaw;
    const roll = state.controls.roll + (deltaX / 100);
    const pitch = state.controls.pitch + (deltaY / 100);
    const translate = state.controls.translate;

    const camera = getCameraOrbit({yaw, roll, pitch, translate});

    return Object.assign({}, state, {
        camera,

      scene: Object.assign({}, state.scene, {camera: Object.assign({}, camera)}),
      pointer: Object.assign({}, state.pointer, {
        initial: state.pointer.initial,
        lastMove: evt,
      }),
      controls: {yaw, roll, pitch, translate}
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
            ({              updateLocal: true,
                updateModel: true,
                updateView: true,
                camera: state.camera

            })
            (null)
            (state.animate(evt.frameTs) (state.scene.nodes))
        })

    })
);
