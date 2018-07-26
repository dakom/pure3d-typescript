import {GltfScene, GltfNode, GltfNodeKind} from "../../Types";
import {updateRuntimeShaderConfig_Primitive, updateRuntimeShaderConfig_Scene} from "../../internal/gltf/shaders/Gltf-Runtime-Shader";

import {mapNodes, updateNodeListTransforms} from "../common/nodes/Nodes";

export const gltf_updateShaderConfigs = (scene:GltfScene):GltfScene => {
        scene = updateRuntimeShaderConfig_Scene (scene);

        scene = Object.assign({}, scene, {
            nodes: mapNodes<GltfNode>(node => 
                node.kind === GltfNodeKind.MESH
                ?   Object.assign({}, node, {
                            primitives: node.primitives.map(primitive =>
                                updateRuntimeShaderConfig_Primitive(scene) (primitive)
                            )
                    })
                :   node
            ) (scene.nodes)
        }) as GltfScene;

        return scene;
    }
