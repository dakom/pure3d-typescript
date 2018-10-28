


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
// Structs 
///////////////////////////////

struct Fragment 
{
    vec3 normal; // fragment normal
    vec3 vectorToCamera; //normalized vector from surface point to camera
    vec3 reflection; //reflection vector
    float NdotV; // cos angle between normal and view direction
};

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
    float NdotL;                  // cos angle between normal and light direction
    float NdotH;                  // cos angle between normal and half vector
    float LdotH;                  // cos angle between light direction and half vector
    float VdotH;                  // cos angle between view direction and half vector
    vec3 color;                   // attenuated color
};

///////////////////////////////
// Constants 
///////////////////////////////

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

vec3 disneyDiffuse(Pbr pbr, Fragment fragment, Light light) {
    float f90 = 2.0 * light.LdotH * light.LdotH * pbr.alphaRoughness - 0.5;

    return (pbr.diffuseColor / PI) * (1.0 + f90 * pow((1.0 - light.NdotL), 5.0)) * (1.0 + f90 * pow((1.0 - fragment.NdotV), 5.0));
}

// Basic Lambertian diffuse
// Implementation from Lambert's Photometria https://archive.org/details/lambertsphotome00lambgoog
// See also [1], Equation 1
vec3 diffuse(Pbr pbr, Fragment fragment, Light light)
{
    return pbr.diffuseColor / PI;
}

// The following equation models the Fresnel reflectance term of the spec equation (aka F())
// Implementation of fresnel from [4], Equation 15
vec3 specularReflection(Pbr pbr, Fragment fragment, Light light)
{
    float fresnel = exp2( ( -5.55473 * light.LdotH - 6.98316 ) * light.LdotH );
    return ( 1.0 - pbr.specularColor ) * fresnel + pbr.specularColor;
}

// This calculates the specular geometric attenuation (aka G()),
// where rougher material will reflect less light back to the viewer.
// This implementation is based on [1] Equation 4, and we adopt their modifications to
// alphaRoughness as input as originally proposed in [2].
float geometricOcclusion(Pbr pbr, Fragment fragment, Light light)
{
    float a2 = pow2( pbr.alphaRoughness );
    // dotNL and dotNV are explicitly swapped. This is not a mistake.
    float gv = light.NdotL * sqrt( a2 + ( 1.0 - a2 ) * pow2( fragment.NdotV ) );
    float gl = fragment.NdotV * sqrt( a2 + ( 1.0 - a2 ) * pow2( light.NdotL ) );
    return 0.5 / max( gv + gl, EPSILON );
}

// The following equation(s) model the distribution of microfacet normals across the area being drawn (aka D())
// Implementation from "Average Irregularity Representation of a Roughened Surface for Ray Reflection" by T. S. Trowbridge, and K. P. Reitz
// Follows the distribution function recommended in the SIGGRAPH 2013 course notes from EPIC Games [1], Equation 3.
float microfacetDistribution(Pbr pbr, Fragment fragment, Light light)
{

    float roughnessSq = pbr.alphaRoughness * pbr.alphaRoughness;
    float f = (light.NdotH * roughnessSq - light.NdotH) * light.NdotH + 1.0;
    return roughnessSq / (PI * f * f);
}

//Get the light color using the above and inputs
vec3 getLightColor(Pbr pbr, Fragment fragment, Light light) {

    // Calculate the shading terms for the microfacet specular shading model
    vec3 F = specularReflection(pbr, fragment, light);
    float G = geometricOcclusion(pbr, fragment, light);
    float D = microfacetDistribution(pbr, fragment, light);

    // Calculation of analytical lighting contribution]
    vec3 diffuseAmt = diffuse(pbr, fragment, light);
    vec3 specAmt = F * (G * D);
    vec3 diffuseContrib = (1.0 - F) * diffuseAmt;
    vec3 specContrib = specAmt/ (4.0 * light.NdotL * fragment.NdotV);
    // Obtain final intensity as reflectance (BRDF) scaled by the energy of the light (cosine law)
    //vec3 color = light.NdotL * light.color * (diffuseContrib + specContrib);
    //vec3 color = light.NdotL * light.color * (diffuseContrib);//(diffuseContrib + specContrib);
    vec3 color = light.color; // * (specContrib);
    //vec3 color = light.NdotL * light.color * PI * (F * (G * D));
    

    return color;
}
///////////////////////////////
// Data functions
///////////////////////////////

vec4 getBaseColor() {
    // The albedo may be defined from a base texture or a flat color
    #ifdef HAS_BASECOLORMAP
        vec4 textureColor = texture2D(u_BaseColorSampler, v_UV);
        vec4 baseColor = SRGBtoLINEAR(textureColor) * u_BaseColorFactor;
    #else
        vec4 baseColor = u_BaseColorFactor;
    #endif

    return baseColor;
}

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

    vec4 baseColor = getBaseColor();

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
// used only by getFragment()
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

#ifdef USE_PUNCTUAL_LIGHTS
//Directional light based on normal and dynamic light info
Light getDirectionalLight(Fragment fragment, vec3 lightDirection, vec3 color, float intensity) {
    vec3 N = fragment.normal;
    vec3 V = fragment.vectorToCamera;
    float NdotV = fragment.NdotV;

    vec3 L = -normalize(lightDirection);   // Light Direction
    vec3 H = normalize(L+V);                          // Half vector between both l and v

    float NdotL = clamp(dot(N, L), 0.001, 1.0);
    float NdotH = clamp(dot(N, H), 0.0, 1.0);
    float LdotH = clamp(dot(L, H), 0.0, 1.0);
    float VdotH = clamp(dot(V, H), 0.0, 1.0);

    return Light(
        NdotL,
        NdotH,
        LdotH,
        VdotH,
        color * intensity
    );
}

//Point light
Light getPointLight(Fragment fragment, vec3 lightPosition, vec3 color, float intensity) {

    vec3 N = fragment.normal;
    vec3 V = fragment.vectorToCamera;
    float NdotV = fragment.NdotV;

    vec3 L = normalize(lightPosition - v_Position);   // Light Direction 
    vec3 H = normalize(L+V);                          // Half vector between both l and v

    float NdotL = saturate(dot(N, L));
    float NdotH = saturate(dot(N, H));
    float LdotH = saturate(dot(L, H));
    float VdotH = saturate(dot(V, H));

    float distance    = length(lightPosition - v_Position);
    //float attenuation = 1.0 / (distance * distance);
    //float distanceFalloff = 1.0 / max( pow( distance, intensity), 0.01 );

    // From Babylon - Prevents infinity issues at 0.
    float inverseSquaredRange = 0.0;
    float lightDistanceSquared = distance * distance;
    const float minDistanceSquared = 0.01*0.01;
    float lightDistanceFalloff = 1.0 / (max(lightDistanceSquared, minDistanceSquared));

    float factor = lightDistanceSquared * inverseSquaredRange;
    float attenuation = clamp(1.0 - factor * factor, 0., 1.);
    attenuation *= attenuation;

    // Smooth attenuation of the falloff defined by the range.
    lightDistanceFalloff *= attenuation;
    vec3 finalColor = color * lightDistanceFalloff;
    
    Light light = Light(
        NdotL,
        NdotH,
        LdotH,
        VdotH,
        finalColor
    );

    return light;
}


//Spot light
Light getSpotLight(Fragment fragment, vec3 lightPosition, vec3 lightDirection, float lightAngleScale, float lightAngleOffset, vec3 color, float intensity) {

    vec3 N = fragment.normal;
    vec3 V = fragment.vectorToCamera;
    float NdotV = fragment.NdotV;

    vec3 L = normalize(lightPosition - v_Position);   // Light Direction 
    vec3 H = normalize(L+V);                          // Half vector between both l and v

    float NdotL = clamp(dot(N, L), 0.001, 1.0);
    float NdotH = clamp(dot(N, H), 0.0, 1.0);
    float LdotH = clamp(dot(L, H), 0.0, 1.0);
    float VdotH = clamp(dot(V, H), 0.0, 1.0);

    float distance    = length(lightPosition - v_Position);
    float attenuation = 1.0 / (distance * distance);

    float cd = dot(lightDirection, V);
    float coneAttentuation = clamp(cd * lightAngleScale + lightAngleOffset, 0.0, 1.0);
    coneAttentuation *= coneAttentuation;   
    attenuation = attenuation * coneAttentuation;

    Light light = Light(
        NdotL,
        NdotH,
        LdotH,
        VdotH,
        color * intensity * attenuation
    );

    return light;
}
#endif

// Calculation of the lighting contribution from an optional Image Based Light source.
// Precomputed Environment Maps are required uniform inputs and are computed as outlined in [1].
// See our README.md on Environment Maps [3] for additional discussion.
#ifdef USE_IBL
vec3 getIBLContribution(Pbr pbr, Fragment fragment)
{
    float mipCount = 9.0; // resolution of 512x512
    float lod = (pbr.perceptualRoughness * mipCount);
    // retrieve a scale and bias to F0. See [1], Figure 3
    
    vec3 brdf = SRGBtoLINEAR(texture2D(u_brdfLUT, vec2(fragment.NdotV, 1.0 - pbr.perceptualRoughness))).rgb;
    vec3 diffuseLight = SRGBtoLINEAR(textureCube(u_DiffuseEnvSampler, fragment.normal)).rgb;
    

    #ifdef USE_TEX_LOD
    vec3 specularLight = SRGBtoLINEAR(textureCubeLodEXT(u_SpecularEnvSampler, fragment.reflection, lod)).rgb;
    #else
    vec3 specularLight = SRGBtoLINEAR(textureCube(u_SpecularEnvSampler, fragment.reflection)).rgb;
    #endif

    vec3 diffuse = diffuseLight * pbr.diffuseColor;
    vec3 specular = specularLight * (pbr.specularColor * brdf.x + brdf.y);

    return diffuse + specular;
}
#endif



void main()
{
    #ifdef UNLIT

        gl_FragColor = getBaseColor();
        return;
    #endif

    Pbr pbr = getPbr();
    Fragment fragment = getFragment();

    vec3 color = vec3(0.0, 0.0, 0.0);
    #ifdef USE_PUNCTUAL_LIGHTS
        Light light;
        //Actual implementation will dynamically write the code here
        %PUNCTUAL_LIGHTS_FUNCS%
    #endif

    #ifdef USE_IBL
        // Calculate lighting contribution from image based lighting source (IBL)
        color += getIBLContribution(pbr, fragment);
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
