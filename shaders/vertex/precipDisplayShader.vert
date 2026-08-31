#version 300 es
precision highp float;

in vec2 dropPosition;
in vec2 mass; //[0] water   [1] ice
in float density;

out vec2 position_out;
out vec2 mass_out;
out float density_out;

uniform vec2 texelSize;
uniform vec2 aspectRatios;  // sim   canvas
uniform vec3 view;          // Xpos  Ypos    Zoom
uniform float showAllDrops; // 1.0 = debug: render every droplet (rain/snow/hail). 0.0 = normal play: only hail is drawn as a particle

void main()
{
  vec2 outpos = dropPosition;

  outpos.x += view.x;
  outpos.y += view.y * aspectRatios[0];

  outpos *= view[2]; // zoom

  outpos.y *= aspectRatios[1] / aspectRatios[0];

  gl_Position = vec4(outpos, 0.0, 1.0);

  bool isHailParticle = mass[1] > 0. && density >= 1.0; // pure/partly-melted dense ice, classified the same way the fragment shader colors it

  float size = 4.0; // 4.0

  if (isHailParticle) {
    // hailGrowth: 0 right at the CAPE threshold or once nearly melted back to rain density (1.0),
    // 1 at max density (2.5) -- so the point also shrinks towards the small end as it melts, not just
    // scales with CAPE, giving a subtle "shrinking away" look as it nears the warm ground.
    float hailGrowth = clamp(density - 1.0, 0.0, 1.5) / 1.5;
    size = mix(1.6, 5.0, hailGrowth); // diameter 1.6px (r=0.8px) -> 5px (r=2.5px) BEFORE the zoom-independent clamp below
  } else if (showAllDrops < 0.5) {
    size = 0.0; // outside debug mode, rain/snow are shown via the volumetric cloud/precip fog instead of individual points
  }

  float pointSizePx = view[2] * size / aspectRatios[0]; // scales with camera zoom like every other object in the scene

  if (isHailParticle)
    pointSizePx = clamp(pointSizePx, 1.6, 5.0); // absolute on-screen cap (diameter 1.6-5px, r=0.8-2.5px): hail must
                                                 // never balloon into a giant disc just because the camera is zoomed in

  gl_PointSize = pointSizePx;

  position_out = dropPosition;
  mass_out = mass;
  density_out = density;
}