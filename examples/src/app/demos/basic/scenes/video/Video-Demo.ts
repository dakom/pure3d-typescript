import { createWebGlRenderer, WebGlConstants, WebGlRenderer,  createSimpleTextureFromTarget, } from "lib/Lib";
import { createVideoRenderer, SHADER_ID as videoShaderId } from "./video-renderer/Video-Renderer";
import { mat4 } from "gl-matrix";
import {playVideo} from "fluture-loaders";
import {Future} from "fluture";

export const startVideo = (renderer:WebGlRenderer) => (assetPath:string) => {

  //Setup element renderers
  const renderVideo = createVideoRenderer(renderer);
  //Setup camera
  const cameraMatrix = mat4.ortho(new Float64Array(16) as any, 0, window.innerWidth, 0, window.innerHeight, 0, 1);

  //Load texture
  return playVideo(assetPath + "video/Firefox.mp4")
    .map(video => [video, createSimpleTextureFromTarget({gl: renderer.gl, alpha: false, flipY: true}) (video)])
    .map(([video, texture]:[HTMLVideoElement, WebGLTexture]) => {
      const {videoWidth, videoHeight} = video;      
      const {gl} = renderer;

      //Setup element
      const videoElement = {
        width: videoWidth,
        height: videoHeight,
        texture,
        video,
        clipSpace: mat4.multiply(mat4.create(), cameraMatrix as any, mat4.fromTranslation(mat4.create(), [(window.innerWidth-videoWidth)/2,(window.innerHeight - videoHeight)/2,0]))
      }

      //render!
      return () => {
        renderer.gl.clear(WebGlConstants.COLOR_BUFFER_BIT | WebGlConstants.DEPTH_BUFFER_BIT);

        renderVideo(videoElement);
      }
    });
}
