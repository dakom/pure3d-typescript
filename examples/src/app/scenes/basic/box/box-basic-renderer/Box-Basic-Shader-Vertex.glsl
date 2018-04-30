attribute vec3 a_Vertex;
attribute vec4 a_Color;

uniform mat4 u_Transform;
uniform mat4 u_Size;

varying vec4 v_Color;

void main() {     
    gl_Position = u_Transform * (u_Size * vec4(a_Vertex,1));

    v_Color = a_Color;
}