attribute vec2 a_Vertex;
    
varying vec2 v_TexCoord;
    
uniform mat4 u_Transform;
uniform mat4 u_Size;

uniform vec2 u_uvOffset;
uniform vec2 u_uvScale;

void main() {     
    v_TexCoord = (a_Vertex * u_uvScale) + u_uvOffset;

    gl_Position = u_Transform * (u_Size * vec4(a_Vertex,0,1));
}