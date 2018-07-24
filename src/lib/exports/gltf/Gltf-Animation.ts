import { findKeyframeBounds, interpolateKeyframes } from "../../internal/gltf/animation/Gltf-Animation-Internal"; 
import { GLTF_PARSE_animationPathToString} from "../../internal/gltf/gltf-parse/Gltf-Parse-Data-Animation"
import { mapNodes} from "../common/nodes/Nodes";
import {
    GltfCameraNode,
    GltfLightNode,
    GltfMeshNode,
  GltfAnimationData,
  GltfAnimator,
  GltfData,
    GltfNode,
    GltfAnimationTargetPath
} from '../../Types';


export const gltf_setAnimationTime = (animation: Readonly<GltfAnimationData>) => (time: number) => (node: GltfNode):GltfNode => { 
    const bounds = findKeyframeBounds(animation.keyframes)(time);

    if (bounds === -1) {
      return;
    }

    
    const values = !Array.isArray(bounds)
      ? animation.keyframes[bounds].values //if it's an exact match there's no need to interpolate
      : interpolateKeyframes({
          k0: animation.keyframes[bounds[0]],
          k1: animation.keyframes[bounds[1]],
          interpolation: animation.interpolation,
          targetPath: animation.targetPath,
          time
        });

    return Object.assign({}, node, 
                    (animation.targetPath === GltfAnimationTargetPath.WEIGHTS)
                        ? {morphWeights:  values}
                        : {transform: 
                            Object.assign({}, node.transform, {
                                trs: Object.assign({}, node.transform.trs, {
                                    [GLTF_PARSE_animationPathToString[animation.targetPath]]: values
                                })
                            })
                        }
    );

  }

//creates a function that will iterate over all the baked in animations, with a provided timestep
export const gltf_createAnimator = (animations:Map<number, GltfAnimationData>) => ({loop}:{loop?: boolean}): GltfAnimator => {
     
    const totalTimes = new Map<number, number>();
    animations.forEach((value, key) => totalTimes.set(key, 0)); 
  let lastTs: number;


  return (ts: number) => (nodes:Array<GltfNode>): Array<GltfNode> => {
    const dt = lastTs === undefined ? 0 : ((ts - lastTs) / 1000);
    lastTs = ts;


    animations.forEach((animation, key) => {
      const prevTime = totalTimes.get(key);

      let nextTime = prevTime + dt;

      if (loop === true) {
        while (nextTime > animation.timeMax) {
          nextTime -= animation.timeMax;
        }
      }

      if (nextTime >= animation.timeMin && nextTime <= animation.timeMax) {
          nodes = mapNodes((node:GltfNode) => 
            node.animationIds && node.animationIds.indexOf(key) !== -1
                ?   gltf_setAnimationTime(animation)(nextTime)(node)
                :   node
            ) (nodes);
      }

      totalTimes.set(key, nextTime);
    });

    return nodes;
  }
}
