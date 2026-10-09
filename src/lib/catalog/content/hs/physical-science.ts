import { hsCourse } from "./outline";

/**
 * Physical Science, the one-year introduction to chemistry and physics many schools teach in
 * grade 9, following the NGSS physical science standards (HS-PS1 to PS4) and textbooks such as
 * Pearson's Physical Science: Concepts in Action.
 */
export const physicalScience = hsCourse(
  {
    slug: "physical-science",
    title: "Physical Science",
    shortTitle: "Phys. Sci",
    category: "Sciences",
    hue: 45,
    grades: "Grade 9",
    description: "A first look at chemistry and physics: matter, atoms, reactions, motion, forces, energy, waves, and electricity.",
    keywords: ["physical science", "phys sci", "physical science class"],
  },
  `
# Science Skills | How scientists investigate and measure.
- The Scientific Method | Scientists ask questions, test hypotheses, and draw conclusions from evidence. | Hypotheses; Variables and controls; Theories and laws | scientific method
- Measurement and the Metric System | Scientists measure in metric units and convert between them. | SI units; Metric conversions; Scientific notation | metric system; scientific measurement
- Graphs and Data | Line graphs, bar graphs, and tables show relationships in data. | Choosing a graph; Slope; Direct and inverse relationships | graphing data science

# Properties of Matter | What matter is and how it changes.
- Classifying Matter | Matter is an element, a compound, or a mixture. | Pure substances; Mixtures; Solutions, suspensions, colloids | classifying matter; elements compounds and mixtures
- Physical and Chemical Properties | Physical properties are observed without changing the substance; chemical properties describe how it reacts. | Density; Physical properties; Chemical properties | physical and chemical properties
- Physical and Chemical Changes | Physical changes keep identity; chemical changes make new substances. | Signs of a chemical change; Reversible changes; Conservation of mass | physical and chemical changes
- States of Matter | Particle motion explains solids, liquids, and gases. | Solids, liquids, gases; Plasma; Kinetic theory | states of matter
- Phase Changes | Adding or removing energy melts, freezes, boils, condenses, or sublimes matter. | Melting and freezing; Evaporation and condensation; Sublimation | phase changes
- Gas Laws | Pressure, volume, and temperature of a gas are related. | Boyle's law; Charles's law; Gas pressure | gas laws

# Atoms and the Periodic Table | Atomic structure and the organization of the elements.
- Atomic Theory and Models | Ideas about the atom changed from Democritus and Dalton to the modern model. | Dalton; Thomson and Rutherford; Bohr and the electron cloud | atomic theory; models of the atom
- Protons, Neutrons, and Electrons | Atomic number counts protons; mass number counts protons and neutrons. | Subatomic particles; Atomic number and mass number; Isotopes | parts of an atom; isotopes
- Organizing the Periodic Table | Elements are arranged by atomic number into groups and periods. | Mendeleev; Groups and periods; Reading an element square | periodic table
- Metals, Nonmetals, and Metalloids | Elements fall into three classes with different properties. | Metals; Nonmetals; Metalloids | metals nonmetals metalloids
- Valence Electrons and Reactivity | Valence electrons explain why elements in a group react alike. | Valence electrons; Electron dot diagrams; Reactive families | valence electrons

# Chemical Bonds | How atoms combine.
- Ionic Bonds | Atoms transfer electrons to form ions that attract each other. | Forming ions; Ionic compounds; Properties | ionic bonds
- Covalent Bonds | Atoms share electrons to form molecules. | Sharing electrons; Polar and nonpolar bonds; Molecular compounds | covalent bonds
- Chemical Formulas and Names | Formulas show the ratio of atoms; names follow simple rules. | Writing formulas; Naming ionic compounds; Naming molecular compounds | chemical formulas
- Metallic Bonds | Metal atoms share a sea of electrons. | Electron sea; Properties of metals; Alloys | metallic bonds

# Chemical Reactions | Reactions, solutions, and acids and bases.
- Chemical Equations | Balanced equations show conservation of mass. | Reactants and products; Balancing equations; Conservation of mass | balancing chemical equations
- Types of Reactions | Synthesis, decomposition, single and double replacement, and combustion. | Reaction types; Predicting products; Combustion | types of chemical reactions
- Energy and Reaction Rates | Reactions release or absorb energy; temperature and catalysts change their speed. | Exothermic and endothermic; Activation energy; Factors affecting rate | reaction rates; exothermic and endothermic
- Solutions | Solutes dissolve in solvents; solubility depends on temperature and pressure. | Solute and solvent; Solubility; Concentration | solutions and solubility
- Acids, Bases, and pH | Acids and bases have opposite properties and neutralize each other. | Properties of acids and bases; pH scale; Neutralization | acids and bases; ph scale
- Nuclear Chemistry | Unstable nuclei decay; fission and fusion release huge amounts of energy. | Radioactive decay; Half-life; Fission and fusion | radioactivity; nuclear fission and fusion

# Motion | Describing how things move.
- Distance and Displacement | Distance is total path length; displacement is the change in position. | Frames of reference; Distance; Displacement | distance and displacement
- Speed and Velocity | Speed is distance per time; velocity adds direction. | Average speed; Velocity; Distance-time graphs | speed and velocity
- Acceleration | Acceleration is any change in velocity. | Calculating acceleration; Speed-time graphs; Free fall | acceleration

# Forces and Motion | Newton's laws and gravity.
- Forces and Net Force | Balanced forces don't change motion; unbalanced forces do. | Balanced and unbalanced; Net force; Force diagrams | net force; balanced and unbalanced forces
- Friction and Gravity | Friction opposes motion; gravity pulls masses together. | Types of friction; Weight vs. mass; Universal gravitation | friction; gravity
- Newton's Laws of Motion | Inertia, F = ma, and action-reaction pairs explain motion. | First law; Second law; Third law | newtons laws of motion
- Momentum | Momentum is mass times velocity and is conserved in collisions. | Calculating momentum; Conservation; Collisions | momentum
- Pressure and Buoyancy | Fluids push on objects; buoyant force makes things float. | Pressure; Archimedes' principle; Pascal's and Bernoulli's principles | buoyancy; fluid pressure

# Work, Energy, and Power | Energy forms, transformations, and machines.
- Work and Power | Work is force times distance; power is how fast work is done. | Calculating work; Calculating power; Units | work and power
- Simple Machines | Machines change the size or direction of a force. | Six simple machines; Mechanical advantage; Efficiency | simple machines
- Forms of Energy | Kinetic, potential, thermal, chemical, and other forms of energy. | Kinetic energy; Potential energy; Other forms | forms of energy; kinetic and potential energy
- Energy Conversion and Conservation | Energy changes form but is never created or destroyed. | Energy transformations; Conservation of energy; Energy resources | conservation of energy; energy transformations
- Thermal Energy and Heat | Heat flows from warm to cool by conduction, convection, and radiation. | Temperature vs. heat; Heat transfer; Specific heat | thermal energy; heat transfer

# Waves, Sound, and Light | How waves carry energy.
- Mechanical Waves | Waves carry energy through a medium as transverse or longitudinal waves. | Types of waves; Wavelength, frequency, amplitude; Wave speed | mechanical waves; properties of waves
- Wave Interactions | Waves reflect, refract, diffract, and interfere. | Reflection and refraction; Diffraction; Interference | wave interactions
- Sound | Sound waves travel through matter; pitch and loudness depend on frequency and amplitude. | Speed of sound; Pitch and loudness; Doppler effect | sound waves
- The Electromagnetic Spectrum and Light | Light is an electromagnetic wave; the spectrum runs from radio to gamma rays. | EM spectrum; Visible light and color; Uses of EM waves | electromagnetic spectrum; light and color
- Mirrors and Lenses | Mirrors reflect and lenses refract light to form images. | Plane and curved mirrors; Convex and concave lenses; Optical instruments | mirrors and lenses

# Electricity and Magnetism | Charge, circuits, and magnets.
- Electric Charge and Static Electricity | Charges attract or repel; static electricity builds up and discharges. | Charging objects; Conductors and insulators; Static discharge | static electricity; electric charge
- Electric Current and Ohm's Law | Voltage pushes current through resistance. | Current; Voltage; Ohm's law | electric current; ohms law
- Electric Circuits | Series and parallel circuits connect devices differently. | Series circuits; Parallel circuits; Circuit safety | series and parallel circuits
- Magnetism | Magnets have poles and magnetic fields; Earth is a giant magnet. | Magnetic poles; Magnetic fields; Earth's magnetism | magnetism
- Electromagnetism | Electricity makes magnetism and magnetism makes electricity, powering motors and generators. | Electromagnets; Motors; Generators | electromagnetism; electric motors and generators
`,
);
