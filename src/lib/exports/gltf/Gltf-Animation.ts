import { findKeyframeBounds, interpolateKeyframes } from "../../internal/gltf/animation/Gltf-Animation-Internal"; 
import {
  GltfAnimationData,
  GltfAnimator,
  GltfAnimatorOptions,
  GltfNode,
} from '../../Types';

export const setAnimationTime = (animation: Readonly<GltfAnimationData>) => (time: number) => (nodes:Readonly<Array<GltfNode>>): Array<GltfNode> => {
    const bounds = findKeyframeBounds(animation.keyframes)(time);

    if (bounds === -1) {
      return;
    }

    
    const values = !Array.isArray(bounds)
      ? animation.keyframes[bounds].values //if it's an exact match there's no need to interpolate
      : interpolateKeyframes({
          k0: animation.keyframes[bounds[0]],
          k1: animation.keyframes[bounds[1]],
          style: animation.sampler.interpolation,
          isRotation: animation.channel.target.path === "rotation" ? true : false,
          time
        });


    const nodeIndex = animation.channel.target.node;
    const node = nodes[nodeIndex];
    const updatedNodes = nodes.slice();
    updatedNodes[nodeIndex] = Object.assign({}, node, 
      (animation.channel.target.path === "weights")
        ? {morphWeights:  values}
        : {transform: 
            Object.assign({}, node.transform, {
              trs: Object.assign({}, node.transform.trs, {
                [animation.channel.target.path]: values
              })
            })
          }
    )

    return updatedNodes;
  }

//creates a function that will iterate over all the baked in animations, with a provided timestep
export const createGltfAnimator = (opts: Readonly<Array<GltfAnimatorOptions>>): GltfAnimator => {
  const totalTimes = new Array(opts.length).fill(0);
  let lastTs: number;

  return (ts: number) => (nodes:Array<GltfNode>): Array<GltfNode> => {
    const dt = lastTs === undefined ? 0 : ((ts - lastTs) / 1000);
    lastTs = ts;


    opts.forEach(({ animation, loop }, index) => {
      const prevTime = totalTimes[index];

      let nextTime = prevTime + dt;

      if (loop === true) {
        while (nextTime > animation.timeMax) {
          nextTime -= animation.timeMax;
        }
      }

      if (nextTime >= animation.timeMin && nextTime <= animation.timeMax) {
        nodes = setAnimationTime(animation)(nextTime)(nodes);
      }

      totalTimes[index] = nextTime;
    });

    return nodes;
  }
}
