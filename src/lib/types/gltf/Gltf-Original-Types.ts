//Note - types are generated via https://github.com/robertlong/gltf-typescript-generator
//They are prefixed manually with "GLTF_ORIGINAL_" to avoid collisions with other native types
//However, to export them here automatically they need something to trigger typescript generation
//So this is the main reference, and exported packages are at the *bottom* (after definitions)


export type GlTfId = number;
/**
 * Indices of those attributes that deviate from their initialization value.
 */
export interface GLTF_ORIGINAL_AccessorSparseIndices {
  /**
   * The index of the bufferView with sparse indices. Referenced bufferView can't have ARRAY_BUFFER or ELEMENT_ARRAY_BUFFER target.
   */
  "bufferView": GlTfId;
  /**
   * The offset relative to the start of the bufferView in bytes. Must be aligned.
   */
  "byteOffset"?: number;
  /**
   * The indices data type.
   */
  "componentType": 5121 | 5123 | 5125 | number;
  "extensions"?: any;
  "extras"?: any;
  [k: string]: any;
}
/**
 * Array of size `accessor.sparse.count` times number of components storing the displaced accessor attributes pointed by `accessor.sparse.indices`.
 */
export interface GLTF_ORIGINAL_AccessorSparseValues {
  /**
   * The index of the bufferView with sparse values. Referenced bufferView can't have ARRAY_BUFFER or ELEMENT_ARRAY_BUFFER target.
   */
  "bufferView": GlTfId;
  /**
   * The offset relative to the start of the bufferView in bytes. Must be aligned.
   */
  "byteOffset"?: number;
  "extensions"?: any;
  "extras"?: any;
  [k: string]: any;
}
/**
 * Sparse storage of attributes that deviate from their initialization value.
 */
export interface GLTF_ORIGINAL_AccessorSparse {
  /**
   * Number of entries stored in the sparse array.
   */
  "count": number;
  /**
   * Index array of size `count` that points to those accessor attributes that deviate from their initialization value. Indices must strictly increase.
   */
  "indices": GLTF_ORIGINAL_AccessorSparseIndices;
  /**
   * Array of size `count` times number of components, storing the displaced accessor attributes pointed by `indices`. Substituted values must have the same `componentType` and number of components as the base accessor.
   */
  "values": GLTF_ORIGINAL_AccessorSparseValues;
  "extensions"?: any;
  "extras"?: any;
  [k: string]: any;
}
/**
 * A typed view into a bufferView.  A bufferView contains raw binary data.  An accessor provides a typed view into a bufferView or a subset of a bufferView similar to how WebGL's `vertexAttribPointer()` defines an attribute in a buffer.
 */
export interface GLTF_ORIGINAL_Accessor {
  /**
   * The index of the bufferView.
   */
  "bufferView"?: GlTfId;
  /**
   * The offset relative to the start of the bufferView in bytes.
   */
  "byteOffset"?: number;
  /**
   * The datatype of components in the attribute.
   */
  "componentType": 5120 | 5121 | 5122 | 5123 | 5125 | 5126 | number;
  /**
   * Specifies whether integer data values should be normalized.
   */
  "normalized"?: boolean;
  /**
   * The number of attributes referenced by this accessor.
   */
  "count": number;
  /**
   * Specifies if the attribute is a scalar, vector, or matrix.
   */
  "type": "SCALAR" | "VEC2" | "VEC3" | "VEC4" | "MAT2" | "MAT3" | "MAT4" | string;
  /**
   * Maximum value of each component in this attribute.
   */
  "max"?: number[];
  /**
   * Minimum value of each component in this attribute.
   */
  "min"?: number[];
  /**
   * Sparse storage of attributes that deviate from their initialization value.
   */
  "sparse"?: GLTF_ORIGINAL_AccessorSparse;
  "name"?: any;
  "extensions"?: any;
  "extras"?: any;
  [k: string]: any;
}
/**
 * The index of the node and TRS property that an animation channel targets.
 */
export interface GLTF_ORIGINAL_AnimationChannelTarget {
  /**
   * The index of the node to target.
   */
  "node"?: GlTfId;
  /**
   * The name of the node's TRS property to modify, or the "weights" of the Morph Targets it instantiates. For the "translation" property, the values that are provided by the sampler are the translation along the x, y, and z axes. For the "rotation" property, the values are a quaternion in the order (x, y, z, w), where w is the scalar. For the "scale" property, the values are the scaling factors along the x, y, and z axes.
   */
  "path": "translation" | "rotation" | "scale" | "weights" | string;
  "extensions"?: any;
  "extras"?: any;
  [k: string]: any;
}
/**
 * Targets an animation's sampler at a node's property.
 */
export interface GLTF_ORIGINAL_AnimationChannel {
  /**
   * The index of a sampler in this animation used to compute the value for the target.
   */
  "sampler": GlTfId;
  /**
   * The index of the node and TRS property to target.
   */
  "target": GLTF_ORIGINAL_AnimationChannelTarget;
  "extensions"?: any;
  "extras"?: any;
  [k: string]: any;
}
/**
 * Combines input and output accessors with an interpolation algorithm to define a keyframe graph (but not its target).
 */
export interface GLTF_ORIGINAL_AnimationSampler {
  /**
   * The index of an accessor containing keyframe input values, e.g., time.
   */
  "input": GlTfId;
  /**
   * Interpolation algorithm.
   */
  "interpolation"?: "LINEAR" | "STEP" | "CUBICSPLINE" | string;
  /**
   * The index of an accessor, containing keyframe output values.
   */
  "output": GlTfId;
  "extensions"?: any;
  "extras"?: any;
  [k: string]: any;
}
/**
 * A keyframe animation.
 */
export interface GLTF_ORIGINAL_Animation {
  /**
   * An array of channels, each of which targets an animation's sampler at a node's property. Different channels of the same animation can't have equal targets.
   */
  "channels": GLTF_ORIGINAL_AnimationChannel[];
  /**
   * An array of samplers that combines input and output accessors with an interpolation algorithm to define a keyframe graph (but not its target).
   */
  "samplers": GLTF_ORIGINAL_AnimationSampler[];
  "name"?: any;
  "extensions"?: any;
  "extras"?: any;
  [k: string]: any;
}
/**
 * Metadata about the glTF asset.
 */
export interface GLTF_ORIGINAL_Asset {
  /**
   * A copyright message suitable for display to credit the content creator.
   */
  "copyright"?: string;
  /**
   * Tool that generated this glTF model.  Useful for debugging.
   */
  "generator"?: string;
  /**
   * The glTF version that this asset targets.
   */
  "version": string;
  /**
   * The minimum glTF version that this asset targets.
   */
  "minVersion"?: string;
  "extensions"?: any;
  "extras"?: any;
  [k: string]: any;
}
/**
 * A buffer points to binary geometry, animation, or skins.
 */
export interface GLTF_ORIGINAL_Buffer {
  /**
   * The uri of the buffer.
   */
  "uri"?: string;
  /**
   * The length of the buffer in bytes.
   */
  "byteLength": number;
  "name"?: any;
  "extensions"?: any;
  "extras"?: any;
  [k: string]: any;
}
/**
 * A view into a buffer generally representing a subset of the buffer.
 */
export interface GLTF_ORIGINAL_BufferView {
  /**
   * The index of the buffer.
   */
  "buffer": GlTfId;
  /**
   * The offset into the buffer in bytes.
   */
  "byteOffset"?: number;
  /**
   * The length of the bufferView in bytes.
   */
  "byteLength": number;
  /**
   * The stride, in bytes.
   */
  "byteStride"?: number;
  /**
   * The target that the GPU buffer should be bound to.
   */
  "target"?: 34962 | 34963 | number;
  "name"?: any;
  "extensions"?: any;
  "extras"?: any;
  [k: string]: any;
}
/**
 * An orthographic camera containing properties to create an orthographic projection matrix.
 */
export interface GLTF_ORIGINAL_CameraOrthographic {
  /**
   * The floating-point horizontal magnification of the view. Must not be zero.
   */
  "xmag": number;
  /**
   * The floating-point vertical magnification of the view. Must not be zero.
   */
  "ymag": number;
  /**
   * The floating-point distance to the far clipping plane. `zfar` must be greater than `znear`.
   */
  "zfar": number;
  /**
   * The floating-point distance to the near clipping plane.
   */
  "znear": number;
  "extensions"?: any;
  "extras"?: any;
  [k: string]: any;
}
/**
 * A perspective camera containing properties to create a perspective projection matrix.
 */
export interface GLTF_ORIGINAL_CameraPerspective {
  /**
   * The floating-point aspect ratio of the field of view.
   */
  "aspectRatio"?: number;
  /**
   * The floating-point vertical field of view in radians.
   */
  "yfov": number;
  /**
   * The floating-point distance to the far clipping plane.
   */
  "zfar"?: number;
  /**
   * The floating-point distance to the near clipping plane.
   */
  "znear": number;
  "extensions"?: any;
  "extras"?: any;
  [k: string]: any;
}
/**
 * A camera's projection.  A node can reference a camera to apply a transform to place the camera in the scene.
 */
export interface GLTF_ORIGINAL_Camera {
  /**
   * An orthographic camera containing properties to create an orthographic projection matrix.
   */
  "orthographic"?: GLTF_ORIGINAL_CameraOrthographic;
  /**
   * A perspective camera containing properties to create a perspective projection matrix.
   */
  "perspective"?: GLTF_ORIGINAL_CameraPerspective;
  /**
   * Specifies if the camera uses a perspective or orthographic projection.
   */
  "type": "perspective" | "orthographic" | string;
  "name"?: any;
  "extensions"?: any;
  "extras"?: any;
  [k: string]: any;
}
/**
 * Image data used to create a texture. Image can be referenced by URI or `bufferView` index. `mimeType` is required in the latter case.
 */
export interface GLTF_ORIGINAL_Image {
  /**
   * The uri of the image.
   */
  "uri"?: string;
  /**
   * The image's MIME type.
   */
  "mimeType"?: "image/jpeg" | "image/png" | string;
  /**
   * The index of the bufferView that contains the image. Use this instead of the image's uri property.
   */
  "bufferView"?: GlTfId;
  "name"?: any;
  "extensions"?: any;
  "extras"?: any;
  [k: string]: any;
}
/**
 * Reference to a texture.
 */
export interface GLTF_ORIGINAL_TextureInfo {
  /**
   * The index of the texture.
   */
  "index": GlTfId;
  /**
   * The set index of texture's TEXCOORD attribute used for texture coordinate mapping.
   */
  "texCoord"?: number;
  "extensions"?: any;
  "extras"?: any;
  [k: string]: any;
}
/**
 * A set of parameter values that are used to define the metallic-roughness material model from Physically-Based Rendering (PBR) methodology.
 */
export interface GLTF_ORIGINAL_MaterialPbrMetallicRoughness {
  /**
   * The material's base color factor.
   */
  "baseColorFactor"?: number[];
  /**
   * The base color texture.
   */
  "baseColorTexture"?: GLTF_ORIGINAL_TextureInfo;
  /**
   * The metalness of the material.
   */
  "metallicFactor"?: number;
  /**
   * The roughness of the material.
   */
  "roughnessFactor"?: number;
  /**
   * The metallic-roughness texture.
   */
  "metallicRoughnessTexture"?: GLTF_ORIGINAL_TextureInfo;
  "extensions"?: any;
  "extras"?: any;
  [k: string]: any;
}
export interface GLTF_ORIGINAL_MaterialNormalTextureInfo {
  "index"?: any;
  "texCoord"?: any;
  /**
   * The scalar multiplier applied to each normal vector of the normal texture.
   */
  "scale"?: number;
  "extensions"?: any;
  "extras"?: any;
  [k: string]: any;
}
export interface GLTF_ORIGINAL_MaterialOcclusionTextureInfo {
  "index"?: any;
  "texCoord"?: any;
  /**
   * A scalar multiplier controlling the amount of occlusion applied.
   */
  "strength"?: number;
  "extensions"?: any;
  "extras"?: any;
  [k: string]: any;
}
/**
 * The material appearance of a primitive.
 */
export interface GLTF_ORIGINAL_Material {
  "name"?: any;
  "extensions"?: any;
  "extras"?: any;
  /**
   * A set of parameter values that are used to define the metallic-roughness material model from Physically-Based Rendering (PBR) methodology. When not specified, all the default values of `pbrMetallicRoughness` apply.
   */
  "pbrMetallicRoughness"?: GLTF_ORIGINAL_MaterialPbrMetallicRoughness;
  /**
   * The normal map texture.
   */
  "normalTexture"?: GLTF_ORIGINAL_MaterialNormalTextureInfo;
  /**
   * The occlusion map texture.
   */
  "occlusionTexture"?: GLTF_ORIGINAL_MaterialOcclusionTextureInfo;
  /**
   * The emissive map texture.
   */
  "emissiveTexture"?: GLTF_ORIGINAL_TextureInfo;
  /**
   * The emissive color of the material.
   */
  "emissiveFactor"?: number[];
  /**
   * The alpha rendering mode of the material.
   */
  "alphaMode"?: "OPAQUE" | "MASK" | "BLEND" | string;
  /**
   * The alpha cutoff value of the material.
   */
  "alphaCutoff"?: number;
  /**
   * Specifies whether the material is double sided.
   */
  "doubleSided"?: boolean;
  [k: string]: any;
}
/**
 * Geometry to be rendered with the given material.
 */
export interface GLTF_ORIGINAL_MeshPrimitive {
  /**
   * A dictionary object, where each key corresponds to mesh attribute semantic and each value is the index of the accessor containing attribute's data.
   */
  "attributes": {
    [k: string]: GlTfId;
  };
  /**
   * The index of the accessor that contains the indices.
   */
  "indices"?: GlTfId;
  /**
   * The index of the material to apply to this primitive when rendering.
   */
  "material"?: GlTfId;
  /**
   * The type of primitives to render.
   */
  "mode"?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | number;
  /**
   * An array of Morph Targets, each  Morph Target is a dictionary mapping attributes (only `POSITION`, `NORMAL`, and `TANGENT` supported) to their deviations in the Morph Target.
   */
  "targets"?: {
    [k: string]: GlTfId;
  }[];
  "extensions"?: any;
  "extras"?: any;
  [k: string]: any;
}
/**
 * A set of primitives to be rendered.  A node can contain one mesh.  A node's transform places the mesh in the scene.
 */
export interface GLTF_ORIGINAL_Mesh {
  /**
   * An array of primitives, each defining geometry to be rendered with a material.
   */
  "primitives": GLTF_ORIGINAL_MeshPrimitive[];
  /**
   * Array of weights to be applied to the Morph Targets.
   */
  "weights"?: number[];
  "name"?: any;
  "extensions"?: any;
  "extras"?: any;
  [k: string]: any;
}
/**
 * A node in the node hierarchy.  When the node contains `skin`, all `mesh.primitives` must contain `JOINTS_0` and `WEIGHTS_0` attributes.  A node can have either a `matrix` or any combination of `translation`/`rotation`/`scale` (TRS) properties. TRS properties are converted to matrices and postmultiplied in the `T * R * S` order to compose the transformation matrix; first the scale is applied to the vertices, then the rotation, and then the translation. If none are provided, the transform is the identity. When a node is targeted for animation (referenced by an animation.channel.target), only TRS properties may be present; `matrix` will not be present.
 */
export interface GLTF_ORIGINAL_Node {
  /**
   * The index of the camera referenced by this node.
   */
  "camera"?: GlTfId;
  /**
   * The indices of this node's children.
   */
  "children"?: GlTfId[];
  /**
   * The index of the skin referenced by this node.
   */
  "skin"?: GlTfId;
  /**
   * A floating-point 4x4 transformation matrix stored in column-major order.
   */
  "matrix"?: number[];
  /**
   * The index of the mesh in this node.
   */
  "mesh"?: GlTfId;
  /**
   * The node's unit quaternion rotation in the order (x, y, z, w), where w is the scalar.
   */
  "rotation"?: number[];
  /**
   * The node's non-uniform scale, given as the scaling factors along the x, y, and z axes.
   */
  "scale"?: number[];
  /**
   * The node's translation along the x, y, and z axes.
   */
  "translation"?: number[];
  /**
   * The weights of the instantiated Morph Target. Number of elements must match number of Morph Targets of used mesh.
   */
  "weights"?: number[];
  "name"?: any;
  "extensions"?: any;
  "extras"?: any;
  [k: string]: any;
}
/**
 * Texture sampler properties for filtering and wrapping modes.
 */
export interface GLTF_ORIGINAL_Sampler {
  /**
   * Magnification filter.
   */
  "magFilter"?: 9728 | 9729 | number;
  /**
   * Minification filter.
   */
  "minFilter"?: 9728 | 9729 | 9984 | 9985 | 9986 | 9987 | number;
  /**
   * s wrapping mode.
   */
  "wrapS"?: 33071 | 33648 | 10497 | number;
  /**
   * t wrapping mode.
   */
  "wrapT"?: 33071 | 33648 | 10497 | number;
  "name"?: any;
  "extensions"?: any;
  "extras"?: any;
  [k: string]: any;
}
/**
 * The root nodes of a scene.
 */
export interface GLTF_ORIGINAL_Scene {
  /**
   * The indices of each root node.
   */
  "nodes"?: GlTfId[];
  "name"?: any;
  "extensions"?: any;
  "extras"?: any;
  [k: string]: any;
}
/**
 * Joints and matrices defining a skin.
 */
export interface GLTF_ORIGINAL_Skin {
  /**
   * The index of the accessor containing the floating-point 4x4 inverse-bind matrices.  The default is that each matrix is a 4x4 identity matrix, which implies that inverse-bind matrices were pre-applied.
   */
  "inverseBindMatrices"?: GlTfId;
  /**
   * The index of the node used as a skeleton root. When undefined, joints transforms resolve to scene root.
   */
  "skeleton"?: GlTfId;
  /**
   * Indices of skeleton nodes, used as joints in this skin.
   */
  "joints": GlTfId[];
  "name"?: any;
  "extensions"?: any;
  "extras"?: any;
  [k: string]: any;
}
/**
 * A texture and its sampler.
 */
export interface GLTF_ORIGINAL_Texture {
  /**
   * The index of the sampler used by this texture. When undefined, a sampler with repeat wrapping and auto filtering should be used.
   */
  "sampler"?: GlTfId;
  /**
   * The index of the image used by this texture.
   */
  "source"?: GlTfId;
  "name"?: any;
  "extensions"?: any;
  "extras"?: any;
  [k: string]: any;
}
/**
 * The root object for a glTF asset.
 */
export interface GLTF_ORIGINAL {
  /**
   * Names of glTF extensions used somewhere in this asset.
   */
  "extensionsUsed"?: string[];
  /**
   * Names of glTF extensions required to properly load this asset.
   */
  "extensionsRequired"?: string[];
  /**
   * An array of accessors.
   */
  "accessors"?: GLTF_ORIGINAL_Accessor[];
  /**
   * An array of keyframe animations.
   */
  "animations"?: GLTF_ORIGINAL_Animation[];
  /**
   * Metadata about the glTF asset.
   */
  "asset": GLTF_ORIGINAL_Asset;
  /**
   * An array of buffers.
   */
  "buffers"?: GLTF_ORIGINAL_Buffer[];
  /**
   * An array of bufferViews.
   */
  "bufferViews"?: GLTF_ORIGINAL_BufferView[];
  /**
   * An array of cameras.
   */
  "cameras"?: GLTF_ORIGINAL_Camera[];
  /**
   * An array of images.
   */
  "images"?: GLTF_ORIGINAL_Image[];
  /**
   * An array of materials.
   */
  "materials"?: GLTF_ORIGINAL_Material[];
  /**
   * An array of meshes.
   */
  "meshes"?: GLTF_ORIGINAL_Mesh[];
  /**
   * An array of nodes.
   */
  "nodes"?: GLTF_ORIGINAL_Node[];
  /**
   * An array of samplers.
   */
  "samplers"?: GLTF_ORIGINAL_Sampler[];
  /**
   * The index of the default scene.
   */
  "scene"?: GlTfId;
  /**
   * An array of scenes.
   */
  "scenes"?: GLTF_ORIGINAL_Scene[];
  /**
   * An array of skins.
   */
  "skins"?: GLTF_ORIGINAL_Skin[];
  /**
   * An array of textures.
   */
  "textures"?: GLTF_ORIGINAL_Texture[];
  "extensions"?: any;
  "extras"?: any;
  [k: string]: any;
}



