import {GltfMeshNode, GltfPrimitive, GltfLightNode, GltfIblLight, PositionCamera} from "../../Types";
import {GltfBridge} from "../../exports/gltf/Gltf-Bridge";

export interface GltfRendererThunk {
    bridge: GltfBridge;
    node: GltfMeshNode;
    primitive: GltfPrimitive;
    lightList: Array<GltfLightNode>;
    ibl: GltfIblLight;
    camera: PositionCamera;
}

