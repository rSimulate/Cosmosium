
<!-- GLSL shaders -->



        <script type="application/x-glsl" id="asteroid-vertex">
                //
        // GLSL textureless classic 3D noise "cnoise",
        // with an RSL-style periodic variant "pnoise".
        // Author:  Stefan Gustavson (stefan.gustavson@liu.se)
        // Version: 2011-10-11
        //
        // Many thanks to Ian McEwan of Ashima Arts for the
        // ideas for permutation and gradient selection.
        //
        // Copyright (c) 2011 Stefan Gustavson. All rights reserved.
        // Distributed under the MIT license. See LICENSE file.
        // https://github.com/ashima/webgl-noise
        //

        vec3 mod289(vec3 x)
        {
          return x - floor(x * (1.0 / 289.0)) * 289.0;
        }

        vec4 mod289(vec4 x)
        {
          return x - floor(x * (1.0 / 289.0)) * 289.0;
        }

        vec4 permute(vec4 x)
        {
          return mod289(((x*34.0)+1.0)*x);
        }

        vec4 taylorInvSqrt(vec4 r)
        {
          return 1.79284291400159 - 0.85373472095314 * r;
        }

        vec3 fade(vec3 t) {
          return t*t*t*(t*(t*6.0-15.0)+10.0);
        }

        // Classic Perlin noise
        float cnoise(vec3 P)
        {
          vec3 Pi0 = floor(P); // Integer part for indexing
          vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
          Pi0 = mod289(Pi0);
          Pi1 = mod289(Pi1);
          vec3 Pf0 = fract(P); // Fractional part for interpolation
          vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
          vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
          vec4 iy = vec4(Pi0.yy, Pi1.yy);
          vec4 iz0 = Pi0.zzzz;
          vec4 iz1 = Pi1.zzzz;

          vec4 ixy = permute(permute(ix) + iy);
          vec4 ixy0 = permute(ixy + iz0);
          vec4 ixy1 = permute(ixy + iz1);

          vec4 gx0 = ixy0 * (1.0 / 7.0);
          vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
          gx0 = fract(gx0);
          vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
          vec4 sz0 = step(gz0, vec4(0.0));
          gx0 -= sz0 * (step(0.0, gx0) - 0.5);
          gy0 -= sz0 * (step(0.0, gy0) - 0.5);

          vec4 gx1 = ixy1 * (1.0 / 7.0);
          vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
          gx1 = fract(gx1);
          vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
          vec4 sz1 = step(gz1, vec4(0.0));
          gx1 -= sz1 * (step(0.0, gx1) - 0.5);
          gy1 -= sz1 * (step(0.0, gy1) - 0.5);

          vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
          vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
          vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
          vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
          vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
          vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
          vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
          vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

          vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
          g000 *= norm0.x;
          g010 *= norm0.y;
          g100 *= norm0.z;
          g110 *= norm0.w;
          vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
          g001 *= norm1.x;
          g011 *= norm1.y;
          g101 *= norm1.z;
          g111 *= norm1.w;

          float n000 = dot(g000, Pf0);
          float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
          float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
          float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
          float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
          float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
          float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
          float n111 = dot(g111, Pf1);

          vec3 fade_xyz = fade(Pf0);
          vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
          vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
          float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
          return 2.2 * n_xyz;
        }

        // Classic Perlin noise, periodic variant
        float pnoise(vec3 P, vec3 rep)
        {
          vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
          vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
          Pi0 = mod289(Pi0);
          Pi1 = mod289(Pi1);
          vec3 Pf0 = fract(P); // Fractional part for interpolation
          vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
          vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
          vec4 iy = vec4(Pi0.yy, Pi1.yy);
          vec4 iz0 = Pi0.zzzz;
          vec4 iz1 = Pi1.zzzz;

          vec4 ixy = permute(permute(ix) + iy);
          vec4 ixy0 = permute(ixy + iz0);
          vec4 ixy1 = permute(ixy + iz1);

          vec4 gx0 = ixy0 * (1.0 / 7.0);
          vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
          gx0 = fract(gx0);
          vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
          vec4 sz0 = step(gz0, vec4(0.0));
          gx0 -= sz0 * (step(0.0, gx0) - 0.5);
          gy0 -= sz0 * (step(0.0, gy0) - 0.5);

          vec4 gx1 = ixy1 * (1.0 / 7.0);
          vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
          gx1 = fract(gx1);
          vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
          vec4 sz1 = step(gz1, vec4(0.0));
          gx1 -= sz1 * (step(0.0, gx1) - 0.5);
          gy1 -= sz1 * (step(0.0, gy1) - 0.5);

          vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
          vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
          vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
          vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
          vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
          vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
          vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
          vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

          vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
          g000 *= norm0.x;
          g010 *= norm0.y;
          g100 *= norm0.z;
          g110 *= norm0.w;
          vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
          g001 *= norm1.x;
          g011 *= norm1.y;
          g101 *= norm1.z;
          g111 *= norm1.w;

          float n000 = dot(g000, Pf0);
          float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
          float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
          float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
          float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
          float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
          float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
          float n111 = dot(g111, Pf1);

          vec3 fade_xyz = fade(Pf0);
          vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
          vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
          float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
          return 2.2 * n_xyz;
        }

        //varying vec3 vLightFront; //(already defined below)

        //varying vec2 vUv; //(already defined below)
        varying float noise;

        float turbulence( vec3 p ) {
            float w = 100.0;
            float t = -.5;
            for (float f = 1.0 ; f <= 10.0 ; f++ ){
                float power = pow( 2.0, f );
                t += abs( pnoise( vec3( power * p ), vec3( 10.0, 10.0, 10.0 ) ) / power );
            }
            return t;
        }



        #define LAMBERT
        varying vec3 vLightFront;
        #ifdef DOUBLE_SIDED
        varying vec3 vLightBack;
        #endif
        #if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP )
        varying vec2 vUv;
        uniform vec4 offsetRepeat;
        #endif
        #ifdef USE_LIGHTMAP
        varying vec2 vUv2;
        #endif
        #if defined( USE_ENVMAP ) && ! defined( USE_BUMPMAP ) && ! defined( USE_NORMALMAP )
        varying vec3 vReflect;
        uniform float refractionRatio;
        uniform bool useRefract;
        #endif
        uniform vec3 ambient;
        uniform vec3 diffuse;
        uniform vec3 emissive;
        uniform vec3 ambientLightColor;
        #if MAX_DIR_LIGHTS > 0
        uniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];
        uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];
        #endif
        #if MAX_HEMI_LIGHTS > 0
        uniform vec3 hemisphereLightSkyColor[ MAX_HEMI_LIGHTS ];
        uniform vec3 hemisphereLightGroundColor[ MAX_HEMI_LIGHTS ];
        uniform vec3 hemisphereLightDirection[ MAX_HEMI_LIGHTS ];
        #endif
        #if MAX_POINT_LIGHTS > 0
        uniform vec3 pointLightColor[ MAX_POINT_LIGHTS ];
        uniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];
        uniform float pointLightDistance[ MAX_POINT_LIGHTS ];
        #endif
        #if MAX_SPOT_LIGHTS > 0
        uniform vec3 spotLightColor[ MAX_SPOT_LIGHTS ];
        uniform vec3 spotLightPosition[ MAX_SPOT_LIGHTS ];
        uniform vec3 spotLightDirection[ MAX_SPOT_LIGHTS ];
        uniform float spotLightDistance[ MAX_SPOT_LIGHTS ];
        uniform float spotLightAngleCos[ MAX_SPOT_LIGHTS ];
        uniform float spotLightExponent[ MAX_SPOT_LIGHTS ];
        #endif
        #ifdef WRAP_AROUND
        uniform vec3 wrapRGB;
        #endif
        #ifdef USE_COLOR
        varying vec3 vColor;
        #endif
        #ifdef USE_MORPHTARGETS
        #ifndef USE_MORPHNORMALS
        uniform float morphTargetInfluences[ 8 ];
        #else
        uniform float morphTargetInfluences[ 4 ];
        #endif
        #endif
        #ifdef USE_SKINNING
        #ifdef BONE_TEXTURE
        uniform sampler2D boneTexture;
        uniform int boneTextureWidth;
        uniform int boneTextureHeight;
        mat4 getBoneMatrix( const in float i ) {
        float j = i * 4.0;
        float x = mod( j, float( boneTextureWidth ) );
        float y = floor( j / float( boneTextureWidth ) );
        float dx = 1.0 / float( boneTextureWidth );
        float dy = 1.0 / float( boneTextureHeight );
        y = dy * ( y + 0.5 );
        vec4 v1 = texture2D( boneTexture, vec2( dx * ( x + 0.5 ), y ) );
        vec4 v2 = texture2D( boneTexture, vec2( dx * ( x + 1.5 ), y ) );
        vec4 v3 = texture2D( boneTexture, vec2( dx * ( x + 2.5 ), y ) );
        vec4 v4 = texture2D( boneTexture, vec2( dx * ( x + 3.5 ), y ) );
        mat4 bone = mat4( v1, v2, v3, v4 );
        return bone;
        }
        #else
        uniform mat4 boneGlobalMatrices[ MAX_BONES ];
        mat4 getBoneMatrix( const in float i ) {
        mat4 bone = boneGlobalMatrices[ int(i) ];
        return bone;
        }
        #endif
        #endif
        #ifdef USE_SHADOWMAP
        varying vec4 vShadowCoord[ MAX_SHADOWS ];
        uniform mat4 shadowMatrix[ MAX_SHADOWS ];
        #endif

        void main() {
        #if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP )
        vUv = uv * offsetRepeat.zw + offsetRepeat.xy;
        #endif
        #ifdef USE_LIGHTMAP
        vUv2 = uv2;
        #endif
        #ifdef USE_COLOR
        #ifdef GAMMA_INPUT
        vColor = color * color;
        #else
        vColor = color;
        #endif
        #endif
        #ifdef USE_MORPHNORMALS
        vec3 morphedNormal = vec3( 0.0 );
        morphedNormal +=  ( morphNormal0 - normal ) * morphTargetInfluences[ 0 ];
        morphedNormal +=  ( morphNormal1 - normal ) * morphTargetInfluences[ 1 ];
        morphedNormal +=  ( morphNormal2 - normal ) * morphTargetInfluences[ 2 ];
        morphedNormal +=  ( morphNormal3 - normal ) * morphTargetInfluences[ 3 ];
        morphedNormal += normal;
        #endif
        #ifdef USE_SKINNING
        mat4 boneMatX = getBoneMatrix( skinIndex.x );
        mat4 boneMatY = getBoneMatrix( skinIndex.y );
        mat4 boneMatZ = getBoneMatrix( skinIndex.z );
        mat4 boneMatW = getBoneMatrix( skinIndex.w );
        #endif
        #ifdef USE_SKINNING
        mat4 skinMatrix = skinWeight.x * boneMatX;
        skinMatrix  += skinWeight.y * boneMatY;
        #ifdef USE_MORPHNORMALS
        vec4 skinnedNormal = skinMatrix * vec4( morphedNormal, 0.0 );
        #else
        vec4 skinnedNormal = skinMatrix * vec4( normal, 0.0 );
        #endif
        #endif
        vec3 objectNormal;
        #ifdef USE_SKINNING
        objectNormal = skinnedNormal.xyz;
        #endif
        #if !defined( USE_SKINNING ) && defined( USE_MORPHNORMALS )
        objectNormal = morphedNormal;
        #endif
        #if !defined( USE_SKINNING ) && ! defined( USE_MORPHNORMALS )
        objectNormal = normal;
        #endif
        #ifdef FLIP_SIDED
        objectNormal = -objectNormal;
        #endif
        vec3 transformedNormal = normalMatrix * objectNormal;
        #ifdef USE_MORPHTARGETS
        vec3 morphed = vec3( 0.0 );
        morphed += ( morphTarget0 - position ) * morphTargetInfluences[ 0 ];
        morphed += ( morphTarget1 - position ) * morphTargetInfluences[ 1 ];
        morphed += ( morphTarget2 - position ) * morphTargetInfluences[ 2 ];
        morphed += ( morphTarget3 - position ) * morphTargetInfluences[ 3 ];
        #ifndef USE_MORPHNORMALS
        morphed += ( morphTarget4 - position ) * morphTargetInfluences[ 4 ];
        morphed += ( morphTarget5 - position ) * morphTargetInfluences[ 5 ];
        morphed += ( morphTarget6 - position ) * morphTargetInfluences[ 6 ];
        morphed += ( morphTarget7 - position ) * morphTargetInfluences[ 7 ];
        #endif
        morphed += position;
        #endif
        #ifdef USE_SKINNING
        #ifdef USE_MORPHTARGETS
        vec4 skinVertex = vec4( morphed, 1.0 );
        #else
        vec4 skinVertex = vec4( position, 1.0 );
        #endif
        vec4 skinned  = boneMatX * skinVertex * skinWeight.x;
        skinned      += boneMatY * skinVertex * skinWeight.y;
        skinned      += boneMatZ * skinVertex * skinWeight.z;
        skinned      += boneMatW * skinVertex * skinWeight.w;
        #endif
        vec4 mvPosition;
        #ifdef USE_SKINNING
        mvPosition = modelViewMatrix * skinned;
        #endif
        #if !defined( USE_SKINNING ) && defined( USE_MORPHTARGETS )
        mvPosition = modelViewMatrix * vec4( morphed, 1.0 );
        #endif
        #if !defined( USE_SKINNING ) && ! defined( USE_MORPHTARGETS )
        mvPosition = modelViewMatrix * vec4( position, 1.0 );
        #endif

        // begin noise

        // get a turbulent 3d noise using the normal, normal to high freq
        noise = 4.0 *  -.10 * turbulence( .5 * normal );
        // get a 3d noise using the position, low frequency
        float b = 5.0 * pnoise( 0.05 * position, vec3( 100.0 ) );
        // compose both noises
        float displacement = - 3. * noise + b;

        // move the position along the normal and transform it
        vec3 newPosition = position + normal * displacement;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );






        // end noise


        //gl_Position = projectionMatrix * mvPosition;  // commenting this out -- if we want default no-noise, use this instead
        #if defined( USE_ENVMAP ) || defined( PHONG ) || defined( LAMBERT ) || defined ( USE_SHADOWMAP )
        #ifdef USE_SKINNING
        vec4 worldPosition = modelMatrix * skinned;
        #endif
        #if defined( USE_MORPHTARGETS ) && ! defined( USE_SKINNING )
        vec4 worldPosition = modelMatrix * vec4( morphed, 1.0 );
        #endif
        #if ! defined( USE_MORPHTARGETS ) && ! defined( USE_SKINNING )
        vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
        #endif
        #endif
        #if defined( USE_ENVMAP ) && ! defined( USE_BUMPMAP ) && ! defined( USE_NORMALMAP )
        vec3 worldNormal = mat3( modelMatrix[ 0 ].xyz, modelMatrix[ 1 ].xyz, modelMatrix[ 2 ].xyz ) * objectNormal;
        worldNormal = normalize( worldNormal );
        vec3 cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
        if ( useRefract ) {
        vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
        } else {
        vReflect = reflect( cameraToVertex, worldNormal );
        }
        #endif
        vLightFront = vec3( 0.0 );
        #ifdef DOUBLE_SIDED
        vLightBack = vec3( 0.0 );
        #endif
        transformedNormal = normalize( transformedNormal );
        #if MAX_DIR_LIGHTS > 0
        for( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {
        vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );
        vec3 dirVector = normalize( lDirection.xyz );
        float dotProduct = dot( transformedNormal, dirVector );
        vec3 directionalLightWeighting = vec3( max( dotProduct, 0.0 ) );
        #ifdef DOUBLE_SIDED
        vec3 directionalLightWeightingBack = vec3( max( -dotProduct, 0.0 ) );
        #ifdef WRAP_AROUND
        vec3 directionalLightWeightingHalfBack = vec3( max( -0.5 * dotProduct + 0.5, 0.0 ) );
        #endif
        #endif
        #ifdef WRAP_AROUND
        vec3 directionalLightWeightingHalf = vec3( max( 0.5 * dotProduct + 0.5, 0.0 ) );
        directionalLightWeighting = mix( directionalLightWeighting, directionalLightWeightingHalf, wrapRGB );
        #ifdef DOUBLE_SIDED
        directionalLightWeightingBack = mix( directionalLightWeightingBack, directionalLightWeightingHalfBack, wrapRGB );
        #endif
        #endif
        vLightFront += directionalLightColor[ i ] * directionalLightWeighting;
        #ifdef DOUBLE_SIDED
        vLightBack += directionalLightColor[ i ] * directionalLightWeightingBack;
        #endif
        }
        #endif
        #if MAX_POINT_LIGHTS > 0
        for( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {
        vec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );
        vec3 lVector = lPosition.xyz - mvPosition.xyz;
        float lDistance = 1.0;
        if ( pointLightDistance[ i ] > 0.0 )
        lDistance = 1.0 - min( ( length( lVector ) / pointLightDistance[ i ] ), 1.0 );
        lVector = normalize( lVector );
        float dotProduct = dot( transformedNormal, lVector );
        vec3 pointLightWeighting = vec3( max( dotProduct, 0.0 ) );
        #ifdef DOUBLE_SIDED
        vec3 pointLightWeightingBack = vec3( max( -dotProduct, 0.0 ) );
        #ifdef WRAP_AROUND
        vec3 pointLightWeightingHalfBack = vec3( max( -0.5 * dotProduct + 0.5, 0.0 ) );
        #endif
        #endif
        #ifdef WRAP_AROUND
        vec3 pointLightWeightingHalf = vec3( max( 0.5 * dotProduct + 0.5, 0.0 ) );
        pointLightWeighting = mix( pointLightWeighting, pointLightWeightingHalf, wrapRGB );
        #ifdef DOUBLE_SIDED
        pointLightWeightingBack = mix( pointLightWeightingBack, pointLightWeightingHalfBack, wrapRGB );
        #endif
        #endif
        vLightFront += pointLightColor[ i ] * pointLightWeighting * lDistance;
        #ifdef DOUBLE_SIDED
        vLightBack += pointLightColor[ i ] * pointLightWeightingBack * lDistance;
        #endif
        }
        #endif
        #if MAX_SPOT_LIGHTS > 0
        for( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {
        vec4 lPosition = viewMatrix * vec4( spotLightPosition[ i ], 1.0 );
        vec3 lVector = lPosition.xyz - mvPosition.xyz;
        float spotEffect = dot( spotLightDirection[ i ], normalize( spotLightPosition[ i ] - worldPosition.xyz ) );
        if ( spotEffect > spotLightAngleCos[ i ] ) {
        spotEffect = max( pow( spotEffect, spotLightExponent[ i ] ), 0.0 );
        float lDistance = 1.0;
        if ( spotLightDistance[ i ] > 0.0 )
        lDistance = 1.0 - min( ( length( lVector ) / spotLightDistance[ i ] ), 1.0 );
        lVector = normalize( lVector );
        float dotProduct = dot( transformedNormal, lVector );
        vec3 spotLightWeighting = vec3( max( dotProduct, 0.0 ) );
        #ifdef DOUBLE_SIDED
        vec3 spotLightWeightingBack = vec3( max( -dotProduct, 0.0 ) );
        #ifdef WRAP_AROUND
        vec3 spotLightWeightingHalfBack = vec3( max( -0.5 * dotProduct + 0.5, 0.0 ) );
        #endif
        #endif
        #ifdef WRAP_AROUND
        vec3 spotLightWeightingHalf = vec3( max( 0.5 * dotProduct + 0.5, 0.0 ) );
        spotLightWeighting = mix( spotLightWeighting, spotLightWeightingHalf, wrapRGB );
        #ifdef DOUBLE_SIDED
        spotLightWeightingBack = mix( spotLightWeightingBack, spotLightWeightingHalfBack, wrapRGB );
        #endif
        #endif
        vLightFront += spotLightColor[ i ] * spotLightWeighting * lDistance * spotEffect;
        #ifdef DOUBLE_SIDED
        vLightBack += spotLightColor[ i ] * spotLightWeightingBack * lDistance * spotEffect;
        #endif
        }
        }
        #endif
        #if MAX_HEMI_LIGHTS > 0
        for( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {
        vec4 lDirection = viewMatrix * vec4( hemisphereLightDirection[ i ], 0.0 );
        vec3 lVector = normalize( lDirection.xyz );
        float dotProduct = dot( transformedNormal, lVector );
        float hemiDiffuseWeight = 0.5 * dotProduct + 0.5;
        float hemiDiffuseWeightBack = -0.5 * dotProduct + 0.5;
        vLightFront += mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeight );
        #ifdef DOUBLE_SIDED
        vLightBack += mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeightBack );
        #endif
        }
        #endif
        vLightFront = vLightFront * diffuse + ambient * ambientLightColor + emissive;
        #ifdef DOUBLE_SIDED
        vLightBack = vLightBack * diffuse + ambient * ambientLightColor + emissive;
        #endif
        #ifdef USE_SHADOWMAP
        for( int i = 0; i < MAX_SHADOWS; i ++ ) {
        vShadowCoord[ i ] = shadowMatrix[ i ] * worldPosition;
        }
        #endif
        }
        </script>

        <script type="application/x-glsl" id="sky-vertex">
        varying vec2 vUV;

        void main() {
          vUV = uv;
          vec4 pos = vec4(position, 1.0);
          gl_Position = projectionMatrix * modelViewMatrix * pos;
        }
        </script>

        <script type="application/x-glsl" id="sky-fragment">
        uniform sampler2D texture;
        varying vec2 vUV;

        void main() {
          vec4 sample = texture2D(texture, vUV);
          gl_FragColor = vec4(sample.xyz, sample.w);
        }
        </script>

        <script type="application/x-glsl" id="sun-vertex">
            varying vec2 vUV;

            void main() {
                vUV = uv;
                vec4 pos = vec4(position, 1.0);
                gl_Position = projectionMatrix * modelViewMatrix * pos;
            }

        </script>

        <script type="application/x-glsl" id="sun-fragment">
    uniform sampler2D texture;
    uniform sampler2D glow;
    uniform float time;
    varying vec2 vUV;

    void main() {
        float glowCycle = 15.0;
        float shiftCycle = 10.0;
        float timeValue = mod(time, glowCycle);
        float remainingTime = glowCycle - timeValue;


        vec4 sample = texture2D(texture, vUV);
        vec4 sample2 = texture2D(glow, vUV);
        float altW = 0.1;
        float rIntensity = 0.3;
        float gIntensity = 1.0;

        if (timeValue > (glowCycle/2.0)) {
            timeValue = remainingTime;
        }
        sample.x = mix(texture2D(texture, vUV).x - 0.02, texture2D(texture, vUV).x + 0.05,
                        timeValue * rIntensity * texture2D(texture, vUV).x);
        sample.y = mix(texture2D(texture, vUV).y + 0.1, texture2D(texture, vUV).y + 0.2,
                        timeValue * gIntensity * texture2D(texture, vUV).y);

        timeValue = mod(time, shiftCycle);
        remainingTime = shiftCycle - timeValue;
        if (timeValue > (shiftCycle/2.0)) {
            timeValue = remainingTime;
        }

        gl_FragColor = vec4(sample.xyz, sample.w);
    }

</script>


<script type="application/x-glsl" id="fragmentGround">
    //
    // Atmospheric scattering fragment shader
    //
    // Author: Sean O'Neil
    //
    // Copyright (c) 2004 Sean O'Neil
    //
    // Ported for use with three.js/WebGL by James Baicoianu

    //uniform sampler2D s2Tex1;
    //uniform sampler2D s2Tex2;

    uniform float fNightScale;
    uniform vec3 v3LightPosition;
    uniform sampler2D tDiffuse;
    uniform sampler2D tDiffuseNight;

    varying vec3 c0;
    varying vec3 c1;
    varying vec3 vNormal;
    varying vec2 vUv;

    void main (void)
    {
    //gl_FragColor = vec4(c0, 1.0);
    //gl_FragColor = vec4(0.25 * c0, 1.0);
    //gl_FragColor = gl_Color + texture2D(s2Tex1, gl_TexCoord[0].st) * texture2D(s2Tex2, gl_TexCoord[1].st) * gl_SecondaryColor;

    vec3 diffuseTex = texture2D( tDiffuse, vUv ).xyz;
    vec3 diffuseNightTex = texture2D( tDiffuseNight, vUv ).xyz;

    vec3 day = diffuseTex * c0;
    vec3 night = fNightScale * diffuseNightTex * diffuseNightTex * diffuseNightTex * (1.0 - c0);

    gl_FragColor = vec4(c1, 1.0) + vec4(day + night, 1.0);

    }
</script>

<script type="application/x-glsl" id="fragmentSky">
    //
    // Atmospheric scattering fragment shader
    //
    // Author: Sean O'Neil
    //
    // Copyright (c) 2004 Sean O'Neil
    //

    uniform vec3 v3LightPos;
    uniform float g;
    uniform float g2;

    varying vec3 v3Direction;
    varying vec3 c0;
    varying vec3 c1;

    // Calculates the Mie phase function
    float getMiePhase(float fCos, float fCos2, float g, float g2)
    {
      return 1.5 * ((1.0 - g2) / (2.0 + g2)) * (1.0 + fCos2) / pow(1.0 + g2 - 2.0 * g * fCos, 1.5);
    }

    // Calculates the Rayleigh phase function
    float getRayleighPhase(float fCos2)
    {
      return 0.75 + 0.75 * fCos2;
    }

    void main (void)
    {
      float fCos = dot(v3LightPos, v3Direction) / length(v3Direction);
      float fCos2 = fCos * fCos;

      vec3 color = getRayleighPhase(fCos2) * c0 +
                     getMiePhase(fCos, fCos2, g, g2) * c1;

      gl_FragColor = vec4(color, 1.0);
      gl_FragColor.a = gl_FragColor.b;
    }
</script>

<script type="application/x-glsl" id="vertexGround">
    //
    // Atmospheric scattering vertex shader
    //
    // Author: Sean O'Neil
    //
    // Copyright (c) 2004 Sean O'Neil
    //
    // Ported for use with three.js/WebGL by James Baicoianu

    uniform vec3 v3LightPosition;        // The direction vector to the light source
    uniform vec3 v3InvWavelength;        // 1 / pow(wavelength, 4) for the red, green, and blue channels
    uniform float fCameraHeight;         // The camera's current height
    uniform float fCameraHeight2;        // fCameraHeight^2
    uniform float fOuterRadius;          // The outer (atmosphere) radius
    uniform float fOuterRadius2;         // fOuterRadius^2
    uniform float fInnerRadius;          // The inner (planetary) radius
    uniform float fInnerRadius2;         // fInnerRadius^2
    uniform float fKrESun;               // Kr * ESun
    uniform float fKmESun;               // Km * ESun
    uniform float fKr4PI;                // Kr * 4 * PI
    uniform float fKm4PI;                // Km * 4 * PI
    uniform float fScale;                // 1 / (fOuterRadius - fInnerRadius)
    uniform float fScaleDepth;           // The scale depth (i.e. the altitude at which the atmosphere's average density is found)
    uniform float fScaleOverScaleDepth;  // fScale / fScaleDepth
    uniform sampler2D tDiffuse;
    uniform mat4 m4ModelInverse;         // inverse of model matrix, used for transforming world space to model space

    varying vec3 v3Direction;
    varying vec3 c0;
    varying vec3 c1;
    varying vec3 vNormal;
    varying vec2 vUv;

    const int nSamples = 3;
    const float fSamples = 3.0;

    float scale(float fCos)
    {
      float x = 1.0 - fCos;
      return fScaleDepth * exp(-0.00287 + x*(0.459 + x*(3.83 + x*(-6.80 + x*5.25))));
    }

    void main(void)
    {
      vec3 v3CameraModelPosition = vec3(m4ModelInverse * vec4(cameraPosition, 1.0));
      // Get the ray from the camera to the vertex and its length (which is the far point of the ray passing through the atmosphere)
      vec3 v3Ray = position - v3CameraModelPosition;
      float fFar = length(v3Ray);
      v3Ray /= fFar;

      // Calculate the closest intersection of the ray with the outer atmosphere (which is the near point of the ray passing through the atmosphere)
      float B = 2.0 * dot(v3CameraModelPosition, v3Ray);
      float C = fCameraHeight2 - fOuterRadius2;
      float fDet = max(0.0, B*B - 4.0 * C);
      float fNear = 0.5 * (-B - sqrt(fDet));

      // Calculate the ray's starting position, then calculate its scattering offset
      vec3 v3Start = v3CameraModelPosition + v3Ray * fNear;
      fFar -= fNear;
      float fDepth = exp((fInnerRadius - fOuterRadius) / fScaleDepth);
      float fCameraAngle = dot(-v3Ray, position) / length(position);
      float fLightAngle = dot(v3LightPosition, position) / length(position);
      float fCameraScale = scale(fCameraAngle);
      float fLightScale = scale(fLightAngle);
      float fCameraOffset = fDepth*fCameraScale;
      float fTemp = (fLightScale + fCameraScale);

      // Initialize the scattering loop variables
      float fSampleLength = fFar / fSamples;
      float fScaledLength = fSampleLength * fScale;
      vec3 v3SampleRay = v3Ray * fSampleLength;
      vec3 v3SamplePoint = v3Start + v3SampleRay * 0.5;

      // Now loop through the sample rays
      vec3 v3FrontColor = vec3(0.0, 0.0, 0.0);
      vec3 v3Attenuate;
      for(int i=0; i<nSamples; i++)
      {
        float fHeight = length(v3SamplePoint);
        float fDepth = exp(fScaleOverScaleDepth * (fInnerRadius - fHeight));
        float fScatter = fDepth*fTemp - fCameraOffset;
        v3Attenuate = exp(-fScatter * (v3InvWavelength * fKr4PI + fKm4PI));
        v3FrontColor += v3Attenuate * (fDepth * fScaledLength);
        v3SamplePoint += v3SampleRay;
      }

      // Calculate the attenuation factor for the ground
      c0 = v3Attenuate;
      c1 = v3FrontColor * (v3InvWavelength * fKrESun + fKmESun);

      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      //gl_TexCoord[0] = gl_TextureMatrix[0] * gl_MultiTexCoord0;
      //gl_TexCoord[1] = gl_TextureMatrix[1] * gl_MultiTexCoord1;
      vUv = uv;
      vNormal = normal;
    }
</script>

<script type="application/x-glsl" id="vertexSky">
    // Atmospheric scattering vertex shader
    //
    // Author: Sean O'Neil
    //
    // Copyright (c) 2004 Sean O'Neil
    //

    uniform vec3 v3LightPosition;        // The direction vector to the light source
    uniform vec3 v3InvWavelength;        // 1 / pow(wavelength, 4) for the red, green, and blue channels
    uniform float fCameraHeight;         // The camera's current height
    uniform float fCameraHeight2;        // fCameraHeight^2
    uniform float fOuterRadius;          // The outer (atmosphere) radius
    uniform float fOuterRadius2;         // fOuterRadius^2
    uniform float fInnerRadius;          // The inner (planetary) radius
    uniform float fInnerRadius2;         // fInnerRadius^2
    uniform float fKrESun;               // Kr * ESun
    uniform float fKmESun;               // Km * ESun
    uniform float fKr4PI;                // Kr * 4 * PI
    uniform float fKm4PI;                // Km * 4 * PI
    uniform float fScale;                // 1 / (fOuterRadius - fInnerRadius)
    uniform float fScaleDepth;           // The scale depth (i.e. the altitude at which the atmosphere's average density is found)
    uniform float fScaleOverScaleDepth;  // fScale / fScaleDepth
    uniform mat4 m4ModelInverse;         // inverse of model matrix, used for transforming world space to model space

    const int nSamples = 3;
    const float fSamples = 3.0;

    varying vec3 v3Direction;
    varying vec3 c0;
    varying vec3 c1;


    float scale(float fCos)
    {
      float x = 1.0 - fCos;
      return fScaleDepth * exp(-0.00287 + x*(0.459 + x*(3.83 + x*(-6.80 + x*5.25))));
    }

    void main(void)
    {
      vec3 v3CameraModelPosition = vec3(m4ModelInverse * vec4(cameraPosition, 1.0));
      // Get the ray from the camera to the vertex and its length (which is the far point of the ray passing through the atmosphere)
      vec3 v3Ray = position - v3CameraModelPosition;
      float fFar = length(v3Ray);
      v3Ray /= fFar;

      // Calculate the closest intersection of the ray with the outer atmosphere (which is the near point of the ray passing through the atmosphere)
      float B = 2.0 * dot(v3CameraModelPosition, v3Ray);
      float C = fCameraHeight2 - fOuterRadius2;
      float fDet = max(0.0, B*B - 4.0 * C);
      float fNear = 0.5 * (-B - sqrt(fDet));

      // Calculate the ray's starting position, then calculate its scattering offset
      vec3 v3Start = v3CameraModelPosition + v3Ray * fNear;
      fFar -= fNear;
      float fStartAngle = dot(v3Ray, v3Start) / fOuterRadius;
      float fStartDepth = exp(-1.0 / fScaleDepth);
      float fStartOffset = fStartDepth * scale(fStartAngle);
      //c0 = vec3(1.0, 0, 0) * fStartAngle;

      // Initialize the scattering loop variables
      float fSampleLength = fFar / fSamples;
      float fScaledLength = fSampleLength * fScale;
      vec3 v3SampleRay = v3Ray * fSampleLength;
      vec3 v3SamplePoint = v3Start + v3SampleRay * 0.5;

      //gl_FrontColor = vec4(0.0, 0.0, 0.0, 0.0);

      // Now loop through the sample rays
      vec3 v3FrontColor = vec3(0.0, 0.0, 0.0);
      for(int i=0; i<nSamples; i++)
      {
        float fHeight = length(v3SamplePoint);
        float fDepth = exp(fScaleOverScaleDepth * (fInnerRadius - fHeight));
        float fLightAngle = dot(v3LightPosition, v3SamplePoint) / fHeight;
        float fCameraAngle = dot(v3Ray, v3SamplePoint) / fHeight;
        float fScatter = (fStartOffset + fDepth * (scale(fLightAngle) - scale(fCameraAngle)));
        vec3 v3Attenuate = exp(-fScatter * (v3InvWavelength * fKr4PI + fKm4PI));

        v3FrontColor += v3Attenuate * (fDepth * fScaledLength);
        v3SamplePoint += v3SampleRay;
     }

      // Finally, scale the Mie and Rayleigh colors and set up the varying variables for the pixel shader
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      c0 = v3FrontColor * (v3InvWavelength * fKrESun);
      c1 = v3FrontColor * fKmESun;
      v3Direction = v3CameraModelPosition - position;
    }
</script>