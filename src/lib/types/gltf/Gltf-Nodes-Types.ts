
import {NumberArray} from "../common/array/Array-Types";
import {GltfPrimitive, CameraNode, GltfSkinJoint, TypedNumberArray, LightNode, NodeKind, _Node} from "../../Types"; 

//would be nice to extend but that's not really doable with enums
export enum GltfNodeKind {
    MESH = 3,
    SKIN = 4
}


export type GltfNode = (GltfCameraNode | LightNode | GltfMeshNode) & {
    originalNodeId: number;
    animationIds: Array<number>;
};

export interface GltfCameraNode extends CameraNode {
    cameraIndex: number;
}

export interface GltfMeshNode extends _Node {
        kind: GltfNodeKind.MESH;
	primitives?: Array<GltfPrimitive>;
	morphWeights?: NumberArray;
        skin?: {
            skinId: number;
            skeletonRootId?: number;
            joints: Array<GltfSkinJoint>;
            skinMatrices?: Float32Array;
        }

}

