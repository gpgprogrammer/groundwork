import { hsCourse } from "./outline";

/**
 * Earth Science, following the NGSS high school Earth and space science standards (HS-ESS1 to
 * ESS3) and the topics of widely used Earth science courses (such as New York's Earth and Space
 * Sciences): maps, rocks and minerals, plate tectonics, surface processes, Earth's history,
 * weather and climate, the oceans, resources, and astronomy.
 */
export const earthScience = hsCourse(
  {
    slug: "earth-science",
    title: "Earth Science",
    shortTitle: "Earth Sci",
    category: "Sciences",
    hue: 35,
    grades: "Grade 8 or 9",
    description: "Rocks and minerals, plate tectonics, Earth's history, weather and climate, the oceans, and astronomy.",
    keywords: ["earth science", "earth and space science", "earth sci"],
  },
  `
# Earth Systems and Maps | Earth as a system, and the maps used to study it.
- Earth's Spheres | The geosphere, hydrosphere, atmosphere, and biosphere interact as one system. | Four spheres; Feedbacks between systems; Energy sources | earth systems; earths spheres
- Latitude and Longitude | A grid of latitude and longitude lines locates any place on Earth. | Latitude; Longitude; Time zones | latitude and longitude
- Topographic Maps | Contour lines show elevation; their spacing shows steepness. | Contour lines and intervals; Gradient; Drawing profiles | topographic maps; contour lines

# Minerals and Rocks | What Earth's crust is made of and how it changes.
- Minerals | Minerals are natural, inorganic crystalline solids identified by their properties. | Crystal structure; Hardness, luster, streak, cleavage; Silicates | minerals; mineral identification
- Igneous Rocks | Igneous rocks form from cooled magma or lava; cooling rate sets crystal size. | Intrusive and extrusive; Texture; Composition | igneous rocks
- Sedimentary Rocks | Sedimentary rocks form from compacted and cemented sediments or from chemical processes. | Clastic, chemical, and organic; Compaction and cementation; Layers and fossils | sedimentary rocks
- Metamorphic Rocks | Heat and pressure transform rocks without melting them. | Foliated and nonfoliated; Contact and regional metamorphism; Parent rocks | metamorphic rocks
- The Rock Cycle | Rocks change from one type to another through melting, weathering, and metamorphism. | Rock cycle processes; Pathways; Energy sources | rock cycle

# Plate Tectonics | Earth's interior and the moving plates of its surface.
- Earth's Interior | Earth has a crust, mantle, outer core, and inner core, revealed by seismic waves. | Layers by composition; Lithosphere and asthenosphere; Evidence from seismic waves | layers of the earth; earths interior
- Continental Drift and Seafloor Spreading | Fossils, rock matches, and magnetic stripes show that continents move. | Wegener's evidence; Seafloor spreading; Paleomagnetism | continental drift; seafloor spreading
- Plate Boundaries | Plates pull apart, collide, or slide past each other at boundaries. | Divergent boundaries; Convergent boundaries; Transform boundaries | plate boundaries; plate tectonics
- Earthquakes | Earthquakes release stress along faults; seismographs locate and measure them. | Faults; P and S waves; Locating epicenters and magnitude | earthquakes; seismic waves
- Volcanoes | Volcanoes form at boundaries and hot spots; magma type sets how explosive they are. | Types of volcanoes; Magma viscosity; Hot spots | volcanoes
- Mountain Building | Folding, faulting, and collisions build mountains. | Folding and faulting; Types of mountains; Isostasy | mountain building

# Surface Processes | How Earth's surface is broken down and reshaped.
- Weathering | Rocks break down mechanically and chemically. | Mechanical weathering; Chemical weathering; Rates of weathering | weathering
- Soil | Soil forms from weathered rock and organic matter in layers called horizons. | Soil horizons; Soil formation; Soil erosion | soil formation; soil horizons
- Erosion and Deposition | Gravity, water, wind, and ice move sediment and drop it elsewhere. | Agents of erosion; Mass movement; Sorting of sediments | erosion and deposition
- Streams and Groundwater | Rivers carve landscapes; groundwater fills aquifers. | Stream velocity and erosion; Watersheds; Aquifers and porosity | rivers and streams; groundwater
- Glaciers | Glaciers carve valleys and leave deposits as they advance and retreat. | Alpine and continental glaciers; Glacial landforms; Ice ages | glaciers

# Earth's History | Reading the story in the rocks.
- Relative Dating | Superposition, cross-cutting relationships, and unconformities order rock layers. | Law of superposition; Cross-cutting relationships; Unconformities | relative dating
- Absolute Dating | Radioactive decay at known half-lives dates rocks in years. | Radioactive decay; Half-life; Radiometric dating | absolute dating; radiometric dating
- Fossils and Correlation | Fossils and index fossils match rock layers across regions. | Types of fossils; Index fossils; Correlating rock layers | fossils; index fossils
- The Geologic Time Scale | Earth's 4.6-billion-year history is divided into eons, eras, periods, and epochs. | Eons, eras, periods; Mass extinctions; Major events | geologic time scale

# Weather | The atmosphere and the weather it produces.
- The Atmosphere | The atmosphere's composition and its layers from troposphere to thermosphere. | Composition; Layers; The ozone layer | layers of the atmosphere
- Solar Energy and Heat Transfer | Uneven heating of Earth by the sun drives weather. | Insolation; Conduction, convection, radiation; Greenhouse effect | heat transfer in the atmosphere; insolation
- Humidity, Clouds, and Precipitation | Rising air cools to its dew point, forming clouds and precipitation. | Relative humidity and dew point; Cloud formation; Types of precipitation | humidity; cloud formation; dew point
- Air Pressure and Wind | Air flows from high to low pressure; the Coriolis effect bends it. | Air pressure; Global winds; Coriolis effect | air pressure and wind; coriolis effect
- Air Masses and Fronts | Fronts form where air masses meet, bringing changes in weather. | Types of air masses; Cold and warm fronts; Highs and lows | air masses and fronts; weather fronts
- Severe Weather | Thunderstorms, tornadoes, and hurricanes form under specific conditions. | Thunderstorms; Tornadoes; Hurricanes | severe weather; hurricanes; tornadoes
- Weather Maps and Forecasting | Station models, isobars, and fronts on maps help forecast the weather. | Station models; Isobars; Forecasting | weather maps; station models

# Climate | Long-term patterns and how they're changing.
- Factors That Affect Climate | Latitude, elevation, nearby water, and ocean currents shape a region's climate. | Latitude and elevation; Large bodies of water; Mountains and rain shadows | factors affecting climate
- Global Circulation and Climate Zones | Global air and ocean circulation create Earth's climate zones. | Convection cells; Climate zones; El Niño | global wind patterns; climate zones
- Climate Change | Greenhouse gases from human activity are warming Earth, with effects worldwide. | Evidence of climate change; Greenhouse gases; Impacts and solutions | climate change; global warming

# Earth's Oceans | Ocean water, currents, waves, and tides.
- Ocean Water and the Seafloor | Ocean water varies in salinity and temperature; the seafloor has ridges, trenches, and plains. | Salinity; Ocean layers; Seafloor features | ocean floor features; salinity
- Ocean Currents | Surface currents are driven by wind; deep currents by density. | Surface currents; Deep-water circulation; Upwelling | ocean currents
- Waves and Tides | Wind makes waves; the moon and sun make tides. | Wave formation; Spring and neap tides; Shoreline processes | ocean waves; tides

# Earth's Resources | Using and protecting Earth's resources.
- Renewable and Nonrenewable Resources | Fossil fuels run out; solar, wind, and water power don't. | Fossil fuels; Renewable energy; Mineral resources | renewable and nonrenewable resources
- Water Resources and Pollution | Fresh water is limited and easily polluted. | The water cycle; Water use; Pollution and conservation | water resources; water pollution
- Natural Hazards and Human Impact | Humans affect Earth systems and face risks from natural hazards. | Hazard mitigation; Land use; Sustainability | natural hazards

# Astronomy | Earth's place in space.
- Earth's Motions and the Seasons | Earth's tilt, not its distance from the sun, causes the seasons. | Rotation and revolution; Axial tilt; Solstices and equinoxes | reasons for the seasons; earths tilt
- Moon Phases, Eclipses, and Tides | The moon's orbit causes phases, eclipses, and tides. | Moon phases; Solar and lunar eclipses; The moon and tides | moon phases; eclipses
- The Solar System | The planets, moons, and smaller bodies, and how the solar system formed. | Terrestrial and gas planets; Formation of the solar system; Comets and asteroids | solar system
- Kepler's Laws and Gravity | Planets orbit in ellipses, faster when closer to the sun. | Elliptical orbits; Eccentricity; Gravity and orbits | keplers laws
- The Sun | The sun's structure, fusion, and solar activity. | Layers of the sun; Nuclear fusion; Sunspots and solar flares | the sun; nuclear fusion in the sun
- Stars and the H-R Diagram | Stars are born, live, and die depending on their mass; the H-R diagram sorts them. | Life cycle of stars; H-R diagram; Supernovas and black holes | life cycle of a star; hr diagram
- Galaxies and the Big Bang | The universe is expanding; red shift and the cosmic background point to the Big Bang. | Types of galaxies; Red shift; Evidence for the Big Bang | big bang theory; galaxies
`,
);
