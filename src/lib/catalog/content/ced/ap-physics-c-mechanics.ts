import type { CourseSpec } from "../spec";

/**
 * AP Physics C: Mechanics, following the College Board Course and Exam Description (units and topics in CED order).
 */
export const physicsCMech: CourseSpec = {
  "course": {
    "slug": "ap-physics-c-mechanics",
    "title": "AP Physics C: Mechanics",
    "shortTitle": "Physics C: Mech",
    "exam": "AP",
    "category": "Sciences",
    "description": "Calculus-based mechanics: kinematics, Newton's laws, energy, momentum, rotation, oscillations, and gravitation.",
    "hue": 205,
    "examMonth": "May",
    "query": "AP Physics C: Mechanics",
    "keywords": [
      "ap physics c mechanics",
      "physics c mechanics",
      "physics c mech",
      "ap physics c"
    ]
  },
  "units": [
    {
      "slug": "kinematics",
      "title": "Kinematics",
      "summary": "Motion described with calculus, in one to three dimensions.",
      "concepts": [
        {
          "title": "Kinematics",
          "topics": [
            {
              "slug": "kinematics-with-calculus",
              "title": "Kinematics with Calculus",
              "summary": "Velocity is the derivative of position and position is the integral of velocity, even when acceleration isn't constant.",
              "aliases": [
                "calculus kinematics"
              ]
            },
            {
              "slug": "motion-in-two-and-three-dimensions",
              "title": "Motion in Two and Three Dimensions",
              "summary": "Treat each direction independently: projectiles have constant horizontal velocity and constant vertical acceleration.",
              "points": [
                "Vector components",
                "Projectiles",
                "Relative motion"
              ],
              "aliases": [
                "projectile motion calculus"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "force-and-translational-dynamics",
      "title": "Force and Translational Dynamics",
      "summary": "Newton's laws, including drag and circular motion.",
      "concepts": [
        {
          "title": "Force and Translational Dynamics",
          "topics": [
            {
              "slug": "center-of-mass",
              "title": "Center of Mass",
              "summary": "The center of mass of a continuous object comes from integrating position weighted by mass.",
              "aliases": [
                "center of mass"
              ]
            },
            {
              "slug": "newtons-laws-with-calculus",
              "title": "Newton's Laws with Calculus",
              "summary": "Apply F = ma with changing forces, including velocity-dependent drag and differential equations.",
              "aliases": [
                "drag force",
                "terminal velocity",
                "differential equations physics"
              ]
            },
            {
              "slug": "gravitational-friction-and-spring-forces",
              "title": "Gravitational, Friction, and Spring Forces",
              "summary": "The force models of the course: F = Gm₁m₂/r², static and kinetic friction (f ≤ μN), and Hooke's law for springs.",
              "points": [
                "Universal gravitation",
                "Static vs. kinetic friction",
                "Hooke's law"
              ],
              "aliases": [
                "friction",
                "spring force",
                "gravitational force"
              ]
            },
            {
              "slug": "resistive-forces-and-terminal-velocity",
              "title": "Resistive Forces and Terminal Velocity",
              "summary": "Drag that depends on speed leads to a differential equation; the object approaches terminal velocity exponentially.",
              "points": [
                "F = −bv",
                "Solving the differential equation",
                "Terminal velocity"
              ],
              "aliases": [
                "drag force",
                "terminal velocity",
                "resistive forces"
              ]
            },
            {
              "slug": "circular-motion",
              "title": "Circular Motion",
              "summary": "Net force toward the center provides centripetal acceleration v²/r, whether from tension, gravity, or friction.",
              "points": [
                "Centripetal acceleration",
                "Banked curves and loops",
                "Gravity as centripetal force"
              ],
              "aliases": [
                "circular motion",
                "centripetal force"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "work-energy-and-power",
      "title": "Work, Energy, and Power",
      "summary": "Work as an integral, potential energy, and power.",
      "concepts": [
        {
          "title": "Work, Energy, and Power",
          "topics": [
            {
              "slug": "kinetic-energy-and-the-work-energy-theorem",
              "title": "Kinetic Energy and the Work–Energy Theorem",
              "summary": "Net work equals the change in kinetic energy, so work done by any force shows up as a change in speed.",
              "points": [
                "KE = ½mv²",
                "Work–energy theorem",
                "Power as dW/dt"
              ],
              "aliases": [
                "work energy theorem",
                "power"
              ]
            },
            {
              "slug": "work-as-an-integral",
              "title": "Work as an Integral",
              "summary": "Work is the integral of force over displacement, and force is the negative derivative of potential energy.",
              "aliases": [
                "work integral",
                "potential energy curves"
              ]
            },
            {
              "slug": "potential-energy-and-conservative-forces",
              "title": "Potential Energy and Conservative Forces",
              "summary": "For a conservative force, F = −dU/dx; energy diagrams show equilibrium points and turning points.",
              "points": [
                "F = −dU/dx",
                "Energy diagrams",
                "Conservation of energy"
              ],
              "aliases": [
                "potential energy curves",
                "conservative forces"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "linear-momentum",
      "title": "Linear Momentum",
      "summary": "Impulse as an integral, collisions, and conservation.",
      "concepts": [
        {
          "title": "Linear Momentum",
          "topics": [
            {
              "slug": "impulse-momentum-and-collisions",
              "title": "Impulse, Momentum, and Collisions",
              "summary": "Impulse is the integral of force over time; momentum is conserved for isolated systems.",
              "aliases": [
                "impulse integral"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "torque-and-rotational-dynamics",
      "title": "Torque and Rotational Dynamics",
      "summary": "Rotation, torque, and moment of inertia by integration.",
      "concepts": [
        {
          "title": "Torque and Rotational Dynamics",
          "topics": [
            {
              "slug": "rotational-kinematics",
              "title": "Rotational Kinematics",
              "summary": "Angular position, velocity, and acceleration follow the same calculus as linear motion, linked by v = rω and a = rα.",
              "points": [
                "θ, ω, α",
                "Connecting linear and angular",
                "Constant angular acceleration"
              ],
              "aliases": [
                "rotational kinematics"
              ]
            },
            {
              "slug": "rotational-inertia-by-integration",
              "title": "Rotational Inertia by Integration",
              "summary": "Find rotational inertia by integrating r² dm, and use the parallel axis theorem to shift axes.",
              "aliases": [
                "moment of inertia integral",
                "parallel axis theorem"
              ]
            },
            {
              "slug": "torque-and-angular-acceleration",
              "title": "Torque and Angular Acceleration",
              "summary": "Net torque equals rotational inertia times angular acceleration.",
              "aliases": [
                "rotational dynamics"
              ]
            },
            {
              "slug": "rotational-equilibrium",
              "title": "Rotational Equilibrium",
              "summary": "With zero net force and zero net torque, an object is in static equilibrium.",
              "points": [
                "Choosing a pivot",
                "Ladders and beams",
                "Center of mass and balance"
              ],
              "aliases": [
                "static equilibrium",
                "rotational equilibrium"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "energy-and-momentum-of-rotating-systems",
      "title": "Energy and Momentum of Rotating Systems",
      "summary": "Rolling, angular momentum, and orbits.",
      "concepts": [
        {
          "title": "Energy and Momentum of Rotating Systems",
          "topics": [
            {
              "slug": "rotational-kinetic-energy-and-work",
              "title": "Rotational Kinetic Energy and Work",
              "summary": "Rotating objects store ½Iω² of energy, and torque does work through an angle.",
              "points": [
                "½Iω²",
                "Work by torque",
                "Energy in rolling"
              ],
              "aliases": [
                "rotational kinetic energy"
              ]
            },
            {
              "slug": "angular-momentum-and-rolling",
              "title": "Angular Momentum and Rolling",
              "summary": "Angular momentum is conserved without external torque, and rolling without slipping links v and ω.",
              "aliases": [
                "angular momentum",
                "rolling without slipping"
              ]
            },
            {
              "slug": "orbits-and-gravitational-potential-energy",
              "title": "Orbits and Gravitational Potential Energy",
              "summary": "Gravitational potential energy is −GMm/r, and energy and angular momentum conservation describe orbits.",
              "aliases": [
                "orbital mechanics",
                "escape velocity",
                "kepler"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "oscillations",
      "title": "Oscillations",
      "summary": "Simple harmonic motion and pendulums.",
      "concepts": [
        {
          "title": "Oscillations",
          "topics": [
            {
              "slug": "simple-harmonic-motion-with-calculus",
              "title": "Simple Harmonic Motion with Calculus",
              "summary": "SHM solves d²x/dt² = −ω²x, giving sinusoidal motion with period 2π/ω.",
              "aliases": [
                "SHM differential equation",
                "physical pendulum"
              ]
            },
            {
              "slug": "simple-and-physical-pendulums",
              "title": "Simple and Physical Pendulums",
              "summary": "A pendulum swings in SHM for small angles; a physical pendulum's period depends on its rotational inertia.",
              "points": [
                "Small-angle approximation",
                "Physical pendulum period",
                "Energy in oscillations"
              ],
              "aliases": [
                "physical pendulum",
                "simple pendulum"
              ]
            }
          ]
        }
      ]
    }
  ]
};
