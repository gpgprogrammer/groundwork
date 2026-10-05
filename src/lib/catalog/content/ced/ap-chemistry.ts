import type { CourseSpec } from "../spec";

/**
 * AP Chemistry, following the College Board Course and Exam Description (units and topics in CED order).
 */
export const chem: CourseSpec = {
  "course": {
    "slug": "ap-chemistry",
    "title": "AP Chemistry",
    "shortTitle": "AP Chem",
    "exam": "AP",
    "category": "Sciences",
    "description": "Atomic structure through thermodynamics, with the quantitative reasoning and particle-level explanations the free response requires.",
    "hue": 196,
    "examMonth": "May",
    "query": "AP Chemistry",
    "keywords": [
      "ap chem",
      "ap chemistry",
      "chemistry",
      "chem"
    ]
  },
  "units": [
    {
      "slug": "atomic-structure",
      "title": "Atomic Structure and Properties",
      "summary": "Moles, atoms, electrons, and the trends of the periodic table.",
      "concepts": [
        {
          "title": "Atomic Structure and Properties",
          "topics": [
            {
              "slug": "moles-and-molar-mass",
              "title": "Moles and Molar Mass",
              "summary": "A mole is 6.022 × 10²³ particles; molar mass converts between grams and moles.",
              "points": [
                "Avogadro's number",
                "Grams ↔ moles ↔ particles",
                "Molar mass from the periodic table"
              ],
              "aliases": [
                "mole concept",
                "molar mass",
                "avogadro"
              ]
            },
            {
              "slug": "mass-spectra-of-elements",
              "title": "Mass Spectra of Elements",
              "summary": "A mass spectrum shows an element's isotopes and their relative abundances, which set its average atomic mass.",
              "points": [
                "Reading a mass spectrum",
                "Isotopes",
                "Average atomic mass"
              ],
              "aliases": [
                "mass spectrometry",
                "isotopes"
              ]
            },
            {
              "slug": "composition-of-pure-substances-and-mixtures",
              "title": "Composition of Pure Substances and Mixtures",
              "summary": "Percent composition and empirical formulas describe pure substances; mixtures can vary in composition.",
              "points": [
                "Percent by mass",
                "Empirical formulas",
                "Pure substances vs. mixtures"
              ],
              "aliases": [
                "empirical formula",
                "percent composition"
              ]
            },
            {
              "slug": "electron-configuration",
              "title": "Electron Configuration and PES",
              "glyph": "1s² 2s² 2p⁶",
              "summary": "Electron configurations show which subshells are filled. Photoelectron spectroscopy measures those energies directly.",
              "points": [
                "Aufbau order",
                "Reading a PES graph",
                "Ions and exceptions"
              ],
              "aliases": [
                "pes",
                "photoelectron spectroscopy",
                "orbitals"
              ]
            },
            {
              "slug": "periodic-trends",
              "title": "Periodic Trends",
              "glyph": "Zeff",
              "summary": "Atomic radius, ionization energy, and electronegativity all follow from Coulomb's law. Explain every trend with effective nuclear charge and distance.",
              "points": [
                "Coulomb's law reasoning",
                "Shielding",
                "Ionization energy exceptions"
              ],
              "aliases": [
                "atomic radius",
                "ionization energy",
                "electronegativity"
              ]
            },
            {
              "slug": "valence-electrons-and-ionic-compounds",
              "title": "Valence Electrons and Ionic Compounds",
              "summary": "Valence electrons explain how atoms gain or lose electrons to form ions and predict ionic formulas.",
              "points": [
                "Valence electrons",
                "Predicting ion charges",
                "Ionic formulas"
              ],
              "aliases": [
                "valence electrons",
                "ionic compounds"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "bonding",
      "title": "Compound Structure and Properties",
      "summary": "How atoms bond, and how structure shapes a compound's properties.",
      "concepts": [
        {
          "title": "Compound Structure and Properties",
          "topics": [
            {
              "slug": "types-of-chemical-bonds",
              "title": "Types of Chemical Bonds",
              "summary": "Electronegativity difference decides whether atoms share electrons equally, share unequally, or transfer them.",
              "points": [
                "Nonpolar, polar, and ionic bonds",
                "Electronegativity",
                "Metallic bonding"
              ],
              "aliases": [
                "chemical bonds",
                "electronegativity",
                "ionic vs covalent"
              ]
            },
            {
              "slug": "intramolecular-force-and-potential-energy",
              "title": "Intramolecular Force and Potential Energy",
              "summary": "A potential energy curve shows the bond length where attraction and repulsion balance, and how much energy breaks the bond.",
              "points": [
                "Potential energy vs. distance",
                "Bond length and bond energy",
                "Coulomb's law in bonding"
              ],
              "aliases": [
                "potential energy curve",
                "bond length"
              ]
            },
            {
              "slug": "structure-of-ionic-solids-metals-and-alloys",
              "title": "Structure of Ionic Solids, Metals, and Alloys",
              "summary": "Ionic solids form rigid lattices; metals are cations in a sea of electrons, and alloys mix metals by substitution or interstitially.",
              "points": [
                "Ionic lattices",
                "Sea of electrons",
                "Substitutional and interstitial alloys"
              ],
              "aliases": [
                "ionic solids",
                "metallic bonding",
                "alloys"
              ]
            },
            {
              "slug": "vsepr",
              "title": "Lewis Structures and VSEPR",
              "glyph": "⌬",
              "summary": "Draw the Lewis structure, count the electron domains, and VSEPR gives you the shape. Formal charge helps you choose between possible structures.",
              "points": [
                "Counting electron domains",
                "Formal charge",
                "Polarity from shape"
              ],
              "aliases": [
                "lewis structure",
                "molecular geometry",
                "formal charge"
              ]
            },
            {
              "slug": "resonance-and-formal-charge",
              "title": "Resonance and Formal Charge",
              "summary": "When more than one Lewis structure fits, resonance spreads electrons out and formal charge picks the best structure.",
              "points": [
                "Drawing resonance structures",
                "Calculating formal charge",
                "Choosing the best structure"
              ],
              "aliases": [
                "resonance structures",
                "formal charge"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "properties-of-substances-and-mixtures",
      "title": "Properties of Substances and Mixtures",
      "summary": "Intermolecular forces, gases, solutions, and light. The biggest unit on the exam.",
      "concepts": [
        {
          "title": "Forces and states of matter",
          "topics": [
            {
              "slug": "intermolecular-forces",
              "title": "Intermolecular Forces",
              "glyph": "δ+ ··· δ−",
              "summary": "London dispersion forces, dipole-dipole attractions, and hydrogen bonding explain boiling points and solubility. Always name the specific force.",
              "points": [
                "Ranking IMF strength",
                "Polarizability",
                "Boiling point justifications"
              ],
              "aliases": [
                "imf",
                "hydrogen bonding",
                "london dispersion"
              ]
            },
            {
              "slug": "properties-of-solids-liquids-and-gases",
              "title": "Properties of Solids, Liquids, and Gases",
              "summary": "The type of particle and the forces between them explain melting points, vapor pressure, and the behavior of each state.",
              "points": [
                "Ionic, molecular, covalent network, and metallic solids",
                "Vapor pressure",
                "Particle diagrams"
              ],
              "aliases": [
                "properties of solids",
                "states of matter"
              ]
            },
            {
              "slug": "the-ideal-gas-law",
              "title": "The Ideal Gas Law",
              "summary": "PV = nRT ties pressure, volume, moles, and temperature together; Dalton's law adds up partial pressures.",
              "points": [
                "PV = nRT",
                "Partial pressures",
                "Gas stoichiometry"
              ],
              "aliases": [
                "ideal gas law",
                "gas laws",
                "partial pressure"
              ]
            },
            {
              "slug": "kinetic-molecular-theory-and-real-gases",
              "title": "Kinetic Molecular Theory and Real Gases",
              "summary": "Gas particles move faster at higher temperature; real gases deviate from ideal at high pressure and low temperature.",
              "points": [
                "Maxwell–Boltzmann distributions",
                "Average kinetic energy and temperature",
                "When gases aren't ideal"
              ],
              "aliases": [
                "kinetic molecular theory",
                "real gases",
                "maxwell boltzmann"
              ]
            }
          ]
        },
        {
          "title": "Solutions and light",
          "topics": [
            {
              "slug": "solutions-and-molarity",
              "title": "Solutions and Molarity",
              "summary": "Molarity measures concentration; particle diagrams show solute and solvent interacting.",
              "points": [
                "Molarity",
                "Dilution",
                "Particle representations of solutions"
              ],
              "aliases": [
                "molarity",
                "solutions",
                "dilution"
              ]
            },
            {
              "slug": "separating-mixtures-and-solubility",
              "title": "Separating Mixtures and Solubility",
              "summary": "Chromatography and distillation separate mixtures using differences in intermolecular forces; 'like dissolves like' predicts solubility.",
              "points": [
                "Chromatography",
                "Distillation",
                "Like dissolves like"
              ],
              "aliases": [
                "chromatography",
                "solubility"
              ]
            },
            {
              "slug": "spectroscopy-and-photons",
              "title": "Spectroscopy and Photons",
              "summary": "Different regions of the electromagnetic spectrum cause different transitions; E = hν links a photon's energy to its frequency.",
              "points": [
                "Electronic, vibrational, and rotational transitions",
                "E = hν and c = λν",
                "Photoelectron effects"
              ],
              "aliases": [
                "spectroscopy",
                "photon energy",
                "electromagnetic spectrum"
              ]
            },
            {
              "slug": "the-beer-lambert-law",
              "title": "The Beer–Lambert Law",
              "summary": "Absorbance is proportional to concentration (A = εbc), so a spectrophotometer can measure how much solute is present.",
              "points": [
                "A = εbc",
                "Calibration curves",
                "Lab sources of error"
              ],
              "aliases": [
                "beer lambert law",
                "absorbance"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "chemical-reactions",
      "title": "Chemical Reactions",
      "summary": "Representing reactions and calculating amounts.",
      "concepts": [
        {
          "title": "Chemical Reactions",
          "topics": [
            {
              "slug": "physical-and-chemical-changes",
              "title": "Physical and Chemical Changes",
              "summary": "Chemical changes make new substances by breaking and forming bonds; physical changes don't.",
              "points": [
                "Evidence of a reaction",
                "Balanced equations",
                "Particle diagrams of reactions"
              ],
              "aliases": [
                "physical vs chemical change",
                "balancing equations"
              ]
            },
            {
              "slug": "net-ionic-equations-and-reaction-types",
              "title": "Net Ionic Equations and Reaction Types",
              "summary": "Precipitation, acid–base, and redox reactions are written as net ionic equations without spectator ions.",
              "aliases": [
                "net ionic equations",
                "redox",
                "precipitation reactions"
              ]
            },
            {
              "slug": "stoichiometry",
              "title": "Stoichiometry",
              "summary": "Balanced equations give mole ratios that convert between amounts of reactants and products.",
              "aliases": [
                "stoichiometry",
                "limiting reactant",
                "moles"
              ]
            },
            {
              "slug": "introduction-to-titration",
              "title": "Introduction to Titration",
              "summary": "A titration adds a solution of known concentration until the equivalence point to find an unknown concentration.",
              "points": [
                "Equivalence point",
                "Titration calculations",
                "Indicators"
              ],
              "aliases": [
                "titration"
              ]
            },
            {
              "slug": "acid-base-and-redox-reactions",
              "title": "Acid–Base and Redox Reactions",
              "summary": "Acid–base reactions transfer protons; redox reactions transfer electrons, tracked with oxidation numbers.",
              "points": [
                "Brønsted–Lowry acids and bases",
                "Oxidation numbers",
                "Balancing redox"
              ],
              "aliases": [
                "redox reactions",
                "oxidation reduction",
                "acid base reactions"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "kinetics",
      "title": "Kinetics",
      "summary": "How fast reactions go, and why.",
      "concepts": [
        {
          "title": "Kinetics",
          "topics": [
            {
              "slug": "reaction-rates",
              "title": "Reaction Rates",
              "summary": "Rate measures how fast concentrations change; it depends on concentration, temperature, surface area, and catalysts.",
              "points": [
                "Measuring rate",
                "Factors that change rate",
                "Average vs. instantaneous rate"
              ],
              "aliases": [
                "reaction rates"
              ]
            },
            {
              "slug": "rate-laws-and-reaction-order",
              "title": "Rate Laws and Reaction Order",
              "summary": "Rate laws come from experiment, and integrated rate laws show concentration over time.",
              "aliases": [
                "rate law",
                "reaction order",
                "half life"
              ]
            },
            {
              "slug": "integrated-rate-laws-and-half-life",
              "title": "Integrated Rate Laws and Half-Life",
              "summary": "Concentration-vs-time graphs identify the order: zero order gives a straight [A] line, first order a straight ln[A], second order a straight 1/[A].",
              "points": [
                "Integrated rate laws",
                "Half-life",
                "Graphing to find order"
              ],
              "aliases": [
                "integrated rate law",
                "half life",
                "first order"
              ]
            },
            {
              "slug": "collision-model-and-energy-profiles",
              "title": "Collision Model and Energy Profiles",
              "summary": "Molecules must collide with enough energy and the right orientation; the energy profile shows the activation energy barrier.",
              "points": [
                "Collision theory",
                "Activation energy",
                "Elementary reactions"
              ],
              "aliases": [
                "collision theory",
                "activation energy",
                "energy diagram"
              ]
            },
            {
              "slug": "reaction-mechanisms-and-catalysts",
              "title": "Reaction Mechanisms and Catalysts",
              "summary": "The slowest elementary step sets the rate law, and catalysts lower activation energy.",
              "aliases": [
                "reaction mechanism",
                "rate determining step",
                "catalysts"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "thermochemistry",
      "title": "Thermochemistry",
      "summary": "Energy changes in physical and chemical processes.",
      "concepts": [
        {
          "title": "Thermochemistry",
          "topics": [
            {
              "slug": "endothermic-and-exothermic-processes",
              "title": "Endothermic and Exothermic Processes",
              "summary": "Exothermic processes release energy to the surroundings; endothermic ones absorb it. Energy diagrams show the difference.",
              "points": [
                "System vs. surroundings",
                "Energy diagrams",
                "Bond breaking vs. forming"
              ],
              "aliases": [
                "endothermic",
                "exothermic"
              ]
            },
            {
              "slug": "heat-transfer-and-phase-changes",
              "title": "Heat Transfer and Phase Changes",
              "summary": "Heat flows until thermal equilibrium; phase changes absorb or release energy at constant temperature.",
              "points": [
                "Thermal equilibrium",
                "Heating curves",
                "Heats of fusion and vaporization"
              ],
              "aliases": [
                "heat transfer",
                "heating curve",
                "phase changes"
              ]
            },
            {
              "slug": "calorimetry-and-enthalpy",
              "title": "Calorimetry and Enthalpy",
              "summary": "q = mcΔT measures heat flow, and ΔH tells whether a reaction is exothermic or endothermic.",
              "aliases": [
                "calorimetry",
                "enthalpy",
                "q mc delta t"
              ]
            },
            {
              "slug": "hesss-law-and-bond-enthalpies",
              "title": "Hess's Law and Bond Enthalpies",
              "summary": "Enthalpy changes add along any path, so you can combine known reactions or bond energies.",
              "aliases": [
                "hess law",
                "bond enthalpy",
                "enthalpy of formation"
              ]
            },
            {
              "slug": "enthalpy-of-formation",
              "title": "Enthalpy of Formation",
              "summary": "Standard enthalpies of formation give ΔH for any reaction: products minus reactants.",
              "points": [
                "ΔH°f values",
                "Products minus reactants",
                "Elements have ΔH°f = 0"
              ],
              "aliases": [
                "enthalpy of formation"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "equilibrium",
      "title": "Equilibrium",
      "summary": "Reactions that go both ways, and how they respond to change.",
      "concepts": [
        {
          "title": "Equilibrium",
          "topics": [
            {
              "slug": "introduction-to-equilibrium",
              "title": "Introduction to Equilibrium",
              "summary": "At equilibrium, forward and reverse rates are equal, so concentrations stay constant even though both reactions continue.",
              "points": [
                "Dynamic equilibrium",
                "Reversible reactions",
                "Graphs approaching equilibrium"
              ],
              "aliases": [
                "dynamic equilibrium"
              ]
            },
            {
              "slug": "q-and-k",
              "title": "Q and K",
              "summary": "The reaction quotient Q compared with K tells which way a reaction shifts. A large K favors products.",
              "points": [
                "Writing K expressions",
                "Comparing Q and K",
                "Magnitude and manipulation of K"
              ],
              "aliases": [
                "equilibrium constant",
                "reaction quotient"
              ]
            },
            {
              "slug": "ice-tables",
              "title": "ICE Tables",
              "glyph": "I · C · E",
              "summary": "An ICE table lays out the initial amounts, the change, and the equilibrium amounts, so you can solve for concentrations. Check whether the small-x approximation holds.",
              "points": [
                "Setting up the table",
                "Small-x approximation",
                "Solving for K"
              ],
              "aliases": [
                "ice table",
                "equilibrium calculations"
              ]
            },
            {
              "slug": "le-chatelier",
              "title": "Le Châtelier's Principle",
              "glyph": "⇌",
              "summary": "When you disturb a system at equilibrium, it shifts to partly undo the change. Explain the shift by comparing Q to K.",
              "points": [
                "Concentration and pressure changes",
                "Temperature changes K",
                "Q vs. K"
              ],
              "aliases": [
                "le chatelier",
                "equilibrium shift",
                "reaction quotient"
              ]
            },
            {
              "slug": "solubility-equilibria-and-the-common-ion-effect",
              "title": "Solubility Equilibria and the Common-Ion Effect",
              "summary": "Ksp describes how much of a slightly soluble salt dissolves; adding a common ion lowers its solubility.",
              "points": [
                "Ksp expressions",
                "Molar solubility",
                "Common-ion effect"
              ],
              "aliases": [
                "ksp",
                "solubility product",
                "common ion effect"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "acids-bases",
      "title": "Acids and Bases",
      "summary": "pH, weak acids, buffers, and titrations.",
      "concepts": [
        {
          "title": "Acids and Bases",
          "topics": [
            {
              "slug": "ph-and-strong-acids-and-bases",
              "title": "pH and Strong Acids and Bases",
              "summary": "Strong acids and bases ionize completely, so pH comes straight from their concentration; pH + pOH = 14 at 25 °C.",
              "points": [
                "pH and pOH",
                "Kw",
                "Strong acids and bases"
              ],
              "aliases": [
                "ph",
                "strong acids"
              ]
            },
            {
              "slug": "weak-acid-and-base-equilibria",
              "title": "Weak Acid and Base Equilibria",
              "summary": "Weak acids only partially ionize; Ka and an ICE table give the pH.",
              "points": [
                "Ka and Kb",
                "Percent ionization",
                "pH of weak acids"
              ],
              "aliases": [
                "weak acids",
                "ka"
              ]
            },
            {
              "slug": "titration-curves",
              "title": "Titration Curves",
              "glyph": "⟋⎯⟋",
              "summary": "A titration curve shows the equivalence point and the half-equivalence point, where pH = pKa. Its shape tells you whether the acid is strong or weak.",
              "points": [
                "Equivalence point",
                "Half-equivalence",
                "Choosing an indicator"
              ],
              "aliases": [
                "titration",
                "equivalence point"
              ]
            },
            {
              "slug": "molecular-structure-of-acids-and-bases",
              "title": "Molecular Structure of Acids and Bases",
              "summary": "Acid strength depends on bond polarity, bond strength, and how well the conjugate base spreads out its charge.",
              "points": [
                "Bond polarity and strength",
                "Conjugate base stability",
                "Oxyacids"
              ],
              "aliases": [
                "acid strength",
                "molecular structure of acids"
              ]
            },
            {
              "slug": "buffers",
              "title": "Buffers and Henderson–Hasselbalch",
              "glyph": "pKa + log(A⁻/HA)",
              "summary": "A buffer resists pH change because it contains both a weak acid and its conjugate base. When the two are equal, pH = pKa.",
              "points": [
                "Why buffers work",
                "Henderson–Hasselbalch",
                "Buffer capacity"
              ],
              "aliases": [
                "henderson hasselbalch",
                "buffer",
                "pka"
              ]
            },
            {
              "slug": "ph-and-solubility",
              "title": "pH and Solubility",
              "summary": "Salts with basic anions dissolve more in acid, because the acid removes the anion and shifts the equilibrium.",
              "points": [
                "Basic anions",
                "Shifting Ksp with pH",
                "Predicting solubility"
              ],
              "aliases": [
                "ph and solubility"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "thermodynamics",
      "title": "Thermodynamics and Electrochemistry",
      "summary": "Entropy, free energy, and electricity from chemical reactions.",
      "concepts": [
        {
          "title": "Thermodynamics",
          "topics": [
            {
              "slug": "entropy",
              "title": "Entropy",
              "summary": "Entropy measures how dispersed matter and energy are; it increases from solid to liquid to gas and with more moles of gas.",
              "points": [
                "Predicting the sign of ΔS",
                "Absolute entropy",
                "ΔS° from tables"
              ],
              "aliases": [
                "entropy"
              ]
            },
            {
              "slug": "gibbs-free-energy",
              "title": "Gibbs Free Energy",
              "glyph": "ΔG = ΔH − TΔS",
              "summary": "ΔG combines enthalpy and entropy to predict whether a process is thermodynamically favorable. Its sign can flip with temperature.",
              "points": [
                "Signs of ΔH and ΔS",
                "Temperature dependence",
                "ΔG° and K"
              ],
              "aliases": [
                "gibbs",
                "free energy",
                "entropy",
                "thermodynamically favorable"
              ]
            },
            {
              "slug": "free-energy-and-equilibrium",
              "title": "Free Energy and Equilibrium",
              "summary": "ΔG° = −RT ln K connects thermodynamics to equilibrium; coupled reactions drive unfavorable ones forward.",
              "points": [
                "ΔG° and K",
                "Thermodynamic vs. kinetic control",
                "Coupled reactions"
              ],
              "aliases": [
                "free energy and equilibrium"
              ]
            }
          ]
        },
        {
          "title": "Electrochemistry",
          "topics": [
            {
              "slug": "galvanic-cells-and-cell-potential",
              "title": "Galvanic Cells and Cell Potential",
              "summary": "A galvanic cell turns a spontaneous redox reaction into electric current; E° comes from reduction potentials.",
              "aliases": [
                "galvanic cell",
                "cell potential",
                "electrochemistry"
              ]
            },
            {
              "slug": "cell-potential-under-nonstandard-conditions",
              "title": "Cell Potential Under Nonstandard Conditions",
              "summary": "When concentrations change, cell potential changes too: a cell's voltage drops as it approaches equilibrium.",
              "points": [
                "E° vs. E",
                "Qualitative Nernst reasoning",
                "ΔG° = −nFE°"
              ],
              "aliases": [
                "nernst equation",
                "cell potential and free energy"
              ]
            },
            {
              "slug": "electrolysis",
              "title": "Electrolysis",
              "summary": "Electrolytic cells use current to drive nonspontaneous reactions, with Faraday's law linking charge to mass.",
              "aliases": [
                "electrolysis",
                "electrolytic cell"
              ]
            }
          ]
        }
      ]
    }
  ]
};
