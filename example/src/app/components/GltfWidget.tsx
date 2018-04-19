import { loadGltfBridge } from 'lib/Lib';
import * as React from 'react';

import { AppContext } from '../App-Main';
import { sBridge } from '../frp/Bridge-FRP';
import { renderer } from '../renderer/DemoRenderer';
import { LoadingGraphic } from './LoadingGraphic';
import { ModelContext,MODEL_URLS, MODEL_CAMERA_INDEX, MODEL_CAMERA_LOOKAT, MODEL_CAMERA_POSITIONS, MODEL_ENVIRONMENT_EMPTY } from '../models/Models';
import {S, Maybe} from "../utils/Sanctuary";
import { getCameraOrbit, getCameraLook} from '../utils/Camera';

const PRODUCTION_ASSET_PATH = "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/";
const DEV_ASSET_PATH = "http://localhost:4101/";

class GltfDisplay extends React.Component<{path:string, model:string}, {error?:any, isLoaded: boolean}> {
  constructor(props) {
    super(props);
    this.state = {isLoaded: false}

    this.startLoad = this.startLoad.bind(this);

  }

  startLoad() {
      const model = this.props.model;
      //const cameraPosition = MODEL_CAMERA_POSITIONS.has(model) ? MODEL_CAMERA_POSITIONS.get(model) : [0,0,4]
      const camera = MODEL_CAMERA_INDEX.has(model) 
          ? MODEL_CAMERA_INDEX.get(model) 
          : MODEL_CAMERA_POSITIONS.has(model) || MODEL_CAMERA_LOOKAT.has(model)
            ?   getCameraLook([
                    MODEL_CAMERA_POSITIONS.has(model) ?  MODEL_CAMERA_POSITIONS.get(model) : [0,0,4],
                    MODEL_CAMERA_LOOKAT.has(model) ?  MODEL_CAMERA_LOOKAT.get(model) : [0,0,0],
                ])
            :   getCameraOrbit({yaw: 0, pitch: 0, roll: 0, translate: 4})

    this.setState({isLoaded: false}, () => {
      loadGltfBridge({
        renderer, 
        environmentPath: MODEL_ENVIRONMENT_EMPTY.has(model) ? undefined : "static/world/world.json", 
        gltfPath: this.props.path, 
        config: {
            camera
        }
      })
      .fork(
        error => {
          console.warn(error);
          this.setState({error})
        },
        bridge => {
          this.setState({isLoaded: true});
          sBridge.send(S.Just( bridge));
        }
      );
    });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if(prevProps.model !== this.props.model || prevProps.path !== this.props.path) {
      this.startLoad();
    }
  }

  componentDidMount() {
    this.startLoad();
  }
  
  render() {
    const {path, model} = this.props;
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
  <div>
    <AppContext.Consumer>
    {({isProductionBuild, buildMode, buildVersion}) => (
      <ModelContext.Consumer>
        {({model, changeModel}) => {
          const assetPath = isProductionBuild ? PRODUCTION_ASSET_PATH : DEV_ASSET_PATH;

          const path = MODEL_URLS.has(model) ? MODEL_URLS.get(model) : null;

          const isNone = path === undefined || path === null || path === "";

          return isNone
            ? null
            : <GltfDisplay model={model} path={assetPath + path} />
        }}
      </ModelContext.Consumer>
    )}
    
    </AppContext.Consumer>
  </div>
)
