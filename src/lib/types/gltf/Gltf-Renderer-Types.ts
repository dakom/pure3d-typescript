import {WebGlRenderer, GltfData, GltfMeshNode, GltfScene, GltfPrimitive, LightNode, GltfIblLight, Camera} from "../../Types";

export interface GltfRendererThunk {
    renderer: WebGlRenderer;
    data: GltfData;
    node: GltfMeshNode;
    primitive: GltfPrimitive;
    lightList: Array<LightNode>;
    scene: GltfScene;
}

