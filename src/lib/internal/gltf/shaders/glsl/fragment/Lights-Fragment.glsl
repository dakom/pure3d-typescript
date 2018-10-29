#ifdef USE_PUNCTUAL_LIGHTS
%PUNCTUAL_LIGHTS_VARS%

struct Light
{
    float NdotL;                  // cos angle between normal and light direction
    float NdotH;                  // cos angle between normal and half vector
    float LdotH;                  // cos angle between light direction and half vector
    float VdotH;                  // cos angle between view direction and half vector
    vec3 color;                   // color
    float falloff;            // attenuation
};


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
    float attenuation = 1.0 / (distance * distance);
    vec3 finalColor = color; // * intensity * attenuation; 
    
    Light light = Light(
        NdotL,
        NdotH,
        LdotH,
        VdotH,
        color,
        attenuation
    );

    return light;
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
    vec3 color = light.color * light.falloff * diffuseAmt; //light.NdotL * light.color * (diffuseContrib + specContrib);
    //vec3 color = light.NdotL * light.color * (diffuseContrib);//(diffuseContrib + specContrib);
    //vec3 color = light.NdotL * light.color * PI; // * (diffuseAmt);
    //vec3 color = light.NdotL * light.color * PI * (F * (G * D));
   

    return color;
}


#endif
