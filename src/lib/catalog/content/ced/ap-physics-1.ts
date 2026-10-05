import type { CourseSpec } from "../spec";

/**
 * AP Physics 1: Algebra-Based, following the College Board Course and Exam Description (units and topics in CED order).
 */
export const physics1: CourseSpec = {
  "course": {
    "slug": "ap-physics-1",
    "title": "AP Physics 1: Algebra-Based",
    "shortTitle": "Physics 1",
    "exam": "AP",
    "category": "Sciences",
    "description": "Mechanics without calculus: kinematics, forces, energy, momentum, rotation, oscillations, and fluids.",
    "hue": 215,
    "examMonth": "May",
    "query": "AP Physics 1",
    "keywords": [
      "ap physics 1",
      "physics 1",
      "ap phys 1"
    ]
  },
  "units": [
    {
      "slug": "kinematics",
      "title": "Kinematics",
      "summary": "Describing motion in one and two dimensions.",
      "concepts": [
        {
          "title": "Kinematics",
          "topics": [
            {
              "slug": "scalars-and-vectors-in-one-dimension",
              "title": "Scalars and Vectors in One Dimension",
              "summary": "Scalars have only size; vectors have size and direction. In one dimension, the sign carries the direction.",
              "points": [
                "Scalar vs. vector",
                "Sign conventions",
                "Distance vs. displacement"
              ],
              "aliases": [
                "scalars and vectors"
              ]
            },
            {
              "slug": "position-velocity-and-acceleration",
              "title": "Position, Velocity, and Acceleration",
              "summary": "Velocity is the rate of change of position and acceleration the rate of change of velocity.",
              "aliases": [
                "kinematics",
                "displacement"
              ]
            },
            {
              "slug": "motion-graphs",
              "title": "Motion Graphs",
              "summary": "The slope of a position–time graph is velocity; the area under a velocity–time graph is displacement.",
              "aliases": [
                "position time graph",
                "velocity time graph"
              ]
            },
            {
              "slug": "kinematic-equations",
              "title": "Kinematic Equations",
              "summary": "For constant acceleration, four equations connect displacement, velocity, acceleration, and time.",
              "aliases": [
                "big four equations",
                "constant acceleration"
              ]
            },
            {
              "slug": "reference-frames-and-relative-motion",
              "title": "Reference Frames and Relative Motion",
              "summary": "Velocity depends on who's watching: an object's velocity relative to you is its velocity minus yours.",
              "points": [
                "Choosing a reference frame",
                "Relative velocity",
                "Adding velocity vectors"
              ],
              "aliases": [
                "relative motion",
                "reference frames"
              ]
            },
            {
              "slug": "projectile-motion",
              "title": "Projectile Motion",
              "summary": "Horizontal and vertical motion are independent: constant velocity sideways, free fall vertically.",
              "aliases": [
                "projectiles",
                "2d motion"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "force-and-translational-dynamics",
      "title": "Force and Translational Dynamics",
      "summary": "Forces, Newton's laws, and circular motion.",
      "concepts": [
        {
          "title": "Force and Translational Dynamics",
          "topics": [
            {
              "slug": "systems-and-center-of-mass",
              "title": "Systems and Center of Mass",
              "summary": "Choosing a system decides which forces are internal and external; the center of mass moves as if all the mass were there.",
              "points": [
                "Choosing a system",
                "Internal vs. external forces",
                "Center of mass"
              ],
              "aliases": [
                "center of mass",
                "systems"
              ]
            },
            {
              "slug": "free-body-diagrams",
              "title": "Free-Body Diagrams",
              "summary": "Draw every force on one object to set up Newton's second law in each direction.",
              "aliases": [
                "free body diagram",
                "FBD"
              ]
            },
            {
              "slug": "newtons-laws-of-motion",
              "title": "Newton's Laws of Motion",
              "summary": "Net force causes acceleration (F = ma), and forces always come in equal and opposite pairs.",
              "aliases": [
                "newtons laws",
                "newton's second law",
                "newton's third law"
              ]
            },
            {
              "slug": "gravitational-force",
              "title": "Gravitational Force",
              "summary": "Every mass attracts every other: F = Gm₁m₂/r². Near Earth's surface that becomes weight, mg.",
              "points": [
                "Newton's law of gravitation",
                "Weight and g",
                "Gravitational field"
              ],
              "aliases": [
                "gravitational force",
                "universal gravitation"
              ]
            },
            {
              "slug": "friction-and-inclines",
              "title": "Friction and Inclines",
              "summary": "Friction opposes sliding with magnitude μN; on an incline, split gravity into components.",
              "aliases": [
                "friction",
                "inclined plane",
                "coefficient of friction"
              ]
            },
            {
              "slug": "spring-forces",
              "title": "Spring Forces",
              "summary": "An ideal spring pulls back with a force proportional to how far it's stretched or compressed: F = −kx.",
              "points": [
                "Hooke's law",
                "Spring constant",
                "Springs in series and parallel"
              ],
              "aliases": [
                "hookes law",
                "spring force"
              ]
            },
            {
              "slug": "circular-motion-and-gravitation",
              "title": "Circular Motion and Gravitation",
              "summary": "Uniform circular motion needs a net inward force mv²/r; gravity supplies it for orbits.",
              "aliases": [
                "centripetal force",
                "universal gravitation",
                "orbits"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "work-energy-and-power",
      "title": "Work, Energy, and Power",
      "summary": "Energy, the work that changes it, and how fast it's transferred.",
      "concepts": [
        {
          "title": "Work, Energy, and Power",
          "topics": [
            {
              "slug": "work-and-kinetic-energy",
              "title": "Work and Kinetic Energy",
              "summary": "Net work on an object equals its change in kinetic energy.",
              "aliases": [
                "work energy theorem",
                "kinetic energy"
              ]
            },
            {
              "slug": "potential-energy-and-conservation-of-energy",
              "title": "Potential Energy and Conservation of Energy",
              "summary": "Without friction, mechanical energy is conserved as it shifts between kinetic and potential.",
              "aliases": [
                "conservation of energy",
                "potential energy",
                "springs"
              ]
            },
            {
              "slug": "power",
              "title": "Power",
              "summary": "Power is the rate of doing work, measured in watts.",
              "aliases": [
                "power physics"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "linear-momentum",
      "title": "Linear Momentum",
      "summary": "Momentum, impulse, and collisions.",
      "concepts": [
        {
          "title": "Linear Momentum",
          "topics": [
            {
              "slug": "impulse-and-momentum",
              "title": "Impulse and Momentum",
              "summary": "Impulse, force times time, equals the change in momentum.",
              "aliases": [
                "impulse",
                "momentum"
              ]
            },
            {
              "slug": "conservation-of-momentum-and-collisions",
              "title": "Conservation of Momentum and Collisions",
              "summary": "Momentum is conserved in collisions; kinetic energy is conserved only in elastic ones.",
              "aliases": [
                "elastic collision",
                "inelastic collision"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "torque-and-rotational-dynamics",
      "title": "Torque and Rotational Dynamics",
      "summary": "Rotation, torque, and rotational inertia.",
      "concepts": [
        {
          "title": "Torque and Rotational Dynamics",
          "topics": [
            {
              "slug": "rotational-kinematics",
              "title": "Rotational Kinematics",
              "summary": "Angular displacement, velocity, and acceleration follow equations parallel to linear kinematics.",
              "aliases": [
                "angular velocity",
                "rotational motion"
              ]
            },
            {
              "slug": "connecting-linear-and-rotational-motion",
              "title": "Connecting Linear and Rotational Motion",
              "summary": "A point on a rotating object moves with v = rω and a = rα; the farther from the axis, the faster it goes.",
              "points": [
                "v = rω",
                "Tangential acceleration",
                "Radians"
              ],
              "aliases": [
                "linear and angular velocity"
              ]
            },
            {
              "slug": "torque-and-rotational-inertia",
              "title": "Torque and Rotational Inertia",
              "summary": "Torque causes angular acceleration, and rotational inertia depends on how mass is distributed.",
              "aliases": [
                "torque",
                "moment of inertia",
                "rotational equilibrium"
              ]
            },
            {
              "slug": "rotational-equilibrium",
              "title": "Rotational Equilibrium",
              "summary": "An object stays balanced when both net force and net torque are zero, which is how you solve seesaw and beam problems.",
              "points": [
                "Net torque = 0",
                "Choosing a pivot",
                "Static equilibrium problems"
              ],
              "aliases": [
                "rotational equilibrium",
                "static equilibrium"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "energy-and-momentum-of-rotating-systems",
      "title": "Energy and Momentum of Rotating Systems",
      "summary": "Rotational energy, angular momentum, rolling, and orbits.",
      "concepts": [
        {
          "title": "Energy and Momentum of Rotating Systems",
          "topics": [
            {
              "slug": "rotational-kinetic-energy-and-rolling",
              "title": "Rotational Kinetic Energy and Rolling",
              "summary": "Rolling objects split kinetic energy between translation and rotation.",
              "aliases": [
                "rolling motion",
                "rotational kinetic energy"
              ]
            },
            {
              "slug": "angular-momentum",
              "title": "Angular Momentum",
              "summary": "Angular momentum is conserved without external torque, which is why a spinning skater speeds up when she pulls in her arms.",
              "aliases": [
                "conservation of angular momentum"
              ]
            },
            {
              "slug": "motion-of-orbiting-satellites",
              "title": "Motion of Orbiting Satellites",
              "summary": "Gravity provides the centripetal force for orbits; angular momentum and energy are conserved as a satellite moves.",
              "points": [
                "Circular orbits",
                "Escape speed",
                "Energy and angular momentum in orbits"
              ],
              "aliases": [
                "satellite motion",
                "orbits"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "oscillations",
      "title": "Oscillations",
      "summary": "Simple harmonic motion of springs and pendulums.",
      "concepts": [
        {
          "title": "Oscillations",
          "topics": [
            {
              "slug": "simple-harmonic-motion",
              "title": "Simple Harmonic Motion",
              "summary": "Springs and pendulums oscillate with periods set by mass and spring constant, or length and gravity.",
              "aliases": [
                "SHM",
                "pendulum",
                "mass spring system"
              ]
            },
            {
              "slug": "energy-of-simple-harmonic-oscillators",
              "title": "Energy of Simple Harmonic Oscillators",
              "summary": "An oscillator trades kinetic and potential energy back and forth; total energy stays ½kA².",
              "points": [
                "Energy at the extremes and center",
                "Period of springs and pendulums",
                "Graphs of SHM"
              ],
              "aliases": [
                "energy in shm",
                "period of a pendulum"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "fluids",
      "title": "Fluids",
      "summary": "Density, pressure, buoyancy, and flow.",
      "concepts": [
        {
          "title": "Fluids",
          "topics": [
            {
              "slug": "density-and-pressure",
              "title": "Density and Pressure",
              "summary": "Pressure is force per area, and in a fluid it increases with depth: P = P₀ + ρgh.",
              "points": [
                "Density",
                "Pressure with depth",
                "Gauge vs. absolute pressure"
              ],
              "aliases": [
                "density",
                "fluid pressure"
              ]
            },
            {
              "slug": "pressure-and-buoyancy",
              "title": "Pressure and Buoyancy",
              "summary": "Pressure increases with depth, and the buoyant force equals the weight of fluid displaced.",
              "aliases": [
                "buoyancy",
                "archimedes principle",
                "fluid pressure"
              ]
            },
            {
              "slug": "fluid-flow-and-bernoullis-equation",
              "title": "Fluid Flow and Bernoulli's Equation",
              "summary": "Continuity and Bernoulli's equation relate speed, pressure, and height in a flowing fluid.",
              "aliases": [
                "bernoulli",
                "continuity equation"
              ]
            }
          ]
        }
      ]
    }
  ]
};
