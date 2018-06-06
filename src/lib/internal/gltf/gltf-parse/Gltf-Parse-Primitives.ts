import {WebGlVertexArrayData,WebGlAttributeActivateOptions, WebGlBufferData, WebGlBufferInfo, WebGlRenderer, WebGlShader, GLTF_ORIGINAL_Node} from '../../../Types';

import { GltfData, GltfPrimitive, GltfInitConfig } from '../../../Types';
import { GLTF_PARSE_createPrimitiveAttributes } from './Gltf-Parse-Primitive-Attributes';
import { GLTF_PARSE_getPrimitiveDrawing } from './Gltf-Parse-Primitive-Drawing';
import { GLTF_PARSE_createMaterialForPrimitive } from './Gltf-Parse-Primitive-Material';
import {GLTF_PARSE_getInitialShaderConfig} from "./Gltf-Parse-Primitive-Shader";

export const GLTF_PARSE_createPrimitives = ({ renderer, data}: { renderer: WebGlRenderer, data: GltfData}): Map<number, Array<GltfPrimitive>> => {
    const gltf = data.original;
    const meshPrimitives = new Map<number, Array<GltfPrimitive>>();

    if(gltf.nodes === undefined || gltf.nodes === null) {
        return meshPrimitives;
    }



    gltf.nodes
        .map((node, idx) => [node, idx] as [GLTF_ORIGINAL_Node, number])
        .filter(([node, idx]) => node.mesh !== undefined && node.mesh !== null) 
        .forEach(([node, nodeId]) =>
            meshPrimitives.set(node.mesh, gltf.meshes[node.mesh].primitives.map((originalPrimitive, primitiveIdx) => {
                const mesh = gltf.meshes[node.mesh];
                

                
                const primitive = {
                    originalNodeId: nodeId,
                    originalMeshId: node.mesh,
                    originalPrimitiveId: primitiveIdx,
                    vaoId: GLTF_PARSE_createPrimitiveAttributes({renderer, originalPrimitive, data}),
                    ...GLTF_PARSE_getPrimitiveDrawing({originalPrimitive, data}),
                } as GltfPrimitive;

                if(originalPrimitive.material !== undefined) {
                    primitive.material = GLTF_PARSE_createMaterialForPrimitive({gltf, materialId: originalPrimitive.material, data});
                }
               
                primitive.shaderConfig = GLTF_PARSE_getInitialShaderConfig({data, primitive});
                return primitive;
            }))
        );
    return meshPrimitives;
}
