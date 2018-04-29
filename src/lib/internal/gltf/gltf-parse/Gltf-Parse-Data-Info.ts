import { WebGlAttributeActivateOptions, WebGlConstants, WebGlRenderer } from '../../../Types';

import { GLTF_ORIGINAL,GLTF_ORIGINAL_MeshPrimitive, TypedNumberArray,_GltfAccessorDataInfo, GltfAccessorDataInfo, GLTF_ORIGINAL_Accessor, GLTF_ORIGINAL_AccessorSparse, GLTF_ORIGINAL_BufferView } from '../../../Types';
import { GLTF_PARSE_ACCESSOR_TYPE_SIZE, GLTF_PARSE_COMPONENT_BYTE_SIZE } from './Gltf-Parse-Data-Constants';


const getAccessorInfo =({ gltf, accessor}: { gltf: GLTF_ORIGINAL, accessor:GLTF_ORIGINAL_Accessor }):_GltfAccessorDataInfo => {
    const byteLength = (accessor.count * GLTF_PARSE_ACCESSOR_TYPE_SIZE[accessor.type] * GLTF_PARSE_COMPONENT_BYTE_SIZE[accessor.componentType]);

    if(accessor.bufferView === undefined) {
        if(accessor.sparse === undefined) {
            throw new Error("accessor must either be sparse or have a buffer view");
        }
        return {
            bufferLength: byteLength,
            componentType: accessor.componentType,
            accessorType: accessor.type
        }
    }

    const bufferView = gltf.bufferViews[accessor.bufferView];
    const byteOffset = (bufferView.byteOffset === undefined ? 0 : bufferView.byteOffset) + (accessor.byteOffset === undefined ? 0 : accessor.byteOffset);

    const byteStride = bufferView.byteStride ? bufferView.byteStride : 0;

    const byteStrideLength = byteStride * GLTF_PARSE_ACCESSOR_TYPE_SIZE[accessor.type] * GLTF_PARSE_COMPONENT_BYTE_SIZE[accessor.componentType];
    const bufferLength = byteStrideLength + byteLength; 

    return {
        bufferLength,
        componentType: accessor.componentType,
        bufferViewIndex: accessor.bufferView,
        bufferIndex: bufferView.buffer,
        byteOffset,
        accessorType: accessor.type
    }
}

const getSparseAccessorIndicesInfo =({ gltf, accessor}: { gltf: GLTF_ORIGINAL, accessor:GLTF_ORIGINAL_Accessor}):_GltfAccessorDataInfo => {
    const values = accessor.sparse.indices;
    const byteLength = (accessor.sparse.count * GLTF_PARSE_COMPONENT_BYTE_SIZE[values.componentType]);
    const bufferView = gltf.bufferViews[values.bufferView];
    const byteOffset = (bufferView.byteOffset === undefined ? 0 : bufferView.byteOffset) + (values.byteOffset === undefined ? 0 : values.byteOffset);

    return {
        bufferLength: byteLength,
        componentType: values.componentType,
        bufferViewIndex: accessor.bufferView,
        bufferIndex: bufferView.buffer,
        byteOffset,
        accessorType: accessor.type
    }
}

const getSparseAccessorValuesInfo =({ gltf, accessor}: { gltf: GLTF_ORIGINAL, accessor:GLTF_ORIGINAL_Accessor}):_GltfAccessorDataInfo => {
    const values = accessor.sparse.values;
    const byteLength = (accessor.sparse.count * GLTF_PARSE_ACCESSOR_TYPE_SIZE[accessor.type] * GLTF_PARSE_COMPONENT_BYTE_SIZE[accessor.componentType]);
    const bufferView = gltf.bufferViews[values.bufferView];
    const byteOffset = (bufferView.byteOffset === undefined ? 0 : bufferView.byteOffset) + (values.byteOffset === undefined ? 0 : values.byteOffset);


    return {
        bufferLength: byteLength,
        componentType: accessor.componentType,
        bufferViewIndex: accessor.bufferView,
        bufferIndex: bufferView.buffer,
        byteOffset,
        accessorType: accessor.type
    }
}

export const GLTF_PARSE_getAccessorDataInfo = ({gltf, accessorId}:{gltf: GLTF_ORIGINAL, accessorId: number}):GltfAccessorDataInfo => {
    const accessor = gltf.accessors[accessorId];

    const info = getAccessorInfo({gltf, accessor}) as GltfAccessorDataInfo;


    if(accessor.sparse) {
        info.sparse = {
            indices: getSparseAccessorIndicesInfo({gltf, accessor}),
            values: getSparseAccessorValuesInfo({gltf, accessor})
        }
    }

    return info;
    
}

