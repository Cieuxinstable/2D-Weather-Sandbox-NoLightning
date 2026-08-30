#version 300 es
precision highp float;

in vec2 position_out;
in vec2 mass_out;
in float density_out;

uniform float showAllDrops; // 1.0 = debug: render every droplet (rain/snow/hail). 0.0 = normal play: only hail is drawn as a particle

out vec4 fragmentColor;

// Precipitation mass:
#define WATER 0
#define ICE 1

void main()
{

  if (mass_out[WATER] < 0.)
    discard;

  bool isHailParticle = mass_out[ICE] > 0. && density_out >= 1.0; // dense ice, possibly wet/melting: still hail

  if (!isHailParticle && showAllDrops < 0.5)
    discard; // outside debug mode, only hail renders as individual particles

  // Round the square point sprite into an actual circle: gl_PointCoord goes 0..1 across the sprite,
  // so distance from its center (0.5, 0.5) tells us how far out we are; 1.0 = at the sprite's edge.
  float distFromCenter = length(gl_PointCoord - vec2(0.5)) * 2.0;
  if (distFromCenter > 1.0)
    discard; // outside the circle: this is a corner of the square sprite, not part of the bubble
  float circleEdgeFade = 1.0 - smoothstep(0.85, 1.0, distFromCenter); // soft antialiased edge

  float opacity = (mass_out[WATER] + mass_out[ICE]) * 0.10;

  if (isHailParticle) {                        // hail: classified by density alone, so it STAYS red while gradually
                                                // melting instead of vanishing the instant any meltwater appears
    float hailOpacity = clamp(opacity * 3.0 + 0.35, 0.0, 1.0); // strong minimum visibility regardless of mass
    fragmentColor = vec4(1.0, 0.1, 0.1, hailOpacity);          // bright red
  } else if (mass_out[ICE] > 0.) {              // has ice, not hail
    if (mass_out[WATER] == 0.)                  // pure light ice, no liquid water
      fragmentColor = vec4(1.0, 1.0, 1.0, opacity); // snow, white
    else                                         // wet snow: mix of ice and water
      fragmentColor = vec4(0.5, 1.0, 1.0, opacity); // light blue
  } else {                                      // rain
    fragmentColor = vec4(0.0, 0.5, 1.0, opacity); // dark blue
  }

  fragmentColor.a *= circleEdgeFade;

  // fragmentColor = vec4(1.0, 1.0, 0.0, 1.0); // all highly visible for DEBUG
}