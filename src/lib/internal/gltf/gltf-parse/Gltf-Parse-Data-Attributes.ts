import { WebGlAttributeActivateOptions, WebGlConstants, WebGlRenderer, WebGlBufferData, WebGlBufferInfo } from '../../../Types';

import { GLTF_ORIGINAL, GltfAttributes, GltfAccessorDataInfo, TypedNumberArray, GLTF_ORIGINAL_Accessor, GLTF_ORIGINAL_AccessorSparse, GLTF_ORIGINAL_BufferView } from '../../../Types';
import { GLTF_PARSE_ACCESSOR_TYPE_SIZE, GLTF_PARSE_COMPONENT_BYTE_SIZE } from './Gltf-Parse-Data-Constants';
import {GLTF_PARSE_getAccessorTypedData} from "./Gltf-Parse-Data-Typed";
import {GLTF_PARSE_getAccessorDataInfo} from "./Gltf-Parse-Data-Info";
import {createVertexArrays} from "../../../exports/webgl/WebGl-VertexArrays";

export const GLTF_PARSE_attributeNames = [
    "a_Position",
    "a_Normal",
    "a_Tangent",
    "a_UV",
    "a_Color",
    "a_Morph_0",
    "a_Morph_1",
    "a_Morph_2",
    "a_Morph_3",
    "a_Morph_4",
    "a_Morph_5",
    "a_Morph_6",
    "a_Morph_7",
    "a_Skin_Joints",
    "a_Skin_Weights"
]

const GLTF_PARSE_attributeLocationLookup = new Map<string, number>();
GLTF_PARSE_attributeNames.forEach((aName, idx) => {
    GLTF_PARSE_attributeLocationLookup.set(aName, idx);
});

export const GLTF_PARSE_getAttributeLocation = (aName:string):number => {
    if(!GLTF_PARSE_attributeLocationLookup.has(aName)) {
        throw new Error("unknown attribute " + aName);
    }

    return GLTF_PARSE_attributeLocationLookup.get(aName);
}

const getAccessorStrategy =({ gltf, accessor, info}: { gltf: GLTF_ORIGINAL, accessor:GLTF_ORIGINAL_Accessor, info: GltfAccessorDataInfo}) => {
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
        offset: (info.sparse || !accessor.byteOffset) ? 0 : accessor.byteOffset
        //since we sliced it off already for sparse values, it's always 0 here
    }
}

const isAttribute = ({gltf, accessorId}:{gltf:GLTF_ORIGINAL, accessorId:number}) => {
    if(!gltf.nodes) {
        return false;
    }

    return gltf.nodes.some(node => 
        node.mesh === undefined ? false :
        gltf.meshes[node.mesh].primitives.some(primitive =>
            primitive.indices === accessorId 
            ||  Object.keys(primitive.attributes).some(key =>
                    primitive.attributes[key] === accessorId
                )
            ||  (primitive.targets && primitive.targets.some(target =>
                    Object.keys(target).some(key =>
                        target[key] === accessorId
                    )
                ))
        )
    );
}

export const GLTF_PARSE_createAttributes = ({ gltf, buffers, renderer }: { gltf: GLTF_ORIGINAL, buffers: Array<ArrayBuffer>, renderer: WebGlRenderer }): GltfAttributes => {

    const bufferViewInfo = new Map<number, {rendererBufferId: Symbol, buffer: ArrayBuffer}>();

    const accessorLookup = new Map<number, { 
        strategy: WebGlAttributeActivateOptions; 
        rendererBufferId: Symbol 
    }>();

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
        .filter((accessor, accessorId) => isAttribute({gltf, accessorId}))
        .forEach((accessor, accessorId) => {
            const isElements = indicesList.indexOf(accessorId) === -1 ? false: true;
            const info = GLTF_PARSE_getAccessorDataInfo({gltf, accessorId });
            const strategy = getAccessorStrategy({gltf, accessor, info});

            let rendererBufferId, buffer;


            if(accessor.sparse) {
                rendererBufferId = Symbol(`accessor ${accessorId}`);
                buffer = GLTF_PARSE_getAccessorTypedData({
                    gltf, 
                    buffers,
                    info 
                }).buffer

            } else {
                if(!bufferViewInfo.has(info.bufferViewIndex)) {
                    const bufferView = gltf.bufferViews[info.bufferViewIndex];
                    const byteOffset = bufferView.byteOffset ? bufferView.byteOffset : 0;

                    bufferViewInfo.set(info.bufferViewIndex, 
                        {
                            rendererBufferId: Symbol(`buffer view ${info.bufferViewIndex}`),
                            buffer: buffers[info.bufferIndex].slice(byteOffset, byteOffset + bufferView.byteLength)
                        }
                    )
                } 

                const bvInfo = bufferViewInfo.get(info.bufferViewIndex);
                rendererBufferId = bvInfo.rendererBufferId;
                buffer = bvInfo.buffer;
            }

            renderer.buffers.assign(rendererBufferId)({
                target: isElements ?  WebGlConstants.ELEMENT_ARRAY_BUFFER : WebGlConstants.ARRAY_BUFFER,
                usagePattern: WebGlConstants.STATIC_DRAW,
                data: buffer
            });

            accessorLookup.set(accessorId, { strategy, rendererBufferId });
        });

    const vaoIdLookup = new Map<number, Symbol>();
    const vertexArrays = createVertexArrays({ renderer, getAttributeLocation: GLTF_PARSE_getAttributeLocation });
    return { accessorLookup, vertexArrays, vaoIdLookup}
}
