import {
    GltfScene, 
    Camera, 
    LightKind, 
    GltfNodeKind, 
    LightNode, 
    GltfMeshNode, 
    CameraNode, 
    GltfIblScene,
    AmbientLight,
    DirectionalLight,
    PointLight,
    SpotLight,
    TransformUpdateOptions,
    GltfNode,
    GltfSkinData
} from "../../Types";
import {mapNodes, mapNode, updateNodeTransforms, updateNodeListTransforms} from "../common/nodes/Nodes";

import {gltf_setJointTransforms} from "./Gltf-Skins";

export const gltf_updateNodeTransforms = (opts:TransformUpdateOptions & {skinData: Map<number, GltfSkinData>}) => (nodes:Array<GltfNode>):Array<GltfNode> => {

    const updatedNodes = updateNodeListTransforms <GltfNode> (opts) (null) (nodes);
    
    return mapNodes <GltfNode>(gltf_setJointTransforms (opts.skinData) (updatedNodes)) (updatedNodes);
}
