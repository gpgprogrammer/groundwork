import type { CourseSpec } from "../spec";

/**
 * AP Comparative Government and Politics, following the College Board Course and Exam Description (units and topics in CED order).
 */
export const compGov: CourseSpec = {
  "course": {
    "slug": "ap-comparative-government",
    "title": "AP Comparative Government and Politics",
    "shortTitle": "AP Comp Gov",
    "exam": "AP",
    "category": "History & Social Sciences",
    "description": "Political systems in six countries (China, Iran, Mexico, Nigeria, Russia, and the United Kingdom), compared through institutions, participation, and change.",
    "hue": 190,
    "examMonth": "May",
    "query": "AP Comparative Government and Politics",
    "keywords": [
      "ap comp gov",
      "comparative government",
      "comp gov",
      "ap comparative"
    ]
  },
  "units": [
    {
      "slug": "political-systems-regimes-and-governments",
      "title": "Political Systems, Regimes, and Governments",
      "summary": "Comparing regimes, power, and legitimacy.",
      "concepts": [
        {
          "title": "Political Systems, Regimes, and Governments",
          "topics": [
            {
              "slug": "the-practice-of-political-science",
              "title": "The Practice of Political Science",
              "summary": "Political scientists compare countries using quantitative and qualitative data to explain how power works.",
              "points": [
                "Empirical vs. normative",
                "Correlation and causation",
                "Comparing the six course countries"
              ],
              "aliases": [
                "political science"
              ]
            },
            {
              "slug": "democratic-and-authoritarian-regimes",
              "title": "Democratic and Authoritarian Regimes",
              "summary": "Regimes differ in how power is gained and checked, from liberal democracy to authoritarian rule.",
              "aliases": [
                "authoritarianism",
                "democracy",
                "regime types"
              ]
            },
            {
              "slug": "sources-of-power-and-federal-vs-unitary-systems",
              "title": "Sources of Power and Federal vs. Unitary Systems",
              "summary": "Power comes from constitutions, tradition, or force; federal systems share it with regions while unitary systems keep it central.",
              "points": [
                "Constitutions",
                "Federal vs. unitary",
                "Devolution"
              ],
              "aliases": [
                "federal vs unitary",
                "devolution"
              ]
            },
            {
              "slug": "legitimacy-and-stability",
              "title": "Legitimacy and Stability",
              "summary": "Governments stay in power through legitimacy based on tradition, charisma, or rational-legal rules.",
              "aliases": [
                "legitimacy",
                "sovereignty"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "political-institutions",
      "title": "Political Institutions",
      "summary": "Executives, legislatures, and courts in the course countries.",
      "concepts": [
        {
          "title": "Political Institutions",
          "topics": [
            {
              "slug": "parliamentary-and-presidential-systems",
              "title": "Parliamentary and Presidential Systems",
              "summary": "The UK's parliamentary system fuses executive and legislature; Mexico's presidential system separates them.",
              "aliases": [
                "parliamentary system",
                "presidential system"
              ]
            },
            {
              "slug": "executives-and-legislatures",
              "title": "Executives and Legislatures",
              "summary": "Executives differ in term limits and removal; legislatures vary in independence and structure.",
              "points": [
                "Head of state vs. head of government",
                "Term limits and removal",
                "Legislative independence"
              ],
              "aliases": [
                "executive systems",
                "legislatures"
              ]
            },
            {
              "slug": "judicial-independence-across-the-course-countries",
              "title": "Judicial Independence Across the Course Countries",
              "summary": "Courts range from independent in the UK to controlled by the ruling party in China.",
              "aliases": [
                "judicial independence"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "political-culture-and-participation",
      "title": "Political Culture and Participation",
      "summary": "Civil society, ideology, participation, and cleavages.",
      "concepts": [
        {
          "title": "Political Culture and Participation",
          "topics": [
            {
              "slug": "political-culture-and-socialization",
              "title": "Political Culture and Socialization",
              "summary": "Political beliefs vary across countries and shape how citizens engage.",
              "aliases": [
                "political culture"
              ]
            },
            {
              "slug": "political-participation",
              "title": "Political Participation",
              "summary": "Citizens participate through voting, protest, and civil society, shaped by regime type and incentives.",
              "points": [
                "Voluntary vs. state-controlled",
                "Civil society",
                "Protest"
              ],
              "aliases": [
                "political participation"
              ]
            },
            {
              "slug": "civil-rights-and-liberties-across-countries",
              "title": "Civil Rights and Liberties Across Countries",
              "summary": "Governments protect or restrict speech, press, and protest to different degrees.",
              "aliases": [
                "civil liberties comparative"
              ]
            },
            {
              "slug": "political-and-social-cleavages",
              "title": "Political and Social Cleavages",
              "summary": "Divisions of ethnicity, religion, region, and class can unite or destabilize countries.",
              "points": [
                "Ethnic and religious cleavages",
                "Regional divisions",
                "Government responses"
              ],
              "aliases": [
                "social cleavages"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "party-and-electoral-systems-and-citizen-organizations",
      "title": "Party and Electoral Systems and Citizen Organizations",
      "summary": "Elections, parties, social movements, and interest groups.",
      "concepts": [
        {
          "title": "Party and Electoral Systems and Citizen Organizations",
          "topics": [
            {
              "slug": "electoral-systems",
              "title": "Electoral Systems",
              "summary": "First-past-the-post, proportional, and mixed systems shape party competition.",
              "aliases": [
                "proportional representation",
                "first past the post",
                "mixed electoral system"
              ]
            },
            {
              "slug": "political-parties-and-interest-groups",
              "title": "Political Parties and Interest Groups",
              "summary": "Pluralist and corporatist systems give interest groups different access.",
              "aliases": [
                "corporatism",
                "pluralism"
              ]
            },
            {
              "slug": "social-movements-pluralism-and-corporatism",
              "title": "Social Movements, Pluralism, and Corporatism",
              "summary": "Social movements push for change; pluralist systems let many groups compete while corporatist systems give a few official access.",
              "points": [
                "Social movements",
                "Pluralism",
                "Corporatism"
              ],
              "aliases": [
                "pluralism",
                "corporatism"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "political-and-economic-changes-and-development",
      "title": "Political and Economic Changes and Development",
      "summary": "Globalization, development, and policy responses.",
      "concepts": [
        {
          "title": "Political and Economic Changes and Development",
          "topics": [
            {
              "slug": "economic-liberalization-and-globalization",
              "title": "Economic Liberalization and Globalization",
              "summary": "Countries have opened their economies in different ways and with different results.",
              "aliases": [
                "globalization",
                "privatization"
              ]
            },
            {
              "slug": "international-and-supranational-organizations",
              "title": "International and Supranational Organizations",
              "summary": "Organizations like the IMF, World Bank, WTO, and EU influence domestic policy and sovereignty.",
              "points": [
                "IMF and World Bank",
                "WTO",
                "Sovereignty"
              ],
              "aliases": [
                "supranational organizations",
                "imf world bank"
              ]
            },
            {
              "slug": "social-policy-and-development",
              "title": "Social Policy and Development",
              "summary": "Oil wealth, demographics, and industrialization shape policy in the course countries.",
              "aliases": [
                "resource curse",
                "rentier state"
              ]
            },
            {
              "slug": "demographic-change-and-natural-resources",
              "title": "Demographic Change and Natural Resources",
              "summary": "Urbanization, migration, and resource wealth shape development and politics, including the resource curse.",
              "points": [
                "Demographic change",
                "Resource curse",
                "Industrialization"
              ],
              "aliases": [
                "resource curse"
              ]
            }
          ]
        }
      ]
    }
  ]
};
