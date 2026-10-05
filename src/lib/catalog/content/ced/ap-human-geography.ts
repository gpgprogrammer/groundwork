import type { CourseSpec } from "../spec";

/**
 * AP Human Geography, following the College Board Course and Exam Description (units and topics in CED order).
 */
export const humanGeo: CourseSpec = {
  "course": {
    "slug": "ap-human-geography",
    "title": "AP Human Geography",
    "shortTitle": "AP HuG",
    "exam": "AP",
    "category": "History & Social Sciences",
    "description": "How people shape and are shaped by place: population, culture, politics, agriculture, cities, and economic development.",
    "hue": 60,
    "examMonth": "May",
    "query": "AP Human Geography",
    "keywords": [
      "ap human geography",
      "human geography",
      "ap hug",
      "aphg",
      "human geo"
    ]
  },
  "units": [
    {
      "slug": "thinking-geographically",
      "title": "Thinking Geographically",
      "summary": "Maps, data, spatial concepts, and scale.",
      "concepts": [
        {
          "title": "Thinking Geographically",
          "topics": [
            {
              "slug": "maps-and-map-projections",
              "title": "Maps and Map Projections",
              "summary": "Every projection distorts shape, area, distance, or direction.",
              "aliases": [
                "map projections",
                "mercator"
              ]
            },
            {
              "slug": "geographic-data",
              "title": "Geographic Data",
              "summary": "Geographers collect data from fieldwork, census data, satellites, and GIS to study patterns and make decisions.",
              "points": [
                "GIS and remote sensing",
                "Field observation",
                "Using data for decisions"
              ],
              "aliases": [
                "gis",
                "geographic data"
              ]
            },
            {
              "slug": "spatial-concepts-and-scale",
              "title": "Spatial Concepts and Scale",
              "summary": "Location, place, distance decay, and scale of analysis organize geographic thinking.",
              "aliases": [
                "distance decay",
                "scale of analysis"
              ]
            },
            {
              "slug": "human-environment-interaction-and-regions",
              "title": "Human–Environment Interaction and Regions",
              "summary": "Environmental determinism and possibilism describe how people and environments shape each other; regions can be formal, functional, or perceptual.",
              "points": [
                "Determinism vs. possibilism",
                "Formal, functional, perceptual regions",
                "Sustainability"
              ],
              "aliases": [
                "possibilism",
                "types of regions"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "population-and-migration-patterns-and-processes",
      "title": "Population and Migration Patterns and Processes",
      "summary": "Population distribution, change, and migration.",
      "concepts": [
        {
          "title": "Population and Migration Patterns and Processes",
          "topics": [
            {
              "slug": "population-distribution-and-density",
              "title": "Population Distribution and Density",
              "summary": "People cluster where land and climate allow; arithmetic, physiological, and agricultural density measure crowding differently.",
              "points": [
                "Types of density",
                "Factors in distribution",
                "Carrying capacity"
              ],
              "aliases": [
                "population density",
                "physiological density"
              ]
            },
            {
              "slug": "population-pyramids-and-the-demographic-transition-model",
              "title": "Population Pyramids and the Demographic Transition Model",
              "summary": "Age-sex pyramids and the DTM show how birth and death rates change as countries develop.",
              "aliases": [
                "demographic transition model",
                "population pyramids",
                "DTM"
              ]
            },
            {
              "slug": "malthus-and-population-policies",
              "title": "Malthus and Population Policies",
              "summary": "Malthus predicted population would outrun food; countries use pro- and antinatalist policies.",
              "aliases": [
                "malthus",
                "antinatalist",
                "pronatalist"
              ]
            },
            {
              "slug": "women-aging-and-demographic-change",
              "title": "Women, Aging, and Demographic Change",
              "summary": "Women's education and work lower fertility; aging populations strain workforces and pensions.",
              "points": [
                "Women and fertility",
                "Aging populations",
                "Dependency ratios"
              ],
              "aliases": [
                "aging population"
              ]
            },
            {
              "slug": "migration-patterns",
              "title": "Migration Patterns",
              "summary": "Push and pull factors, Ravenstein's laws, and forced migration explain why people move.",
              "aliases": [
                "push pull factors",
                "ravenstein",
                "refugees"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "cultural-patterns-and-processes",
      "title": "Cultural Patterns and Processes",
      "summary": "Culture, cultural landscapes, and diffusion.",
      "concepts": [
        {
          "title": "Cultural Patterns and Processes",
          "topics": [
            {
              "slug": "culture-and-cultural-landscapes",
              "title": "Culture and Cultural Landscapes",
              "summary": "Cultural landscapes show a group's values in buildings, land use, and religious sites.",
              "points": [
                "Cultural traits and landscapes",
                "Sequent occupance",
                "Attitudes toward gender"
              ],
              "aliases": [
                "cultural landscape"
              ]
            },
            {
              "slug": "cultural-diffusion",
              "title": "Cultural Diffusion",
              "summary": "Relocation, hierarchical, contagious, and stimulus diffusion spread cultural traits.",
              "aliases": [
                "diffusion types",
                "cultural diffusion"
              ]
            },
            {
              "slug": "languages-and-religions",
              "title": "Languages and Religions",
              "summary": "Language families and universalizing versus ethnic religions spread in different patterns.",
              "aliases": [
                "language families",
                "universalizing religions"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "political-patterns-and-processes",
      "title": "Political Patterns and Processes",
      "summary": "States, boundaries, and governance.",
      "concepts": [
        {
          "title": "Political Patterns and Processes",
          "topics": [
            {
              "slug": "states-nations-and-nation-states",
              "title": "States, Nations, and Nation-States",
              "summary": "A nation is a people and a state is a political unit; a nation-state is where they coincide.",
              "aliases": [
                "nation state",
                "stateless nation"
              ]
            },
            {
              "slug": "boundaries-and-gerrymandering",
              "title": "Boundaries and Gerrymandering",
              "summary": "Boundaries are drawn by geometry, physical features, or culture, and districts can be gerrymandered.",
              "aliases": [
                "gerrymandering",
                "boundary types"
              ]
            },
            {
              "slug": "forms-of-governance",
              "title": "Forms of Governance",
              "summary": "Unitary and federal states divide power differently, which shapes how they respond to regional demands.",
              "points": [
                "Unitary vs. federal",
                "Territoriality",
                "Colonialism and imperialism"
              ],
              "aliases": [
                "unitary federal states"
              ]
            },
            {
              "slug": "devolution-and-supranationalism",
              "title": "Devolution and Supranationalism",
              "summary": "Power flows down to regions or up to organizations like the EU.",
              "aliases": [
                "devolution",
                "supranationalism"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "agriculture-and-rural-land-use-patterns-and-processes",
      "title": "Agriculture and Rural Land-Use Patterns and Processes",
      "summary": "Agricultural origins, revolutions, and systems.",
      "concepts": [
        {
          "title": "Agriculture and Rural Land-Use Patterns and Processes",
          "topics": [
            {
              "slug": "agricultural-revolutions",
              "title": "Agricultural Revolutions",
              "summary": "The Neolithic, Second Agricultural, and Green Revolutions changed how food is produced.",
              "aliases": [
                "green revolution",
                "neolithic revolution"
              ]
            },
            {
              "slug": "agriculture-and-the-environment",
              "title": "Agriculture and the Environment",
              "summary": "Climate and environment shape farming practices; settlement and survey patterns organize rural land.",
              "points": [
                "Intensive vs. extensive",
                "Rural settlement patterns",
                "Survey methods"
              ],
              "aliases": [
                "rural settlement"
              ]
            },
            {
              "slug": "commercial-and-subsistence-agriculture",
              "title": "Commercial and Subsistence Agriculture",
              "summary": "Intensive and extensive practices vary by climate, land, and market access.",
              "aliases": [
                "subsistence farming",
                "commercial agriculture"
              ]
            },
            {
              "slug": "the-von-thunen-model",
              "title": "The von Thünen Model",
              "summary": "Von Thünen's rings predict farm land use based on distance to market.",
              "aliases": [
                "von thunen"
              ]
            },
            {
              "slug": "global-agriculture-and-its-challenges",
              "title": "Global Agriculture and Its Challenges",
              "summary": "Global supply chains, GMOs, food deserts, and sustainability debates shape modern agriculture.",
              "points": [
                "Global supply chains",
                "GMOs and organic farming",
                "Women in agriculture"
              ],
              "aliases": [
                "food deserts",
                "gmos"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "cities-and-urban-land-use-patterns-and-processes",
      "title": "Cities and Urban Land-Use Patterns and Processes",
      "summary": "Urbanization, city models, and urban challenges.",
      "concepts": [
        {
          "title": "Cities and Urban Land-Use Patterns and Processes",
          "topics": [
            {
              "slug": "urbanization-and-globalization",
              "title": "Urbanization and Globalization",
              "summary": "Cities grow from site and situation advantages; world cities and megacities connect the global economy.",
              "points": [
                "Site and situation",
                "World cities",
                "Megacities"
              ],
              "aliases": [
                "urbanization",
                "world cities"
              ]
            },
            {
              "slug": "central-place-theory-and-urban-hierarchies",
              "title": "Central Place Theory and Urban Hierarchies",
              "summary": "Cities' size and spacing reflect the range and threshold of their services.",
              "aliases": [
                "central place theory",
                "rank size rule",
                "primate city"
              ]
            },
            {
              "slug": "urban-models",
              "title": "Urban Models",
              "summary": "The Burgess, Hoyt, multiple-nuclei, and Latin American models describe city structure.",
              "aliases": [
                "concentric zone model",
                "sector model",
                "urban models"
              ]
            },
            {
              "slug": "density-land-use-and-infrastructure",
              "title": "Density, Land Use, and Infrastructure",
              "summary": "Zoning, density, and infrastructure shape how cities work and who lives where.",
              "points": [
                "Zoning",
                "Infrastructure",
                "Urban data"
              ],
              "aliases": [
                "zoning",
                "urban infrastructure"
              ]
            },
            {
              "slug": "urban-challenges-and-sustainability",
              "title": "Urban Challenges and Sustainability",
              "summary": "Sprawl, gentrification, and squatter settlements challenge city planners.",
              "aliases": [
                "gentrification",
                "urban sprawl",
                "smart growth"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "industrial-and-economic-development-patterns-and-processes",
      "title": "Industrial and Economic Development Patterns and Processes",
      "summary": "Industrialization, development measures, and the world economy.",
      "concepts": [
        {
          "title": "Industrial and Economic Development Patterns and Processes",
          "topics": [
            {
              "slug": "industrialization-and-globalization",
              "title": "Industrialization and Globalization",
              "summary": "Weber's model, outsourcing, and special economic zones shape where industry locates.",
              "aliases": [
                "weber least cost",
                "outsourcing",
                "special economic zones"
              ]
            },
            {
              "slug": "economic-sectors",
              "title": "Economic Sectors",
              "summary": "Economies shift from primary (raw materials) to secondary (manufacturing) to tertiary and beyond (services) as they develop.",
              "points": [
                "Primary through quinary sectors",
                "Location theory",
                "Weber's model"
              ],
              "aliases": [
                "economic sectors",
                "weber least cost"
              ]
            },
            {
              "slug": "measures-of-development",
              "title": "Measures of Development",
              "summary": "GDP per capita, the HDI, and the GII capture different sides of development.",
              "aliases": [
                "HDI",
                "GII",
                "development indicators"
              ]
            },
            {
              "slug": "women-and-development",
              "title": "Women and Development",
              "summary": "Gender inequality measures and women's access to education and work shape development.",
              "points": [
                "Gender Inequality Index",
                "Microloans",
                "Women in the workforce"
              ],
              "aliases": [
                "gender inequality index"
              ]
            },
            {
              "slug": "development-theories",
              "title": "Development Theories",
              "summary": "Rostow's stages and Wallerstein's world-systems theory explain uneven development.",
              "aliases": [
                "rostow",
                "world systems theory",
                "core periphery"
              ]
            },
            {
              "slug": "sustainable-development",
              "title": "Sustainable Development",
              "summary": "Development that meets today's needs without harming the future: renewable energy, ecotourism, and the UN goals.",
              "points": [
                "Sustainable Development Goals",
                "Ecotourism",
                "Environmental costs of growth"
              ],
              "aliases": [
                "sustainable development"
              ]
            }
          ]
        }
      ]
    }
  ]
};
