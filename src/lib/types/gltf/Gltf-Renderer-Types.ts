import {WebGlRenderer, GltfData,TypedNumberArray, WebGlShader, GltfMeshNode, GltfScene, GltfPrimitive, LightNode, Camera} from "../../Types";


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
    directional?: GltfRendererLight;
    point?: GltfRendererLight;
    spot?: GltfRendererLight;
}

export interface GltfRendererLight {
    position?: Float32Array;
    direction?: Float32Array;
    angleScale?:Float32Array;
    angleOffset?:Float32Array;
    color: Float32Array;
    intensity: Float32Array;
    range?: Float32Array;
    offset?: number;
}

//Todo - spotlight extras
