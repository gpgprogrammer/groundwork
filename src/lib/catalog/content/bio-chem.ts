import type { CourseSpec } from "./spec";

export const bio: CourseSpec = {
  course: {
    slug: "ap-biology",
    title: "AP Biology",
    shortTitle: "AP Bio",
    exam: "AP",
    subject: "Science",
    description:
      "From cells to ecosystems, taught through the four big ideas: evolution, energetics, information storage, and systems interactions.",
    hue: 140,
    examMonth: "May",
  },
  units: [
    {
      slug: "cellular-energetics",
      title: "Cellular Energetics",
      summary: "Enzymes, photosynthesis, and respiration: how cells capture and spend energy.",
      concepts: [
        {
          title: "Enzymes",
          topics: [
            {
              slug: "enzyme-kinetics",
              title: "Enzymes and Activation Energy",
              glyph: "E + S ⇌ ES",
              summary:
                "Enzymes speed up reactions by lowering activation energy. Temperature, pH, and inhibitors all work by changing the shape of the active site.",
              points: ["Active site specificity", "Denaturation", "Competitive vs. noncompetitive inhibition"],
              aliases: ["enzymes", "activation energy", "inhibitors"],
            },
          ],
        },
        {
          title: "Photosynthesis and Respiration",
          topics: [
            {
              slug: "photosynthesis",
              title: "Photosynthesis",
              glyph: "hν → ATP",
              summary:
                "The light reactions capture energy as ATP and NADPH, and the Calvin cycle uses them to fix CO₂ into sugar. Track where each molecule goes.",
              points: ["Light-dependent reactions", "The Calvin cycle", "Chemiosmosis in the chloroplast"],
              aliases: ["light reactions", "calvin cycle", "chloroplast"],
            },
            {
              slug: "cellular-respiration",
              title: "Cellular Respiration",
              glyph: "C₆H₁₂O₆ → ATP",
              summary:
                "Glycolysis, the Krebs cycle, and oxidative phosphorylation release energy from glucose in steps. Most of the ATP comes from a proton gradient.",
              points: ["Glycolysis and pyruvate oxidation", "Electron transport chain", "Fermentation"],
              aliases: ["krebs cycle", "electron transport chain", "atp synthase", "glycolysis"],
            },
          ],
        },
      ],
    },
    {
      slug: "heredity",
      title: "Heredity",
      summary: "Meiosis, Mendel, and the math of inheritance.",
      concepts: [
        {
          title: "Inheritance",
          topics: [
            {
              slug: "meiosis",
              title: "Meiosis and Genetic Variation",
              glyph: "2n → n",
              summary:
                "Meiosis makes four genetically unique haploid cells. Crossing over and independent assortment are where the variation comes from.",
              points: ["Meiosis I vs. II", "Crossing over", "Nondisjunction"],
              aliases: ["crossing over", "independent assortment", "gametes"],
            },
            {
              slug: "mendelian-genetics",
              title: "Mendelian Genetics and Chi-Square",
              glyph: "χ²",
              summary:
                "Punnett squares predict ratios, and chi-square tests whether the observed data really fit them. Both show up in free response almost every year.",
              points: ["Monohybrid and dihybrid crosses", "Linked genes", "Running a chi-square test"],
              aliases: ["punnett square", "chi square", "mendel", "dihybrid"],
            },
          ],
        },
      ],
    },
    {
      slug: "gene-expression",
      title: "Gene Expression and Regulation",
      summary: "DNA to RNA to protein, and how cells control it.",
      concepts: [
        {
          title: "Expression",
          topics: [
            {
              slug: "transcription-translation",
              title: "Transcription and Translation",
              glyph: "DNA → RNA → ⬡",
              summary:
                "RNA polymerase transcribes DNA into mRNA, and ribosomes translate the mRNA into protein. In eukaryotes the mRNA is processed before it leaves the nucleus.",
              points: ["Template vs. coding strand", "mRNA processing", "Codons and tRNA"],
              aliases: ["central dogma", "protein synthesis", "mrna"],
            },
            {
              slug: "operons",
              title: "Operons and Gene Regulation",
              glyph: "lac",
              summary:
                "Bacteria turn groups of genes on or off together. The lac operon is inducible and the trp operon is repressible, and the exam loves comparing them.",
              points: ["Repressors and inducers", "lac vs. trp", "Eukaryotic regulation"],
              aliases: ["lac operon", "trp operon", "gene regulation"],
            },
          ],
        },
      ],
    },
    {
      slug: "natural-selection",
      title: "Natural Selection",
      summary: "Evolution, population genetics, and the evidence behind it.",
      concepts: [
        {
          title: "Population Genetics",
          topics: [
            {
              slug: "hardy-weinberg",
              title: "Hardy-Weinberg Equilibrium",
              glyph: "p² + 2pq + q²",
              summary:
                "Hardy-Weinberg describes a population that isn't evolving. Compare real allele frequencies to it to see evolution happening.",
              points: ["The five conditions", "Solving from q²", "What deviations mean"],
              aliases: ["hardy weinberg", "allele frequency", "population genetics"],
            },
          ],
        },
      ],
    },
  ],
};

export const chem: CourseSpec = {
  course: {
    slug: "ap-chemistry",
    title: "AP Chemistry",
    shortTitle: "AP Chem",
    exam: "AP",
    subject: "Science",
    description:
      "Atomic structure through thermodynamics, with the quantitative reasoning and particle-level explanations the free response requires.",
    hue: 196,
    examMonth: "May",
  },
  units: [
    {
      slug: "atomic-structure",
      title: "Atomic Structure and Properties",
      summary: "Electrons, spectra, and periodic trends.",
      concepts: [
        {
          title: "Electrons",
          topics: [
            {
              slug: "electron-configuration",
              title: "Electron Configuration and PES",
              glyph: "1s² 2s² 2p⁶",
              summary:
                "Electron configurations show which subshells are filled. Photoelectron spectroscopy measures those energies directly.",
              points: ["Aufbau order", "Reading a PES graph", "Ions and exceptions"],
              aliases: ["pes", "photoelectron spectroscopy", "orbitals"],
            },
            {
              slug: "periodic-trends",
              title: "Periodic Trends",
              glyph: "Zeff",
              summary:
                "Atomic radius, ionization energy, and electronegativity all follow from Coulomb's law. Explain every trend with effective nuclear charge and distance.",
              points: ["Coulomb's law reasoning", "Shielding", "Ionization energy exceptions"],
              aliases: ["atomic radius", "ionization energy", "electronegativity"],
            },
          ],
        },
      ],
    },
    {
      slug: "bonding",
      title: "Molecular Structure and Properties",
      summary: "Lewis structures, geometry, and the forces between molecules.",
      concepts: [
        {
          title: "Structure",
          topics: [
            {
              slug: "vsepr",
              title: "Lewis Structures and VSEPR",
              glyph: "⌬",
              summary:
                "Draw the Lewis structure, count the electron domains, and VSEPR gives you the shape. Formal charge helps you choose between possible structures.",
              points: ["Counting electron domains", "Formal charge", "Polarity from shape"],
              aliases: ["lewis structure", "molecular geometry", "formal charge"],
            },
            {
              slug: "intermolecular-forces",
              title: "Intermolecular Forces",
              glyph: "δ+ ··· δ−",
              summary:
                "London dispersion forces, dipole-dipole attractions, and hydrogen bonding explain boiling points and solubility. Always name the specific force.",
              points: ["Ranking IMF strength", "Polarizability", "Boiling point justifications"],
              aliases: ["imf", "hydrogen bonding", "london dispersion"],
            },
          ],
        },
      ],
    },
    {
      slug: "equilibrium",
      title: "Equilibrium",
      summary: "Reversible reactions and how systems respond to stress.",
      concepts: [
        {
          title: "Equilibrium",
          topics: [
            {
              slug: "le-chatelier",
              title: "Le Châtelier's Principle",
              glyph: "⇌",
              summary:
                "When you disturb a system at equilibrium, it shifts to partly undo the change. Explain the shift by comparing Q to K.",
              points: ["Concentration and pressure changes", "Temperature changes K", "Q vs. K"],
              aliases: ["le chatelier", "equilibrium shift", "reaction quotient"],
            },
            {
              slug: "ice-tables",
              title: "ICE Tables",
              glyph: "I · C · E",
              summary:
                "An ICE table lays out the initial amounts, the change, and the equilibrium amounts, so you can solve for concentrations. Check whether the small-x approximation holds.",
              points: ["Setting up the table", "Small-x approximation", "Solving for K"],
              aliases: ["ice table", "equilibrium calculations"],
            },
          ],
        },
      ],
    },
    {
      slug: "acids-bases",
      title: "Acids and Bases",
      summary: "pH, titrations, and buffers.",
      concepts: [
        {
          title: "Acid–Base Equilibria",
          topics: [
            {
              slug: "buffers",
              title: "Buffers and Henderson–Hasselbalch",
              glyph: "pKa + log(A⁻/HA)",
              summary:
                "A buffer resists pH change because it contains both a weak acid and its conjugate base. When the two are equal, pH = pKa.",
              points: ["Why buffers work", "Henderson–Hasselbalch", "Buffer capacity"],
              aliases: ["henderson hasselbalch", "buffer", "pka"],
            },
            {
              slug: "titration-curves",
              title: "Titration Curves",
              glyph: "⟋⎯⟋",
              summary:
                "A titration curve shows the equivalence point and the half-equivalence point, where pH = pKa. Its shape tells you whether the acid is strong or weak.",
              points: ["Equivalence point", "Half-equivalence", "Choosing an indicator"],
              aliases: ["titration", "equivalence point"],
            },
          ],
        },
      ],
    },
    {
      slug: "thermodynamics",
      title: "Thermodynamics",
      summary: "Enthalpy, entropy, and whether a reaction happens on its own.",
      concepts: [
        {
          title: "Free Energy",
          topics: [
            {
              slug: "gibbs-free-energy",
              title: "Gibbs Free Energy",
              glyph: "ΔG = ΔH − TΔS",
              summary:
                "ΔG combines enthalpy and entropy to predict whether a process is thermodynamically favorable. Its sign can flip with temperature.",
              points: ["Signs of ΔH and ΔS", "Temperature dependence", "ΔG° and K"],
              aliases: ["gibbs", "free energy", "entropy", "thermodynamically favorable"],
            },
          ],
        },
      ],
    },
  ],
};
