import {GLTF_ORIGINAL_AnimationChannel, GLTF_ORIGINAL_AnimationSampler, TypedNumberArray, GltfScene} from "../Types";

export interface GltfAnimatorOptions {
  animation: GltfAnimationData;
  loop?: boolean;
}

export interface GltfAnimationData {
  keyframes: Array<GltfAnimationKeyframe>;
  channel: GLTF_ORIGINAL_AnimationChannel;
  sampler: GLTF_ORIGINAL_AnimationSampler;
  timeMin: number;
  timeMax: number;
}

export interface GltfAnimationKeyframe {
  timing: number;
  values: GltfAnimationValues;
}

export type GltfAnimationValues = number | Array<number> | TypedNumberArray;

export type GltfAnimator = (ts: number) => (world:GltfScene) => GltfScene;