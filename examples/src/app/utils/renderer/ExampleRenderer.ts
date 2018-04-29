import * as React from 'react';

import { S } from 'utils/Sanctuary';
import { createWebGlRenderer, WebGlConstants, GltfBridge, GltfScene, WebGlRendererOptions } from 'lib/Lib';

let currentRenderer = null;

export const disposeRenderer = () => {
    if(currentRenderer !== null) {
        //do something
    }

    console.warn("TODO - DISPOSE RENDERER");
    currentRenderer = null;
}

export const createRenderer = (opts:WebGlRendererOptions) => {
    disposeRenderer();

    currentRenderer = createWebGlRenderer(opts);

    //Initial setup
    currentRenderer.gl.clearColor(0.2, 0.2, 0.2, 1.0);

    //Resize to fit screen
    currentRenderer.resize({ width: window.innerWidth, height: window.innerHeight });

    return currentRenderer;
}


