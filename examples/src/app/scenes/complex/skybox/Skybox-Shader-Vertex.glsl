attribute vec3 a_Position;

varying vec3 v_TexCoord;

uniform mat4 u_Transform;

void main() {     
    gl_Position = u_Transform * (vec4(a_Position, 1));

    v_TexCoord = a_Position;
}
