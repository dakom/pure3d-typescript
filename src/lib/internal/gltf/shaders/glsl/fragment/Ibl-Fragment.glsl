
#ifdef USE_IBL
uniform samplerCube u_DiffuseEnvSampler;
uniform samplerCube u_SpecularEnvSampler;
uniform sampler2D u_brdfLUT;

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
