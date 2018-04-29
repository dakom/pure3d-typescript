import { StreamSink } from 'sodiumjs';

import { Maybe, S } from 'utils/Sanctuary';
import { createState, onTick, pointerEnd, pointerMove, FreshBridge, pointerStart, State } from '../actions/State-Actions';
import { input, stopInput } from './Input-FRP';
import {GltfScene, WebGlConstants, GltfBridge, Camera, GltfIblLight} from "lib/Lib";
import {disposeRenderer} from "utils/renderer/ExampleRenderer";

export const sBridge = new StreamSink<Maybe<FreshBridge>>();

//FRP logic/state is all internal, just get new worlds when loaded and output the changes at the end of the pipeline

const cState = 
  (sBridge
    .map(createState) as any)
    .orElse(input.sTick.map(onTick))
    .orElse(input.sStart.map(pointerStart))
    .orElse(input.sMove.map(pointerMove))
    .orElse(input.sEnd.map(pointerEnd))
    .accum(S.Nothing as Maybe<State>, (fn, mState) => fn (mState));
    
export const cScene = 
  cState.map(S.map(({bridge, scene}) => ({bridge, scene})));

sBridge.filter(S.isNothing).listen(() => {
    disposeRenderer();
    stopInput();
});

cScene.listen(S.map(({bridge, scene}:{bridge: GltfBridge, scene: GltfScene}) => {
    bridge.renderer.gl.clear(WebGlConstants.COLOR_BUFFER_BIT | WebGlConstants.DEPTH_BUFFER_BIT); 
    bridge.renderScene(scene);
  }
));
