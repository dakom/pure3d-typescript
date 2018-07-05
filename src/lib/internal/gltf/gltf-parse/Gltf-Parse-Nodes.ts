import {getTrsFromMatrix, getModelMatrix, getNormalMatrix, getMatrixFromTrs, updateTransform } from '../../../exports/common/transform/Transform'; 
import {GLTF_PARSE_getCameraSettings} from "./Gltf-Parse-Camera";

import {
    GltfLightNode,
    GltfCameraNode,
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
    LightNode,
    CameraNode,
    GltfNodeKind,
    NodeKind,
    GltfDataAssets
} from '../../../Types';
import { GLTF_PARSE_primitiveHasAttribute } from './Gltf-Parse-Primitive-Attributes';
import {GltfExtensions} from "./extensions/Gltf-Parse-Extensions";
import {GLTF_PARSE_addAnimationIds} from "./Gltf-Parse-Data-Animation";
import {GLTF_PARSE_createSkins} from "./Gltf-Parse-Nodes-Skins";

/*
 * All of the nodes are parsed in place as though they could be any root
 * Technically this is extra needless computation, but it makes the code clearer
 * Also, doing it this way allows for dynamic scene mixtures :D
 *
 * Since it's only on init, the cpu processing shouldn't matter much
 * Nodes are by definition lightweight, it's no biggie in terms of memory either
 * However, they _should_ be culled via GltfBridge.getOriginalScene(), otherwise dups will show
 */
export const GLTF_PARSE_getNodes = ({gltf, primitives, data, assets}:{assets: GltfDataAssets, gltf:GLTF_ORIGINAL, data: GltfData, primitives: Map<number, Array<GltfPrimitive>>}):Array<GltfNode> => {

    const skinLookup = GLTF_PARSE_createSkins({gltf, buffers: assets.buffers});

    const getGltfNode = (parentModelMatrix: NumberArray) => (originalNodeId: number) => (node:GLTF_ORIGINAL_Node):GltfNode => {


        const baseNode = {
            originalNodeId,
            animationIds: [],
            kind: node.mesh !== undefined && primitives.has(node.mesh) && primitives.get(node.mesh).length
                ?   GltfNodeKind.MESH
                :   node.camera !== undefined
                    ?   NodeKind.CAMERA
                    :   undefined, //could be replaced via extension, or be a skin joint
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

            if(node.skin !== undefined) {
                const skinData = skinLookup.get(node.skin);
                baseNode.skin = {
                    skinId: node.skin,
                    joints: skinData.joints.slice()
                }

                if(skinData.skeletonRootId !== undefined) {
                    baseNode.skin.skeletonRootId = skinData.skeletonRootId;
                }
            }

            const morphWeights =
                node.weights
                    ? Float64Array.from(node.weights)
                    : gltf.meshes[node.mesh].weights
                        ? Float64Array.from(gltf.meshes[node.mesh].weights)
                        : undefined;

            if(morphWeights) {
                baseNode.morphWeights = morphWeights;
            }
        } else if(baseNode.kind === NodeKind.CAMERA) {
            baseNode.camera = {
                //the actual camera settings depend on view and potentially canvas
                //so this is just partial
                settings: GLTF_PARSE_getCameraSettings(gltf.cameras[node.camera]) as any
            } as Camera
            baseNode.cameraIndex = node.camera; 
        } 

        const finalNode = GltfExtensions
            .map(ext => ext.createNode)
            .reduce((acc, val) => 
                (acc = val (gltf) (node) (acc), acc), 
                baseNode
            )


        return !node.children
            ? finalNode
            : Object.assign(finalNode, {children: node.children.map(idx => getGltfNode(modelMatrix) (idx) (gltf.nodes[idx]))});
    }

    return GLTF_PARSE_addAnimationIds({
        gltf,
        nodes:  gltf.nodes
                    .map((node, idx) => getGltfNode(null) (idx) (node))
    })

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


