#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif

// Variable qualifiers that come with the shader
precision highp float;
uniform float opacity;
uniform vec3 color;
uniform sampler2D map;
varying vec2 vUv;
// We passed this one
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_res;

// HSL to RGB color conversion module
//#pragma glslify: hsl2rgb = require(glsl-hsl2rgb)

float median(float r, float g, float b) {
  return max(min(r, g), min(max(r, g), b));
}

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
	vec2 newUV = vUv;
	// tip: use the following formula to keep the good ratio of your coordinates
	st.y *= u_res.y / u_res.x;

	// We readjust the mouse coordinates
  vec2 mouse = vec2(
    (u_mouse.x / u_res.x) * 2. - 1.,
    -(u_mouse.y / u_res.y) * 2. + 1.
  );
 	mouse *= .5;
  mouse.y *= res.y / res.x;
	
	//vec2 circlePos = (mouse);
	float c = circle(st, mouse, 0.01, 4.);


  // This is the code that comes to produce msdf
  float distor =  0.1;
  vec3 sample = texture2D(map, vUv + (c * distor) ).rgb;
  float sigDist = median(sample.r, sample.g, sample.b) - 0.5;
  float alpha = clamp(sigDist/fwidth(sigDist) + 0.5, 0.0, 1.0);
  vec3 color = vec3(0.150);


  gl_FragColor = vec4(color, alpha * opacity);
  if (gl_FragColor.a < 0.0001) discard;
}