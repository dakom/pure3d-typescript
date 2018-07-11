
import {NumberArray } from "../../../Types";
import {mat4, vec3} from "gl-matrix";
import {createQuat, createVec3} from "../array/Array";
import {rotateVectorByMatrix} from "../transform/Transform";

//Non-essential helpers

export const getLightDirectionFromMatrix = (modelMatrix:NumberArray):NumberArray => {
    const vRes = rotateVectorByMatrix ([0,0,-1]) (modelMatrix);
    vec3.normalize(vRes, vRes);

    return vRes; 
}

