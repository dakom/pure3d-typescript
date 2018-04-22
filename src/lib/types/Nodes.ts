import {GltfTransform, GltfPrimitive, GltfCamera, GltfLight} from "../Types";

export enum GltfNodeKind {
    UNKNOWN = 0,
    MESH = 1,
    CAMERA = 2,
    LIGHT = 3,
}


export type GltfNode = GltfMeshNode | GltfCameraNode | GltfLightNode;

export interface _GltfNode {
	transform: GltfTransform;
        children?: Array<GltfNode>;
}

export interface GltfMeshNode extends _GltfNode {
        kind: GltfNodeKind.MESH;
	primitives?: Array<GltfPrimitive>;
	morphWeights?: Float32Array;
}

export interface GltfCameraNode extends _GltfNode {
    kind: GltfNodeKind.CAMERA;
    camera: GltfCamera;
}

export interface GltfLightNode extends _GltfNode {
    kind: GltfNodeKind.LIGHT;
    light: GltfLight;

}
