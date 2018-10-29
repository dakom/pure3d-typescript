const float c_MinRoughness = 0.04;

#ifdef HAS_BASECOLORMAP
    uniform sampler2D u_BaseColorSampler;
    uniform float u_AlphaCutoff; 
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

