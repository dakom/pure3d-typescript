import { mat4, vec3, quat } from 'gl-matrix';

import { WebGlConstants, WebGlRenderer, createShader, activateShader, WebGlVertexArray, WebGlShader } from 'webgl-simple';
import { Future } from "fluture";
import {GltfBridge} from "../../exports/Bridge";
import {GltfTextureInfo,GltfCamera,GltfLighting, GltfScene, GltfNode, GltfPrimitive, GltfPrimitiveDrawKind, GltfEnvironmentKind} from "../../Types";

export const createRendererThunk = ({bridge, scene, nodeIndex, primitiveIndex}:{bridge: GltfBridge, scene:GltfScene, nodeIndex:number, primitiveIndex: number}) => () => {
    const {renderer, environment, data} = bridge;

    const { gl } = renderer;    
    const {nodes, camera, lighting} = scene;
    
    const gltf = data.original;

    const node = nodes[nodeIndex];
    const primitive = node.primitives[primitiveIndex];

    const {material, drawMode, shaderKind} = primitive;
    
    const { uniforms, vertexArrays, attributes, shaderId } = data.shaders.get(primitive.shaderIdLookup);
    const { uniform1i, uniform1f, uniform1fv, uniform1iv, uniform2fv, uniform3fv, uniform4fv, uniformMatrix4fv } = uniforms.setters;
    const vaoId = data.vaoIds.get(primitive.vaoIdLookup);

    let samplerIndex = 0;

    activateShader(shaderId);

    /*
        Set the environment uniforms
    */

    if(environment.kind === GltfEnvironmentKind.PBR_IBL) {
      renderer.switchTexture(samplerIndex)(environment.textures.brdf);
      uniform1i("u_brdfLUT")(samplerIndex++);
  
      if (environment.textures.cubeMaps.diffuse) {
        renderer.switchCubeTexture(samplerIndex)(environment.textures.cubeMaps.diffuse);
        uniform1i("u_DiffuseEnvSampler")(samplerIndex++);
      }
  
      if (environment.textures.cubeMaps.specular) {
        renderer.switchCubeTexture(samplerIndex)(environment.textures.cubeMaps.specular);
        uniform1i("u_SpecularEnvSampler")(samplerIndex++);
      }

      //this is actually just used in fragment shader (e.g. not for transforms), but it's required
    
      uniform3fv("u_Camera")(camera.position);

      
      uniform4fv("u_ScaleDiffBaseMR")(lighting.scaleDiffBaseMR);
      uniform4fv("u_ScaleFGDSpec")(lighting.scaleFGDSpec);
      uniform4fv("u_ScaleIBLAmbient")(lighting.scaleIBLAmbient);

      uniform3fv("u_LightDirection")(lighting.directional.direction);
      uniform3fv("u_LightColor")(lighting.directional.color);

    }

    

    
    /*
      Set the transform uniforms
    */

    
    uniformMatrix4fv("u_MVPMatrix")(false)(node.transform.modelViewProjection);
    uniformMatrix4fv("u_ModelMatrix")(false)(node.transform.model);
    
    if(node.transform.normal) {
      uniformMatrix4fv("u_NormalMatrix")(false)(node.transform.normal);
    }
    
    /*
      Set the morph targets
    */

    
    //console.log(uniforms.getLocation("u_MorphWeights"));

    if(node.morphWeights) {
      
      uniform1fv("u_MorphWeights") (node.morphWeights);
    }
    /*
      Set the material uniforms
    */

    const assignMeshTexture = (uName: string) => (textureInfo: number | WebGLTexture) => {

      if (typeof textureInfo === "number") {
        renderer.switchTexture(samplerIndex)(data.textures.get(textureInfo));
      } else {
        renderer.switchTexture(samplerIndex)(textureInfo);
      }

      uniform1i(uName)(samplerIndex++);
    }

    renderer.glToggle(WebGlConstants.CULL_FACE)((material === undefined || material.doubleSided === undefined) ? true : false);

    if (material && environment.kind === GltfEnvironmentKind.PBR_IBL) {
      uniform2fv("u_MetallicRoughnessValues")(material.metallicRoughnessValues);
      uniform4fv("u_BaseColorFactor")(material.baseColorFactor);

      if(material.baseColorSamplerIndex !== undefined) {
        assignMeshTexture("u_BaseColorSampler")(material.baseColorSamplerIndex);
      }
      if(material.metallicRoughnessSamplerIndex !== undefined) {
        assignMeshTexture("u_MetallicRoughnessSampler")(material.metallicRoughnessSamplerIndex);
      }
      if(material.normal !== undefined) {
        uniform1f("u_NormalScale")(material.normal.scale);
        assignMeshTexture("u_NormalSampler")(material.normal.samplerIndex);
      }

      if (material.occlusion !== undefined) {
        uniform1f("u_OcclusionStrength")(material.occlusion.strength);
        assignMeshTexture("u_OcclusionSampler")(material.occlusion.samplerIndex);
      }


      if (material.emissiveSamplerIndex !== undefined) {
        assignMeshTexture("u_EmissiveSampler")(material.emissiveSamplerIndex);
      }

      if (material.emissiveFactor !== undefined) {
        uniform3fv("u_EmissiveFactor")(material.emissiveFactor);
      }

      if (material.alphaMode !== undefined) {
        //https://github.com/KhronosGroup/glTF-WebGL-PBR/issues/25
      }
    
      if (material.alphaCutoff !== undefined) {
        //https://github.com/KhronosGroup/glTF-WebGL-PBR/issues/25
      }
    }

    /*
        Draw
    */

    vertexArrays.activate(vaoId);

    if(primitive.drawKind === GltfPrimitiveDrawKind.ELEMENTS) {
      const elementsAccessor = gltf.accessors[primitive.elementsId];
      
      //console.log(`gl.drawElements(${drawMode}, ${elementsAccessor.count}, ${elementsAccessor.componentType}, ${elementsAccessor.byteOffset || 0});`)
      gl.drawElements(drawMode, elementsAccessor.count, elementsAccessor.componentType, elementsAccessor.byteOffset || 0);
    } else {
      gl.drawArrays(drawMode, 0, primitive.arrayCount);
    }

    vertexArrays.release();
}