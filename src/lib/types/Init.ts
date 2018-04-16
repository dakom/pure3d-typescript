import {GltfTransformKind} from "./Transforms";
import {TypedNumberArray} from "./Math";

export interface GltfInitConfig {
  transformKind?: GltfTransformKind; //Affects how initial node transforms are loaded (they may still be changed after the fact)
  manualSRGB?: boolean;
  fastSRGB?: boolean;
  
	projection: TypedNumberArray; //Required to set the initial transforms
  
}