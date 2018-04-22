import { getTrsFromMatrix, getModelMatrix, getNormalMatrix, getMatrixFromTrs, getViewMatrices, updateTransform } from '../../exports/Transforms';
import {GLTF_PARSE_getCamera} from "./Gltf-Parse-Camera";

import {
    GLTF_ORIGINAL_Node,
    GltfCamera,
    GltfData,
    GltfTransform,
    GltfTransform_TRS,
    GltfInitConfig,
    TypedNumberArray,
    GLTF_ORIGINAL,
    GltfNode ,
    GltfPrimitive,
    GltfMeshNode,
    GltfLightNode,
    GltfCameraNode,
    GltfNodeKind,
} from '../../Types';
import { GLTF_PARSE_primitiveHasAttribute } from './Gltf-Parse-Primitive-Attributes';

//could be made a little more efficient to cull the root-instances of children early, but this is a bit clearer and it's not a biggie.
export const GLTF_PARSE_getNodes = ({gltf, primitives}:{gltf:GLTF_ORIGINAL, primitives: Map<number, Array<GltfPrimitive>>}):Array<GltfNode> => {
    const childSet = new Set<number>();

    const getNodeTransform = (parentModelMatrix: Array<number>) => (nodeIndex: number) => (node:GLTF_ORIGINAL_Node):GltfNode => {
        if(parentModelMatrix) {
            childSet.add(nodeIndex);
        }

        const baseNode = {
            kind: node.mesh !== undefined && primitives.has(node.mesh) && primitives.get(node.mesh).length
            ?   GltfNodeKind.MESH
            :   node.camera !== undefined
                ?   GltfNodeKind.CAMERA
                :   GltfNodeKind.UNKNOWN //could also be Light...
        } as GltfNode;


        if(node.matrix || node.translation || node.rotation || node.scale) {

            const trs = node.matrix ? getTrsFromMatrix(node.matrix) : getTrs(node);
            const localMatrix = node.matrix ? node.matrix : getMatrixFromTrs(trs);
            const modelMatrix = getModelMatrix(parentModelMatrix) (localMatrix); 

            const t = {trs, localMatrix, modelMatrix} as GltfTransform;

            const hasNormals = baseNode.kind !== GltfNodeKind.MESH
                ?   false
                :   gltf.meshes[node.mesh].primitives.some(p => GLTF_PARSE_primitiveHasAttribute("NORMAL")(p));
            if(hasNormals) {
                t.normalMatrix = getNormalMatrix (modelMatrix);
            }
            baseNode.transform = t;
        }

        const modelMatrix = baseNode.transform ? baseNode.transform.modelMatrix : null;


        if(baseNode.kind === GltfNodeKind.MESH) {
            baseNode.primitives = primitives.get(node.mesh);

            const morphWeights =
                node.weights
                ? Float32Array.from(node.weights)
                : gltf.meshes[node.mesh].weights
                ? Float32Array.from(gltf.meshes[node.mesh].weights)
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
        .filter((node, idx) => !childSet.has(idx)); 

}

function getTrs(node:GLTF_ORIGINAL_Node):GltfTransform_TRS {
    const trs = {
        translation: [0.0, 0.0, 0.0],
        rotation: [0.0, 0.0, 0.0, 1.0],
        scale: [1.0, 1.0, 1.0]
    }
    Object.keys(trs).forEach(prop => {
        const nodeTrsProp = node[prop]
        if (nodeTrsProp) {

            trs[prop] = nodeTrsProp;
        }
    });

    return trs;
}


