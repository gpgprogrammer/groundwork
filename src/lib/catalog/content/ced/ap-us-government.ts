import type { CourseSpec } from "../spec";

/**
 * AP United States Government and Politics, following the College Board Course and Exam Description (units and topics in CED order).
 */
export const gov: CourseSpec = {
  "course": {
    "slug": "ap-us-government",
    "title": "AP United States Government and Politics",
    "shortTitle": "AP Gov",
    "exam": "AP",
    "category": "History & Social Sciences",
    "description": "The Constitution, the three branches, civil liberties and rights, political ideology, and participation, plus the required Supreme Court cases and documents.",
    "hue": 220,
    "examMonth": "May",
    "query": "AP Gov",
    "keywords": [
      "ap gov",
      "ap government",
      "us government",
      "ap us gov",
      "government and politics"
    ]
  },
  "units": [
    {
      "slug": "foundations-of-american-democracy",
      "title": "Foundations of American Democracy",
      "summary": "Democratic ideals, the Constitution, and federalism.",
      "concepts": [
        {
          "title": "Foundations of American Democracy",
          "topics": [
            {
              "slug": "democratic-ideals-and-models-of-democracy",
              "title": "Democratic Ideals and Models of Democracy",
              "summary": "Participatory, pluralist, and elite democracy describe different ways citizens influence government.",
              "aliases": [
                "pluralism",
                "elite democracy"
              ]
            },
            {
              "slug": "federalist-no-10-no-51-and-brutus-no-1",
              "title": "Federalist No. 10, No. 51, and Brutus No. 1",
              "summary": "The founders debated factions, checks and balances, and the size of the republic.",
              "aliases": [
                "federalist 10",
                "federalist 51",
                "brutus 1"
              ]
            },
            {
              "slug": "the-articles-of-confederation-and-ratification",
              "title": "The Articles of Confederation and Ratification",
              "summary": "The weak Articles led to the Constitutional Convention and a ratification fight between Federalists and Anti-Federalists.",
              "points": [
                "Weaknesses of the Articles",
                "Shays' Rebellion",
                "Ratification debates"
              ],
              "aliases": [
                "articles of confederation",
                "anti federalists"
              ]
            },
            {
              "slug": "the-constitution-and-its-compromises",
              "title": "The Constitution and Its Compromises",
              "summary": "The Great Compromise, the Three-Fifths Compromise, and the amendment process shaped the Constitution.",
              "aliases": [
                "great compromise",
                "constitution"
              ]
            },
            {
              "slug": "federalism",
              "title": "Federalism",
              "summary": "Power is divided between national and state governments, and McCulloch v. Maryland and US v. Lopez define the balance.",
              "aliases": [
                "federalism",
                "mcculloch v maryland",
                "us v lopez"
              ]
            },
            {
              "slug": "federalism-in-action",
              "title": "Federalism in Action",
              "summary": "Grants, mandates, and court cases like McCulloch v. Maryland and U.S. v. Lopez shape the balance of state and national power.",
              "points": [
                "Categorical and block grants",
                "Mandates",
                "McCulloch and Lopez"
              ],
              "aliases": [
                "mcculloch v maryland",
                "us v lopez",
                "fiscal federalism"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "interactions-among-branches-of-government",
      "title": "Interactions Among Branches of Government",
      "summary": "Congress, the president, the courts, and the bureaucracy.",
      "concepts": [
        {
          "title": "Interactions Among Branches of Government",
          "topics": [
            {
              "slug": "congress",
              "title": "Congress",
              "summary": "The House and Senate have different powers, and the legislative process is full of veto points.",
              "aliases": [
                "congress",
                "house vs senate",
                "filibuster"
              ]
            },
            {
              "slug": "congressional-behavior",
              "title": "Congressional Behavior",
              "summary": "Members of Congress act as delegates, trustees, or politicos, and face gridlock, gerrymandering, and partisanship.",
              "points": [
                "Representation models",
                "Gerrymandering and Baker v. Carr",
                "Divided government"
              ],
              "aliases": [
                "congressional behavior",
                "baker v carr",
                "shaw v reno"
              ]
            },
            {
              "slug": "the-presidency",
              "title": "The Presidency",
              "summary": "Formal and informal powers let presidents shape policy beyond the text of Article II.",
              "aliases": [
                "presidential powers",
                "executive orders"
              ]
            },
            {
              "slug": "checks-on-and-expansion-of-presidential-power",
              "title": "Checks on and Expansion of Presidential Power",
              "summary": "Congress and courts check the president, while executive orders, signing statements, and the bully pulpit have expanded the office.",
              "points": [
                "Formal and informal powers",
                "Federalist No. 70",
                "Executive orders"
              ],
              "aliases": [
                "federalist 70",
                "presidential power"
              ]
            },
            {
              "slug": "the-judiciary-and-judicial-review",
              "title": "The Judiciary and Judicial Review",
              "summary": "Marbury v. Madison established judicial review, and the Court's legitimacy rests on public trust.",
              "aliases": [
                "marbury v madison",
                "judicial review",
                "supreme court"
              ]
            },
            {
              "slug": "checks-on-the-judicial-branch",
              "title": "Checks on the Judicial Branch",
              "summary": "Appointments, legislation, and noncompliance check the courts; judicial activism and restraint shape how judges rule.",
              "points": [
                "Federalist No. 78",
                "Activism vs. restraint",
                "Stare decisis"
              ],
              "aliases": [
                "federalist 78",
                "judicial activism"
              ]
            },
            {
              "slug": "the-bureaucracy",
              "title": "The Bureaucracy",
              "summary": "Federal agencies write and enforce rules, checked by Congress and the president.",
              "aliases": [
                "bureaucracy",
                "iron triangle"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "civil-liberties-and-civil-rights",
      "title": "Civil Liberties and Civil Rights",
      "summary": "Rights protected by the Bill of Rights and the Fourteenth Amendment.",
      "concepts": [
        {
          "title": "Civil Liberties and Civil Rights",
          "topics": [
            {
              "slug": "the-bill-of-rights",
              "title": "The Bill of Rights",
              "summary": "The first ten amendments protect individual liberties from government, balanced against public order and safety.",
              "points": [
                "Purpose of the Bill of Rights",
                "Liberties vs. rights",
                "Balancing freedom and safety"
              ],
              "aliases": [
                "bill of rights"
              ]
            },
            {
              "slug": "first-amendment-freedoms",
              "title": "First Amendment Freedoms",
              "summary": "Engel v. Vitale, Wisconsin v. Yoder, Tinker, and Schenck define religion and speech protections.",
              "aliases": [
                "first amendment",
                "tinker v des moines",
                "schenck"
              ]
            },
            {
              "slug": "second-amendment-and-rights-of-the-accused",
              "title": "Second Amendment and Rights of the Accused",
              "summary": "The Second Amendment protects gun ownership (McDonald v. Chicago); due process protects the accused (Gideon v. Wainwright, Miranda).",
              "points": [
                "McDonald v. Chicago",
                "Gideon v. Wainwright",
                "Search and seizure"
              ],
              "aliases": [
                "gideon v wainwright",
                "mcdonald v chicago",
                "rights of the accused"
              ]
            },
            {
              "slug": "selective-incorporation-and-due-process",
              "title": "Selective Incorporation and Due Process",
              "summary": "The Fourteenth Amendment applies the Bill of Rights to the states, as in Gideon and McDonald v. Chicago.",
              "aliases": [
                "selective incorporation",
                "gideon v wainwright",
                "mcdonald v chicago"
              ]
            },
            {
              "slug": "civil-rights-and-equal-protection",
              "title": "Civil Rights and Equal Protection",
              "summary": "Brown v. Board and the Civil Rights Act advanced equal protection.",
              "aliases": [
                "brown v board",
                "equal protection clause",
                "civil rights act"
              ]
            },
            {
              "slug": "minority-rights-and-affirmative-action",
              "title": "Minority Rights and Affirmative Action",
              "summary": "Courts and Congress balance majority rule with minority rights, from Brown v. Board to debates over affirmative action.",
              "points": [
                "Brown v. Board",
                "Civil Rights Act",
                "Affirmative action"
              ],
              "aliases": [
                "affirmative action",
                "brown v board"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "american-political-ideologies-and-beliefs",
      "title": "American Political Ideologies and Beliefs",
      "summary": "Political socialization, public opinion, and ideology.",
      "concepts": [
        {
          "title": "American Political Ideologies and Beliefs",
          "topics": [
            {
              "slug": "political-socialization-and-public-opinion-polling",
              "title": "Political Socialization and Public Opinion Polling",
              "summary": "Family, school, and events shape political beliefs, and scientific polls measure them.",
              "aliases": [
                "political socialization",
                "polling"
              ]
            },
            {
              "slug": "liberal-and-conservative-ideologies",
              "title": "Liberal and Conservative Ideologies",
              "summary": "Ideology shapes views on the economy, social issues, and the role of government.",
              "aliases": [
                "political ideology",
                "fiscal policy"
              ]
            },
            {
              "slug": "ideology-and-policymaking",
              "title": "Ideology and Policymaking",
              "summary": "Ideology shapes economic and social policy, from views on taxes and regulation to debates over individual liberty.",
              "points": [
                "Keynesian vs. supply-side",
                "Monetary policy and the Fed",
                "Social policy"
              ],
              "aliases": [
                "ideology and policy",
                "keynesian"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "political-participation",
      "title": "Political Participation",
      "summary": "Voting, parties, interest groups, elections, and media.",
      "concepts": [
        {
          "title": "Political Participation",
          "topics": [
            {
              "slug": "voting-and-voter-turnout",
              "title": "Voting and Voter Turnout",
              "summary": "Voting models and demographics explain who votes and why.",
              "aliases": [
                "voter turnout",
                "rational choice voting"
              ]
            },
            {
              "slug": "political-parties-and-interest-groups",
              "title": "Political Parties and Interest Groups",
              "summary": "Parties organize coalitions to win elections; interest groups lobby to shape policy.",
              "aliases": [
                "political parties",
                "interest groups",
                "lobbying"
              ]
            },
            {
              "slug": "third-parties-and-party-change",
              "title": "Third Parties and Party Change",
              "summary": "Parties realign over time; third parties raise issues but rarely win under winner-take-all rules.",
              "points": [
                "Realignment",
                "Third-party influence",
                "Winner-take-all systems"
              ],
              "aliases": [
                "third parties",
                "realignment"
              ]
            },
            {
              "slug": "elections-and-campaign-finance",
              "title": "Elections and Campaign Finance",
              "summary": "The Electoral College and Citizens United shape how campaigns are run and funded.",
              "aliases": [
                "electoral college",
                "citizens united",
                "campaign finance"
              ]
            },
            {
              "slug": "the-media",
              "title": "The Media",
              "summary": "News media act as gatekeepers and watchdogs; changing media and social media shape public opinion.",
              "points": [
                "Gatekeeper and watchdog roles",
                "Media bias",
                "Social media"
              ],
              "aliases": [
                "media and politics"
              ]
            }
          ]
        }
      ]
    }
  ]
};
