//Immutable definitions
import { WebGlRenderer } from 'webgl-simple';

import { GltfData,GltfNode, GltfEnvironment, GltfInitConfig, GltfScene, TypedNumberArray, GltfCamera, GltfLighting} from '../../Types';
import { getEmptyLighting } from '../../exports/Lighting';
import { GLTF_PARSE_createNodePrimitives } from './Gltf-Parse-Primitives';
import {GLTF_PARSE_getNodeTransform} from "./Gltf-Parse-Nodes";
import {GLTF_PARSE_getDefaultCamera, GLTF_PARSE_hasDefaultCamera} from "./Gltf-Parse-Camera";
//Conversion tool

export const GLTF_PARSE_createScene = ({ renderer, environment, data, config}: {renderer: WebGlRenderer, environment: GltfEnvironment, data: GltfData, config: GltfInitConfig }): GltfScene => {


	const gltf = data.original;

	const camera = GLTF_PARSE_hasDefaultCamera(gltf) ? GLTF_PARSE_getDefaultCamera(gltf) : {view: new Array<number>(16).fill(0), position: Float32Array.from([0,0,0])}

	const lighting = getEmptyLighting();

	const nodePrimitives = GLTF_PARSE_createNodePrimitives({ renderer, environment, data, config});
	const nodes = !gltf.nodes 
		? [] 
		: gltf.nodes.map((originalNode, nodeIndex) => {
			const primitives = nodePrimitives[nodeIndex];

			const morphWeights =
				originalNode.weights
				? Float32Array.from(originalNode.weights)
				: originalNode.mesh !== undefined && gltf.meshes[originalNode.mesh].weights
				? Float32Array.from(gltf.meshes[originalNode.mesh].weights)
				: undefined;

			const transform = GLTF_PARSE_getNodeTransform({originalNode, data, camera,config});

			const node = {transform,primitives} as GltfNode;

			if(morphWeights) {
				node.morphWeights = morphWeights;
			}

			return node;
		});

	

	return {
		camera, lighting, nodes, projection: config.projection
	};
}
