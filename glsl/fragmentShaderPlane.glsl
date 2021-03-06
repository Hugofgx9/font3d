//fragmentShader

#pragma glslify: snoise2 = require(glsl-noise/simplex/2d);
#pragma glslify: snoise3 = require(glsl-noise/simplex/3d);

varying vec2 v_uv;

uniform sampler2D u_texture;
uniform sampler2D u_dataMoshTexture;
uniform vec2 u_res;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_speed;


float circle(in vec2 _st, in vec2 _center, in float _radius, in float blurriness){
    vec2 dist = _st - _center;
    return 1. - smoothstep( _radius-(_radius * blurriness), 
    											_radius+(_radius * blurriness), 
    											dot(dist,dist) * 4.0);
}

void main() {

  // CIRCLE
		// We manage the device ratio by passing PR constant
		vec2 res = u_res * PR;
		vec2 st = gl_FragCoord.xy / res.xy - vec2(0.5);
		vec2 newUV = v_uv;
		// tip: use the following formula to keep the good ratio of your coordinates
		st.y *= u_res.y / u_res.x;

		// We readjust the mouse coordinates
	  vec2 mouse = vec2(
	    (u_mouse.x / u_res.x) * 2. - 1.,
	    -(u_mouse.y / u_res.y) * 2. + 1.
	  );
	 	mouse *= .5;
	  mouse.y *= res.y / res.x;

	  float mouseSpeed = u_speed;
		
		//vec2 circlePos = (mouse);
		float c = circle(st, mouse, mouseSpeed, 1.) * 0.1;

	//noise
	float offx = (v_uv.x * 5.);
	float offy = u_time * 0.1;

	float noise = snoise2( vec2(offx, offy));

	float sin1 = (sin(v_uv.x * 100.) / 2. + 0.5);

  // import & adjust textures
  vec4 textureData = texture2D(u_dataMoshTexture, newUV);
  float BWdata = ((textureData.r + textureData.g + textureData.b) / 3.) * 0.5;
  float deformation = ( c * BWdata);
  vec4 texture1 = texture2D(u_texture, newUV + deformation );
  vec4 finalTexture = texture1;

  //gl_FragColor = texture;
  gl_FragColor = vec4( vec3(finalTexture), finalTexture.a);
}