import { WebGlConstants, WebGlShader } from '../../../Types';

import { GLTF_ORIGINAL_MeshPrimitive, GltfData, GltfShaderConfig_Primitive, GltfPrimitive, GltfMaterial, GltfPrimitiveArrayDraw, GltfPrimitiveElementsDraw, GltfPrimitiveDrawKind } from '../../../Types';
import { GLTF_PARSE_getPrimitiveAttributeKeys } from './Gltf-Parse-Primitive-Attributes';

export const GLTF_PARSE_getPrimitiveDrawing = ({ originalPrimitive, data }: { originalPrimitive: GLTF_ORIGINAL_MeshPrimitive, data: GltfData }) => {

  const _primitive = {
    drawKind: (originalPrimitive.indices !== undefined) ? GltfPrimitiveDrawKind.ELEMENTS : GltfPrimitiveDrawKind.ARRAY,
    drawMode: originalPrimitive.mode ? originalPrimitive.mode : WebGlConstants.TRIANGLES
  } as Partial<GltfPrimitive>

  if (_primitive.drawKind === GltfPrimitiveDrawKind.ELEMENTS) {
    _primitive.elementsId = originalPrimitive.indices;
  } else {
    const attributeKeys = GLTF_PARSE_getPrimitiveAttributeKeys(originalPrimitive);
    _primitive.arrayCount = data.original.accessors[originalPrimitive.attributes[attributeKeys[0]]].count;
  }

  return _primitive;
}
