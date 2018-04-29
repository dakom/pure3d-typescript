//This hasn't been tested in a while and isn't managed by the renderer anymore
//See the old usage here: https://github.com/dakom/state-scenegraph/blob/master/src/lib/renderer/Renderer-WebGl.ts
//Though it can still be used generally, probably, and it might be helpful to keep the code here :)


export const makeFramebufferPicker = (gl: WebGLRenderingContext) => ({width,height}:{width:number,height:number}) => {
    //setup a texture to store colors
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    //setup a renderbuffer to store depth info
    const renderBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);


    //setup a framebuffer for offscreen rendering
    const frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderBuffer);

    //unbind everything
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    //exported utils
    const bind = () => gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    const unbind = () => gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    const readPixel = ({ x, y }: { x: number, y: number }): Uint8Array => {
        const readout = new Uint8Array(4);
        bind();
        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, readout);
        unbind();

        return readout;
    }
    const clear = (bits) => {
        bind();
        gl.clear(bits);
        unbind();
    }

    const dispose = () => {
        unbind();
        gl.deleteFramebuffer(frameBuffer);
        gl.deleteRenderbuffer(renderBuffer);
        gl.deleteTexture(texture);
        
    }

    return {
        bind: bind,
        unbind: unbind,
        readPixel: readPixel,
        dispose: dispose,
        clear: clear
    }
}
