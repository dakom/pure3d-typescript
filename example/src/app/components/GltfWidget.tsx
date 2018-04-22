import {GltfIblLight, getDefaultIblLight, loadGltfBridge } from 'lib/Lib';
import * as React from 'react';

import { ModelContext } from '../App-Main';
import { sBridge } from '../frp/Bridge-FRP';
import { renderer } from '../renderer/DemoRenderer';
import { LoadingGraphic } from './LoadingGraphic';
import {getModel, ModelInfo} from "../models/Models";
import {S, Maybe} from "../utils/Sanctuary";
import { getCameraOrbit, getCameraLook} from '../utils/Camera';

const PRODUCTION_ASSET_PATH = "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/";
const DEV_ASSET_PATH = "http://localhost:4101/";

class GltfDisplay extends React.Component<{path:string, modelInfo:ModelInfo}, {error?:any, isLoaded: boolean}> {
    constructor(props) {
        super(props);
        this.state = {isLoaded: false}

        this.startLoad = this.startLoad.bind(this);

    }

    startLoad() {
        const {model} = this.props.modelInfo;

        const cameraPosition = model.cameraPosition !== undefined ? model.cameraPosition : [0,0,4];

        if(model.cameraIndex !== undefined) {
            throw new Error("need to re-implement getting camera from gltf");
        }

        const ibl:GltfIblLight = getDefaultIblLight(Float32Array.from(cameraPosition));
        
        const camera = model.cameraIndex !== undefined 
            ? model.cameraIndex 
            : model.cameraPosition !== undefined || model.cameraLookAt !== undefined 
            ?   getCameraLook([
                cameraPosition, 
                model.cameraLookAt !== undefined ? model.cameraLookAt : [0,0,0],
            ])
            :   getCameraOrbit({yaw: 0, pitch: 0, roll: 0, translate: 4})

        this.setState({isLoaded: false}, () => {
            loadGltfBridge({
                renderer, 
                environmentPath: "static/world/world.json", 
                gltfPath: this.props.path, 
                config: { }
            })
                .fork(
                    error => {
                        console.warn(error);
                        this.setState({error})
                    },
                    bridge => {
                        this.setState({isLoaded: true});
                        sBridge.send(S.Just( {bridge, camera, ibl}));
                    }
                );
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.modelInfo !== this.props.modelInfo &&
            prevProps.modelInfo.url !== this.props.modelInfo.url) {
            this.startLoad();
        }
    }

    componentDidMount() {
        this.startLoad();
    }

    render() {
        return (
            <div>
            {this.state.error &&
                <div><h1>Error!</h1></div>
            }
            {(!this.state.error && !this.state.isLoaded) &&
                    <LoadingGraphic />
            }
            </div>
        )

    }
}

export const GltfWidget = () => (
    <ModelContext.Consumer>
    {({modelInfo, changeModel, isProductionBuild}) => {
        const assetPath = isProductionBuild ? PRODUCTION_ASSET_PATH : DEV_ASSET_PATH;

        if(modelInfo) {
            console.log(modelInfo.url);
        }
        return !modelInfo 
            ? null
            : <GltfDisplay modelInfo={modelInfo} path={assetPath + modelInfo.url} />
    }}
    </ModelContext.Consumer>
)
