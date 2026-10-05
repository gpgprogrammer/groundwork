import type { CourseSpec } from "../spec";

/**
 * AP Environmental Science, following the College Board Course and Exam Description (units and topics in CED order).
 */
export const apes: CourseSpec = {
  "course": {
    "slug": "ap-environmental-science",
    "title": "AP Environmental Science",
    "shortTitle": "APES",
    "exam": "AP",
    "category": "Sciences",
    "description": "Ecosystems, populations, resources, energy, pollution, and global change, with the math and data analysis the exam expects.",
    "hue": 110,
    "examMonth": "May",
    "query": "AP Environmental Science",
    "keywords": [
      "apes",
      "ap environmental science",
      "environmental science",
      "ap enviro",
      "enviro sci"
    ]
  },
  "units": [
    {
      "slug": "the-living-world-ecosystems",
      "title": "The Living World: Ecosystems",
      "summary": "Biomes, nutrient cycles, and energy flow.",
      "concepts": [
        {
          "title": "The Living World: Ecosystems",
          "topics": [
            {
              "slug": "ecosystem-interactions-and-biomes",
              "title": "Ecosystem Interactions and Biomes",
              "summary": "Terrestrial and aquatic biomes are shaped by climate, and species interact through predation, competition, and symbiosis.",
              "aliases": [
                "biomes",
                "symbiosis"
              ]
            },
            {
              "slug": "biogeochemical-cycles",
              "title": "Biogeochemical Cycles",
              "summary": "Carbon, nitrogen, phosphorus, and water cycle between living things and the environment.",
              "aliases": [
                "carbon cycle",
                "nitrogen cycle",
                "phosphorus cycle"
              ]
            },
            {
              "slug": "primary-productivity",
              "title": "Primary Productivity",
              "summary": "Primary productivity measures how fast producers capture energy; net productivity is what's left after respiration.",
              "points": [
                "Gross vs. net primary productivity",
                "Productivity by biome",
                "Measuring productivity"
              ],
              "aliases": [
                "primary productivity",
                "npp gpp"
              ]
            },
            {
              "slug": "energy-flow-and-the-10-rule",
              "title": "Energy Flow and the 10% Rule",
              "summary": "Only about 10% of energy passes up each trophic level, which limits food chain length.",
              "aliases": [
                "trophic levels",
                "food webs",
                "primary productivity"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "the-living-world-biodiversity",
      "title": "The Living World: Biodiversity",
      "summary": "Biodiversity, ecosystem services, and how ecosystems change.",
      "concepts": [
        {
          "title": "The Living World: Biodiversity",
          "topics": [
            {
              "slug": "biodiversity-and-ecosystem-services",
              "title": "Biodiversity and Ecosystem Services",
              "summary": "Genetic, species, and ecosystem diversity make ecosystems resilient and provide services people depend on.",
              "aliases": [
                "biodiversity",
                "ecosystem services"
              ]
            },
            {
              "slug": "island-biogeography-and-ecological-succession",
              "title": "Island Biogeography and Ecological Succession",
              "summary": "Island size and distance set species richness; succession rebuilds communities after disturbance.",
              "aliases": [
                "island biogeography",
                "ecological succession"
              ]
            },
            {
              "slug": "ecological-tolerance-and-natural-disruptions",
              "title": "Ecological Tolerance and Natural Disruptions",
              "summary": "Every species survives within a range of conditions; natural events like fires and droughts disrupt ecosystems and drive adaptation.",
              "points": [
                "Range of tolerance",
                "Natural disruptions",
                "Adaptation"
              ],
              "aliases": [
                "ecological tolerance"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "populations",
      "title": "Populations",
      "summary": "Population growth and human demography.",
      "concepts": [
        {
          "title": "Populations",
          "topics": [
            {
              "slug": "r-and-k-selected-species-and-survivorship",
              "title": "r- and K-Selected Species and Survivorship",
              "summary": "Species trade off many offspring with little care against few offspring with much care.",
              "aliases": [
                "r selected",
                "k selected",
                "survivorship curves"
              ]
            },
            {
              "slug": "population-growth-and-carrying-capacity",
              "title": "Population Growth and Carrying Capacity",
              "summary": "Populations grow exponentially until resources impose a carrying capacity.",
              "aliases": [
                "carrying capacity",
                "logistic growth"
              ]
            },
            {
              "slug": "age-structure-and-fertility",
              "title": "Age Structure and Fertility",
              "summary": "Age structure diagrams and total fertility rate predict how a country's population will change.",
              "points": [
                "Reading age structure diagrams",
                "Total fertility rate",
                "Rule of 70"
              ],
              "aliases": [
                "age structure diagrams",
                "total fertility rate"
              ]
            },
            {
              "slug": "human-population-dynamics",
              "title": "Human Population Dynamics",
              "summary": "Age structure diagrams and the demographic transition explain how human populations change.",
              "aliases": [
                "demographic transition",
                "age structure diagrams",
                "rule of 70"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "earth-systems-and-resources",
      "title": "Earth Systems and Resources",
      "summary": "Plate tectonics, soil, atmosphere, and climate.",
      "concepts": [
        {
          "title": "Earth Systems and Resources",
          "topics": [
            {
              "slug": "plate-tectonics-and-soil",
              "title": "Plate Tectonics and Soil",
              "summary": "Plate boundaries create earthquakes and volcanoes; soil forms slowly and erodes quickly.",
              "aliases": [
                "plate tectonics",
                "soil horizons"
              ]
            },
            {
              "slug": "atmosphere-weather-and-climate",
              "title": "Atmosphere, Weather, and Climate",
              "summary": "Uneven solar heating drives global wind patterns, rain shadows, and El Niño.",
              "aliases": [
                "atmospheric layers",
                "el nino",
                "rain shadow"
              ]
            },
            {
              "slug": "watersheds-and-el-ni-o",
              "title": "Watersheds and El Niño",
              "summary": "A watershed drains to one body of water; El Niño and La Niña shift ocean temperatures and weather worldwide.",
              "points": [
                "Watersheds",
                "El Niño–Southern Oscillation",
                "Effects on climate"
              ],
              "aliases": [
                "watersheds",
                "el nino la nina"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "land-and-water-use",
      "title": "Land and Water Use",
      "summary": "Agriculture, forestry, mining, urbanization, and sustainability.",
      "concepts": [
        {
          "title": "Land and Water Use",
          "topics": [
            {
              "slug": "tragedy-of-the-commons-and-sustainable-practices",
              "title": "Tragedy of the Commons and Sustainable Practices",
              "summary": "Shared resources get overused without rules; sustainable practices balance use and renewal.",
              "aliases": [
                "tragedy of the commons",
                "sustainable agriculture"
              ]
            },
            {
              "slug": "agriculture-and-the-green-revolution",
              "title": "Agriculture and the Green Revolution",
              "summary": "Industrial agriculture raised yields with fertilizer, irrigation, and monocultures at environmental cost.",
              "aliases": [
                "green revolution",
                "irrigation",
                "pesticides"
              ]
            },
            {
              "slug": "irrigation-pest-control-and-meat-production",
              "title": "Irrigation, Pest Control, and Meat Production",
              "summary": "Irrigation methods, pesticides, and industrial meat production raise yields but strain water, soil, and ecosystems.",
              "points": [
                "Drip vs. flood irrigation",
                "Pesticide resistance",
                "CAFOs vs. free range"
              ],
              "aliases": [
                "irrigation",
                "pest control",
                "cafo"
              ]
            },
            {
              "slug": "urbanization-mining-and-fishing",
              "title": "Urbanization, Mining, and Fishing",
              "summary": "Urban sprawl, mining, and overfishing reshape land and water ecosystems.",
              "aliases": [
                "urban sprawl",
                "overfishing",
                "mining"
              ]
            },
            {
              "slug": "sustainable-land-and-water-practices",
              "title": "Sustainable Land and Water Practices",
              "summary": "Integrated pest management, sustainable agriculture and forestry, and aquaculture reduce environmental harm.",
              "points": [
                "Integrated pest management",
                "Sustainable forestry",
                "Aquaculture"
              ],
              "aliases": [
                "sustainability",
                "integrated pest management"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "energy-resources-and-consumption",
      "title": "Energy Resources and Consumption",
      "summary": "Fossil fuels, nuclear, and renewable energy.",
      "concepts": [
        {
          "title": "Energy Resources and Consumption",
          "topics": [
            {
              "slug": "global-energy-consumption",
              "title": "Global Energy Consumption",
              "summary": "Energy use is rising worldwide; renewable and nonrenewable sources differ in availability and impact.",
              "points": [
                "Renewable vs. nonrenewable",
                "Energy use by country",
                "Fuel types"
              ],
              "aliases": [
                "energy consumption"
              ]
            },
            {
              "slug": "fossil-fuels",
              "title": "Fossil Fuels",
              "summary": "Coal, oil, and natural gas are energy-dense but release carbon dioxide and pollutants.",
              "aliases": [
                "fossil fuels",
                "fracking"
              ]
            },
            {
              "slug": "nuclear-power",
              "title": "Nuclear Power",
              "summary": "Fission produces power without CO₂ but leaves radioactive waste and accident risk.",
              "aliases": [
                "nuclear energy",
                "half life"
              ]
            },
            {
              "slug": "renewable-energy",
              "title": "Renewable Energy",
              "summary": "Solar, wind, hydroelectric, geothermal, and biomass each have benefits and tradeoffs.",
              "aliases": [
                "solar energy",
                "wind energy",
                "renewables"
              ]
            },
            {
              "slug": "energy-conservation",
              "title": "Energy Conservation",
              "summary": "Using less energy (efficient buildings, transportation, and appliances) is often the cheapest way to cut emissions.",
              "points": [
                "Efficiency at home",
                "Transportation",
                "Sustainable design"
              ],
              "aliases": [
                "energy conservation"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "atmospheric-pollution",
      "title": "Atmospheric Pollution",
      "summary": "Air pollutants, smog, and acid rain.",
      "concepts": [
        {
          "title": "Atmospheric Pollution",
          "topics": [
            {
              "slug": "air-pollutants-and-photochemical-smog",
              "title": "Air Pollutants and Photochemical Smog",
              "summary": "Primary pollutants from combustion react in sunlight to form ozone and smog.",
              "aliases": [
                "photochemical smog",
                "air pollution",
                "clean air act"
              ]
            },
            {
              "slug": "thermal-inversions-and-reducing-air-pollution",
              "title": "Thermal Inversions and Reducing Air Pollution",
              "summary": "Thermal inversions trap pollutants near the ground; scrubbers, catalytic converters, and regulation cut emissions.",
              "points": [
                "Thermal inversion",
                "Catalytic converters and scrubbers",
                "Clean Air Act"
              ],
              "aliases": [
                "thermal inversion",
                "reducing air pollution"
              ]
            },
            {
              "slug": "acid-rain-and-indoor-air-pollution",
              "title": "Acid Rain and Indoor Air Pollution",
              "summary": "Sulfur and nitrogen oxides form acid rain; indoor pollutants like radon and CO are often worse.",
              "aliases": [
                "acid rain",
                "radon"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "aquatic-and-terrestrial-pollution",
      "title": "Aquatic and Terrestrial Pollution",
      "summary": "Water pollution, toxins, waste, and health.",
      "concepts": [
        {
          "title": "Aquatic and Terrestrial Pollution",
          "topics": [
            {
              "slug": "water-pollution-and-eutrophication",
              "title": "Water Pollution and Eutrophication",
              "summary": "Nutrient runoff causes algal blooms, oxygen loss, and dead zones.",
              "aliases": [
                "eutrophication",
                "dead zones",
                "point source"
              ]
            },
            {
              "slug": "toxins-bioaccumulation-and-biomagnification",
              "title": "Toxins, Bioaccumulation, and Biomagnification",
              "summary": "Persistent toxins build up in organisms and concentrate up the food chain.",
              "aliases": [
                "biomagnification",
                "bioaccumulation",
                "LD50"
              ]
            },
            {
              "slug": "solid-waste-and-sewage-treatment",
              "title": "Solid Waste and Sewage Treatment",
              "summary": "Landfills, incineration, recycling, and sewage treatment each manage waste differently.",
              "aliases": [
                "landfills",
                "sewage treatment"
              ]
            },
            {
              "slug": "dose-response-and-human-health",
              "title": "Dose–Response and Human Health",
              "summary": "LD50 and dose–response curves measure toxicity; pollution and pathogens affect human health.",
              "points": [
                "LD50",
                "Dose–response curves",
                "Infectious diseases"
              ],
              "aliases": [
                "ld50",
                "dose response"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "global-change",
      "title": "Global Change",
      "summary": "Ozone, climate change, and biodiversity loss.",
      "concepts": [
        {
          "title": "Global Change",
          "topics": [
            {
              "slug": "stratospheric-ozone-depletion",
              "title": "Stratospheric Ozone Depletion",
              "summary": "CFCs destroy stratospheric ozone that blocks UV radiation; the Montreal Protocol reversed the trend.",
              "aliases": [
                "ozone layer",
                "CFCs"
              ]
            },
            {
              "slug": "climate-change-and-the-greenhouse-effect",
              "title": "Climate Change and the Greenhouse Effect",
              "summary": "Greenhouse gases trap heat, driving warming, sea level rise, and ocean acidification.",
              "aliases": [
                "greenhouse effect",
                "global warming",
                "ocean acidification"
              ]
            },
            {
              "slug": "ocean-warming-and-acidification",
              "title": "Ocean Warming and Acidification",
              "summary": "Oceans absorb heat and CO₂, which raises sea levels, bleaches coral, and makes seawater more acidic.",
              "points": [
                "Coral bleaching",
                "Ocean acidification chemistry",
                "Sea-level rise"
              ],
              "aliases": [
                "ocean acidification",
                "coral bleaching"
              ]
            },
            {
              "slug": "invasive-species-and-endangered-species",
              "title": "Invasive Species and Endangered Species",
              "summary": "Habitat loss, invasive species, and overexploitation drive most extinctions.",
              "aliases": [
                "invasive species",
                "HIPPCO",
                "endangered species"
              ]
            }
          ]
        }
      ]
    }
  ]
};
