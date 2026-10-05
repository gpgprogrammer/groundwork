import type { CourseSpec } from "../spec";

/**
 * AP Microeconomics, following the College Board Course and Exam Description (units and topics in CED order).
 */
export const micro: CourseSpec = {
  "course": {
    "slug": "ap-microeconomics",
    "title": "AP Microeconomics",
    "shortTitle": "AP Micro",
    "exam": "AP",
    "category": "History & Social Sciences",
    "description": "How individuals and firms make choices: supply and demand, elasticity, market structures, factor markets, and market failure.",
    "hue": 130,
    "examMonth": "May",
    "query": "AP Microeconomics",
    "keywords": [
      "ap micro",
      "ap microeconomics",
      "microeconomics",
      "micro econ"
    ]
  },
  "units": [
    {
      "slug": "basic-economic-concepts",
      "title": "Basic Economic Concepts",
      "summary": "Scarcity, economic systems, trade, and marginal thinking.",
      "concepts": [
        {
          "title": "Basic Economic Concepts",
          "topics": [
            {
              "slug": "scarcity-and-opportunity-cost",
              "title": "Scarcity and Opportunity Cost",
              "summary": "Every choice has an opportunity cost, the value of the next best alternative.",
              "aliases": [
                "opportunity cost",
                "ppc"
              ]
            },
            {
              "slug": "economic-systems-and-comparative-advantage",
              "title": "Economic Systems and Comparative Advantage",
              "summary": "Market, command, and mixed economies allocate resources differently; specialization by comparative advantage creates gains from trade.",
              "points": [
                "Economic systems",
                "Comparative advantage",
                "Terms of trade"
              ],
              "aliases": [
                "comparative advantage",
                "economic systems"
              ]
            },
            {
              "slug": "marginal-analysis-and-utility",
              "title": "Marginal Analysis and Utility",
              "summary": "Rational choices compare marginal benefit to marginal cost; utility maximization equalizes MU per dollar.",
              "aliases": [
                "marginal utility",
                "utility maximization"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "supply-and-demand",
      "title": "Supply and Demand",
      "summary": "Markets, elasticity, surplus, and government intervention.",
      "concepts": [
        {
          "title": "Supply and Demand",
          "topics": [
            {
              "slug": "shifts-in-supply-and-demand",
              "title": "Shifts in Supply and Demand",
              "summary": "Changes in income, tastes, input costs, and technology shift the curves and the equilibrium.",
              "aliases": [
                "supply and demand shifts"
              ]
            },
            {
              "slug": "elasticity",
              "title": "Elasticity",
              "summary": "Elasticity measures how strongly quantity responds to price or income changes.",
              "aliases": [
                "price elasticity",
                "elasticity of demand",
                "total revenue test"
              ]
            },
            {
              "slug": "consumer-and-producer-surplus-and-deadweight-loss",
              "title": "Consumer and Producer Surplus and Deadweight Loss",
              "summary": "Taxes, price ceilings, and price floors reduce total surplus.",
              "aliases": [
                "consumer surplus",
                "deadweight loss",
                "price ceiling",
                "price floor"
              ]
            },
            {
              "slug": "government-intervention-and-trade",
              "title": "Government Intervention and Trade",
              "summary": "Price ceilings, floors, taxes, subsidies, and tariffs change prices and quantities and create deadweight loss.",
              "points": [
                "Price ceilings and floors",
                "Taxes and subsidies",
                "Tariffs and quotas"
              ],
              "aliases": [
                "price ceiling",
                "tariffs",
                "tax incidence"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "production-cost-and-the-perfect-competition-model",
      "title": "Production, Cost, and the Perfect Competition Model",
      "summary": "Production, costs, and perfectly competitive firms.",
      "concepts": [
        {
          "title": "Production, Cost, and the Perfect Competition Model",
          "topics": [
            {
              "slug": "the-production-function",
              "title": "The Production Function",
              "summary": "Adding workers raises output at first, then diminishing marginal returns set in.",
              "points": [
                "Total, marginal, and average product",
                "Diminishing marginal returns",
                "Short run vs. long run"
              ],
              "aliases": [
                "production function",
                "diminishing marginal returns"
              ]
            },
            {
              "slug": "short-run-and-long-run-costs",
              "title": "Short-Run and Long-Run Costs",
              "summary": "Marginal, average, fixed, and variable costs follow predictable shapes.",
              "aliases": [
                "cost curves",
                "marginal cost",
                "economies of scale"
              ]
            },
            {
              "slug": "profit-maximization-and-perfect-competition",
              "title": "Profit Maximization and Perfect Competition",
              "summary": "Firms produce where MR = MC; in perfect competition long-run profit goes to zero.",
              "aliases": [
                "mr mc",
                "perfect competition",
                "shutdown point"
              ]
            },
            {
              "slug": "entry-exit-and-long-run-equilibrium",
              "title": "Entry, Exit, and Long-Run Equilibrium",
              "summary": "Firms shut down when price falls below average variable cost; entry and exit drive long-run economic profit to zero.",
              "points": [
                "Shutdown rule",
                "Economic vs. accounting profit",
                "Long-run equilibrium"
              ],
              "aliases": [
                "shutdown point",
                "long run equilibrium"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "imperfect-competition",
      "title": "Imperfect Competition",
      "summary": "Monopoly, monopolistic competition, and oligopoly.",
      "concepts": [
        {
          "title": "Imperfect Competition",
          "topics": [
            {
              "slug": "monopoly",
              "title": "Monopoly",
              "summary": "A monopolist restricts output and charges above marginal cost, creating deadweight loss.",
              "aliases": [
                "monopoly",
                "price discrimination"
              ]
            },
            {
              "slug": "price-discrimination",
              "title": "Price Discrimination",
              "summary": "Charging different customers different prices lets a monopolist capture more consumer surplus.",
              "points": [
                "Conditions for price discrimination",
                "Perfect price discrimination",
                "Real-world examples"
              ],
              "aliases": [
                "price discrimination"
              ]
            },
            {
              "slug": "monopolistic-competition",
              "title": "Monopolistic Competition",
              "summary": "Many firms sell differentiated products and earn zero long-run economic profit.",
              "aliases": [
                "monopolistic competition"
              ]
            },
            {
              "slug": "oligopoly-and-game-theory",
              "title": "Oligopoly and Game Theory",
              "summary": "Firms in an oligopoly anticipate rivals' moves, as game theory models.",
              "aliases": [
                "game theory",
                "nash equilibrium",
                "oligopoly",
                "dominant strategy"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "factor-markets",
      "title": "Factor Markets",
      "summary": "Labor and resource markets.",
      "concepts": [
        {
          "title": "Factor Markets",
          "topics": [
            {
              "slug": "labor-markets-and-mrp",
              "title": "Labor Markets and MRP",
              "summary": "Firms hire until marginal revenue product equals the wage.",
              "aliases": [
                "marginal revenue product",
                "labor market",
                "monopsony"
              ]
            },
            {
              "slug": "monopsony",
              "title": "Monopsony",
              "summary": "A single dominant buyer of labor pays less and hires fewer workers than a competitive market would.",
              "points": [
                "Marginal factor cost",
                "Wages and employment",
                "Minimum wage in monopsony"
              ],
              "aliases": [
                "monopsony"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "market-failure-and-the-role-of-government",
      "title": "Market Failure and the Role of Government",
      "summary": "Externalities, public goods, and inequality.",
      "concepts": [
        {
          "title": "Market Failure and the Role of Government",
          "topics": [
            {
              "slug": "socially-efficient-outcomes",
              "title": "Socially Efficient Outcomes",
              "summary": "Markets are efficient when marginal social benefit equals marginal social cost; market failures break that.",
              "points": [
                "MSB = MSC",
                "Allocative efficiency",
                "Sources of market failure"
              ],
              "aliases": [
                "market efficiency"
              ]
            },
            {
              "slug": "externalities",
              "title": "Externalities",
              "summary": "Pollution and education affect third parties, so markets over- or under-produce them.",
              "aliases": [
                "externalities",
                "negative externality",
                "positive externality"
              ]
            },
            {
              "slug": "public-goods-and-income-inequality",
              "title": "Public Goods and Income Inequality",
              "summary": "Nonrival, nonexcludable goods suffer from free riders, and taxes redistribute income.",
              "aliases": [
                "public goods",
                "free rider",
                "lorenz curve",
                "gini"
              ]
            },
            {
              "slug": "government-intervention-in-different-markets",
              "title": "Government Intervention in Different Markets",
              "summary": "Regulation, antitrust law, and price controls on monopolies can improve or worsen efficiency.",
              "points": [
                "Antitrust",
                "Regulating natural monopolies",
                "Fair-return and socially optimal prices"
              ],
              "aliases": [
                "antitrust",
                "natural monopoly regulation"
              ]
            }
          ]
        }
      ]
    }
  ]
};
