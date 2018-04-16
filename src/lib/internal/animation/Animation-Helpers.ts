import { quat, vec2, vec3, vec4 } from 'gl-matrix';

import { GltfAnimationKeyframe, GltfAnimationValues } from '../../Types';
import { binaryFindBounds } from '../utils/BinarySearch';



const interpolate_linear = ({ v0, v1, t }: { v0: Readonly<GltfAnimationValues>, v1: Readonly<GltfAnimationValues>, t: number }): GltfAnimationValues => {
  if (typeof v0 === "number" && typeof v1 === "number") {
    return v0 * (1 - t) + v1 * t;
  }

  const xs0 = v0 as Array<number>;
  const xs1 = v1 as Array<number>;

  if (xs0.length !== xs1.length) {
    throw new Error("different length of animation values");
  }

  switch (xs0.length) {
    case 1: return interpolate_linear({ v0: xs0[0], v1: xs1[0], t });
    case 2: return vec2.lerp(vec2.create(), xs0, xs1, t);
    case 3: return vec3.lerp(vec3.create(), xs0, xs1, t);
    case 4: return vec4.lerp(vec4.create(), xs0, xs1, t);
  }

}

export const interpolateKeyframes = ({ k0, k1, time, style, isRotation }: { k0: Readonly<GltfAnimationKeyframe>, k1: Readonly<GltfAnimationKeyframe>, time: number, isRotation: boolean, style?: string }): GltfAnimationValues => {

  const _style = style === undefined ? "LINEAR" : style;

  const v0 = k0.values;
  const v1 = k1.values;

  const t = (time - k0.timing) / (k1.timing - k0.timing); //get t as a percentage of timing between k0 and k1: https://math.stackexchange.com/questions/754130/find-what-percent-x-is-between-two-numbers


  switch (_style) {
    case "LINEAR": return isRotation ? quat.slerp(quat.create(), v0, v1, t) : interpolate_linear({ v0, v1, t });
    case "STEP": return v0;
    case "CUBICSPLINE": throw new Error("cubicspline is not supported yet!");
    default: throw new Error("unsupported interpolation " + _style)
  }
}

export const findKeyframeBounds = binaryFindBounds((k: GltfAnimationKeyframe) => k.timing);