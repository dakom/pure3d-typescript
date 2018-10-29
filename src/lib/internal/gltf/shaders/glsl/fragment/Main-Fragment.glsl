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
