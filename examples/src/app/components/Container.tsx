import * as React from "react";
import {S, Maybe} from "utils/Sanctuary";
import {startBox} from "../scenes/basic/box/Box-Demo";
import {startQuad} from "../scenes/basic/quad/Quad-Demo";
import {startCombinedTextures} from "../scenes/basic/combined-textures/CombinedTextures-Demo";
import {startSpriteSheet} from "../scenes/basic/spritesheet/Spritesheet-Demo";
import {startVideo} from "../scenes/basic/video/Video-Demo";
import {startGltf} from "../scenes/gltf/Gltf-Demo-Scene";
import {startDualGltf} from "../scenes/complex/scenes/dual-gltf/DualGltf";
import {startLightingPunctual} from "../scenes/complex/scenes/lighting-punctual/LightingPunctual";
import {Future} from "fluture";
import {WEBGL_DEV_ASSET_PATH, WEBGL_PRODUCTION_ASSET_PATH, GLTF_DEV_ASSET_PATH, GLTF_PRODUCTION_ASSET_PATH} from "utils/Path";
import {isProduction} from "../App-Main";
import {WebGlRenderer} from "lib/Lib";
import {disposeRenderer, createRenderer} from "utils/renderer/ExampleRenderer";
import {getModel} from "../scenes/gltf/Gltf-Models";

const _loadScene = ({renderer, section, scene, menuOptions, onMenuChange}
    :{renderer:WebGlRenderer, scene:string, section:string, menuOptions: any, onMenuChange: any})
    :Future<any,Maybe<[(frameTs:number) => void, () => void]>> => {
   
    const mapReturn = xf => 
        Array.isArray(xf) ? S.Just(xf) : S.Just([xf, () => {}]);

    const basicPath = !isProduction ? WEBGL_DEV_ASSET_PATH : WEBGL_PRODUCTION_ASSET_PATH;
    const gltfPath = !isProduction ? GLTF_DEV_ASSET_PATH : GLTF_PRODUCTION_ASSET_PATH;

    if(section === "basic") {
        switch(scene) {
            case "BOX_BASIC": return startBox(renderer) ("basic").map(mapReturn);
            case "BOX_VAO": return startBox (renderer) ("vao").map(mapReturn);
            case "QUAD":    return startQuad (renderer) (basicPath).map(mapReturn); 
            case "TEXTURES_COMBINED": return startCombinedTextures (renderer).map(mapReturn);
            case "SPRITESHEET": return startSpriteSheet (renderer) (basicPath).map(mapReturn);
            case "VIDEO_QUAD": return startVideo (renderer) (basicPath).map(mapReturn); 
        }
    } else if(section === "gltf") {
        const modelInfo = getModel(scene);
        if(modelInfo) {
            return startGltf(renderer) ({
                modelPath: gltfPath + modelInfo.url,
                modelInfo,
                menuOptions: menuOptions.gltf,
                onMenuChange
            }).map(mapReturn);
        }
    } else if(section === "complex") {
        switch(scene) {
            case "DUAL_GLTF":
                return startDualGltf (renderer) ({basicPath, gltfPath}).map(mapReturn);
            case "LIGHTING_PUNCTUAL":
                return startLightingPunctual (renderer) ({basicPath, gltfPath}).map(mapReturn);
        }

    }

    return Future.of(S.Nothing);
}

export class Container extends React.Component<{section: string, scene:string, menuOptions:any, onMenuChange: any}, {isLoading: boolean}> {
    private canvasRef:React.RefObject<HTMLCanvasElement>; 
    private mThunk:Maybe<(ts:number) => void>
    private mTick:Maybe<number>;
    private mCleanup:Maybe<() => void>;

    constructor(props) {
        super(props);
        this.canvasRef = React.createRef();
        this.mThunk = S.Nothing;
        this.mTick = S.Nothing;
        this.mCleanup = S.Nothing;

        this.animateScene = this.animateScene.bind(this);
        this.disposeScene = this.disposeScene.bind(this);
        this.loadScene = this.loadScene.bind(this);

        this.state = {isLoading: false};
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const objEquals = a => b => {
            const kA = Object.keys(a);
            const kB = Object.keys(b);

            if(kA.length !== kB.length) {
                return false;
            }

            return kA.every(value => (kB.indexOf(value) !== -1 && a[value] === b[value]) ? true : false);
        }
        if( this.props.scene !== prevProps.scene 
            || this.props.section !== prevProps.section
            || !objEquals(this.props.menuOptions) (prevProps.menuOptions)
        ) {
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
        S.map(cleanup => cleanup()) (this.mCleanup);
        S.map(nTick => cancelAnimationFrame(nTick)) (this.mTick);

        this.mTick = S.Nothing;
        this.mThunk = S.Nothing;
        this.mCleanup = S.Nothing;
        disposeRenderer();
    }

    loadScene() {

        this.disposeScene();

        this.setState({isLoading: true});

        const renderer = createRenderer({
            canvas: this.canvasRef.current,
            version: 1
        });
    
        const {scene, section, menuOptions, onMenuChange} = this.props;
        _loadScene({
            renderer,
            section,
            scene,
            menuOptions,
            onMenuChange
        }).fork(console.error, (mFuncs) => {
            this.setState({isLoading: false});
            this.mThunk = S.map(funcs => funcs[0]) (mFuncs);
            this.mCleanup = S.map(funcs => funcs[1]) (mFuncs); 
            this.mTick = S.map(() => requestAnimationFrame(this.animateScene)) (mFuncs);
        });
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
