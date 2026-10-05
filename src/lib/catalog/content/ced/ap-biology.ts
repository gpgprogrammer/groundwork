import type { CourseSpec } from "../spec";

/**
 * AP Biology, following the College Board Course and Exam Description (units and topics in CED order).
 */
export const biology: CourseSpec = {
  "course": {
    "slug": "ap-biology",
    "title": "AP Biology",
    "shortTitle": "AP Bio",
    "exam": "AP",
    "category": "Sciences",
    "description": "From cells to ecosystems, taught through the four big ideas: evolution, energetics, information storage, and systems interactions.",
    "hue": 140,
    "examMonth": "May",
    "query": "AP Biology",
    "keywords": [
      "ap bio",
      "ap biology",
      "biology",
      "bio"
    ]
  },
  "units": [
    {
      "slug": "chemistry-of-life",
      "title": "Chemistry of Life",
      "summary": "Water and the molecules that make up living things.",
      "concepts": [
        {
          "title": "Chemistry of Life",
          "topics": [
            {
              "slug": "properties-of-water",
              "title": "Properties of Water",
              "summary": "Hydrogen bonding gives water cohesion, adhesion, high specific heat, and its power as a solvent.",
              "aliases": [
                "water properties",
                "hydrogen bonds"
              ]
            },
            {
              "slug": "elements-of-life",
              "title": "Elements of Life",
              "summary": "Living things build molecules mainly from carbon, hydrogen, oxygen, nitrogen, phosphorus, and sulfur, cycled from the environment.",
              "points": [
                "CHNOPS",
                "Carbon's bonding",
                "Where nitrogen and phosphorus go"
              ],
              "aliases": [
                "elements of life",
                "chnops"
              ]
            },
            {
              "slug": "biological-macromolecules",
              "title": "Biological Macromolecules",
              "summary": "Carbohydrates, lipids, proteins, and nucleic acids are built from monomers by dehydration synthesis.",
              "aliases": [
                "macromolecules",
                "proteins",
                "carbohydrates",
                "lipids",
                "nucleic acids"
              ]
            },
            {
              "slug": "proteins-and-nucleic-acids-structure-and-function",
              "title": "Proteins and Nucleic Acids: Structure and Function",
              "summary": "A protein's amino acid sequence folds into the shape that sets its function; nucleotide sequence carries genetic information.",
              "points": [
                "Levels of protein structure",
                "Directionality of DNA and RNA",
                "Structure determines function"
              ],
              "aliases": [
                "protein structure",
                "nucleic acids"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "cell-structure-and-function",
      "title": "Cells",
      "summary": "Organelles, membranes, and how cells move materials.",
      "concepts": [
        {
          "title": "Cells",
          "topics": [
            {
              "slug": "cell-organelles",
              "title": "Cell Organelles",
              "summary": "Each organelle has a job: ribosomes make proteins, the ER and Golgi process them, and mitochondria make ATP.",
              "aliases": [
                "organelles",
                "endomembrane system"
              ]
            },
            {
              "slug": "cell-size-and-surface-area",
              "title": "Cell Size and Surface Area",
              "summary": "As cells grow, volume outpaces surface area, limiting exchange with the environment, which is why cells stay small.",
              "points": [
                "Surface area-to-volume ratio",
                "Why cells divide",
                "Adaptations that increase surface area"
              ],
              "aliases": [
                "cell size",
                "surface area to volume"
              ]
            },
            {
              "slug": "membrane-structure-and-transport",
              "title": "Membrane Structure and Transport",
              "summary": "The fluid mosaic membrane controls traffic through diffusion, osmosis, and active transport.",
              "aliases": [
                "cell membrane",
                "osmosis",
                "active transport",
                "tonicity"
              ]
            },
            {
              "slug": "tonicity-and-osmoregulation",
              "title": "Tonicity and Osmoregulation",
              "summary": "Water moves toward higher solute concentration; cells in hypertonic, hypotonic, or isotonic solutions shrink, swell, or stay the same.",
              "points": [
                "Water potential",
                "Hypertonic, hypotonic, isotonic",
                "Osmoregulation"
              ],
              "aliases": [
                "tonicity",
                "osmosis",
                "water potential"
              ]
            },
            {
              "slug": "compartmentalization-and-the-origin-of-organelles",
              "title": "Compartmentalization and the Origin of Organelles",
              "summary": "Membranes divide eukaryotic cells into compartments; mitochondria and chloroplasts likely began as engulfed prokaryotes.",
              "points": [
                "Compartmentalization",
                "Endosymbiont theory",
                "Prokaryotes vs. eukaryotes"
              ],
              "aliases": [
                "endosymbiosis",
                "compartmentalization"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "cellular-energetics",
      "title": "Cellular Energetics",
      "summary": "Enzymes, photosynthesis, and cellular respiration.",
      "concepts": [
        {
          "title": "Cellular Energetics",
          "topics": [
            {
              "slug": "enzyme-kinetics",
              "title": "Enzymes and Activation Energy",
              "glyph": "E + S ⇌ ES",
              "summary": "Enzymes speed up reactions by lowering activation energy. Temperature, pH, and inhibitors all work by changing the shape of the active site.",
              "points": [
                "Active site specificity",
                "Denaturation",
                "Competitive vs. noncompetitive inhibition"
              ],
              "aliases": [
                "enzymes",
                "activation energy",
                "inhibitors"
              ]
            },
            {
              "slug": "cellular-energy",
              "title": "Cellular Energy",
              "summary": "Cells couple energy-releasing reactions to energy-requiring ones, usually through ATP.",
              "points": [
                "Laws of thermodynamics in cells",
                "ATP coupling",
                "Metabolic pathways"
              ],
              "aliases": [
                "cellular energy",
                "atp"
              ]
            },
            {
              "slug": "photosynthesis",
              "title": "Photosynthesis",
              "glyph": "hν → ATP",
              "summary": "The light reactions capture energy as ATP and NADPH, and the Calvin cycle uses them to fix CO₂ into sugar. Track where each molecule goes.",
              "points": [
                "Light-dependent reactions",
                "The Calvin cycle",
                "Chemiosmosis in the chloroplast"
              ],
              "aliases": [
                "light reactions",
                "calvin cycle",
                "chloroplast"
              ]
            },
            {
              "slug": "cellular-respiration",
              "title": "Cellular Respiration",
              "glyph": "C₆H₁₂O₆ → ATP",
              "summary": "Glycolysis, the Krebs cycle, and oxidative phosphorylation release energy from glucose in steps. Most of the ATP comes from a proton gradient.",
              "points": [
                "Glycolysis and pyruvate oxidation",
                "Electron transport chain",
                "Fermentation"
              ],
              "aliases": [
                "krebs cycle",
                "electron transport chain",
                "atp synthase",
                "glycolysis"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "cell-communication-and-cell-cycle",
      "title": "Cell Communication and Cell Cycle",
      "summary": "Signaling, feedback, and cell division.",
      "concepts": [
        {
          "title": "Cell Communication and Cell Cycle",
          "topics": [
            {
              "slug": "cell-signaling-pathways",
              "title": "Cell Signaling Pathways",
              "summary": "Signal transduction relays a message from receptor to response through cascades and second messengers.",
              "aliases": [
                "signal transduction",
                "second messengers"
              ]
            },
            {
              "slug": "feedback-and-homeostasis",
              "title": "Feedback and Homeostasis",
              "summary": "Negative feedback keeps conditions stable; positive feedback amplifies a change.",
              "aliases": [
                "negative feedback",
                "positive feedback"
              ]
            },
            {
              "slug": "the-cell-cycle-and-mitosis",
              "title": "The Cell Cycle and Mitosis",
              "summary": "Checkpoints regulate the cell cycle, and mitosis divides chromosomes evenly; losing control leads to cancer.",
              "aliases": [
                "mitosis",
                "cell cycle checkpoints",
                "cancer"
              ]
            },
            {
              "slug": "regulation-of-the-cell-cycle",
              "title": "Regulation of the Cell Cycle",
              "summary": "Checkpoints, cyclins, and CDKs control when cells divide; losing that control can cause cancer.",
              "points": [
                "Checkpoints",
                "Cyclins and CDKs",
                "Cancer and apoptosis"
              ],
              "aliases": [
                "cell cycle regulation",
                "cyclins",
                "cancer"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "heredity",
      "title": "Heredity",
      "summary": "Meiosis and patterns of inheritance.",
      "concepts": [
        {
          "title": "Heredity",
          "topics": [
            {
              "slug": "meiosis",
              "title": "Meiosis and Genetic Variation",
              "glyph": "2n → n",
              "summary": "Meiosis makes four genetically unique haploid cells. Crossing over and independent assortment are where the variation comes from.",
              "points": [
                "Meiosis I vs. II",
                "Crossing over",
                "Nondisjunction"
              ],
              "aliases": [
                "crossing over",
                "independent assortment",
                "gametes"
              ]
            },
            {
              "slug": "mendelian-genetics",
              "title": "Mendelian Genetics and Chi-Square",
              "glyph": "χ²",
              "summary": "Punnett squares predict ratios, and chi-square tests whether the observed data really fit them. Both show up in free response almost every year.",
              "points": [
                "Monohybrid and dihybrid crosses",
                "Linked genes",
                "Running a chi-square test"
              ],
              "aliases": [
                "punnett square",
                "chi square",
                "mendel",
                "dihybrid"
              ]
            },
            {
              "slug": "non-mendelian-genetics",
              "title": "Non-Mendelian Genetics",
              "summary": "Linked genes, sex-linked traits, incomplete dominance, and polygenic traits don't follow simple Mendelian ratios.",
              "points": [
                "Linkage and recombination",
                "Sex-linked traits",
                "Pedigrees and chi-square"
              ],
              "aliases": [
                "non mendelian genetics",
                "sex linked",
                "pedigrees"
              ]
            },
            {
              "slug": "environmental-effects-on-phenotype",
              "title": "Environmental Effects on Phenotype",
              "summary": "The same genotype can produce different phenotypes in different environments.",
              "points": [
                "Phenotypic plasticity",
                "Examples like hydrangea color",
                "Gene–environment interaction"
              ],
              "aliases": [
                "phenotypic plasticity"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "gene-expression",
      "title": "Gene Expression and Regulation",
      "summary": "DNA, RNA, protein, and how genes are controlled.",
      "concepts": [
        {
          "title": "Gene Expression and Regulation",
          "topics": [
            {
              "slug": "dna-structure-and-replication",
              "title": "DNA Structure and Replication",
              "summary": "DNA's double helix is copied semiconservatively by helicase, DNA polymerase, and ligase, with leading and lagging strands.",
              "points": [
                "Base pairing",
                "Semiconservative replication",
                "Leading and lagging strands"
              ],
              "aliases": [
                "dna replication",
                "dna structure"
              ]
            },
            {
              "slug": "transcription-translation",
              "title": "Transcription and Translation",
              "glyph": "DNA → RNA → ⬡",
              "summary": "RNA polymerase transcribes DNA into mRNA, and ribosomes translate the mRNA into protein. In eukaryotes the mRNA is processed before it leaves the nucleus.",
              "points": [
                "Template vs. coding strand",
                "mRNA processing",
                "Codons and tRNA"
              ],
              "aliases": [
                "central dogma",
                "protein synthesis",
                "mrna"
              ]
            },
            {
              "slug": "operons",
              "title": "Operons and Gene Regulation",
              "glyph": "lac",
              "summary": "Bacteria turn groups of genes on or off together. The lac operon is inducible and the trp operon is repressible, and the exam loves comparing them.",
              "points": [
                "Repressors and inducers",
                "lac vs. trp",
                "Eukaryotic regulation"
              ],
              "aliases": [
                "lac operon",
                "trp operon",
                "gene regulation"
              ]
            },
            {
              "slug": "gene-expression-and-cell-specialization",
              "title": "Gene Expression and Cell Specialization",
              "summary": "Different cells express different genes, through transcription factors, epigenetics, and alternative splicing.",
              "points": [
                "Transcription factors",
                "Epigenetics",
                "Cell differentiation"
              ],
              "aliases": [
                "gene regulation eukaryotes",
                "epigenetics"
              ]
            },
            {
              "slug": "mutations",
              "title": "Mutations",
              "summary": "Changes in DNA can alter proteins and phenotypes; mutations are the raw material for evolution.",
              "points": [
                "Point and frameshift mutations",
                "Effects on proteins",
                "Horizontal gene transfer"
              ],
              "aliases": [
                "mutations"
              ]
            },
            {
              "slug": "biotechnology",
              "title": "Biotechnology",
              "summary": "Gel electrophoresis, PCR, and bacterial transformation let scientists analyze and engineer DNA.",
              "points": [
                "PCR",
                "Gel electrophoresis",
                "Transformation and CRISPR"
              ],
              "aliases": [
                "biotechnology",
                "pcr",
                "gel electrophoresis"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "natural-selection",
      "title": "Natural Selection",
      "summary": "How populations evolve, and the evidence for it.",
      "concepts": [
        {
          "title": "Natural Selection",
          "topics": [
            {
              "slug": "natural-and-artificial-selection",
              "title": "Natural and Artificial Selection",
              "summary": "Individuals with heritable traits suited to their environment leave more offspring; humans can select traits on purpose.",
              "points": [
                "Variation, inheritance, selection",
                "Fitness",
                "Artificial selection"
              ],
              "aliases": [
                "natural selection",
                "artificial selection"
              ]
            },
            {
              "slug": "population-genetics",
              "title": "Population Genetics",
              "summary": "Mutation, genetic drift, gene flow, and selection change allele frequencies in a population.",
              "points": [
                "Genetic drift and bottlenecks",
                "Gene flow",
                "Sources of variation"
              ],
              "aliases": [
                "genetic drift",
                "population genetics"
              ]
            },
            {
              "slug": "hardy-weinberg",
              "title": "Hardy-Weinberg Equilibrium",
              "glyph": "p² + 2pq + q²",
              "summary": "Hardy-Weinberg describes a population that isn't evolving. Compare real allele frequencies to it to see evolution happening.",
              "points": [
                "The five conditions",
                "Solving from q²",
                "What deviations mean"
              ],
              "aliases": [
                "hardy weinberg",
                "allele frequency",
                "population genetics"
              ]
            },
            {
              "slug": "evidence-of-evolution-and-common-ancestry",
              "title": "Evidence of Evolution and Common Ancestry",
              "summary": "Fossils, anatomy, molecular data, and shared processes like the genetic code show that species share common ancestors.",
              "points": [
                "Fossils and anatomy",
                "Molecular evidence",
                "Ongoing evolution"
              ],
              "aliases": [
                "evidence of evolution"
              ]
            },
            {
              "slug": "phylogeny",
              "title": "Phylogeny",
              "summary": "Phylogenetic trees and cladograms show evolutionary relationships using shared derived characters.",
              "points": [
                "Reading cladograms",
                "Shared derived characters",
                "Molecular clocks"
              ],
              "aliases": [
                "phylogeny",
                "cladograms"
              ]
            },
            {
              "slug": "speciation-and-extinction",
              "title": "Speciation and Extinction",
              "summary": "New species form when populations become reproductively isolated; extinctions open niches for new species.",
              "points": [
                "Allopatric and sympatric speciation",
                "Reproductive barriers",
                "Extinction"
              ],
              "aliases": [
                "speciation"
              ]
            },
            {
              "slug": "origins-of-life-on-earth",
              "title": "Origins of Life on Earth",
              "summary": "Hypotheses like the RNA world explain how simple organic molecules could lead to the first cells.",
              "points": [
                "Early Earth conditions",
                "Miller–Urey",
                "RNA world"
              ],
              "aliases": [
                "origin of life"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "ecology",
      "title": "Ecology",
      "summary": "Energy, populations, communities, and ecosystems.",
      "concepts": [
        {
          "title": "Ecology",
          "topics": [
            {
              "slug": "responses-to-the-environment",
              "title": "Responses to the Environment",
              "summary": "Organisms respond to environmental cues through behavior and physiology that help them survive and reproduce.",
              "points": [
                "Behavioral responses",
                "Communication",
                "Physiological responses"
              ],
              "aliases": [
                "animal behavior",
                "responses to environment"
              ]
            },
            {
              "slug": "energy-flow-through-ecosystems",
              "title": "Energy Flow Through Ecosystems",
              "summary": "Energy flows from producers up trophic levels, with most lost as heat at each step.",
              "aliases": [
                "trophic levels",
                "food webs"
              ]
            },
            {
              "slug": "population-ecology",
              "title": "Population Ecology",
              "summary": "Populations grow exponentially until density-dependent factors impose a carrying capacity.",
              "aliases": [
                "logistic growth",
                "carrying capacity"
              ]
            },
            {
              "slug": "community-ecology-and-biodiversity",
              "title": "Community Ecology and Biodiversity",
              "summary": "Species interactions and biodiversity determine how communities respond to disruption.",
              "aliases": [
                "community interactions",
                "keystone species"
              ]
            },
            {
              "slug": "disruptions-in-ecosystems",
              "title": "Disruptions in Ecosystems",
              "summary": "Invasive species, habitat change, and human activity can disrupt ecosystems and drive extinctions.",
              "points": [
                "Invasive species",
                "Human impacts",
                "Ecosystem resilience"
              ],
              "aliases": [
                "ecosystem disruption",
                "invasive species"
              ]
            }
          ]
        }
      ]
    }
  ]
};
