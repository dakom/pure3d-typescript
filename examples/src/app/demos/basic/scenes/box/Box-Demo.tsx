import { createWebGlRenderer, WebGlConstants, WebGlRenderer } from "lib/Lib";
import { createBoxBasicRenderer} from "./box-basic-renderer/Box-Basic-Renderer";
import {createBoxVaoRenderer} from "./box-vao-renderer/Box-Vao-Renderer";
import { mat4 } from "gl-matrix";
import {Future} from "fluture";
import {BoxElement} from "./Box-Element";
import {uploadData} from "./Box-Data";

import {renderer} from "utils/renderer/ExampleRenderer";

export const startBox = (style:"basic" | "vao") => {

  //Upload data
  uploadData(renderer);
  
  //Setup element renderers
  const renderBox = style === "basic"
    ? createBoxBasicRenderer(renderer)
    : createBoxVaoRenderer(renderer)
    
  //Setup camera

  const projection = mat4.perspective(mat4.create(), Math.PI / 2, window.innerWidth / window.innerHeight, 1, 3000);
  const eye = mat4.lookAt(mat4.create(), Float64Array.from([-700, 200, 0]), Float64Array.from([0, 0, 1000]), Float64Array.from([0, 1, 0]));
  const cameraMatrix = mat4.multiply(mat4.create(), projection, eye);

  //Setup element

  const boxElement:BoxElement = {
    width: 400,
    height: 100,
    depth: 50,
    clipSpace: mat4.multiply(mat4.create(), cameraMatrix, mat4.fromTranslation(mat4.create(), [0, 0, 400]))
  }

  return Future.of(() => {
    renderer.gl.clear(WebGlConstants.COLOR_BUFFER_BIT | WebGlConstants.DEPTH_BUFFER_BIT);
    renderBox(boxElement);
  });
}
