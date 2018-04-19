import {GltfTransformKind} from "./Transforms";
import {TypedNumberArray} from "./Math";
import {GltfCamera} from "./Camera";

export interface GltfInitConfig {
  transformKind?: GltfTransformKind; //Affects how initial node transforms are loaded (they may still be changed after the fact)
  manualSRGB?: boolean;
  fastSRGB?: boolean;
    camera: number | GltfCamera; // chooses initial camera, number is index in gltf 
}
