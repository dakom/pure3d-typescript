precision mediump float;

varying vec3 v_TexCoord;

uniform samplerCube u_Sampler; 

void main() {
    gl_FragColor = textureCube(u_Sampler, v_TexCoord);
    //gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
