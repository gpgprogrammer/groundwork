import type { CourseSpec } from "./spec";

export const world: CourseSpec = {
  course: {
    slug: "ap-world-history",
    title: "AP World History: Modern",
    shortTitle: "AP World",
    exam: "AP",
    category: "History & Social Sciences",
    description:
      "1200 to the present through networks of exchange, state building, revolution, and global conflict. It's built around the reasoning the DBQ and LEQ reward.",
    hue: 28,
    examMonth: "May",
    query: "AP World History",
    keywords: ["ap world", "world history", "apwh", "whap"],
  },
  units: [
    {
      slug: "global-tapestry",
      title: "The Global Tapestry, 1200–1450",
      summary: "How states across Afro-Eurasia and the Americas organized power and belief.",
      concepts: [
        {
          title: "East Asia",
          topics: [
            {
              slug: "champa-rice",
              title: "Champa Rice and Song China",
              glyph: "稻",
              summary:
                "Champa rice was a fast-ripening, drought-resistant rice from Vietnam that let Song farmers harvest twice a year. The surplus fed a population boom, bigger cities, and commercial growth.",
              points: ["Where Champa rice came from", "Surplus → population → cities", "Using it as DBQ evidence"],
              aliases: ["song dynasty agriculture", "fast ripening rice", "song economy", "vietnam rice"],
            },
            {
              slug: "song-bureaucracy",
              title: "Song Bureaucracy and Neo-Confucianism",
              glyph: "科舉",
              summary:
                "The Song ran China through a merit-based civil service chosen by exam. Neo-Confucianism reinforced hierarchy and filial piety across both state and family.",
              points: ["The civil service exams", "Neo-Confucian values", "Continuity and change in governance"],
              aliases: ["civil service exam", "neo confucianism", "song dynasty"],
            },
          ],
        },
        {
          title: "Dar al-Islam and Africa",
          topics: [
            {
              slug: "dar-al-islam",
              title: "Dar al-Islam",
              glyph: "بيت الحكمة",
              summary:
                "The Abbasid Caliphate broke apart, but the wider Islamic world stayed connected through trade, law, and learning. The House of Wisdom preserved and extended Greek, Persian, and Indian knowledge.",
              points: ["Fragmentation of the Abbasids", "Turkic states", "Scholarly exchange"],
              aliases: ["abbasid", "house of wisdom", "islamic world"],
            },
            {
              slug: "mali-empire",
              title: "Mali and Mansa Musa",
              glyph: "☼",
              summary:
                "Mali grew rich by controlling the trans-Saharan gold and salt trade. Mansa Musa's 1324 hajj made that wealth famous across the Mediterranean.",
              points: ["Gold-salt trade", "Timbuktu as a center of learning", "Islam and state legitimacy"],
              aliases: ["mansa musa", "timbuktu", "west africa", "trans-saharan"],
            },
          ],
        },
      ],
    },
    {
      slug: "networks-of-exchange",
      title: "Networks of Exchange",
      summary: "Silk Roads, the Indian Ocean, and the Mongol moment.",
      concepts: [
        {
          title: "Trade Routes",
          topics: [
            {
              slug: "silk-roads",
              title: "The Silk Roads",
              glyph: "⇄",
              summary:
                "The Silk Roads were a network of overland routes that carried luxury goods, religions, technologies, and disease across Eurasia. Caravanserai and credit systems made trading over long distances practical.",
              points: ["Luxury goods and why", "Caravanserai and flying cash", "Cultural diffusion"],
              aliases: ["silk road", "overland trade", "caravanserai"],
            },
            {
              slug: "indian-ocean-trade",
              title: "Indian Ocean Trade",
              glyph: "≈",
              summary:
                "Monsoon winds set the rhythm of Indian Ocean trade. Diaspora communities of merchants spread goods, faiths, and customs from East Africa to China.",
              points: ["Monsoon knowledge", "Swahili city-states", "Diasporic communities"],
              aliases: ["monsoon", "swahili coast", "maritime trade"],
            },
          ],
        },
        {
          title: "The Mongols",
          topics: [
            {
              slug: "mongol-empire",
              title: "The Mongol Empire",
              glyph: "⚑",
              summary:
                "The Mongols built the largest contiguous land empire in history. The Pax Mongolica made Eurasian trade safer, and it also helped the plague travel.",
              points: ["Military innovation", "Pax Mongolica", "Transfers of technology and disease"],
              aliases: ["genghis khan", "pax mongolica", "khanates"],
            },
          ],
        },
      ],
    },
    {
      slug: "land-based-empires",
      title: "Land-Based Empires, 1450–1750",
      summary: "Gunpowder, legitimacy, and how empires held diverse populations together.",
      concepts: [
        {
          title: "Gunpowder Empires",
          topics: [
            {
              slug: "gunpowder-empires",
              title: "Ottomans, Safavids, and Mughals",
              glyph: "⚔",
              summary:
                "Three Islamic empires used firearms to expand and hold territory. They legitimized rule in different ways and managed religiously diverse subjects differently.",
              points: ["Military technology and expansion", "Sunni–Shia rivalry", "Akbar's tolerance"],
              aliases: ["ottoman empire", "safavid", "mughal", "islamic empires"],
            },
            {
              slug: "devshirme",
              title: "The Devshirme System",
              glyph: "⚜",
              summary:
                "The Ottomans took Christian boys from the Balkans, converted them, and trained them as Janissaries or administrators. The system created an elite whose loyalty ran to the sultan alone.",
              points: ["How it worked", "Janissaries", "Loyalty and centralization"],
              aliases: ["janissaries", "ottoman administration"],
            },
          ],
        },
      ],
    },
    {
      slug: "transoceanic-interconnections",
      title: "Transoceanic Interconnections",
      summary: "Maritime empires, the Columbian Exchange, and coerced labor.",
      concepts: [
        {
          title: "Atlantic World",
          topics: [
            {
              slug: "columbian-exchange",
              title: "The Columbian Exchange",
              glyph: "⇆",
              summary:
                "After 1492, plants, animals, diseases, and people crossed the Atlantic in both directions. Smallpox devastated Indigenous populations, while American crops fed population growth in Afro-Eurasia.",
              points: ["Disease and demographic collapse", "Crops that changed diets", "Cash crops and labor demand"],
              aliases: ["columbian exchange", "smallpox", "potatoes maize"],
            },
            {
              slug: "labor-systems",
              title: "Encomienda, Hacienda, and Mit'a",
              glyph: "⛏",
              summary:
                "Spanish colonizers adapted older labor systems and invented new ones to extract wealth. Knowing how each system differed is a reliable way to earn comparison points.",
              points: ["Encomienda vs. hacienda", "The mit'a and Potosí", "Why labor was coerced"],
              aliases: ["encomienda", "hacienda", "mita", "potosi", "coerced labor"],
            },
            {
              slug: "atlantic-slave-trade",
              title: "The Atlantic Slave Trade",
              glyph: "△",
              summary:
                "Plantation economies drove the forced migration of about 12 million Africans. The trade changed demographics and economies on three continents.",
              points: ["Triangular trade", "Plantation economies", "Impact on West African states"],
              aliases: ["transatlantic slave trade", "middle passage", "triangular trade"],
            },
          ],
        },
      ],
    },
    {
      slug: "revolutions",
      title: "Revolutions, 1750–1900",
      summary: "New ideas about government, and new ways of making things.",
      concepts: [
        {
          title: "Political Revolutions",
          topics: [
            {
              slug: "enlightenment",
              title: "Enlightenment Ideas",
              glyph: "¶",
              summary:
                "Enlightenment thinkers questioned inherited authority and argued for natural rights and the social contract. Those ideas powered revolutions across the Atlantic world.",
              points: ["Locke, Rousseau, Montesquieu", "Natural rights", "From ideas to revolutions"],
              aliases: ["locke", "rousseau", "social contract", "natural rights"],
            },
            {
              slug: "haitian-revolution",
              title: "The Haitian Revolution",
              glyph: "✦",
              summary:
                "The only successful large-scale revolt of enslaved people founded an independent Haiti in 1804. It unsettled slaveholding societies across the hemisphere.",
              points: ["Saint-Domingue's economy", "Toussaint Louverture", "Hemispheric consequences"],
              aliases: ["haiti", "toussaint louverture", "saint domingue"],
            },
          ],
        },
        {
          title: "Industrialization",
          topics: [
            {
              slug: "industrial-revolution",
              title: "Why Industrialization Began in Britain",
              glyph: "⚙",
              summary:
                "Coal, capital, colonies, and a large supply of labor made Britain the first industrial economy. The AP exam wants multiple interacting causes, not a single one.",
              points: ["Factors of production", "Steam and coal", "Causation reasoning"],
              aliases: ["industrial revolution causes", "britain industrialization", "steam engine"],
            },
          ],
        },
      ],
    },
    {
      slug: "consequences-of-industrialization",
      title: "Consequences of Industrialization",
      summary: "Imperialism, migration, and the states that reformed to compete.",
      concepts: [
        {
          title: "Imperialism and Response",
          topics: [
            {
              slug: "new-imperialism",
              title: "New Imperialism",
              glyph: "◐",
              summary:
                "Industrial powers colonized Africa and Asia to secure raw materials and markets, and justified it with Social Darwinism. The Berlin Conference divided Africa without any Africans in the room.",
              points: ["Economic motives", "Ideological justifications", "Berlin Conference"],
              aliases: ["scramble for africa", "berlin conference", "social darwinism", "imperialism"],
            },
            {
              slug: "meiji-restoration",
              title: "The Meiji Restoration",
              glyph: "明治",
              summary:
                "After being forced open, Japan industrialized from the top down and became an imperial power within a generation. It's the key counterexample in state-reform questions.",
              points: ["Why Japan reformed", "State-led industrialization", "Comparison with the Qing"],
              aliases: ["meiji japan", "japanese industrialization"],
            },
          ],
        },
      ],
    },
    {
      slug: "global-conflict",
      title: "Global Conflict and Cold War",
      summary: "Two world wars, then a divided world and decolonization.",
      concepts: [
        {
          title: "The World Wars",
          topics: [
            {
              slug: "causes-of-wwi",
              title: "Causes of World War I",
              glyph: "M·A·I·N",
              summary:
                "Militarism, alliances, imperial rivalry, and nationalism made a regional crisis into a world war. The assassination in Sarajevo was the spark, not the cause.",
              points: ["Long-term vs. immediate causes", "Alliance systems", "Total war"],
              aliases: ["wwi", "world war 1", "MAIN causes", "franz ferdinand"],
            },
          ],
        },
        {
          title: "Cold War and Decolonization",
          topics: [
            {
              slug: "decolonization",
              title: "Decolonization",
              glyph: "↺",
              summary:
                "After 1945, colonies across Asia and Africa won independence through negotiation or through armed struggle. Compare India, Algeria, and Ghana to see the range.",
              points: ["Negotiated vs. violent paths", "Nationalist leaders", "Cold War entanglements"],
              aliases: ["independence movements", "gandhi", "algeria", "ghana", "nkrumah"],
            },
          ],
        },
      ],
    },
  ],
};
