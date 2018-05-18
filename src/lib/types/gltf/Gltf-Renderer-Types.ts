import {WebGlRenderer, GltfData, GltfShaderConfig, WebGlShader, GltfMeshNode, GltfScene, GltfPrimitive, LightNode, GltfIbl, Camera} from "../../Types";


export interface GltfRendererThunk {
    renderer: WebGlRenderer;
    data: GltfData;
    node: GltfMeshNode;
    primitive: GltfPrimitive;
    lightList: Array<LightNode>;
    scene: GltfScene;
    shaderConfig: GltfShaderConfig;
    shader: WebGlShader;
}

