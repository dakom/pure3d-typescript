#ifdef USE_PUNCTUAL_LIGHTS
%PUNCTUAL_LIGHTS_VARS%

struct Light
{
    float NdotL;                  // cos angle between normal and light direction
    float NdotH;                  // cos angle between normal and half vector
    float LdotH;                  // cos angle between light direction and half vector
    float VdotH;                  // cos angle between view direction and half vector
    vec3 color;                   
    float falloff;               
    float intensity;
};

//from https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/bsdfs.glsl
//decay of 2.0 is for physically correct
float getFalloff(float lightDistance, float cutoffDistance, float decay) {
    float distanceFalloff = 1.0 / max( pow( lightDistance, decay), 0.01 );
    
    if( cutoffDistance > 0.0 ) {
        distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
    }

    return distanceFalloff;
}


Light getPointLight(Fragment fragment, vec3 lightPosition, vec3 color, float intensity, float range) {

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
    float attenuation = getFalloff(distance, range, 2.0); 
     
    Light light = Light(
        NdotL,
        NdotH,
        LdotH,
        VdotH,
        color,
        attenuation,
        intensity
    );

    return light;
}

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
        color,
        1.0,
        intensity
    );
}

//Spot light
Light getSpotLight(Fragment fragment, vec3 lightPosition, vec3 lightDirection, float lightAngleScale, float lightAngleOffset, vec3 color, float intensity, float range) {

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
    float attenuation = getFalloff(distance, range, 2.0); 

    float cd = dot(lightDirection, V);
    float coneAttenuation = saturate(cd * lightAngleScale + lightAngleOffset);
    attenuation = (coneAttenuation * coneAttenuation);

    Light light = Light(
        NdotL,
        NdotH,
        LdotH,
        VdotH,
        color,
        attenuation,
        intensity
    );

    return light;
}


// Basic Lambertian diffuse
// Implementation from Lambert's Photometria https://archive.org/details/lambertsphotome00lambgoog
// See also [1], Equation 1
//
vec3 diffuse(Pbr pbr, Fragment fragment, Light light)
{
    return pbr.diffuseColor / PI;
}

// The following equation models the Fresnel reflectance term of the spec equation (aka F())
// Implementation of fresnel from [4], Equation 15
vec3 specularReflection(Pbr pbr, Fragment fragment, Light light)
{
    return pbr.reflectance0 + (pbr.reflectance90 - pbr.reflectance0) * pow(clamp(1.0 - light.VdotH, 0.0, 1.0), 5.0);
}

// This calculates the specular geometric attenuation (aka G()),
// where rougher material will reflect less light back to the viewer.
// This implementation is based on [1] Equation 4, and we adopt their modifications to
// alphaRoughness as input as originally proposed in [2].
float geometricOcclusion(Pbr pbr, Fragment fragment, Light light)
{
    float NdotL = light.NdotL;
    float NdotV = fragment.NdotV;
    float r = pbr.alphaRoughness;

    float attenuationL = 2.0 * NdotL / (NdotL + sqrt(r * r + (1.0 - r * r) * (NdotL * NdotL)));
    float attenuationV = 2.0 * NdotV / (NdotV + sqrt(r * r + (1.0 - r * r) * (NdotV * NdotV)));
    return attenuationL * attenuationV;
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

    // Calculation of analytical lighting contribution
    vec3 diffuseAmt = diffuse(pbr, fragment, light);
    vec3 specAmt = F * (G * D);

    //vec3 diffuseContrib = (1.0 - F) * diffuseAmt; 
    //vec3 specContrib = specAmt / (4.0 * light.NdotL * fragment.NdotV);

    // Obtain final intensity as reflectance (BRDF) scaled by the energy of the light (cosine law)
    vec3 color = light.NdotL * light.color * light.falloff * light.intensity * (diffuseAmt + specAmt);


    return color;
}


#endif
