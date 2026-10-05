import type { CourseSpec } from "../spec";

/**
 * AP Art History, following the College Board Course and Exam Description (units and topics in CED order).
 */
export const artHistory: CourseSpec = {
  "course": {
    "slug": "ap-art-history",
    "title": "AP Art History",
    "shortTitle": "AP Art History",
    "exam": "AP",
    "category": "Arts",
    "description": "250 required works of art and architecture across ten content areas, from prehistory to the present.",
    "hue": 320,
    "examMonth": "May",
    "query": "AP Art History",
    "keywords": [
      "ap art history",
      "art history",
      "apah"
    ]
  },
  "units": [
    {
      "slug": "global-prehistory",
      "title": "Unit 1: Global Prehistory (30,000–500 BCE)",
      "summary": "The earliest art, from cave paintings to megaliths.",
      "concepts": [
        {
          "title": "Unit 1: Global Prehistory (30,000–500 BCE)",
          "topics": [
            {
              "slug": "global-prehistory",
              "title": "Global Prehistory",
              "summary": "Cave paintings, Stonehenge, and early sculpture show humanity's first art.",
              "aliases": [
                "prehistoric art",
                "lascaux"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "ancient-mediterranean",
      "title": "Unit 2: Ancient Mediterranean (3500 BCE–300 CE)",
      "summary": "The Near East, Egypt, Greece, Etruria, and Rome.",
      "concepts": [
        {
          "title": "Unit 2: Ancient Mediterranean (3500 BCE–300 CE)",
          "topics": [
            {
              "slug": "ancient-near-east-and-egypt",
              "title": "Ancient Near East and Egypt",
              "summary": "Art served kings and gods, from the Standard of Ur to the pyramids.",
              "aliases": [
                "egyptian art",
                "ancient near east"
              ]
            },
            {
              "slug": "greek-etruscan-and-roman-art",
              "title": "Greek, Etruscan, and Roman Art",
              "summary": "Classical ideals of proportion and naturalism shaped Western art.",
              "aliases": [
                "greek art",
                "roman art",
                "parthenon"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "early-europe-and-colonial-americas",
      "title": "Unit 3: Early Europe and Colonial Americas (200–1750 CE)",
      "summary": "Medieval, Renaissance, and Baroque art.",
      "concepts": [
        {
          "title": "Unit 3: Early Europe and Colonial Americas (200–1750 CE)",
          "topics": [
            {
              "slug": "medieval-art",
              "title": "Medieval Art",
              "summary": "Byzantine mosaics, Romanesque churches, and Gothic cathedrals expressed faith.",
              "aliases": [
                "gothic cathedrals",
                "byzantine art"
              ]
            },
            {
              "slug": "renaissance-and-baroque-art",
              "title": "Renaissance and Baroque Art",
              "summary": "Linear perspective, humanism, and drama transformed European painting and sculpture.",
              "aliases": [
                "renaissance art",
                "baroque art",
                "michelangelo"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "later-europe-and-americas",
      "title": "Unit 4: Later Europe and Americas (1750–1980 CE)",
      "summary": "Neoclassicism through Modernism.",
      "concepts": [
        {
          "title": "Unit 4: Later Europe and Americas (1750–1980 CE)",
          "topics": [
            {
              "slug": "18th-and-19th-century-art",
              "title": "18th- and 19th-Century Art",
              "summary": "Neoclassicism, Romanticism, Realism, and Impressionism answered revolution and industry.",
              "aliases": [
                "impressionism",
                "neoclassicism",
                "romanticism art"
              ]
            },
            {
              "slug": "modern-art",
              "title": "Modern Art",
              "summary": "Cubism, abstraction, and Surrealism broke with tradition.",
              "aliases": [
                "modern art",
                "cubism",
                "picasso"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "indigenous-americas",
      "title": "Unit 5: Indigenous Americas (1000 BCE–1980 CE)",
      "summary": "Art of the Indigenous peoples of the Americas.",
      "concepts": [
        {
          "title": "Unit 5: Indigenous Americas (1000 BCE–1980 CE)",
          "topics": [
            {
              "slug": "indigenous-americas",
              "title": "Indigenous Americas",
              "summary": "Mesoamerican, Andean, and North American works carried religious and political meaning.",
              "aliases": [
                "mesoamerican art",
                "aztec art",
                "inca"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "africa",
      "title": "Unit 6: Africa (1100–1980 CE)",
      "summary": "Art from across the African continent.",
      "concepts": [
        {
          "title": "Unit 6: Africa (1100–1980 CE)",
          "topics": [
            {
              "slug": "africa",
              "title": "Africa",
              "summary": "African art is often made to be used in ritual and performance.",
              "aliases": [
                "african art",
                "masks"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "west-and-central-asia",
      "title": "Unit 7: West and Central Asia (500 BCE–1980 CE)",
      "summary": "Islamic art and art of West and Central Asia.",
      "concepts": [
        {
          "title": "Unit 7: West and Central Asia (500 BCE–1980 CE)",
          "topics": [
            {
              "slug": "west-and-central-asia",
              "title": "West and Central Asia",
              "summary": "Islamic art and architecture emphasize pattern, calligraphy, and sacred space.",
              "aliases": [
                "islamic art",
                "dome of the rock"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "south-east-and-southeast-asia",
      "title": "Unit 8: South, East, and Southeast Asia (300 BCE–1980 CE)",
      "summary": "Buddhist, Hindu, Chinese, Japanese, and Korean art.",
      "concepts": [
        {
          "title": "Unit 8: South, East, and Southeast Asia (300 BCE–1980 CE)",
          "topics": [
            {
              "slug": "south-east-and-southeast-asia",
              "title": "South, East, and Southeast Asia",
              "summary": "Buddhist, Hindu, and Confucian traditions shaped Asian art and architecture.",
              "aliases": [
                "asian art",
                "buddhist art",
                "hindu art"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "the-pacific",
      "title": "Unit 9: The Pacific (700–1980 CE)",
      "summary": "Art of Oceania, Polynesia, and Australia.",
      "concepts": [
        {
          "title": "Unit 9: The Pacific (700–1980 CE)",
          "topics": [
            {
              "slug": "the-pacific",
              "title": "The Pacific",
              "summary": "Pacific art is tied to navigation, genealogy, and ceremony.",
              "aliases": [
                "pacific art",
                "oceania"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "global-contemporary",
      "title": "Unit 10: Global Contemporary (1980 CE–present)",
      "summary": "Art made since 1980 around the world.",
      "concepts": [
        {
          "title": "Unit 10: Global Contemporary (1980 CE–present)",
          "topics": [
            {
              "slug": "global-contemporary-art",
              "title": "Global Contemporary Art",
              "summary": "Artists since 1980 address identity, globalization, and technology.",
              "aliases": [
                "contemporary art"
              ]
            }
          ]
        }
      ]
    }
  ]
};
