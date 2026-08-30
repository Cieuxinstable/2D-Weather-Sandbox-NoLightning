#version 300 es
precision highp float;

in vec2 position_out;
in vec2 mass_out;
in float density_out;

out vec4 fragmentColor;

// Precipitation mass:
#define WATER 0
#define ICE 1

void main()
{

  if (mass_out[WATER] < 0.)
    discard;

  /* // dots:
  if(mass_out[1] > 0.){
      if(density_out < 1.0)
          fragmentColor = vec4(1.0, 1.0, 1.0, 1.0); // snow
      else
          fragmentColor = vec4(1.0, 1.0, 0.0, 1.0); // hail
  }else
  fragmentColor = vec4(0.0, 1.0, 1.0, 1.0); // rain
  */

  float opacity = (mass_out[WATER] + mass_out[ICE]) * 0.10;

  if (mass_out[ICE] > 0.) {                    // has ice
    if (density_out >= 1.0) {                  // hail: classified by density alone, so it STAYS red while gradually
                                                // melting instead of vanishing the instant any meltwater appears
      float hailOpacity = clamp(opacity * 3.0 + 0.35, 0.0, 1.0); // strong minimum visibility regardless of mass
      fragmentColor = vec4(1.0, 0.1, 0.1, hailOpacity);          // bright red
    } else if (mass_out[WATER] == 0.) {        // pure light ice, no liquid water
      fragmentColor = vec4(1.0, 1.0, 1.0, opacity); // snow, white
    } else {                                   // wet snow: mix of ice and water
      fragmentColor = vec4(0.5, 1.0, 1.0, opacity); // light blue
    }
  } else {                                     // rain
    fragmentColor = vec4(0.0, 0.5, 1.0, opacity); // dark blue
  }

  // fragmentColor = vec4(1.0, 1.0, 0.0, 1.0); // all highly visible for DEBUG
}