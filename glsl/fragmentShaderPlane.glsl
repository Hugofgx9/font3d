varying vec2 v_uv;

uniform sampler2D u_texture;
uniform vec2 u_res;
uniform vec2 u_mouse;

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
	
	//vec2 circlePos = (mouse);
	float c = circle(st, mouse, 0.01, 4.);

  vec4 texture = texture2D(u_texture, v_uv + (c * 0.1));

  gl_FragColor = texture;
}