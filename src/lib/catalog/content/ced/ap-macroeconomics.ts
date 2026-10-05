import type { CourseSpec } from "../spec";

/**
 * AP Macroeconomics, following the College Board Course and Exam Description (units and topics in CED order).
 */
export const macro: CourseSpec = {
  "course": {
    "slug": "ap-macroeconomics",
    "title": "AP Macroeconomics",
    "shortTitle": "AP Macro",
    "exam": "AP",
    "category": "History & Social Sciences",
    "description": "The economy as a whole: GDP, inflation, unemployment, fiscal and monetary policy, and international trade.",
    "hue": 150,
    "examMonth": "May",
    "query": "AP Macroeconomics",
    "keywords": [
      "ap macro",
      "ap macroeconomics",
      "macroeconomics",
      "macro econ"
    ]
  },
  "units": [
    {
      "slug": "basic-economic-concepts",
      "title": "Basic Economic Concepts",
      "summary": "Scarcity, trade-offs, trade, and supply and demand.",
      "concepts": [
        {
          "title": "Basic Economic Concepts",
          "topics": [
            {
              "slug": "scarcity-opportunity-cost-and-the-ppc",
              "title": "Scarcity, Opportunity Cost, and the PPC",
              "summary": "The production possibilities curve shows tradeoffs and the cost of choosing one good over another.",
              "aliases": [
                "ppc",
                "production possibilities curve",
                "opportunity cost"
              ]
            },
            {
              "slug": "comparative-advantage-and-trade",
              "title": "Comparative Advantage and Trade",
              "summary": "Countries gain from specializing in what they produce at the lowest opportunity cost.",
              "aliases": [
                "comparative advantage",
                "absolute advantage"
              ]
            },
            {
              "slug": "supply-demand-and-market-equilibrium",
              "title": "Supply, Demand, and Market Equilibrium",
              "summary": "Prices adjust until quantity supplied equals quantity demanded.",
              "aliases": [
                "supply and demand",
                "equilibrium"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "economic-indicators-and-the-business-cycle",
      "title": "Economic Indicators and the Business Cycle",
      "summary": "GDP, unemployment, inflation, and the business cycle.",
      "concepts": [
        {
          "title": "Economic Indicators and the Business Cycle",
          "topics": [
            {
              "slug": "gdp-and-how-its-measured",
              "title": "GDP and How It's Measured",
              "summary": "GDP counts the market value of final goods and services, measured by spending or income.",
              "aliases": [
                "gdp",
                "expenditure approach",
                "real vs nominal gdp"
              ]
            },
            {
              "slug": "unemployment",
              "title": "Unemployment",
              "summary": "Frictional, structural, and cyclical unemployment have different causes; the natural rate excludes cyclical.",
              "aliases": [
                "unemployment rate",
                "natural rate of unemployment"
              ]
            },
            {
              "slug": "inflation-and-the-cpi",
              "title": "Inflation and the CPI",
              "summary": "The CPI tracks the price level, and inflation hurts lenders and people on fixed incomes.",
              "aliases": [
                "inflation",
                "cpi"
              ]
            },
            {
              "slug": "real-vs-nominal-gdp-and-the-business-cycle",
              "title": "Real vs. Nominal GDP and the Business Cycle",
              "summary": "Real GDP adjusts for inflation; the business cycle swings through expansion, peak, contraction, and trough.",
              "points": [
                "GDP deflator",
                "Phases of the cycle",
                "Output gaps"
              ],
              "aliases": [
                "real gdp",
                "business cycle"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "national-income-and-price-determination",
      "title": "National Income and Price Determination",
      "summary": "The AD–AS model and fiscal policy.",
      "concepts": [
        {
          "title": "National Income and Price Determination",
          "topics": [
            {
              "slug": "aggregate-demand-and-aggregate-supply",
              "title": "Aggregate Demand and Aggregate Supply",
              "summary": "The AD–AS model shows how shocks move output and the price level in the short and long run.",
              "aliases": [
                "ad as model",
                "aggregate demand",
                "aggregate supply"
              ]
            },
            {
              "slug": "the-multiplier",
              "title": "The Multiplier",
              "summary": "An initial change in spending gets multiplied as it becomes someone else's income.",
              "aliases": [
                "spending multiplier",
                "mpc"
              ]
            },
            {
              "slug": "long-run-self-adjustment",
              "title": "Long-Run Self-Adjustment",
              "summary": "Without policy, wages and prices eventually adjust and the economy returns to full employment.",
              "points": [
                "Recessionary and inflationary gaps",
                "Wage flexibility",
                "LRAS"
              ],
              "aliases": [
                "self correction",
                "lras"
              ]
            },
            {
              "slug": "fiscal-policy",
              "title": "Fiscal Policy",
              "summary": "Government changes taxes and spending to close recessionary or inflationary gaps.",
              "aliases": [
                "fiscal policy",
                "recessionary gap",
                "inflationary gap"
              ]
            },
            {
              "slug": "automatic-stabilizers",
              "title": "Automatic Stabilizers",
              "summary": "Taxes and transfer payments automatically rise and fall with the economy, softening the business cycle.",
              "points": [
                "Progressive taxes",
                "Unemployment benefits",
                "Discretionary vs. automatic"
              ],
              "aliases": [
                "automatic stabilizers"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "financial-sector",
      "title": "Financial Sector",
      "summary": "Money, banks, and monetary policy.",
      "concepts": [
        {
          "title": "Financial Sector",
          "topics": [
            {
              "slug": "financial-assets-and-interest-rates",
              "title": "Financial Assets and Interest Rates",
              "summary": "Stocks, bonds, and money differ in liquidity and risk; bond prices and interest rates move in opposite directions.",
              "points": [
                "Liquidity",
                "Bond prices and rates",
                "Real vs. nominal interest"
              ],
              "aliases": [
                "financial assets",
                "real interest rate"
              ]
            },
            {
              "slug": "money-creation-and-the-money-multiplier",
              "title": "Money Creation and the Money Multiplier",
              "summary": "Banks create money by lending out excess reserves.",
              "aliases": [
                "money multiplier",
                "reserve requirement",
                "fractional reserve"
              ]
            },
            {
              "slug": "the-money-market-and-monetary-policy",
              "title": "The Money Market and Monetary Policy",
              "summary": "The Fed changes interest rates and the money supply to steer the economy.",
              "aliases": [
                "monetary policy",
                "federal reserve",
                "money market graph"
              ]
            },
            {
              "slug": "the-loanable-funds-market",
              "title": "The Loanable Funds Market",
              "summary": "Real interest rates balance saving and borrowing, and deficits can crowd out investment.",
              "aliases": [
                "loanable funds",
                "crowding out"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "long-run-consequences-of-stabilization-policies",
      "title": "Long-Run Consequences of Stabilization Policies",
      "summary": "Policy trade-offs, deficits, and growth.",
      "concepts": [
        {
          "title": "Long-Run Consequences of Stabilization Policies",
          "topics": [
            {
              "slug": "fiscal-and-monetary-policy-in-the-short-run",
              "title": "Fiscal and Monetary Policy in the Short Run",
              "summary": "Combining fiscal and monetary policy changes output, prices, and interest rates in predictable directions.",
              "points": [
                "Policy mixes",
                "Effects on interest rates",
                "Graphing combined policies"
              ],
              "aliases": [
                "policy mix"
              ]
            },
            {
              "slug": "the-phillips-curve",
              "title": "The Phillips Curve",
              "summary": "In the short run inflation and unemployment trade off; in the long run they don't.",
              "aliases": [
                "phillips curve"
              ]
            },
            {
              "slug": "money-growth-deficits-and-crowding-out",
              "title": "Money Growth, Deficits, and Crowding Out",
              "summary": "Too much money growth causes inflation; deficits can raise interest rates and crowd out private investment.",
              "points": [
                "Quantity theory of money",
                "National debt",
                "Crowding out"
              ],
              "aliases": [
                "crowding out",
                "quantity theory of money"
              ]
            },
            {
              "slug": "economic-growth",
              "title": "Economic Growth",
              "summary": "Growth comes from more capital, better technology, and more productive workers.",
              "aliases": [
                "economic growth",
                "productivity"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "open-economy-international-trade-and-finance",
      "title": "Open Economy: International Trade and Finance",
      "summary": "Trade balances, exchange rates, and capital flows.",
      "concepts": [
        {
          "title": "Open Economy: International Trade and Finance",
          "topics": [
            {
              "slug": "balance-of-payments",
              "title": "Balance of Payments",
              "summary": "The current and financial accounts record a country's transactions with the world.",
              "aliases": [
                "balance of payments",
                "current account"
              ]
            },
            {
              "slug": "exchange-rates-and-the-foreign-exchange-market",
              "title": "Exchange Rates and the Foreign Exchange Market",
              "summary": "Currency values move with interest rates, trade, and inflation.",
              "aliases": [
                "foreign exchange market",
                "exchange rates",
                "appreciation depreciation"
              ]
            },
            {
              "slug": "real-interest-rates-and-capital-flows",
              "title": "Real Interest Rates and Capital Flows",
              "summary": "Higher real interest rates attract foreign capital, appreciating the currency and changing net exports.",
              "points": [
                "Capital inflows",
                "Currency appreciation",
                "Effects on net exports"
              ],
              "aliases": [
                "capital flows"
              ]
            }
          ]
        }
      ]
    }
  ]
};
