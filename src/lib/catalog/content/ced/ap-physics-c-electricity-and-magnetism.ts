import type { CourseSpec } from "../spec";

/**
 * AP Physics C: Electricity and Magnetism, following the College Board Course and Exam Description (units and topics in CED order).
 */
export const physicsCEM: CourseSpec = {
  "course": {
    "slug": "ap-physics-c-electricity-and-magnetism",
    "title": "AP Physics C: Electricity and Magnetism",
    "shortTitle": "Physics C: E&M",
    "exam": "AP",
    "category": "Sciences",
    "description": "Calculus-based electricity and magnetism: fields, Gauss's law, potential, circuits, magnetic fields, and induction.",
    "hue": 240,
    "examMonth": "May",
    "query": "AP Physics C E&M",
    "keywords": [
      "physics c e&m",
      "physics c em",
      "ap physics c electricity",
      "e&m",
      "electricity and magnetism"
    ]
  },
  "units": [
    {
      "slug": "electric-charges-fields-and-gausss-law",
      "title": "Electric Charges, Fields, and Gauss's Law",
      "summary": "Coulomb's law, fields of charge distributions, flux, and Gauss's law.",
      "concepts": [
        {
          "title": "Electric Charges, Fields, and Gauss's Law",
          "topics": [
            {
              "slug": "electric-charge-and-coulombs-law",
              "title": "Electric Charge and Coulomb's Law",
              "summary": "Like charges repel and opposite charges attract with F = kq₁q₂/r²; charge is conserved.",
              "points": [
                "Coulomb's law",
                "Superposition of forces",
                "Charging"
              ],
              "aliases": [
                "coulombs law"
              ]
            },
            {
              "slug": "electric-fields-of-continuous-charge-distributions",
              "title": "Electric Fields of Continuous Charge Distributions",
              "summary": "Integrate contributions from each bit of charge to find the field of rods, rings, and disks.",
              "aliases": [
                "charge distributions",
                "electric field integral"
              ]
            },
            {
              "slug": "electric-flux",
              "title": "Electric Flux",
              "summary": "Flux counts how much field passes through a surface: Φ = ∮E·dA.",
              "points": [
                "Flux through a surface",
                "Open vs. closed surfaces",
                "Sign of flux"
              ],
              "aliases": [
                "electric flux"
              ]
            },
            {
              "slug": "gausss-law",
              "title": "Gauss's Law",
              "summary": "Electric flux through a closed surface equals the enclosed charge over ε₀; symmetry makes it powerful.",
              "aliases": [
                "gauss law",
                "electric flux"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "electric-potential",
      "title": "Electric Potential",
      "summary": "Potential energy, potential, and their relation to field.",
      "concepts": [
        {
          "title": "Electric Potential",
          "topics": [
            {
              "slug": "electric-potential-and-potential-energy",
              "title": "Electric Potential and Potential Energy",
              "summary": "Potential is the negative line integral of the field, and the field is the negative gradient of potential.",
              "aliases": [
                "electric potential",
                "equipotential"
              ]
            },
            {
              "slug": "potential-from-fields-and-charge-distributions",
              "title": "Potential from Fields and Charge Distributions",
              "summary": "Find V by integrating the field (V = −∫E·dl) or by adding up contributions from continuous charge; E = −dV/dx goes the other way.",
              "points": [
                "V = −∫E·dl",
                "Potential of continuous distributions",
                "Equipotential surfaces"
              ],
              "aliases": [
                "electric potential integration",
                "equipotential"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "conductors-and-capacitors",
      "title": "Conductors and Capacitors",
      "summary": "Charge on conductors, capacitance, and dielectrics.",
      "concepts": [
        {
          "title": "Conductors and Capacitors",
          "topics": [
            {
              "slug": "electrostatics-with-conductors",
              "title": "Electrostatics with Conductors",
              "summary": "In equilibrium, charge sits on a conductor's surface, the field inside is zero, and connected conductors share charge to equal potential.",
              "points": [
                "Zero field inside",
                "Charge on the surface",
                "Shielding and grounding"
              ],
              "aliases": [
                "conductors electrostatics"
              ]
            },
            {
              "slug": "conductors-and-capacitance",
              "title": "Conductors and Capacitance",
              "summary": "Charge on conductors sits on the surface; capacitance depends on geometry and dielectrics.",
              "aliases": [
                "capacitance",
                "dielectrics",
                "conductors"
              ]
            },
            {
              "slug": "dielectrics",
              "title": "Dielectrics",
              "summary": "A dielectric between capacitor plates weakens the field and raises the capacitance by a factor κ.",
              "points": [
                "Dielectric constant",
                "Polarization in materials",
                "Capacitors with dielectrics"
              ],
              "aliases": [
                "dielectrics"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "electric-circuits",
      "title": "Electric Circuits",
      "summary": "Current, resistance, Kirchhoff's rules, and RC circuits.",
      "concepts": [
        {
          "title": "Electric Circuits",
          "topics": [
            {
              "slug": "current-resistance-and-kirchhoffs-rules",
              "title": "Current, Resistance, and Kirchhoff's Rules",
              "summary": "Current is charge flow; resistance depends on resistivity and geometry; Kirchhoff's rules solve circuits.",
              "points": [
                "I = dq/dt",
                "R = ρL/A",
                "Loop and junction rules"
              ],
              "aliases": [
                "kirchhoffs rules",
                "resistivity"
              ]
            },
            {
              "slug": "rc-circuits",
              "title": "RC Circuits",
              "summary": "Charging and discharging capacitors follow exponential curves with time constant RC.",
              "aliases": [
                "RC circuits",
                "time constant"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "magnetic-fields-and-electromagnetism",
      "title": "Magnetic Fields and Electromagnetism",
      "summary": "Magnetic forces and the fields made by currents.",
      "concepts": [
        {
          "title": "Magnetic Fields and Electromagnetism",
          "topics": [
            {
              "slug": "magnetic-fields",
              "title": "Magnetic Fields",
              "summary": "Magnetic fields come from moving charges and magnetic materials; field lines form closed loops.",
              "points": [
                "Field lines",
                "Magnetic dipoles",
                "Earth's field"
              ],
              "aliases": [
                "magnetic fields"
              ]
            },
            {
              "slug": "magnetic-forces-on-charges-and-currents",
              "title": "Magnetic Forces on Charges and Currents",
              "summary": "F = qv × B and F = IL × B describe magnetic forces on moving charges and wires.",
              "aliases": [
                "lorentz force"
              ]
            },
            {
              "slug": "biot-savart-law-and-amperes-law",
              "title": "Biot–Savart Law and Ampère's Law",
              "summary": "Find magnetic fields of currents with Biot–Savart, or with Ampère's law when there's symmetry.",
              "aliases": [
                "biot savart",
                "amperes law",
                "solenoid"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "electromagnetic-induction",
      "title": "Electromagnetic Induction",
      "summary": "Faraday's law, inductance, and LR and LC circuits.",
      "concepts": [
        {
          "title": "Electromagnetic Induction",
          "topics": [
            {
              "slug": "magnetic-flux",
              "title": "Magnetic Flux",
              "summary": "Flux measures how much magnetic field passes through a loop: Φ = ∫B·dA. Changing it induces an emf.",
              "points": [
                "Φ = BA cos θ",
                "Flux through a loop",
                "Changing flux"
              ],
              "aliases": [
                "magnetic flux"
              ]
            },
            {
              "slug": "faradays-law-and-lenzs-law",
              "title": "Faraday's Law and Lenz's Law",
              "summary": "Changing flux induces an emf that opposes the change.",
              "aliases": [
                "faradays law",
                "lenzs law"
              ]
            },
            {
              "slug": "inductance-and-lr-circuits",
              "title": "Inductance and LR Circuits",
              "summary": "Inductors resist changes in current, and LR and LC circuits have characteristic time behavior.",
              "aliases": [
                "inductors",
                "LR circuit",
                "LC circuit"
              ]
            },
            {
              "slug": "lc-circuits",
              "title": "LC Circuits",
              "summary": "Energy sloshes between a capacitor's electric field and an inductor's magnetic field, so the current oscillates.",
              "points": [
                "Energy exchange",
                "Angular frequency 1/√(LC)",
                "Comparison with springs"
              ],
              "aliases": [
                "lc circuits"
              ]
            }
          ]
        }
      ]
    }
  ]
};
