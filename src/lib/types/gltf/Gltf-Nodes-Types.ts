
import {NumberArray} from "../common/array/Array-Types";
import {GltfPrimitive, CameraNode, LightNode, NodeKind, _Node} from "../../Types"; 

//would be nice to extend but that's not really doable with enums
export enum GltfNodeKind {
    MESH = 3,
}


export type GltfNode = (CameraNode | LightNode | GltfMeshNode) & {
    originalNodeId: number;
    animationIds: Array<number>;
};

export interface GltfMeshNode extends _Node {
        kind: GltfNodeKind.MESH;
	primitives?: Array<GltfPrimitive>;
	morphWeights?: NumberArray;
}

