import * as React from 'react';

import { cScene} from '../frp/Bridge-FRP';
import { S } from '../utils/Sanctuary';
import { createWebGlRenderer, WebGlConstants, GltfBridge, GltfScene } from 'lib/Lib';

export const renderer = createWebGlRenderer({
  canvas: document.getElementById("canvas") as HTMLCanvasElement,
  version: 1
  //glWrapper: wrapDebugger 
});

//Initial setup
renderer.gl.clearColor(0.2, 0.2, 0.2, 1.0);

//Resize to fit screen
renderer.resize({ width: window.innerWidth, height: window.innerHeight });



cScene.listen(S.map(({bridge, scene}:{bridge: GltfBridge, scene: GltfScene}) => {
    renderer.gl.clear(WebGlConstants.COLOR_BUFFER_BIT | WebGlConstants.DEPTH_BUFFER_BIT); 


    bridge.renderScene(scene);
  }
));
