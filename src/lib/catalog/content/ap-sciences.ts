import { course, t, u } from "./spec";

export const apes = course(
  {
    slug: "ap-environmental-science",
    title: "AP Environmental Science",
    shortTitle: "APES",
    category: "Sciences",
    hue: 110,
    description: "Ecosystems, populations, resources, energy, pollution, and global change, with the math and data analysis the exam expects.",
    keywords: ["apes", "ap environmental science", "environmental science", "ap enviro", "enviro sci"],
  },
  [
    u("The Living World: Ecosystems", "Energy flow and nutrient cycles.", [
      t("Ecosystem Interactions and Biomes", "Terrestrial and aquatic biomes are shaped by climate, and species interact through predation, competition, and symbiosis.", ["biomes", "symbiosis"]),
      t("Biogeochemical Cycles", "Carbon, nitrogen, phosphorus, and water cycle between living things and the environment.", ["carbon cycle", "nitrogen cycle", "phosphorus cycle"]),
      t("Energy Flow and the 10% Rule", "Only about 10% of energy passes up each trophic level, which limits food chain length.", ["trophic levels", "food webs", "primary productivity"]),
    ]),
    u("The Living World: Biodiversity", "Diversity, island biogeography, and ecological succession.", [
      t("Biodiversity and Ecosystem Services", "Genetic, species, and ecosystem diversity make ecosystems resilient and provide services people depend on.", ["biodiversity", "ecosystem services"]),
      t("Island Biogeography and Ecological Succession", "Island size and distance set species richness; succession rebuilds communities after disturbance.", ["island biogeography", "ecological succession"]),
    ]),
    u("Populations", "Population growth, carrying capacity, and human demographics.", [
      t("r- and K-Selected Species and Survivorship", "Species trade off many offspring with little care against few offspring with much care.", ["r selected", "k selected", "survivorship curves"]),
      t("Population Growth and Carrying Capacity", "Populations grow exponentially until resources impose a carrying capacity.", ["carrying capacity", "logistic growth"]),
      t("Human Population Dynamics", "Age structure diagrams and the demographic transition explain how human populations change.", ["demographic transition", "age structure diagrams", "rule of 70"]),
    ]),
    u("Earth Systems and Resources", "Plate tectonics, soil, the atmosphere, and climate.", [
      t("Plate Tectonics and Soil", "Plate boundaries create earthquakes and volcanoes; soil forms slowly and erodes quickly.", ["plate tectonics", "soil horizons"]),
      t("Atmosphere, Weather, and Climate", "Uneven solar heating drives global wind patterns, rain shadows, and El Niño.", ["atmospheric layers", "el nino", "rain shadow"]),
    ]),
    u("Land and Water Use", "Agriculture, forestry, mining, and urbanization.", [
      t("Agriculture and the Green Revolution", "Industrial agriculture raised yields with fertilizer, irrigation, and monocultures at environmental cost.", ["green revolution", "irrigation", "pesticides"]),
      t("Tragedy of the Commons and Sustainable Practices", "Shared resources get overused without rules; sustainable practices balance use and renewal.", ["tragedy of the commons", "sustainable agriculture"]),
      t("Urbanization, Mining, and Fishing", "Urban sprawl, mining, and overfishing reshape land and water ecosystems.", ["urban sprawl", "overfishing", "mining"]),
    ]),
    u("Energy Resources and Consumption", "Fossil fuels, nuclear, and renewables.", [
      t("Fossil Fuels", "Coal, oil, and natural gas are energy-dense but release carbon dioxide and pollutants.", ["fossil fuels", "fracking"]),
      t("Nuclear Power", "Fission produces power without CO₂ but leaves radioactive waste and accident risk.", ["nuclear energy", "half life"]),
      t("Renewable Energy", "Solar, wind, hydroelectric, geothermal, and biomass each have benefits and tradeoffs.", ["solar energy", "wind energy", "renewables"]),
    ]),
    u("Atmospheric Pollution", "Air pollutants, smog, and acid rain.", [
      t("Air Pollutants and Photochemical Smog", "Primary pollutants from combustion react in sunlight to form ozone and smog.", ["photochemical smog", "air pollution", "clean air act"]),
      t("Acid Rain and Indoor Air Pollution", "Sulfur and nitrogen oxides form acid rain; indoor pollutants like radon and CO are often worse.", ["acid rain", "radon"]),
    ]),
    u("Aquatic and Terrestrial Pollution", "Water pollution, toxins, and solid waste.", [
      t("Water Pollution and Eutrophication", "Nutrient runoff causes algal blooms, oxygen loss, and dead zones.", ["eutrophication", "dead zones", "point source"]),
      t("Toxins, Bioaccumulation, and Biomagnification", "Persistent toxins build up in organisms and concentrate up the food chain.", ["biomagnification", "bioaccumulation", "LD50"]),
      t("Solid Waste and Sewage Treatment", "Landfills, incineration, recycling, and sewage treatment each manage waste differently.", ["landfills", "sewage treatment"]),
    ]),
    u("Global Change", "Ozone depletion, climate change, and biodiversity loss.", [
      t("Stratospheric Ozone Depletion", "CFCs destroy stratospheric ozone that blocks UV radiation; the Montreal Protocol reversed the trend.", ["ozone layer", "CFCs"]),
      t("Climate Change and the Greenhouse Effect", "Greenhouse gases trap heat, driving warming, sea level rise, and ocean acidification.", ["greenhouse effect", "global warming", "ocean acidification"]),
      t("Invasive Species and Endangered Species", "Habitat loss, invasive species, and overexploitation drive most extinctions.", ["invasive species", "HIPPCO", "endangered species"]),
    ]),
  ],
);

export const physics1 = course(
  {
    slug: "ap-physics-1",
    title: "AP Physics 1: Algebra-Based",
    shortTitle: "Physics 1",
    category: "Sciences",
    hue: 215,
    description: "Mechanics without calculus: kinematics, forces, energy, momentum, rotation, oscillations, and fluids.",
    query: "AP Physics 1",
    keywords: ["ap physics 1", "physics 1", "ap phys 1"],
  },
  [
    u("Kinematics", "Describing motion in one and two dimensions.", [
      t("Position, Velocity, and Acceleration", "Velocity is the rate of change of position and acceleration the rate of change of velocity.", ["kinematics", "displacement"]),
      t("Motion Graphs", "The slope of a position–time graph is velocity; the area under a velocity–time graph is displacement.", ["position time graph", "velocity time graph"]),
      t("Kinematic Equations", "For constant acceleration, four equations connect displacement, velocity, acceleration, and time.", ["big four equations", "constant acceleration"]),
      t("Projectile Motion", "Horizontal and vertical motion are independent: constant velocity sideways, free fall vertically.", ["projectiles", "2d motion"]),
    ]),
    u("Force and Translational Dynamics", "Newton's laws, free-body diagrams, and friction.", [
      t("Newton's Laws of Motion", "Net force causes acceleration (F = ma), and forces always come in equal and opposite pairs.", ["newtons laws", "newton's second law", "newton's third law"]),
      t("Free-Body Diagrams", "Draw every force on one object to set up Newton's second law in each direction.", ["free body diagram", "FBD"]),
      t("Friction and Inclines", "Friction opposes sliding with magnitude μN; on an incline, split gravity into components.", ["friction", "inclined plane", "coefficient of friction"]),
      t("Circular Motion and Gravitation", "Uniform circular motion needs a net inward force mv²/r; gravity supplies it for orbits.", ["centripetal force", "universal gravitation", "orbits"]),
    ]),
    u("Work, Energy, and Power", "Energy and its conservation.", [
      t("Work and Kinetic Energy", "Net work on an object equals its change in kinetic energy.", ["work energy theorem", "kinetic energy"]),
      t("Potential Energy and Conservation of Energy", "Without friction, mechanical energy is conserved as it shifts between kinetic and potential.", ["conservation of energy", "potential energy", "springs"]),
      t("Power", "Power is the rate of doing work, measured in watts.", ["power physics"]),
    ]),
    u("Linear Momentum", "Impulse, momentum, and collisions.", [
      t("Impulse and Momentum", "Impulse, force times time, equals the change in momentum.", ["impulse", "momentum"]),
      t("Conservation of Momentum and Collisions", "Momentum is conserved in collisions; kinetic energy is conserved only in elastic ones.", ["elastic collision", "inelastic collision"]),
    ]),
    u("Torque and Rotational Dynamics", "Rotational motion and torque.", [
      t("Rotational Kinematics", "Angular displacement, velocity, and acceleration follow equations parallel to linear kinematics.", ["angular velocity", "rotational motion"]),
      t("Torque and Rotational Inertia", "Torque causes angular acceleration, and rotational inertia depends on how mass is distributed.", ["torque", "moment of inertia", "rotational equilibrium"]),
    ]),
    u("Energy and Momentum of Rotating Systems", "Rotational energy and angular momentum.", [
      t("Rotational Kinetic Energy and Rolling", "Rolling objects split kinetic energy between translation and rotation.", ["rolling motion", "rotational kinetic energy"]),
      t("Angular Momentum", "Angular momentum is conserved without external torque, which is why a spinning skater speeds up when she pulls in her arms.", ["conservation of angular momentum"]),
    ]),
    u("Oscillations", "Simple harmonic motion.", [
      t("Simple Harmonic Motion", "Springs and pendulums oscillate with periods set by mass and spring constant, or length and gravity.", ["SHM", "pendulum", "mass spring system"]),
    ]),
    u("Fluids", "Pressure, buoyancy, and fluid flow.", [
      t("Pressure and Buoyancy", "Pressure increases with depth, and the buoyant force equals the weight of fluid displaced.", ["buoyancy", "archimedes principle", "fluid pressure"]),
      t("Fluid Flow and Bernoulli's Equation", "Continuity and Bernoulli's equation relate speed, pressure, and height in a flowing fluid.", ["bernoulli", "continuity equation"]),
    ]),
  ],
);

export const physics2 = course(
  {
    slug: "ap-physics-2",
    title: "AP Physics 2: Algebra-Based",
    shortTitle: "Physics 2",
    category: "Sciences",
    hue: 225,
    description: "Thermodynamics, electricity and magnetism, optics, and modern physics, without calculus.",
    query: "AP Physics 2",
    keywords: ["ap physics 2", "physics 2", "ap phys 2"],
  },
  [
    u("Thermodynamics", "Heat, temperature, and the laws of thermodynamics.", [
      t("Ideal Gases and Kinetic Theory", "PV = nRT relates a gas's pressure, volume, and temperature to how fast its molecules move.", ["ideal gas law", "kinetic theory"]),
      t("Laws of Thermodynamics and PV Diagrams", "The first law tracks heat and work; the area under a PV curve is work done.", ["first law of thermodynamics", "pv diagrams", "entropy"]),
    ]),
    u("Electric Force, Field, and Potential", "Coulomb's law, fields, and potential.", [
      t("Electric Charge and Coulomb's Law", "Like charges repel and the force falls off as 1/r².", ["coulombs law", "electric charge"]),
      t("Electric Fields and Potential", "The field is force per charge; potential difference is energy per charge.", ["electric field", "electric potential", "voltage"]),
    ]),
    u("Electric Circuits", "Current, resistance, and capacitors.", [
      t("Ohm's Law and Circuits", "V = IR; series resistors add, and parallel resistors combine reciprocally.", ["ohms law", "series and parallel circuits", "kirchhoff"]),
      t("Capacitors and RC Circuits", "Capacitors store charge and energy, and RC circuits charge and discharge over time.", ["capacitors", "RC circuit"]),
    ]),
    u("Magnetism and Electromagnetic Induction", "Magnetic forces and induced currents.", [
      t("Magnetic Fields and Forces", "Moving charges and currents feel magnetic forces perpendicular to their motion.", ["right hand rule", "magnetic force"]),
      t("Electromagnetic Induction", "A changing magnetic flux induces an emf, as Faraday's and Lenz's laws describe.", ["faradays law", "lenzs law", "induction"]),
    ]),
    u("Geometric and Physical Optics", "Reflection, refraction, lenses, and interference.", [
      t("Reflection, Refraction, and Lenses", "Snell's law describes refraction, and the thin lens equation locates images.", ["snells law", "lenses", "mirrors"]),
      t("Wave Optics and Interference", "Double slits and thin films produce interference patterns from path differences.", ["double slit", "interference", "diffraction"]),
    ]),
    u("Modern Physics", "Quantum, atomic, and nuclear physics.", [
      t("Photons and the Photoelectric Effect", "Light comes in photons with energy hf, which explains why frequency, not intensity, ejects electrons.", ["photoelectric effect", "photons"]),
      t("Atomic Energy Levels and Nuclear Physics", "Electrons emit photons when they drop energy levels; nuclear decay and E = mc² govern the nucleus.", ["energy levels", "radioactive decay", "mass energy"]),
    ]),
  ],
);

export const physicsCMech = course(
  {
    slug: "ap-physics-c-mechanics",
    title: "AP Physics C: Mechanics",
    shortTitle: "Physics C: Mech",
    category: "Sciences",
    hue: 205,
    description: "Calculus-based mechanics: kinematics, Newton's laws, energy, momentum, rotation, oscillations, and gravitation.",
    keywords: ["ap physics c mechanics", "physics c mechanics", "physics c mech", "ap physics c"],
  },
  [
    u("Kinematics", "Motion with derivatives and integrals.", [
      t("Kinematics with Calculus", "Velocity is the derivative of position and position is the integral of velocity, even when acceleration isn't constant.", ["calculus kinematics"]),
    ]),
    u("Force and Translational Dynamics", "Newton's laws, drag, and systems.", [
      t("Newton's Laws with Calculus", "Apply F = ma with changing forces, including velocity-dependent drag and differential equations.", ["drag force", "terminal velocity", "differential equations physics"]),
      t("Center of Mass", "The center of mass of a continuous object comes from integrating position weighted by mass.", ["center of mass"]),
    ]),
    u("Work, Energy, and Power", "Work integrals and potential energy.", [
      t("Work as an Integral", "Work is the integral of force over displacement, and force is the negative derivative of potential energy.", ["work integral", "potential energy curves"]),
    ]),
    u("Linear Momentum", "Impulse and momentum with calculus.", [
      t("Impulse, Momentum, and Collisions", "Impulse is the integral of force over time; momentum is conserved for isolated systems.", ["impulse integral"]),
    ]),
    u("Torque and Rotational Dynamics", "Rotational inertia by integration and rotational dynamics.", [
      t("Rotational Inertia by Integration", "Find rotational inertia by integrating r² dm, and use the parallel axis theorem to shift axes.", ["moment of inertia integral", "parallel axis theorem"]),
      t("Torque and Angular Acceleration", "Net torque equals rotational inertia times angular acceleration.", ["rotational dynamics"]),
    ]),
    u("Energy and Momentum of Rotating Systems", "Rolling and angular momentum.", [
      t("Angular Momentum and Rolling", "Angular momentum is conserved without external torque, and rolling without slipping links v and ω.", ["angular momentum", "rolling without slipping"]),
    ]),
    u("Oscillations", "Simple harmonic motion as a differential equation.", [
      t("Simple Harmonic Motion with Calculus", "SHM solves d²x/dt² = −ω²x, giving sinusoidal motion with period 2π/ω.", ["SHM differential equation", "physical pendulum"]),
    ]),
    u("Gravitation", "Universal gravitation and orbits.", [
      t("Orbits and Gravitational Potential Energy", "Gravitational potential energy is −GMm/r, and energy and angular momentum conservation describe orbits.", ["orbital mechanics", "escape velocity", "kepler"]),
    ]),
  ],
);

export const physicsCEM = course(
  {
    slug: "ap-physics-c-electricity-and-magnetism",
    title: "AP Physics C: Electricity and Magnetism",
    shortTitle: "Physics C: E&M",
    category: "Sciences",
    hue: 240,
    description: "Calculus-based electricity and magnetism: fields, Gauss's law, potential, circuits, magnetic fields, and induction.",
    query: "AP Physics C E&M",
    keywords: ["physics c e&m", "physics c em", "ap physics c electricity", "e&m", "electricity and magnetism"],
  },
  [
    u("Electric Charges, Fields, and Gauss's Law", "Fields from charge distributions.", [
      t("Electric Fields of Continuous Charge Distributions", "Integrate contributions from each bit of charge to find the field of rods, rings, and disks.", ["charge distributions", "electric field integral"]),
      t("Gauss's Law", "Electric flux through a closed surface equals the enclosed charge over ε₀; symmetry makes it powerful.", ["gauss law", "electric flux"]),
    ]),
    u("Electric Potential", "Potential and potential energy.", [
      t("Electric Potential and Potential Energy", "Potential is the negative line integral of the field, and the field is the negative gradient of potential.", ["electric potential", "equipotential"]),
    ]),
    u("Conductors and Capacitors", "Conductors in equilibrium and capacitance.", [
      t("Conductors and Capacitance", "Charge on conductors sits on the surface; capacitance depends on geometry and dielectrics.", ["capacitance", "dielectrics", "conductors"]),
    ]),
    u("Electric Circuits", "DC and RC circuits with calculus.", [
      t("RC Circuits", "Charging and discharging capacitors follow exponential curves with time constant RC.", ["RC circuits", "time constant"]),
    ]),
    u("Magnetic Fields and Electromagnetism", "Biot–Savart, Ampère, and magnetic forces.", [
      t("Biot–Savart Law and Ampère's Law", "Find magnetic fields of currents with Biot–Savart, or with Ampère's law when there's symmetry.", ["biot savart", "amperes law", "solenoid"]),
      t("Magnetic Forces on Charges and Currents", "F = qv × B and F = IL × B describe magnetic forces on moving charges and wires.", ["lorentz force"]),
    ]),
    u("Electromagnetic Induction", "Faraday, Lenz, and inductors.", [
      t("Faraday's Law and Lenz's Law", "Changing flux induces an emf that opposes the change.", ["faradays law", "lenzs law"]),
      t("Inductance and LR Circuits", "Inductors resist changes in current, and LR and LC circuits have characteristic time behavior.", ["inductors", "LR circuit", "LC circuit"]),
    ]),
  ],
);

// Units added to the original AP Biology and AP Chemistry courses, placed by unit number.
export const bioExtraUnits = {
  before: [
    u("Chemistry of Life", "Water, macromolecules, and the building blocks of cells.", [
      t("Properties of Water", "Hydrogen bonding gives water cohesion, adhesion, high specific heat, and its power as a solvent.", ["water properties", "hydrogen bonds"]),
      t("Biological Macromolecules", "Carbohydrates, lipids, proteins, and nucleic acids are built from monomers by dehydration synthesis.", ["macromolecules", "proteins", "carbohydrates", "lipids", "nucleic acids"]),
    ]),
    u("Cell Structure and Function", "Organelles, membranes, and transport.", [
      t("Cell Organelles", "Each organelle has a job: ribosomes make proteins, the ER and Golgi process them, and mitochondria make ATP.", ["organelles", "endomembrane system"]),
      t("Membrane Structure and Transport", "The fluid mosaic membrane controls traffic through diffusion, osmosis, and active transport.", ["cell membrane", "osmosis", "active transport", "tonicity"]),
    ]),
  ],
  afterEnergetics: [
    u("Cell Communication and Cell Cycle", "Signaling, feedback, and cell division.", [
      t("Cell Signaling Pathways", "Signal transduction relays a message from receptor to response through cascades and second messengers.", ["signal transduction", "second messengers"]),
      t("Feedback and Homeostasis", "Negative feedback keeps conditions stable; positive feedback amplifies a change.", ["negative feedback", "positive feedback"]),
      t("The Cell Cycle and Mitosis", "Checkpoints regulate the cell cycle, and mitosis divides chromosomes evenly; losing control leads to cancer.", ["mitosis", "cell cycle checkpoints", "cancer"]),
    ]),
  ],
  after: [
    u("Ecology", "Energy flow, populations, and communities.", [
      t("Energy Flow Through Ecosystems", "Energy flows from producers up trophic levels, with most lost as heat at each step.", ["trophic levels", "food webs"]),
      t("Population Ecology", "Populations grow exponentially until density-dependent factors impose a carrying capacity.", ["logistic growth", "carrying capacity"]),
      t("Community Ecology and Biodiversity", "Species interactions and biodiversity determine how communities respond to disruption.", ["community interactions", "keystone species"]),
    ]),
  ],
};

export const chemExtraUnits = {
  afterBonding: [
    u("Chemical Reactions", "Stoichiometry and reaction types.", [
      t("Stoichiometry", "Balanced equations give mole ratios that convert between amounts of reactants and products.", ["stoichiometry", "limiting reactant", "moles"]),
      t("Net Ionic Equations and Reaction Types", "Precipitation, acid–base, and redox reactions are written as net ionic equations without spectator ions.", ["net ionic equations", "redox", "precipitation reactions"]),
    ]),
    u("Kinetics", "Reaction rates and mechanisms.", [
      t("Rate Laws and Reaction Order", "Rate laws come from experiment, and integrated rate laws show concentration over time.", ["rate law", "reaction order", "half life"]),
      t("Reaction Mechanisms and Catalysts", "The slowest elementary step sets the rate law, and catalysts lower activation energy.", ["reaction mechanism", "rate determining step", "catalysts"]),
    ]),
    u("Thermochemistry", "Heat, enthalpy, and calorimetry.", [
      t("Calorimetry and Enthalpy", "q = mcΔT measures heat flow, and ΔH tells whether a reaction is exothermic or endothermic.", ["calorimetry", "enthalpy", "q mc delta t"]),
      t("Hess's Law and Bond Enthalpies", "Enthalpy changes add along any path, so you can combine known reactions or bond energies.", ["hess law", "bond enthalpy", "enthalpy of formation"]),
    ]),
  ],
  after: [
    u("Electrochemistry", "Galvanic and electrolytic cells.", [
      t("Galvanic Cells and Cell Potential", "A galvanic cell turns a spontaneous redox reaction into electric current; E° comes from reduction potentials.", ["galvanic cell", "cell potential", "electrochemistry"]),
      t("Electrolysis", "Electrolytic cells use current to drive nonspontaneous reactions, with Faraday's law linking charge to mass.", ["electrolysis", "electrolytic cell"]),
    ]),
  ],
};
