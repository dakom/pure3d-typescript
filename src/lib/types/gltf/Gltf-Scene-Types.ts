import {Camera, GltfNode, TypedNumberArray} from "../../Types";

export type GltfScene = Readonly<{
	nodes: Array<GltfNode>;
        camera?: Camera;
}>

