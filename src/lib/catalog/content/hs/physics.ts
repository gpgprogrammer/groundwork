import { hsPair } from "./outline";

/**
 * Physics and Honors Physics (algebra-based), following the NGSS physical science standards
 * (HS-PS2 to PS4) in the order most physics textbooks teach them (Conceptual Physics, OpenStax,
 * Holt): motion, forces, gravity, energy, momentum, thermal physics, waves, light, electricity,
 * and magnetism. Honors adds rotation, simple harmonic motion, fluids, and modern physics.
 */
export const [physics, honorsPhysics] = hsPair(
  {
    slug: "physics",
    title: "Physics",
    shortTitle: "Physics",
    category: "Sciences",
    hue: 225,
    grades: "Grade 11 or 12",
    description: "Motion, forces, energy, momentum, waves, light, electricity, and magnetism, with algebra.",
    keywords: ["physics", "phys"],
  },
  {
    slug: "honors-physics",
    title: "Honors Physics",
    shortTitle: "Hon. Physics",
    hue: 232,
    grades: "Grade 11 or 12",
    description: "Everything in Physics with more math, plus rotation, simple harmonic motion, fluids, and modern physics.",
    keywords: ["honors physics", "physics honors", "hon physics"],
  },
  `
# Foundations of Physics | The math and measurement tools physics runs on.
- Measurement, Units, and Significant Figures | Physics uses SI units, scientific notation, and the right number of significant figures. | SI units; Unit conversions; Significant figures | units and measurement physics
- Graphing and Relationships | Linear, inverse, and quadratic relationships show up in graphs of real data. | Slope as a rate; Linearizing data; Proportional reasoning | graphing in physics
- Scalars and Vectors | Scalars have only size; vectors have size and direction. | Scalars vs. vectors; Drawing vectors; Vector components | scalars and vectors

# Motion in One Dimension | Describing motion with words, graphs, and equations.
- Distance, Displacement, Speed, and Velocity | Displacement and velocity include direction; distance and speed don't. | Distance vs. displacement; Average speed and velocity; Instantaneous velocity | displacement and velocity; speed vs velocity
- Acceleration | Acceleration is the rate velocity changes, including speeding up, slowing down, or turning. | Defining acceleration; Signs of acceleration; Units | acceleration
- Motion Graphs | Position-time and velocity-time graphs show motion: slopes and areas mean something. | Position-time graphs; Velocity-time graphs; Area under the curve | motion graphs; position time graphs; velocity time graphs
- The Kinematic Equations | Four equations relate displacement, velocity, acceleration, and time for constant acceleration. | Choosing an equation; Solving problems; Stopping distance | kinematic equations; kinematics
- Free Fall | Objects in free fall accelerate down at 9.8 m/s². | Acceleration due to gravity; Dropped and thrown objects; Air resistance | free fall

# Motion in Two Dimensions | Vectors and projectiles.
- Adding Vectors | Vectors add tip to tail, graphically or by components. | Graphical addition; Components and trigonometry; Resultants | vector addition; vector components
- Projectile Motion | Horizontal motion is constant velocity; vertical motion is free fall. | Horizontally launched projectiles; Angled launches; Range and maximum height | projectile motion
- Relative Motion | Velocity depends on the frame of reference, like a boat crossing a river. | Frames of reference; Relative velocity; River and plane problems | relative velocity; relative motion

# Forces and Newton's Laws | What causes motion to change.
- Newton's First Law and Inertia | An object keeps its velocity unless a net force acts on it. | Inertia; Equilibrium; Net force | newtons first law; inertia
- Newton's Second Law | Net force equals mass times acceleration. | F = ma; Calculating net force; Mass vs. weight | newtons second law
- Newton's Third Law | Forces come in equal and opposite pairs acting on different objects. | Action-reaction pairs; Identifying pairs; Common misconceptions | newtons third law
- Free-Body Diagrams | Drawing every force on an object is the first step of every force problem. | Drawing FBDs; Weight, normal, tension; Writing Newton's second law | free body diagrams
- Friction | Static and kinetic friction oppose sliding and depend on the normal force. | Static and kinetic friction; Coefficient of friction; Friction problems | friction; static and kinetic friction
- Inclined Planes | On a ramp, weight splits into components parallel and perpendicular to the surface. | Weight components; Normal force on an incline; Friction on an incline | inclined plane physics
- Connected Objects and Tension | Systems of objects connected by ropes and pulleys move together. | Tension; Atwood machines; Systems approach | tension physics; atwood machine

# Circular Motion and Gravitation | Motion in circles, gravity, and orbits.
- Uniform Circular Motion | Moving in a circle at constant speed still means accelerating toward the center. | Centripetal acceleration; Centripetal force; Period and frequency | uniform circular motion; centripetal force
- Newton's Law of Universal Gravitation | Every mass attracts every other mass with a force that falls off with distance squared. | F = Gm₁m₂/r²; Inverse square law; Gravitational field strength | universal gravitation
- Orbits and Kepler's Laws | Satellites and planets are in free fall around what they orbit. | Orbital speed; Kepler's three laws; Weightlessness | orbital motion; keplers laws
+ Torque | Torque is a force's turning effect: force times lever arm. | Lever arm; Rotational equilibrium; Center of mass | torque
+ Rotational Motion and Angular Momentum | Rotational inertia and angular momentum are the turning versions of mass and momentum. | Angular velocity and acceleration; Rotational inertia; Conservation of angular momentum | rotational motion; angular momentum

# Work and Energy | Energy, its forms, and its conservation.
- Work | Work is force times displacement in the direction of the force. | W = Fd cos θ; Positive and negative work; Work on a graph | work physics
- Kinetic and Potential Energy | Kinetic energy is energy of motion; potential energy is stored by position or stretch. | KE = ½mv²; Gravitational potential energy; Elastic potential energy | kinetic and potential energy
- Conservation of Energy | Without friction, total mechanical energy stays the same. | Energy bar charts; Roller coasters and pendulums; Energy lost to friction | conservation of energy
- The Work-Energy Theorem | Net work on an object equals its change in kinetic energy. | Work-energy theorem; Stopping distances; Nonconservative forces | work energy theorem
- Power and Efficiency | Power is the rate of doing work; efficiency compares useful output to input. | P = W/t; Watts and horsepower; Efficiency | power physics; efficiency
- Simple Machines | Levers, pulleys, and ramps trade force for distance. | Mechanical advantage; Six simple machines; Efficiency | simple machines; mechanical advantage

# Momentum | Impulse, collisions, and conservation of momentum.
- Momentum and Impulse | Impulse, force times time, changes an object's momentum. | p = mv; Impulse-momentum theorem; Airbags and follow-through | momentum and impulse
- Conservation of Momentum | In a closed system, total momentum before equals total momentum after. | Closed systems; Explosions and recoil; Solving problems | conservation of momentum
- Elastic and Inelastic Collisions | Elastic collisions conserve kinetic energy; inelastic ones don't. | Elastic collisions; Perfectly inelastic collisions; Collisions in two dimensions | elastic and inelastic collisions

# Thermal Physics | Temperature, heat, and the laws of thermodynamics.
- Temperature and Thermal Energy | Temperature measures the average kinetic energy of particles. | Temperature scales; Thermal energy; Thermal expansion | temperature and heat
- Heat Transfer | Heat moves by conduction, convection, and radiation. | Conduction; Convection; Radiation | heat transfer; conduction convection radiation
- Specific Heat and Phase Changes | Specific heat and latent heat describe how much energy changes temperature or phase. | q = mcΔT; Latent heat; Heating curves | specific heat capacity; latent heat
- The Laws of Thermodynamics | Energy is conserved, and entropy always increases. | First law; Second law and entropy; Heat engines | laws of thermodynamics
+ Fluids and Pressure | Pressure, buoyancy, and flowing fluids. | Pressure and depth; Archimedes' principle; Bernoulli's principle | fluid pressure; buoyancy; bernoullis principle

# Waves and Sound | How waves carry energy.
- Wave Properties | Wavelength, frequency, amplitude, and speed describe every wave. | Transverse and longitudinal waves; v = fλ; Amplitude and energy | wave properties; transverse and longitudinal waves
- Wave Behavior | Waves reflect, refract, diffract, and interfere. | Reflection and refraction; Diffraction; Constructive and destructive interference | wave interference; wave behavior
- Standing Waves and Resonance | Standing waves form on strings and in pipes at specific frequencies. | Nodes and antinodes; Harmonics; Resonance | standing waves; resonance
- Sound | Sound is a longitudinal pressure wave; pitch is frequency and loudness is intensity. | Speed of sound; Decibels; Pitch and frequency | sound waves
- The Doppler Effect | A moving source or listener shifts the frequency you hear. | Approaching and receding sources; Sonic booms; Red shift | doppler effect
+ Simple Harmonic Motion | Springs and pendulums oscillate with a period set by mass, stiffness, or length. | Hooke's law; Mass-spring period; Pendulum period | simple harmonic motion; hookes law

# Light and Optics | The electromagnetic spectrum, mirrors, and lenses.
- The Electromagnetic Spectrum | Light is an electromagnetic wave; radio waves to gamma rays differ in frequency. | Parts of the spectrum; Speed of light; Uses of EM waves | electromagnetic spectrum
- Reflection and Mirrors | Light reflects at equal angles; curved mirrors form real and virtual images. | Law of reflection; Plane mirrors; Concave and convex mirrors | reflection of light; concave and convex mirrors
- Refraction and Snell's Law | Light bends when it changes speed entering a new material. | Index of refraction; Snell's law; Total internal reflection | refraction; snells law
- Lenses | Converging and diverging lenses form images used in eyes, cameras, and glasses. | Ray diagrams; Thin lens equation; Magnification | lenses; ray diagrams; thin lens equation
- Diffraction, Interference, and Polarization | Light's wave nature shows up in diffraction patterns, thin films, and polarized light. | Double-slit experiment; Thin film interference; Polarization | double slit experiment; diffraction of light

# Electricity | Charge, fields, and circuits.
- Electric Charge and Coulomb's Law | Like charges repel, opposites attract, with a force that falls off with distance squared. | Charging by friction, conduction, induction; Conductors and insulators; Coulomb's law | electric charge; coulombs law; static electricity
- Electric Fields and Potential | Electric fields push on charges; voltage is the energy per charge. | Electric field lines; Electric potential; Voltage | electric fields; electric potential
- Current, Resistance, and Ohm's Law | Voltage drives current through resistance: V = IR. | Current; Resistance and resistivity; Ohm's law | ohms law; current and resistance
- Series and Parallel Circuits | Series circuits share current; parallel circuits share voltage. | Equivalent resistance; Series circuits; Parallel circuits | series and parallel circuits
- Electric Power and Energy | Power is P = IV; utility companies bill for kilowatt-hours. | P = IV; Kilowatt-hours; Household circuits | electric power

# Magnetism and Electromagnetism | Magnetic fields and how they connect to electricity.
- Magnets and Magnetic Fields | Magnets have poles and are surrounded by magnetic fields. | Magnetic poles; Field lines; Earth's magnetic field | magnetic fields; magnetism
- Electromagnetism | Electric currents make magnetic fields and feel forces in them. | Field around a wire; Electromagnets; Force on a current | electromagnetism; electromagnets
- Electromagnetic Induction | A changing magnetic field induces a current. | Faraday's law; Lenz's law; Induced current | electromagnetic induction; faradays law
- Motors, Generators, and Transformers | Motors turn electricity into motion; generators do the reverse; transformers change voltage. | Electric motors; Generators; Transformers | electric motors and generators; transformers

#+ Modern Physics | Honors: light as particles, atoms, and the nucleus.
- The Photoelectric Effect | Light behaves as particles called photons with energy E = hf. | Photons; Work function; Wave-particle duality | photoelectric effect
- Atomic Models and Spectra | Electrons in atoms occupy energy levels and emit specific wavelengths. | Bohr model; Energy level diagrams; Emission and absorption | bohr model; atomic spectra physics
- Nuclear Physics | Binding energy, radioactive decay, fission, and fusion. | E = mc²; Half-life; Fission and fusion | nuclear physics; nuclear fission and fusion
- Special Relativity | Moving clocks run slow and moving lengths contract. | Postulates of relativity; Time dilation; Length contraction | special relativity; time dilation
`,
);
