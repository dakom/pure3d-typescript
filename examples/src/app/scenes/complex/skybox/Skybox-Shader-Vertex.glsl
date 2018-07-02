attribute vec3 a_Vertex;

varying vec3 v_TexCoord;

uniform mat4 u_Transform;

void main() {     
    gl_Position = u_Transform * (vec4(a_Vertex,1));

    v_TexCoord = a_Vertex;
}
