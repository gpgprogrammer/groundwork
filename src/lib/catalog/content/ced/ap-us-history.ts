import type { CourseSpec } from "../spec";

/**
 * AP United States History, following the College Board Course and Exam Description (units and topics in CED order).
 */
export const apush: CourseSpec = {
  "course": {
    "slug": "ap-us-history",
    "title": "AP United States History",
    "shortTitle": "APUSH",
    "exam": "AP",
    "category": "History & Social Sciences",
    "description": "American history from 1491 to the present across nine periods, with the causation, comparison, and argument skills the DBQ and LEQ demand.",
    "hue": 0,
    "examMonth": "May",
    "query": "APUSH",
    "keywords": [
      "apush",
      "ap us history",
      "us history",
      "american history",
      "ap united states history"
    ]
  },
  "units": [
    {
      "slug": "period-1-1491-1607",
      "title": "Period 1: 1491–1607",
      "summary": "Native societies and European contact.",
      "concepts": [
        {
          "title": "Period 1: 1491–1607",
          "topics": [
            {
              "slug": "native-american-societies-before-contact",
              "title": "Native American Societies Before Contact",
              "summary": "Native societies adapted to their environments, from maize cultivation in the Southwest to mobile hunting on the Plains.",
              "aliases": [
                "native americans"
              ]
            },
            {
              "slug": "european-exploration-and-the-columbian-exchange",
              "title": "European Exploration and the Columbian Exchange",
              "summary": "Spanish conquest and the Columbian Exchange transformed both hemispheres.",
              "aliases": [
                "columbian exchange",
                "encomienda",
                "spanish conquest"
              ]
            },
            {
              "slug": "labor-and-caste-in-the-spanish-colonies",
              "title": "Labor and Caste in the Spanish Colonies",
              "summary": "The Spanish used encomienda and enslaved Africans, and built a casta system ranking people by ancestry.",
              "points": [
                "Encomienda",
                "The casta system",
                "Debates over Native rights"
              ],
              "aliases": [
                "encomienda",
                "casta system"
              ]
            },
            {
              "slug": "cultural-interactions-in-the-americas",
              "title": "Cultural Interactions in the Americas",
              "summary": "Europeans, Native Americans, and Africans traded, fought, and adapted, reshaping all three cultures.",
              "points": [
                "Conversion efforts",
                "Resistance",
                "Cultural blending"
              ],
              "aliases": [
                "cultural interactions"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "period-2-1607-1754",
      "title": "Period 2: 1607–1754",
      "summary": "Colonial societies, trade, and slavery.",
      "concepts": [
        {
          "title": "Period 2: 1607–1754",
          "topics": [
            {
              "slug": "european-colonization",
              "title": "European Colonization",
              "summary": "Spain, France, the Netherlands, and Britain colonized North America with different goals and relationships with Native peoples.",
              "points": [
                "French fur trade",
                "Dutch New Netherland",
                "Spanish missions"
              ],
              "aliases": [
                "european colonization"
              ]
            },
            {
              "slug": "comparing-the-colonial-regions",
              "title": "Comparing the Colonial Regions",
              "summary": "The Chesapeake, New England, Middle, and Southern colonies differed in economy, religion, and labor.",
              "aliases": [
                "chesapeake colonies",
                "new england colonies",
                "middle colonies"
              ]
            },
            {
              "slug": "mercantilism-and-colonial-labor",
              "title": "Mercantilism and Colonial Labor",
              "summary": "Britain's mercantilist system shaped trade, while indentured servitude gave way to slavery.",
              "aliases": [
                "mercantilism",
                "indentured servants",
                "triangular trade"
              ]
            },
            {
              "slug": "native-americans-and-europeans",
              "title": "Native Americans and Europeans",
              "summary": "Conflicts like Metacom's War and the Pueblo Revolt, and alliances in the fur trade, shaped colonial America.",
              "points": [
                "Metacom's War",
                "Pueblo Revolt",
                "Trade alliances"
              ],
              "aliases": [
                "metacoms war",
                "pueblo revolt"
              ]
            },
            {
              "slug": "slavery-in-the-british-colonies",
              "title": "Slavery in the British Colonies",
              "summary": "Chattel slavery became hereditary and race-based, especially in the Chesapeake and Caribbean, and enslaved people resisted.",
              "points": [
                "Slave codes",
                "The Middle Passage",
                "Stono Rebellion"
              ],
              "aliases": [
                "slavery in the colonies",
                "stono rebellion"
              ]
            },
            {
              "slug": "the-great-awakening-and-the-enlightenment",
              "title": "The Great Awakening and the Enlightenment",
              "summary": "Religious revival and Enlightenment ideas challenged colonial authority.",
              "aliases": [
                "great awakening"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "period-3-1754-1800",
      "title": "Period 3: 1754–1800",
      "summary": "Revolution, the Constitution, and the new republic.",
      "concepts": [
        {
          "title": "Period 3: 1754–1800",
          "topics": [
            {
              "slug": "the-french-and-indian-war",
              "title": "The French and Indian War",
              "summary": "Britain's victory left debt and new taxes that strained colonial loyalty.",
              "aliases": [
                "seven years war",
                "french and indian war"
              ]
            },
            {
              "slug": "road-to-the-american-revolution",
              "title": "Road to the American Revolution",
              "summary": "The Stamp Act, Townshend Acts, and Intolerable Acts pushed colonists from protest to independence.",
              "aliases": [
                "stamp act",
                "causes of the american revolution"
              ]
            },
            {
              "slug": "the-american-revolution",
              "title": "The American Revolution",
              "summary": "With French help and colonial persistence, the Patriots won independence; Loyalists, women, and enslaved people experienced the war differently.",
              "points": [
                "Patriots vs. Loyalists",
                "The French alliance",
                "Revolutionary ideals"
              ],
              "aliases": [
                "american revolution"
              ]
            },
            {
              "slug": "the-articles-of-confederation-and-the-constitution",
              "title": "The Articles of Confederation and the Constitution",
              "summary": "A weak confederation led to the Constitutional Convention and compromises over representation and slavery.",
              "aliases": [
                "articles of confederation",
                "constitutional convention",
                "federalists anti-federalists"
              ]
            },
            {
              "slug": "the-early-republic",
              "title": "The Early Republic",
              "summary": "Washington and Adams faced debates over the national bank, foreign policy, and the first party system.",
              "aliases": [
                "hamilton jefferson",
                "first party system",
                "alien and sedition acts"
              ]
            },
            {
              "slug": "american-identity-and-movement-west",
              "title": "American Identity and Movement West",
              "summary": "Americans built a national identity while settlers moved west, clashing with Native nations over land.",
              "points": [
                "Northwest Ordinance",
                "Western migration",
                "Native resistance"
              ],
              "aliases": [
                "northwest ordinance"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "period-4-1800-1848",
      "title": "Period 4: 1800–1848",
      "summary": "Democracy, markets, and reform.",
      "concepts": [
        {
          "title": "Period 4: 1800–1848",
          "topics": [
            {
              "slug": "jeffersonian-and-jacksonian-democracy",
              "title": "Jeffersonian and Jacksonian Democracy",
              "summary": "Voting expanded to more white men while Jackson's presidency reshaped federal power.",
              "aliases": [
                "jacksonian democracy",
                "trail of tears",
                "indian removal"
              ]
            },
            {
              "slug": "america-on-the-world-stage",
              "title": "America on the World Stage",
              "summary": "The Louisiana Purchase, the War of 1812, and the Monroe Doctrine expanded U.S. power and territory.",
              "points": [
                "Louisiana Purchase",
                "War of 1812",
                "Monroe Doctrine"
              ],
              "aliases": [
                "war of 1812",
                "monroe doctrine",
                "louisiana purchase"
              ]
            },
            {
              "slug": "the-market-revolution",
              "title": "The Market Revolution",
              "summary": "Canals, railroads, and factories connected regional economies and changed work.",
              "aliases": [
                "market revolution",
                "industrialization"
              ]
            },
            {
              "slug": "second-great-awakening-and-reform-movements",
              "title": "Second Great Awakening and Reform Movements",
              "summary": "Religious revival fueled abolition, temperance, and women's rights.",
              "aliases": [
                "second great awakening",
                "abolition",
                "seneca falls"
              ]
            },
            {
              "slug": "african-americans-and-the-south-in-the-early-republic",
              "title": "African Americans and the South in the Early Republic",
              "summary": "Slavery expanded with cotton while free and enslaved African Americans resisted through revolts, churches, and abolitionism.",
              "points": [
                "King Cotton",
                "Nat Turner's rebellion",
                "Free Black communities"
              ],
              "aliases": [
                "slavery and cotton",
                "nat turner"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "period-5-1844-1877",
      "title": "Period 5: 1844–1877",
      "summary": "Expansion, sectional crisis, Civil War, and Reconstruction.",
      "concepts": [
        {
          "title": "Period 5: 1844–1877",
          "topics": [
            {
              "slug": "manifest-destiny-and-the-mexican-american-war",
              "title": "Manifest Destiny and the Mexican-American War",
              "summary": "Expansion west raised the question of whether new territories would allow slavery.",
              "aliases": [
                "manifest destiny",
                "mexican american war"
              ]
            },
            {
              "slug": "sectional-crisis",
              "title": "Sectional Crisis",
              "summary": "The Compromise of 1850, Kansas-Nebraska Act, and Dred Scott decision pulled the Union apart.",
              "aliases": [
                "compromise of 1850",
                "kansas nebraska act",
                "dred scott"
              ]
            },
            {
              "slug": "the-civil-war",
              "title": "The Civil War",
              "summary": "The war shifted from preserving the Union to ending slavery.",
              "aliases": [
                "civil war",
                "emancipation proclamation"
              ]
            },
            {
              "slug": "reconstruction",
              "title": "Reconstruction",
              "summary": "The 13th, 14th, and 15th Amendments promised rights that Reconstruction's end left unenforced.",
              "aliases": [
                "reconstruction",
                "14th amendment",
                "jim crow"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "period-6-1865-1898",
      "title": "Period 6: 1865–1898",
      "summary": "Industrial capitalism, immigration, and the West.",
      "concepts": [
        {
          "title": "Period 6: 1865–1898",
          "topics": [
            {
              "slug": "industrialization-and-the-gilded-age",
              "title": "Industrialization and the Gilded Age",
              "summary": "Big business, railroads, and new technology created enormous wealth and inequality.",
              "aliases": [
                "gilded age",
                "robber barons"
              ]
            },
            {
              "slug": "the-new-south",
              "title": "The New South",
              "summary": "After Reconstruction, Southern leaders promoted industry while sharecropping and Jim Crow kept most Black Southerners poor and disenfranchised.",
              "points": [
                "Sharecropping",
                "Jim Crow laws",
                "Plessy v. Ferguson"
              ],
              "aliases": [
                "new south",
                "jim crow",
                "sharecropping"
              ]
            },
            {
              "slug": "immigration-urbanization-and-labor",
              "title": "Immigration, Urbanization, and Labor",
              "summary": "Immigrants filled growing cities and factories, and workers organized unions.",
              "aliases": [
                "immigration",
                "labor unions",
                "urbanization"
              ]
            },
            {
              "slug": "the-west-and-populism",
              "title": "The West and Populism",
              "summary": "Western settlement displaced Native nations, and struggling farmers built the Populist movement.",
              "aliases": [
                "populism",
                "dawes act",
                "western expansion"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "period-7-1890-1945",
      "title": "Period 7: 1890–1945",
      "summary": "Empire, reform, war, depression, and world war.",
      "concepts": [
        {
          "title": "Period 7: 1890–1945",
          "topics": [
            {
              "slug": "american-imperialism-and-world-war-i",
              "title": "American Imperialism and World War I",
              "summary": "The US became an overseas power and then entered World War I.",
              "aliases": [
                "spanish american war",
                "world war 1 us"
              ]
            },
            {
              "slug": "progressivism",
              "title": "Progressivism",
              "summary": "Progressives used journalism and government to tackle corruption and industrial abuses.",
              "aliases": [
                "progressive era",
                "muckrakers"
              ]
            },
            {
              "slug": "the-1920s",
              "title": "The 1920s",
              "summary": "Consumer culture, the Harlem Renaissance, and nativism defined the decade.",
              "aliases": [
                "roaring twenties",
                "harlem renaissance"
              ]
            },
            {
              "slug": "the-great-depression-and-the-new-deal",
              "title": "The Great Depression and the New Deal",
              "summary": "The New Deal expanded government's role in the economy through relief, recovery, and reform.",
              "aliases": [
                "great depression",
                "new deal",
                "fdr"
              ]
            },
            {
              "slug": "interwar-foreign-policy-and-wwii",
              "title": "Interwar Foreign Policy and WWII",
              "summary": "After isolationism in the 1930s, the U.S. entered World War II, mobilized its economy, and emerged as a superpower.",
              "points": [
                "Neutrality Acts",
                "Pearl Harbor",
                "Postwar diplomacy"
              ],
              "aliases": [
                "world war ii",
                "isolationism"
              ]
            },
            {
              "slug": "world-war-ii-on-the-home-front",
              "title": "World War II on the Home Front",
              "summary": "The war ended the Depression, moved women into factories, and interned Japanese Americans.",
              "aliases": [
                "world war 2 home front",
                "japanese internment"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "period-8-1945-1980",
      "title": "Period 8: 1945–1980",
      "summary": "The Cold War, civil rights, and social change.",
      "concepts": [
        {
          "title": "Period 8: 1945–1980",
          "topics": [
            {
              "slug": "the-cold-war",
              "title": "The Cold War",
              "summary": "Containment shaped US policy from the Truman Doctrine to Korea and Vietnam.",
              "aliases": [
                "cold war",
                "containment",
                "vietnam war"
              ]
            },
            {
              "slug": "the-red-scare-and-postwar-culture",
              "title": "The Red Scare and Postwar Culture",
              "summary": "Fear of communism fueled McCarthyism, while suburbs, consumerism, and the baby boom reshaped American life.",
              "points": [
                "McCarthyism",
                "Suburbanization",
                "Conformity and its critics"
              ],
              "aliases": [
                "red scare",
                "mccarthyism",
                "suburbs"
              ]
            },
            {
              "slug": "the-civil-rights-movement",
              "title": "The Civil Rights Movement",
              "summary": "Legal challenges and nonviolent protest won the Civil Rights and Voting Rights Acts.",
              "aliases": [
                "civil rights movement",
                "brown v board",
                "voting rights act"
              ]
            },
            {
              "slug": "the-vietnam-war",
              "title": "The Vietnam War",
              "summary": "U.S. involvement in Vietnam escalated under containment and divided Americans at home.",
              "points": [
                "Gulf of Tonkin",
                "The antiwar movement",
                "Vietnamization"
              ],
              "aliases": [
                "vietnam war"
              ]
            },
            {
              "slug": "the-great-society-and-the-1960s",
              "title": "The Great Society and the 1960s",
              "summary": "Johnson's Great Society expanded social programs as counterculture and protest grew.",
              "aliases": [
                "great society",
                "counterculture"
              ]
            },
            {
              "slug": "the-environment-and-a-society-in-transition",
              "title": "The Environment and a Society in Transition",
              "summary": "The 1970s brought environmental laws, Watergate, energy crises, and new movements for women's and gay rights.",
              "points": [
                "EPA and Clean Air Act",
                "Watergate",
                "The 1970s economy"
              ],
              "aliases": [
                "watergate",
                "environmental movement"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "period-9-1980-present",
      "title": "Period 9: 1980–Present",
      "summary": "Conservatism, the end of the Cold War, and a changing nation.",
      "concepts": [
        {
          "title": "Period 9: 1980–Present",
          "topics": [
            {
              "slug": "the-rise-of-conservatism",
              "title": "The Rise of Conservatism",
              "summary": "Reagan's coalition cut taxes and regulation and pushed a stronger stand against the Soviet Union.",
              "aliases": [
                "reagan",
                "new right"
              ]
            },
            {
              "slug": "the-end-of-the-cold-war",
              "title": "The End of the Cold War",
              "summary": "Reagan's military buildup and Gorbachev's reforms led to arms deals, and the Soviet Union collapsed in 1991.",
              "points": [
                "Reagan Doctrine",
                "Gorbachev",
                "Fall of the USSR"
              ],
              "aliases": [
                "end of the cold war"
              ]
            },
            {
              "slug": "globalization-and-the-post-cold-war-world",
              "title": "Globalization and the Post-Cold War World",
              "summary": "The end of the Cold War, the digital economy, and 9/11 reshaped America's role in the world.",
              "aliases": [
                "globalization",
                "9 11",
                "war on terror"
              ]
            },
            {
              "slug": "challenges-of-the-21st-century",
              "title": "Challenges of the 21st Century",
              "summary": "9/11 and the War on Terror, new technology, immigration debates, and the 2008 recession shaped the new century.",
              "points": [
                "9/11 and the War on Terror",
                "The digital economy",
                "Immigration debates"
              ],
              "aliases": [
                "september 11",
                "war on terror"
              ]
            }
          ]
        }
      ]
    }
  ]
};
