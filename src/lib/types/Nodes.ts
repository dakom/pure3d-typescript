import {GltfTransform, GltfPrimitive} from "../Types";

export interface GltfNode {
	transform: GltfTransform;
	primitives: Array<GltfPrimitive>;
	morphWeights?: Float32Array;
}
