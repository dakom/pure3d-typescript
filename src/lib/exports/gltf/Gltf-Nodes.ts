import {
    GltfScene, 
    Camera, 
    LightKind, 
    GltfNodeKind, 
    LightNode, 
    GltfMeshNode, 
    CameraNode, 
    DirectionalLight,
    PointLight,
    SpotLight,
    NodeTransformUpdateOptions,
    GltfNode,
    GltfCameraNode,
    Transform,
    TypedNumberArray,
    GltfLightNode,
} from "../../Types";
import {mapNodes, forEachNodes, findNode, mapNode, updateNodeTransforms, updateNodeListTransforms} from "../common/nodes/Nodes";

import {mat4} from "gl-matrix";

export const gltf_updateNodeTransforms = (opts:NodeTransformUpdateOptions ) => (nodes:Array<GltfNode>):Array<GltfNode> => {

    const updatedNodes = updateNodeListTransforms <GltfNode> (opts) (null) (nodes);
    
    return mapNodes <GltfNode>(gltf_setJointTransforms (updatedNodes)) (updatedNodes);
}

export const gltf_findNodeById = (id:number) => (nodeOrNodes: Array<GltfNode> | GltfNode):GltfNode => 
    findNode ((node:GltfNode) => node.originalNodeId === id)  (nodeOrNodes)

export const gltf_setJointTransforms = (fullTree:Array<GltfNode>) => (node:GltfNode):GltfNode => {
    if(node.kind === GltfNodeKind.MESH && node.skin) {
        const jointList = getJointList (fullTree) (node);

        const getSkeletonRootTransform = (id:number) => {
           const joint = jointList.find(j => j.originalNodeId === id);
            if(joint) {
                return joint.transform;
            }

            return gltf_findNodeById(id) (fullTree).transform;
        }
        let pos = 0;

        //see https://github.com/KhronosGroup/glTF-Tutorials/issues/17
        const inverseRootMatrix = mat4.invert(mat4.create(),
            node.skin.skeletonRootId === undefined
                ?   node.transform.modelMatrix
                :   getSkeletonRootTransform(node.skin.skeletonRootId).modelMatrix
        );
        
        const skinMatrices = jointList.reduce((acc, joint) => {
           
            const jMat = mat4.create();

            mat4.multiply(jMat,
                joint.transform.modelMatrix,
                joint.inverseBindMatrix
            );

            if(inverseRootMatrix) {
                mat4.multiply(jMat, inverseRootMatrix, jMat);
            }

            //Needs to flatten for uploading to webgl
            for(let i = 0; i < jMat.length; i++) {
                acc[pos++] = jMat[i];
            }

            return acc;
        }, new Float32Array(node.skin.joints.length * 16));
        return Object.assign({}, node, 
            {
                skin: Object.assign({}, node.skin,
                    {
                        skinMatrices
                    }
                )
            }
        );
    }
    return node;
}

const getJointList = (fullTree:Array<GltfNode>) => (meshNode:GltfMeshNode) => { 
    const jointIds = new Map<number, number>();

    const jointList = meshNode.skin.joints.map((joint, index) => {
        jointIds.set(joint.originalNodeId, index);
        return {
            originalNodeId: joint.originalNodeId,
            inverseBindMatrix: joint.inverseBindMatrix
        } as {
            originalNodeId: number;
            transform: Transform;
            inverseBindMatrix: TypedNumberArray;
        }

    });
    
     
    forEachNodes
        ((node:GltfNode) => {
            if(jointIds.has(node.originalNodeId)) {
                const index = jointIds.get(node.originalNodeId);
                jointList[index].transform = node.transform;
                jointIds.delete(node.originalNodeId);

                if(!jointIds.size) {
                    return true;
                }
            }
        })
        (fullTree)

    return jointList;
}


