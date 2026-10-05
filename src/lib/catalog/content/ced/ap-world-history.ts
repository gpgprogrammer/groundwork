import type { CourseSpec } from "../spec";

/**
 * AP World History: Modern, following the College Board Course and Exam Description (units and topics in CED order).
 */
export const worldHistory: CourseSpec = {
  "course": {
    "slug": "ap-world-history",
    "title": "AP World History: Modern",
    "shortTitle": "AP World",
    "exam": "AP",
    "category": "History & Social Sciences",
    "description": "1200 to the present through networks of exchange, state building, revolution, and global conflict. It's built around the reasoning the DBQ and LEQ reward.",
    "hue": 28,
    "examMonth": "May",
    "query": "AP World History",
    "keywords": [
      "ap world",
      "world history",
      "apwh",
      "whap"
    ]
  },
  "units": [
    {
      "slug": "global-tapestry",
      "title": "The Global Tapestry (c. 1200–c. 1450)",
      "summary": "How states and belief systems developed across Afro-Eurasia and the Americas.",
      "concepts": [
        {
          "title": "The Global Tapestry (c. 1200–c. 1450)",
          "topics": [
            {
              "slug": "champa-rice",
              "title": "Champa Rice and Song China",
              "glyph": "稻",
              "summary": "Champa rice was a fast-ripening, drought-resistant rice from Vietnam that let Song farmers harvest twice a year. The surplus fed a population boom, bigger cities, and commercial growth.",
              "points": [
                "Where Champa rice came from",
                "Surplus → population → cities",
                "Using it as DBQ evidence"
              ],
              "aliases": [
                "song dynasty agriculture",
                "fast ripening rice",
                "song economy",
                "vietnam rice"
              ]
            },
            {
              "slug": "song-bureaucracy",
              "title": "Song Bureaucracy and Neo-Confucianism",
              "glyph": "科舉",
              "summary": "The Song ran China through a merit-based civil service chosen by exam. Neo-Confucianism reinforced hierarchy and filial piety across both state and family.",
              "points": [
                "The civil service exams",
                "Neo-Confucian values",
                "Continuity and change in governance"
              ],
              "aliases": [
                "civil service exam",
                "neo confucianism",
                "song dynasty"
              ]
            },
            {
              "slug": "dar-al-islam",
              "title": "Dar al-Islam",
              "glyph": "بيت الحكمة",
              "summary": "The Abbasid Caliphate broke apart, but the wider Islamic world stayed connected through trade, law, and learning. The House of Wisdom preserved and extended Greek, Persian, and Indian knowledge.",
              "points": [
                "Fragmentation of the Abbasids",
                "Turkic states",
                "Scholarly exchange"
              ],
              "aliases": [
                "abbasid",
                "house of wisdom",
                "islamic world"
              ]
            },
            {
              "slug": "south-and-southeast-asia-1200-1450",
              "title": "South and Southeast Asia, 1200–1450",
              "summary": "Hinduism, Buddhism, and Islam shaped states like the Delhi Sultanate, Vijayanagara, Srivijaya, and the Khmer Empire.",
              "points": [
                "Delhi Sultanate",
                "Vijayanagara",
                "Srivijaya and Majapahit"
              ],
              "aliases": [
                "delhi sultanate",
                "vijayanagara",
                "srivijaya",
                "khmer empire"
              ]
            },
            {
              "slug": "state-building-in-the-americas",
              "title": "State Building in the Americas",
              "summary": "The Aztec (Mexica) and Inca built large empires with tribute systems, the mit'a, and impressive infrastructure.",
              "points": [
                "Mexica tribute",
                "Inca mit'a and roads",
                "Cahokia and Pueblo peoples"
              ],
              "aliases": [
                "aztec empire",
                "inca empire",
                "mexica"
              ]
            },
            {
              "slug": "mali-empire",
              "title": "Mali and Mansa Musa",
              "glyph": "☼",
              "summary": "Mali grew rich by controlling the trans-Saharan gold and salt trade. Mansa Musa's 1324 hajj made that wealth famous across the Mediterranean.",
              "points": [
                "Gold-salt trade",
                "Timbuktu as a center of learning",
                "Islam and state legitimacy"
              ],
              "aliases": [
                "mansa musa",
                "timbuktu",
                "west africa",
                "trans-saharan"
              ]
            },
            {
              "slug": "europe-1200-1450",
              "title": "Europe, 1200–1450",
              "summary": "Feudalism and the manorial system organized Europe while the Catholic Church held religious and political power.",
              "points": [
                "Feudalism and manorialism",
                "The Catholic Church",
                "Monarchies and the plague"
              ],
              "aliases": [
                "feudalism",
                "medieval europe",
                "manorialism"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "networks-of-exchange",
      "title": "Networks of Exchange (c. 1200–c. 1450)",
      "summary": "Trade routes that connected Afro-Eurasia, and what moved along them.",
      "concepts": [
        {
          "title": "Networks of Exchange (c. 1200–c. 1450)",
          "topics": [
            {
              "slug": "silk-roads",
              "title": "The Silk Roads",
              "glyph": "⇄",
              "summary": "The Silk Roads were a network of overland routes that carried luxury goods, religions, technologies, and disease across Eurasia. Caravanserai and credit systems made trading over long distances practical.",
              "points": [
                "Luxury goods and why",
                "Caravanserai and flying cash",
                "Cultural diffusion"
              ],
              "aliases": [
                "silk road",
                "overland trade",
                "caravanserai"
              ]
            },
            {
              "slug": "mongol-empire",
              "title": "The Mongol Empire",
              "glyph": "⚑",
              "summary": "The Mongols built the largest contiguous land empire in history. The Pax Mongolica made Eurasian trade safer, and it also helped the plague travel.",
              "points": [
                "Military innovation",
                "Pax Mongolica",
                "Transfers of technology and disease"
              ],
              "aliases": [
                "genghis khan",
                "pax mongolica",
                "khanates"
              ]
            },
            {
              "slug": "indian-ocean-trade",
              "title": "Indian Ocean Trade",
              "glyph": "≈",
              "summary": "Monsoon winds set the rhythm of Indian Ocean trade. Diaspora communities of merchants spread goods, faiths, and customs from East Africa to China.",
              "points": [
                "Monsoon knowledge",
                "Swahili city-states",
                "Diasporic communities"
              ],
              "aliases": [
                "monsoon",
                "swahili coast",
                "maritime trade"
              ]
            },
            {
              "slug": "trans-saharan-trade",
              "title": "Trans-Saharan Trade",
              "summary": "Camels and caravanserai linked West Africa's gold to North Africa's salt and spread Islam south of the Sahara.",
              "points": [
                "Gold and salt",
                "Camel caravans",
                "Mali and Timbuktu"
              ],
              "aliases": [
                "trans saharan trade",
                "gold salt trade"
              ]
            },
            {
              "slug": "consequences-of-connectivity",
              "title": "Consequences of Connectivity",
              "summary": "Trade spread religions, technologies, crops, and diseases, including the Black Death, across Afro-Eurasia.",
              "points": [
                "Cultural diffusion",
                "The Black Death",
                "Crops and technology spread"
              ],
              "aliases": [
                "black death",
                "cultural diffusion"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "land-based-empires",
      "title": "Land-Based Empires (c. 1450–c. 1750)",
      "summary": "How gunpowder empires expanded, ruled, and legitimized power.",
      "concepts": [
        {
          "title": "Land-Based Empires (c. 1450–c. 1750)",
          "topics": [
            {
              "slug": "gunpowder-empires",
              "title": "Ottomans, Safavids, and Mughals",
              "glyph": "⚔",
              "summary": "Three Islamic empires used firearms to expand and hold territory. They legitimized rule in different ways and managed religiously diverse subjects differently.",
              "points": [
                "Military technology and expansion",
                "Sunni–Shia rivalry",
                "Akbar's tolerance"
              ],
              "aliases": [
                "ottoman empire",
                "safavid",
                "mughal",
                "islamic empires"
              ]
            },
            {
              "slug": "devshirme",
              "title": "The Devshirme System",
              "glyph": "⚜",
              "summary": "The Ottomans took Christian boys from the Balkans, converted them, and trained them as Janissaries or administrators. The system created an elite whose loyalty ran to the sultan alone.",
              "points": [
                "How it worked",
                "Janissaries",
                "Loyalty and centralization"
              ],
              "aliases": [
                "janissaries",
                "ottoman administration"
              ]
            },
            {
              "slug": "empires-belief-systems",
              "title": "Empires: Belief Systems",
              "summary": "Rulers used religion to legitimize power, while splits like Sunni vs. Shia and the Protestant Reformation divided empires.",
              "points": [
                "Sunni–Shia split",
                "The Protestant Reformation",
                "Sikhism"
              ],
              "aliases": [
                "protestant reformation",
                "sunni shia",
                "sikhism"
              ]
            },
            {
              "slug": "qing-mughal-and-tokugawa-rule",
              "title": "Qing, Mughal, and Tokugawa Rule",
              "summary": "Land-based empires kept power with bureaucracies, monumental architecture, and controls on foreign contact.",
              "points": [
                "Qing China",
                "Tokugawa Japan",
                "Monumental architecture"
              ],
              "aliases": [
                "qing dynasty",
                "tokugawa shogunate"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "transoceanic-interconnections",
      "title": "Transoceanic Interconnections (c. 1450–c. 1750)",
      "summary": "Exploration, maritime empires, and the Atlantic world.",
      "concepts": [
        {
          "title": "Transoceanic Interconnections (c. 1450–c. 1750)",
          "topics": [
            {
              "slug": "exploration-technology-and-causes",
              "title": "Exploration: Technology and Causes",
              "summary": "New ships, navigation tools, and state sponsorship pushed Europeans across the oceans in search of wealth and trade routes.",
              "points": [
                "Caravel and astrolabe",
                "Portuguese exploration",
                "Columbus and Magellan"
              ],
              "aliases": [
                "age of exploration",
                "caravel"
              ]
            },
            {
              "slug": "columbian-exchange",
              "title": "The Columbian Exchange",
              "glyph": "⇆",
              "summary": "After 1492, plants, animals, diseases, and people crossed the Atlantic in both directions. Smallpox devastated Indigenous populations, while American crops fed population growth in Afro-Eurasia.",
              "points": [
                "Disease and demographic collapse",
                "Crops that changed diets",
                "Cash crops and labor demand"
              ],
              "aliases": [
                "columbian exchange",
                "smallpox",
                "potatoes maize"
              ]
            },
            {
              "slug": "maritime-empires",
              "title": "Maritime Empires",
              "summary": "Portugal, Spain, the Dutch, and the British built trading-post and colonial empires that reshaped global trade.",
              "points": [
                "Trading-post empires",
                "Joint-stock companies",
                "Mercantilism"
              ],
              "aliases": [
                "maritime empires",
                "mercantilism",
                "joint stock companies"
              ]
            },
            {
              "slug": "labor-systems",
              "title": "Encomienda, Hacienda, and Mit'a",
              "glyph": "⛏",
              "summary": "Spanish colonizers adapted older labor systems and invented new ones to extract wealth. Knowing how each system differed is a reliable way to earn comparison points.",
              "points": [
                "Encomienda vs. hacienda",
                "The mit'a and Potosí",
                "Why labor was coerced"
              ],
              "aliases": [
                "encomienda",
                "hacienda",
                "mita",
                "potosi",
                "coerced labor"
              ]
            },
            {
              "slug": "atlantic-slave-trade",
              "title": "The Atlantic Slave Trade",
              "glyph": "△",
              "summary": "Plantation economies drove the forced migration of about 12 million Africans. The trade changed demographics and economies on three continents.",
              "points": [
                "Triangular trade",
                "Plantation economies",
                "Impact on West African states"
              ],
              "aliases": [
                "transatlantic slave trade",
                "middle passage",
                "triangular trade"
              ]
            },
            {
              "slug": "challenges-to-state-power-and-social-hierarchies",
              "title": "Challenges to State Power and Social Hierarchies",
              "summary": "Rebellions and resistance tested empires, while new racial and social hierarchies like the casta system formed in the Americas.",
              "points": [
                "Pueblo Revolt",
                "The casta system",
                "Resistance to colonial rule"
              ],
              "aliases": [
                "casta system",
                "pueblo revolt"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "revolutions",
      "title": "Revolutions (c. 1750–c. 1900)",
      "summary": "Enlightenment, revolutions, and the start of industrialization.",
      "concepts": [
        {
          "title": "Revolutions (c. 1750–c. 1900)",
          "topics": [
            {
              "slug": "enlightenment",
              "title": "Enlightenment Ideas",
              "glyph": "¶",
              "summary": "Enlightenment thinkers questioned inherited authority and argued for natural rights and the social contract. Those ideas powered revolutions across the Atlantic world.",
              "points": [
                "Locke, Rousseau, Montesquieu",
                "Natural rights",
                "From ideas to revolutions"
              ],
              "aliases": [
                "locke",
                "rousseau",
                "social contract",
                "natural rights"
              ]
            },
            {
              "slug": "nationalism-and-revolutions",
              "title": "Nationalism and Revolutions",
              "summary": "Enlightenment ideas and nationalism fueled the American, French, and Latin American revolutions.",
              "points": [
                "American and French Revolutions",
                "Latin American independence",
                "Nationalism"
              ],
              "aliases": [
                "french revolution",
                "latin american revolutions",
                "nationalism"
              ]
            },
            {
              "slug": "haitian-revolution",
              "title": "The Haitian Revolution",
              "glyph": "✦",
              "summary": "The only successful large-scale revolt of enslaved people founded an independent Haiti in 1804. It unsettled slaveholding societies across the hemisphere.",
              "points": [
                "Saint-Domingue's economy",
                "Toussaint Louverture",
                "Hemispheric consequences"
              ],
              "aliases": [
                "haiti",
                "toussaint louverture",
                "saint domingue"
              ]
            },
            {
              "slug": "industrial-revolution",
              "title": "Why Industrialization Began in Britain",
              "glyph": "⚙",
              "summary": "Coal, capital, colonies, and a large supply of labor made Britain the first industrial economy. The AP exam wants multiple interacting causes, not a single one.",
              "points": [
                "Factors of production",
                "Steam and coal",
                "Causation reasoning"
              ],
              "aliases": [
                "industrial revolution causes",
                "britain industrialization",
                "steam engine"
              ]
            },
            {
              "slug": "industrialization-spreads",
              "title": "Industrialization Spreads",
              "summary": "Industry spread to Western Europe, the U.S., Russia, and Japan, driven by new technology and government support.",
              "points": [
                "Steam power and railroads",
                "Second Industrial Revolution",
                "State-led industrialization"
              ],
              "aliases": [
                "second industrial revolution"
              ]
            },
            {
              "slug": "reactions-to-the-industrial-economy",
              "title": "Reactions to the Industrial Economy",
              "summary": "Workers organized unions, socialists and Marxists critiqued capitalism, and reformers pushed for change.",
              "points": [
                "Labor unions",
                "Karl Marx and socialism",
                "Reform movements"
              ],
              "aliases": [
                "labor movement",
                "karl marx",
                "socialism"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "consequences-of-industrialization",
      "title": "Consequences of Industrialization (c. 1750–c. 1900)",
      "summary": "Imperialism, resistance, and migration.",
      "concepts": [
        {
          "title": "Consequences of Industrialization (c. 1750–c. 1900)",
          "topics": [
            {
              "slug": "rationales-for-imperialism",
              "title": "Rationales for Imperialism",
              "summary": "Industrial powers justified empire with economic demand, nationalism, Social Darwinism, and the 'civilizing mission'.",
              "points": [
                "Social Darwinism",
                "The civilizing mission",
                "Economic motives"
              ],
              "aliases": [
                "rationales for imperialism",
                "social darwinism"
              ]
            },
            {
              "slug": "new-imperialism",
              "title": "New Imperialism",
              "glyph": "◐",
              "summary": "Industrial powers colonized Africa and Asia to secure raw materials and markets, and justified it with Social Darwinism. The Berlin Conference divided Africa without any Africans in the room.",
              "points": [
                "Economic motives",
                "Ideological justifications",
                "Berlin Conference"
              ],
              "aliases": [
                "scramble for africa",
                "berlin conference",
                "social darwinism",
                "imperialism"
              ]
            },
            {
              "slug": "indigenous-responses-to-imperialism",
              "title": "Indigenous Responses to Imperialism",
              "summary": "Colonized peoples resisted through wars, rebellions, and new states, from the Sepoy Rebellion to the Xhosa Cattle-Killing.",
              "points": [
                "Sepoy Rebellion",
                "Ghost Dance and Zulu resistance",
                "Taiping Rebellion"
              ],
              "aliases": [
                "sepoy rebellion",
                "resistance to imperialism"
              ]
            },
            {
              "slug": "meiji-restoration",
              "title": "The Meiji Restoration",
              "glyph": "明治",
              "summary": "After being forced open, Japan industrialized from the top down and became an imperial power within a generation. It's the key counterexample in state-reform questions.",
              "points": [
                "Why Japan reformed",
                "State-led industrialization",
                "Comparison with the Qing"
              ],
              "aliases": [
                "meiji japan",
                "japanese industrialization"
              ]
            },
            {
              "slug": "economic-imperialism",
              "title": "Economic Imperialism",
              "summary": "Industrial powers dominated weaker states economically, as in the Opium Wars and the cash-crop economies of colonies.",
              "points": [
                "Opium Wars",
                "Export economies",
                "Banana republics"
              ],
              "aliases": [
                "opium wars",
                "economic imperialism"
              ]
            },
            {
              "slug": "migration-in-an-interconnected-world",
              "title": "Migration in an Interconnected World",
              "summary": "Millions migrated for work, often as indentured laborers, creating diasporas and sparking nativist restrictions.",
              "points": [
                "Indentured servitude",
                "Diasporas",
                "Chinese Exclusion Act"
              ],
              "aliases": [
                "migration",
                "indentured servitude"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "global-conflict",
      "title": "Global Conflict (c. 1900–present)",
      "summary": "Two world wars, the interwar crisis, and mass atrocities.",
      "concepts": [
        {
          "title": "Global Conflict (c. 1900–present)",
          "topics": [
            {
              "slug": "shifting-power-after-1900",
              "title": "Shifting Power After 1900",
              "summary": "Old empires (Ottoman, Russian, Qing) collapsed under internal and external pressure as new states and powers rose.",
              "points": [
                "Collapse of the Qing",
                "Russian Revolution",
                "Mexican Revolution"
              ],
              "aliases": [
                "russian revolution",
                "end of empires"
              ]
            },
            {
              "slug": "causes-of-wwi",
              "title": "Causes of World War I",
              "glyph": "M·A·I·N",
              "summary": "Militarism, alliances, imperial rivalry, and nationalism made a regional crisis into a world war. The assassination in Sarajevo was the spark, not the cause.",
              "points": [
                "Long-term vs. immediate causes",
                "Alliance systems",
                "Total war"
              ],
              "aliases": [
                "wwi",
                "world war 1",
                "MAIN causes",
                "franz ferdinand"
              ]
            },
            {
              "slug": "conducting-world-war-i",
              "title": "Conducting World War I",
              "summary": "Total war mobilized whole societies and empires, with new weapons, trench warfare, and propaganda.",
              "points": [
                "Total war",
                "Trench warfare",
                "Colonial troops"
              ],
              "aliases": [
                "world war 1",
                "total war"
              ]
            },
            {
              "slug": "the-interwar-period",
              "title": "The Interwar Period",
              "summary": "The Great Depression and unresolved tensions from the Treaty of Versailles fed fascism and militarism.",
              "points": [
                "The Great Depression",
                "Fascism",
                "Treaty of Versailles"
              ],
              "aliases": [
                "great depression",
                "fascism",
                "interwar period"
              ]
            },
            {
              "slug": "world-war-ii",
              "title": "World War II",
              "summary": "Fascist expansion led to a second total war fought across Europe, Asia, and Africa, ending with the atomic bomb.",
              "points": [
                "Causes of WWII",
                "Total war again",
                "Atomic bombs"
              ],
              "aliases": [
                "world war 2",
                "causes of world war ii"
              ]
            },
            {
              "slug": "mass-atrocities-after-1900",
              "title": "Mass Atrocities After 1900",
              "summary": "Genocides and mass killings, including the Armenian Genocide, the Holocaust, and the Cambodian genocide, marked the century.",
              "points": [
                "Armenian Genocide",
                "The Holocaust",
                "Rwanda and Cambodia"
              ],
              "aliases": [
                "holocaust",
                "genocide"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "cold-war-and-decolonization-1900-present",
      "title": "Cold War and Decolonization (c. 1900–present)",
      "summary": "Superpower rivalry and the end of empires.",
      "concepts": [
        {
          "title": "Cold War and Decolonization (c. 1900–present)",
          "topics": [
            {
              "slug": "the-cold-war",
              "title": "The Cold War",
              "summary": "The United States and the Soviet Union competed through alliances, proxy wars, and ideology.",
              "aliases": [
                "cold war",
                "proxy wars",
                "containment"
              ]
            },
            {
              "slug": "mao-and-the-chinese-revolution",
              "title": "Mao and the Chinese Revolution",
              "summary": "The Chinese Communist Party took power and remade China through collectivization and campaigns.",
              "aliases": [
                "mao zedong",
                "chinese revolution",
                "great leap forward"
              ]
            },
            {
              "slug": "decolonization",
              "title": "Decolonization",
              "glyph": "↺",
              "summary": "After 1945, colonies across Asia and Africa won independence through negotiation or through armed struggle. Compare India, Algeria, and Ghana to see the range.",
              "points": [
                "Negotiated vs. violent paths",
                "Nationalist leaders",
                "Cold War entanglements"
              ],
              "aliases": [
                "independence movements",
                "gandhi",
                "algeria",
                "ghana",
                "nkrumah"
              ]
            },
            {
              "slug": "newly-independent-states",
              "title": "Newly Independent States",
              "summary": "New nations faced borders drawn by colonizers, ethnic conflict, and debates over economic development.",
              "points": [
                "Partition of India",
                "Post-colonial economies",
                "Migration to former metropoles"
              ],
              "aliases": [
                "partition of india",
                "newly independent states"
              ]
            },
            {
              "slug": "global-resistance-and-the-end-of-the-cold-war",
              "title": "Global Resistance and the End of the Cold War",
              "summary": "Nonviolent and armed movements challenged established order, and the Soviet Union collapsed in 1991.",
              "points": [
                "Gandhi and MLK",
                "Non-Aligned Movement",
                "Fall of the USSR"
              ],
              "aliases": [
                "end of the cold war",
                "non aligned movement"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "globalization-1900-present",
      "title": "Globalization (c. 1900–present)",
      "summary": "Technology, economics, culture, and institutions in a connected world.",
      "concepts": [
        {
          "title": "Globalization (c. 1900–present)",
          "topics": [
            {
              "slug": "advances-in-technology-and-global-health",
              "title": "Advances in Technology and Global Health",
              "summary": "The Green Revolution, medical advances, and new technologies transformed daily life.",
              "aliases": [
                "green revolution",
                "globalization technology"
              ]
            },
            {
              "slug": "debates-about-the-environment",
              "title": "Debates About the Environment",
              "summary": "Population growth and industry brought deforestation, pollution, and climate change, and new debates over sustainability.",
              "points": [
                "Green Revolution",
                "Climate change",
                "Environmental movements"
              ],
              "aliases": [
                "green revolution",
                "climate change"
              ]
            },
            {
              "slug": "economic-globalization-and-resistance",
              "title": "Economic Globalization and Resistance",
              "summary": "Free-trade agreements and multinational corporations spread, meeting protest and reform.",
              "aliases": [
                "economic globalization",
                "wto",
                "neoliberalism"
              ]
            },
            {
              "slug": "calls-for-reform-and-globalized-culture",
              "title": "Calls for Reform and Globalized Culture",
              "summary": "Movements for human rights, women's rights, and civil rights spread alongside a global consumer and popular culture.",
              "points": [
                "Human rights movements",
                "Global popular culture",
                "Rights for women and minorities"
              ],
              "aliases": [
                "human rights",
                "global culture"
              ]
            },
            {
              "slug": "institutions-in-a-globalized-world",
              "title": "Institutions in a Globalized World",
              "summary": "The UN, WTO, and regional groups like the EU manage cooperation, trade, and conflict across borders.",
              "points": [
                "United Nations",
                "WTO and trade blocs",
                "NGOs"
              ],
              "aliases": [
                "united nations",
                "european union",
                "wto"
              ]
            }
          ]
        }
      ]
    }
  ]
};
