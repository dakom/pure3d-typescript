import {WebGlConstants} from "../../Types";

export const getVersionString = (gl:WebGLRenderingContext):string => 
  gl.getParameter(WebGlConstants.VERSION);

const _isNumber = (chr:string):boolean => {
  switch(chr) {
    case '0':
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case '7':
    case '8':
    case '9':
      return true;
  }

  return false;
}

export const getMajorVersion = (gl:WebGLRenderingContext):number => {
  const str = getVersionString(gl);
  let numberString = '';

  for(let i = 0; i < str.length; i++) {
    const chr = str.charAt(i);
    if(_isNumber(chr)) {
      numberString += chr;
    } else {
      if(numberString.length) {
        break;
      }
    }
    
  }

  return parseInt(numberString, 10);
}
