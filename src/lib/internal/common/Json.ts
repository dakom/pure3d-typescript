import {TextDecoder} from "text-encoding-shim";


export const getJsonFromArrayBuffer = (aBuffer:ArrayBuffer) => {
  const str = new TextDecoder('utf-8').decode(new Uint8Array(aBuffer));
  //console.log(str);

  return JSON.parse(str);
}
