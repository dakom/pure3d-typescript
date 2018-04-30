
import * as React from "react";
import {S, Maybe} from "utils/Sanctuary";
import {startBox} from "../scenes/basic/box/Box-Demo";
import {startQuad} from "../scenes/basic/quad/Quad-Demo";
import {startCombinedTextures} from "../scenes/basic/combined-textures/CombinedTextures-Demo";
import {startSpriteSheet} from "../scenes/basic/spritesheet/Spritesheet-Demo";
import {startVideo} from "../scenes/basic/video/Video-Demo";
import {startGltf} from "../scenes/gltf/Gltf-Scene";
import {Future} from "fluture";
import {WEBGL_DEV_ASSET_PATH, WEBGL_PRODUCTION_ASSET_PATH, GLTF_DEV_ASSET_PATH, GLTF_PRODUCTION_ASSET_PATH} from "utils/Path";
import {isProduction} from "../App-Main";
import {WebGlRenderer} from "lib/Lib";
import {disposeRenderer, createRenderer} from "utils/renderer/ExampleRenderer";
import {getModel} from "../scenes/gltf/Gltf-Models";
import {
    PointerEventStatus,
    PointerScreenEventData,
    startPointer,
    startTick,
    startTickPointer,
    TickEventData,
    TickPointerScreenEventData,
} from 'input-senders';

const _loadScene = ({renderer, section, scene}:{renderer:WebGlRenderer, scene:string, section:string}):Future<any,Maybe<(frameTs:number) => void>> => {
    
    if(section === "basic") {
        const path = !isProduction ? WEBGL_DEV_ASSET_PATH : WEBGL_PRODUCTION_ASSET_PATH;
        switch(scene) {
            case "BOX_BASIC": return startBox(renderer) ("basic").map(S.Just);
            case "BOX_VAO": return startBox (renderer) ("vao").map(S.Just);
            case "QUAD":    return startQuad (renderer) (path).map(S.Just); 
            case "TEXTURES_COMBINED": return startCombinedTextures (renderer).map(S.Just);
            case "SPRITESHEET": return startSpriteSheet (renderer) (path).map(S.Just);
            case "VIDEO_QUAD": return startVideo (renderer) (path).map(S.Just); 
        }
    } else {
        const path = !isProduction ? GLTF_DEV_ASSET_PATH : GLTF_PRODUCTION_ASSET_PATH;
        const modelInfo = getModel(scene);
        const modelPath = path + modelInfo.url;
        return startGltf(renderer) (modelPath) (modelInfo).map(S.Just);
    }

    return Future.of(S.Nothing);
}

export class Container extends React.Component<{section: string, scene:string}, {isLoading: boolean}> {
    private canvasRef:React.RefObject<HTMLCanvasElement>; 
    private mThunk:Maybe<(ts:number) => void>
    private mTick:Maybe<number>;
    private mStopInput: Maybe<() => void>;

    constructor(props) {
        super(props);
        this.canvasRef = React.createRef();
        this.mThunk = S.Nothing;
        this.mTick = S.Nothing;
        this.mStopInput = S.Nothing;

        this.animateScene = this.animateScene.bind(this);
        this.disposeScene = this.disposeScene.bind(this);
        this.loadScene = this.loadScene.bind(this);
        this.startInput = this.startInput.bind(this);

        this.state = {isLoading: false};
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(this.props.scene !== prevProps.scene || this.props.section !== prevProps.section) {
            this.loadScene();
        }
    }
    componentDidMount() {
        this.loadScene();
    }
    componentWillUnmount() {
        this.disposeScene();

    }

    animateScene(frameTs:number) {
        this.mTick = S.map(thunk => {
            thunk(frameTs); 
            return requestAnimationFrame(this.animateScene);
        }) (this.mThunk);
    }

    disposeScene() {
        S.map(nTick => cancelAnimationFrame(nTick)) (this.mTick);
        S.map(stopInput => stopInput()) (this.mStopInput);

        this.mTick = S.Nothing;
        this.mThunk = S.Nothing;
        this.mStopInput = S.Nothing;
        disposeRenderer();
    }

    loadScene() {

        this.disposeScene();

        this.setState({isLoading: true});

        const renderer = createRenderer({
            canvas: this.canvasRef.current,
            version: 1
        });
    
        const {scene, section} = this.props;
        _loadScene({
            renderer,
            section,
            scene
        }).fork(console.error, mThunk => {
            this.setState({isLoading: false});
            this.mThunk = mThunk;
            this.mTick = S.map(() => requestAnimationFrame(this.animateScene)) (mThunk);
            this.mStopInput= S.map(this.startInput) (mThunk);
        });
    }

    startInput() {
        const hasPointer = (window as any).PointerEvent ? true : false;
        const stoppers = [];
        const domElement = this.canvasRef.current;

        stoppers.push(
            startPointer
            ({
                domElement,
                hasPointer,
                status: PointerEventStatus.START,
            })
            (({ data }) => {})
        );

        stoppers.push(
            startTickPointer
            ({
                domElement,
                hasPointer,
                status: PointerEventStatus.MOVE,
            })
            (({ data }) => {})
        );

        stoppers.push(
            startPointer
            ({
                domElement,
                hasPointer,
                status: PointerEventStatus.END,
            })
            (({ data }) => {})
        );

        stoppers.push(
            startTick
            ({})
            (({data}) => {})
        );

        return () => stoppers.forEach(fn => fn());
    }

    render() {
        return (
            <React.Fragment>
                <canvas ref={this.canvasRef}/>
                {this.state.isLoading &&
                    <h1>Loading...</h1>
                }
            </React.Fragment>
        )
    }
}
