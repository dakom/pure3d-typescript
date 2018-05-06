
import { GLTF_ORIGINAL } from "../../../Types";
import {getJsonFromArrayBuffer} from "../../common/Json";

const getHeader = (aBuffer:ArrayBuffer) => {
  const dv = new DataView(aBuffer, 0, 12);
  return {
    magic: dv.getUint32(0, true),
    version: dv.getUint32(4, true),
    length: dv.getUint32(8, true)
  }
}


const getChunk = (offset:number) => (aBuffer:ArrayBuffer): [GLTF_ORIGINAL | ArrayBuffer, number] => {
  const dv = new DataView(aBuffer, offset, 8);
  const chunkLength = dv.getUint32(0, true);
  const chunkType = dv.getUint32(4, true);
  const chunkStart = offset + 8;
  const chunkEnd = chunkStart + chunkLength;
  const chunkData = aBuffer.slice(chunkStart, chunkEnd);

  const result = [
    (chunkType === 0x4E4F534A)
      ? getJsonFromArrayBuffer(chunkData)
      : (chunkType === 0x004E4942)
        ? chunkData
        : null, 
    chunkEnd
  ] as [GLTF_ORIGINAL | ArrayBuffer, number];

  if(result[0] === null) {
    console.log(`unknown chunk type: ${chunkType}`);
  }

  return result;
}

const asGlb = (aBuffer:ArrayBuffer) => {
  

  const [gltf, gltfEndOffset] = getChunk(12) (aBuffer) as [GLTF_ORIGINAL, number];
  const buffers = new Array<ArrayBuffer>();

  let offset = gltfEndOffset;
  
  while(offset < aBuffer.byteLength) {
    const [bin, endOffset] = getChunk(offset) (aBuffer) as [ArrayBuffer, number];
    if(bin !== null) {
      buffers.push(bin);
    }

    offset += endOffset;
  }


  return {gltf, glbBuffers: buffers};
}



const GLTF_PARSE_isBinaryFile = (aBuffer:ArrayBuffer):boolean => 
  getHeader(aBuffer).magic === 0x46546C67;
  
export const GLTF_PARSE_getOriginalFromArrayBuffer = (aBuffer:ArrayBuffer) => 
  GLTF_PARSE_isBinaryFile (aBuffer)
    ?   asGlb(aBuffer)
    :   {gltf: getJsonFromArrayBuffer(aBuffer), glbBuffers: []};

