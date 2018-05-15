import {GltfIbl, Camera, Light, AmbientLight, GltfNode, TypedNumberArray} from "../../Types";

export type GltfScene = Readonly<{
	nodes: Array<GltfNode>;
        camera: Camera;
        light: AmbientLight;
        extensions: {
            ibl?: GltfIbl
        }
}>

