
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
varying vec2 vUv;


float inverseLerp(float v, float minValue, float maxValue) {
  return (v - minValue) / (maxValue - minValue);
}

float remap(float v, float inMin, float inMax, float outMin, float outMax) {
  float t = inverseLerp(v, inMin, inMax);
  return mix(outMin, outMax, t);
}

float hash(vec2 p)
{
    p  = 50.0*fract( p*0.3183099 + vec2(0.71,0.113));
    return -1.0+2.0*fract( p.x*p.y*(p.x+p.y) );
}

void main() {

  vec3 colour = vec3(0.22, 0.35, 0.15);

  gl_FragColor = vec4(pow(colour, vec3(1.0 / 2.2)), 1.0);
}