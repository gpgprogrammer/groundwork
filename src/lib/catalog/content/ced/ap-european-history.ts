import type { CourseSpec } from "../spec";

/**
 * AP European History, following the College Board Course and Exam Description (units and topics in CED order).
 */
export const euro: CourseSpec = {
  "course": {
    "slug": "ap-european-history",
    "title": "AP European History",
    "shortTitle": "AP Euro",
    "exam": "AP",
    "category": "History & Social Sciences",
    "description": "Europe from the Renaissance to the present: states, religion, revolution, industry, empire, and war.",
    "hue": 345,
    "examMonth": "May",
    "query": "AP European History",
    "keywords": [
      "ap euro",
      "ap european history",
      "european history",
      "apeh"
    ]
  },
  "units": [
    {
      "slug": "renaissance-and-exploration",
      "title": "Renaissance and Exploration",
      "summary": "Renaissance ideas, new monarchies, and overseas empires.",
      "concepts": [
        {
          "title": "Renaissance and Exploration",
          "topics": [
            {
              "slug": "the-italian-renaissance-and-humanism",
              "title": "The Italian Renaissance and Humanism",
              "summary": "Humanists revived classical learning and celebrated individual achievement.",
              "aliases": [
                "renaissance",
                "humanism"
              ]
            },
            {
              "slug": "the-northern-renaissance-and-the-printing-press",
              "title": "The Northern Renaissance and the Printing Press",
              "summary": "Humanism spread north with the printing press, focusing on religious reform and everyday life.",
              "points": [
                "Erasmus",
                "Gutenberg's press",
                "Northern art"
              ],
              "aliases": [
                "northern renaissance",
                "printing press"
              ]
            },
            {
              "slug": "new-monarchies",
              "title": "New Monarchies",
              "summary": "Rulers in France, England, and Spain centralized power with standing armies, taxes, and control of the church.",
              "points": [
                "Centralization",
                "Ferdinand and Isabella",
                "Henry VII"
              ],
              "aliases": [
                "new monarchies"
              ]
            },
            {
              "slug": "the-age-of-exploration",
              "title": "The Age of Exploration",
              "summary": "Portugal and Spain led overseas expansion that built empires and the Columbian Exchange.",
              "aliases": [
                "exploration",
                "commercial revolution"
              ]
            },
            {
              "slug": "the-commercial-revolution",
              "title": "The Commercial Revolution",
              "summary": "Joint-stock companies, banking, and colonial trade transformed Europe's economy and fed the slave trade.",
              "points": [
                "Joint-stock companies",
                "Price revolution",
                "Atlantic slave trade"
              ],
              "aliases": [
                "commercial revolution"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "age-of-reformation",
      "title": "Age of Reformation",
      "summary": "Religious division and wars of religion.",
      "concepts": [
        {
          "title": "Age of Reformation",
          "topics": [
            {
              "slug": "the-protestant-reformation",
              "title": "The Protestant Reformation",
              "summary": "Luther's challenge split Western Christianity and set off wars of religion.",
              "aliases": [
                "martin luther",
                "reformation",
                "calvinism"
              ]
            },
            {
              "slug": "the-wars-of-religion",
              "title": "The Wars of Religion",
              "summary": "Religious divisions sparked civil wars in France and the Thirty Years' War, ending in the Peace of Westphalia.",
              "points": [
                "French Wars of Religion",
                "Thirty Years' War",
                "Peace of Westphalia"
              ],
              "aliases": [
                "thirty years war",
                "wars of religion"
              ]
            },
            {
              "slug": "the-catholic-reformation",
              "title": "The Catholic Reformation",
              "summary": "The Council of Trent and the Jesuits renewed Catholicism and fought Protestant expansion.",
              "aliases": [
                "counter reformation",
                "council of trent"
              ]
            },
            {
              "slug": "16th-century-society-and-art",
              "title": "16th-Century Society and Art",
              "summary": "Mannerism and Baroque art served religious and political goals, while family and economic life slowly changed.",
              "points": [
                "Mannerism",
                "Baroque",
                "Family and gender roles"
              ],
              "aliases": [
                "baroque art",
                "mannerism"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "absolutism-and-constitutionalism",
      "title": "Absolutism and Constitutionalism",
      "summary": "Kings vs. parliaments, and the balance of power.",
      "concepts": [
        {
          "title": "Absolutism and Constitutionalism",
          "topics": [
            {
              "slug": "absolute-monarchy-in-france",
              "title": "Absolute Monarchy in France",
              "summary": "Louis XIV centralized power at Versailles.",
              "aliases": [
                "absolutism",
                "louis xiv"
              ]
            },
            {
              "slug": "constitutionalism-in-england-and-the-dutch-republic",
              "title": "Constitutionalism in England and the Dutch Republic",
              "summary": "The Glorious Revolution limited the English monarchy through Parliament.",
              "aliases": [
                "glorious revolution",
                "english civil war"
              ]
            },
            {
              "slug": "mercantilism-and-the-balance-of-power",
              "title": "Mercantilism and the Balance of Power",
              "summary": "States pursued mercantilist economies and fought wars to keep any one power from dominating Europe.",
              "points": [
                "Mercantilism",
                "War of Spanish Succession",
                "Rise of Prussia and Russia"
              ],
              "aliases": [
                "balance of power",
                "mercantilism europe"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "scientific-philosophical-and-political-developments",
      "title": "Scientific, Philosophical, and Political Developments",
      "summary": "The Scientific Revolution and the Enlightenment.",
      "concepts": [
        {
          "title": "Scientific, Philosophical, and Political Developments",
          "topics": [
            {
              "slug": "the-scientific-revolution",
              "title": "The Scientific Revolution",
              "summary": "Copernicus, Galileo, and Newton replaced ancient authority with observation and mathematics.",
              "aliases": [
                "scientific revolution"
              ]
            },
            {
              "slug": "the-enlightenment",
              "title": "The Enlightenment",
              "summary": "Philosophes applied reason to government, religion, and society.",
              "aliases": [
                "enlightenment",
                "philosophes"
              ]
            },
            {
              "slug": "enlightened-absolutism-and-18th-century-society",
              "title": "Enlightened Absolutism and 18th-Century Society",
              "summary": "Rulers like Frederick the Great and Catherine the Great adopted some Enlightenment reforms while keeping power; population and consumer culture grew.",
              "points": [
                "Enlightened absolutism",
                "Agricultural revolution",
                "Consumer culture"
              ],
              "aliases": [
                "enlightened absolutism"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "conflict-crisis-and-reaction-in-the-late-18th-century",
      "title": "Conflict, Crisis, and Reaction in the Late 18th Century",
      "summary": "Global markets, revolution, Napoleon, and Romanticism.",
      "concepts": [
        {
          "title": "Conflict, Crisis, and Reaction in the Late 18th Century",
          "topics": [
            {
              "slug": "global-markets-and-britains-rise",
              "title": "Global Markets and Britain's Rise",
              "summary": "Atlantic trade enriched Europe, and Britain's navy, banking, and colonies made it the leading power.",
              "points": [
                "Atlantic economy",
                "Bank of England",
                "Seven Years' War"
              ],
              "aliases": [
                "britains ascendancy"
              ]
            },
            {
              "slug": "the-french-revolution",
              "title": "The French Revolution",
              "summary": "The Revolution moved from constitutional monarchy to republic to Terror.",
              "aliases": [
                "french revolution",
                "reign of terror"
              ]
            },
            {
              "slug": "napoleon",
              "title": "Napoleon",
              "summary": "Napoleon spread revolutionary reforms through conquest until his defeat in 1815.",
              "aliases": [
                "napoleon",
                "napoleonic code"
              ]
            },
            {
              "slug": "the-congress-of-vienna-and-romanticism",
              "title": "The Congress of Vienna and Romanticism",
              "summary": "The Congress of Vienna restored conservative order after Napoleon, while Romanticism prized emotion, nature, and nation.",
              "points": [
                "Metternich",
                "Balance of power restored",
                "Romanticism"
              ],
              "aliases": [
                "congress of vienna",
                "romanticism"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "industrialization-and-its-effects",
      "title": "Industrialization and Its Effects",
      "summary": "The Industrial Revolution and the ideologies it produced.",
      "concepts": [
        {
          "title": "Industrialization and Its Effects",
          "topics": [
            {
              "slug": "the-industrial-revolution-in-europe",
              "title": "The Industrial Revolution in Europe",
              "summary": "Industry spread from Britain across Europe, remaking cities and class structure.",
              "aliases": [
                "industrial revolution"
              ]
            },
            {
              "slug": "social-effects-of-industrialization",
              "title": "Social Effects of Industrialization",
              "summary": "Cities grew fast, a working class and middle class formed, and living conditions sparked reform.",
              "points": [
                "Urbanization",
                "Working and middle classes",
                "Public health reform"
              ],
              "aliases": [
                "social effects of industrialization"
              ]
            },
            {
              "slug": "conservatism-and-the-revolutions-of-1848",
              "title": "Conservatism and the Revolutions of 1848",
              "summary": "Conservatives tried to hold back liberal and nationalist movements, which erupted across Europe in 1848.",
              "points": [
                "Concert of Europe",
                "Revolutions of 1848",
                "Liberalism vs. conservatism"
              ],
              "aliases": [
                "revolutions of 1848"
              ]
            },
            {
              "slug": "19th-century-ideologies",
              "title": "19th-Century Ideologies",
              "summary": "Liberalism, conservatism, nationalism, and socialism competed after 1815.",
              "aliases": [
                "liberalism",
                "socialism",
                "marxism",
                "nationalism"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "19th-century-perspectives-and-political-developments",
      "title": "19th-Century Perspectives and Political Developments",
      "summary": "Nationalism, unification, new science, and imperialism.",
      "concepts": [
        {
          "title": "19th-Century Perspectives and Political Developments",
          "topics": [
            {
              "slug": "italian-and-german-unification",
              "title": "Italian and German Unification",
              "summary": "Cavour and Bismarck used diplomacy and war to unify Italy and Germany.",
              "aliases": [
                "german unification",
                "bismarck",
                "italian unification"
              ]
            },
            {
              "slug": "darwinism-modernity-and-new-science",
              "title": "Darwinism, Modernity, and New Science",
              "summary": "Darwin, Freud, and Einstein challenged old certainties; Social Darwinism was used to justify racism and empire.",
              "points": [
                "Darwin and Social Darwinism",
                "Freud",
                "Modern art and science"
              ],
              "aliases": [
                "social darwinism",
                "modernity"
              ]
            },
            {
              "slug": "new-imperialism",
              "title": "New Imperialism",
              "summary": "European powers scrambled for Africa and Asia, driven by economics, nationalism, and racial ideology.",
              "aliases": [
                "imperialism",
                "scramble for africa"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "20th-century-global-conflicts",
      "title": "20th-Century Global Conflicts",
      "summary": "World wars, revolution, and totalitarianism.",
      "concepts": [
        {
          "title": "20th-Century Global Conflicts",
          "topics": [
            {
              "slug": "world-war-i-and-the-russian-revolution",
              "title": "World War I and the Russian Revolution",
              "summary": "Total war toppled empires, and the Bolsheviks seized power in Russia.",
              "aliases": [
                "world war 1",
                "russian revolution"
              ]
            },
            {
              "slug": "versailles-and-the-interwar-crisis",
              "title": "Versailles and the Interwar Crisis",
              "summary": "The Treaty of Versailles and the Great Depression left Europe unstable and open to extremist movements.",
              "points": [
                "Treaty of Versailles",
                "Weimar Germany",
                "The Great Depression in Europe"
              ],
              "aliases": [
                "treaty of versailles",
                "weimar republic"
              ]
            },
            {
              "slug": "fascism-totalitarianism-and-world-war-ii",
              "title": "Fascism, Totalitarianism, and World War II",
              "summary": "Mussolini, Hitler, and Stalin built totalitarian states, and World War II and the Holocaust followed.",
              "aliases": [
                "fascism",
                "nazi germany",
                "holocaust",
                "world war 2"
              ]
            },
            {
              "slug": "the-holocaust",
              "title": "The Holocaust",
              "summary": "Nazi Germany systematically murdered six million Jews and millions of others in a state-organized genocide.",
              "points": [
                "Nuremberg Laws",
                "The Final Solution",
                "Resistance and complicity"
              ],
              "aliases": [
                "holocaust"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "cold-war-and-contemporary-europe",
      "title": "Cold War and Contemporary Europe",
      "summary": "A divided Europe, its reunion, and today's challenges.",
      "concepts": [
        {
          "title": "Cold War and Contemporary Europe",
          "topics": [
            {
              "slug": "the-cold-war-in-europe",
              "title": "The Cold War in Europe",
              "summary": "Europe split into blocs until the Soviet Union collapsed.",
              "aliases": [
                "cold war europe",
                "iron curtain"
              ]
            },
            {
              "slug": "the-fall-of-communism",
              "title": "The Fall of Communism",
              "summary": "Reform movements like Solidarity and Gorbachev's openness led to the fall of the Berlin Wall and the end of Soviet control.",
              "points": [
                "Solidarity",
                "Glasnost and perestroika",
                "1989 revolutions"
              ],
              "aliases": [
                "fall of communism",
                "fall of the berlin wall"
              ]
            },
            {
              "slug": "european-integration-and-decolonization",
              "title": "European Integration and Decolonization",
              "summary": "Europe built the European Union while its empires dissolved.",
              "aliases": [
                "european union",
                "decolonization"
              ]
            },
            {
              "slug": "migration-technology-and-globalization",
              "title": "Migration, Technology, and Globalization",
              "summary": "Immigration, new technology, and globalization reshaped European society and politics after 1945.",
              "points": [
                "Postwar migration",
                "Welfare states",
                "Globalization debates"
              ],
              "aliases": [
                "migration europe"
              ]
            }
          ]
        }
      ]
    }
  ]
};
