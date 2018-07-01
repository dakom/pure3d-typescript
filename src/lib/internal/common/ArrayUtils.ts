import {NumberArray} from "../../Types";

//Spread doesn't work right now with typed arrays
export const pushNumbersToArray = (src:NumberArray) => (dest:Array<number>) => {
    for(let i = 0; i < src.length; i++) {
        dest.push(src[i]);
    }
}


export const setNumbersOnArrayFrom = (src:NumberArray) => (offset:number) => (dest:NumberArray) => {
    for(let i = 0; i < src.length; i++) {
        dest[i + offset] = src[i];
    }
}
