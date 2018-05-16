import {WebGlBufferData, WebGlBufferInfo, WebGlRenderer, WebGlShader } from '../../../Types';

import { GltfData, GltfPrimitive, GltfInitConfig } from '../../../Types';
import { GLTF_PARSE_createPrimitiveAttributes } from './Gltf-Parse-Primitive-Attributes';
import { GLTF_PARSE_getPrimitiveDrawing } from './Gltf-Parse-Primitive-Drawing';
import { GLTF_PARSE_createMaterialForPrimitive } from './Gltf-Parse-Primitive-Material';
import { GLTF_PARSE_getPrimitiveShaderId} from './Gltf-Parse-Primitive-Shader';



export const GLTF_PARSE_createPrimitives = ({ renderer, data, config }: { renderer: WebGlRenderer, data: GltfData, config: GltfInitConfig }): Map<number, Array<GltfPrimitive>> => {
    const gltf = data.original;
    const meshPrimitives = new Map<number, Array<GltfPrimitive>>();

    if(gltf.nodes === undefined || gltf.nodes === null) {
        return meshPrimitives;
    }



    gltf.nodes
        .filter(node => node.mesh !== undefined && node.mesh !== null) 
        .forEach(node =>
            meshPrimitives.set(node.mesh, gltf.meshes[node.mesh].primitives.map((originalPrimitive) => {
                const mesh = gltf.meshes[node.mesh];

                const {shaderId, shaderKind} = GLTF_PARSE_getPrimitiveShaderId({ renderer, config, gltf, data, originalPrimitive });

                const primitive = {
                    shaderId,
                    vaoId: GLTF_PARSE_createPrimitiveAttributes({originalPrimitive, data}),
                    ...GLTF_PARSE_getPrimitiveDrawing({originalPrimitive, data}),
                    shaderKind
                } as GltfPrimitive;

                if(originalPrimitive.material !== undefined) {
                    primitive.material = GLTF_PARSE_createMaterialForPrimitive({gltf, materialId: originalPrimitive.material, data});
                }
                
                return primitive;
            }))
        );
    return meshPrimitives;
}
