import { hsPair } from "./outline";

/**
 * Chemistry and Honors Chemistry, following the NGSS physical science standards (HS-PS1) in the
 * order most high school chemistry textbooks teach them (Pearson, Modern Chemistry, OpenStax):
 * matter and measurement, atoms, electrons, the periodic table, bonding, the mole, reactions,
 * stoichiometry, gases, solutions, thermochemistry, rates and equilibrium, and acids and bases.
 * Honors adds quantitative equilibrium, Hess's law, colligative properties, and electrochemistry.
 */
export const [chemistry, honorsChemistry] = hsPair(
  {
    slug: "chemistry",
    title: "Chemistry",
    shortTitle: "Chemistry",
    category: "Sciences",
    hue: 15,
    grades: "Grade 10 or 11",
    description: "Atoms, the periodic table, bonding, reactions, the mole and stoichiometry, gases, solutions, and acids and bases.",
    keywords: ["chemistry", "chem"],
  },
  {
    slug: "honors-chemistry",
    title: "Honors Chemistry",
    shortTitle: "Hon. Chem",
    hue: 8,
    grades: "Grade 10 or 11",
    description: "Everything in Chemistry with more math, plus equilibrium constants, Hess's law, colligative properties, and electrochemistry.",
    keywords: ["honors chemistry", "honors chem", "chemistry honors", "hon chem"],
  },
  `
# Matter and Measurement | Classifying matter and measuring it precisely.
- Scientific Measurement and SI Units | Chemistry measures with metric (SI) units and prefixes. | SI base units; Metric prefixes; Accuracy vs. precision | si units; metric conversions; accuracy and precision
- Significant Figures | Significant figures show how precise a measurement is and carry through calculations. | Counting sig figs; Rounding in calculations; Scientific notation | significant figures; sig figs
- Dimensional Analysis | Conversion factors cancel units to convert from one unit to another. | Conversion factors; Multi-step conversions; Unit cancellation | dimensional analysis; unit conversions chemistry
- Density | Density is mass per volume and identifies substances. | D = m/V; Water displacement; Solving for mass or volume | density
- Classifying Matter | Matter is a pure substance (element or compound) or a mixture. | Elements and compounds; Homogeneous and heterogeneous mixtures; Separating mixtures | classification of matter; pure substances and mixtures
- Physical and Chemical Properties and Changes | Physical changes keep a substance's identity; chemical changes make new substances. | Physical properties; Chemical properties; Signs of a chemical change | physical and chemical changes

# Atomic Structure | What atoms are made of, and how nuclei change.
- The History of the Atomic Model | From Dalton to Thomson, Rutherford, Bohr, and the quantum model. | Dalton's atomic theory; Thomson and Rutherford; Bohr model | history of the atom; atomic models
- Subatomic Particles | Protons, neutrons, and electrons determine atomic number and mass number. | Atomic number; Mass number; Ions | protons neutrons electrons; subatomic particles
- Isotopes and Average Atomic Mass | Isotopes differ in neutrons; average atomic mass weights them by abundance. | Isotope notation; Average atomic mass; Mass spectrometry | isotopes; average atomic mass
- Nuclear Chemistry | Alpha, beta, and gamma decay, half-life, fission, and fusion. | Types of radioactive decay; Half-life; Fission and fusion | nuclear chemistry; radioactive decay; half life

# Electrons in Atoms | Light, energy levels, and electron configurations.
- Light and Atomic Spectra | Electrons emit light of specific wavelengths when they fall to lower energy levels. | Wavelength and frequency; Photons; Emission spectra | electromagnetic spectrum; atomic emission spectra
- Electron Configurations | Electrons fill orbitals by the aufbau principle, Pauli exclusion, and Hund's rule. | Aufbau principle; Orbital diagrams; Noble gas notation | electron configuration; orbital diagrams
- Valence Electrons and Lewis Dot Diagrams | Valence electrons determine how an atom bonds. | Counting valence electrons; Electron dot diagrams; The octet rule | valence electrons; lewis dot structures for atoms
+ Quantum Numbers | Four quantum numbers describe each electron's energy level, orbital shape, orientation, and spin. | n, l, ml, ms; Orbital shapes; Exceptions to configurations | quantum numbers

# The Periodic Table | How the table is organized and the trends it predicts.
- Organization of the Periodic Table | Groups share valence electrons; periods share energy levels. | Groups and periods; Metals, nonmetals, metalloids; Mendeleev | periodic table organization
- Families of Elements | Alkali metals, alkaline earth metals, halogens, noble gases, and transition metals. | Alkali and alkaline earth metals; Halogens and noble gases; Transition metals | groups of the periodic table
- Periodic Trends | Atomic radius, ionization energy, and electronegativity change predictably across the table. | Atomic radius; Ionization energy; Electronegativity | periodic trends

# Chemical Bonding | Ionic, covalent, and metallic bonds, and the shapes of molecules.
- Ionic Bonding | Metals transfer electrons to nonmetals, forming ions held together in a lattice. | Forming ions; Ionic lattices; Properties of ionic compounds | ionic bonding; ionic compounds
- Naming Ionic Compounds and Writing Formulas | Ionic formulas balance charges; names follow the cation and anion. | Criss-cross method; Polyatomic ions; Transition metal names | naming ionic compounds; writing chemical formulas
- Covalent Bonding | Nonmetals share electrons in single, double, and triple bonds. | Shared pairs; Multiple bonds; Properties of molecular compounds | covalent bonding
- Naming Covalent Compounds | Molecular compounds use prefixes like mono-, di-, and tri-. | Prefixes; Writing formulas from names; Acids | naming covalent compounds
- Lewis Structures | Lewis structures show how valence electrons are arranged in a molecule. | Drawing Lewis structures; Resonance; Exceptions to the octet rule | lewis structures
- VSEPR and Molecular Shape | Electron pairs repel, giving molecules shapes like linear, trigonal planar, and tetrahedral. | VSEPR theory; Molecular geometries; Bond angles | vsepr theory; molecular geometry
- Polarity and Intermolecular Forces | Polar molecules attract each other; London dispersion, dipole-dipole, and hydrogen bonds set physical properties. | Bond and molecular polarity; Types of intermolecular forces; Boiling points | intermolecular forces; polarity
- Metallic Bonding | A sea of electrons makes metals conductive and malleable. | Electron sea model; Properties of metals; Alloys | metallic bonding

# The Mole | Counting particles by weighing them.
- The Mole and Avogadro's Number | One mole is 6.02 × 10²³ particles. | Avogadro's number; Moles to particles; Representative particles | the mole; avogadros number
- Molar Mass and Mole Conversions | Molar mass converts between grams and moles. | Molar mass; Grams to moles; Multi-step conversions | molar mass; mole conversions
- Percent Composition | The percent by mass of each element in a compound. | Percent composition; From formulas; From lab data | percent composition
- Empirical and Molecular Formulas | The simplest whole-number ratio, and the actual formula. | Finding empirical formulas; Molecular formulas; Hydrates | empirical formula; molecular formula

# Chemical Reactions | Writing, balancing, and classifying reactions.
- Writing and Balancing Equations | Balanced equations follow the law of conservation of mass. | Reactants and products; Coefficients; Conservation of mass | balancing chemical equations
- Types of Chemical Reactions | Synthesis, decomposition, single replacement, double replacement, and combustion. | Five reaction types; Predicting products; Combustion | types of chemical reactions
- The Activity Series | The activity series predicts whether a single replacement reaction happens. | Activity series of metals; Predicting reactions; Halogens | activity series
- Reactions in Aqueous Solution | Precipitation reactions and net ionic equations. | Solubility rules; Precipitates; Net ionic equations | net ionic equations; precipitation reactions

# Stoichiometry | Calculating amounts in chemical reactions.
- Mole Ratios | Coefficients in a balanced equation give the ratio of moles. | Mole ratios; Mole-to-mole problems; Balanced equations first | mole ratio
- Mass-to-Mass Stoichiometry | Grams of one substance convert to grams of another through moles. | The stoichiometry roadmap; Mass to mass; Particles and volume | stoichiometry; mass to mass stoichiometry
- Limiting Reactants | The reactant that runs out first limits how much product forms. | Identifying the limiting reactant; Excess reactant; Theoretical yield | limiting reactant; limiting reagent
- Percent Yield | Actual yield compared with theoretical yield. | Theoretical yield; Actual yield; Percent yield | percent yield

# Gases | The behavior of gases and the gas laws.
- Kinetic Molecular Theory and Pressure | Gas particles move constantly; collisions create pressure. | Kinetic molecular theory; Pressure units; Temperature in kelvin | kinetic molecular theory; gas pressure
- Boyle's, Charles's, and Gay-Lussac's Laws | Pressure, volume, and temperature trade off when the amount of gas is fixed. | Boyle's law; Charles's law; Gay-Lussac's law | boyles law; charles law; gas laws
- The Combined and Ideal Gas Laws | PV = nRT ties pressure, volume, moles, and temperature together. | Combined gas law; Ideal gas law; Molar volume at STP | ideal gas law; combined gas law
- Dalton's Law and Gas Stoichiometry | Partial pressures add up; gas volumes take part in stoichiometry. | Partial pressures; Collecting gas over water; Gas stoichiometry | daltons law of partial pressures; gas stoichiometry

# States of Matter and Solutions | Phase changes, solutions, and concentration.
- Phase Changes and Phase Diagrams | Heating curves and phase diagrams show when matter melts, boils, or sublimes. | Heating curves; Vapor pressure; Phase diagrams | phase changes; phase diagrams; heating curve
- Solutions and Solubility | Like dissolves like; temperature and pressure change solubility. | Solute and solvent; Solubility curves; Saturated and unsaturated | solubility; solubility curves
- Concentration and Molarity | Molarity is moles of solute per liter of solution. | Molarity; Making solutions; Percent by mass | molarity; concentration
- Dilutions | M1V1 = M2V2 when a solution is diluted. | Dilution equation; Preparing dilutions; Serial dilutions | dilutions; m1v1 m2v2
+ Colligative Properties | Dissolved particles lower freezing points and raise boiling points. | Freezing point depression; Boiling point elevation; Molality | colligative properties

# Thermochemistry | Energy changes in reactions.
- Energy and Heat | Heat flows from hot to cold; reactions are endothermic or exothermic. | System and surroundings; Endothermic and exothermic; Energy diagrams | endothermic and exothermic reactions
- Specific Heat and Calorimetry | q = mcΔT measures heat transferred, and calorimeters measure it in the lab. | Specific heat; q = mcΔT; Calorimetry | specific heat; calorimetry
- Enthalpy and Thermochemical Equations | ΔH is the heat of a reaction at constant pressure. | Enthalpy change; Thermochemical equations; Heats of fusion and vaporization | enthalpy; thermochemical equations
+ Hess's Law and Heats of Formation | Reaction enthalpies add like the steps of a path. | Hess's law; Standard enthalpies of formation; Bond energies | hess law; enthalpy of formation

# Reaction Rates and Equilibrium | How fast reactions go and where they settle.
- Collision Theory and Reaction Rates | Temperature, concentration, surface area, and catalysts change reaction rates. | Collision theory; Activation energy; Catalysts | reaction rates; collision theory
- Chemical Equilibrium | Reversible reactions reach a balance where forward and reverse rates are equal. | Reversible reactions; Dynamic equilibrium; Equilibrium position | chemical equilibrium
- Le Chatelier's Principle | A system at equilibrium shifts to relieve stress from changes in concentration, temperature, or pressure. | Concentration changes; Temperature changes; Pressure changes | le chateliers principle
+ Equilibrium Constants | K expressions measure where equilibrium lies; Q predicts which way a reaction shifts. | Writing K expressions; Reaction quotient Q; ICE tables | equilibrium constant; ice tables
+ Solubility Equilibrium | Ksp describes how much of a slightly soluble salt dissolves. | Ksp; Molar solubility; Common ion effect | ksp; solubility product

# Acids and Bases | Properties of acids and bases, pH, and neutralization.
- Properties and Definitions of Acids and Bases | Arrhenius and Brønsted-Lowry definitions, and conjugate pairs. | Properties of acids and bases; Arrhenius and Brønsted-Lowry; Conjugate acid-base pairs | acids and bases; bronsted lowry
- The pH Scale | pH measures hydrogen ion concentration on a log scale. | pH and pOH; Calculating pH; Indicators | ph scale; calculating ph
- Strong and Weak Acids and Bases | Strong acids ionize completely; weak acids only partly. | Strong vs. weak; Ka and Kb; Percent ionization | strong and weak acids
- Neutralization and Titration | Acids and bases neutralize each other; titration finds an unknown concentration. | Neutralization reactions; Titration; Equivalence point | titration; neutralization reactions
+ Buffers | Buffers resist changes in pH by neutralizing added acid or base. | Buffer components; How buffers work; Buffers in the body | buffers chemistry

#+ Redox and Electrochemistry | Honors: electron transfer and batteries.
- Oxidation and Reduction | Oxidation is losing electrons; reduction is gaining them. | Oxidation numbers; Identifying redox; Oxidizing and reducing agents | oxidation and reduction; redox reactions
- Balancing Redox Reactions | Half-reactions balance both atoms and electrons. | Half-reaction method; Acidic solutions; Basic solutions | balancing redox reactions
- Galvanic and Electrolytic Cells | Galvanic cells turn chemical energy into electricity; electrolytic cells do the reverse. | Anode and cathode; Cell potential; Electrolysis | galvanic cells; electrochemical cells; electrolysis
`,
);
