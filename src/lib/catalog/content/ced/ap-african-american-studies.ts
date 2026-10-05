import type { CourseSpec } from "../spec";

/**
 * AP African American Studies, following the College Board Course and Exam Description (units and topics in CED order).
 */
export const afam: CourseSpec = {
  "course": {
    "slug": "ap-african-american-studies",
    "title": "AP African American Studies",
    "shortTitle": "AP AAS",
    "exam": "AP",
    "category": "History & Social Sciences",
    "description": "An interdisciplinary course on African American history, culture, and thought, from early African societies to the present.",
    "hue": 20,
    "examMonth": "May",
    "query": "AP African American Studies",
    "keywords": [
      "ap african american studies",
      "african american studies",
      "ap aas"
    ]
  },
  "units": [
    {
      "slug": "origins-of-the-african-diaspora",
      "title": "Origins of the African Diaspora",
      "summary": "Africa's societies, empires, and cultures before and during the slave trade.",
      "concepts": [
        {
          "title": "Origins of the African Diaspora",
          "topics": [
            {
              "slug": "what-is-african-american-studies",
              "title": "What Is African American Studies?",
              "summary": "An interdisciplinary field that studies the histories, cultures, and contributions of people of African descent.",
              "points": [
                "Interdisciplinary methods",
                "The African diaspora",
                "Sources and perspectives"
              ],
              "aliases": [
                "african american studies"
              ]
            },
            {
              "slug": "early-african-kingdoms-and-empires",
              "title": "Early African Kingdoms and Empires",
              "summary": "Mali, Songhai, Kongo, and other states were centers of trade, learning, and culture.",
              "aliases": [
                "mali empire",
                "songhai",
                "african kingdoms"
              ]
            },
            {
              "slug": "learning-traditions-and-kinship-in-africa",
              "title": "Learning Traditions and Kinship in Africa",
              "summary": "Timbuktu's scholars, griots, kinship systems, and the Kingdom of Kongo show Africa's intellectual and political diversity.",
              "points": [
                "Timbuktu and learning",
                "Kinship and leadership",
                "The Kingdom of Kongo"
              ],
              "aliases": [
                "timbuktu",
                "kingdom of kongo"
              ]
            },
            {
              "slug": "the-origins-of-the-transatlantic-slave-trade",
              "title": "The Origins of the Transatlantic Slave Trade",
              "summary": "European demand for labor turned the slave trade into a vast system of forced migration.",
              "aliases": [
                "transatlantic slave trade",
                "middle passage"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "freedom-enslavement-and-resistance",
      "title": "Freedom, Enslavement, and Resistance",
      "summary": "Enslavement in the Americas and the many forms of resistance.",
      "concepts": [
        {
          "title": "Freedom, Enslavement, and Resistance",
          "topics": [
            {
              "slug": "enslavement-in-the-americas",
              "title": "Enslavement in the Americas",
              "summary": "Enslaved people built families, cultures, and communities under brutal conditions.",
              "aliases": [
                "slavery in america"
              ]
            },
            {
              "slug": "creating-african-american-culture",
              "title": "Creating African American Culture",
              "summary": "Enslaved people built families, faith, music, and naming traditions that formed African American culture.",
              "points": [
                "Family and community",
                "Religion and music",
                "Identity and naming"
              ],
              "aliases": [
                "african american culture"
              ]
            },
            {
              "slug": "resistance-and-abolition",
              "title": "Resistance and Abolition",
              "summary": "Revolts, escapes, and abolitionist writing challenged slavery.",
              "aliases": [
                "abolitionists",
                "frederick douglass",
                "underground railroad",
                "slave revolts"
              ]
            },
            {
              "slug": "the-civil-war-and-black-communities",
              "title": "The Civil War and Black Communities",
              "summary": "Black soldiers and self-emancipating people helped win the Civil War and end slavery.",
              "points": [
                "Black soldiers",
                "Self-emancipation",
                "Juneteenth"
              ],
              "aliases": [
                "civil war black soldiers",
                "juneteenth"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "the-practice-of-freedom",
      "title": "The Practice of Freedom",
      "summary": "Reconstruction through the Harlem Renaissance.",
      "concepts": [
        {
          "title": "The Practice of Freedom",
          "topics": [
            {
              "slug": "reconstruction-and-jim-crow",
              "title": "Reconstruction and Jim Crow",
              "summary": "Emancipation brought new rights, then segregation and disenfranchisement rolled them back.",
              "aliases": [
                "reconstruction",
                "jim crow",
                "plessy v ferguson"
              ]
            },
            {
              "slug": "uplift-institutions-and-black-education",
              "title": "Uplift, Institutions, and Black Education",
              "summary": "Black women's clubs, churches, HBCUs, and organizations like the NAACP built institutions and fought for rights.",
              "points": [
                "Uplift ideologies",
                "HBCUs",
                "Du Bois and Washington"
              ],
              "aliases": [
                "hbcus",
                "naacp",
                "du bois"
              ]
            },
            {
              "slug": "the-great-migration-and-the-harlem-renaissance",
              "title": "The Great Migration and the Harlem Renaissance",
              "summary": "Millions moved north, and Black artists and thinkers transformed American culture.",
              "aliases": [
                "great migration",
                "harlem renaissance"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "movements-and-debates",
      "title": "Movements and Debates",
      "summary": "Civil rights, Black Power, and contemporary debates.",
      "concepts": [
        {
          "title": "Movements and Debates",
          "topics": [
            {
              "slug": "n-gritude-anticolonialism-and-wwii",
              "title": "Négritude, Anticolonialism, and WWII",
              "summary": "Black thinkers linked struggles across the diaspora, and the Double V campaign fought fascism abroad and racism at home.",
              "points": [
                "Négritude",
                "Pan-Africanism",
                "Double V campaign"
              ],
              "aliases": [
                "double v campaign",
                "negritude"
              ]
            },
            {
              "slug": "the-civil-rights-and-black-power-movements",
              "title": "The Civil Rights and Black Power Movements",
              "summary": "Nonviolent protest and Black Power pursued freedom by different strategies.",
              "aliases": [
                "civil rights movement",
                "black power",
                "mlk",
                "malcolm x"
              ]
            },
            {
              "slug": "black-feminism-and-intersectionality",
              "title": "Black Feminism and Intersectionality",
              "summary": "Black feminists and womanists showed how race, gender, and class interlock to shape experience.",
              "points": [
                "Black feminist thought",
                "Intersectionality",
                "The Combahee River Collective"
              ],
              "aliases": [
                "intersectionality",
                "black feminism"
              ]
            },
            {
              "slug": "contemporary-debates",
              "title": "Contemporary Debates",
              "summary": "Scholars and activists continue to debate reparations, intersectionality, and representation.",
              "aliases": [
                "intersectionality",
                "reparations"
              ]
            }
          ]
        }
      ]
    }
  ]
};
