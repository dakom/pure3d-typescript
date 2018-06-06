import { mat4, vec3, quat } from 'gl-matrix';

import {createRendererThunk} from "./Gltf-Renderer-Thunk";
import {generateShader} from "../gltf-parse/Gltf-Parse-Primitive-Shader";
import {forEachNodes, findNode, countNodes } from "../../../exports/common/nodes/Nodes";
import { GltfBridge, WebGlConstants, WebGlRenderer,  WebGlShader } from '../../../Types';
import { Future } from "fluture";
import {
    WebGlVertexArrayData,
    WebGlAttributeActivateOptions,
    GltfNodeKind,
    NodeKind,
    GltfRendererThunk,
    Light,
    GltfShaderConfig,
    GltfMeshNode,
    LightNode,
    LightKind,
    GltfTextureInfo,
    Camera,
    GltfIblScene,
    DirectionalLight,
    GltfLightNode,
    GltfCameraNode,
    AmbientLight,
    GltfScene,
    GltfNode,
    GltfPrimitive,
    GltfMaterialAlphaMode,
    GltfData,
    WebGlBufferInfo,
    WebGlBufferData,
    GltfPrimitiveDrawKind } from "../../../Types";

type RenderGroup = Array<() => void>;

export const renderScene = (renderer:WebGlRenderer) => (data:GltfData) => (scene:GltfScene) => {
    const shaderGroupByAlpha = new Map<GltfMaterialAlphaMode, Set<RenderGroup>>();
    const renderThunksByShader = new Map<Symbol, Array<() => void>>();
    const meshList = new Array<GltfMeshNode>();
    const lightList = new Array<LightNode>();

    forEachNodes ((node:GltfNode) => {
        if( node.kind === GltfNodeKind.MESH 
            && node.transform 
            && node.transform.modelViewProjectionMatrix ? true : false) {
            meshList.push(node as GltfMeshNode);
        } else if(node.kind === NodeKind.LIGHT) {
            lightList.push(node as LightNode);
        } 
    }) (scene.nodes);

    meshList.forEach(node => {
        let skinMatrices:Float32Array;
        if(node.skin !== undefined && node.skin.skinMatrices) {
            skinMatrices = node.skin.skinMatrices;
        }

        node.primitives.forEach(primitive => {
            const shader = generateShader({ 
                renderer, 
                data,
                primitive,
            });

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
                renderer.vertexArrays.release();
                xs.forEach(fn => fn())
            });
    }
}
