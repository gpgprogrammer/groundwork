import { hsPair } from "./outline";

/**
 * Biology and Honors Biology, following the NGSS high school life science standards (HS-LS1 to
 * LS4) in the order most textbooks teach them (Miller & Levine, OpenStax, state frameworks):
 * biochemistry, cells, energy, cell division, genetics, DNA, evolution, diversity, ecology, and
 * the human body. Honors adds molecular depth: signaling, gene regulation, and population genetics.
 */
export const [biology, honorsBiology] = hsPair(
  {
    slug: "biology",
    title: "Biology",
    shortTitle: "Biology",
    category: "Sciences",
    hue: 130,
    grades: "Grade 9 or 10",
    description: "Cells, energy, genetics and DNA, evolution, ecology, and the human body: the science of living things.",
    keywords: ["biology", "bio"],
  },
  {
    slug: "honors-biology",
    title: "Honors Biology",
    shortTitle: "Hon. Biology",
    hue: 138,
    grades: "Grade 9 or 10",
    description: "Everything in Biology with more molecular depth: cell signaling, gene regulation, the details of respiration and photosynthesis, and population genetics.",
    keywords: ["honors biology", "honors bio", "biology honors", "hon bio"],
  },
  `
# The Science of Biology | What life is and how biologists study it.
- Characteristics of Life | Living things are made of cells, use energy, grow, reproduce, respond, and maintain homeostasis. | Eight characteristics of life; Homeostasis; Levels of organization | characteristics of life; what is life
- The Scientific Method | Questions, hypotheses, controlled experiments, and conclusions. | Hypotheses; Independent and dependent variables; Controls | scientific method; controlled experiment
- Experimental Design and Data | Designing fair tests and graphing and interpreting results. | Constants and controls; Graphing data; Drawing conclusions | experimental design biology

# The Chemistry of Life | Atoms, water, and the molecules living things are built from.
- Atoms, Bonds, and Compounds | Covalent, ionic, and hydrogen bonds hold the molecules of life together. | Elements of life; Ionic and covalent bonds; Hydrogen bonds | chemistry of life; chemical bonds biology
- Properties of Water | Water's polarity makes it cohesive, a strong solvent, and slow to change temperature. | Polarity; Cohesion and adhesion; pH and buffers | properties of water
- Carbohydrates and Lipids | Sugars store quick energy and build structures; lipids store energy and form membranes. | Monosaccharides and polysaccharides; Fats and phospholipids; Steroids | carbohydrates; lipids
- Proteins and Nucleic Acids | Proteins do most cell work; nucleic acids store and transmit genetic information. | Amino acids and protein structure; DNA and RNA; Monomers and polymers | proteins; nucleic acids; macromolecules
- Enzymes | Enzymes speed up reactions by lowering activation energy; temperature and pH affect them. | Active sites; Activation energy; Factors affecting enzymes | enzymes; how enzymes work

# Cells | Cell structure, membranes, and transport.
- Cell Theory and Microscopes | All living things are made of cells, which come from existing cells. | Cell theory; Light and electron microscopes; History of cell discovery | cell theory
- Prokaryotic and Eukaryotic Cells | Prokaryotes lack a nucleus; eukaryotes have membrane-bound organelles. | Prokaryotes; Eukaryotes; Endosymbiotic theory | prokaryotic vs eukaryotic cells
- Cell Organelles | Each organelle has a job, from the nucleus to the mitochondria. | Nucleus and ribosomes; ER and Golgi; Mitochondria and chloroplasts | cell organelles; parts of a cell
- Plant and Animal Cells | Plant cells add a cell wall, chloroplasts, and a large central vacuole. | Cell wall; Chloroplasts; Comparing cells | plant vs animal cells
- The Cell Membrane | The phospholipid bilayer is selectively permeable (the fluid mosaic model). | Phospholipid bilayer; Membrane proteins; Fluid mosaic model | cell membrane structure; fluid mosaic model
- Passive Transport | Diffusion and osmosis move substances down their concentration gradients. | Diffusion; Osmosis; Facilitated diffusion | passive transport; diffusion and osmosis
- Tonicity and Osmosis | Hypertonic, hypotonic, and isotonic solutions shrink, swell, or keep cells the same. | Hypertonic; Hypotonic; Isotonic | hypertonic hypotonic isotonic; tonicity
- Active Transport | Pumps, endocytosis, and exocytosis move materials against gradients using energy. | Sodium-potassium pump; Endocytosis; Exocytosis | active transport; endocytosis and exocytosis
- Cell Size and Specialization | Surface area to volume ratio limits cell size; multicellular organisms specialize. | Surface area to volume; Cell specialization; Tissues and organs | surface area to volume ratio; cell specialization
+ Cell Communication and Signaling | Cells signal with molecules that bind receptors and trigger responses inside the cell. | Signal molecules and receptors; Signal transduction; Cellular responses | cell signaling; signal transduction

# Cellular Energy | How cells capture and release energy.
- ATP and Energy in Cells | ATP stores and releases energy by gaining and losing a phosphate. | ATP structure; ATP-ADP cycle; Energy for cell work | atp; atp and adp cycle
- Photosynthesis | Plants use light energy to turn carbon dioxide and water into glucose and oxygen. | The overall equation; Chloroplasts and pigments; Factors affecting photosynthesis | photosynthesis
- Cellular Respiration | Cells break down glucose with oxygen to make ATP. | The overall equation; Glycolysis, Krebs cycle, electron transport; Mitochondria | cellular respiration
- Fermentation | Without oxygen, cells use fermentation to keep glycolysis running. | Lactic acid fermentation; Alcoholic fermentation; Aerobic vs. anaerobic | fermentation; anaerobic respiration
- Comparing Photosynthesis and Respiration | The two processes are opposites that cycle carbon and energy. | Reactants and products; Carbon cycle link; Energy flow | photosynthesis vs cellular respiration
+ The Light Reactions and the Calvin Cycle | Light reactions make ATP and NADPH; the Calvin cycle uses them to fix carbon. | Photosystems; Electron transport and ATP synthase; Carbon fixation | light dependent reactions; calvin cycle
+ The Krebs Cycle and Electron Transport Chain | The Krebs cycle harvests electrons; the electron transport chain uses them to make most ATP. | Krebs cycle; Electron transport chain; Chemiosmosis | krebs cycle; electron transport chain

# Cell Growth and Division | The cell cycle, mitosis, and what happens when control fails.
- The Cell Cycle | Cells grow, copy their DNA, and divide in interphase and the mitotic phase. | Interphase; G1, S, G2; Why cells divide | cell cycle
- Mitosis and Cytokinesis | Mitosis separates copied chromosomes into two identical nuclei. | Prophase, metaphase, anaphase, telophase; Cytokinesis; Chromosome structure | mitosis; stages of mitosis
- Regulating the Cell Cycle and Cancer | Checkpoints control division; cancer is uncontrolled cell growth. | Checkpoints and cyclins; Tumors; Causes of cancer | cell cycle regulation; cancer cells
- Stem Cells and Differentiation | Stem cells can become specialized cells by turning on different genes. | Embryonic and adult stem cells; Differentiation; Uses and ethics | stem cells; cell differentiation

# Genetics | Meiosis, Mendel, and patterns of inheritance.
- Meiosis | Meiosis makes four genetically different haploid gametes. | Meiosis I and II; Crossing over; Mitosis vs. meiosis | meiosis; mitosis vs meiosis
- Mendel and Heredity | Mendel's pea experiments revealed dominant and recessive alleles. | Alleles; Law of segregation; Law of independent assortment | mendelian genetics; gregor mendel
- Punnett Squares | Punnett squares predict offspring genotypes and phenotypes. | Genotype and phenotype; Monohybrid crosses; Dihybrid crosses | punnett squares; monohybrid cross; dihybrid cross
- Non-Mendelian Inheritance | Incomplete dominance, codominance, multiple alleles, and polygenic traits. | Incomplete dominance; Codominance and blood types; Polygenic traits | incomplete dominance; codominance; non mendelian genetics
- Sex-Linked Traits | Genes on the X chromosome show up more often in males. | X-linked inheritance; Carriers; Examples like color blindness | sex linked traits
- Pedigrees and Human Genetic Disorders | Pedigrees trace traits through families; nondisjunction causes chromosome disorders. | Reading pedigrees; Genetic disorders; Karyotypes and nondisjunction | pedigrees; genetic disorders; karyotype

# DNA and Protein Synthesis | How DNA stores, copies, and expresses information.
- DNA Structure | DNA is a double helix of nucleotides with complementary base pairs. | Nucleotides; Base pairing; Discovery of DNA | dna structure
- DNA Replication | DNA copies itself semiconservatively with helicase and DNA polymerase. | Semiconservative replication; Enzymes; Leading and lagging strands | dna replication
- RNA and Transcription | Transcription copies a gene into messenger RNA. | Types of RNA; RNA polymerase; RNA processing | transcription; rna
- Translation and the Genetic Code | Ribosomes read mRNA codons to build a chain of amino acids. | Codons and anticodons; Reading the codon chart; tRNA and ribosomes | translation; protein synthesis; genetic code
- Mutations | Changes in DNA can be silent, change one amino acid, or shift the whole reading frame. | Point mutations; Frameshift mutations; Chromosomal mutations | mutations; gene mutations
+ Gene Regulation | Cells control which genes are expressed: operons in bacteria, transcription factors in eukaryotes. | The lac operon; Transcription factors; Epigenetics | gene regulation; lac operon; gene expression

# Biotechnology | Reading and editing DNA.
- Genetic Engineering | Recombinant DNA puts genes from one organism into another. | Restriction enzymes; Plasmids; Transgenic organisms | genetic engineering; recombinant dna
- DNA Technology Tools | PCR copies DNA; gel electrophoresis sorts it by size. | PCR; Gel electrophoresis; DNA fingerprinting | pcr; gel electrophoresis; dna fingerprinting
- CRISPR and Gene Editing | CRISPR-Cas9 edits specific genes, raising medical promise and ethical questions. | How CRISPR works; Gene therapy; Bioethics | crispr; gene editing

# Evolution | Natural selection and the evidence for common ancestry.
- Darwin and Natural Selection | Variation, inheritance, overproduction, and selection drive evolution. | Darwin's observations; Natural selection; Adaptation and fitness | natural selection; darwin
- Evidence for Evolution | Fossils, anatomy, embryology, and DNA all point to common ancestry. | Fossil record; Homologous and vestigial structures; Molecular evidence | evidence for evolution; homologous structures
- Evolution of Populations | Mutation, gene flow, genetic drift, and selection change allele frequencies. | Gene pools; Genetic drift; Gene flow | population genetics; genetic drift
- Types of Natural Selection | Directional, stabilizing, and disruptive selection, plus sexual selection. | Directional selection; Stabilizing selection; Disruptive selection | types of natural selection
- Speciation | Reproductive isolation splits one species into two. | Reproductive isolation; Allopatric and sympatric speciation; Rates of evolution | speciation
- The History of Life | Earth's history from the first cells to mass extinctions. | Origin of life; Geologic time scale; Mass extinctions | history of life on earth
+ Hardy-Weinberg Equilibrium | p² + 2pq + q² = 1 predicts genotype frequencies in a population that isn't evolving. | Five conditions; Calculating allele frequencies; Detecting evolution | hardy weinberg equilibrium

# Classification and Diversity | Organizing life and the major groups of organisms.
- Taxonomy and Classification | Binomial nomenclature and the levels from domain to species. | Linnaean classification; Binomial nomenclature; Dichotomous keys | taxonomy; classification of living things; dichotomous key
- Cladograms and Phylogenetic Trees | Cladograms group organisms by shared derived traits. | Reading cladograms; Shared derived characters; Three domains | cladograms; phylogenetic trees
- Viruses and Bacteria | Bacteria are living prokaryotes; viruses need a host cell to reproduce. | Viral structure; Lytic and lysogenic cycles; Bacteria and antibiotics | viruses and bacteria; lytic and lysogenic cycle
- Protists and Fungi | Protists are the diverse eukaryotes; fungi are decomposers. | Protist groups; Fungi structure; Ecological roles | protists; fungi
- Plants | Plants evolved from mosses and ferns to seed plants and flowers. | Plant groups; Plant tissues; Plant reproduction | plant diversity; plant structure
- Animals | Animal groups and the body plans that define them. | Invertebrates; Vertebrates; Body symmetry | animal diversity; invertebrates and vertebrates

# Ecology | How organisms interact with each other and their environment.
- Ecosystems and Biomes | Levels of ecological organization and Earth's major biomes. | Biotic and abiotic factors; Levels of organization; Biomes | ecosystems; biomes
- Energy Flow in Ecosystems | Energy moves through food chains and webs; only about 10% passes each level. | Producers and consumers; Food webs; Ten percent rule | energy flow in ecosystems; food webs; energy pyramid
- Biogeochemical Cycles | Water, carbon, nitrogen, and phosphorus cycle through living and nonliving things. | Carbon cycle; Nitrogen cycle; Water cycle | biogeochemical cycles; carbon cycle; nitrogen cycle
- Population Growth | Populations grow exponentially until limits make growth logistic. | Exponential and logistic growth; Carrying capacity; Limiting factors | population growth; carrying capacity
- Community Interactions | Competition, predation, and symbiosis shape communities. | Niches; Predation; Mutualism, commensalism, parasitism | symbiosis; community interactions
- Ecological Succession | Communities change over time after a disturbance. | Primary succession; Secondary succession; Pioneer species | ecological succession
- Biodiversity and Human Impact | Habitat loss, invasive species, and pollution threaten biodiversity. | Biodiversity; Threats; Conservation | biodiversity; human impact on the environment

# The Human Body | Body systems working together to maintain homeostasis.
- Homeostasis and Feedback | Negative feedback keeps internal conditions steady. | Negative feedback; Positive feedback; Body temperature and blood sugar | homeostasis; negative feedback
- Digestive and Excretory Systems | Breaking down food and removing wastes. | Digestion; Nutrient absorption; Kidneys | digestive system; excretory system
- Circulatory and Respiratory Systems | The heart and lungs deliver oxygen and remove carbon dioxide. | Heart and blood vessels; Gas exchange; Blood | circulatory system; respiratory system
- Nervous and Endocrine Systems | Nerves send fast signals; hormones send slower ones. | Neurons; Brain and spinal cord; Hormones | nervous system; endocrine system
- The Immune System | The body defends itself with barriers, white blood cells, and antibodies. | Innate immunity; B cells and T cells; Vaccines | immune system
`,
);
