precision mediump float;
    
uniform sampler2D u_Sampler0;
uniform sampler2D u_Sampler1;

varying vec2 v_TexCoord;
    
void main() {
        vec4 texColor0 = texture2D(u_Sampler0, v_TexCoord);

        vec4 texColor1 = texture2D(u_Sampler1, v_TexCoord);
        
        gl_FragColor = texColor0 * texColor1;
}