
import {NumberArray} from "../common/array/Array-Types";
import {GltfPrimitive, CameraNode, GltfSkinJoint, TypedNumberArray, LightNode, NodeKind, _Node} from "../../Types"; 

//would be nice to extend but that's not really doable with enums
export enum GltfNodeKind {
    MESH = 3,
    SKIN = 4
}


export type GltfNode = (GltfCameraNode | GltfLightNode | GltfMeshNode); 

export interface _GltfNode extends _Node {
    originalNodeId: number;
    animationIds: Array<number>;
};

export interface GltfLightNode extends LightNode, _GltfNode {
}

export interface GltfCameraNode extends CameraNode, _GltfNode {
    cameraIndex: number;
}

export interface GltfMeshNode extends _GltfNode {
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

