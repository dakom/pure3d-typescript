import {GltfIbl, Camera, Light, GltfNode, TypedNumberArray} from "../../Types";

export type GltfScene = Readonly<{
	nodes: Array<GltfNode>;
        camera: Camera;
        lights: Array<Light>;
        extensions: {
            ibl?: GltfIbl
        }
}>

