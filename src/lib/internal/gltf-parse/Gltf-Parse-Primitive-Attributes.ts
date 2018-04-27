import { WebGlShader, WebGlVertexArray } from 'webgl-simple';

import { GLTF_ORIGINAL_MeshPrimitive, GltfData } from '../../Types';

let _vaoIdCounter = 0;

const attributeShaderNameLookup = {
  "POSITION": "a_Position",
  "NORMAL": "a_Normal",
  "TANGENT": "a_Tangent",
  "TEXCOORD_0": "a_UV",
  "COLOR_0": "a_Color"
}

export const GLTF_PARSE_sortPrimitiveAttributeKeys = (keys: Array<string>): Array<string> =>
  keys.sort((a, b) => {
    if (a === b) {
      return 0;
    }
    switch (a) {
      case "POSITION": return -1;
      case "TANGENT": return 1;
      case "NORMAL": return b === "POSITION" ? 1 : -1;
    }

    return 1;
  });

export const GLTF_PARSE_primitiveHasAttribute = (attributeName: string) => (originalPrimitive: GLTF_ORIGINAL_MeshPrimitive): boolean =>
  Object.keys(originalPrimitive.attributes).indexOf(attributeName) !== -1;

export const GLTF_PARSE_getPrimitiveAttributeKeys = (originalPrimitive: GLTF_ORIGINAL_MeshPrimitive): Array<string> =>
  GLTF_PARSE_sortPrimitiveAttributeKeys(Object.keys(originalPrimitive.attributes));

export const GLTF_PARSE_createPrimitiveAttributes = ({ originalPrimitive, data, shaderIdLookup }: { originalPrimitive: GLTF_ORIGINAL_MeshPrimitive, data: GltfData, shaderIdLookup:number }) => {
  const vao = { data: [] } as WebGlVertexArray;

  const shader = data.shaders.get(shaderIdLookup);
  const vertexArrays = shader.vertexArrays;

  if (originalPrimitive.indices !== undefined) {
    //console.log("elements", data.accessors.get(originalPrimitive.indices).values);

    vao.elementBufferId = data.attributes.get(originalPrimitive.indices).rendererBufferId;
  }

  const attributeKeys = GLTF_PARSE_getPrimitiveAttributeKeys(originalPrimitive);

  attributeKeys.forEach((attributeKey) => {
    
    const accessorId = originalPrimitive.attributes[attributeKey];
    const attributeName = attributeShaderNameLookup[attributeKey];

    if(shader.attributes.getLocation(attributeName) !== -1) {
      vao.data.push({
        attributeName,
        bufferId: data.attributes.get(accessorId).rendererBufferId,
        ...data.attributes.get(accessorId).strategy
      });
    } else {
        console.warn(attributeName, " is -1");
    }

  });


  const { targets } = originalPrimitive;
  if (targets) {
    let morphIndex = 0;
    targets.forEach(target => {
      GLTF_PARSE_sortPrimitiveAttributeKeys(Object.keys(target)).forEach(attributeKey => {
        const accessorId = target[attributeKey];
        const aMorph = `a_Morph_${morphIndex++}`;
        //console.log(aMorph,  data.accessors.get(accessorId).strategy.offset);
        
        vao.data.push({
          attributeName: aMorph,
          bufferId: data.attributes.get(accessorId).rendererBufferId,
          ...data.attributes.get(accessorId).strategy
        });
      });
    });
  }

  
  //vao.data.forEach(({attributeName}) => console.log(attributeName, shader.attributes.getLocation(attributeName)));

  const vaoIdLookup = _vaoIdCounter++;
  const sym = Symbol();
  data.vaoIds.set(vaoIdLookup, sym);

  vertexArrays.assign(sym)(vao);
  vertexArrays.release();

  return vaoIdLookup;
}
