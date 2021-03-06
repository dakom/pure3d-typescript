import {WebGlVertexArrayData,WebGlAttributeActivateOptions, WebGlBufferData, WebGlBufferInfo, WebGlRenderer, WebGlShader, GLTF_ORIGINAL_Node, GLTF_ORIGINAL_MeshPrimitive} from '../../../Types';

import { GltfData, GltfPrimitive, GltfInitConfig } from '../../../Types';
import { GLTF_PARSE_createPrimitiveAttributes } from './Gltf-Parse-Primitive-Attributes';
import { GLTF_PARSE_getPrimitiveDrawing } from './Gltf-Parse-Primitive-Drawing';
import { GLTF_PARSE_createMaterialForPrimitive } from './Gltf-Parse-Primitive-Material';
import {GLTF_PARSE_getInitialShaderConfig_Primitive} from "./Gltf-Parse-Shader";

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
                    vaoId: GLTF_PARSE_createPrimitiveAttributes({renderer, originalPrimitive, data}),
                    ...GLTF_PARSE_getPrimitiveDrawing({originalPrimitive, data}),
                } as GltfPrimitive;

                if(originalPrimitive.material !== undefined) {
                    primitive.material = GLTF_PARSE_createMaterialForPrimitive({gltf, materialId: originalPrimitive.material, data});
                }
               
                primitive.shaderConfig = 
                    GLTF_PARSE_getInitialShaderConfig_Primitive
                        (data) 
                        ({nodeId: nodeId, meshId: node.mesh, primitiveId: primitiveIdx}) 
                        (primitive);

                return primitive;
            }))
        );
    return meshPrimitives;
}

