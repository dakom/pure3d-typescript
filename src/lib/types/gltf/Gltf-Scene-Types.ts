import {GltfShaderConfig_Scene, Camera, Light, GltfNode, TypedNumberArray} from "../../Types";

export type GltfScene = Readonly<{

        shaderConfig: GltfShaderConfig_Scene;
        nodes: Array<GltfNode>;
        camera: Camera;
}>

