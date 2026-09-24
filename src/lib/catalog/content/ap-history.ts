import { course, t, u } from "./spec";

export const apush = course(
  {
    slug: "ap-us-history",
    title: "AP United States History",
    shortTitle: "APUSH",
    category: "History & Social Sciences",
    hue: 0,
    description: "American history from 1491 to the present across nine periods, with the causation, comparison, and argument skills the DBQ and LEQ demand.",
    query: "APUSH",
    keywords: ["apush", "ap us history", "us history", "american history", "ap united states history"],
  },
  [
    u("Period 1: 1491–1607", "Native societies and first contact.", [
      t("Native American Societies Before Contact", "Native societies adapted to their environments, from maize cultivation in the Southwest to mobile hunting on the Plains.", ["native americans"]),
      t("European Exploration and the Columbian Exchange", "Spanish conquest and the Columbian Exchange transformed both hemispheres.", ["columbian exchange", "encomienda", "spanish conquest"]),
    ]),
    u("Period 2: 1607–1754", "Colonial societies in North America.", [
      t("Comparing the Colonial Regions", "The Chesapeake, New England, Middle, and Southern colonies differed in economy, religion, and labor.", ["chesapeake colonies", "new england colonies", "middle colonies"]),
      t("Mercantilism and Colonial Labor", "Britain's mercantilist system shaped trade, while indentured servitude gave way to slavery.", ["mercantilism", "indentured servants", "triangular trade"]),
      t("The Great Awakening and the Enlightenment", "Religious revival and Enlightenment ideas challenged colonial authority.", ["great awakening"]),
    ]),
    u("Period 3: 1754–1800", "Revolution and a new republic.", [
      t("The French and Indian War", "Britain's victory left debt and new taxes that strained colonial loyalty.", ["seven years war", "french and indian war"]),
      t("Road to the American Revolution", "The Stamp Act, Townshend Acts, and Intolerable Acts pushed colonists from protest to independence.", ["stamp act", "causes of the american revolution"]),
      t("The Articles of Confederation and the Constitution", "A weak confederation led to the Constitutional Convention and compromises over representation and slavery.", ["articles of confederation", "constitutional convention", "federalists anti-federalists"]),
      t("The Early Republic", "Washington and Adams faced debates over the national bank, foreign policy, and the first party system.", ["hamilton jefferson", "first party system", "alien and sedition acts"]),
    ]),
    u("Period 4: 1800–1848", "Democracy, markets, and reform.", [
      t("Jeffersonian and Jacksonian Democracy", "Voting expanded to more white men while Jackson's presidency reshaped federal power.", ["jacksonian democracy", "trail of tears", "indian removal"]),
      t("The Market Revolution", "Canals, railroads, and factories connected regional economies and changed work.", ["market revolution", "industrialization"]),
      t("Second Great Awakening and Reform Movements", "Religious revival fueled abolition, temperance, and women's rights.", ["second great awakening", "abolition", "seneca falls"]),
    ]),
    u("Period 5: 1844–1877", "Expansion, Civil War, and Reconstruction.", [
      t("Manifest Destiny and the Mexican-American War", "Expansion west raised the question of whether new territories would allow slavery.", ["manifest destiny", "mexican american war"]),
      t("Sectional Crisis", "The Compromise of 1850, Kansas-Nebraska Act, and Dred Scott decision pulled the Union apart.", ["compromise of 1850", "kansas nebraska act", "dred scott"]),
      t("The Civil War", "The war shifted from preserving the Union to ending slavery.", ["civil war", "emancipation proclamation"]),
      t("Reconstruction", "The 13th, 14th, and 15th Amendments promised rights that Reconstruction's end left unenforced.", ["reconstruction", "14th amendment", "jim crow"]),
    ]),
    u("Period 6: 1865–1898", "The Gilded Age.", [
      t("Industrialization and the Gilded Age", "Big business, railroads, and new technology created enormous wealth and inequality.", ["gilded age", "robber barons"]),
      t("Immigration, Urbanization, and Labor", "Immigrants filled growing cities and factories, and workers organized unions.", ["immigration", "labor unions", "urbanization"]),
      t("The West and Populism", "Western settlement displaced Native nations, and struggling farmers built the Populist movement.", ["populism", "dawes act", "western expansion"]),
    ]),
    u("Period 7: 1890–1945", "Empire, reform, depression, and world war.", [
      t("Progressivism", "Progressives used journalism and government to tackle corruption and industrial abuses.", ["progressive era", "muckrakers"]),
      t("American Imperialism and World War I", "The US became an overseas power and then entered World War I.", ["spanish american war", "world war 1 us"]),
      t("The 1920s", "Consumer culture, the Harlem Renaissance, and nativism defined the decade.", ["roaring twenties", "harlem renaissance"]),
      t("The Great Depression and the New Deal", "The New Deal expanded government's role in the economy through relief, recovery, and reform.", ["great depression", "new deal", "fdr"]),
      t("World War II on the Home Front", "The war ended the Depression, moved women into factories, and interned Japanese Americans.", ["world war 2 home front", "japanese internment"]),
    ]),
    u("Period 8: 1945–1980", "Cold War, civil rights, and social change.", [
      t("The Cold War", "Containment shaped US policy from the Truman Doctrine to Korea and Vietnam.", ["cold war", "containment", "vietnam war"]),
      t("The Civil Rights Movement", "Legal challenges and nonviolent protest won the Civil Rights and Voting Rights Acts.", ["civil rights movement", "brown v board", "voting rights act"]),
      t("The Great Society and the 1960s", "Johnson's Great Society expanded social programs as counterculture and protest grew.", ["great society", "counterculture"]),
    ]),
    u("Period 9: 1980–Present", "Conservatism, globalization, and the twenty-first century.", [
      t("The Rise of Conservatism", "Reagan's coalition cut taxes and regulation and pushed a stronger stand against the Soviet Union.", ["reagan", "new right"]),
      t("Globalization and the Post-Cold War World", "The end of the Cold War, the digital economy, and 9/11 reshaped America's role in the world.", ["globalization", "9 11", "war on terror"]),
    ]),
  ],
);

export const euro = course(
  {
    slug: "ap-european-history",
    title: "AP European History",
    shortTitle: "AP Euro",
    category: "History & Social Sciences",
    hue: 345,
    description: "Europe from the Renaissance to the present: states, religion, revolution, industry, empire, and war.",
    keywords: ["ap euro", "ap european history", "european history", "apeh"],
  },
  [
    u("Renaissance and Exploration", "c. 1450 to c. 1648.", [
      t("The Italian Renaissance and Humanism", "Humanists revived classical learning and celebrated individual achievement.", ["renaissance", "humanism"]),
      t("The Age of Exploration", "Portugal and Spain led overseas expansion that built empires and the Columbian Exchange.", ["exploration", "commercial revolution"]),
    ]),
    u("Age of Reformation", "Religious upheaval.", [
      t("The Protestant Reformation", "Luther's challenge split Western Christianity and set off wars of religion.", ["martin luther", "reformation", "calvinism"]),
      t("The Catholic Reformation", "The Council of Trent and the Jesuits renewed Catholicism and fought Protestant expansion.", ["counter reformation", "council of trent"]),
    ]),
    u("Absolutism and Constitutionalism", "c. 1648 to c. 1815.", [
      t("Absolute Monarchy in France", "Louis XIV centralized power at Versailles.", ["absolutism", "louis xiv"]),
      t("Constitutionalism in England and the Dutch Republic", "The Glorious Revolution limited the English monarchy through Parliament.", ["glorious revolution", "english civil war"]),
    ]),
    u("Scientific, Philosophical, and Political Developments", "The Scientific Revolution and the Enlightenment.", [
      t("The Scientific Revolution", "Copernicus, Galileo, and Newton replaced ancient authority with observation and mathematics.", ["scientific revolution"]),
      t("The Enlightenment", "Philosophes applied reason to government, religion, and society.", ["enlightenment", "philosophes"]),
    ]),
    u("Conflict, Crisis, and Reaction in the Late 18th Century", "The French Revolution and Napoleon.", [
      t("The French Revolution", "The Revolution moved from constitutional monarchy to republic to Terror.", ["french revolution", "reign of terror"]),
      t("Napoleon", "Napoleon spread revolutionary reforms through conquest until his defeat in 1815.", ["napoleon", "napoleonic code"]),
    ]),
    u("Industrialization and Its Effects", "c. 1815 to c. 1914.", [
      t("The Industrial Revolution in Europe", "Industry spread from Britain across Europe, remaking cities and class structure.", ["industrial revolution"]),
      t("19th-Century Ideologies", "Liberalism, conservatism, nationalism, and socialism competed after 1815.", ["liberalism", "socialism", "marxism", "nationalism"]),
    ]),
    u("19th-Century Perspectives and Political Developments", "Unification and imperialism.", [
      t("Italian and German Unification", "Cavour and Bismarck used diplomacy and war to unify Italy and Germany.", ["german unification", "bismarck", "italian unification"]),
      t("New Imperialism", "European powers scrambled for Africa and Asia, driven by economics, nationalism, and racial ideology.", ["imperialism", "scramble for africa"]),
    ]),
    u("20th-Century Global Conflicts", "World wars and totalitarianism.", [
      t("World War I and the Russian Revolution", "Total war toppled empires, and the Bolsheviks seized power in Russia.", ["world war 1", "russian revolution"]),
      t("Fascism, Totalitarianism, and World War II", "Mussolini, Hitler, and Stalin built totalitarian states, and World War II and the Holocaust followed.", ["fascism", "nazi germany", "holocaust", "world war 2"]),
    ]),
    u("Cold War and Contemporary Europe", "c. 1914 to present.", [
      t("The Cold War in Europe", "Europe split into blocs until the Soviet Union collapsed.", ["cold war europe", "iron curtain"]),
      t("European Integration and Decolonization", "Europe built the European Union while its empires dissolved.", ["european union", "decolonization"]),
    ]),
  ],
);

export const gov = course(
  {
    slug: "ap-us-government",
    title: "AP United States Government and Politics",
    shortTitle: "AP Gov",
    category: "History & Social Sciences",
    hue: 220,
    description: "The Constitution, the three branches, civil liberties and rights, political ideology, and participation, plus the required Supreme Court cases and documents.",
    query: "AP Gov",
    keywords: ["ap gov", "ap government", "us government", "ap us gov", "government and politics"],
  },
  [
    u("Foundations of American Democracy", "Democratic ideals, the Constitution, and federalism.", [
      t("Democratic Ideals and Models of Democracy", "Participatory, pluralist, and elite democracy describe different ways citizens influence government.", ["pluralism", "elite democracy"]),
      t("Federalist No. 10, No. 51, and Brutus No. 1", "The founders debated factions, checks and balances, and the size of the republic.", ["federalist 10", "federalist 51", "brutus 1"]),
      t("The Constitution and Its Compromises", "The Great Compromise, the Three-Fifths Compromise, and the amendment process shaped the Constitution.", ["great compromise", "constitution"]),
      t("Federalism", "Power is divided between national and state governments, and McCulloch v. Maryland and US v. Lopez define the balance.", ["federalism", "mcculloch v maryland", "us v lopez"]),
    ]),
    u("Interactions Among Branches of Government", "Congress, the president, the courts, and the bureaucracy.", [
      t("Congress", "The House and Senate have different powers, and the legislative process is full of veto points.", ["congress", "house vs senate", "filibuster"]),
      t("The Presidency", "Formal and informal powers let presidents shape policy beyond the text of Article II.", ["presidential powers", "executive orders"]),
      t("The Judiciary and Judicial Review", "Marbury v. Madison established judicial review, and the Court's legitimacy rests on public trust.", ["marbury v madison", "judicial review", "supreme court"]),
      t("The Bureaucracy", "Federal agencies write and enforce rules, checked by Congress and the president.", ["bureaucracy", "iron triangle"]),
    ]),
    u("Civil Liberties and Civil Rights", "The Bill of Rights and equal protection.", [
      t("First Amendment Freedoms", "Engel v. Vitale, Wisconsin v. Yoder, Tinker, and Schenck define religion and speech protections.", ["first amendment", "tinker v des moines", "schenck"]),
      t("Selective Incorporation and Due Process", "The Fourteenth Amendment applies the Bill of Rights to the states, as in Gideon and McDonald v. Chicago.", ["selective incorporation", "gideon v wainwright", "mcdonald v chicago"]),
      t("Civil Rights and Equal Protection", "Brown v. Board and the Civil Rights Act advanced equal protection.", ["brown v board", "equal protection clause", "civil rights act"]),
    ]),
    u("American Political Ideologies and Beliefs", "Public opinion and political socialization.", [
      t("Political Socialization and Public Opinion Polling", "Family, school, and events shape political beliefs, and scientific polls measure them.", ["political socialization", "polling"]),
      t("Liberal and Conservative Ideologies", "Ideology shapes views on the economy, social issues, and the role of government.", ["political ideology", "fiscal policy"]),
    ]),
    u("Political Participation", "Voting, parties, interest groups, elections, and media.", [
      t("Voting and Voter Turnout", "Voting models and demographics explain who votes and why.", ["voter turnout", "rational choice voting"]),
      t("Political Parties and Interest Groups", "Parties organize coalitions to win elections; interest groups lobby to shape policy.", ["political parties", "interest groups", "lobbying"]),
      t("Elections and Campaign Finance", "The Electoral College and Citizens United shape how campaigns are run and funded.", ["electoral college", "citizens united", "campaign finance"]),
    ]),
  ],
);

export const compGov = course(
  {
    slug: "ap-comparative-government",
    title: "AP Comparative Government and Politics",
    shortTitle: "AP Comp Gov",
    category: "History & Social Sciences",
    hue: 190,
    description: "Political systems in six countries (China, Iran, Mexico, Nigeria, Russia, and the United Kingdom), compared through institutions, participation, and change.",
    keywords: ["ap comp gov", "comparative government", "comp gov", "ap comparative"],
  },
  [
    u("Political Systems, Regimes, and Governments", "Democracy, authoritarianism, and legitimacy.", [
      t("Democratic and Authoritarian Regimes", "Regimes differ in how power is gained and checked, from liberal democracy to authoritarian rule.", ["authoritarianism", "democracy", "regime types"]),
      t("Legitimacy and Stability", "Governments stay in power through legitimacy based on tradition, charisma, or rational-legal rules.", ["legitimacy", "sovereignty"]),
    ]),
    u("Political Institutions", "Executives, legislatures, and courts.", [
      t("Parliamentary and Presidential Systems", "The UK's parliamentary system fuses executive and legislature; Mexico's presidential system separates them.", ["parliamentary system", "presidential system"]),
      t("Judicial Independence Across the Course Countries", "Courts range from independent in the UK to controlled by the ruling party in China.", ["judicial independence"]),
    ]),
    u("Political Culture and Participation", "Civil society and social movements.", [
      t("Political Culture and Socialization", "Political beliefs vary across countries and shape how citizens engage.", ["political culture"]),
      t("Civil Rights and Liberties Across Countries", "Governments protect or restrict speech, press, and protest to different degrees.", ["civil liberties comparative"]),
    ]),
    u("Party and Electoral Systems and Citizen Organizations", "Elections, parties, and interest groups.", [
      t("Electoral Systems", "First-past-the-post, proportional, and mixed systems shape party competition.", ["proportional representation", "first past the post", "mixed electoral system"]),
      t("Political Parties and Interest Groups", "Pluralist and corporatist systems give interest groups different access.", ["corporatism", "pluralism"]),
    ]),
    u("Political and Economic Changes and Development", "Globalization and development.", [
      t("Economic Liberalization and Globalization", "Countries have opened their economies in different ways and with different results.", ["globalization", "privatization"]),
      t("Social Policy and Development", "Oil wealth, demographics, and industrialization shape policy in the course countries.", ["resource curse", "rentier state"]),
    ]),
  ],
);

export const humanGeo = course(
  {
    slug: "ap-human-geography",
    title: "AP Human Geography",
    shortTitle: "AP HuG",
    category: "History & Social Sciences",
    hue: 60,
    description: "How people shape and are shaped by place: population, culture, politics, agriculture, cities, and economic development.",
    keywords: ["ap human geography", "human geography", "ap hug", "aphg", "human geo"],
  },
  [
    u("Thinking Geographically", "Maps, scale, and spatial concepts.", [
      t("Maps and Map Projections", "Every projection distorts shape, area, distance, or direction.", ["map projections", "mercator"]),
      t("Spatial Concepts and Scale", "Location, place, distance decay, and scale of analysis organize geographic thinking.", ["distance decay", "scale of analysis"]),
    ]),
    u("Population and Migration Patterns and Processes", "Demography and migration.", [
      t("Population Pyramids and the Demographic Transition Model", "Age-sex pyramids and the DTM show how birth and death rates change as countries develop.", ["demographic transition model", "population pyramids", "DTM"]),
      t("Malthus and Population Policies", "Malthus predicted population would outrun food; countries use pro- and antinatalist policies.", ["malthus", "antinatalist", "pronatalist"]),
      t("Migration Patterns", "Push and pull factors, Ravenstein's laws, and forced migration explain why people move.", ["push pull factors", "ravenstein", "refugees"]),
    ]),
    u("Cultural Patterns and Processes", "Culture, language, religion, and diffusion.", [
      t("Cultural Diffusion", "Relocation, hierarchical, contagious, and stimulus diffusion spread cultural traits.", ["diffusion types", "cultural diffusion"]),
      t("Languages and Religions", "Language families and universalizing versus ethnic religions spread in different patterns.", ["language families", "universalizing religions"]),
    ]),
    u("Political Patterns and Processes", "States, boundaries, and devolution.", [
      t("States, Nations, and Nation-States", "A nation is a people and a state is a political unit; a nation-state is where they coincide.", ["nation state", "stateless nation"]),
      t("Boundaries and Gerrymandering", "Boundaries are drawn by geometry, physical features, or culture, and districts can be gerrymandered.", ["gerrymandering", "boundary types"]),
      t("Devolution and Supranationalism", "Power flows down to regions or up to organizations like the EU.", ["devolution", "supranationalism"]),
    ]),
    u("Agriculture and Rural Land-Use Patterns and Processes", "Farming systems and agricultural revolutions.", [
      t("Agricultural Revolutions", "The Neolithic, Second Agricultural, and Green Revolutions changed how food is produced.", ["green revolution", "neolithic revolution"]),
      t("The von Thünen Model", "Von Thünen's rings predict farm land use based on distance to market.", ["von thunen"]),
      t("Commercial and Subsistence Agriculture", "Intensive and extensive practices vary by climate, land, and market access.", ["subsistence farming", "commercial agriculture"]),
    ]),
    u("Cities and Urban Land-Use Patterns and Processes", "Urbanization and urban models.", [
      t("Urban Models", "The Burgess, Hoyt, multiple-nuclei, and Latin American models describe city structure.", ["concentric zone model", "sector model", "urban models"]),
      t("Central Place Theory and Urban Hierarchies", "Cities' size and spacing reflect the range and threshold of their services.", ["central place theory", "rank size rule", "primate city"]),
      t("Urban Challenges and Sustainability", "Sprawl, gentrification, and squatter settlements challenge city planners.", ["gentrification", "urban sprawl", "smart growth"]),
    ]),
    u("Industrial and Economic Development Patterns and Processes", "Development and globalization.", [
      t("Measures of Development", "GDP per capita, the HDI, and the GII capture different sides of development.", ["HDI", "GII", "development indicators"]),
      t("Development Theories", "Rostow's stages and Wallerstein's world-systems theory explain uneven development.", ["rostow", "world systems theory", "core periphery"]),
      t("Industrialization and Globalization", "Weber's model, outsourcing, and special economic zones shape where industry locates.", ["weber least cost", "outsourcing", "special economic zones"]),
    ]),
  ],
);

export const macro = course(
  {
    slug: "ap-macroeconomics",
    title: "AP Macroeconomics",
    shortTitle: "AP Macro",
    category: "History & Social Sciences",
    hue: 150,
    description: "The economy as a whole: GDP, inflation, unemployment, fiscal and monetary policy, and international trade.",
    keywords: ["ap macro", "ap macroeconomics", "macroeconomics", "macro econ"],
  },
  [
    u("Basic Economic Concepts", "Scarcity, trade, and markets.", [
      t("Scarcity, Opportunity Cost, and the PPC", "The production possibilities curve shows tradeoffs and the cost of choosing one good over another.", ["ppc", "production possibilities curve", "opportunity cost"]),
      t("Comparative Advantage and Trade", "Countries gain from specializing in what they produce at the lowest opportunity cost.", ["comparative advantage", "absolute advantage"]),
      t("Supply, Demand, and Market Equilibrium", "Prices adjust until quantity supplied equals quantity demanded.", ["supply and demand", "equilibrium"]),
    ]),
    u("Economic Indicators and the Business Cycle", "GDP, unemployment, and inflation.", [
      t("GDP and How It's Measured", "GDP counts the market value of final goods and services, measured by spending or income.", ["gdp", "expenditure approach", "real vs nominal gdp"]),
      t("Unemployment", "Frictional, structural, and cyclical unemployment have different causes; the natural rate excludes cyclical.", ["unemployment rate", "natural rate of unemployment"]),
      t("Inflation and the CPI", "The CPI tracks the price level, and inflation hurts lenders and people on fixed incomes.", ["inflation", "cpi"]),
    ]),
    u("National Income and Price Determination", "Aggregate demand and supply.", [
      t("Aggregate Demand and Aggregate Supply", "The AD–AS model shows how shocks move output and the price level in the short and long run.", ["ad as model", "aggregate demand", "aggregate supply"]),
      t("The Multiplier", "An initial change in spending gets multiplied as it becomes someone else's income.", ["spending multiplier", "mpc"]),
      t("Fiscal Policy", "Government changes taxes and spending to close recessionary or inflationary gaps.", ["fiscal policy", "recessionary gap", "inflationary gap"]),
    ]),
    u("Financial Sector", "Money, banks, and monetary policy.", [
      t("Money Creation and the Money Multiplier", "Banks create money by lending out excess reserves.", ["money multiplier", "reserve requirement", "fractional reserve"]),
      t("The Money Market and Monetary Policy", "The Fed changes interest rates and the money supply to steer the economy.", ["monetary policy", "federal reserve", "money market graph"]),
      t("The Loanable Funds Market", "Real interest rates balance saving and borrowing, and deficits can crowd out investment.", ["loanable funds", "crowding out"]),
    ]),
    u("Long-Run Consequences of Stabilization Policies", "Phillips curve and growth.", [
      t("The Phillips Curve", "In the short run inflation and unemployment trade off; in the long run they don't.", ["phillips curve"]),
      t("Economic Growth", "Growth comes from more capital, better technology, and more productive workers.", ["economic growth", "productivity"]),
    ]),
    u("Open Economy: International Trade and Finance", "Balance of payments and exchange rates.", [
      t("Balance of Payments", "The current and financial accounts record a country's transactions with the world.", ["balance of payments", "current account"]),
      t("Exchange Rates and the Foreign Exchange Market", "Currency values move with interest rates, trade, and inflation.", ["foreign exchange market", "exchange rates", "appreciation depreciation"]),
    ]),
  ],
);

export const micro = course(
  {
    slug: "ap-microeconomics",
    title: "AP Microeconomics",
    shortTitle: "AP Micro",
    category: "History & Social Sciences",
    hue: 130,
    description: "How individuals and firms make choices: supply and demand, elasticity, market structures, factor markets, and market failure.",
    keywords: ["ap micro", "ap microeconomics", "microeconomics", "micro econ"],
  },
  [
    u("Basic Economic Concepts", "Scarcity and marginal thinking.", [
      t("Scarcity and Opportunity Cost", "Every choice has an opportunity cost, the value of the next best alternative.", ["opportunity cost", "ppc"]),
      t("Marginal Analysis and Utility", "Rational choices compare marginal benefit to marginal cost; utility maximization equalizes MU per dollar.", ["marginal utility", "utility maximization"]),
    ]),
    u("Supply and Demand", "Markets, elasticity, and surplus.", [
      t("Shifts in Supply and Demand", "Changes in income, tastes, input costs, and technology shift the curves and the equilibrium.", ["supply and demand shifts"]),
      t("Elasticity", "Elasticity measures how strongly quantity responds to price or income changes.", ["price elasticity", "elasticity of demand", "total revenue test"]),
      t("Consumer and Producer Surplus and Deadweight Loss", "Taxes, price ceilings, and price floors reduce total surplus.", ["consumer surplus", "deadweight loss", "price ceiling", "price floor"]),
    ]),
    u("Production, Cost, and the Perfect Competition Model", "Costs and competitive firms.", [
      t("Short-Run and Long-Run Costs", "Marginal, average, fixed, and variable costs follow predictable shapes.", ["cost curves", "marginal cost", "economies of scale"]),
      t("Profit Maximization and Perfect Competition", "Firms produce where MR = MC; in perfect competition long-run profit goes to zero.", ["mr mc", "perfect competition", "shutdown point"]),
    ]),
    u("Imperfect Competition", "Monopoly, oligopoly, and monopolistic competition.", [
      t("Monopoly", "A monopolist restricts output and charges above marginal cost, creating deadweight loss.", ["monopoly", "price discrimination"]),
      t("Oligopoly and Game Theory", "Firms in an oligopoly anticipate rivals' moves, as game theory models.", ["game theory", "nash equilibrium", "oligopoly", "dominant strategy"]),
      t("Monopolistic Competition", "Many firms sell differentiated products and earn zero long-run economic profit.", ["monopolistic competition"]),
    ]),
    u("Factor Markets", "Labor and resource markets.", [
      t("Labor Markets and MRP", "Firms hire until marginal revenue product equals the wage.", ["marginal revenue product", "labor market", "monopsony"]),
    ]),
    u("Market Failure and the Role of Government", "Externalities and public goods.", [
      t("Externalities", "Pollution and education affect third parties, so markets over- or under-produce them.", ["externalities", "negative externality", "positive externality"]),
      t("Public Goods and Income Inequality", "Nonrival, nonexcludable goods suffer from free riders, and taxes redistribute income.", ["public goods", "free rider", "lorenz curve", "gini"]),
    ]),
  ],
);

export const psych = course(
  {
    slug: "ap-psychology",
    title: "AP Psychology",
    shortTitle: "AP Psych",
    category: "History & Social Sciences",
    hue: 300,
    description: "Behavior and mental processes: the brain, cognition, development, learning, social psychology, and mental and physical health.",
    keywords: ["ap psych", "ap psychology", "psychology", "psych"],
  },
  [
    u("Biological Bases of Behavior", "Brain, nervous system, and consciousness.", [
      t("Neurons and Neurotransmitters", "Neurons fire action potentials, and neurotransmitters carry signals across the synapse.", ["action potential", "neurotransmitters", "synapse"]),
      t("The Brain and Nervous System", "Each brain region has specialized functions, and the nervous system divides into central and peripheral.", ["brain structures", "nervous system", "lobes of the brain"]),
      t("Sleep and Consciousness", "Sleep cycles through NREM and REM stages, and drugs alter consciousness in predictable ways.", ["sleep stages", "circadian rhythm", "psychoactive drugs"]),
      t("Sensation", "Sensory receptors convert energy into neural signals through transduction.", ["sensation", "vision", "hearing", "thresholds"]),
    ]),
    u("Cognition", "Perception, thinking, memory, and intelligence.", [
      t("Perception", "Top-down and bottom-up processing and Gestalt principles organize what we sense.", ["perception", "gestalt", "depth perception"]),
      t("Thinking and Problem Solving", "Heuristics speed up thinking but create biases.", ["heuristics", "cognitive biases", "problem solving"]),
      t("Memory", "Encoding, storage, and retrieval explain why we remember and forget.", ["memory", "encoding", "forgetting curve"]),
      t("Intelligence and Testing", "Theories of intelligence and principles of reliability and validity guide testing.", ["intelligence", "reliability validity"]),
    ]),
    u("Development and Learning", "Lifespan development and learning.", [
      t("Developmental Psychology", "Piaget, Erikson, and attachment research describe how we change across the lifespan.", ["piaget", "erikson", "attachment"]),
      t("Classical Conditioning", "Pairing a neutral stimulus with an unconditioned one produces a learned response.", ["classical conditioning", "pavlov"]),
      t("Operant Conditioning and Social Learning", "Reinforcement and punishment shape behavior, and we learn by observing others.", ["operant conditioning", "reinforcement schedules", "bandura"]),
    ]),
    u("Social Psychology and Personality", "Social behavior and personality theories.", [
      t("Attribution, Attitudes, and Persuasion", "We explain behavior with situational or dispositional attributions, often with bias.", ["attribution theory", "fundamental attribution error", "cognitive dissonance"]),
      t("Conformity, Obedience, and Group Behavior", "Asch, Milgram, and group dynamics show the power of the situation.", ["conformity", "obedience", "milgram", "group polarization"]),
      t("Personality Theories", "Psychodynamic, humanistic, trait, and social-cognitive theories explain personality differently.", ["personality", "big five", "freud"]),
      t("Motivation and Emotion", "Drive, arousal, and theories of emotion explain what moves us.", ["motivation theories", "theories of emotion"]),
    ]),
    u("Mental and Physical Health", "Psychological disorders, treatment, and health.", [
      t("Psychological Disorders", "The DSM classifies disorders like depression, anxiety, and schizophrenia.", ["psychological disorders", "dsm", "depression", "schizophrenia"]),
      t("Treatment of Disorders", "Psychotherapies and biomedical treatments approach disorders differently.", ["therapy types", "cbt", "treatment"]),
      t("Stress and Health", "Stress affects the body through the general adaptation syndrome.", ["stress", "general adaptation syndrome", "positive psychology"]),
    ]),
  ],
);

export const afam = course(
  {
    slug: "ap-african-american-studies",
    title: "AP African American Studies",
    shortTitle: "AP AAS",
    category: "History & Social Sciences",
    hue: 20,
    description: "An interdisciplinary course on African American history, culture, and thought, from early African societies to the present.",
    keywords: ["ap african american studies", "african american studies", "ap aas"],
  },
  [
    u("Origins of the African Diaspora", "Early African societies and kingdoms.", [
      t("Early African Kingdoms and Empires", "Mali, Songhai, Kongo, and other states were centers of trade, learning, and culture.", ["mali empire", "songhai", "african kingdoms"]),
      t("The Origins of the Transatlantic Slave Trade", "European demand for labor turned the slave trade into a vast system of forced migration.", ["transatlantic slave trade", "middle passage"]),
    ]),
    u("Freedom, Enslavement, and Resistance", "Slavery in the Americas and resistance to it.", [
      t("Enslavement in the Americas", "Enslaved people built families, cultures, and communities under brutal conditions.", ["slavery in america"]),
      t("Resistance and Abolition", "Revolts, escapes, and abolitionist writing challenged slavery.", ["abolitionists", "frederick douglass", "underground railroad", "slave revolts"]),
    ]),
    u("The Practice of Freedom", "Reconstruction to the Great Migration.", [
      t("Reconstruction and Jim Crow", "Emancipation brought new rights, then segregation and disenfranchisement rolled them back.", ["reconstruction", "jim crow", "plessy v ferguson"]),
      t("The Great Migration and the Harlem Renaissance", "Millions moved north, and Black artists and thinkers transformed American culture.", ["great migration", "harlem renaissance"]),
    ]),
    u("Movements and Debates", "Civil rights to the present.", [
      t("The Civil Rights and Black Power Movements", "Nonviolent protest and Black Power pursued freedom by different strategies.", ["civil rights movement", "black power", "mlk", "malcolm x"]),
      t("Contemporary Debates", "Scholars and activists continue to debate reparations, intersectionality, and representation.", ["intersectionality", "reparations"]),
    ]),
  ],
);

// Units added to the original AP World History course.
export const worldExtraUnits = [
  u("Cold War and Decolonization, 1900–present", "The Cold War and the end of empires.", [
    t("The Cold War", "The United States and the Soviet Union competed through alliances, proxy wars, and ideology.", ["cold war", "proxy wars", "containment"]),
    t("Mao and the Chinese Revolution", "The Chinese Communist Party took power and remade China through collectivization and campaigns.", ["mao zedong", "chinese revolution", "great leap forward"]),
  ]),
  u("Globalization, 1900–present", "Technology, economics, and culture in a connected world.", [
    t("Advances in Technology and Global Health", "The Green Revolution, medical advances, and new technologies transformed daily life.", ["green revolution", "globalization technology"]),
    t("Economic Globalization and Resistance", "Free-trade agreements and multinational corporations spread, meeting protest and reform.", ["economic globalization", "wto", "neoliberalism"]),
  ]),
];
