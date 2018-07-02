import { mat4, vec3, quat } from 'gl-matrix';

import { GltfBridge, WebGlConstants, WebGlRenderer,  WebGlShader } from '../../../Types';
import {createShader, activateShader} from "../../../exports/webgl/WebGl-Shaders";
import { Future } from "fluture";
import {
    GltfRendererThunk,
    Light,
    GltfMeshNode,
    LightNode,
    LightKind,
    GltfTextureInfo,
    Camera,
    DirectionalLight,
    GltfScene,
    GltfNode,
    GltfPrimitive,
    GltfMaterialAlphaMode,
    GltfPrimitiveDrawKind } from "../../../Types";


export const createRendererThunk = (thunk:GltfRendererThunk) => () => {
    const {renderer, data, node, primitive, lightList, scene, shader, skinMatrices} = thunk;
    const {camera} = scene;
    
    const { gl } = renderer;    
  

    const gltf = data.original;

    const {material, drawMode} = primitive;
    
    const { uniforms, shaderId } = shader; 
    const { uniform1i, uniform1f, uniform1fv, uniform1iv, uniform2fv, uniform3fv, uniform4fv, uniformMatrix4fv } = uniforms.setters;
    const vaoId = data.attributes.vaoIdLookup.get(primitive.vaoId);



    let samplerIndex = 0;

    activateShader(shaderId);


    if(material && material.doubleSided) {
        renderer.glToggle(WebGlConstants.CULL_FACE) (false);
    } else {
        renderer.glToggle(WebGlConstants.CULL_FACE) (true);
    }
    /*
        Set the IBL uniforms
    */

    if(scene.shaderConfig.ibl) {
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
    }

    /* 
     * Set the node-based lighting uniforms
    */

    if(lightList) {
        if(lightList.directional.offset) {
            uniform3fv("u_Light_Directional_Direction") (lightList.directional.direction);
            uniform3fv("u_Light_Directional_Color") (lightList.directional.color);
            uniform1fv("u_Light_Directional_Intensity") (lightList.directional.intensity);
        }
        if(lightList.point.offset) {
            uniform3fv("u_Light_Point_Position") (lightList.point.position);
            uniform3fv("u_Light_Point_Color") (lightList.point.color);
            uniform1fv("u_Light_Point_Intensity") (lightList.point.intensity);
        }
        if(lightList.spot.offset) {
            uniform3fv("u_Light_Spot_Position") (lightList.spot.position);
            uniform3fv("u_Light_Spot_Direction") (lightList.spot.direction);
            uniform3fv("u_Light_Spot_Color") (lightList.spot.color);
            uniform1fv("u_Light_Spot_Intensity") (lightList.spot.intensity);
        }
    }

    
    /*
      Set the transform uniforms
    */

    
    if(skinMatrices) {
        uniformMatrix4fv("u_Skin_Matrices")(false)(skinMatrices);
    }

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

        if(material.alphaMode === GltfMaterialAlphaMode.MASK) {
            const alphaCutoff = (material.alphaMode === GltfMaterialAlphaMode.MASK)
                ?   material.alphaCutoff
                :   1.0;

            uniform1f("u_AlphaCutoff") (alphaCutoff);
        }
    
    }

    /*
        Draw
    */

    renderer.vertexArrays.activate(vaoId);

    if(primitive.drawKind === GltfPrimitiveDrawKind.ELEMENTS) {
      const elementsAccessor = gltf.accessors[primitive.elementsId];
      
      //console.log(`gl.drawElements(${drawMode}, ${elementsAccessor.count}, ${elementsAccessor.componentType}, ${elementsAccessor.byteOffset || 0});`)
      gl.drawElements(drawMode, elementsAccessor.count, elementsAccessor.componentType, elementsAccessor.byteOffset || 0);
    } else {
      gl.drawArrays(drawMode, 0, primitive.arrayCount);
    }

}

