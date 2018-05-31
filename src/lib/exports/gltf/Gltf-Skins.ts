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
    Transform,
    TypedNumberArray,
    GltfSkinData
} from "../../Types";
import {forEachNodes, countNodes, mapNodes, mapNode, updateNodeTransforms, updateNodeListTransforms} from "../common/nodes/Nodes";
import {mat4} from "gl-matrix";
type SkinOpts = {fullTree: Array<GltfNode>};

const getJointList = (fullTree:Array<GltfNode>) => (meshNode:GltfMeshNode) => { 
    const jointIds = new Map<number, number>();

    const jointList = meshNode.skin.joints.map((joint, index) => {
        jointIds.set(joint.originalNodeId, index);
        return {
            inverseBindMatrix: joint.inverseBindMatrix
        } as {
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
export const gltf_setJointTransforms = (fullTree:Array<GltfNode>) => (node:GltfNode):GltfNode => {
    if(node.kind === GltfNodeKind.MESH && node.skin) {
        const jointList = getJointList (fullTree) (node);

        let pos = 0;

        const skinMatrices = jointList.reduce((acc, joint) => {
           

            const jMat = 
                mat4.multiply(
                    mat4.create(),
                        mat4.invert(mat4.create(), node.transform.modelMatrix),
                        mat4.multiply(
                            mat4.create(),
                            joint.transform.modelMatrix,
                            joint.inverseBindMatrix
                        )
                );

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


