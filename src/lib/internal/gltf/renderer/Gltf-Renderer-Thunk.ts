import { mat4, vec3, quat } from 'gl-matrix';

import { GltfBridge, WebGlConstants, WebGlRenderer,  WebGlShader } from '../../../Types';
import {createShader, activateShader} from "../../../exports/webgl/WebGl-Shaders";
import { Future } from "fluture";
import {GltfRendererThunk, Light,GltfShaderKind, GltfMeshNode, LightNode, LightKind, GltfTextureInfo,Camera,GltfIbl, DirectionalLight, GltfScene, GltfNode, GltfPrimitive, GltfPrimitiveDrawKind } from "../../../Types";

export const createRendererThunk = (thunk:GltfRendererThunk) => () => {
    const {renderer, data, node, primitive, lightList, scene, shaderMeta} = thunk;
    const {camera} = scene;
    
    const { gl } = renderer;    
  

    const gltf = data.original;

    const {material, drawMode} = primitive;
    
    const { uniforms, attributes, shaderId } = shaderMeta.shader; 
    const { uniform1i, uniform1f, uniform1fv, uniform1iv, uniform2fv, uniform3fv, uniform4fv, uniformMatrix4fv } = uniforms.setters;
    const vaoId = data.attributes.vaoIdLookup.get(primitive.vaoId);

    let samplerIndex = 0;

    activateShader(shaderId);

    /*
        Set the IBL uniforms
    */

    if(shaderMeta.kind === GltfShaderKind.PBR && scene.extensions.ibl) {
      renderer.switchTexture(samplerIndex)(data.extensions.ibl.brdf);
      uniform1i("u_brdfLUT")(samplerIndex++);
  
      if (data.extensions.ibl.cubeMaps.diffuse) {
        renderer.switchCubeTexture(samplerIndex)(data.extensions.ibl.cubeMaps.diffuse);
        uniform1i("u_DiffuseEnvSampler")(samplerIndex++);
      }
  
      if (data.extensions.ibl.cubeMaps.specular) {
        renderer.switchCubeTexture(samplerIndex)(data.extensions.ibl.cubeMaps.specular);
        uniform1i("u_SpecularEnvSampler")(samplerIndex++);
      }

      //this is actually just used in fragment shader (e.g. not for transforms), but it's required
   
      uniform3fv("u_Camera")(camera.position);

      
      uniform4fv("u_ScaleDiffBaseMR")(scene.extensions.ibl.scaleDiffBaseMR);
      uniform4fv("u_ScaleFGDSpec")(scene.extensions.ibl.scaleFGDSpec);
      uniform4fv("u_ScaleIBLAmbient")(scene.extensions.ibl.scaleIBLAmbient);

    }

    /* 
     * Set the generic lighting uniforms
    */


    lightList.forEach(lightNode => {
        const {light} = lightNode;

        //TODO - allow multiple lights, point lights, etc.
        if(light.kind === LightKind.Directional) {

            //uniform3fv("u_LightDirection")(light.);
            //uniform3fv("u_LightColor")(light.color);
        }
    })

   

    
    /*
      Set the transform uniforms
    */

    
    uniformMatrix4fv("u_MVPMatrix")(false)(node.transform.modelViewProjectionMatrix);
    uniformMatrix4fv("u_ModelMatrix")(false)(node.transform.modelMatrix);
    
    if(node.transform.normalMatrix) {
      uniformMatrix4fv("u_NormalMatrix")(false)(node.transform.normalMatrix);
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

    if (material) {
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

    data.attributes.vertexArrays.activate(vaoId);

    if(primitive.drawKind === GltfPrimitiveDrawKind.ELEMENTS) {
      const elementsAccessor = gltf.accessors[primitive.elementsId];
      
      //console.log(`gl.drawElements(${drawMode}, ${elementsAccessor.count}, ${elementsAccessor.componentType}, ${elementsAccessor.byteOffset || 0});`)
      gl.drawElements(drawMode, elementsAccessor.count, elementsAccessor.componentType, elementsAccessor.byteOffset || 0);
    } else {
      gl.drawArrays(drawMode, 0, primitive.arrayCount);
    }

    data.attributes.vertexArrays.release();
}
