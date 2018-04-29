import {Maybe, S} from "utils/Sanctuary";
import {StreamSink} from "sodiumjs";
import {disposeRenderer} from "utils/renderer/ExampleRenderer";

let animationTick = null;
let thunk = null;

export const sScene = new StreamSink<Maybe<() => void>>();

export const cleanup = () => {
    if(animationTick !== null) {
        cancelAnimationFrame(animationTick);
        animationTick = null;
    }

       
    thunk = null;
   
}


sScene.filter(S.isJust).listen(S.map(newThunk => {
    cleanup();

    thunk = frameTs => {
        if(thunk) {
            newThunk(frameTs);
            requestAnimationFrame(thunk);
        }
    }

    requestAnimationFrame(thunk); 

}));

sScene.filter(S.isNothing).listen(() => {
    cleanup();
    disposeRenderer();
});
