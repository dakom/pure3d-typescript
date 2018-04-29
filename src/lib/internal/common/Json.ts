import * as TE_PolyFill from "text-encoding";

export const getJsonFromArrayBuffer = (aBuffer:ArrayBuffer) => {
  const str = new TE_PolyFill.TextDecoder().decode(aBuffer);
  //console.log(str);

  return JSON.parse(str);
}