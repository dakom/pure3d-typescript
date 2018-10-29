precision highp float;
precision highp int;

#extension GL_EXT_shader_texture_lod: enable
#extension GL_OES_standard_derivatives : enable

uniform vec3 u_Camera;

varying vec3 v_Position;
varying vec2 v_UV;

#ifdef HAS_NORMALS
    #ifdef HAS_TANGENTS
        varying mat3 v_TBN;
    #else
        varying vec3 v_Normal;
    #endif
#endif

#ifdef HAS_NORMALMAP
    uniform sampler2D u_NormalSampler;
    uniform float u_NormalScale;
#endif

struct Fragment 
{
    vec3 normal; // fragment normal
    vec3 vectorToCamera; //normalized vector from surface point to camera
    vec3 reflection; //reflection vector
    float NdotV; // cos angle between normal and view direction
};

vec3 getNormal()
{
    // Retrieve the tangent space matrix
    #ifndef HAS_TANGENTS
    vec3 pos_dx = dFdx(v_Position);
    vec3 pos_dy = dFdy(v_Position);
    vec3 tex_dx = dFdx(vec3(v_UV, 0.0));
    vec3 tex_dy = dFdy(vec3(v_UV, 0.0));
    vec3 t = (tex_dy.t * pos_dx - tex_dx.t * pos_dy) / (tex_dx.s * tex_dy.t - tex_dy.s * tex_dx.t);

    #ifdef HAS_NORMALS
    vec3 ng = normalize(v_Normal);
    #else
    vec3 ng = cross(pos_dx, pos_dy);
    #endif

    t = normalize(t - ng * dot(ng, t));
    vec3 b = normalize(cross(ng, t));
    mat3 tbn = mat3(t, b, ng);
    #else // HAS_TANGENTS
    mat3 tbn = v_TBN;
    #endif

    #ifdef HAS_NORMALMAP
    vec3 n = texture2D(u_NormalSampler, v_UV).rgb;
    n = normalize(tbn * ((2.0 * n - 1.0) * vec3(u_NormalScale, u_NormalScale, 1.0)));
    #else
    // The tbn matrix is linearly interpolated, so we need to re-normalize
    vec3 n = normalize(tbn[2].xyz);
    #endif

    return n;
}

//Get Fragment info
Fragment getFragment() {
    vec3 normal = getNormal();
    vec3 vectorToCamera = normalize(u_Camera - v_Position); 
    vec3 reflection = -normalize(reflect(vectorToCamera, normal));
    float NdotV = abs(dot(normal, vectorToCamera)) + 0.001;
    return Fragment(normal, vectorToCamera, reflection, NdotV);
}
