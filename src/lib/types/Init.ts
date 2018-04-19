import {GltfTransformKind} from "./Transforms";
import {TypedNumberArray} from "./Math";
import {GltfCamera} from "./Camera";

export interface GltfInitConfig {
  transformKind?: GltfTransformKind; //Affects how initial node transforms are loaded (they may still be changed after the fact)
  manualSRGB?: boolean;
  fastSRGB?: boolean;
cameraIndex?:number; // chooses initial camera if exists in gltf  
 camera?:GltfCamera; //manual override or if no camera in gltf
}
