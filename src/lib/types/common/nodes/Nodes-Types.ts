
import {NumberArray} from "../array/Array-Types";
import {Transform,TransformUpdateOptions, Camera, Light} from "../../../Types";

export enum NodeKind {
    CAMERA = 1,
    LIGHT = 2,
}


export interface _Node {
	transform: Transform;
        children?: Array<_Node>;
}


export interface CameraNode extends _Node {
    kind: NodeKind.CAMERA;
    camera: Camera;
}

export interface LightNode extends _Node {
    kind: NodeKind.LIGHT;
    light: Light;
}

export interface NodeTransformUpdateOptions extends TransformUpdateOptions {
    updateLightDirection?: boolean;
}
