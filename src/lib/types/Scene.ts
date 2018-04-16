import {GltfCamera, GltfLighting, GltfNode, TypedNumberArray, GltfTransformKind} from "../Types";

export type GltfScene = Readonly<{
	camera: GltfCamera;

	lighting: GltfLighting;

	nodes: Array<GltfNode>;

	projection: TypedNumberArray;
}>

