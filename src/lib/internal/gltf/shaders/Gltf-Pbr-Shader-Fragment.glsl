//
// This fragment shader defines a reference implementation for Physically Based Shading of
// a microfacet surface material defined by a glTF model.
//
// References:
// [1] Real Shading in Unreal Engine 4
//     http://blog.selfshadow.com/publications/s2013-shading-course/karis/s2013_pbs_epic_notes_v2.pdf
// [2] Physically Based Shading at Disney
//     http://blog.selfshadow.com/publications/s2012-shading-course/burley/s2012_pbs_disney_brdf_notes_v3.pdf
// [3] README.md - Environment Maps
//     https://github.com/KhronosGroup/glTF-WebGL-PBR/#environment-maps
// [4] "An Inexpensive BRDF Model for Physically based Rendering" by Christophe Schlick
//     https://www.cs.virginia.edu/~jdl/bib/appearance/analytic%20models/schlick94b.pdf

///////////////////////////////
// Quality settings 
///////////////////////////////

precision highp float;
precision highp int;

///////////////////////////////
// Extensions 
///////////////////////////////

#extension GL_EXT_shader_texture_lod: enable
#extension GL_OES_standard_derivatives : enable

///////////////////////////////
// Structs 
///////////////////////////////

struct Pbr 
{
    vec4 baseColor;
    float perceptualRoughness;    // roughness value, as authored by the model creator (input to shader)
    float metalness;              // metallic value at the surface
    vec3 reflectance0;            // full reflectance color (normal incidence angle)
    vec3 reflectance90;           // reflectance color at grazing angle
    float alphaRoughness;         // roughness mapped to a more linear change in the roughness (proposed by [2])
    vec3 diffuseColor;            // color contribution from diffuse lighting
    vec3 specularColor;           // color contribution from specular lighting
};

struct Light
{
    vec3 normal;                 // fragment normal
    float NdotL;                  // cos angle between normal and light direction
    float NdotV;                  // cos angle between normal and view direction
    float NdotH;                  // cos angle between normal and half vector
    float LdotH;                  // cos angle between light direction and half vector
    float VdotH;                  // cos angle between view direction and half vector
    vec3 reflection;
    vec3 color;
};

///////////////////////////////
// Constants 
///////////////////////////////

const float M_PI = 3.141592653589793;
const float c_MinRoughness = 0.04;


///////////////////////////////
// Uniforms and Attributes 
///////////////////////////////

#ifdef USE_PUNCTUAL_LIGHTS
%PUNCTUAL_LIGHTS_VARS%
#endif

#ifdef USE_IBL
uniform samplerCube u_DiffuseEnvSampler;
uniform samplerCube u_SpecularEnvSampler;
uniform sampler2D u_brdfLUT;
#endif

#ifdef HAS_BASECOLORMAP
uniform sampler2D u_BaseColorSampler;
uniform float u_AlphaCutoff; 
#endif
#ifdef HAS_NORMALMAP
uniform sampler2D u_NormalSampler;
uniform float u_NormalScale;
#endif
#ifdef HAS_EMISSIVEMAP
uniform sampler2D u_EmissiveSampler;
uniform vec3 u_EmissiveFactor;
#endif
#ifdef HAS_METALROUGHNESSMAP
uniform sampler2D u_MetallicRoughnessSampler;
#endif
#ifdef HAS_OCCLUSIONMAP
uniform sampler2D u_OcclusionSampler;
uniform float u_OcclusionStrength;
#endif

#ifdef HAS_COLOR
varying vec4 v_Color;
#endif

uniform vec2 u_MetallicRoughnessValues;
uniform vec4 u_BaseColorFactor;

uniform vec3 u_Camera;


///////////////////////////////
// Varyings 
///////////////////////////////

varying vec3 v_Position;

varying vec2 v_UV;

#ifdef HAS_NORMALS
#ifdef HAS_TANGENTS
varying mat3 v_TBN;
#else
varying vec3 v_Normal;
#endif
#endif

///////////////////////////////
// Pure functions
///////////////////////////////

// Convert color space
vec4 SRGBtoLINEAR(vec4 srgbIn)
{
    #ifdef MANUAL_SRGB
        #ifdef SRGB_FAST_APPROXIMATION
            vec3 linOut = pow(srgbIn.xyz,vec3(2.2));
        #else //SRGB_FAST_APPROXIMATION
            vec3 bLess = step(vec3(0.04045),srgbIn.xyz);
            vec3 linOut = mix( srgbIn.xyz/vec3(12.92), pow((srgbIn.xyz+vec3(0.055))/vec3(1.055),vec3(2.4)), bLess );
        #endif //SRGB_FAST_APPROXIMATION
        
        return vec4(linOut,srgbIn.w);
    #else //MANUAL_SRGB
        return srgbIn;
    #endif //MANUAL_SRGB
}


// Basic Lambertian diffuse
// Implementation from Lambert's Photometria https://archive.org/details/lambertsphotome00lambgoog
// See also [1], Equation 1
vec3 diffuse(Pbr pbr, Light light)
{
    return pbr.diffuseColor / M_PI;
}

// The following equation models the Fresnel reflectance term of the spec equation (aka F())
// Implementation of fresnel from [4], Equation 15
vec3 specularReflection(Pbr pbr, Light light)
{
    return pbr.reflectance0 + (pbr.reflectance90 - pbr.reflectance0) * pow(clamp(1.0 - light.VdotH, 0.0, 1.0), 5.0);
}

// This calculates the specular geometric attenuation (aka G()),
// where rougher material will reflect less light back to the viewer.
// This implementation is based on [1] Equation 4, and we adopt their modifications to
// alphaRoughness as input as originally proposed in [2].
float geometricOcclusion(Pbr pbr, Light light)
{
    float NdotL = light.NdotL;
    float NdotV = light.NdotV;
    float r = pbr.alphaRoughness;

    float attenuationL = 2.0 * NdotL / (NdotL + sqrt(r * r + (1.0 - r * r) * (NdotL * NdotL)));
    float attenuationV = 2.0 * NdotV / (NdotV + sqrt(r * r + (1.0 - r * r) * (NdotV * NdotV)));
    return attenuationL * attenuationV;
}

// The following equation(s) model the distribution of microfacet normals across the area being drawn (aka D())
// Implementation from "Average Irregularity Representation of a Roughened Surface for Ray Reflection" by T. S. Trowbridge, and K. P. Reitz
// Follows the distribution function recommended in the SIGGRAPH 2013 course notes from EPIC Games [1], Equation 3.
float microfacetDistribution(Pbr pbr, Light light)
{
    float roughnessSq = pbr.alphaRoughness * pbr.alphaRoughness;
    float f = (light.NdotH * roughnessSq - light.NdotH) * light.NdotH + 1.0;
    return roughnessSq / (M_PI * f * f);
}

///////////////////////////////
// Data functions
///////////////////////////////


// Get the PBR info from uniforms and attributes
Pbr getPbr() {
    // Metallic and Roughness material properties are packed together
    // In glTF, these factors can be specified by fixed scalar values
    // or from a metallic-roughness map
    float perceptualRoughness = u_MetallicRoughnessValues.y;
    float metallic = u_MetallicRoughnessValues.x;
    #ifdef HAS_METALROUGHNESSMAP
    // Roughness is stored in the 'g' channel, metallic is stored in the 'b' channel.
    // This layout intentionally reserves the 'r' channel for (optional) occlusion map data
    vec4 mrSample = texture2D(u_MetallicRoughnessSampler, v_UV);
    perceptualRoughness = mrSample.g * perceptualRoughness;
    metallic = mrSample.b * metallic;
    #endif
    perceptualRoughness = clamp(perceptualRoughness, c_MinRoughness, 1.0);
    metallic = clamp(metallic, 0.0, 1.0);
    // Roughness is authored as perceptual roughness; as is convention,
    // convert to material roughness by squaring the perceptual roughness [2].
    float alphaRoughness = perceptualRoughness * perceptualRoughness;

    // The albedo may be defined from a base texture or a flat color
    #ifdef HAS_BASECOLORMAP
    vec4 textureColor = texture2D(u_BaseColorSampler, v_UV);
    vec4 baseColor = SRGBtoLINEAR(textureColor) * u_BaseColorFactor;
    #else
    vec4 baseColor = u_BaseColorFactor;
    #endif

    #ifdef HAS_ALPHA_CUTOFF
    if(baseColor.a < u_AlphaCutoff) {
        discard;
    }

    #endif

    #ifndef HAS_ALPHA_BLEND
    baseColor.a = 1.0;
    #endif

    vec3 f0 = vec3(0.04);
    #ifdef HAS_COLOR
    vec3 diffuseColor = baseColor.rgb * (vec3(1.0) - f0) * SRGBtoLINEAR(v_Color).rgb;
    diffuseColor *= 1.0 - metallic;
    #else
    vec3 diffuseColor = baseColor.rgb * (vec3(1.0) - f0);
    diffuseColor *= 1.0 - metallic;
    #endif
    vec3 specularColor = mix(f0, baseColor.rgb, metallic);

    // Compute reflectance.
    float reflectance = max(max(specularColor.r, specularColor.g), specularColor.b);

    // For typical incident reflectance range (between 4% to 100%) set the grazing reflectance to 100% for typical fresnel effect.
    // For very low reflectance range on highly diffuse objects (below 4%), incrementally reduce grazing reflecance to 0%.
    float reflectance90 = clamp(reflectance * 25.0, 0.0, 1.0);
    vec3 specularEnvironmentR0 = specularColor.rgb;
    vec3 specularEnvironmentR90 = vec3(1.0, 1.0, 1.0) * reflectance90;

    return Pbr(
            baseColor,
            perceptualRoughness,
            metallic,
            specularEnvironmentR0,
            specularEnvironmentR90,
            alphaRoughness,
            diffuseColor,
            specularColor
    );
}

// Find the normal for this fragment, pulling either from a predefined normal map
// or from the interpolated mesh normal and tangent attributes.
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

//Directional light based on normal and dynamic light info
Light getDirectionalLight(vec3 normal, vec3 lightPosition, vec3 color, float intensity) {
    vec3 v = normalize(u_Camera - v_Position);        // Vector from surface point to camera
    vec3 l = normalize(lightPosition - v_Position);   // Light Direction 
    vec3 h = normalize(l+v);                          // Half vector between both l and v
    vec3 reflection = -normalize(reflect(v, normal));

    float NdotL = clamp(dot(normal, l), 0.001, 1.0);
    float NdotV = abs(dot(normal, v)) + 0.001;
    float NdotH = clamp(dot(normal, h), 0.0, 1.0);
    float LdotH = clamp(dot(l, h), 0.0, 1.0);
    float VdotH = clamp(dot(v, h), 0.0, 1.0);

    return Light(
        normal,
        NdotL,
        NdotV,
        NdotH,
        LdotH,
        VdotH,
        reflection,
        color * intensity
    );
}

//Point light
Light getPointLight(vec3 normal, vec3 lightPosition, vec3 color, float intensity) {
    Light light = getDirectionalLight(normal, lightPosition, color, intensity);

    float distance    = length(lightPosition - v_Position);
    float attenuation = 1.0 / (distance * distance);
    light.color *= attenuation;    
    return light;
}

// Calculation of the lighting contribution from an optional Image Based Light source.
// Precomputed Environment Maps are required uniform inputs and are computed as outlined in [1].
// See our README.md on Environment Maps [3] for additional discussion.
#ifdef USE_IBL
vec3 getIBLContribution(Pbr pbr, Light light)
{
    float mipCount = 9.0; // resolution of 512x512
    float lod = (pbr.perceptualRoughness * mipCount);
    // retrieve a scale and bias to F0. See [1], Figure 3
    
    vec3 brdf = SRGBtoLINEAR(texture2D(u_brdfLUT, vec2(light.NdotV, 1.0 - pbr.perceptualRoughness))).rgb;
    vec3 diffuseLight = SRGBtoLINEAR(textureCube(u_DiffuseEnvSampler, light.normal)).rgb;
    

    #ifdef USE_TEX_LOD
    vec3 specularLight = SRGBtoLINEAR(textureCubeLodEXT(u_SpecularEnvSampler, light.reflection, lod)).rgb;
    #else
    vec3 specularLight = SRGBtoLINEAR(textureCube(u_SpecularEnvSampler, light.reflection)).rgb;
    #endif

    vec3 diffuse = diffuseLight * pbr.diffuseColor;
    vec3 specular = specularLight * (pbr.specularColor * brdf.x + brdf.y);

    return diffuse + specular;
}
#endif


vec3 getColor(Pbr pbr, Light light) {

    // Calculate the shading terms for the microfacet specular shading model
    vec3 F = specularReflection(pbr, light);
    float G = geometricOcclusion(pbr, light);
    float D = microfacetDistribution(pbr, light);

    // Calculation of analytical lighting contribution
    vec3 diffuseContrib = (1.0 - F) * diffuse(pbr, light);
    vec3 specContrib = F * G * D / (4.0 * light.NdotL * light.NdotV);
    // Obtain final intensity as reflectance (BRDF) scaled by the energy of the light (cosine law)
    vec3 color = light.NdotL * light.color * (diffuseContrib + specContrib);
    

    return color;
}

void main()
{
    Pbr pbr = getPbr();
    vec3 normal = getNormal();

    vec3 color = vec3(0.0, 0.0, 0.0);
    Light light;
    #ifdef USE_PUNCTUAL_LIGHTS
        //Actual implementation will dynamically write the code here
        %PUNCTUAL_LIGHTS_FUNCS%

        
        //Manual example
        /*
        light = getDirectionalLight(
                    normal,
                    vec3(3,3,3),
                    vec3(1.0, 0, 1.0),
                    5.0
        );

        color += getColor(pbr, light);

        light = getPointLight(
                    normal,
                    vec3(-3,3,3),
                    vec3(1.0, 1.0, 1.0),
                    100.0
        );

        color += getColor(pbr, light);
        */
    #endif

    #ifdef USE_IBL

        //TODO - figure out how to calculate IBL _without_ a directional light
        vec3 defaultPosition = vec3(-1, 1, 1);
        vec3 defaultColor = vec3(1.0, 1, 1);
        float defaultIntensity = 1.0;
        light = getDirectionalLight(normal, defaultPosition, defaultColor, defaultIntensity);
        // Calculate lighting contribution from image based lighting source (IBL)
        color += getColor(pbr, light) + getIBLContribution(pbr, light);
    #endif

    // Apply optional PBR terms for additional (optional) shading
    #ifdef HAS_OCCLUSIONMAP
    float ao = texture2D(u_OcclusionSampler, v_UV).r;
    color = mix(color, color * ao, u_OcclusionStrength);
    #endif

    #ifdef HAS_EMISSIVEMAP
    vec3 emissive = SRGBtoLINEAR(texture2D(u_EmissiveSampler, v_UV)).rgb * u_EmissiveFactor;
    color += emissive;
    #endif


    
    gl_FragColor = vec4(pow(color,vec3(1.0/2.2)), pbr.baseColor.a);
}
