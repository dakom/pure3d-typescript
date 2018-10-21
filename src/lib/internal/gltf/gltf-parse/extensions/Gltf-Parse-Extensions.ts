import {GLTF_PARSE_Extension_Ibl} from "./ibl/Gltf-Parse-Extensions-Ibl";
import {GLTF_PARSE_Extension_Lights} from "./lights/Gltf-Parse-Extensions-Lights";
import {GLTF_PARSE_Extension_Unlit} from "./unlit/Gltf-Parse-Extensions-Unlit";
import {GLTF_PARSE_Extension} from "../../../../Types";

export const GltfExtensions: Array<GLTF_PARSE_Extension> = [
    GLTF_PARSE_Extension_Ibl,
    GLTF_PARSE_Extension_Lights,
    GLTF_PARSE_Extension_Unlit
];
