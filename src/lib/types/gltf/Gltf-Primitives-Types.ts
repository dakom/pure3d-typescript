import {WebGlShader, GltfMaterial, GltfShaderConfig} from "../../Types";

export enum GltfPrimitiveDrawKind {
	ELEMENTS = 1, //"elements" in original
	ARRAY = 2, //"array" in original
}
export type GltfPrimitive = (GltfPrimitiveElementsDraw | GltfPrimitiveArrayDraw) & {
        shaderConfig: GltfShaderConfig;
        shaderKey: string;
        vaoId: number;
	drawMode: number;
	material?: GltfMaterial;
        originalMeshId: number;
        originalPrimitiveId: number;
};

export interface GltfPrimitiveElementsDraw {
	elementsId: number;
	drawKind: GltfPrimitiveDrawKind.ELEMENTS;
}

export interface GltfPrimitiveArrayDraw {
	arrayCount: number;
	drawKind: GltfPrimitiveDrawKind.ARRAY;
}
