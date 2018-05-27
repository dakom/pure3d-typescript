import {GLTF_ORIGINAL_AnimationChannel, GLTF_ORIGINAL_AnimationSampler, NumberArray, GltfNode, GltfScene} from "../../Types";


export interface GltfAnimationData {
    keyframes: Array<GltfAnimationKeyframe>;
    interpolation: GltfAnimationInterpolation;
    targetPath: GltfAnimationTargetPath;
    timeMin: number;
    timeMax: number;
}

export enum GltfAnimationTargetPath {
    TRANSLATION = 1,
    ROTATION = 2,
    SCALE = 3,
    WEIGHTS = 4
}

export enum GltfAnimationInterpolation {
    LINEAR = 1,
    STEP = 2,
    CUBICSPLINE = 3
}

export interface GltfAnimationKeyframe {
    timing: number;
    values: GltfAnimationValues;
}

export type GltfAnimationValues = number | NumberArray;

export type GltfAnimator = (ts: number) => (nodes:Array<GltfNode>) => Array<GltfNode>;
