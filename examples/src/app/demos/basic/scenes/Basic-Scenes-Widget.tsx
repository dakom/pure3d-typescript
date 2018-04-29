import * as React from "react";
import {sScene} from "./Basic-Scenes-FRP";
import {S, Maybe} from "utils/Sanctuary";
import {startBox} from "./box/Box-Demo";
import {startQuad} from "./quad/Quad-Demo";
import {startCombinedTextures} from "./combined-textures/CombinedTextures-Demo";
import {startSpriteSheet} from "./spritesheet/Spritesheet-Demo";
import {startVideo} from "./video/Video-Demo";
import {Future} from "fluture";
import {WEBGL_DEV_ASSET_PATH, WEBGL_PRODUCTION_ASSET_PATH} from "utils/Path";
import {isProduction} from "../../../App-Main";

const _loadScene = (sceneName:string):Future<any,Maybe<() => void>> => {
    const path = !isProduction ? WEBGL_DEV_ASSET_PATH : WEBGL_PRODUCTION_ASSET_PATH;
    
    switch(sceneName) {
        case "BOX_BASIC": return startBox("basic").map(S.Just);
        case "BOX_VAO": return startBox("vao").map(S.Just);
        case "QUAD":    return startQuad(path).map(S.Just); 
        case "TEXTURES_COMBINED": return startCombinedTextures().map(S.Just);
        case "SPRITESHEET": return startSpriteSheet(path).map(S.Just);
        case "VIDEO_QUAD": return startVideo(path).map(S.Just); 
        default: return Future.of(S.Nothing);
    }
}

export class SceneWidget extends React.Component<{sceneName:string}, {}> {

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(this.props.sceneName !== prevProps.sceneName) {
            this.loadScene();
        }
    }
    componentDidMount() {
        this.loadScene();
    }


    loadScene() {
        _loadScene(this.props.sceneName).fork(console.error, mThunk => sScene.send(mThunk));
    }

    componentWillUnmount() {
        sScene.send(S.Nothing);
    }

    render() {
        return null;
    }
}
