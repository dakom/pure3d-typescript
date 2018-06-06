import { WebGlAttributeActivateOptions, WebGlBufferData, WebGlBufferInfo, WebGlShader, WebGlRenderer, WebGlVertexArrayData } from '../../../Types';

import { GLTF_ORIGINAL_MeshPrimitive, GltfData } from '../../../Types';

let _vaoIdCounter = 0;


const attributeShaderNameLookup = {
  "POSITION": "a_Position",
  "NORMAL": "a_Normal",
  "TANGENT": "a_Tangent",
  "TEXCOORD_0": "a_UV",
  "COLOR_0": "a_Color",
  "JOINTS_0": "a_Skin_Joint",
  "WEIGHTS_0": "a_Skin_Weight"
}

//Sorting the attributes is important so that the dynamic shader
//matches the correct location for each morph (e.g. morph_1 is position and location x, etc.)
export const GLTF_PARSE_sortPrimitiveAttributeKeys = (keys: Array<string>): Array<string> =>
  keys.sort((a, b) => {
    if (a === b) {
      return 0;
    }

    const ORDER = ["POSITION", "NORMAL", "TANGENT", "TEXCOOR_0", "COLOR_0", "JOINTS_0", "WEIGHTS_0"];

    const oa = ORDER.indexOf(a);
    const ob = ORDER.indexOf(b);
    
    return oa < ob ? -1 : oa > ob ? 1 : 0;
  });

export const GLTF_PARSE_primitiveHasAttribute = (attributeName: string) => (originalPrimitive: GLTF_ORIGINAL_MeshPrimitive): boolean =>
  Object.keys(originalPrimitive.attributes).indexOf(attributeName) !== -1;

export const GLTF_PARSE_getPrimitiveAttributeKeys = (originalPrimitive: GLTF_ORIGINAL_MeshPrimitive): Array<string> =>
  GLTF_PARSE_sortPrimitiveAttributeKeys(Object.keys(originalPrimitive.attributes));

export const GLTF_PARSE_createPrimitiveAttributes = ({ renderer, originalPrimitive, data }: { renderer: WebGlRenderer, originalPrimitive: GLTF_ORIGINAL_MeshPrimitive, data: GltfData }) => {
  const vao = { data: [] } as WebGlVertexArrayData;
    
    const accessorLookup = data.attributes.accessorLookup;

  if (originalPrimitive.indices !== undefined) {

    vao.elementBufferId = accessorLookup.get(originalPrimitive.indices).rendererBufferId;
  }

  const attributeKeys = GLTF_PARSE_getPrimitiveAttributeKeys(originalPrimitive);


  attributeKeys.forEach((attributeKey) => {
    
    const accessorId = originalPrimitive.attributes[attributeKey];
    const attributeName = attributeShaderNameLookup[attributeKey];

    if(!accessorLookup.has(accessorId)) {
        throw new Error("bug here!");
    }

    vao.data.push({
        location: renderer.attributes.getLocationInRenderer(attributeName),
        bufferId: accessorLookup.get(accessorId).rendererBufferId,
        ...accessorLookup.get(accessorId).strategy
    });
    

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
            location: renderer.attributes.getLocationInRenderer(aMorph),
          bufferId: accessorLookup.get(accessorId).rendererBufferId,
          ...accessorLookup.get(accessorId).strategy
        });
      });
    });
  }

  
  //vao.data.forEach(({attributeName}) => console.log(attributeName, shader.attributes.getLocation(attributeName)));

  const vaoId = _vaoIdCounter++;
  const sym = Symbol();
  data.attributes.vaoIdLookup.set(vaoId, sym); 
  renderer.vertexArrays.assign(sym)(vao);

  return vaoId;
}
