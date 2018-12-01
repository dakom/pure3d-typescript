import {  WebGlConstants, WebGlRenderer, WebGlBufferData, WebGlBufferInfo } from '../../../Types';
import {createTextureFromTarget} from "../../../exports/webgl/WebGl-Textures";
import { WebGlVertexArrayData, WebGlAttributeActivateOptions,GLTF_ORIGINAL, GLTF_ORIGINAL_Sampler } from '../../../Types';


const getColorSpaceForTextureId = ({ renderer, gltf, textureId }: { renderer: WebGlRenderer, gltf: GLTF_ORIGINAL, textureId: number }): number => {
    const defaultColorSpace = WebGlConstants.RGBA;
    const SRGBA = 0x8C42; //SRGB_ALPHA_EXT ... not in type definitions yet and might vary by renderer.version
    const SRGB = 0x8C40; //SRGB_ALPHA_EXT ... not in type definitions yet and might vary by renderer.version
    for (let i = 0; i < gltf.materials.length; i++) {
        const material = gltf.materials[i];
        if (material.emissiveTexture && material.emissiveTexture.index === textureId) {
            return SRGBA;
        }

        if (material.normalTexture && material.normalTexture.index === textureId) {
            return WebGlConstants.RGBA;

        }

        if (material.occlusionTexture && material.occlusionTexture.index === textureId) {
            return WebGlConstants.RGBA;
        }
        if (material.pbrMetallicRoughness) {
            if (material.pbrMetallicRoughness.baseColorTexture && material.pbrMetallicRoughness.baseColorTexture.index === textureId) {
                return SRGBA;
            }

            if (material.pbrMetallicRoughness.metallicRoughnessTexture && material.pbrMetallicRoughness.metallicRoughnessTexture.index === textureId) {
                return WebGlConstants.RGBA;
            }
        }
    }

    return defaultColorSpace;
}

const requiresPowerOf2 = ({wrapS, wrapT, filterMin, filterMag, sampler}):boolean => 
    (wrapS === WebGlConstants.REPEAT || wrapS === WebGlConstants.MIRRORED_REPEAT || wrapT === WebGlConstants.REPEAT || wrapT === WebGlConstants.MIRRORED_REPEAT)
    || (filterMin === WebGlConstants.NEAREST_MIPMAP_NEAREST || filterMin === WebGlConstants.NEAREST_MIPMAP_LINEAR || filterMin === WebGlConstants.LINEAR_MIPMAP_NEAREST || filterMin === WebGlConstants.LINEAR_MIPMAP_LINEAR)  

const isPowerOf2 = (img:HTMLImageElement):boolean => {
    const check = (value:number):boolean => (value & (value - 1)) == 0;
    return check(img.naturalWidth) && check(img.naturalHeight);
}

const nextHighestPowerOfTwo = (x:number):number => {
    --x;
    for (var i = 1; i < 32; i <<= 1) {
        x = x | x >> i;
    }
    return x + 1;
}

const resizeImageToNextPowerOf2 = (img:HTMLImageElement):HTMLCanvasElement => {
    const canvas = document.createElement("canvas");
    canvas.width = nextHighestPowerOfTwo(img.width);
    canvas.height = nextHighestPowerOfTwo(img.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height); //use img.width/height if not scaling
    return canvas; 
}

const defaultSampler = {
    filterMin: WebGlConstants.LINEAR,
    filterMag: WebGlConstants.LINEAR,
    wrapS: WebGlConstants.REPEAT,
    wrapT: WebGlConstants.REPEAT
};

export const GLTF_PARSE_createTextures = ({ renderer, gltf, imageElements }: { renderer: WebGlRenderer, gltf: GLTF_ORIGINAL, imageElements: Array<HTMLImageElement> }): Map<number, WebGLTexture> => {
    const textureMap = new Map<number, WebGLTexture>();
    const { gl } = renderer;

    if (gltf.textures) {
        gltf.textures.forEach((texture, textureId) => {


            const sampler:GLTF_ORIGINAL_Sampler = Object.assign({}, defaultSampler, texture.sampler === undefined ? undefined : gltf.samplers[texture.sampler]);
            const colorSpace = getColorSpaceForTextureId({ renderer, gltf, textureId });
            const img = imageElements[texture.source];
            
            const {wrapS, wrapT, filterMin, filterMag} = sampler;
         
           
            const display = (requiresPowerOf2({wrapS, wrapT, filterMin, filterMag, sampler}) && !isPowerOf2(img))
                ?   resizeImageToNextPowerOf2(img)
                :   img;

            const wTexture = createTextureFromTarget
            ({
                gl,
                format: colorSpace,
                setParameters: () => {
                    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false as any); // https://github.com/Microsoft/TypeScript/issues/27542
                    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
                    gl.texParameteri(WebGlConstants.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
                    gl.texParameteri(WebGlConstants.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);
                    gl.texParameteri(WebGlConstants.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filterMin);
                    gl.texParameteri(WebGlConstants.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filterMag);
                }
            })
            (display);

            textureMap.set(textureId, wTexture);
        });
    }

    return textureMap;
}
