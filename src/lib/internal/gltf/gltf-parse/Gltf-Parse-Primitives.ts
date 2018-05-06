import {WebGlBufferData, WebGlBufferInfo, WebGlRenderer, WebGlShader } from '../../../Types';
import {createShader} from "../../../exports/webgl/WebGl-Shaders";

import { GltfData, GltfPrimitive, GltfInitConfig } from '../../../Types';
import { GLTF_PARSE_createPrimitiveAttributes } from './Gltf-Parse-Primitive-Attributes';
import { GLTF_PARSE_getPrimitiveDrawing } from './Gltf-Parse-Primitive-Drawing';
import { GLTF_PARSE_createMaterialForPrimitive } from './Gltf-Parse-Primitive-Material';
import { GLTF_PARSE_getPrimitiveShaderSources } from './Gltf-Parse-Primitive-Shader';


let _shaderIdCounter = 0;

export const GLTF_PARSE_createPrimitives = ({ renderer, data, config }: { renderer: WebGlRenderer, data: GltfData, config: GltfInitConfig }): Map<number, Array<GltfPrimitive>> => {
    const gltf = data.original;
    const _shaderLookup = new Map<string, number>();
    const meshPrimitives = new Map<number, Array<GltfPrimitive>>();

    if(gltf.nodes === undefined || gltf.nodes === null) {
        return meshPrimitives;
    }
    gltf.nodes
        .filter(node => node.mesh !== undefined && node.mesh !== null) 
        .forEach(node =>
            meshPrimitives.set(node.mesh, gltf.meshes[node.mesh].primitives.map((originalPrimitive) => {
                const mesh = gltf.meshes[node.mesh];

                const { vertex, fragment, shaderKind } = GLTF_PARSE_getPrimitiveShaderSources({ config, gltf, data, originalPrimitive });
                const shaderSource = vertex + fragment;


                if (!_shaderLookup.has(shaderSource)) {
                    const shader = createShader({
                        shaderId: Symbol(),
                        renderer,
                        source: { vertex, fragment }
                    });

                    data.shaders.set(_shaderIdCounter, shader);
                    _shaderLookup.set(shaderSource, _shaderIdCounter);
                    _shaderIdCounter++;
                    console.log(`new shader compiled`);
                } else {
                    console.log(`nice! re-using existing shader`);
                }

                const shaderIdLookup = _shaderLookup.get(shaderSource);
                const primitive = {
                    shaderIdLookup,
                    vaoIdLookup: GLTF_PARSE_createPrimitiveAttributes({originalPrimitive, data, shaderIdLookup}),
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
