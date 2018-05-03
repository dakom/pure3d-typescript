import {getTrsFromMatrix, getModelMatrix, getNormalMatrix, getMatrixFromTrs, getViewMatrices, updateTransform } from '../../../exports/common/transform/Transform'; 
import {GLTF_PARSE_getCamera} from "./Gltf-Parse-Camera";

import {
    Transform,
    Transform_TRS,
    Camera,
    GLTF_ORIGINAL_Node,
    GltfData,
    GltfInitConfig,
    NumberArray,
    GLTF_ORIGINAL,
    GltfNode ,
    GltfPrimitive,
    GltfMeshNode,
    GltfLightNode,
    GltfCameraNode,
    GltfNodeKind,
} from '../../../Types';
import { GLTF_PARSE_primitiveHasAttribute } from './Gltf-Parse-Primitive-Attributes';

//could be made a little more efficient to cull the root-instances of children early, but this is a bit clearer and it's not a biggie.
export const GLTF_PARSE_getNodes = ({gltf, primitives}:{gltf:GLTF_ORIGINAL, primitives: Map<number, Array<GltfPrimitive>>}):Array<GltfNode> => {

    const getNodeTransform = (parentModelMatrix: NumberArray) => (nodeIndex: number) => (node:GLTF_ORIGINAL_Node):GltfNode => {

        const baseNode = {
            kind: node.mesh !== undefined && primitives.has(node.mesh) && primitives.get(node.mesh).length
            ?   GltfNodeKind.MESH
            :   node.camera !== undefined
            ?   GltfNodeKind.CAMERA
            :   GltfNodeKind.UNKNOWN //could also be Light...
        } as GltfNode;



        const trs = node.matrix ? getTrsFromMatrix(Float64Array.from(node.matrix)) : getTrs(node);
        const localMatrix = node.matrix ? new Float64Array(node.matrix) : getMatrixFromTrs(trs);
        const modelMatrix = getModelMatrix(parentModelMatrix) (localMatrix); 

        baseNode.transform = {trs, localMatrix, modelMatrix} as Transform;

        const hasNormals = baseNode.kind !== GltfNodeKind.MESH
            ?   false
            :   gltf.meshes[node.mesh].primitives.some(p => GLTF_PARSE_primitiveHasAttribute("NORMAL")(p));
        if(hasNormals) {
            baseNode.transform.normalMatrix = getNormalMatrix (modelMatrix);
        }

        if(baseNode.kind === GltfNodeKind.MESH) {
            baseNode.primitives = primitives.get(node.mesh);

            const morphWeights =
                node.weights
                ? Float64Array.from(node.weights)
                : gltf.meshes[node.mesh].weights
                ? Float64Array.from(gltf.meshes[node.mesh].weights)
                : undefined;

            if(morphWeights) {
                baseNode.morphWeights = morphWeights;
            }
        }

        if(baseNode.kind === GltfNodeKind.CAMERA) {
            baseNode.camera = GLTF_PARSE_getCamera(gltf.cameras[node.camera]) (modelMatrix);
        }

        return !node.children
            ? baseNode
            : Object.assign(baseNode, {children: node.children.map(idx => getNodeTransform (modelMatrix) (idx) (gltf.nodes[idx]))});
    }


    return gltf.nodes
        .map((node, idx) => getNodeTransform(null) (idx) (node))

}

function getTrs(node:GLTF_ORIGINAL_Node):Transform_TRS {
    const trs = {
        translation: Float64Array.from([0.0, 0.0, 0.0]),
        rotation: Float64Array.from([0.0, 0.0, 0.0, 1.0]),
        scale: Float64Array.from([1.0, 1.0, 1.0])
    }
    Object.keys(trs).forEach(prop => {
        const nodeTrsProp = node[prop]
        if (nodeTrsProp) {
            trs[prop] = nodeTrsProp;
        }
    });

    return trs;
}


