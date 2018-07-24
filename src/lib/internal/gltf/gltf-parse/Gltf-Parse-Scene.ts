import {
    WebGlVertexArrayData,
    WebGlAttributeActivateOptions, 
    WebGlBufferData, 
    WebGlBufferInfo, 
    WebGlRenderer, 
    WebGlShader,
    GltfScene,
    Camera,
    GltfNode,
    GltfCameraNode,
    GltfLightNode,
    GltfMeshNode,
    GltfShaderConfig_Scene
} from '../../../Types';

import { GltfData, GltfInitConfig } from '../../../Types';
import {GLTF_PARSE_getInitialShaderConfig_Scene} from "./Gltf-Parse-Shader";
import {forEachNodes, updateNodeListTransforms} from "../../../exports/common/nodes/Nodes";
import {GltfExtensions} from "./extensions/Gltf-Parse-Extensions";

export const GLTF_PARSE_createScene = ({ renderer, data, allNodes}: { renderer: WebGlRenderer, data: GltfData, allNodes: Array<GltfNode>}) => (camera:Camera) => (sceneNumber:number):GltfScene => {

        let nodes = [] 

        if(sceneNumber >= 0 && data.original.scenes[sceneNumber]) {
            const sceneList = data.original.scenes[sceneNumber].nodes;
            
            forEachNodes<GltfNode>(node => {
                if(sceneList.indexOf(node.originalNodeId) !== -1) {
                    nodes.push(node);
                } 
            }) (allNodes);
        } else {
            nodes = allNodes;
            console.warn("no scene specified! Expect duplicate nodes...");
        }


        const originalScene = sceneNumber >= 0 
            ?   data.original.scenes[sceneNumber]
            :   {
                    nodes: data.original.nodes.map((node, idx) => idx)
                }
            
        //const nodes =_allNodes.filter((node, idx) => originalScene.nodes.indexOf(idx) !== -1);

    

        const scene = 
            GltfExtensions
                .map(ext => ext.createScene)
                .reduce((acc, val) => 
                    acc = val (data.original) (originalScene) (acc),
                    {
                        camera,
                        nodes: updateNodeListTransforms <GltfNode>({
                            updateLocal: true,
                            updateModel: true,
                            updateView: true,
                            updateLightDirection: true,
                            camera,
                        })
                        (null)
                        (nodes)
                    } as GltfScene
                );


        //workaround read-only here
        (scene as any).shaderConfig =  GLTF_PARSE_getInitialShaderConfig_Scene (data) (scene);
        
        return scene;
}
