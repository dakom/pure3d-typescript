import { GLTF_ORIGINAL, GLTF_ORIGINAL_Node, GLTF_ORIGINAL_Camera, GLTF_ORIGINAL_CameraPerspective, GLTF_ORIGINAL_CameraOrthographic, GltfCamera } from '../../Types';
import {GLTF_PARSE_getNodeTransformValues} from "./Gltf-Parse-Nodes";
import {getWorldTransformMatrix} from "../../exports/Transforms";
import {mat4, vec3} from "gl-matrix";

const getOrthographicView = (cam:GLTF_ORIGINAL_CameraOrthographic) => {
    const view = new Array<number>(16).fill(0);
    const r = cam.xmag;
    const t = cam.ymag;
    const f = cam.zfar;
    const n = cam.znear;

    view[0] = 1/r;
    view[5] = 1/t;
    view[10] = 2/(n - f);
    view[14] = (f+n) / (n-f);
    view[15] = 1;
    
    console.log("orthographic view", view);
    return view;
}

const getPerspectiveView = (cam:GLTF_ORIGINAL_CameraPerspective) => {
    const view = new Array<number>(16).fill(0);
    const a = cam.aspectRatio;
    const y = cam.yfov;
    const n = cam.znear;
    const f = cam.zfar; //if this is undefined, use infinite projection
    
    view[0] = 1/(a * Math.tan(.5 * y));
    view[5] = 1/(Math.tan(.5 * y));
    view[10] = f === undefined ? -1 : (f+n)/(n-f);
    view[11] = -1;
    view[14] = f === undefined ? (-2 * n) : (2 * f * n)/(n - f);


    console.log("perspective view", view);
    return view;
}

export const GLTF_PARSE_getCamera = (original:GLTF_ORIGINAL) => (cameraIndex:number):GltfCamera => {
  const oCamera:GLTF_ORIGINAL_Camera = original.cameras[cameraIndex];
  const cameraNode:GLTF_ORIGINAL_Node = original.nodes.find(node => node.camera === cameraIndex);

  const cameraNodeParent = null; //TODO 
  const matrixValues = GLTF_PARSE_getNodeTransformValues(cameraNode);
    const worldMatrix = getWorldTransformMatrix(matrixValues) (cameraNodeParent);

    const view = mat4.multiply(new Array(16), worldMatrix, (oCamera.type === "perspective" 
            ? getPerspectiveView(oCamera.perspective) 
            : getOrthographicView(oCamera.orthographic))) as Array<number>;


    const position = mat4.getTranslation(vec3.create(), worldMatrix); //not really tested yet

    return {
        view,
        position
    }
}

export const GLTF_PARSE_hasCameras = (original:GLTF_ORIGINAL):boolean => 
  (original.cameras && original.cameras.length > 0);

