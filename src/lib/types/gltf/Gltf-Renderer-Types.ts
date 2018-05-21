import {WebGlRenderer, GltfData, GltfShaderConfig, WebGlShader, GltfMeshNode, GltfScene, GltfPrimitive, LightNode, GltfIblScene, Camera} from "../../Types";


export interface GltfRendererThunk {
    renderer: WebGlRenderer;
    data: GltfData;
    node: GltfMeshNode;
    primitive: GltfPrimitive;
    lightList: Array<LightNode>;
    scene: GltfScene;
    shader: WebGlShader 
}

