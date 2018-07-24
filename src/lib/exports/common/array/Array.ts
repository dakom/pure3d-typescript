import {mat4, quat} from "gl-matrix";

export const createVec2 = () => new Float64Array(2);

export const createVec4 = () => new Float64Array(4);

export const createVec3 = () => new Float64Array(3);

export const createMat4 = () => {
    const data = new Float64Array(16);
    mat4.identity(data);
    return data;
}

export const createQuat = () => {
    const data = new Float64Array(4);
    quat.identity(data);
    return data;
}

export const createFill = (size:number) => (value:number) => {
    const data = new Float64Array(size);
    data.fill(value);

    return data;
}

