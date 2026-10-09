import { hsCourse } from "./outline";

/**
 * Anatomy & Physiology, following the body-systems sequence used by high school A&P courses and
 * textbooks (Marieb's Essentials, OpenStax Anatomy and Physiology): organization and
 * homeostasis, cells and tissues, then each organ system.
 */
export const anatomyPhysiology = hsCourse(
  {
    slug: "anatomy-and-physiology",
    title: "Anatomy & Physiology",
    shortTitle: "A&P",
    category: "Sciences",
    hue: 350,
    grades: "Grade 11 or 12",
    description: "The structure and function of the human body, system by system, from cells and tissues to the heart, brain, and immune system.",
    keywords: ["anatomy and physiology", "anatomy & physiology", "anatomy", "physiology", "a&p", "human anatomy"],
  },
  `
# Introduction to the Human Body | The body's organization and the language used to describe it.
- Levels of Organization | The body is organized from chemicals to cells, tissues, organs, and organ systems. | Six levels; Organ systems overview; Structure and function | levels of organization human body
- Anatomical Terminology | Directional terms, body planes, and regions locate structures precisely. | Anatomical position; Directional terms; Body planes and sections | anatomical terminology; directional terms; body planes
- Body Cavities and Membranes | The dorsal and ventral cavities hold organs, lined by serous membranes. | Dorsal and ventral cavities; Abdominal regions and quadrants; Serous membranes | body cavities
- Homeostasis and Feedback Loops | Negative and positive feedback keep the internal environment stable. | Receptor, control center, effector; Negative feedback; Positive feedback | homeostasis; feedback loops

# Cells and Tissues | The building blocks of the body.
- Cell Structure and Function | Organelles carry out the work of the cell. | Plasma membrane; Organelles; Membrane transport | cell structure anatomy
- Protein Synthesis and Cell Division | Cells make proteins from DNA and divide by mitosis. | Transcription and translation; Mitosis; Cell differentiation | protein synthesis; mitosis anatomy
- Epithelial Tissue | Epithelium covers surfaces and lines cavities; it's classified by layers and cell shape. | Simple and stratified; Cell shapes; Glands | epithelial tissue
- Connective Tissue | Connective tissue supports and binds: bone, cartilage, blood, fat, and more. | Loose and dense connective tissue; Cartilage and bone; Blood | connective tissue
- Muscle and Nervous Tissue | Muscle tissue contracts; nervous tissue sends signals. | Skeletal, cardiac, smooth muscle; Neurons and glia; Tissue repair | muscle tissue; nervous tissue

# The Integumentary System | Skin, hair, and nails.
- Layers of the Skin | The epidermis protects; the dermis holds blood vessels, nerves, and glands. | Epidermis layers; Dermis; Hypodermis | layers of the skin; integumentary system
- Skin Accessory Structures | Hair, nails, and sweat and oil glands. | Hair follicles; Sweat and sebaceous glands; Nails | accessory structures of the skin
- Skin Functions and Disorders | Skin protects, regulates temperature, and senses; burns and cancer damage it. | Temperature regulation; Burns; Skin cancer | skin disorders; burns classification

# The Skeletal System | Bones, joints, and how they grow.
- Bone Structure and Function | Bones support, protect, store minerals, and make blood cells. | Compact and spongy bone; Long bone anatomy; Bone cells | bone structure; functions of the skeletal system
- Bone Growth and Remodeling | Bones grow at growth plates and remodel throughout life. | Ossification; Growth plates; Bone remodeling and repair | bone growth; ossification
- The Axial Skeleton | The skull, vertebral column, and rib cage. | Skull bones; Vertebrae; Ribs and sternum | axial skeleton; bones of the skull
- The Appendicular Skeleton | The limbs and the girdles that attach them. | Pectoral girdle and arm; Pelvic girdle and leg; Hands and feet | appendicular skeleton
- Joints | Joints are classified by structure and by how much they move. | Fibrous, cartilaginous, synovial; Types of synovial joints; Joint movements | joints; synovial joints

# The Muscular System | How muscles contract and move the body.
- Muscle Types and Functions | Skeletal, cardiac, and smooth muscle differ in structure and control. | Three muscle types; Functions; Properties of muscle | types of muscle tissue
- Skeletal Muscle Structure | Muscles are bundles of fibers made of sarcomeres. | Fascicles and fibers; Myofibrils; Sarcomeres | skeletal muscle structure; sarcomere
- Muscle Contraction | The sliding filament model: actin and myosin pull together using ATP and calcium. | Neuromuscular junction; Sliding filament theory; Role of calcium and ATP | muscle contraction; sliding filament theory
- Major Skeletal Muscles and Movement | Muscles work in groups to produce movements. | Origin and insertion; Prime movers and antagonists; Major muscles | major muscles of the body; muscle movements

# The Nervous System | How the body senses, thinks, and controls itself.
- Organization of the Nervous System | The central and peripheral nervous systems, and somatic and autonomic divisions. | CNS and PNS; Sensory and motor; Sympathetic and parasympathetic | divisions of the nervous system
- Neurons and Action Potentials | Neurons fire action potentials that travel down the axon. | Neuron structure; Resting and action potentials; Myelin | action potential; neuron structure
- Synapses and Neurotransmitters | Neurotransmitters carry signals across synapses. | Synaptic transmission; Neurotransmitters; Drugs and synapses | synapse; neurotransmitters
- The Brain | The cerebrum, cerebellum, and brainstem each control different functions. | Lobes of the cerebrum; Cerebellum and brainstem; Protection of the brain | parts of the brain; brain anatomy
- The Spinal Cord and Reflexes | The spinal cord relays signals and handles reflexes. | Spinal cord anatomy; Spinal nerves; Reflex arcs | spinal cord; reflex arc
- The Special Senses | The eye, ear, nose, and tongue turn stimuli into nerve signals. | Vision; Hearing and balance; Taste and smell | special senses; eye anatomy; ear anatomy

# The Endocrine System | Hormones and the glands that make them.
- Hormones and How They Work | Hormones travel in the blood and act on target cells with receptors. | Steroid and protein hormones; Target cells; Feedback control | hormones; endocrine system
- Major Endocrine Glands | The hypothalamus, pituitary, thyroid, adrenal glands, and pancreas. | Hypothalamus and pituitary; Thyroid and adrenal glands; Pancreas | endocrine glands; pituitary gland
- Endocrine Disorders | Diabetes, thyroid disorders, and other hormone imbalances. | Diabetes; Hypo- and hyperthyroidism; Growth disorders | diabetes; endocrine disorders

# The Cardiovascular System | Blood, the heart, and blood vessels.
- Blood | Blood is plasma plus red cells, white cells, and platelets. | Components of blood; Blood clotting; Blood types | blood components; blood types
- Anatomy of the Heart | The heart has four chambers and four valves. | Chambers and valves; Blood flow through the heart; Coronary circulation | heart anatomy; blood flow through the heart
- The Cardiac Cycle and Conduction | The heart's electrical system times each heartbeat. | SA and AV nodes; ECG; Cardiac output | cardiac cycle; electrical conduction of the heart
- Blood Vessels and Blood Pressure | Arteries, veins, and capillaries; blood pressure and its control. | Arteries, veins, capillaries; Blood pressure; Pulmonary and systemic circuits | blood vessels; blood pressure

# The Lymphatic and Immune Systems | Defending the body.
- The Lymphatic System | Lymph vessels return fluid to the blood; lymph nodes filter it. | Lymph and lymph vessels; Lymph nodes; Spleen and thymus | lymphatic system
- Innate Immunity | Barriers, inflammation, and phagocytes are the first line of defense. | Physical barriers; Inflammation; Phagocytes and fever | innate immunity; inflammation
- Adaptive Immunity | B cells make antibodies; T cells kill infected cells and coordinate the response. | Antigens and antibodies; B cells and T cells; Memory and vaccines | adaptive immunity; b cells and t cells

# The Respiratory System | Breathing and gas exchange.
- Respiratory Anatomy | Air passes through the nose, pharynx, larynx, trachea, and bronchi to the alveoli. | Upper respiratory tract; Lower respiratory tract; Alveoli | respiratory system anatomy
- Breathing and Gas Exchange | The diaphragm drives breathing; oxygen and carbon dioxide diffuse in the alveoli. | Mechanics of breathing; Lung volumes; Gas exchange | mechanics of breathing; gas exchange
- Control of Breathing and Disorders | The brainstem controls breathing; asthma and COPD disrupt it. | Respiratory centers; Asthma; COPD | respiratory disorders

# The Digestive System | Breaking down food and absorbing nutrients.
- Digestive Anatomy | The alimentary canal runs from mouth to anus, helped by accessory organs. | Mouth, esophagus, stomach; Small and large intestines; Liver, gallbladder, pancreas | digestive system anatomy
- Digestion and Absorption | Enzymes break food down; the small intestine absorbs nutrients. | Mechanical and chemical digestion; Digestive enzymes; Absorption | chemical digestion; digestive enzymes
- Nutrition and Metabolism | Nutrients fuel the body's metabolism. | Macronutrients; Vitamins and minerals; Metabolic rate | nutrition and metabolism

# The Urinary System | Filtering blood and balancing fluids.
- Kidney Anatomy and the Nephron | Nephrons are the kidneys' filtering units. | Kidney structure; Parts of the nephron; Urinary tract | kidney anatomy; nephron
- Urine Formation | Filtration, reabsorption, and secretion turn blood plasma into urine. | Filtration; Reabsorption; Secretion | urine formation
- Fluid, Electrolyte, and Acid-Base Balance | Kidneys and hormones keep water, salts, and pH balanced. | ADH and aldosterone; Electrolytes; Acid-base balance | fluid and electrolyte balance

# The Reproductive System | Reproduction and development.
- Male Reproductive System | Testes produce sperm and testosterone. | Anatomy; Spermatogenesis; Hormones | male reproductive system
- Female Reproductive System | Ovaries produce eggs and hormones that drive the menstrual cycle. | Anatomy; Oogenesis; The menstrual cycle | female reproductive system; menstrual cycle
- Pregnancy and Development | From fertilization through embryonic and fetal development to birth. | Fertilization; Embryonic development; Labor and birth | pregnancy and fetal development
`,
);
