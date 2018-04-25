import { WebGlAttributeActivateOptions, WebGlConstants, WebGlRenderer } from 'webgl-simple';

import { GLTF_ORIGINAL, GltfAttributeData, TypedNumberArray, GLTF_ORIGINAL_Accessor, GLTF_ORIGINAL_AccessorSparse, GLTF_ORIGINAL_BufferView } from '../../Types';
import { GLTF_PARSE_ACCESSOR_TYPE_SIZE, GLTF_PARSE_COMPONENT_BYTE_SIZE } from './Gltf-Parse-Data-Constants';

const getAccessorStrategy =({ gltf, accessor}: { gltf: GLTF_ORIGINAL, accessor:GLTF_ORIGINAL_Accessor}) => {
  const typeCount = GLTF_PARSE_ACCESSOR_TYPE_SIZE[accessor.type];
  const bufferView = (accessor.bufferView === undefined)
    ? undefined
    : gltf.bufferViews[accessor.bufferView];
  
    const stride = (bufferView === undefined || bufferView.byteStride === undefined) ? 0 : bufferView.byteStride;


  return {
    size: typeCount,
    type: accessor.componentType,
    normalized: accessor.normalized === undefined ? false : accessor.normalized,
    stride, 
    offset: 0 //since we sliced it off already, it's always 0 here
  }
}


export const GLTF_PARSE_createAttributeData = ({ gltf, buffers, renderer }: { gltf: GLTF_ORIGINAL, buffers: Array<ArrayBuffer>, renderer: WebGlRenderer }): GltfAttributeData => {
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
