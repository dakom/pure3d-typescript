import { WebGlAttributeActivateOptions, GLTF_ORIGINAL, GltfAnimationData } from '../../../Types';
import { GLTF_PARSE_ACCESSOR_TYPE_SIZE } from './Gltf-Parse-Data-Constants';
import {GLTF_PARSE_getAccessorTypedData} from "./Gltf-Parse-Data-Typed";
import {GLTF_PARSE_getAccessorDataInfo} from "./Gltf-Parse-Data-Info";

export const GLTF_PARSE_createAnimations = ({ gltf, buffers }: { gltf: GLTF_ORIGINAL, buffers: Array<ArrayBuffer>}): Array<GltfAnimationData> => {
  //load animation list
  let animations = new Array<GltfAnimationData>();

  if (gltf.animations) {
    gltf.animations.forEach(animation => {
      animation
        .channels
        .filter(channel => channel.target.node !== undefined)
        .forEach(channel => {
            

          const sampler = animation.samplers[channel.sampler];
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

          //can't be map() because Array != Float32Array
          let keyframes = new Array(timings.length);

          (timings as any).forEach((timing, index) => {
            const count = channel.target.path === "weights"
              ? values.length / timings.length //always a scalar and final size will be the number of morph targets times the number of animation frames.
              : GLTF_PARSE_ACCESSOR_TYPE_SIZE[valuesAccessor.type];

            keyframes[index] = {
              timing,
              values: count === 1
                ? values[index]
                : values.subarray(index * count, (index + 1) * count),
            }
          });


          animations.push({
            keyframes,
            channel,
            sampler,
            timeMin: timeAccessor.min[0],
            timeMax: timeAccessor.max[0]
          });
        })
    });
  }

  return animations;

}
