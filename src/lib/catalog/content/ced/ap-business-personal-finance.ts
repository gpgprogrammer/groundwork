import type { CourseSpec } from "../spec";

/**
 * AP Business with Personal Finance, following the College Board Course and Exam Description (units and topics in CED order).
 */
export const business: CourseSpec = {
  "course": {
    "slug": "ap-business-personal-finance",
    "title": "AP Business with Personal Finance",
    "shortTitle": "AP Business",
    "exam": "AP",
    "category": "AP Career Kickstart",
    "description": "How businesses start, compete, market, and manage money, plus the personal finance skills of saving, borrowing, budgeting, and investing.",
    "hue": 150,
    "examMonth": "May",
    "query": "AP Business Personal Finance",
    "keywords": [
      "ap business",
      "ap business with personal finance",
      "ap personal finance",
      "business principles",
      "personal finance"
    ]
  },
  "units": [
    {
      "slug": "businesses-competition-and-new-ideas",
      "title": "Unit 1: Businesses, Competition, and New Ideas",
      "summary": "What businesses do and where ideas come from.",
      "concepts": [
        {
          "title": "Unit 1: Businesses, Competition, and New Ideas",
          "topics": [
            {
              "slug": "what-is-a-business",
              "title": "What Is a Business?",
              "summary": "A business creates value by solving a customer's problem; it can be a sole proprietorship, partnership, corporation, or nonprofit, and it has stakeholders beyond its owners.",
              "aliases": [
                "types of business",
                "business ownership",
                "stakeholders",
                "business ethics"
              ]
            },
            {
              "slug": "markets-and-competitive-advantage",
              "title": "Markets and Competitive Advantage",
              "summary": "Supply, demand, and competition set prices; a competitive advantage (cost, differentiation, or focus) lets a business win customers.",
              "aliases": [
                "competitive advantage",
                "market structure",
                "supply and demand business"
              ]
            },
            {
              "slug": "how-business-ideas-originate",
              "title": "How Business Ideas Originate",
              "summary": "Entrepreneurs spot unmet needs, test ideas with customers, and map them on a business model canvas.",
              "aliases": [
                "entrepreneurship",
                "business model canvas",
                "startup idea",
                "value proposition"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "marketing",
      "title": "Unit 2: Marketing",
      "summary": "Customers, behavior, and research.",
      "concepts": [
        {
          "title": "Unit 2: Marketing",
          "topics": [
            {
              "slug": "marketing-to-customers",
              "title": "Marketing to Customers",
              "summary": "The marketing mix (product, price, place, promotion) turns a product into something a target customer wants to buy.",
              "aliases": [
                "marketing mix",
                "4 ps of marketing",
                "target market",
                "branding"
              ]
            },
            {
              "slug": "consumer-behavior",
              "title": "Consumer Behavior",
              "summary": "Needs, emotions, social influence, and pricing cues shape what people buy.",
              "aliases": [
                "consumer behavior",
                "buying decision"
              ]
            },
            {
              "slug": "market-research",
              "title": "Market Research",
              "summary": "Surveys, interviews, and data analysis tell a business who its customers are and what they'll pay.",
              "aliases": [
                "market research",
                "market segmentation",
                "customer research"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "personal-saving-and-borrowing",
      "title": "Unit 3: Saving, Borrowing, and Business Finance",
      "summary": "Part 1, personal saving and borrowing; Part 2, business finance and accounting.",
      "concepts": [
        {
          "title": "Part 1: Personal Saving and Borrowing",
          "topics": [
            {
              "slug": "saving-for-future-purchases",
              "title": "Saving for Future Purchases",
              "summary": "Interest, especially compound interest, rewards saving early; banks and credit unions keep savings safe.",
              "aliases": [
                "compound interest",
                "savings account",
                "emergency fund"
              ]
            },
            {
              "slug": "borrowing-credit-and-debt",
              "title": "Borrowing, Credit, and Debt",
              "summary": "Loans and credit cards cost interest; APR, credit scores, and minimum payments determine the true cost of borrowing.",
              "aliases": [
                "credit score",
                "credit card",
                "apr",
                "student loans",
                "debt"
              ]
            }
          ]
        },
        {
          "title": "Part 2: Business Finance and Accounting",
          "topics": [
            {
              "slug": "accounting-and-financial-statements",
              "title": "Accounting and Financial Statements",
              "summary": "The income statement, balance sheet, and cash flow statement show whether a business is profitable and solvent.",
              "aliases": [
                "financial statements",
                "income statement",
                "balance sheet",
                "cash flow"
              ]
            },
            {
              "slug": "business-expenses-and-break-even",
              "title": "Business Expenses and Break-Even",
              "summary": "Fixed and variable costs determine the break-even point and how pricing affects profit.",
              "aliases": [
                "break even analysis",
                "fixed and variable costs",
                "profit margin"
              ]
            },
            {
              "slug": "financial-capital",
              "title": "Financial Capital",
              "summary": "Businesses raise money through savings, loans, investors, and equity, each with different costs and control.",
              "aliases": [
                "raising capital",
                "equity vs debt",
                "venture capital",
                "startup funding"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "management-and-strategy",
      "title": "Unit 4: Management and Strategy",
      "summary": "Leading people and making strategic decisions.",
      "concepts": [
        {
          "title": "Unit 4: Management and Strategy",
          "topics": [
            {
              "slug": "management-and-leadership",
              "title": "Management and Leadership",
              "summary": "Managers plan, organize, lead, and control; leadership style and motivation shape team performance.",
              "aliases": [
                "management functions",
                "leadership styles",
                "employee motivation"
              ]
            },
            {
              "slug": "strategy-and-decision-making",
              "title": "Strategy and Decision Making",
              "summary": "Businesses set goals and choose where to compete using data and a clear decision process.",
              "aliases": [
                "business strategy",
                "decision making"
              ]
            },
            {
              "slug": "strategic-frameworks",
              "title": "Strategic Frameworks",
              "summary": "SWOT analysis and similar frameworks organize strengths, weaknesses, opportunities, and threats.",
              "aliases": [
                "swot analysis",
                "porter's five forces"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "personal-goals-budgeting-and-investing",
      "title": "Unit 5: Personal Goals, Budgeting, and Investing",
      "summary": "Taxes, budgets, risk, and investing.",
      "concepts": [
        {
          "title": "Unit 5: Personal Goals, Budgeting, and Investing",
          "topics": [
            {
              "slug": "taxes-net-income-and-budgeting",
              "title": "Taxes, Net Income, and Budgeting",
              "summary": "Taxes and deductions turn gross pay into net income, and a budget plans where it goes.",
              "aliases": [
                "budgeting",
                "gross vs net income",
                "income tax",
                "paycheck"
              ]
            },
            {
              "slug": "managing-personal-risk",
              "title": "Managing Personal Risk",
              "summary": "Insurance and emergency savings protect against costly surprises.",
              "aliases": [
                "insurance",
                "health insurance",
                "car insurance"
              ]
            },
            {
              "slug": "saving-and-investing-for-big-goals",
              "title": "Saving and Investing for Big Goals",
              "summary": "Stocks, bonds, index funds, and retirement accounts grow money over time for education, housing, and retirement.",
              "aliases": [
                "investing",
                "stocks and bonds",
                "index funds",
                "401k",
                "roth ira"
              ]
            }
          ]
        }
      ]
    }
  ]
};
