import { StreamSink } from 'sodiumjs';

import { Maybe, S } from '../utils/Sanctuary';
import { createState, onTick, pointerEnd, pointerMove, FreshBridge, pointerStart, State } from '../actions/State-Actions';
import { input } from './Input-FRP';
import {GltfBridge, GltfCamera, GltfIblLight} from "lib/Lib";

export const sBridge = new StreamSink<Maybe<FreshBridge>>();

//FRP logic/state is all internal, just get new worlds when loaded and output the changes at the end of the pipeline

const cState = 
  sBridge.map(createState)
    .orElse(input.sTick.map(onTick))
    .orElse(input.sStart.map(pointerStart))
    .orElse(input.sMove.map(pointerMove))
    .orElse(input.sEnd.map(pointerEnd))
    .accum(S.Nothing as Maybe<State>, (fn, mState) => fn (mState));
    
export const cScene = 
  cState.map(S.map(({bridge, scene}) => ({bridge, scene})));
