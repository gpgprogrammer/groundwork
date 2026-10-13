import type { CourseSpec } from "../spec";

/**
 * AP Physics 2: Algebra-Based, following the College Board Course and Exam Description (units and topics in CED order).
 */
export const physics2: CourseSpec = {
  "course": {
    "slug": "ap-physics-2",
    "title": "AP Physics 2: Algebra-Based",
    "shortTitle": "Physics 2",
    "exam": "AP",
    "category": "Sciences",
    "description": "Thermodynamics, electricity and magnetism, optics, and modern physics, without calculus.",
    "hue": 225,
    "examMonth": "May",
    "query": "AP Physics 2",
    "keywords": [
      "ap physics 2",
      "physics 2",
      "ap phys 2"
    ]
  },
  "unitStart": 9,
  "units": [
    {
      "slug": "thermodynamics",
      "title": "Thermodynamics",
      "summary": "Gases, heat, and the laws of thermodynamics.",
      "concepts": [
        {
          "title": "Thermodynamics",
          "topics": [
            {
              "slug": "ideal-gases-and-kinetic-theory",
              "title": "Ideal Gases and Kinetic Theory",
              "summary": "PV = nRT relates a gas's pressure, volume, and temperature to how fast its molecules move.",
              "aliases": [
                "ideal gas law",
                "kinetic theory"
              ]
            },
            {
              "slug": "thermal-energy-transfer",
              "title": "Thermal Energy Transfer",
              "summary": "Heat moves from hot to cold by conduction, convection, and radiation until thermal equilibrium; specific heat sets how temperature responds.",
              "points": [
                "Conduction, convection, radiation",
                "Specific heat",
                "Thermal conductivity"
              ],
              "aliases": [
                "heat transfer",
                "specific heat"
              ]
            },
            {
              "slug": "laws-of-thermodynamics-and-pv-diagrams",
              "title": "Laws of Thermodynamics and PV Diagrams",
              "summary": "The first law tracks heat and work; the area under a PV curve is work done.",
              "aliases": [
                "first law of thermodynamics",
                "pv diagrams",
                "entropy"
              ]
            },
            {
              "slug": "entropy-and-the-second-law",
              "title": "Entropy and the Second Law",
              "summary": "In any spontaneous process, total entropy increases, so heat flows from hot to cold and no engine is perfectly efficient.",
              "points": [
                "Entropy",
                "Direction of heat flow",
                "Heat engines"
              ],
              "aliases": [
                "second law of thermodynamics",
                "entropy"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "electric-force-field-and-potential",
      "title": "Electric Force, Field, and Potential",
      "summary": "Charges, the fields around them, and electric potential.",
      "concepts": [
        {
          "title": "Electric Force, Field, and Potential",
          "topics": [
            {
              "slug": "electric-charge-and-coulombs-law",
              "title": "Electric Charge and Coulomb's Law",
              "summary": "Like charges repel and the force falls off as 1/r².",
              "aliases": [
                "coulombs law",
                "electric charge"
              ]
            },
            {
              "slug": "charging-and-conservation-of-charge",
              "title": "Charging and Conservation of Charge",
              "summary": "Charge is conserved; objects charge by friction, conduction, or induction, and polarization lets a charged object attract a neutral one.",
              "points": [
                "Conduction and induction",
                "Polarization",
                "Grounding"
              ],
              "aliases": [
                "charging by induction",
                "conservation of charge"
              ]
            },
            {
              "slug": "electric-fields-and-potential",
              "title": "Electric Fields and Potential",
              "summary": "The field is force per charge; potential difference is energy per charge.",
              "aliases": [
                "electric field",
                "electric potential",
                "voltage"
              ]
            },
            {
              "slug": "capacitors",
              "title": "Capacitors",
              "summary": "A capacitor stores charge and energy in the field between its plates: C = Q/V.",
              "points": [
                "Capacitance",
                "Parallel plates",
                "Energy stored"
              ],
              "aliases": [
                "capacitors",
                "capacitance"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "electric-circuits",
      "title": "Electric Circuits",
      "summary": "Current, resistance, and DC circuits.",
      "concepts": [
        {
          "title": "Electric Circuits",
          "topics": [
            {
              "slug": "ohms-law-and-circuits",
              "title": "Ohm's Law and Circuits",
              "summary": "V = IR; series resistors add, and parallel resistors combine reciprocally.",
              "aliases": [
                "ohms law",
                "series and parallel circuits",
                "kirchhoff"
              ]
            },
            {
              "slug": "electric-power",
              "title": "Electric Power",
              "summary": "Power in a circuit element is P = IV; brighter bulbs dissipate more power.",
              "points": [
                "P = IV = I²R = V²/R",
                "Comparing bulb brightness",
                "Energy use"
              ],
              "aliases": [
                "electric power"
              ]
            },
            {
              "slug": "kirchhoffs-rules",
              "title": "Kirchhoff's Rules",
              "summary": "The loop rule (energy) and junction rule (charge) solve any DC circuit.",
              "points": [
                "Loop rule",
                "Junction rule",
                "Multi-loop circuits"
              ],
              "aliases": [
                "kirchhoffs laws",
                "compound circuits"
              ]
            },
            {
              "slug": "capacitors-and-rc-circuits",
              "title": "Capacitors and RC Circuits",
              "summary": "Capacitors store charge and energy, and RC circuits charge and discharge over time.",
              "aliases": [
                "capacitors",
                "RC circuit"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "magnetism-and-electromagnetic-induction",
      "title": "Magnetism and Electromagnetism",
      "summary": "Magnetic fields, magnetic forces, and induction.",
      "concepts": [
        {
          "title": "Magnetism and Electromagnetism",
          "topics": [
            {
              "slug": "magnetic-fields-and-forces",
              "title": "Magnetic Fields and Forces",
              "summary": "Moving charges and currents feel magnetic forces perpendicular to their motion.",
              "aliases": [
                "right hand rule",
                "magnetic force"
              ]
            },
            {
              "slug": "electromagnetic-induction",
              "title": "Electromagnetic Induction",
              "summary": "A changing magnetic flux induces an emf, as Faraday's and Lenz's laws describe.",
              "aliases": [
                "faradays law",
                "lenzs law",
                "induction"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "geometric-optics",
      "title": "Geometric Optics",
      "summary": "Reflection, refraction, mirrors, and lenses.",
      "concepts": [
        {
          "title": "Geometric Optics",
          "topics": [
            {
              "slug": "reflection-and-mirrors",
              "title": "Reflection and Mirrors",
              "summary": "Light reflects at the angle it arrives; ray diagrams find the images formed by plane and curved mirrors.",
              "points": [
                "Law of reflection",
                "Ray diagrams for mirrors",
                "Real vs. virtual images"
              ],
              "aliases": [
                "mirrors",
                "ray diagrams"
              ]
            },
            {
              "slug": "reflection-refraction-and-lenses",
              "title": "Reflection, Refraction, and Lenses",
              "summary": "Snell's law describes refraction, and the thin lens equation locates images.",
              "aliases": [
                "snells law",
                "lenses",
                "mirrors"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "waves-sound-and-physical-optics",
      "title": "Waves, Sound, and Physical Optics",
      "summary": "Wave behavior, sound, and light as a wave.",
      "concepts": [
        {
          "title": "Waves, Sound, and Physical Optics",
          "topics": [
            {
              "slug": "properties-of-waves",
              "title": "Properties of Waves",
              "summary": "Waves carry energy without carrying matter; v = fλ links speed, frequency, and wavelength.",
              "points": [
                "Transverse vs. longitudinal",
                "v = fλ",
                "Reflection at boundaries and polarization"
              ],
              "aliases": [
                "wave properties"
              ]
            },
            {
              "slug": "electromagnetic-waves-and-the-doppler-effect",
              "title": "Electromagnetic Waves and the Doppler Effect",
              "summary": "Light is an electromagnetic wave; motion of a source or observer shifts the frequency you detect.",
              "points": [
                "The EM spectrum",
                "Doppler shift",
                "Sound vs. light"
              ],
              "aliases": [
                "doppler effect",
                "electromagnetic waves"
              ]
            },
            {
              "slug": "interference-and-standing-waves",
              "title": "Interference and Standing Waves",
              "summary": "Overlapping waves add; standing waves form when waves reflect back and forth with fixed nodes.",
              "points": [
                "Superposition",
                "Standing waves",
                "Harmonics"
              ],
              "aliases": [
                "standing waves",
                "interference"
              ]
            },
            {
              "slug": "wave-optics-and-interference",
              "title": "Wave Optics and Interference",
              "summary": "Double slits and thin films produce interference patterns from path differences.",
              "aliases": [
                "double slit",
                "interference",
                "diffraction"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "modern-physics",
      "title": "Modern Physics",
      "summary": "Quantum ideas, atoms, and nuclei.",
      "concepts": [
        {
          "title": "Modern Physics",
          "topics": [
            {
              "slug": "wave-particle-duality-and-the-bohr-model",
              "title": "Wave–Particle Duality and the Bohr Model",
              "summary": "Light and matter act as both waves and particles; the Bohr model explains discrete energy levels.",
              "points": [
                "de Broglie wavelength",
                "Bohr model",
                "Emission and absorption spectra"
              ],
              "aliases": [
                "wave particle duality",
                "bohr model"
              ]
            },
            {
              "slug": "photons-and-the-photoelectric-effect",
              "title": "Photons and the Photoelectric Effect",
              "summary": "Light comes in photons with energy hf, which explains why frequency, not intensity, ejects electrons.",
              "aliases": [
                "photoelectric effect",
                "photons"
              ]
            },
            {
              "slug": "atomic-energy-levels-and-nuclear-physics",
              "title": "Atomic Energy Levels and Nuclear Physics",
              "summary": "Electrons emit photons when they drop energy levels; nuclear decay and E = mc² govern the nucleus.",
              "aliases": [
                "energy levels",
                "radioactive decay",
                "mass energy"
              ]
            }
          ]
        }
      ]
    }
  ]
};
