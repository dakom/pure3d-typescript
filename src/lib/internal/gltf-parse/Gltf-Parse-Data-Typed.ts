import { WebGlAttributeActivateOptions, WebGlConstants, WebGlRenderer } from 'webgl-simple';

import { GLTF_ORIGINAL,GLTF_ORIGINAL_MeshPrimitive, TypedNumberArray, GLTF_ORIGINAL_Accessor, GLTF_ORIGINAL_AccessorSparse, GLTF_ORIGINAL_BufferView } from '../../Types';
import { GLTF_PARSE_ACCESSOR_TYPE_SIZE, GLTF_PARSE_COMPONENT_BYTE_SIZE } from './Gltf-Parse-Data-Constants';

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

const getAccessorValues =({ gltf, accessor, buffers}: { gltf: GLTF_ORIGINAL, accessor:GLTF_ORIGINAL_Accessor, buffers:Array<ArrayBuffer>}) => {
    const byteLength = (accessor.count * GLTF_PARSE_ACCESSOR_TYPE_SIZE[accessor.type] * GLTF_PARSE_COMPONENT_BYTE_SIZE[accessor.componentType]);

    if(accessor.bufferView === undefined) {
        if(accessor.sparse === undefined) {
            throw new Error("accessor must either be sparse or have a buffer view");
        }
        return getComponentTypedData({
            buffer: new ArrayBuffer(byteLength),
            componentType: accessor.componentType
        });
    }

    const bufferView = gltf.bufferViews[accessor.bufferView];
    const byteOffset = (bufferView.byteOffset === undefined ? 0 : bufferView.byteOffset) + (accessor.byteOffset === undefined ? 0 : accessor.byteOffset);

    const byteStride = bufferView.byteStride ? bufferView.byteStride : 0;

    const byteStrideLength = byteStride * GLTF_PARSE_ACCESSOR_TYPE_SIZE[accessor.type] * GLTF_PARSE_COMPONENT_BYTE_SIZE[accessor.componentType];
    const bufferLength = byteStrideLength + byteLength; 


    return getComponentTypedData({
        buffer: buffers[bufferView.buffer].slice(byteOffset, byteOffset + bufferLength), //byteLength),
        componentType: accessor.componentType
    });
}

const getSparseAccessorIndices =({ gltf, accessor, buffers}: { gltf: GLTF_ORIGINAL, accessor:GLTF_ORIGINAL_Accessor, buffers:Array<ArrayBuffer>}) => {
    const values = accessor.sparse.indices;
    const byteLength = (accessor.sparse.count * GLTF_PARSE_COMPONENT_BYTE_SIZE[values.componentType]);
    const bufferView = gltf.bufferViews[values.bufferView];
    const byteOffset = (bufferView.byteOffset === undefined ? 0 : bufferView.byteOffset) + (values.byteOffset === undefined ? 0 : values.byteOffset);

    return getComponentTypedData({
            buffer: buffers[bufferView.buffer].slice(byteOffset, byteOffset + byteLength),
            componentType: values.componentType
    });
}

const getSparseAccessorValues =({ gltf, accessor, buffers}: { gltf: GLTF_ORIGINAL, accessor:GLTF_ORIGINAL_Accessor, buffers:Array<ArrayBuffer>}) => {
    const values = accessor.sparse.values;
    const byteLength = (accessor.sparse.count * GLTF_PARSE_ACCESSOR_TYPE_SIZE[accessor.type] * GLTF_PARSE_COMPONENT_BYTE_SIZE[accessor.componentType]);
    const bufferView = gltf.bufferViews[values.bufferView];
    const byteOffset = (bufferView.byteOffset === undefined ? 0 : bufferView.byteOffset) + (values.byteOffset === undefined ? 0 : values.byteOffset);

    return getComponentTypedData({
        buffer: buffers[bufferView.buffer].slice(byteOffset, byteOffset + byteLength),
        componentType: accessor.componentType
    });
}

export const GLTF_PARSE_getAccessorTypedData = ({gltf, accessorId, buffers}:{gltf: GLTF_ORIGINAL, buffers: Array<ArrayBuffer>, accessorId: number}) => {
    const accessor = gltf.accessors[accessorId];

    const values = getAccessorValues({gltf, accessor, buffers});


    if(accessor.sparse) {
        const sparseIndices = getSparseAccessorIndices({gltf, accessor, buffers});
        const sparseValues = getSparseAccessorValues({gltf, accessor, buffers});
        const typeCount = GLTF_PARSE_ACCESSOR_TYPE_SIZE[accessor.type];

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
