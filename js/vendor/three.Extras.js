/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Full-screen textured quad shader
 */
THREE.CopyShader = {
    uniforms: {
        "tDiffuse": { type: "t", value: null },
        "opacity": { type: "f", value: 1.0 }
    },
    vertexShader: [
        "varying vec2 vUv;",
        "void main() {",
        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        "}"
    ].join("\n"),
    fragmentShader: [
        "uniform float opacity;",
        "uniform sampler2D tDiffuse;",
        "varying vec2 vUv;",
        "void main() {",
        "vec4 texel = texture2D( tDiffuse, vUv );",
        "gl_FragColor = opacity * texel;",
        "}"
    ].join("\n")
};

/**
 * @author alteredq / http://alteredqualia.com/
 */
THREE.ShaderPass = function ( shader, textureID ) {
    this.textureID = ( textureID !== undefined ) ? textureID : "tDiffuse";
    this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );
    this.material = new THREE.ShaderMaterial( {
        uniforms: this.uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader
    } );
    this.renderToScreen = false;
    this.enabled = true;
    this.needsSwap = true;
    this.clear = false;
    this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
    this.scene = new THREE.Scene();
    this.quad = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), null );
    this.scene.add( this.quad );
};
THREE.ShaderPass.prototype = {
    render: function ( renderer, writeBuffer, readBuffer, delta ) {
        if ( this.uniforms[ this.textureID ] ) {
            this.uniforms[ this.textureID ].value = readBuffer;
        }
        this.quad.material = this.material;
        if ( this.renderToScreen ) {
            renderer.render( this.scene, this.camera );
        } else {
            renderer.render( this.scene, this.camera, writeBuffer, this.clear );
        }
    }
};

/**
 * @author alteredq / http://alteredqualia.com/
 */
THREE.MaskPass = function ( scene, camera ) {
    this.scene = scene;
    this.camera = camera;
    this.enabled = true;
    this.clear = true;
    this.needsSwap = false;
    this.inverse = false;
};
THREE.MaskPass.prototype = {
    render: function ( renderer, writeBuffer, readBuffer, delta ) {
        var context = renderer.context;
// don't update color or depth
        context.colorMask( false, false, false, false );
        context.depthMask( false );
// set up stencil
        var writeValue, clearValue;
        if ( this.inverse ) {
            writeValue = 0;
            clearValue = 1;
        } else {
            writeValue = 1;
            clearValue = 0;
        }
        context.enable( context.STENCIL_TEST );
        context.stencilOp( context.REPLACE, context.REPLACE, context.REPLACE );
        context.stencilFunc( context.ALWAYS, writeValue, 0xffffffff );
        context.clearStencil( clearValue );
// draw into the stencil buffer
        renderer.render( this.scene, this.camera, readBuffer, this.clear );
        renderer.render( this.scene, this.camera, writeBuffer, this.clear );
// re-enable update of color and depth
        context.colorMask( true, true, true, true );
        context.depthMask( true );
// only render where stencil is set to 1
        context.stencilFunc( context.EQUAL, 1, 0xffffffff ); // draw if == 1
        context.stencilOp( context.KEEP, context.KEEP, context.KEEP );
    }
};
THREE.ClearMaskPass = function () {
    this.enabled = true;
};
THREE.ClearMaskPass.prototype = {
    render: function ( renderer, writeBuffer, readBuffer, delta ) {
        var context = renderer.context;
        context.disable( context.STENCIL_TEST );
    }
};

/**
 * Depth-of-field post-process with bokeh shader
 */
THREE.BokehPass = function ( scene, camera, params ) {
    this.scene = scene;
    this.camera = camera;
    var focus = ( params.focus !== undefined ) ? params.focus : 1.0;
    var aspect = ( params.aspect !== undefined ) ? params.aspect : camera.aspect;
    var aperture = ( params.aperture !== undefined ) ? params.aperture : 0.025;
    var maxblur = ( params.maxblur !== undefined ) ? params.maxblur : 1.0;
// render targets
    var width = params.width || window.innerWidth || 1;
    var height = params.height || window.innerHeight || 1;
    this.renderTargetColor = new THREE.WebGLRenderTarget( width, height, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBFormat
    } );
    this.renderTargetDepth = this.renderTargetColor.clone();
// depth material
    this.materialDepth = new THREE.MeshDepthMaterial();
// bokeh material
    if ( THREE.BokehShader === undefined ) {
        console.error( "THREE.BokehPass relies on THREE.BokehShader" );
    }
    var bokehShader = THREE.BokehShader;
    var bokehUniforms = THREE.UniformsUtils.clone( bokehShader.uniforms );
    bokehUniforms[ "tDepth" ].value = this.renderTargetDepth;
    bokehUniforms[ "focus" ].value = focus;
    bokehUniforms[ "aspect" ].value = aspect;
    bokehUniforms[ "aperture" ].value = aperture;
    bokehUniforms[ "maxblur" ].value = maxblur;
    this.materialBokeh = new THREE.ShaderMaterial({
        uniforms: bokehUniforms,
        vertexShader: bokehShader.vertexShader,
        fragmentShader: bokehShader.fragmentShader
    });
    this.uniforms = bokehUniforms;
    this.enabled = true;
    this.needsSwap = false;
    this.renderToScreen = false;
    this.clear = false;
    this.camera2 = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
    this.scene2 = new THREE.Scene();
    this.quad2 = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), null );
    this.scene2.add( this.quad2 );
};
THREE.BokehPass.prototype = {
    render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {
        this.quad2.material = this.materialBokeh;
// Render depth into texture
        this.scene.overrideMaterial = this.materialDepth;
        renderer.render( this.scene, this.camera, this.renderTargetDepth, true );
// Render bokeh composite
        this.uniforms[ "tColor" ].value = readBuffer;
        if ( this.renderToScreen ) {
            renderer.render( this.scene2, this.camera2 );
        } else {
            renderer.render( this.scene2, this.camera2, writeBuffer, this.clear );
        }
        this.scene.overrideMaterial = null;
    }
};

/**
 * Depth-of-field post-process with bokeh 2 shader
 */
THREE.Bokeh2Pass = function ( scene, camera, params ) {
    this.scene = scene;
    this.camera = camera;
    var shaderFocus = ( params.shaderFocus !== undefined ) ? params.shaderFocus : {type: 'i', value: 0};
    var focusCoords = ( params.focusCoords !== undefined ) ? params.focusCoords : {type: 'v2', value: new THREE.Vector2(0.5, 0.5)};

    var fstop = ( params.fstop !== undefined ) ? params.fstop : {type: 'f', value: 2.2};
    var maxblur = ( params.maxblur !== undefined ) ? params.maxblur : {type: 'f', value: 1.0};

    var showFocus = ( params.showFocus !== undefined ) ? params.showFocus : {type: 'i', value: 0};
    var focalDepth = ( params.focalDepth !== undefined ) ? params.focalDepth : {type: 'f', value: 2.8};
    var manualdof = ( params.manualdof !== undefined ) ? params.manualdof : {type: 'i', value: 0};
    var vignetting = ( params.vignetting !== undefined ) ? params.vignetting : {type: 'i', value: 0};
    var depthblur = ( params.depthblur !== undefined ) ? params.depthblur : {type: 'i', value: 0};

    var threshold = ( params.threshold !== undefined ) ? params.threshold : {type: 'f', value: 0.5};
    var gain = ( params.gain !== undefined ) ? params.gain : {type: 'f', value: 2.0};
    var bias = ( params.bias !== undefined ) ? params.bias : {type: 'f', value: 0.5};
    var fringe = ( params.fringe !== undefined ) ? params.fringe : {type: 'f', value: 0.7};
    var dithering = ( params.dithering !== undefined ) ? params.dithering : {type: 'f', value: 0.0001};

    var focalLength = ( params.focalLength !== undefined ) ? params.focalLength : {type: 'f', value: 60.0};
    var noise = ( params.noise !== undefined ) ? params.noise : {type: 'i', value: 1};
    var pentagon = ( params.pentagon !== undefined ) ? params.pentagon : {type: 'i', value: 0};

    var znear = ( params.near !== undefined ) ? params.near : {type: 'f', value: 75};
    var zfar = ( params.far !== undefined ) ? params.far : {type: 'f', value: 10000};
    var samples = ( params.samples !== undefined ) ? params.samples : {type: 'i', value: 4};
    var rings = ( params.rings !== undefined ) ? params.rings : {type: 'i', value: 4};

// render targets
    var width = params.width || window.innerWidth || 1;
    var height = params.height || window.innerHeight || 1;
    this.renderTargetColor = new THREE.WebGLRenderTarget( width, height, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBFormat
    } );
    this.renderTargetDepth = this.renderTargetColor.clone();
// depth material
    this.materialDepth = new THREE.MeshDepthMaterial();
// bokeh material
    if ( THREE.Bokeh2Shader === undefined ) {
        console.error( "THREE.BokehPass relies on THREE.Bokeh2Shader" );
    }
    var bokehShader = THREE.Bokeh2Shader;
    var bokehUniforms = THREE.UniformsUtils.clone( bokehShader.uniforms );

    bokehUniforms[ "shaderFocus" ] = shaderFocus;
    bokehUniforms[ "focusCoords" ] = focusCoords;

    bokehUniforms[ "fstop" ] = fstop;
    bokehUniforms[ "maxblur" ] = maxblur;

    bokehUniforms[ "showFocus" ] = showFocus;
    bokehUniforms[ "focalDepth" ] = focalDepth;
    bokehUniforms[ "manualdof" ] = manualdof;
    bokehUniforms[ "vignetting" ] = vignetting;
    bokehUniforms[ "depthblur" ] = depthblur;
    bokehUniforms[ "dithering" ] = dithering;

    bokehUniforms[ "threshold" ] = threshold;
    bokehUniforms[ "gain" ] = gain;
    bokehUniforms[ "bias" ] = bias;
    bokehUniforms[ "fringe" ] = fringe;

    bokehUniforms[ "focalLength" ] = focalLength;
    bokehUniforms[ "noise" ] = noise;
    bokehUniforms[ "pentagon" ] = pentagon;
    bokehUniforms[ "tDepth" ] = {type: 't', value: this.renderTargetDepth};
    bokehUniforms[ "znear" ] = znear;
    bokehUniforms[ "zfar" ] = zfar;

    this.materialBokeh = new THREE.ShaderMaterial({
        defines: {SAMPLES: samples.value, RINGS: rings.value},
        uniforms: bokehUniforms,
        vertexShader: bokehShader.vertexShader,
        fragmentShader: bokehShader.fragmentShader
    });
    this.uniforms = bokehUniforms;
    this.enabled = true;
    this.needsSwap = false;
    this.renderToScreen = false;
    this.clear = false;
    this.camera2 = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
    this.scene2 = new THREE.Scene();
    this.quad2 = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), null );
    this.scene2.add( this.quad2 );
};
THREE.Bokeh2Pass.prototype = {
    render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {
        this.quad2.material = this.materialBokeh;
// Render depth into texture
        this.scene.overrideMaterial = this.materialDepth;
        renderer.render( this.scene, this.camera, this.renderTargetDepth, true );
// Render bokeh composite
        this.uniforms[ "tColor" ].value = readBuffer;
        if ( this.renderToScreen ) {
            renderer.render( this.scene2, this.camera2 );
        } else {
            renderer.render( this.scene2, this.camera2, writeBuffer, this.clear );
        }
        this.scene.overrideMaterial = null;
    }
};

/**
 * @author alteredq / http://alteredqualia.com/
 */
THREE.RenderPass = function ( scene, camera, overrideMaterial, clearColor, clearAlpha ) {
    this.scene = scene;
    this.camera = camera;
    this.overrideMaterial = overrideMaterial;
    this.clearColor = clearColor;
    this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 1;
    this.oldClearColor = new THREE.Color();
    this.oldClearAlpha = 1;
    this.enabled = true;
    this.clear = true;
    this.needsSwap = false;
    this.clearDepth = false;
};
THREE.RenderPass.prototype = {
    render: function ( renderer, writeBuffer, readBuffer, delta ) {
        this.scene.overrideMaterial = this.overrideMaterial;
        if ( this.clearColor ) {
            this.oldClearColor.copy( renderer.getClearColor() );
            this.oldClearAlpha = renderer.getClearAlpha();
            renderer.setClearColor( this.clearColor, this.clearAlpha );
        }
        if ( this.clearDepth ) {
            renderer.clear(false, true, false);
        }
        renderer.render( this.scene, this.camera, readBuffer, this.clear );
        if ( this.clearColor ) {
            renderer.setClearColor( this.oldClearColor, this.oldClearAlpha );
        }
        this.scene.overrideMaterial = null;
    }
};

/**
 * @author alteredq / http://alteredqualia.com/
 */
THREE.MaskPass = function ( scene, camera ) {
    this.scene = scene;
    this.camera = camera;
    this.enabled = true;
    this.clear = true;
    this.needsSwap = false;
    this.inverse = false;
};
THREE.MaskPass.prototype = {
    render: function ( renderer, writeBuffer, readBuffer, delta ) {
        var context = renderer.context;
// don't update color or depth
        context.colorMask( false, false, false, false );
        context.depthMask( false );
// set up stencil
        var writeValue, clearValue;
        if ( this.inverse ) {
            writeValue = 0;
            clearValue = 1;
        } else {
            writeValue = 1;
            clearValue = 0;
        }
        context.enable( context.STENCIL_TEST );
        context.stencilOp( context.REPLACE, context.REPLACE, context.REPLACE );
        context.stencilFunc( context.ALWAYS, writeValue, 0xffffffff );
        context.clearStencil( clearValue );
// draw into the stencil buffer
        renderer.render( this.scene, this.camera, readBuffer, this.clear );
        renderer.render( this.scene, this.camera, writeBuffer, this.clear );
// re-enable update of color and depth
        context.colorMask( true, true, true, true );
        context.depthMask( true );
// only render where stencil is set to 1
        context.stencilFunc( context.EQUAL, 1, 0xffffffff ); // draw if == 1
        context.stencilOp( context.KEEP, context.KEEP, context.KEEP );
    }
};
THREE.ClearMaskPass = function () {
    this.enabled = true;
};
THREE.ClearMaskPass.prototype = {
    render: function ( renderer, writeBuffer, readBuffer, delta ) {
        var context = renderer.context;
        context.disable( context.STENCIL_TEST );
    }
};

/**
 * @author alteredq / http://alteredqualia.com/
 */
THREE.EffectComposer = function ( renderer, renderTarget ) {
    this.renderer = renderer;
    if ( renderTarget === undefined ) {
        var width = window.innerWidth || 1;
        var height = window.innerHeight || 1;
        var parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
        renderTarget = new THREE.WebGLRenderTarget( width, height, parameters );
    }
    this.renderTarget1 = renderTarget;
    this.renderTarget2 = renderTarget.clone();
    this.writeBuffer = this.renderTarget1;
    this.readBuffer = this.renderTarget2;
    this.passes = [];
    if ( THREE.CopyShader === undefined )
        console.error( "THREE.EffectComposer relies on THREE.CopyShader" );
    this.copyPass = new THREE.ShaderPass( THREE.CopyShader );
};
THREE.EffectComposer.prototype = {
    swapBuffers: function() {
        var tmp = this.readBuffer;
        this.readBuffer = this.writeBuffer;
        this.writeBuffer = tmp;
    },
    addPass: function ( pass ) {
        this.passes.push( pass );
    },
    removePass: function ( pass ) {
        for (var i = 0; i < this.passes.length; i++) {
            if (this.passes[i] == pass) {
                this.passes.splice(i, 1);
            }
        }
    },
    insertPass: function ( pass, index ) {
        this.passes.splice( index, 0, pass );
    },
    render: function ( delta ) {
        this.writeBuffer = this.renderTarget1;
        this.readBuffer = this.renderTarget2;
        var maskActive = false;
        var pass, i, il = this.passes.length;
        for ( i = 0; i < il; i ++ ) {
            pass = this.passes[ i ];
            if ( !pass.enabled ) continue;
            pass.render( this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive );
            if ( pass.needsSwap ) {
                if ( maskActive ) {
                    var context = this.renderer.context;
                    context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );
                    this.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, delta );
                    context.stencilFunc( context.EQUAL, 1, 0xffffffff );
                }
                this.swapBuffers();
            }
            if ( pass instanceof THREE.MaskPass ) {
                maskActive = true;
            } else if ( pass instanceof THREE.ClearMaskPass ) {
                maskActive = false;
            }
        }
    },
    reset: function ( renderTarget ) {
        if ( renderTarget === undefined ) {
            renderTarget = this.renderTarget1.clone();
            renderTarget.width = window.innerWidth;
            renderTarget.height = window.innerHeight;
        }
        this.renderTarget1 = renderTarget;
        this.renderTarget2 = renderTarget.clone();
        this.writeBuffer = this.renderTarget1;
        this.readBuffer = this.renderTarget2;
    },
    setSize: function ( width, height ) {
        var renderTarget = this.renderTarget1.clone();
        renderTarget.width = width;
        renderTarget.height = height;
        this.reset( renderTarget );
    }
};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Depth-of-field shader with bokeh
 * ported from GLSL shader by Martins Upitis
 * http://artmartinsh.blogspot.com/2010/02/glsl-lens-blur-filter-with-bokeh.html
 */
THREE.BokehShader = {
    uniforms: {
        "tColor": { type: "t", value: null },
        "tDepth": { type: "t", value: null },
        "focus": { type: "f", value: 1.0 },
        "aspect": { type: "f", value: 1.0 },
        "aperture": { type: "f", value: 0.025 },
        "maxblur": { type: "f", value: 1.0 }
    },
    vertexShader: [
        "varying vec2 vUv;",
        "void main() {",
        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        "}"
    ].join("\n"),
    fragmentShader: [
        "varying vec2 vUv;",
        "uniform sampler2D tColor;",
        "uniform sampler2D tDepth;",
        "uniform float maxblur;", // max blur amount
        "uniform float aperture;", // aperture - bigger values for shallower depth of field
        "uniform float focus;",
        "uniform float aspect;",
        "void main() {",
        "vec2 aspectcorrect = vec2( 1.0, aspect );",
        "vec4 depth1 = texture2D( tDepth, vUv );",
        "float factor = depth1.x - focus;",
        "vec2 dofblur = vec2 ( clamp( factor * aperture, -maxblur, maxblur ) );",
        "vec2 dofblur9 = dofblur * 0.9;",
        "vec2 dofblur7 = dofblur * 0.7;",
        "vec2 dofblur4 = dofblur * 0.4;",
        "vec4 col = vec4( 0.0 );",
        "col += texture2D( tColor, vUv.xy );",
        "col += texture2D( tColor, vUv.xy + ( vec2( 0.0, 0.4 ) * aspectcorrect ) * dofblur );",
        "col += texture2D( tColor, vUv.xy + ( vec2( 0.15, 0.37 ) * aspectcorrect ) * dofblur );",
        "col += texture2D( tColor, vUv.xy + ( vec2( 0.29, 0.29 ) * aspectcorrect ) * dofblur );",
        "col += texture2D( tColor, vUv.xy + ( vec2( -0.37, 0.15 ) * aspectcorrect ) * dofblur );",
        "col += texture2D( tColor, vUv.xy + ( vec2( 0.40, 0.0 ) * aspectcorrect ) * dofblur );",
        "col += texture2D( tColor, vUv.xy + ( vec2( 0.37, -0.15 ) * aspectcorrect ) * dofblur );",
        "col += texture2D( tColor, vUv.xy + ( vec2( 0.29, -0.29 ) * aspectcorrect ) * dofblur );",
        "col += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.37 ) * aspectcorrect ) * dofblur );",
        "col += texture2D( tColor, vUv.xy + ( vec2( 0.0, -0.4 ) * aspectcorrect ) * dofblur );",
        "col += texture2D( tColor, vUv.xy + ( vec2( -0.15, 0.37 ) * aspectcorrect ) * dofblur );",
        "col += texture2D( tColor, vUv.xy + ( vec2( -0.29, 0.29 ) * aspectcorrect ) * dofblur );",
        "col += texture2D( tColor, vUv.xy + ( vec2( 0.37, 0.15 ) * aspectcorrect ) * dofblur );",
        "col += texture2D( tColor, vUv.xy + ( vec2( -0.4, 0.0 ) * aspectcorrect ) * dofblur );",
        "col += texture2D( tColor, vUv.xy + ( vec2( -0.37, -0.15 ) * aspectcorrect ) * dofblur );",
        "col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur );",
        "col += texture2D( tColor, vUv.xy + ( vec2( 0.15, -0.37 ) * aspectcorrect ) * dofblur );",
        "col += texture2D( tColor, vUv.xy + ( vec2( 0.15, 0.37 ) * aspectcorrect ) * dofblur9 );",
        "col += texture2D( tColor, vUv.xy + ( vec2( -0.37, 0.15 ) * aspectcorrect ) * dofblur9 );",
        "col += texture2D( tColor, vUv.xy + ( vec2( 0.37, -0.15 ) * aspectcorrect ) * dofblur9 );",
        "col += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.37 ) * aspectcorrect ) * dofblur9 );",
        "col += texture2D( tColor, vUv.xy + ( vec2( -0.15, 0.37 ) * aspectcorrect ) * dofblur9 );",
        "col += texture2D( tColor, vUv.xy + ( vec2( 0.37, 0.15 ) * aspectcorrect ) * dofblur9 );",
        "col += texture2D( tColor, vUv.xy + ( vec2( -0.37, -0.15 ) * aspectcorrect ) * dofblur9 );",
        "col += texture2D( tColor, vUv.xy + ( vec2( 0.15, -0.37 ) * aspectcorrect ) * dofblur9 );",
        "col += texture2D( tColor, vUv.xy + ( vec2( 0.29, 0.29 ) * aspectcorrect ) * dofblur7 );",
        "col += texture2D( tColor, vUv.xy + ( vec2( 0.40, 0.0 ) * aspectcorrect ) * dofblur7 );",
        "col += texture2D( tColor, vUv.xy + ( vec2( 0.29, -0.29 ) * aspectcorrect ) * dofblur7 );",
        "col += texture2D( tColor, vUv.xy + ( vec2( 0.0, -0.4 ) * aspectcorrect ) * dofblur7 );",
        "col += texture2D( tColor, vUv.xy + ( vec2( -0.29, 0.29 ) * aspectcorrect ) * dofblur7 );",
        "col += texture2D( tColor, vUv.xy + ( vec2( -0.4, 0.0 ) * aspectcorrect ) * dofblur7 );",
        "col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur7 );",
        "col += texture2D( tColor, vUv.xy + ( vec2( 0.0, 0.4 ) * aspectcorrect ) * dofblur7 );",
        "col += texture2D( tColor, vUv.xy + ( vec2( 0.29, 0.29 ) * aspectcorrect ) * dofblur4 );",
        "col += texture2D( tColor, vUv.xy + ( vec2( 0.4, 0.0 ) * aspectcorrect ) * dofblur4 );",
        "col += texture2D( tColor, vUv.xy + ( vec2( 0.29, -0.29 ) * aspectcorrect ) * dofblur4 );",
        "col += texture2D( tColor, vUv.xy + ( vec2( 0.0, -0.4 ) * aspectcorrect ) * dofblur4 );",
        "col += texture2D( tColor, vUv.xy + ( vec2( -0.29, 0.29 ) * aspectcorrect ) * dofblur4 );",
        "col += texture2D( tColor, vUv.xy + ( vec2( -0.4, 0.0 ) * aspectcorrect ) * dofblur4 );",
        "col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur4 );",
        "col += texture2D( tColor, vUv.xy + ( vec2( 0.0, 0.4 ) * aspectcorrect ) * dofblur4 );",
        "gl_FragColor = col / 41.0;",
        "gl_FragColor.a = 1.0;",
        "}"
    ].join("\n")
};

/**
 * @author zz85 / https://github.com/zz85 | twitter.com/blurspline
 *
 * Depth-of-field shader with bokeh
 * ported from GLSL shader by Martins Upitis
 * http://blenderartists.org/forum/showthread.php?237488-GLSL-depth-of-field-with-bokeh-v2-4-(update)
 *
 * Requires #define RINGS and SAMPLES integers
 */
THREE.Bokeh2Shader = {
    defines: {
        RINGS: 4,
        SAMPLES: 4
    },
    uniforms: {
        "textureWidth": { type: "f", value: 1.0 },
        "textureHeight": { type: "f", value: 1.0 },
        "focalDepth": { type: "f", value: 1.0 },
        "focalLength": { type: "f", value: 60.0 },
        "fstop": { type: "f", value: 0.9 },
        "tColor": { type: "t", value: null },
        "tDepth": { type: "t", value: null },
        "maxblur": { type: "f", value: 1.0 },
        "showFocus": { type: "i", value: 0 },
        "manualdof": { type: "i", value: 0 },
        "vignetting": { type: "i", value: 0 },
        "depthblur": { type: "i", value: 0 },
        "threshold": { type: "f", value: 0.5 },
        "gain": { type: "f", value: 2.0 },
        "bias": { type: "f", value: 0.5 },
        "fringe": { type: "f", value: 0.7 },
        "znear": { type: "f", value: 0.1 },
        "zfar": { type: "f", value: 100 },
        "noise": { type: "i", value: 1 },
        "dithering": { type: "f", value: 0.0001 },
        "pentagon": { type: "i", value: 0 },
        "shaderFocus": { type: "i", value: 1 },
        "focusCoords": { type: "v2", value: new THREE.Vector2()}
    },
    vertexShader: [
        "varying vec2 vUv;",
        "void main() {",
        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        "}"
    ].join("\n"),
    fragmentShader: [
        "varying vec2 vUv;",
        "uniform sampler2D tColor;",
        "uniform sampler2D tDepth;",
        "uniform float textureWidth;",
        "uniform float textureHeight;",
        "const float PI = 3.14159265;",
        "float width = textureWidth; //texture width",
        "float height = textureHeight; //texture height",
        "vec2 texel = vec2(1.0/width,1.0/height);",
        "uniform float focalDepth; //focal distance value in meters, but you may use autofocus option below",
        "uniform float focalLength; //focal length in mm",
        "uniform float fstop; //f-stop value",
        "uniform int showFocus; //show debug focus point and focal range (red = focal point, green = focal range)",
        "/*",
        "make sure that these two values are the same for your camera, otherwise distances will be wrong.",
        "*/",
        "uniform float znear; // camera clipping start",
        "uniform float zfar; // camera clipping end",
        "//------------------------------------------",
        "//user variables",
        "const int samples = SAMPLES; //samples on the first ring",
        "const int rings = RINGS; //ring count",
        "const int maxringsamples = rings * samples;",
        "uniform int manualdof; // manual dof calculation",
        "float ndofstart = 1.0; // near dof blur start",
        "float ndofdist = 2.0; // near dof blur falloff distance",
        "float fdofstart = 1.0; // far dof blur start",
        "float fdofdist = 3.0; // far dof blur falloff distance",
        "float CoC = 0.03; //circle of confusion size in mm (35mm film = 0.03mm)",
        "uniform int vignetting; // use optical lens vignetting",
        "float vignout = 1.3; // vignetting outer border",
        "float vignin = 0.0; // vignetting inner border",
        "float vignfade = 22.0; // f-stops till vignete fades",
        "uniform int shaderFocus;",
        "int autofocus = shaderFocus;",
        "//use autofocus in shader - use with focusCoords",
        "// disable if you use external focalDepth value",
        "uniform vec2 focusCoords;",
        "// autofocus point on screen (0.0,0.0 - left lower corner, 1.0,1.0 - upper right)",
        "// if center of screen use vec2(0.5, 0.5);",
        "uniform float maxblur;",
        "//clamp value of max blur (0.0 = no blur, 1.0 default)",
        "uniform float threshold; // highlight threshold;",
        "uniform float gain; // highlight gain;",
        "uniform float bias; // bokeh edge bias",
        "uniform float fringe; // bokeh chromatic aberration / fringing",
        "uniform int noise; //use noise instead of pattern for sample dithering",
        "uniform float dithering;",
        "float namount = dithering; //dither amount",
        "uniform int depthblur; // blur the depth buffer",
        "float dbsize = 1.25; // depth blur size",
        "/*",
        "next part is experimental",
        "not looking good with small sample and ring count",
        "looks okay starting from samples = 4, rings = 4",
        "*/",
        "uniform int pentagon; //use pentagon as bokeh shape?",
        "float feather = 0.4; //pentagon shape feather",
        "//------------------------------------------",
        "float penta(vec2 coords) {",
        "//pentagonal shape",
        "float scale = float(rings) - 1.3;",
        "vec4 HS0 = vec4( 1.0, 0.0, 0.0, 1.0);",
        "vec4 HS1 = vec4( 0.309016994, 0.951056516, 0.0, 1.0);",
        "vec4 HS2 = vec4(-0.809016994, 0.587785252, 0.0, 1.0);",
        "vec4 HS3 = vec4(-0.809016994,-0.587785252, 0.0, 1.0);",
        "vec4 HS4 = vec4( 0.309016994,-0.951056516, 0.0, 1.0);",
        "vec4 HS5 = vec4( 0.0 ,0.0 , 1.0, 1.0);",
        "vec4 one = vec4( 1.0 );",
        "vec4 P = vec4((coords),vec2(scale, scale));",
        "vec4 dist = vec4(0.0);",
        "float inorout = -4.0;",
        "dist.x = dot( P, HS0 );",
        "dist.y = dot( P, HS1 );",
        "dist.z = dot( P, HS2 );",
        "dist.w = dot( P, HS3 );",
        "dist = smoothstep( -feather, feather, dist );",
        "inorout += dot( dist, one );",
        "dist.x = dot( P, HS4 );",
        "dist.y = HS5.w - abs( P.z );",
        "dist = smoothstep( -feather, feather, dist );",
        "inorout += dist.x;",
        "return clamp( inorout, 0.0, 1.0 );",
        "}",
        "float bdepth(vec2 coords) {",
        "// Depth buffer blur",
        "float d = 0.0;",
        "float kernel[9];",
        "vec2 offset[9];",
        "vec2 wh = vec2(texel.x, texel.y) * dbsize;",
        "offset[0] = vec2(-wh.x,-wh.y);",
        "offset[1] = vec2( 0.0, -wh.y);",
        "offset[2] = vec2( wh.x -wh.y);",
        "offset[3] = vec2(-wh.x, 0.0);",
        "offset[4] = vec2( 0.0, 0.0);",
        "offset[5] = vec2( wh.x, 0.0);",
        "offset[6] = vec2(-wh.x, wh.y);",
        "offset[7] = vec2( 0.0, wh.y);",
        "offset[8] = vec2( wh.x, wh.y);",
        "kernel[0] = 1.0/16.0; kernel[1] = 2.0/16.0; kernel[2] = 1.0/16.0;",
        "kernel[3] = 2.0/16.0; kernel[4] = 4.0/16.0; kernel[5] = 2.0/16.0;",
        "kernel[6] = 1.0/16.0; kernel[7] = 2.0/16.0; kernel[8] = 1.0/16.0;",
        "for( int i=0; i<9; i++ ) {",
        "float tmp = texture2D(tDepth, coords + offset[i]).r;",
        "d += tmp * kernel[i];",
        "}",
        "return d;",
        "}",
        "vec3 color(vec2 coords,float blur) {",
        "//processing the sample",
        "vec3 col = vec3(0.0);",
        "col.r = texture2D(tColor,coords + vec2(0.0,1.0)*texel*fringe*blur).r;",
        "col.g = texture2D(tColor,coords + vec2(-0.866,-0.5)*texel*fringe*blur).g;",
        "col.b = texture2D(tColor,coords + vec2(0.866,-0.5)*texel*fringe*blur).b;",
        "vec3 lumcoeff = vec3(0.299,0.587,0.114);",
        "float lum = dot(col.rgb, lumcoeff);",
        "float thresh = max((lum-threshold)*gain, 0.0);",
        "return col+mix(vec3(0.0),col,thresh*blur);",
        "}",
        "vec2 rand(vec2 coord) {",
        "// generating noise / pattern texture for dithering",
        "float noiseX = ((fract(1.0-coord.s*(width/2.0))*0.25)+(fract(coord.t*(height/2.0))*0.75))*2.0-1.0;",
        "float noiseY = ((fract(1.0-coord.s*(width/2.0))*0.75)+(fract(coord.t*(height/2.0))*0.25))*2.0-1.0;",
        "if (noise > 0) {",
        "noiseX = clamp(fract(sin(dot(coord ,vec2(12.9898,78.233))) * 43758.5453),0.0,1.0)*2.0-1.0;",
        "noiseY = clamp(fract(sin(dot(coord ,vec2(12.9898,78.233)*2.0)) * 43758.5453),0.0,1.0)*2.0-1.0;",
        "}",
        "return vec2(noiseX,noiseY);",
        "}",
        "vec3 debugFocus(vec3 col, float blur, float depth) {",
        "float edge = 0.002*depth; //distance based edge smoothing",
        "float m = clamp(smoothstep(0.0,edge,blur),0.0,1.0);",
        "float e = clamp(smoothstep(1.0-edge,1.0,blur),0.0,1.0);",
        "col = mix(col,vec3(1.0,0.5,0.0),(1.0-m)*0.6);",
        "col = mix(col,vec3(0.0,0.5,1.0),((1.0-e)-(1.0-m))*0.2);",
        "return col;",
        "}",
        "float linearize(float depth) {",
        "return -zfar * znear / (depth * (zfar - znear) - zfar);",
        "}",
        "float vignette() {",
        "float dist = distance(vUv.xy, vec2(0.5,0.5));",
        "dist = smoothstep(vignout+(fstop/vignfade), vignin+(fstop/vignfade), dist);",
        "return clamp(dist,0.0,1.0);",
        "}",
        "float gather(float i, float j, int ringsamples, inout vec3 col, float w, float h, float blur) {",
        "float rings2 = float(rings);",
        "float step = PI*2.0 / float(ringsamples);",
        "float pw = cos(j*step)*i;",
        "float ph = sin(j*step)*i;",
        "float p = 1.0;",
        "if (pentagon > 0) {",
        "p = penta(vec2(pw,ph));",
        "}",
        "col += color(vUv.xy + vec2(pw*w,ph*h), blur) * mix(1.0, i/rings2, bias) * p;",
        "return 1.0 * mix(1.0, i /rings2, bias) * p;",
        "}",
        "void main() {",
        "//scene depth calculation",
        "float depth = linearize(texture2D(tDepth,vUv.xy).x);",
        "// Blur depth?",
        "if (depthblur > 0) {",
        "depth = linearize(bdepth(vUv.xy));",
        "}",
        "//focal plane calculation",
        "float fDepth = focalDepth;",
        "if (autofocus > 0) {",
        "fDepth = linearize(texture2D(tDepth,focusCoords).x);",
        "}",
        "// dof blur factor calculation",
        "float blur = 0.0;",
        "if (manualdof > 0) {",
        "float a = depth-fDepth; // Focal plane",
        "float b = (a-fdofstart)/fdofdist; // Far DoF",
        "float c = (-a-ndofstart)/ndofdist; // Near Dof",
        "blur = (a>0.0) ? b : c;",
        "} else {",
        "float f = focalLength; // focal length in mm",
        "float d = fDepth*1000.0; // focal plane in mm",
        "float o = depth*1000.0; // depth in mm",
        "float a = (o*f)/(o-f);",
        "float b = (d*f)/(d-f);",
        "float c = (d-f)/(d*fstop*CoC);",
        "blur = abs(a-b)*c;",
        "}",
        "blur = clamp(blur,0.0,1.0);",
        "// calculation of pattern for dithering",
        "vec2 noise = rand(vUv.xy)*namount*blur;",
        "// getting blur x and y step factor",
        "float w = (1.0/width)*blur*maxblur+noise.x;",
        "float h = (1.0/height)*blur*maxblur+noise.y;",
        "// calculation of final color",
        "vec3 col = vec3(0.0);",
        "if(blur < 0.05) {",
        "//some optimization thingy",
        "col = texture2D(tColor, vUv.xy).rgb;",
        "} else {",
        "col = texture2D(tColor, vUv.xy).rgb;",
        "float s = 1.0;",
        "int ringsamples;",
        "for (int i = 1; i <= rings; i++) {",
        "/*unboxstart*/",
        "ringsamples = i * samples;",
        "for (int j = 0 ; j < maxringsamples ; j++) {",
        "if (j >= ringsamples) break;",
        "s += gather(float(i), float(j), ringsamples, col, w, h, blur);",
        "}",
        "/*unboxend*/",
        "}",
        "col /= s; //divide by sample count",
        "}",
        "if (showFocus > 0) {",
        "col = debugFocus(col, blur, depth);",
        "}",
        "if (vignetting > 0) {",
        "col *= vignette();",
        "}",
        "gl_FragColor.rgb = col;",
        "gl_FragColor.a = 1.0;",
        "} "
    ].join("\n")
};