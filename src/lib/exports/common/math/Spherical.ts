import {Spherical, NumberArray} from "../../../Types";
import {vec3} from "gl-matrix";
import {clamp} from "./Clamp";

export const createSpherical = ():Spherical => ({
    radius: 1,
    theta: 0,
    phi: 0,
});

//https://github.com/mrdoob/three.js/blob/dev/src/math/Spherical.js#L61

export const createSphericalFromVec3 = (v:NumberArray):Spherical => {
    const radius = vec3.length(v);
    return !radius
        ?   {
                radius,
                theta: 0,
                phi: 0
            }
        :   {
                radius,
                theta: Math.atan2( v[0], v[2] ), // equator angle around y-up axis
                phi: Math.acos( clamp( v[1] / radius) (-1) (1) ) // polar angle
            }
}
