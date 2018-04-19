//Immutable definitions
import { WebGlRenderer } from 'webgl-simple';

import { GltfData,GltfNode, GltfEnvironment, GltfInitConfig, GltfScene, TypedNumberArray, GltfCamera, GltfLighting} from '../../Types';
import { getEmptyLighting } from '../../exports/Lighting';
import { GLTF_PARSE_createNodePrimitives } from './Gltf-Parse-Primitives';
import {GLTF_PARSE_getNodeTransform} from "./Gltf-Parse-Nodes";
import {GLTF_PARSE_getCamera, GLTF_PARSE_hasCameras} from "./Gltf-Parse-Camera";
//Conversion tool

export const GLTF_PARSE_createScene = ({ renderer, environment, data, config}: {renderer: WebGlRenderer, environment: GltfEnvironment, data: GltfData, config: GltfInitConfig }): GltfScene => {


	const gltf = data.original;

	const camera = config.cameraIndex === undefined ? config.camera : GLTF_PARSE_getCamera(gltf) (config.cameraIndex);

        if(!camera) {
            throw new Error("no camera set!");
        }
	const lighting = getEmptyLighting();

	const nodePrimitives = GLTF_PARSE_createNodePrimitives({ renderer, environment, data, config});
	const nodes = !gltf.nodes 
		? [] 
		: gltf.nodes
                    .filter(originalNode => originalNode.mesh !== undefined)
                    .map((originalNode, nodeIndex) => {
			const primitives = nodePrimitives[nodeIndex];

			const morphWeights =
				originalNode.weights
				    ? Float32Array.from(originalNode.weights)
				    : gltf.meshes[originalNode.mesh].weights
				        ? Float32Array.from(gltf.meshes[originalNode.mesh].weights)
				        : undefined;

                        const parent = null; //TODO get parent (this whole section might need to be recursive instead of map 
			const transform = GLTF_PARSE_getNodeTransform({originalNode, data, parent, camera,config});

			const node = {transform,primitives} as GltfNode;

			if(morphWeights) {
				node.morphWeights = morphWeights;
			}

			return node;
		});

	

	return {
		camera, lighting, nodes 
	};
}
