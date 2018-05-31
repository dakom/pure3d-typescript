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
    GltfCameraNode
} from "../../Types";
import {mapNodes, findNode, mapNode, updateNodeTransforms, updateNodeListTransforms} from "../common/nodes/Nodes";

import {gltf_setJointTransforms} from "./Gltf-Skins";

export const gltf_updateNodeTransforms = (opts:TransformUpdateOptions ) => (nodes:Array<GltfNode>):Array<GltfNode> => {

    const updatedNodes = updateNodeListTransforms <GltfNode> (opts) (null) (nodes);
    
    return mapNodes <GltfNode>(gltf_setJointTransforms (updatedNodes)) (updatedNodes);
}

export const gltf_findNodeById = (id:number) => (nodeOrNodes: Array<GltfNode> | GltfNode):GltfNode => 
    findNode ((node:GltfNode) => node.originalNodeId === id)  (nodeOrNodes)

