%MORPH_VARS%

attribute vec4 a_Position;
#ifdef HAS_NORMALS
attribute vec4 a_Normal;
#endif
#ifdef HAS_TANGENTS
attribute vec4 a_Tangent;
#endif
#ifdef HAS_UV
attribute vec2 a_UV;
#endif
#ifdef HAS_COLOR
attribute vec4 a_Color;
varying vec4 v_Color;
#endif

uniform mat4 u_MVPMatrix;
uniform mat4 u_ModelMatrix;
uniform mat4 u_NormalMatrix;

varying vec3 v_Position;
varying vec2 v_UV;

#ifdef HAS_NORMALS
#ifdef HAS_TANGENTS
varying mat3 v_TBN;
#else
varying vec3 v_Normal;
#endif
#endif


void main()
{

  

  vec4 m_Position = a_Position;
  #ifdef HAS_NORMALS
    vec4 m_Normal = a_Normal;
  #endif
  #ifdef HAS_TANGENTS
    vec4 m_Tangent = a_Tangent;
  #endif

  %MORPH_FUNCS%

  vec4 pos = u_ModelMatrix * m_Position;
  v_Position = vec3(pos.xyz) / pos.w;

  #ifdef HAS_NORMALS
  #ifdef HAS_TANGENTS
  vec3 normalW = normalize(vec3(u_NormalMatrix * vec4(m_Normal.xyz, 0.0)));
  vec3 tangentW = normalize(vec3(u_ModelMatrix * vec4(m_Tangent.xyz, 0.0)));
  vec3 bitangentW = cross(normalW, tangentW) * m_Tangent.w;
  v_TBN = mat3(tangentW, bitangentW, normalW);
  #else // HAS_TANGENTS != 1
  v_Normal = normalize(vec3(u_ModelMatrix * vec4(m_Normal.xyz, 0.0)));
  #endif
  #endif

  #ifdef HAS_UV
  v_UV = a_UV;
  #else
  v_UV = vec2(0.,0.);
  #endif

    #ifdef HAS_COLOR
    v_Color = a_Color;
    #endif


  gl_Position = u_MVPMatrix * m_Position; // needs w for proper perspective correction
}

