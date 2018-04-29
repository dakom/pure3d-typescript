import {TypedNumberArray,_GltfAccessorDataInfo, GltfAccessorDataInfo, GLTF_ORIGINAL} from "../../../Types";
import { GLTF_PARSE_ACCESSOR_TYPE_SIZE, GLTF_PARSE_COMPONENT_BYTE_SIZE } from './Gltf-Parse-Data-Constants';

import { WebGlConstants, WebGlRenderer } from '../../../Types';

const getComponentTypedData = ({ buffer, componentType}: { buffer:ArrayBuffer, componentType:number}):TypedNumberArray => {
    

    switch (componentType) {
        case WebGlConstants.BYTE: return new Int8Array(buffer);
        case WebGlConstants.UNSIGNED_BYTE: return new Uint8Array(buffer);
        case WebGlConstants.SHORT: return new Int16Array(buffer);
        case WebGlConstants.UNSIGNED_SHORT: return new Uint16Array(buffer);
        case WebGlConstants.UNSIGNED_INT: return new Uint32Array(buffer);
        case WebGlConstants.FLOAT: return new Float32Array(buffer);
        default: throw new Error("unknown accessor component type!");
    }
}
const getTypedDataFromInfo = ({info, buffers}:{info:_GltfAccessorDataInfo, buffers: Array<ArrayBuffer>}):TypedNumberArray => 
   
    (info.bufferViewIndex === undefined) 
        ?   getComponentTypedData({
                buffer: new ArrayBuffer(info.bufferLength),
                componentType: info.componentType
            })

        :   getComponentTypedData({
                buffer: buffers[info.bufferIndex].slice(info.byteOffset, info.byteOffset + info.bufferLength), //byteLength),
                componentType: info.componentType
            });

export const GLTF_PARSE_getAccessorTypedData = ({gltf, info, buffers}:{gltf: GLTF_ORIGINAL, buffers: Array<ArrayBuffer>, info:GltfAccessorDataInfo}) => {
    const values = getTypedDataFromInfo({info, buffers});


    if(info.sparse) {
        const typeCount = GLTF_PARSE_ACCESSOR_TYPE_SIZE[info.accessorType];
        const sparseIndices = getTypedDataFromInfo({info: info.sparse.indices, buffers});
        const sparseValues = getTypedDataFromInfo({info: info.sparse.values, buffers});

        (sparseIndices as any)
            .map(value => value * typeCount)
            .forEach((indexOfValue, valueIndex) => {
                for(let i = 0; i < typeCount; i++) {
                    values[indexOfValue+i] = sparseValues[i + (valueIndex * typeCount)];
                }
            })
    }

    return values;
}

/*
export const GLTF_PARSE_createTypedData = ({ gltf, buffers}: { gltf: GLTF_ORIGINAL, buffers: Array<ArrayBuffer>}) => {

    const accessorData = new Map<number, TypedNumberArray>();

    const isAttribute = (accessorId:number):boolean => {
        if(!gltf.nodes || !gltf.meshes || !gltf.nodes.length || !gltf.meshes.length) {
            return false;
        }

        return gltf.nodes.findIndex(node => {
            if(node.mesh === undefined) {
                return false;
            }

            return gltf.meshes[node.mesh].primitives.findIndex(p =>
                Object.keys(p.attributes).findIndex(k => p[k] === accessorId) !== -1
            ) !== -1
        }) !== -1
    }

    const isImage = (accessorId:number):boolean => {
        if(!gltf.images || !gltf.images.length) {
            return false;
        }

        return gltf.images.findIndex(image => 
            image.bufferView === gltf.accessors[accessorId].bufferView 
        ) !== -1
    }

    gltf.accessors
        .forEach((accessor, accessorId) => {
            if(!isAttribute(accessorId) && !isImage(accessorId)) {
                const values = GLTF_PARSE_getAccessorTypedData({gltf, buffers, accessorId});
                accessorData.set(accessorId, values);

                console.log("created typed data for accessor", accessorId);
            } else {
                console.log("skipping typed data for accessor", accessorId);
            }

        });

    return accessorData;
}
 */
