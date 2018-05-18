import {WebGlRenderer, GltfData, GltfShaderMeta, GltfMeshNode, GltfScene, GltfPrimitive, LightNode, GltfIbl, Camera} from "../../Types";


export interface GltfRendererThunk {
    renderer: WebGlRenderer;
    data: GltfData;
    node: GltfMeshNode;
    primitive: GltfPrimitive;
    lightList: Array<LightNode>;
    scene: GltfScene;
    shaderMeta: GltfShaderMeta; 
}

