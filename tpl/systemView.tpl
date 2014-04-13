<!DOCTYPE html>
<html lang="en">
    <head>
        <title>three.js webgl - orbit controls</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
        <style>
            body {
                color: #000;
                font-family:Monospace;
                font-size:13px;
                text-align:center;
                font-weight: bold;

                background-color: #fff;
                margin: 0px;
                overflow: hidden;
            }

            #info {
                color:#000;
                position: absolute;
                top: 0px; width: 100%;
                padding: 5px;

            }

            a {
                color: red;
            }

            #body-info-container {
                background-color: gray;
                color: white;
                position: absolute;
                top: 0px; 
                right: 0px;
                width: 200px;
                padding: 5px;
            }

            #body-info {
                

            }
        </style>
    </head>

    <body>


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

        <div id="container"></div>

        <script type="text/javascript" src="js/jquery-1.11.0.min.js"></script>

        <script type="text/javascript" src="js/vendor/ces-browser.min.js"></script>

        <script src="js/vendor/three.min.js"></script>

        <script src="js/vendor/OrbitControls.js"></script>

        <script src="js/vendor/Detector.js"></script>
        <script src="js/vendor/stats.min.js"></script>

        <script src={{ownersDB}}></script> 
        <script src={{asteroidDB}}></script> 

        <script src="js/util.js"></script>
        <script src="js/ellipse.js"></script>
        <script src="js/ephemeris.js"></script>
        <script src="js/main.js"></script>

        <div id="body-info-container">
            <a id="claim-asteroid-button" href="#">Claim this asteroid</a>
            <div id="body-info">foo</div>
        </div>

    </body>
</html>
