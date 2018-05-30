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
import {forEachNodes, mapNodes, mapNode, updateNodeTransforms, updateNodeListTransforms} from "../common/nodes/Nodes";
import {mat4} from "gl-matrix";
type SkinOpts = {fullTree: Array<GltfNode>};

/*
 * Think _very_ carefully before making changes... it's tempting to optimize but then 
 * It's potential to change the options of having multiple skeletons per mesh or vice-versa
 */
const getJointList = (fullTree:Array<GltfNode>) => (skinData:Map<number, GltfSkinData>) => (node:GltfMeshNode) => { 
    const jointIds = new Map<number, number>();
    const inverseMatrices = skinData.get(node.skin.skinId).joints.map(j => j.inverseBindMatrix);
    node.skin.jointIds.forEach((jointId, index) => jointIds.set(jointId, index));
    
    const jointList = new Array<{
        transform: Transform,
        inverseBindMatrix: TypedNumberArray
    }>(jointIds.size);
   
    
    forEachNodes
        ((node:GltfNode) => {
            if(jointIds.has(node.originalNodeId)) {
                const index = jointIds.get(node.originalNodeId);
                jointList[index] = {
                    transform: node.transform,
                    inverseBindMatrix: inverseMatrices[index]
                };
            }
        })
        (fullTree)

    return jointList;
}
export const gltf_setJointTransforms = (skinData:Map<number, GltfSkinData>) => (fullTree:Array<GltfNode>) => (node:GltfNode):GltfNode => {
    if(node.kind === GltfNodeKind.MESH && node.skin) {
        const jointList = getJointList (fullTree) (skinData) (node);

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
        }, new Float32Array(node.skin.jointIds.length * 16));
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


