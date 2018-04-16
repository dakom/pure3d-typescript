import { createShader, WebGlRenderer, WebGlShader } from 'webgl-simple';

import { GltfData, GltfEnvironment, GltfPrimitive, GltfInitConfig } from '../../Types';
import { GLTF_PARSE_createPrimitiveAttributes } from './Gltf-Parse-Primitive-Attributes';
import { GLTF_PARSE_getPrimitiveDrawing } from './Gltf-Parse-Primitive-Drawing';
import { GLTF_PARSE_createMaterialForPrimitive } from './Gltf-Parse-Primitive-Material';
import { GLTF_PARSE_getPrimitiveShaderSources } from './Gltf-Parse-Primitive-Shader';


let _shaderIdCounter = 0;

export const GLTF_PARSE_createNodePrimitives = ({ renderer, environment, data, config }: { renderer: WebGlRenderer, environment: GltfEnvironment, data: GltfData, config: GltfInitConfig }): Array<Array<GltfPrimitive>> => {
	const gltf = data.original;
	const _shaderLookup = new Map<string, number>();

	return gltf.nodes === undefined || gltf.nodes === null
		? []
		: gltf.nodes.map(node => node.mesh === undefined || node.mesh === null
			? []
			: gltf.meshes[node.mesh].primitives.map((originalPrimitive) => {
				const mesh = gltf.meshes[node.mesh];
					
				const { vertex, fragment, shaderKind } = GLTF_PARSE_getPrimitiveShaderSources({ config, environment, gltf, originalPrimitive });
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
			})
		);
}
