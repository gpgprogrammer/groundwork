import type { CourseSpec } from "../spec";

/**
 * AP Statistics, following the College Board Course and Exam Description (units and topics in CED order).
 */
export const stats: CourseSpec = {
  "course": {
    "slug": "ap-statistics",
    "title": "AP Statistics",
    "shortTitle": "AP Stats",
    "exam": "AP",
    "category": "Math & Computer Science",
    "description": "The College Board course revised for 2026–27: five units, from exploring and collecting data through probability, inference for proportions and means, and regression.",
    "hue": 200,
    "examMonth": "May",
    "query": "AP Statistics",
    "keywords": [
      "ap stats",
      "ap statistics",
      "statistics",
      "stats"
    ]
  },
  "units": [
    {
      "slug": "exploring-one-variable-data",
      "title": "Exploring One-Variable Data and Collecting Data",
      "summary": "Asking investigative questions, describing distributions, and collecting data well.",
      "concepts": [
        {
          "title": "Describing data",
          "topics": [
            {
              "slug": "investigative-questions-and-variables",
              "title": "Investigative Questions and Variables",
              "summary": "Statistics starts with a question that data can answer; categorical and quantitative variables need different tools.",
              "points": [
                "Statistical questions",
                "Categorical vs. quantitative",
                "The statistical problem-solving process"
              ],
              "aliases": [
                "investigative questions",
                "types of variables"
              ]
            },
            {
              "slug": "displaying-categorical-data",
              "title": "Displaying Categorical Data",
              "summary": "Frequency tables, bar charts, and pie charts summarize one categorical variable with counts and proportions.",
              "points": [
                "Frequency and relative frequency",
                "Bar charts",
                "Describing categorical data"
              ],
              "aliases": [
                "bar graph",
                "categorical data"
              ]
            },
            {
              "slug": "describing-distributions",
              "title": "Describing Distributions",
              "summary": "Describe a distribution by its shape, center, spread, and any unusual features, always in context.",
              "aliases": [
                "shape center spread",
                "SOCS"
              ]
            },
            {
              "slug": "summary-statistics-and-boxplots",
              "title": "Summary Statistics and Boxplots",
              "summary": "The five-number summary and IQR resist outliers; the mean and standard deviation don't.",
              "aliases": [
                "five number summary",
                "IQR",
                "boxplot",
                "outliers"
              ]
            },
            {
              "slug": "comparing-distributions",
              "title": "Comparing Distributions",
              "summary": "Compare two or more distributions by shape, center, variability, and unusual features, with comparative language.",
              "points": [
                "Back-to-back stemplots and parallel boxplots",
                "Comparing center and spread",
                "Writing comparisons"
              ],
              "aliases": [
                "comparing distributions"
              ]
            }
          ]
        },
        {
          "title": "Collecting data",
          "topics": [
            {
              "slug": "sampling-methods",
              "title": "Sampling Methods",
              "summary": "Simple random, stratified, cluster, and systematic samples each use chance in a different way.",
              "aliases": [
                "random sampling",
                "stratified sample",
                "cluster sample"
              ]
            },
            {
              "slug": "bias-in-sampling",
              "title": "Bias in Sampling",
              "summary": "Undercoverage, nonresponse, and response bias skew results no matter how large the sample.",
              "aliases": [
                "sampling bias",
                "voluntary response"
              ]
            },
            {
              "slug": "experimental-design",
              "title": "Experimental Design",
              "summary": "Random assignment, control, replication, and blocking let an experiment show cause and effect.",
              "aliases": [
                "experiments",
                "random assignment",
                "blocking",
                "confounding"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "probability-random-variables-and-probability-distributions",
      "title": "Probability, Random Variables, and Probability Distributions",
      "summary": "Two-way tables, probability, random variables, and the normal and binomial distributions.",
      "concepts": [
        {
          "title": "Probability, Random Variables, and Probability Distributions",
          "topics": [
            {
              "slug": "two-way-tables",
              "title": "Two-Way Tables",
              "summary": "Marginal and conditional relative frequencies show whether two categorical variables are associated.",
              "aliases": [
                "two way tables",
                "conditional distribution"
              ]
            },
            {
              "slug": "simulation-and-probability",
              "title": "Simulation and Probability",
              "summary": "Simulate a chance process many times to estimate a probability; long-run relative frequency is what probability means.",
              "points": [
                "Designing a simulation",
                "Law of large numbers",
                "Estimating probability"
              ],
              "aliases": [
                "simulation",
                "law of large numbers"
              ]
            },
            {
              "slug": "probability-rules",
              "title": "Probability Rules",
              "summary": "The addition and multiplication rules, and conditional probability, handle combined events.",
              "aliases": [
                "conditional probability",
                "independent events",
                "addition rule"
              ]
            },
            {
              "slug": "conditional-probability-and-independence",
              "title": "Conditional Probability and Independence",
              "summary": "P(A | B) is the probability of A given B; events are independent when knowing one doesn't change the other.",
              "points": [
                "Conditional probability formula",
                "Checking independence",
                "Tree diagrams"
              ],
              "aliases": [
                "conditional probability",
                "independent events"
              ]
            },
            {
              "slug": "random-variables",
              "title": "Random Variables",
              "summary": "A random variable's expected value is its long-run average, and its standard deviation measures typical variation.",
              "aliases": [
                "expected value",
                "discrete random variables"
              ]
            },
            {
              "slug": "binomial-distributions",
              "title": "Binomial Distributions",
              "summary": "Binomial settings count successes in a fixed number of independent trials with the same probability.",
              "aliases": [
                "binomial distribution",
                "binompdf",
                "binomcdf"
              ]
            },
            {
              "slug": "the-normal-distribution-and-z-scores",
              "title": "The Normal Distribution and z-Scores",
              "summary": "A z-score measures how many standard deviations a value is from the mean, and the empirical rule describes normal data.",
              "aliases": [
                "normal distribution",
                "z score",
                "empirical rule",
                "68 95 99.7"
              ]
            },
            {
              "slug": "sampling-distributions-and-the-central-limit-theorem",
              "title": "Sampling Distributions and the Central Limit Theorem",
              "summary": "The CLT says sample means are approximately normal for large samples, whatever the population's shape.",
              "aliases": [
                "central limit theorem",
                "CLT",
                "sampling distribution"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "inference-for-categorical-data-proportions",
      "title": "Inference for Categorical Data: Proportions",
      "summary": "Confidence intervals and tests for proportions, and chi-square tests.",
      "concepts": [
        {
          "title": "Inference for Categorical Data: Proportions",
          "topics": [
            {
              "slug": "sampling-distributions-for-proportions",
              "title": "Sampling Distributions for Proportions",
              "summary": "Sample proportions center on p with standard deviation √(p(1−p)/n) when conditions are met.",
              "aliases": [
                "sample proportion"
              ]
            },
            {
              "slug": "confidence-intervals-for-proportions",
              "title": "Confidence Intervals for Proportions",
              "summary": "A confidence interval is a point estimate plus or minus a margin of error, with a confidence level describing the method.",
              "aliases": [
                "confidence interval",
                "margin of error"
              ]
            },
            {
              "slug": "significance-tests-for-proportions",
              "title": "Significance Tests for Proportions",
              "summary": "A p-value is the probability of results at least this extreme if the null hypothesis were true.",
              "aliases": [
                "hypothesis testing",
                "p value",
                "one proportion z test"
              ]
            },
            {
              "slug": "p-values-and-conclusions",
              "title": "p-Values and Conclusions",
              "summary": "A p-value is the probability of a result at least this extreme if the null hypothesis is true; compare it to α and write the conclusion in context.",
              "points": [
                "Interpreting a p-value",
                "Comparing to α",
                "Conclusions in context"
              ],
              "aliases": [
                "p value",
                "interpreting p values"
              ]
            },
            {
              "slug": "type-i-and-type-ii-errors-and-power",
              "title": "Type I and Type II Errors and Power",
              "summary": "A Type I error rejects a true null; a Type II error misses a false one. Power is the chance of catching a real effect.",
              "aliases": [
                "type 1 error",
                "type 2 error",
                "power"
              ]
            },
            {
              "slug": "two-proportion-inference",
              "title": "Two-Proportion Inference",
              "summary": "Compare two groups with a two-proportion z-interval or z-test.",
              "aliases": [
                "two proportion z test"
              ]
            },
            {
              "slug": "chi-square-tests-for-homogeneity-and-independence",
              "title": "Chi-Square Tests for Homogeneity and Independence",
              "summary": "Tests whether distributions differ across groups or whether two variables are associated.",
              "aliases": [
                "chi square independence",
                "chi square homogeneity"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "inference-for-quantitative-data-means",
      "title": "Inference for Quantitative Data: Means",
      "summary": "t-intervals and t-tests for one mean, paired data, and two means.",
      "concepts": [
        {
          "title": "Inference for Quantitative Data: Means",
          "topics": [
            {
              "slug": "sampling-distributions-for-means",
              "title": "Sampling Distributions for Means",
              "summary": "Sample means vary less than individual values (σ/√n) and are approximately normal for large samples.",
              "points": [
                "Standard error of x̄",
                "Central Limit Theorem for means",
                "Difference of two means"
              ],
              "aliases": [
                "sampling distribution of the mean"
              ]
            },
            {
              "slug": "t-intervals-and-t-tests-for-a-mean",
              "title": "t-Intervals and t-Tests for a Mean",
              "summary": "Use t-procedures for means when σ is unknown, checking random, 10%, and normal/large sample conditions.",
              "aliases": [
                "t test",
                "t interval",
                "degrees of freedom"
              ]
            },
            {
              "slug": "two-sample-and-paired-t-procedures",
              "title": "Two-Sample and Paired t-Procedures",
              "summary": "Paired data gets a one-sample t on the differences; independent groups get a two-sample t.",
              "aliases": [
                "paired t test",
                "two sample t test"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "regression-analysis",
      "title": "Regression Analysis",
      "summary": "Scatterplots, correlation, and least-squares regression.",
      "concepts": [
        {
          "title": "Regression Analysis",
          "topics": [
            {
              "slug": "scatterplots-and-correlation",
              "title": "Scatterplots and Correlation",
              "summary": "Correlation measures the strength and direction of a linear relationship, and it isn't causation.",
              "aliases": [
                "correlation coefficient",
                "scatterplot"
              ]
            },
            {
              "slug": "least-squares-regression",
              "title": "Least-Squares Regression",
              "summary": "The regression line minimizes squared residuals; interpret its slope as the predicted change in y per unit of x.",
              "aliases": [
                "linear regression",
                "LSRL",
                "slope interpretation"
              ]
            },
            {
              "slug": "residuals-and-r-squared",
              "title": "Residuals and r-squared",
              "summary": "Residual plots reveal whether a linear model fits, and r² is the share of variation in y the model explains.",
              "aliases": [
                "residual plot",
                "coefficient of determination",
                "r squared"
              ]
            }
          ]
        }
      ]
    }
  ]
};
