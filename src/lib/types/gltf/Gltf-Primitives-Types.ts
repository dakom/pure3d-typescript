import {WebGlShader, GltfMaterial, GltfShaderKind} from "../../Types";

export enum GltfPrimitiveDrawKind {
	ELEMENTS = 1, //"elements" in original
	ARRAY = 2, //"array" in original
}
export type GltfPrimitive = (GltfPrimitiveElementsDraw | GltfPrimitiveArrayDraw) & {
        shaderId: number;
	vaoId: number;
	drawMode: number;
	material?: GltfMaterial;
	shaderKind: GltfShaderKind
};

export interface GltfPrimitiveElementsDraw {
	elementsId: number;
	drawKind: GltfPrimitiveDrawKind.ELEMENTS;
}

export interface GltfPrimitiveArrayDraw {
	arrayCount: number;
	drawKind: GltfPrimitiveDrawKind.ARRAY;
}
