import { 

    GltfLightNode,
    GltfCameraNode,
    GltfMeshNode,
    WebGlAttributeActivateOptions,
    GLTF_ORIGINAL,
    GltfAnimationData,
    GltfAnimationKeyframe,
    GltfAnimationTargetPath,
    GltfAnimationInterpolation,
    GltfNode
} from '../../../Types';
import { GLTF_PARSE_ACCESSOR_TYPE_SIZE } from './Gltf-Parse-Data-Constants';
import {GLTF_PARSE_getAccessorTypedData} from "./Gltf-Parse-Data-Typed";
import {GLTF_PARSE_getAccessorDataInfo} from "./Gltf-Parse-Data-Info";
import {mapNodes} from "../../../exports/common/nodes/Nodes";

export const GLTF_PARSE_animationPathToString = {
    [GltfAnimationTargetPath.WEIGHTS]: "weights",
    [GltfAnimationTargetPath.TRANSLATION]: "translation",
    [GltfAnimationTargetPath.ROTATION]: "rotation",
    [GltfAnimationTargetPath.SCALE]: "scale"
}

const GLTF_PARSE_animationStringToPath = {
    "weights": GltfAnimationTargetPath.WEIGHTS,
    "translation": GltfAnimationTargetPath.TRANSLATION,
    "rotation": GltfAnimationTargetPath.ROTATION,
    "scale": GltfAnimationTargetPath.SCALE,
}

const GLTF_PARSE_interpolationLookup = {
    "linear": GltfAnimationInterpolation.LINEAR,
    "step": GltfAnimationInterpolation.STEP,
    "cubicspline": GltfAnimationInterpolation.CUBICSPLINE
}

export const GLTF_PARSE_addAnimationIds = ({gltf, nodes}:{gltf: GLTF_ORIGINAL, nodes: Array<GltfNode>}):Array<GltfNode> => {
    let animationId = 0;


    if (gltf.animations) {
        gltf.animations.forEach(animation => {
            animation
                .channels
                .filter(channel => channel.target.node !== undefined)
                .forEach(channel => {

                    mapNodes
                        ((node:GltfNode) => {
                            if(node.originalNodeId === channel.target.node && node.animationIds.indexOf(animationId) === -1) {
                                node.animationIds.push(animationId);
                            }
                            return node;
                        })
                        (nodes);

                    animationId++;
                })
        })
    }

    return nodes;
}

export const GLTF_PARSE_createAnimations = ({ gltf, buffers }: { gltf: GLTF_ORIGINAL, buffers: Array<ArrayBuffer>}): Map<number, GltfAnimationData> => {
  //load animation list
  const animations = new Map<number, GltfAnimationData>();
  let animationId = 0;

  if (gltf.animations) {
    gltf.animations.forEach(animation => {
      animation
        .channels
        .filter(channel => channel.target.node !== undefined)
        .forEach(channel => {
            
          const targetPath = GLTF_PARSE_animationStringToPath[channel.target.path.toLowerCase()]; 
            const sampler = animation.samplers[channel.sampler];

            const interpolation = GLTF_PARSE_interpolationLookup[sampler.interpolation ? sampler.interpolation.toLowerCase() : "linear"];
          const timeAccessor = gltf.accessors[sampler.input];
          const timings = GLTF_PARSE_getAccessorTypedData({
              gltf, 
              buffers,
              info: GLTF_PARSE_getAccessorDataInfo({gltf, accessorId: sampler.input})
          });

          const values = GLTF_PARSE_getAccessorTypedData({
              gltf, 
              buffers,
              info: GLTF_PARSE_getAccessorDataInfo({gltf, accessorId: sampler.output})
          });
              
          const valuesAccessor = gltf.accessors[sampler.output];

         
          //can't be map() because Array != Float64Array
          let keyframes = new Array<GltfAnimationKeyframe>(timings.length);

          (timings as any).forEach((timing, index) => {
            const count = targetPath === GltfAnimationTargetPath.WEIGHTS 
              ? values.length / timings.length //always a scalar and final size will be the number of morph targets times the number of animation frames.
              : GLTF_PARSE_ACCESSOR_TYPE_SIZE[valuesAccessor.type];

            keyframes[index] = {
              timing,
              values: count === 1
                ? values[index]
                : values.subarray(index * count, (index + 1) * count),
            }
          });


          animations.set(animationId++, {
            keyframes,
            interpolation,
            targetPath,
            timeMin: timeAccessor.min[0],
            timeMax: timeAccessor.max[0]
          });
        })
    });
  }

  return animations;

}
