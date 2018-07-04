attribute vec3 a_Position;
attribute vec3 a_Color;

uniform mat4 u_Transform;

varying vec4 v_Color;

void main() {
    
    gl_Position = u_Transform * (vec4(a_Position, 1));

    v_Color = vec4(a_Color, 1); 
}
