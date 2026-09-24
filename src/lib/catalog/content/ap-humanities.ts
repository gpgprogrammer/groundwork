import { course, t, u, type CourseSpec } from "./spec";

export const lang = course(
  {
    slug: "ap-english-language",
    title: "AP English Language and Composition",
    shortTitle: "AP Lang",
    category: "English",
    hue: 10,
    description: "Rhetoric and argument: analyzing how writers persuade, and writing synthesis, rhetorical analysis, and argument essays.",
    query: "AP Lang",
    keywords: ["ap lang", "ap language", "ap english language", "ap english lang"],
  },
  [
    u("The Rhetorical Situation", "Speaker, audience, purpose, and context.", [
      t("The Rhetorical Situation", "Every text has a speaker, audience, purpose, context, and message; analysis starts there.", ["SPACECAT", "rhetorical situation"]),
      t("Rhetorical Choices and Appeals", "Writers choose evidence, diction, and appeals to ethos, pathos, and logos to reach their audience.", ["ethos pathos logos", "rhetorical appeals"]),
    ]),
    u("Claims, Reasoning, and Evidence", "Building an argument.", [
      t("Writing a Defensible Thesis", "A strong thesis makes a claim someone could disagree with and previews your line of reasoning.", ["thesis statement", "ap lang thesis"]),
      t("Commentary and Line of Reasoning", "Commentary explains how evidence supports your claim; it's where most of the points are.", ["commentary", "line of reasoning"]),
    ]),
    u("Style and Organization", "How structure and style serve purpose.", [
      t("Syntax and Diction", "Sentence structure and word choice create tone and emphasis.", ["syntax", "diction", "tone"]),
      t("Organization and Transitions", "Arrangement and transitions guide readers through an argument.", ["organization"]),
    ]),
    u("The Free-Response Essays", "Synthesis, rhetorical analysis, and argument.", [
      t("The Synthesis Essay", "Use at least three sources to support your own argument, not to summarize them.", ["synthesis essay", "ap lang synthesis"]),
      t("The Rhetorical Analysis Essay", "Explain how the writer's choices achieve their purpose, not just what the choices are.", ["rhetorical analysis essay", "ap lang rhetorical analysis"]),
      t("The Argument Essay", "Defend a position with specific evidence and commentary drawn from your own knowledge.", ["argument essay", "ap lang argument"]),
      t("Multiple Choice Strategies", "Reading and writing questions reward careful attention to purpose and function.", ["ap lang multiple choice"]),
    ]),
  ],
);

export const lit = course(
  {
    slug: "ap-english-literature",
    title: "AP English Literature and Composition",
    shortTitle: "AP Lit",
    category: "English",
    hue: 355,
    description: "Close reading of fiction, poetry, and drama, and the literary argument essays built on it.",
    query: "AP Lit",
    keywords: ["ap lit", "ap literature", "ap english literature", "ap english lit"],
  },
  [
    u("Short Fiction", "Character, setting, plot, and narration.", [
      t("Character and Characterization", "Characters reveal values and tensions through what they say, do, and want.", ["characterization"]),
      t("Setting, Structure, and Narration", "Point of view, setting, and plot structure shape how readers understand a story.", ["point of view", "narrator", "plot structure"]),
    ]),
    u("Poetry", "Word choice, imagery, form, and figurative language.", [
      t("Figurative Language and Imagery", "Metaphor, simile, and imagery create meaning beyond the literal.", ["figurative language", "metaphor", "imagery"]),
      t("Poetic Form and Structure", "Sonnets, meter, line breaks, and shifts contribute to a poem's meaning.", ["poetry analysis", "sonnet", "meter", "tone shift"]),
    ]),
    u("Longer Fiction and Drama", "Novels and plays.", [
      t("Theme and Complexity", "Strong readings trace how a work develops ideas and complexity, not just a one-word theme.", ["theme", "literary argument"]),
      t("Drama", "Dialogue, conflict, and staging reveal character in plays.", ["drama analysis", "shakespeare"]),
    ]),
    u("The Free-Response Essays", "Poetry, prose, and literary argument.", [
      t("The Poetry Analysis Essay", "Argue how the poem's choices build its meaning, with specific textual evidence.", ["poetry essay", "ap lit q1"]),
      t("The Prose Fiction Analysis Essay", "Analyze how a passage's literary elements convey complexity.", ["prose essay", "ap lit q2"]),
      t("The Literary Argument Essay", "Choose a work you know well and argue how it addresses the prompt's idea.", ["open question", "literary argument essay", "ap lit q3"]),
    ]),
  ],
);

type Lang = { slug: string; name: string; hue: number; keywords: string[]; extra?: string };

const languageCourse = ({ slug, name, hue, keywords, extra }: Lang): CourseSpec =>
  course(
    {
      slug,
      title: `AP ${name} Language and Culture`,
      shortTitle: `AP ${name}`,
      category: "World Languages & Cultures",
      hue,
      description: `Interpersonal, interpretive, and presentational communication in ${name}, organized around six cultural themes.${extra ? ` ${extra}` : ""}`,
      query: `AP ${name} Language`,
      keywords,
    },
    [
      u("Families and Communities", "Relationships, customs, and citizenship.", [
        t(`Families and Communities in ${name}`, "Vocabulary and conversations about family structures, friendships, and community life.", []),
      ]),
      u("Personal and Public Identities", "Identity, heritage, and belonging.", [
        t(`Personal and Public Identities in ${name}`, "Talk about identity, nationalism, language, and beliefs.", []),
      ]),
      u("Beauty and Aesthetics", "Arts, architecture, and ideals of beauty.", [
        t(`Beauty and Aesthetics in ${name}`, "Discuss literature, visual arts, music, and how cultures define beauty.", []),
      ]),
      u("Science and Technology", "Innovation, health, and ethics.", [
        t(`Science and Technology in ${name}`, "Discuss technology's effects on daily life, health, and the environment.", []),
      ]),
      u("Contemporary Life", "Education, work, leisure, and travel.", [
        t(`Contemporary Life in ${name}`, "Everyday topics like school, careers, holidays, and travel.", []),
      ]),
      u("Global Challenges", "Environment, economics, and social issues.", [
        t(`Global Challenges in ${name}`, "Discuss the environment, human rights, and social problems.", []),
      ]),
      u("Exam Tasks", "Free-response strategies.", [
        t(`${name} Email Reply`, "Answer every question in the email, in formal register, with an elaboration for each.", [`ap ${name.toLowerCase()} email reply`]),
        t(`${name} Argumentative Essay`, "Use all three sources to support a clear position, citing them in your own words.", [`ap ${name.toLowerCase()} persuasive essay`, "argumentative essay"]),
        t(`${name} Conversation and Cultural Comparison`, "Respond naturally to prompts and compare a cultural product or practice with your own community.", [`ap ${name.toLowerCase()} cultural comparison`, "speaking"]),
      ]),
    ],
  );

export const spanish = languageCourse({ slug: "ap-spanish-language", name: "Spanish", hue: 40, keywords: ["ap spanish language", "ap spanish lang", "ap spanish"] });
export const french = languageCourse({ slug: "ap-french-language", name: "French", hue: 230, keywords: ["ap french"] });
export const german = languageCourse({ slug: "ap-german-language", name: "German", hue: 50, keywords: ["ap german"] });
export const italian = languageCourse({ slug: "ap-italian-language", name: "Italian", hue: 140, keywords: ["ap italian"] });
export const chinese = languageCourse({ slug: "ap-chinese-language", name: "Chinese", hue: 5, keywords: ["ap chinese", "ap mandarin"] });
export const japanese = languageCourse({ slug: "ap-japanese-language", name: "Japanese", hue: 350, keywords: ["ap japanese"] });

export const spanishLit = course(
  {
    slug: "ap-spanish-literature",
    title: "AP Spanish Literature and Culture",
    shortTitle: "AP Spanish Lit",
    category: "World Languages & Cultures",
    hue: 30,
    description: "Literary works from Spain, Latin America, and US Hispanic authors, read and analyzed in Spanish.",
    query: "AP Spanish Literature",
    keywords: ["ap spanish lit", "ap spanish literature"],
  },
  [
    u("La época medieval y el Siglo de Oro", "Medieval and Golden Age literature.", [
      t("Medieval Spanish Literature", "Works like Poema de Mio Cid and Don Juan Manuel's tales founded Spanish literature.", ["poema de mio cid", "el conde lucanor"]),
      t("The Golden Age", "Lazarillo de Tormes, Cervantes, and Calderón defined the Siglo de Oro.", ["lazarillo de tormes", "don quijote", "siglo de oro"]),
    ]),
    u("Romanticismo, realismo y modernismo", "Nineteenth-century movements.", [
      t("Romanticism and Realism", "Romantic poets and realist writers responded to a changing society.", ["romanticismo", "realismo", "becquer"]),
      t("Modernismo", "Rubén Darío and José Martí renewed poetry in the Spanish-speaking world.", ["modernismo", "ruben dario", "jose marti"]),
    ]),
    u("Literatura del siglo XX y contemporánea", "Twentieth-century and contemporary works.", [
      t("The Generation of '98 and '27", "Unamuno, García Lorca, and others reflected Spain's crises in literature.", ["garcia lorca", "unamuno", "generacion del 98"]),
      t("Latin American Boom and Magical Realism", "Borges, García Márquez, and Cortázar brought Latin American literature to the world.", ["realismo magico", "borges", "garcia marquez", "cortazar"]),
    ]),
    u("Exam Skills", "Analysis and comparison essays.", [
      t("Text Analysis and Comparison Essays", "Analyze how a text's literary features develop its themes, and compare two texts.", ["ap spanish lit essay", "analisis de texto"]),
    ]),
  ],
);

export const latin = course(
  {
    slug: "ap-latin",
    title: "AP Latin",
    shortTitle: "AP Latin",
    category: "World Languages & Cultures",
    hue: 25,
    description: "Reading, translating, and analyzing Vergil's Aeneid and Caesar's Gallic War in Latin.",
    keywords: ["ap latin", "latin"],
  },
  [
    u("Vergil's Aeneid", "Books 1, 2, 4, and 6 in Latin.", [
      t("Aeneid Book 1", "Juno's anger, the storm, and Aeneas's arrival at Carthage.", ["aeneid book 1"]),
      t("Aeneid Book 2", "The fall of Troy, told by Aeneas.", ["aeneid book 2", "fall of troy"]),
      t("Aeneid Book 4", "The tragedy of Dido and Aeneas.", ["aeneid book 4", "dido"]),
      t("Aeneid Book 6", "Aeneas's journey to the underworld.", ["aeneid book 6", "underworld"]),
    ]),
    u("Caesar's Gallic War", "Selections on the Gauls, the Britons, and conflict.", [
      t("De Bello Gallico: The Gauls and the Germans", "Caesar's ethnography and account of his campaigns.", ["de bello gallico", "caesar gallic war"]),
    ]),
    u("Translation and Poetic Devices", "Skills tested on the exam.", [
      t("Latin Translation Strategies", "Parse each verb and noun ending to translate literally and accurately.", ["latin translation", "latin grammar"]),
      t("Dactylic Hexameter and Poetic Devices", "Scansion and devices like chiasmus and synchysis are fair game on the exam.", ["scansion", "dactylic hexameter", "latin poetic devices"]),
    ]),
  ],
);

export const artHistory = course(
  {
    slug: "ap-art-history",
    title: "AP Art History",
    shortTitle: "AP Art History",
    category: "Arts",
    hue: 320,
    description: "250 required works of art and architecture across ten content areas, from prehistory to the present.",
    keywords: ["ap art history", "art history", "apah"],
  },
  [
    u("Global Prehistory and the Ancient Mediterranean", "Early art through the Roman world.", [
      t("Global Prehistory", "Cave paintings, Stonehenge, and early sculpture show humanity's first art.", ["prehistoric art", "lascaux"]),
      t("Ancient Near East and Egypt", "Art served kings and gods, from the Standard of Ur to the pyramids.", ["egyptian art", "ancient near east"]),
      t("Greek, Etruscan, and Roman Art", "Classical ideals of proportion and naturalism shaped Western art.", ["greek art", "roman art", "parthenon"]),
    ]),
    u("Early Europe and Colonial Americas", "Medieval through Baroque.", [
      t("Medieval Art", "Byzantine mosaics, Romanesque churches, and Gothic cathedrals expressed faith.", ["gothic cathedrals", "byzantine art"]),
      t("Renaissance and Baroque Art", "Linear perspective, humanism, and drama transformed European painting and sculpture.", ["renaissance art", "baroque art", "michelangelo"]),
    ]),
    u("Later Europe and Americas", "1750 to 1980.", [
      t("18th- and 19th-Century Art", "Neoclassicism, Romanticism, Realism, and Impressionism answered revolution and industry.", ["impressionism", "neoclassicism", "romanticism art"]),
      t("Modern Art", "Cubism, abstraction, and Surrealism broke with tradition.", ["modern art", "cubism", "picasso"]),
    ]),
    u("Indigenous Americas, Africa, West and Central Asia", "Art beyond Europe.", [
      t("Indigenous Americas", "Mesoamerican, Andean, and North American works carried religious and political meaning.", ["mesoamerican art", "aztec art", "inca"]),
      t("Africa", "African art is often made to be used in ritual and performance.", ["african art", "masks"]),
      t("West and Central Asia", "Islamic art and architecture emphasize pattern, calligraphy, and sacred space.", ["islamic art", "dome of the rock"]),
    ]),
    u("South, East, and Southeast Asia, the Pacific, and Global Contemporary", "Asia, the Pacific, and art since 1980.", [
      t("South, East, and Southeast Asia", "Buddhist, Hindu, and Confucian traditions shaped Asian art and architecture.", ["asian art", "buddhist art", "hindu art"]),
      t("The Pacific", "Pacific art is tied to navigation, genealogy, and ceremony.", ["pacific art", "oceania"]),
      t("Global Contemporary Art", "Artists since 1980 address identity, globalization, and technology.", ["contemporary art"]),
    ]),
  ],
);

export const musicTheory = course(
  {
    slug: "ap-music-theory",
    title: "AP Music Theory",
    shortTitle: "Music Theory",
    category: "Arts",
    hue: 280,
    description: "Pitch, rhythm, harmony, voice leading, and form, plus ear training and sight-singing.",
    keywords: ["ap music theory", "music theory"],
  },
  [
    u("Music Fundamentals", "Pitch, rhythm, scales, and intervals.", [
      t("Pitch, Clefs, and Rhythm", "Read pitches in treble, bass, and C clefs, and count simple and compound meters.", ["reading music", "time signatures", "clefs"]),
      t("Scales and Key Signatures", "Major and minor scales follow fixed patterns of whole and half steps.", ["major scale", "minor scale", "key signatures", "circle of fifths"]),
      t("Intervals and Triads", "Intervals measure distance between notes, and triads stack thirds.", ["intervals", "triads", "seventh chords"]),
    ]),
    u("Harmony and Voice Leading", "Chord progressions and part writing.", [
      t("Roman Numeral Analysis", "Roman numerals label chords by their function in a key.", ["roman numeral analysis", "chord progressions"]),
      t("Four-Part Voice Leading", "SATB part writing avoids parallel fifths and octaves and resolves tendency tones.", ["voice leading", "part writing", "parallel fifths"]),
      t("Cadences and Nonchord Tones", "Authentic, half, plagal, and deceptive cadences end phrases; passing and neighbor tones decorate them.", ["cadences", "nonchord tones"]),
      t("Secondary Dominants and Modulation", "Secondary dominants tonicize other chords, and modulation moves to a new key.", ["secondary dominant", "modulation"]),
    ]),
    u("Aural Skills", "Ear training and sight-singing.", [
      t("Melodic and Harmonic Dictation", "Write down melodies and bass lines by hearing scale degrees and chord functions.", ["dictation", "ear training"]),
      t("Sight-Singing", "Sing a melody at sight using solfège or scale-degree numbers.", ["sight singing", "solfege"]),
    ]),
  ],
);

const artDesign = (slug: string, title: string, shortTitle: string, hue: number, medium: string): CourseSpec =>
  course(
    { slug, title, shortTitle, category: "Arts", hue, description: `A portfolio course: build a Sustained Investigation and a Selected Works section in ${medium}.`, keywords: [title.toLowerCase(), shortTitle.toLowerCase()] },
    [
      u("Portfolio Requirements", "How the portfolio is scored.", [
        t(`${shortTitle} Sustained Investigation`, "Develop one inquiry-guided body of work through practice, experimentation, and revision.", ["sustained investigation"]),
        t(`${shortTitle} Selected Works`, "Choose five works that best show your skill with materials, processes, and ideas.", ["selected works"]),
        t("Writing Portfolio Statements", "Concise written evidence explains your inquiry and how your work grew from it.", ["ap art statements"]),
      ]),
      u("Skills and Techniques", `Materials and design in ${medium}.`, [
        t(`${shortTitle} Elements and Principles of Design`, "Line, shape, color, value, balance, contrast, and emphasis organize a composition.", ["elements of art", "principles of design"]),
        t(`${shortTitle} Techniques`, `Practical techniques and processes for ${medium}.`, []),
      ]),
    ],
  );

export const art2d = artDesign("ap-2d-art-and-design", "AP 2-D Art and Design", "AP 2-D Art", 330, "graphic design, photography, painting, and other 2-D media");
export const art3d = artDesign("ap-3d-art-and-design", "AP 3-D Art and Design", "AP 3-D Art", 20, "sculpture, ceramics, and other 3-D media");
export const drawing = artDesign("ap-drawing", "AP Drawing", "AP Drawing", 0, "drawing, painting, and mark-making");

export const seminar = course(
  {
    slug: "ap-seminar",
    title: "AP Seminar",
    shortTitle: "AP Seminar",
    category: "AP Capstone",
    hue: 180,
    description: "The first AP Capstone course: investigate real-world issues from multiple perspectives through team projects, essays, and presentations.",
    keywords: ["ap seminar", "ap capstone"],
  },
  [
    u("The QUEST Framework", "Question, understand, evaluate, synthesize, and team, transform, and transmit.", [
      t("Question and Explore", "Start with a problem worth investigating and gather sources from several lenses.", ["quest framework", "lenses"]),
      t("Evaluating Sources and Arguments", "Judge credibility, relevance, and reasoning before using a source.", ["source evaluation", "credibility"]),
      t("Synthesizing Ideas", "Combine perspectives into your own argument and solution.", ["synthesis"]),
    ]),
    u("Performance Tasks and Exam", "The TMP, IWA, and end-of-course exam.", [
      t("Team Multimedia Presentation", "Teams research a problem and present an evidence-based solution.", ["TMP", "team multimedia presentation"]),
      t("Individual Research-Based Essay and Presentation", "Write an argument connected to the stimulus materials and defend it orally.", ["IWA", "IRR", "individual written argument"]),
      t("The AP Seminar End-of-Course Exam", "Analyze an argument and write an evidence-based argument from provided sources.", ["ap seminar exam", "EOC"]),
    ]),
  ],
);

export const research = course(
  {
    slug: "ap-research",
    title: "AP Research",
    shortTitle: "AP Research",
    category: "AP Capstone",
    hue: 170,
    description: "The second AP Capstone course: design and carry out a year-long research project and defend a 4,000–5,000 word academic paper.",
    keywords: ["ap research"],
  },
  [
    u("Designing the Study", "Questions, literature review, and methods.", [
      t("Research Questions and Gaps", "Find a gap in the scholarly conversation and turn it into a focused question.", ["research question", "gap in research"]),
      t("Literature Review", "Summarize and synthesize existing research to show where your study fits.", ["literature review"]),
      t("Research Methods", "Choose a method (survey, experiment, content analysis, and others) that fits your question.", ["research methods", "qualitative quantitative"]),
    ]),
    u("Paper and Presentation", "Writing, presenting, and defending.", [
      t("Writing the Academic Paper", "Organize your paper with methods, results, discussion, and limitations.", ["academic paper", "ap research paper"]),
      t("Presentation and Oral Defense", "Present your findings and answer questions about your process.", ["POD", "oral defense"]),
    ]),
  ],
);
