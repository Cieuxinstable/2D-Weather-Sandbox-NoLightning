#version 300 es
precision highp float;

in vec2 dropPosition;
in vec2 mass; //[0] water   [1] ice
in float density;

out vec2 position_out;
out vec2 mass_out;
out float density_out;

uniform vec2 texelSize;
uniform vec2 aspectRatios; // sim   canvas
uniform vec3 view;         // Xpos  Ypos    Zoom

void main()
{
  vec2 outpos = dropPosition;

  outpos.x += view.x;
  outpos.y += view.y * aspectRatios[0];

  outpos *= view[2]; // zoom

  outpos.y *= aspectRatios[1] / aspectRatios[0];

  gl_Position = vec4(outpos, 0.0, 1.0);

  float size = 4.0; // 4.0

  // hail: classified purely by density so it keeps rendering as hail while it gradually melts
  // (does NOT require mass[0]==0 -- a partially-melted/wet hailstone is still hail, not "disappeared")
  if (mass[1] > 0. && density >= 1.0) {
    float hailGrowth = clamp(density - 1.0, 0.0, 1.5) / 1.5;         // 0 at the CAPE threshold, 1 at max density (2.5)
    size = mix(4.0, 18.0, hailGrowth);                               // diameter 4px (r=2px) -> 18px (r=9px) as CAPE increases
  }

  gl_PointSize = view[2] * size / aspectRatios[0];

  position_out = dropPosition;
  mass_out = mass;
  density_out = density;
}