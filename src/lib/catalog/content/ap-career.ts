import { course, t, u } from "./spec";

/** AP Career Kickstart courses (first exams May 2027). Units follow the College Board course frameworks. */

export const business = course(
  {
    slug: "ap-business-personal-finance",
    title: "AP Business with Personal Finance",
    shortTitle: "AP Business",
    category: "AP Career Kickstart",
    hue: 150,
    description: "How businesses start, compete, market, and manage money, plus the personal finance skills of saving, borrowing, budgeting, and investing.",
    query: "AP Business Personal Finance",
    keywords: ["ap business", "ap business with personal finance", "ap personal finance", "business principles", "personal finance"],
  },
  [
    u("Businesses, Competition, and New Ideas", "How businesses start, operate, compete, and make ethical decisions.", [
      t("What Is a Business?", "A business creates value by solving a customer's problem; it can be a sole proprietorship, partnership, corporation, or nonprofit, and it has stakeholders beyond its owners.", ["types of business", "business ownership", "stakeholders", "business ethics"]),
      t("Markets and Competitive Advantage", "Supply, demand, and competition set prices; a competitive advantage (cost, differentiation, or focus) lets a business win customers.", ["competitive advantage", "market structure", "supply and demand business"]),
      t("How Business Ideas Originate", "Entrepreneurs spot unmet needs, test ideas with customers, and map them on a business model canvas.", ["entrepreneurship", "business model canvas", "startup idea", "value proposition"]),
    ]),
    u("Marketing", "How businesses research, reach, and persuade customers.", [
      t("Marketing to Customers", "The marketing mix (product, price, place, promotion) turns a product into something a target customer wants to buy.", ["marketing mix", "4 ps of marketing", "target market", "branding"]),
      t("Consumer Behavior", "Needs, emotions, social influence, and pricing cues shape what people buy.", ["consumer behavior", "buying decision"]),
      t("Market Research", "Surveys, interviews, and data analysis tell a business who its customers are and what they'll pay.", ["market research", "market segmentation", "customer research"]),
    ]),
    u("Personal Saving and Borrowing", "How people save, borrow, and use credit.", [
      t("Saving for Future Purchases", "Interest, especially compound interest, rewards saving early; banks and credit unions keep savings safe.", ["compound interest", "savings account", "emergency fund"]),
      t("Borrowing, Credit, and Debt", "Loans and credit cards cost interest; APR, credit scores, and minimum payments determine the true cost of borrowing.", ["credit score", "credit card", "apr", "student loans", "debt"]),
    ]),
    u("Business Finance and Accounting", "The money side of launching and running a business.", [
      t("Accounting and Financial Statements", "The income statement, balance sheet, and cash flow statement show whether a business is profitable and solvent.", ["financial statements", "income statement", "balance sheet", "cash flow"]),
      t("Business Expenses and Break-Even", "Fixed and variable costs determine the break-even point and how pricing affects profit.", ["break even analysis", "fixed and variable costs", "profit margin"]),
      t("Financial Capital", "Businesses raise money through savings, loans, investors, and equity, each with different costs and control.", ["raising capital", "equity vs debt", "venture capital", "startup funding"]),
    ]),
    u("Management and Strategy", "Leading people and making strategic decisions.", [
      t("Management and Leadership", "Managers plan, organize, lead, and control; leadership style and motivation shape team performance.", ["management functions", "leadership styles", "employee motivation"]),
      t("Strategy and Decision Making", "Businesses set goals and choose where to compete using data and a clear decision process.", ["business strategy", "decision making"]),
      t("Strategic Frameworks", "SWOT analysis and similar frameworks organize strengths, weaknesses, opportunities, and threats.", ["swot analysis", "porter's five forces"]),
    ]),
    u("Personal Goals, Budgeting, and Investing", "Taxes, budgets, risk, and long-term goals.", [
      t("Taxes, Net Income, and Budgeting", "Taxes and deductions turn gross pay into net income, and a budget plans where it goes.", ["budgeting", "gross vs net income", "income tax", "paycheck"]),
      t("Managing Personal Risk", "Insurance and emergency savings protect against costly surprises.", ["insurance", "health insurance", "car insurance"]),
      t("Saving and Investing for Big Goals", "Stocks, bonds, index funds, and retirement accounts grow money over time for education, housing, and retirement.", ["investing", "stocks and bonds", "index funds", "401k", "roth ira"]),
    ]),
  ],
);

export const cybersecurity = course(
  {
    slug: "ap-cybersecurity",
    title: "AP Cybersecurity",
    shortTitle: "AP Cyber",
    category: "AP Career Kickstart",
    hue: 190,
    description: "How attackers break in and how defenders stop them: people, physical spaces, networks, devices, applications, and data.",
    query: "AP Cybersecurity",
    keywords: ["ap cybersecurity", "ap cyber", "cybersecurity", "ap cyber security"],
  },
  [
    u("Introduction to Security", "Threats, social engineering, and passwords.", [
      t("The CIA Triad and Risk", "Security protects confidentiality, integrity, and availability; risk weighs threats, vulnerabilities, and impact.", ["cia triad", "risk assessment", "threat vulnerability"]),
      t("Social Engineering and Phishing", "Attackers trick people with phishing, spear phishing, whaling, vishing, and smishing, often using open-source intelligence.", ["social engineering", "phishing", "spear phishing", "osint"]),
      t("Password Attacks and Authentication", "Brute force and credential stuffing break weak or reused passwords; strong passwords and MFA stop them.", ["password security", "brute force attack", "credential stuffing", "multi factor authentication"]),
    ]),
    u("Securing Spaces", "Protecting physical environments.", [
      t("Physical Security Controls", "Badges, locks, cameras, and layered controls keep attackers out of buildings and server rooms.", ["physical security", "access control", "defense in depth"]),
      t("Insider Threats", "Trusted people can cause harm on purpose or by accident; least privilege and monitoring limit the damage.", ["insider threat", "least privilege"]),
    ]),
    u("Securing Networks", "Network design, firewalls, and monitoring.", [
      t("How Networks Work", "Devices communicate through IP addresses, ports, and protocols across network topologies.", ["networking basics", "tcp ip", "osi model", "ports and protocols"]),
      t("Firewalls and Network Segmentation", "Firewalls filter traffic and segmentation isolates systems so one breach doesn't reach everything.", ["firewall", "network segmentation", "dmz"]),
      t("Intrusion Detection and Interception", "Monitoring tools detect attacks, and encryption stops eavesdropping on public Wi-Fi and man-in-the-middle attacks.", ["intrusion detection", "ids ips", "man in the middle", "wireshark"]),
    ]),
    u("Securing Devices", "Endpoints, malware, and hardening.", [
      t("Malware", "Viruses, worms, trojans, and ransomware spread and damage systems in different ways.", ["malware", "ransomware", "trojan", "computer virus"]),
      t("Hardening Devices", "Updates, secure configuration, and endpoint protection shrink the attack surface, including on IoT devices.", ["system hardening", "patch management", "iot security", "endpoint security"]),
    ]),
    u("Securing Applications and Data", "Encryption, trust, and protecting data.", [
      t("Encryption", "Symmetric and asymmetric encryption keep data secret in storage and in transit.", ["encryption", "symmetric vs asymmetric encryption", "public key cryptography"]),
      t("Hashing, Certificates, and Trust", "Hashes verify integrity, and digital certificates prove a website is who it claims to be.", ["hashing", "digital certificates", "https tls", "digital signature"]),
      t("Application and Data Security", "Input validation stops attacks like SQL injection, and data is protected across its whole lifecycle.", ["sql injection", "web application security", "data protection"]),
    ]),
  ],
);
