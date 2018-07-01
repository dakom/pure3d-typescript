import { mat4, vec3, quat } from 'gl-matrix';

import {createRendererThunk} from "./Gltf-Renderer-Thunk";
import {generateShader} from "../gltf-parse/Gltf-Parse-Primitive-Shader";
import {forEachNodes, findNode, countNodes } from "../../../exports/common/nodes/Nodes";
import {pushNumbersToArray, setNumbersOnArrayFrom} from "../../common/ArrayUtils";

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

const makeTempLightList = () => {
    const makeList = () => ({
            position: new Array<number>(),
            color: new Array<number>(),
            intensity: new Array<number>()
    });

    return {
        directional: makeList(),
        point: makeList(),
        spot: makeList()
    }
}

//The real light list that gets uploaded needs to be in strict order
//Might as well also prepare it in a TypedArray while we're at it
const getRealLightList = (tempList:ReturnType<typeof makeTempLightList>):GltfRendererLightList => {

    const nDirectional = tempList.directional.intensity.length;
    const nPoint = tempList.point.intensity.length;
    const nSpot = tempList.spot.intensity.length;

    const len =  nDirectional + nPoint + nSpot;
    const lightList:GltfRendererLightList = {
        position: new Float32Array(len * 3),
        color: new Float32Array(len * 3),
        intensity: new Float32Array(len)
    }
 
    let offset = 0;
    setNumbersOnArrayFrom(tempList.directional.position) (0) (lightList.position);
    offset += nDirectional * 3;
    setNumbersOnArrayFrom(tempList.point.position) (offset) (lightList.position);
    offset += nPoint * 3;
    setNumbersOnArrayFrom(tempList.spot.position) (offset) (lightList.position);

    offset = 0;
    setNumbersOnArrayFrom(tempList.directional.color) (0) (lightList.color);
    offset += nDirectional * 3;
    setNumbersOnArrayFrom(tempList.point.color) (offset) (lightList.color);
    offset += nPoint * 3;
    setNumbersOnArrayFrom(tempList.spot.color) (offset) (lightList.color);
   
    offset = 0;
    setNumbersOnArrayFrom(tempList.directional.intensity) (0) (lightList.intensity);
    offset += nDirectional;
    setNumbersOnArrayFrom(tempList.point.intensity) (offset) (lightList.intensity);
    offset += nPoint;
    setNumbersOnArrayFrom(tempList.spot.intensity) (offset) (lightList.intensity);

    return lightList;
}

export const renderScene = (renderer:WebGlRenderer) => (data:GltfData) => (scene:GltfScene) => {
    const shaderGroupByAlpha = new Map<GltfMaterialAlphaMode, Set<RenderGroup>>();
    const renderThunksByShader = new Map<Symbol, Array<() => void>>();
    const meshList = new Array<GltfMeshNode>();
    const tempLightList = makeTempLightList();

    forEachNodes ((node:GltfNode) => {
        if( node.kind === GltfNodeKind.MESH 
            && node.transform 
            && node.transform.modelViewProjectionMatrix ? true : false) {
            meshList.push(node as GltfMeshNode);
        } else if(node.kind === NodeKind.LIGHT) {
            const light = node.light;
            const color = light.color;
            const intensity = light.intensity;
            const position = node.transform.trs.translation;


            const target = (() => {
                switch(light.kind) {
                    case LightKind.Directional:
                        return tempLightList.directional;
                    case LightKind.Point:
                        return tempLightList.point;
                    case LightKind.Spot:
                        return tempLightList.spot;
                }
            })();

            pushNumbersToArray (color) (target.color);
            pushNumbersToArray (position) (target.position);
            target.intensity.push(intensity);
        } 
    }) (scene.nodes);

    const lightList = getRealLightList (tempLightList);

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
                xs.forEach(fn => fn())
            });
    }
}
