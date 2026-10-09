import { hsCourse } from "./outline";

/**
 * Marine Science, following the Ocean Literacy Principles and the sequence of high school
 * marine science courses and textbooks (Life on an Ocean Planet, Florida's Marine Science
 * standards): the physical ocean, then marine life, ecosystems, and human impacts.
 */
export const marineScience = hsCourse(
  {
    slug: "marine-science",
    title: "Marine Science",
    shortTitle: "Marine Sci",
    category: "Sciences",
    hue: 195,
    grades: "Grade 10 to 12",
    description: "The ocean floor, seawater, currents and tides, marine life from plankton to whales, ocean ecosystems, and how people affect the sea.",
    keywords: ["marine science", "marine biology", "oceanography", "marine sci"],
  },
  `
# Exploring the Ocean | How we study an ocean we've barely seen.
- The World Ocean | One connected ocean covers 71% of Earth and shapes its climate and life. | Ocean basins; Ocean literacy; Why the ocean matters | world ocean; ocean basins
- The History of Ocean Exploration | From Polynesian navigators to the Challenger expedition and modern submersibles. | Early navigation; The Challenger expedition; Submersibles and ROVs | history of ocean exploration
- Tools of Oceanography | Sonar, satellites, buoys, and sampling gear measure the ocean. | Sonar and mapping; Satellites; Sampling and sensors | oceanography tools; sonar

# The Ocean Floor | The shape of the seafloor and how it formed.
- Plate Tectonics and the Seafloor | Seafloor spreading creates ocean crust; subduction destroys it. | Seafloor spreading; Mid-ocean ridges; Trenches and subduction | seafloor spreading; plate tectonics ocean
- Features of the Ocean Floor | Continental margins, abyssal plains, seamounts, and trenches. | Continental shelf and slope; Abyssal plains; Seamounts and guyots | ocean floor features; continental shelf
- Marine Sediments | Sediments from land, living things, and seawater cover the seafloor. | Types of sediments; Oozes; Sediment records | marine sediments
- Hydrothermal Vents | Vents release mineral-rich water that feeds chemosynthetic life. | How vents form; Black smokers; Chemosynthesis | hydrothermal vents

# Seawater | The chemistry and physics of ocean water.
- Properties of Water | Water's polarity gives it high heat capacity and makes it a strong solvent. | Polarity and hydrogen bonds; Heat capacity; Density of water | properties of water
- Salinity | Seawater averages about 35 parts per thousand of dissolved salts. | Sources of salt; Measuring salinity; What changes salinity | ocean salinity
- Temperature, Density, and Layers | Temperature and salinity set density, layering the ocean. | Thermocline; Halocline; Pycnocline | ocean layers; thermocline
- Dissolved Gases and Ocean Acidification | The ocean absorbs oxygen and carbon dioxide; extra CO₂ makes it more acidic. | Dissolved oxygen; Carbon dioxide and pH; Effects of acidification | ocean acidification
- Light and Sound in the Ocean | Light fades quickly with depth; sound travels far. | Photic and aphotic zones; Color absorption; Sound and sonar | light in the ocean; ocean zones

# Ocean Motion | Currents, waves, and tides.
- Surface Currents | Wind and the Coriolis effect drive surface currents and gyres. | Wind-driven currents; Gyres; Coriolis effect | ocean surface currents; gyres
- Deep Ocean Circulation | Cold, salty water sinks and drives a global conveyor belt. | Thermohaline circulation; The global conveyor; Climate effects | thermohaline circulation
- Upwelling and El Niño | Upwelling brings nutrients to the surface; El Niño disrupts it. | Coastal upwelling; El Niño and La Niña; Effects on fisheries | upwelling; el nino
- Waves | Wind transfers energy to water as waves; waves break near shore. | Wave anatomy; Wave formation; Tsunamis | ocean waves; tsunamis
- Tides | The moon's and sun's gravity cause tides. | Spring and neap tides; Tidal patterns; Tidal currents | tides
- Coasts and Beaches | Waves and currents shape coastlines and move sand. | Longshore currents; Erosional and depositional coasts; Barrier islands | coastal processes; beaches

# Introduction to Marine Life | What it takes to live in the sea.
- Classification of Marine Organisms | Marine life spans all three domains and every major group. | Taxonomy; Domains and kingdoms; Dichotomous keys | classification of marine organisms
- Adaptations to Ocean Life | Buoyancy, salt balance, and pressure shape marine organisms. | Buoyancy; Osmoregulation; Temperature and pressure | marine adaptations
- Ocean Zones and Habitats | Life is organized by depth, light, and distance from shore. | Pelagic and benthic; Neritic and oceanic; Depth zones | ocean zones; pelagic and benthic

# Marine Microbes, Plankton, and Plants | The base of ocean food webs.
- Marine Bacteria and Archaea | Microbes drive nutrient cycles and live in extreme environments. | Roles of microbes; Cyanobacteria; Extremophiles | marine bacteria
- Plankton | Phytoplankton make about half of Earth's oxygen; zooplankton eat them. | Phytoplankton; Zooplankton; Diatoms and dinoflagellates | plankton; phytoplankton
- Seaweeds and Marine Plants | Algae, seagrasses, and mangroves are the ocean's primary producers near shore. | Red, brown, and green algae; Seagrasses; Mangroves | seaweed; seagrass; mangroves

# Marine Invertebrates | Animals without backbones.
- Sponges and Cnidarians | Sponges filter water; cnidarians like jellyfish and corals sting with nematocysts. | Sponges; Jellyfish, anemones, corals; Polyps and medusae | sponges; cnidarians; jellyfish
- Worms and Mollusks | Marine worms and mollusks like clams, snails, and octopuses. | Marine worms; Bivalves and gastropods; Cephalopods | mollusks; cephalopods
- Arthropods | Crustaceans like crabs, lobsters, and krill have exoskeletons and jointed legs. | Crustaceans; Molting; Krill and copepods | marine arthropods; crustaceans
- Echinoderms | Sea stars, urchins, and sea cucumbers have radial symmetry and tube feet. | Water vascular system; Sea stars and urchins; Regeneration | echinoderms

# Marine Vertebrates | Fishes, reptiles, birds, and mammals.
- Jawless and Cartilaginous Fishes | Hagfish, lampreys, sharks, and rays. | Jawless fishes; Shark anatomy; Rays and skates | sharks and rays; cartilaginous fish
- Bony Fishes | Most fish are bony fishes with swim bladders and gills. | Fish anatomy; Gills and swim bladders; Reproduction | bony fish; fish anatomy
- Marine Reptiles and Birds | Sea turtles, sea snakes, marine iguanas, and seabirds. | Sea turtles; Marine iguanas and crocodiles; Seabirds | sea turtles; seabirds
- Marine Mammals | Whales, dolphins, seals, manatees, and sea otters. | Cetaceans; Pinnipeds; Sirenians and sea otters | marine mammals; whales and dolphins

# Marine Ecosystems | Communities of life in the sea.
- Marine Food Webs and Energy | Energy flows from primary producers to top predators. | Primary productivity; Trophic levels; Biomagnification | marine food webs
- Intertidal Zones | Organisms on rocky shores survive waves and drying out. | Zonation; Tide pools; Adaptations | intertidal zone; tide pools
- Estuaries and Salt Marshes | Where rivers meet the sea, nutrient-rich waters nurse young fish. | Estuaries; Salt marshes; Nursery habitats | estuaries; salt marsh
- Coral Reefs | Corals and their algae build reefs, the ocean's most diverse ecosystems. | Coral polyps and zooxanthellae; Reef types; Coral bleaching | coral reefs; coral bleaching
- Kelp Forests and Seagrass Beds | Kelp forests and seagrass beds shelter many species. | Kelp forests; Sea otters and urchins; Seagrass meadows | kelp forests
- The Open Ocean and Deep Sea | Life in the open ocean and the dark deep sea. | Epipelagic life; Bioluminescence; Deep-sea adaptations | deep sea creatures; open ocean
- Polar Seas | Cold polar oceans support krill, penguins, seals, and whales. | Sea ice; Antarctic food web; Arctic ecosystems | polar oceans

# People and the Ocean | Using and protecting the ocean.
- Ocean Resources | Fisheries, aquaculture, energy, and minerals come from the sea. | Fisheries; Aquaculture; Offshore energy and minerals | ocean resources; aquaculture
- Overfishing | Fishing faster than populations recover collapses fisheries. | Overfishing; Bycatch; Sustainable seafood | overfishing; bycatch
- Marine Pollution | Plastics, oil spills, and runoff harm marine life. | Plastic pollution; Oil spills; Nutrient runoff and dead zones | marine pollution; ocean plastic; dead zones
- Climate Change and the Ocean | Warming and acidifying oceans, rising seas, and shifting species. | Sea-level rise; Ocean warming; Coral bleaching and acidification | climate change ocean
- Marine Conservation | Marine protected areas, laws, and restoration protect ocean life. | Marine protected areas; Endangered species; Restoration | marine conservation; marine protected areas
`,
);
