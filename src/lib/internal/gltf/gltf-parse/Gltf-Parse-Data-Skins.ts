import { 
    WebGlAttributeActivateOptions,
    GLTF_ORIGINAL,
    GltfSkinData,
    GltfNodeKind,
    GltfNode,
    TypedNumberArray,
} from '../../../Types';
import { GLTF_PARSE_ACCESSOR_TYPE_SIZE } from './Gltf-Parse-Data-Constants';
import {GLTF_PARSE_getAccessorTypedData} from "./Gltf-Parse-Data-Typed";
import {GLTF_PARSE_getAccessorDataInfo} from "./Gltf-Parse-Data-Info";
import {mapNodes} from "../../../exports/common/nodes/Nodes";
import {createIdentityMat4} from "../../../exports/common/array/Array";

export const GLTF_PARSE_createSkins = ({ gltf, buffers }: { gltf: GLTF_ORIGINAL, buffers: Array<ArrayBuffer>}): Map<number, GltfSkinData> => {
    const skins = new Map<number, GltfSkinData>();
    if(!gltf.skins || !gltf.skins.length) {
        return skins;
    }

    //From the spec, this is guaranteed to be from a vec4 accessor and a series of mat4 data
    const splitMatrix = (numbers:TypedNumberArray):Array<TypedNumberArray> => {
        const ret = new Array<TypedNumberArray>();

        for(let idx = 0; idx < numbers.length; ) {
            ret.push(numbers.slice(idx, idx + 16));
            idx += 16;
        }
        
        return ret;

    }
    gltf.skins.forEach((originalSkin, skinId) => {

       const inverseBindMatrices:Array<TypedNumberArray> = 
            originalSkin.inverseBindMatrices
                ?   splitMatrix(GLTF_PARSE_getAccessorTypedData({
                        gltf, 
                        buffers,
                        info: GLTF_PARSE_getAccessorDataInfo({gltf, accessorId: originalSkin.inverseBindMatrices})
                    }))

                :  originalSkin.joints.map(createIdentityMat4())

        if(inverseBindMatrices.length !== originalSkin.joints.length) {
            throw new Error("inverse bind matrices mismatch!");
        }
   
        let skeletonRootId: number;

        const skinData:GltfSkinData = {
            joints: originalSkin.joints.map((originalNodeId, idx) => {
                const joint = {
                    originalNodeId,
                    inverseBindMatrix: inverseBindMatrices[idx]
                }

                if(originalSkin.skeleton !== undefined && originalSkin.skeleton === originalNodeId) {
                    skeletonRootId = originalNodeId;
                }

                return joint;
            })
        }

        if(skeletonRootId !== undefined) {
            skinData.skeletonRootId = skeletonRootId;
        }

        skins.set(skinId, skinData);
    })
    return skins; 

}
