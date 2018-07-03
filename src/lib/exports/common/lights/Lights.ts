
import {NumberArray } from "../../../Types";
import {mat4, vec3} from "gl-matrix";
import {createQuat, createVec3} from "../array/Array";
import {rotateVectorByMatrix} from "../transform/Transform";

//Non-essential helpers

export const getLightDirection = (worldMatrix:NumberArray):NumberArray => {
    const vRes = rotateVectorByMatrix ([0,0,1]) (worldMatrix);
    vec3.normalize(vRes, vRes);

    return vRes; 
}

