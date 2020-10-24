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
uniform float time;

// HSL to RGB color conversion module
//#pragma glslify: hsl2rgb = require(glsl-hsl2rgb)

float median(float r, float g, float b) {
  return max(min(r, g), min(max(r, g), b));
}

void main() {
  // This is the code that comes to produce msdf
  vec3 sample = texture2D(map, vUv).rgb;
  float sigDist = median(sample.r, sample.g, sample.b) - 0.5;
  float alpha = clamp(sigDist/fwidth(sigDist) + 0.5, 0.0, 1.0);


  vec3 color = vec3(0.208,0.208,0.208);


  gl_FragColor = vec4(color, alpha * opacity);
  if (gl_FragColor.a < 0.0001) discard;
}