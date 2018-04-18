import {Stream, StreamSink, Cell} from "sodiumjs";
import { GltfCamera, GltfBridge, GltfScene, createGltfAnimator, updateTransforms, GltfAnimator } from 'lib/Lib';
import {getCameraOrbit} from "../utils/Camera";

import {input} from "../frp/Input-FRP";
import { TickEventData, PointerEventData} from "input-sender";
import {S, Maybe} from "../utils/Sanctuary";
import {vec3, mat4} from "gl-matrix";


export interface State {
  bridge:GltfBridge;
  scene:GltfScene;
  animate:GltfAnimator;
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

export const createState = (mFreshState:Maybe<{bridge:GltfBridge, cameraPosition: Array<number>}>) => (mState:Maybe<State>):Maybe<State> => {
  
  S.map(state => {
    if(state.world !== undefined) {
      //TODO, destroy world / assets rather than just have them go out of scope (e.g. gl.destroyTexture etc.)
    }
  }) (mState);
  
  return S.map(({bridge, cameraPosition}:{bridge:GltfBridge, cameraPosition: Array<number>}) => {
    const animate = createGltfAnimator(bridge.data.animations.map(animation => ({
      animation,
      loop: true
    })));
  
    const updatedScene = updateTransforms(
      Object.assign(bridge.cloneOriginalScene(), {
        camera: {position: cameraPosition,
          view: mat4.lookAt(mat4.create(), cameraPosition, [0.0, 0.0, 0.0], [0,1, 0])
        }
      })
    );

    //TODO: calculate initial roll and pitch where camera position is not 0,0
    
    return {
      bridge, 
      scene: updatedScene,
      animate, 
      controls: {
        yaw: 0, roll: 0, pitch: 0, translate: vec3.distance(cameraPosition, [0,0,0])
      },
      pointer: {}
    } as State
  }) (mFreshState);
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
        scene: updateTransforms(state.animate(evt.frameTs) (state.scene))
      })
);
