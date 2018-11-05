import { GLTF_ORIGINAL_MeshPrimitive, GltfData} from '../../../Types';

export const GLTF_PARSE_getOriginalPrimitive = (data:GltfData) => (meshId:number) => (primitiveId:number):GLTF_ORIGINAL_MeshPrimitive => {
    const mesh = data.original.meshes[meshId];
    
    return mesh ? mesh.primitives[primitiveId] : undefined;
}