import { loadGltfBridge } from 'lib/Lib';
import * as React from 'react';

import { AppContext } from '../App-Main';
import { sBridge } from '../frp/Bridge-FRP';
import { renderer } from '../renderer/DemoRenderer';
import { LoadingGraphic } from './LoadingGraphic';
import { MODEL, ModelContext, MODEL_CAMERA_POSITIONS, MODEL_ENVIRONMENT_EMPTY } from './Models';
import {S, Maybe} from "../utils/Sanctuary";
import { getDefaultPerspectiveProjection } from '../utils/Camera';

const PRODUCTION_ASSET_PATH = "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/";
//TODO: link to local assets on production build too
//const PRODUCTION_ASSET_PATH = "https://raw.githubusercontent.com/dakom/pure3d/example/gltf-sample-models/2.0/";
const DEV_ASSET_PATH = "http://localhost:4101/";

class GltfDisplay extends React.Component<{path:string, model:MODEL}, {error?:any, isLoaded: boolean}> {
  constructor(props) {
    super(props);
    this.state = {isLoaded: false}

    this.startLoad = this.startLoad.bind(this);

  }

  startLoad() {
    const modelEnumLookup = MODEL[this.props.model];
    this.setState({isLoaded: false}, () => {
      loadGltfBridge({
        renderer, 
        environmentPath: MODEL_ENVIRONMENT_EMPTY.has(modelEnumLookup) ? undefined : "static/world/world.json", 
        gltfPath: this.props.path, 
        config: {
          projection: getDefaultPerspectiveProjection()
        }
      })
      .fork(
        error => {
          console.warn(error);
          this.setState({error})
        },
        bridge => {
          this.setState({isLoaded: true});
          sBridge.send(S.Just({
            bridge,
            cameraPosition: MODEL_CAMERA_POSITIONS.has(modelEnumLookup) ? MODEL_CAMERA_POSITIONS.get(modelEnumLookup) : [0,0,4]
          }));
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
    const domDisplay = 
      this.state.error !== undefined
      ? <div><h1>Error!</h1></div>
        : !this.state.isLoaded
          ? <LoadingGraphic />
          : null;

    return (
      <div>
        {domDisplay}
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

          const path = MODEL[model];

          const isNone = path === undefined || path === null || path === MODEL.NONE || path === "";

          if(isNone) {

          }
          return isNone
            ? null
            : <GltfDisplay model={model} path={assetPath + path} />
        }}
      </ModelContext.Consumer>
    )}
    
    </AppContext.Consumer>
  </div>
)