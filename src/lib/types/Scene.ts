import {GltfCamera, GltfIblLight, GltfNode, TypedNumberArray} from "../Types";

export type GltfScene = Readonly<{
        ibl?: GltfIblLight;
	nodes: Array<GltfNode>;
}>

