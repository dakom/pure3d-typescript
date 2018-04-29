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
import {WebGlRenderer} from "lib/Lib";
import {createRenderer} from "utils/renderer/ExampleRenderer";

const _loadScene = ({renderer, sceneName}:{renderer:WebGlRenderer, sceneName:string}):Future<any,Maybe<() => void>> => {
    const path = !isProduction ? WEBGL_DEV_ASSET_PATH : WEBGL_PRODUCTION_ASSET_PATH;
    
    switch(sceneName) {
        case "BOX_BASIC": return startBox(renderer) ("basic").map(S.Just);
        case "BOX_VAO": return startBox (renderer) ("vao").map(S.Just);
        case "QUAD":    return startQuad (renderer) (path).map(S.Just); 
        case "TEXTURES_COMBINED": return startCombinedTextures (renderer).map(S.Just);
        case "SPRITESHEET": return startSpriteSheet (renderer) (path).map(S.Just);
        case "VIDEO_QUAD": return startVideo (renderer) (path).map(S.Just); 
        default: return Future.of(S.Nothing);
    }
}

export class SceneWidget extends React.Component<{sceneName:string}, {}> {
    private canvasRef:React.RefObject<HTMLCanvasElement>; 

    constructor(props) {
        super(props);
        this.canvasRef = React.createRef();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(this.props.sceneName !== prevProps.sceneName) {
            this.loadScene();
        }
    }
    componentDidMount() {
        this.loadScene();
    }
    componentWillUnmount() {
        sScene.send(S.Nothing);
    }

    loadScene() {

        //automatically disposes the previous one
        const renderer = createRenderer({
            canvas: this.canvasRef.current,
            version: 1
        });

        _loadScene({
            renderer,
            sceneName: this.props.sceneName
        }).fork(console.error, mThunk => sScene.send(mThunk));
    }

    render() {
        return <canvas ref={this.canvasRef}/>
    }
}
