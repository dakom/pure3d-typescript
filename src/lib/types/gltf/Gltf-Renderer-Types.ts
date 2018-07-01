import {WebGlRenderer, GltfData,TypedNumberArray, GltfShaderConfig, WebGlShader, GltfMeshNode, GltfScene, GltfPrimitive, LightNode, Camera} from "../../Types";


export interface GltfRendererThunk {
    renderer: WebGlRenderer;
    data: GltfData;
    node: GltfMeshNode;
    primitive: GltfPrimitive;
    lightList: GltfRendererLightList;
    scene: GltfScene;
    shader: WebGlShader;
    skinMatrices: TypedNumberArray;
}

export interface GltfRendererLightList {
    position: Float32Array;
    color: Float32Array;
    intensity: Float32Array;
    //TODO - spotlight extras...
}

