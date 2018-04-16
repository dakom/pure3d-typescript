import { WebGlAttributeActivateOptions, WebGlConstants, WebGlRenderer } from 'webgl-simple';

import { GLTF_ORIGINAL, GltfAccessorData, TypedNumberArray, GLTF_ORIGINAL_Accessor, GLTF_ORIGINAL_AccessorSparse, GLTF_ORIGINAL_BufferView } from '../../Types';
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

const getAccessorStrategy =({ gltf, accessor}: { gltf: GLTF_ORIGINAL, accessor:GLTF_ORIGINAL_Accessor}) => {
  const typeCount = GLTF_PARSE_ACCESSOR_TYPE_SIZE[accessor.type];
  const bufferView = (accessor.bufferView === undefined)
    ? undefined
    : gltf.bufferViews[accessor.bufferView];

  return {
    size: typeCount,
    type: accessor.componentType,
    normalized: accessor.normalized === undefined ? false : accessor.normalized,
    stride: (bufferView === undefined || bufferView.byteStride === undefined) ? 0 : bufferView.byteStride,
    offset: 0 //since we sliced it off already, it's always 0 here
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
 
  return getComponentTypedData({
    buffer: buffers[bufferView.buffer].slice(byteOffset, byteOffset + byteLength),
    componentType: accessor.componentType
  });
}

const getSparseAccessorIndices =({ gltf, accessor, buffers}: { gltf: GLTF_ORIGINAL, accessor:GLTF_ORIGINAL_Accessor, buffers:Array<ArrayBuffer>}) => {
  const values = accessor.sparse.indices;
  const byteLength = (accessor.sparse.count * GLTF_PARSE_COMPONENT_BYTE_SIZE[values.componentType]);
  const bufferView = gltf.bufferViews[values.bufferView];
  const byteOffset = (bufferView.byteOffset === undefined ? 0 : bufferView.byteOffset) + (values.byteOffset === undefined ? 0 : values.byteOffset);
  
  return getComponentTypedData({buffer: buffers[bufferView.buffer].slice(byteOffset, byteOffset + byteLength), componentType: values.componentType});
}

const getSparseAccessorValues =({ gltf, accessor, buffers}: { gltf: GLTF_ORIGINAL, accessor:GLTF_ORIGINAL_Accessor, buffers:Array<ArrayBuffer>}) => {
  const values = accessor.sparse.values;
  const byteLength = (accessor.sparse.count * GLTF_PARSE_ACCESSOR_TYPE_SIZE[accessor.type] * GLTF_PARSE_COMPONENT_BYTE_SIZE[accessor.componentType]);
  const bufferView = gltf.bufferViews[values.bufferView];
  const byteOffset = (bufferView.byteOffset === undefined ? 0 : bufferView.byteOffset) + (values.byteOffset === undefined ? 0 : values.byteOffset);
  
  return getComponentTypedData({buffer: buffers[bufferView.buffer].slice(byteOffset, byteOffset + byteLength), componentType: accessor.componentType});
}

export const GLTF_PARSE_createAccessorData = ({ gltf, buffers, renderer }: { gltf: GLTF_ORIGINAL, buffers: Array<ArrayBuffer>, renderer: WebGlRenderer }): GltfAccessorData => {
  const accessorData = new Map<number, { values: TypedNumberArray; strategy: WebGlAttributeActivateOptions; rendererBufferId: Symbol }>();

  const indicesList = [];
  if (gltf.meshes) {
    gltf.meshes.forEach(mesh => {
      mesh.primitives.forEach(primitive => {
        if (primitive.indices !== undefined) {
          indicesList.push(primitive.indices);
        }
      })
    })
  }

  gltf.accessors
    .forEach((accessor, accessorId) => {
      const rendererBufferId = Symbol(accessorId);

      const isElements = indicesList.indexOf(accessorId) === -1 ? false: true;

      const values = getAccessorValues({gltf, accessor, buffers});
      const strategy = getAccessorStrategy({gltf, accessor});

      
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

      renderer.buffers.assign(rendererBufferId)({
        target: isElements ?  WebGlConstants.ELEMENT_ARRAY_BUFFER : WebGlConstants.ARRAY_BUFFER,
        usagePattern: WebGlConstants.STATIC_DRAW,
        data: values.buffer
      });

      accessorData.set(accessorId, { values, strategy, rendererBufferId });
    });

  return accessorData;
}