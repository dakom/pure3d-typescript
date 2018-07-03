import { mat4, vec3, quat } from 'gl-matrix';

import {createRendererThunk} from "./Gltf-Renderer-Thunk";
import {generateShader} from "../gltf-parse/Gltf-Parse-Shader";
import {forEachNodes, findNode, countNodes } from "../../../exports/common/nodes/Nodes";
import {pushNumbersToArray, setNumbersOnArrayFrom} from "../../common/ArrayUtils";
import {createVec3, createMat4} from "../../../exports/common/array/Array";
import { GltfBridge, WebGlConstants, WebGlRenderer,  WebGlShader } from '../../../Types';
import { Future } from "fluture";
import {getLightDirection} from "../../../exports/common/lights/Lights";

import {
    WebGlVertexArrayData,
    WebGlAttributeActivateOptions,
    GltfNodeKind,
    NodeKind,
    GltfRendererThunk,
    GltfShaderConfig_Scene,
    GltfShaderConfig_Primitive,
    Light,
    GltfMeshNode,
    LightNode,
    LightKind,
    GltfTextureInfo,
    Camera,
    DirectionalLight,
    GltfLightNode,
    GltfCameraNode,
    GltfScene,
    GltfNode,
    GltfPrimitive,
    GltfMaterialAlphaMode,
    GltfData,
    WebGlBufferInfo,
    WebGlBufferData,
    GltfPrimitiveDrawKind,
    GltfRendererLightList,
    NumberArray
} from "../../../Types";

type RenderGroup = Array<() => void>;


const _scratchVec3 = new Float64Array(3); 

export const renderScene = (renderer:WebGlRenderer) => (data:GltfData) => (scene:GltfScene) => {
    const shaderGroupByAlpha = new Map<GltfMaterialAlphaMode, Set<RenderGroup>>();
    const renderThunksByShader = new Map<Symbol, Array<() => void>>();
    const meshList = new Array<GltfMeshNode>();
   
    const lightList:GltfRendererLightList = 
        scene.shaderConfig.lights
            ?   {
                    directional: {
                        direction: new Float32Array(scene.shaderConfig.lights.nDirectionalLights * 3),
                        color: new Float32Array(scene.shaderConfig.lights.nDirectionalLights * 3),
                        intensity: new Float32Array(scene.shaderConfig.lights.nDirectionalLights),
                        offset: 0
                    },
                    point: {
                        position: new Float32Array(scene.shaderConfig.lights.nPointLights * 3),
                        color: new Float32Array(scene.shaderConfig.lights.nPointLights * 3),
                        intensity: new Float32Array(scene.shaderConfig.lights.nPointLights),
                        offset: 0
                    },

                    spot: {
                        position: new Float32Array(scene.shaderConfig.lights.nSpotLights * 3),
                        direction: new Float32Array(scene.shaderConfig.lights.nSpotLights * 3),
                        color: new Float32Array(scene.shaderConfig.lights.nSpotLights * 3),
                        intensity: new Float32Array(scene.shaderConfig.lights.nSpotLights),
                        offset: 0
                    },
            }
            :   null;


    forEachNodes ((node:GltfNode) => {
        if( node.kind === GltfNodeKind.MESH 
            && node.transform 
            && node.transform.modelViewProjectionMatrix ? true : false) {
            meshList.push(node as GltfMeshNode);
        } else if(node.kind === NodeKind.LIGHT) {
            const light = node.light;
            
            const target = (() => {
                switch(light.kind) {
                    case LightKind.Directional:
                        return lightList.directional;
                    case LightKind.Point:
                        return lightList.point;
                    case LightKind.Spot:
                        return lightList.spot;
                }
            })();

            const color = light.color;
            const intensity = light.intensity;
            const position = 
                light.kind === LightKind.Point || light.kind === LightKind.Spot
                    ?   mat4.getTranslation(_scratchVec3, node.transform.modelMatrix)
                    :   null;
            let direction = 
                light.kind === LightKind.Directional || light.kind === LightKind.Spot
                    ?   getLightDirection(node.transform.modelMatrix) 
                    :   null;

            for(let i = 0; i < 3; i++) {
                const offset = (target.offset * 3) + i;
                if(position !== null) {
                    target.position[offset] = position[i];
                }

                if(direction !== null) {
                    target.direction[offset] = direction[i];
                }
                target.color[offset] = color[i];
            }
            target.intensity[target.offset] = intensity;
            target.offset++;
        } 
    }) (scene.nodes);


    meshList.forEach(node => {
        let skinMatrices:Float32Array;
        if(node.skin !== undefined && node.skin.skinMatrices) {
            skinMatrices = node.skin.skinMatrices;
        }

        node.primitives.forEach(primitive => {
            const shader = generateShader({renderer, data}) (scene) (primitive);

            if (!renderThunksByShader.has(shader.shaderId)) {
                renderThunksByShader.set(shader.shaderId, []);
            }

            const shaderGroup = renderThunksByShader.get(shader.shaderId);


            shaderGroup.push(createRendererThunk({ 
                skinMatrices,
                renderer,
                data,
                node,
                primitive,
                lightList,
                scene,
                shader
            }));

            if(!shaderGroupByAlpha.has(primitive.shaderConfig.alphaMode)) {
                shaderGroupByAlpha.set(primitive.shaderConfig.alphaMode, new Set<RenderGroup>());
            }
            shaderGroupByAlpha.get(primitive.shaderConfig.alphaMode).add(shaderGroup);
        })
    });

    //These are for _all_ gltf renders, but there might be another gl renderer between them so the flags need to be set
    renderer.glToggle(WebGlConstants.BLEND) (false);
    renderer.glToggle(WebGlConstants.DEPTH_TEST) (true);

    //these are just random guesses looking at some common practices out in the wild
    renderer.glDepthFunc(renderer.gl.LEQUAL);
    renderer.glBlendFunc(renderer.gl.SRC_ALPHA) (renderer.gl.ONE_MINUS_SRC_ALPHA);

    const render = _render (renderer) (shaderGroupByAlpha);

    render(GltfMaterialAlphaMode.OPAQUE);
    render(GltfMaterialAlphaMode.MASK);
    render(GltfMaterialAlphaMode.BLEND);

}


//Render calls are sorted by alpha and then shader.
//The thunks themselves will assign vaos
//They are released by shader groupo
const _render = (renderer:WebGlRenderer) => (shaderGroups:Map<GltfMaterialAlphaMode, Set<RenderGroup>>) => (alphaMode:GltfMaterialAlphaMode) => {
    if(shaderGroups.has(alphaMode)) {
        if(alphaMode === GltfMaterialAlphaMode.BLEND) {
            renderer.glToggle(WebGlConstants.BLEND) (true);
        }
        shaderGroups.get(alphaMode)
            .forEach(xs => {
                xs.forEach(fn => fn())
            });
    }
}
