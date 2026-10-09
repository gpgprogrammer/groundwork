import { hsCourse } from "./outline";

/**
 * Environmental Science (the non-AP class), following the NGSS standards on ecosystems and human
 * sustainability (HS-LS2, HS-ESS3) and textbooks such as Holt's and Pearson's Environmental
 * Science: ecology, populations, resources, energy, pollution, climate, and sustainability.
 */
export const environmentalScience = hsCourse(
  {
    slug: "environmental-science",
    title: "Environmental Science",
    shortTitle: "Env. Sci",
    category: "Sciences",
    hue: 100,
    grades: "Grade 10 to 12",
    description: "Ecosystems, populations, water, land, energy, pollution, climate change, and how people can live sustainably.",
    keywords: ["environmental science", "env sci", "enviro science", "environmental studies"],
  },
  `
# Introduction to Environmental Science | How people and the environment affect each other.
- What Is Environmental Science? | Environmental science draws on many fields to study how humans interact with nature. | An interdisciplinary science; Environmental problems; Ecological footprints | introduction to environmental science
- The Tragedy of the Commons and Sustainability | Shared resources are overused unless they're managed sustainably. | Tragedy of the commons; Sustainability; Developed and developing nations | tragedy of the commons; sustainability
- Environmental Science and Data | Experiments, models, and data help scientists study the environment. | Scientific method; Models; Risk and decisions | environmental science data

# Ecosystems | How living and nonliving things interact.
- Ecosystem Structure | Ecosystems contain biotic and abiotic parts organized into populations and communities. | Biotic and abiotic factors; Habitats and niches; Levels of organization | ecosystems; biotic and abiotic factors
- Energy Flow and Food Webs | Energy flows from producers to consumers, losing about 90% at each level. | Producers and consumers; Food chains and webs; Energy pyramids | food webs; energy pyramid
- The Carbon and Nitrogen Cycles | Carbon and nitrogen move through air, water, soil, and living things. | Carbon cycle; Nitrogen cycle; Human impact on cycles | carbon cycle; nitrogen cycle
- The Water and Phosphorus Cycles | Water and phosphorus cycle through the environment at very different speeds. | Water cycle; Phosphorus cycle; Eutrophication | water cycle; phosphorus cycle
- Species Interactions | Competition, predation, and symbiosis connect species. | Competition; Predation; Mutualism, commensalism, parasitism | species interactions; symbiosis
- Ecological Succession | Ecosystems recover and change after disturbances. | Primary succession; Secondary succession; Climax communities | ecological succession

# Biomes | Earth's major land and water ecosystems.
- Terrestrial Biomes | Climate determines which biome forms: tundra, forest, grassland, desert. | Climate and biomes; Forests; Grasslands and deserts | terrestrial biomes
- Freshwater Ecosystems | Rivers, lakes, and wetlands support life and filter water. | Lakes and ponds; Rivers and streams; Wetlands | freshwater ecosystems; wetlands
- Marine Ecosystems | Coral reefs, estuaries, and the open ocean are among Earth's most productive ecosystems. | Coastal ecosystems; Coral reefs; Open ocean | marine ecosystems; estuaries

# Populations | How populations grow and are limited.
- Population Growth and Carrying Capacity | Populations grow exponentially until resources limit them. | Exponential growth; Logistic growth; Carrying capacity | population growth; carrying capacity
- Limiting Factors and Survivorship | Density-dependent and independent factors limit populations; survivorship curves describe them. | Density-dependent factors; r- and K-selected species; Survivorship curves | limiting factors; survivorship curves
- Human Population Growth | The human population has grown rapidly and is changing in structure. | Age-structure diagrams; Demographic transition; Birth and death rates | human population growth; demographic transition

# Biodiversity | The variety of life and how to protect it.
- Biodiversity and Its Value | Biodiversity provides food, medicine, and ecosystem services. | Levels of biodiversity; Ecosystem services; Hotspots | biodiversity; ecosystem services
- Threats to Biodiversity | Habitat loss, invasive species, pollution, and overharvesting endanger species. | Habitat loss; Invasive species; Overharvesting and poaching | threats to biodiversity; invasive species
- Conservation | Laws, protected areas, and restoration protect species and habitats. | Endangered Species Act; Protected areas; Restoration | conservation of biodiversity; endangered species

# Water | Fresh water, its use, and its pollution.
- Freshwater Resources | Only a tiny fraction of Earth's water is usable fresh water. | Surface water; Groundwater and aquifers; Watersheds | freshwater resources; aquifers
- Water Use and Management | Agriculture, industry, and homes use water; dams and conservation manage it. | Water use; Dams and diversion; Conservation | water use and management
- Water Pollution | Point and nonpoint sources pollute water; treatment cleans it. | Point and nonpoint sources; Types of pollutants; Wastewater treatment | water pollution

# Land and Food | Agriculture, soil, forests, and land use.
- Soil and Soil Conservation | Soil is a slow-forming resource lost to erosion and degradation. | Soil formation; Erosion; Conservation practices | soil conservation; soil erosion
- Agriculture and Food Production | Industrial agriculture feeds billions but uses water, fertilizer, and pesticides. | The Green Revolution; Pesticides and fertilizers; Sustainable agriculture | agriculture and the environment; sustainable agriculture
- Forests and Land Use | Forests, rangelands, and cities compete for land. | Deforestation; Urbanization and sprawl; Public lands | deforestation; land use
- Mining | Mining supplies minerals but damages land and water. | Surface and subsurface mining; Environmental effects; Reclamation | mining environmental impact

# Energy | Where our energy comes from and its costs.
- Fossil Fuels | Coal, oil, and natural gas formed from ancient life and release carbon when burned. | Formation; Extraction and fracking; Environmental effects | fossil fuels
- Nuclear Energy | Fission produces carbon-free power but leaves radioactive waste. | Nuclear fission; Reactors; Nuclear waste and accidents | nuclear energy; nuclear power
- Solar, Wind, and Hydropower | Renewable energy from the sun, wind, and water is growing fast. | Solar power; Wind power; Hydroelectric power | renewable energy; solar and wind energy
- Other Renewable Energy and Conservation | Geothermal, biomass, and efficiency round out the energy future. | Geothermal; Biomass and biofuels; Energy efficiency | geothermal energy; energy conservation

# Pollution and Waste | Air pollution, solid waste, and health.
- Air Pollution | Pollutants from cars and industry cause smog, acid rain, and health problems. | Primary and secondary pollutants; Smog; Acid rain | air pollution; acid rain; smog
- Ozone Depletion | CFCs thin the stratospheric ozone layer, which the Montreal Protocol helped repair. | Stratospheric ozone; CFCs; Montreal Protocol | ozone depletion; ozone layer
- Solid and Hazardous Waste | Trash goes to landfills or incinerators; reducing and recycling cut waste. | Landfills; Recycling and composting; Hazardous waste | solid waste; recycling
- Environmental Health | Toxins, pathogens, and pollution affect human health. | Toxicology and dose; Bioaccumulation; Disease and the environment | environmental health; bioaccumulation

# Climate Change | A warming planet and what to do about it.
- The Greenhouse Effect | Greenhouse gases trap heat and keep Earth warm. | How the greenhouse effect works; Greenhouse gases; Natural vs. enhanced | greenhouse effect
- Evidence and Causes of Climate Change | Temperature records, ice cores, and rising CO₂ show human-caused warming. | Temperature records; Ice cores; Human causes | causes of climate change; evidence of climate change
- Effects of Climate Change | Sea-level rise, extreme weather, and ecosystem shifts. | Sea-level rise; Extreme weather; Effects on ecosystems | effects of climate change
- Responding to Climate Change | Mitigation cuts emissions; adaptation prepares for change. | Mitigation; Adaptation; International agreements | climate change solutions

# Sustainability | Building a sustainable future.
- Environmental Economics and Policy | Laws and markets can protect the environment. | Environmental laws; Cost-benefit analysis; Carbon pricing | environmental policy
- Sustainable Living | Individuals and communities can reduce their environmental footprint. | Ecological footprints; Sustainable cities; Personal choices | sustainable living
`,
);
