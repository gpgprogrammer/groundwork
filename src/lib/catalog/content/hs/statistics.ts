import { hsCourse } from "./outline";

/**
 * Statistics (the non-AP class), following the GAISE guidelines and the Common Core statistics
 * and probability standards: collecting data, describing it, probability, distributions, and an
 * introduction to inference.
 */
export const statistics = hsCourse(
  {
    slug: "statistics",
    title: "Statistics",
    shortTitle: "Statistics",
    category: "Math & Computer Science",
    hue: 190,
    grades: "Grade 11 or 12",
    description: "Collecting and describing data, probability, the normal distribution, regression, and an introduction to confidence intervals and significance tests.",
    keywords: ["statistics", "stats", "intro stats", "statistics class"],
  },
  `
# Collecting Data | Good conclusions start with how the data was gathered.
- Statistical Questions and Variables | Statistics answers questions with variability; variables are categorical or quantitative. | Statistical questions; Categorical vs. quantitative; Individuals and variables | types of variables; statistical questions
- Sampling Methods | Random samples represent a population; convenience and voluntary samples don't. | Simple random samples; Stratified and cluster samples; Sampling frames | sampling methods; random sampling
- Bias in Surveys | Undercoverage, nonresponse, and wording can bias a survey's results. | Undercoverage; Nonresponse; Response and wording bias | sampling bias; types of bias
- Observational Studies and Experiments | Only randomized experiments can show cause and effect. | Observational studies; Confounding; Explanatory and response variables | observational study vs experiment
- Designing Experiments | Control, randomization, replication, and blocking make experiments trustworthy. | Treatments and control groups; Blinding and placebos; Block designs | experimental design

# Describing Data | Graphs and numbers that summarize one variable.
- Displaying Categorical Data | Bar charts, pie charts, and two-way tables. | Bar graphs; Pie charts; Two-way tables | bar graphs; displaying categorical data
- Displaying Quantitative Data | Dotplots, stemplots, and histograms show a distribution's shape. | Dotplots; Stem-and-leaf plots; Histograms | histograms; stem and leaf plots; dot plots
- Describing Distributions | Shape, center, spread, and outliers describe a distribution. | Symmetric and skewed; Unimodal and bimodal; Outliers | shape center spread; describing distributions
- Measures of Center | Mean and median, and how skew and outliers pull them apart. | Mean; Median; Resistant measures | mean and median; measures of center
- Measures of Spread | Range, IQR, and standard deviation measure variability. | Range and IQR; Standard deviation; Variance | standard deviation; interquartile range
- Box Plots and Outliers | The five-number summary and the 1.5 × IQR rule. | Five-number summary; Box plots; Identifying outliers | box plots; five number summary
- Comparing Distributions | Comparing shape, center, and spread across groups. | Side-by-side box plots; Back-to-back stemplots; Writing comparisons | comparing distributions

# The Normal Distribution | Bell curves, z-scores, and percentiles.
- Percentiles and z-Scores | A z-score says how many standard deviations a value is from the mean. | Percentiles; z-scores; Comparing values | z scores; percentiles
- The Empirical Rule | In a normal distribution, 68%, 95%, and 99.7% of data fall within 1, 2, and 3 standard deviations. | 68-95-99.7 rule; Sketching normal curves; Estimating proportions | empirical rule; 68 95 99.7 rule
- Normal Distribution Calculations | Using tables or technology to find areas and values under a normal curve. | Finding areas; Finding values from percentiles; Normal probability plots | normal distribution calculations; normal curve

# Two-Variable Data | Relationships between two quantitative variables.
- Scatterplots and Correlation | Scatterplots show direction, form, and strength; r measures linear strength. | Direction, form, strength; Correlation coefficient r; Correlation vs. causation | scatterplots; correlation coefficient
- Least-Squares Regression | The regression line predicts y from x and minimizes squared residuals. | Slope and intercept in context; Predictions; Extrapolation | least squares regression line; linear regression
- Residuals and r-Squared | Residual plots check fit; r² is the share of variation the line explains. | Residuals; Residual plots; Coefficient of determination | residuals; r squared
- Two-Way Tables and Association | Conditional distributions show whether two categorical variables are related. | Marginal distributions; Conditional distributions; Segmented bar graphs | two way tables; conditional distributions

# Probability | The rules of chance.
- Probability and Simulation | Probability is long-run relative frequency; simulations estimate it. | Law of large numbers; Simulations; Random digits | probability simulation; law of large numbers
- Probability Rules | Complement, addition, and multiplication rules. | Complement rule; Addition rule; Mutually exclusive events | probability rules; addition rule
- Conditional Probability and Independence | P(A given B) and testing whether events are independent. | Conditional probability; Independence; Tree diagrams | conditional probability; independent events
- Counting Methods | Permutations and combinations count outcomes. | Counting principle; Permutations; Combinations | permutations and combinations

# Random Variables | Expected value and the binomial distribution.
- Discrete Random Variables | A random variable assigns numbers to outcomes; its mean is the expected value. | Probability distributions; Expected value; Standard deviation | discrete random variables; expected value
- The Binomial Distribution | Counting successes in a fixed number of independent trials. | Binomial setting; Binomial probabilities; Mean and standard deviation | binomial distribution
- The Geometric Distribution | Counting trials until the first success. | Geometric setting; Probabilities; Expected wait | geometric distribution

# Sampling Distributions | How statistics vary from sample to sample.
- Parameters, Statistics, and Sampling Variability | A statistic estimates a parameter and varies from sample to sample. | Parameters vs. statistics; Sampling variability; Bias and variability | sampling variability; parameter vs statistic
- Sampling Distribution of a Proportion | Sample proportions center on p with predictable spread. | Mean and standard deviation; Normal approximation; Large counts | sampling distribution of sample proportion
- Sampling Distribution of a Mean and the Central Limit Theorem | Sample means are approximately normal for large samples, whatever the population's shape. | Mean and standard error; Central limit theorem; Sample size | central limit theorem; sampling distribution of sample mean

# Introduction to Inference | Estimating with confidence and testing claims.
- Confidence Intervals for a Proportion | Estimate ± margin of error gives a range of plausible values for p. | Margin of error; Interpreting confidence; Sample size | confidence interval for a proportion
- Confidence Intervals for a Mean | t-intervals estimate a population mean. | The t distribution; Conditions; Interpreting the interval | confidence interval for a mean; t interval
- Significance Tests for a Proportion | Hypotheses, test statistics, and P-values test claims about p. | Null and alternative hypotheses; P-values; Conclusions in context | hypothesis testing; significance test for a proportion
- Significance Tests for a Mean | One-sample t-tests test claims about a mean. | t-test; Conditions; Type I and Type II errors | one sample t test; type 1 and type 2 errors
- Comparing Two Groups | Two-sample procedures compare proportions or means across groups. | Two-sample z for proportions; Two-sample t for means; Paired data | two sample t test; comparing two proportions
- Chi-Square Tests | Chi-square tests check goodness of fit and association between categorical variables. | Goodness of fit; Test of independence; Expected counts | chi square test
`,
);
