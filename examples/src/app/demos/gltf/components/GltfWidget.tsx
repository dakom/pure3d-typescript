import {GltfIblLight, getDefaultIblLight, loadGltfBridge } from 'lib/Lib';
import * as React from 'react';

import { sBridge } from '../frp/Bridge-FRP';
import { LoadingGraphic } from './LoadingGraphic';
import {renderer} from "utils/renderer/ExampleRenderer";
import {getModel, ModelInfo} from "../models/Models";
import {S, Maybe} from "utils/Sanctuary";
import { getCameraOrbit, getCameraOrbitPosition, getCameraLook} from 'utils/Camera';
import {GLTF_PRODUCTION_ASSET_PATH, GLTF_DEV_ASSET_PATH} from "utils/Path";
import {AppContext} from "../../../App-Main";

class GltfDisplay extends React.Component<{path:string, modelInfo:ModelInfo, modelName:string}, {error?:any, isLoaded: boolean}> {
    constructor(props) {
        super(props);
        this.state = {isLoaded: false}

        this.startLoad = this.startLoad.bind(this);

    }

    startLoad() {
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
                        sBridge.send(S.Just( {bridge, modelInfo: this.props.modelInfo}));
                    }
                );
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(this.props.modelName !== prevProps.modelName) {
            this.startLoad();
        }
    }

    componentDidMount() {
        this.startLoad();
    }

    
    componentWillUnmount() {
        sBridge.send(S.Nothing);
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

export const GltfWidget = ({modelInfo, modelName}:{modelInfo:ModelInfo, modelName:string}) => (
    <AppContext.Consumer>
    {({isProduction}) => {
        const assetPath = isProduction ? GLTF_PRODUCTION_ASSET_PATH : GLTF_DEV_ASSET_PATH;

        return !modelInfo ? null : <GltfDisplay modelInfo={modelInfo} path={assetPath + modelInfo.url} modelName={modelName} />
    }}
    </AppContext.Consumer>
)
