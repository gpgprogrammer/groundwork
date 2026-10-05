import type { CourseSpec } from "../spec";

/**
 * AP Psychology, following the College Board Course and Exam Description (units and topics in CED order).
 */
export const psych: CourseSpec = {
  "course": {
    "slug": "ap-psychology",
    "title": "AP Psychology",
    "shortTitle": "AP Psych",
    "exam": "AP",
    "category": "History & Social Sciences",
    "description": "Behavior and mental processes: the brain, cognition, development, learning, social psychology, and mental and physical health.",
    "hue": 300,
    "examMonth": "May",
    "query": "AP Psychology",
    "keywords": [
      "ap psych",
      "ap psychology",
      "psychology",
      "psych"
    ]
  },
  "units": [
    {
      "slug": "biological-bases-of-behavior",
      "title": "Biological Bases of Behavior",
      "summary": "Heredity, the nervous system, the brain, sleep, and sensation.",
      "concepts": [
        {
          "title": "Biological Bases of Behavior",
          "topics": [
            {
              "slug": "heredity-environment-and-research-methods",
              "title": "Heredity, Environment, and Research Methods",
              "summary": "Twin and adoption studies untangle nature and nurture; psychologists use experiments and correlational studies to test ideas.",
              "points": [
                "Twin and adoption studies",
                "Evolutionary psychology",
                "Research methods"
              ],
              "aliases": [
                "nature vs nurture",
                "twin studies"
              ]
            },
            {
              "slug": "neurons-and-neurotransmitters",
              "title": "Neurons and Neurotransmitters",
              "summary": "Neurons fire action potentials, and neurotransmitters carry signals across the synapse.",
              "aliases": [
                "action potential",
                "neurotransmitters",
                "synapse"
              ]
            },
            {
              "slug": "the-brain-and-nervous-system",
              "title": "The Brain and Nervous System",
              "summary": "Each brain region has specialized functions, and the nervous system divides into central and peripheral.",
              "aliases": [
                "brain structures",
                "nervous system",
                "lobes of the brain"
              ]
            },
            {
              "slug": "sleep-and-consciousness",
              "title": "Sleep and Consciousness",
              "summary": "Sleep cycles through NREM and REM stages, and drugs alter consciousness in predictable ways.",
              "aliases": [
                "sleep stages",
                "circadian rhythm",
                "psychoactive drugs"
              ]
            },
            {
              "slug": "sensation",
              "title": "Sensation",
              "summary": "Sensory receptors convert energy into neural signals through transduction.",
              "aliases": [
                "sensation",
                "vision",
                "hearing",
                "thresholds"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "cognition",
      "title": "Cognition",
      "summary": "Perception, thinking, memory, and intelligence.",
      "concepts": [
        {
          "title": "Cognition",
          "topics": [
            {
              "slug": "perception",
              "title": "Perception",
              "summary": "Top-down and bottom-up processing and Gestalt principles organize what we sense.",
              "aliases": [
                "perception",
                "gestalt",
                "depth perception"
              ]
            },
            {
              "slug": "thinking-and-problem-solving",
              "title": "Thinking and Problem Solving",
              "summary": "Heuristics speed up thinking but create biases.",
              "aliases": [
                "heuristics",
                "cognitive biases",
                "problem solving"
              ]
            },
            {
              "slug": "memory",
              "title": "Memory",
              "summary": "Encoding, storage, and retrieval explain why we remember and forget.",
              "aliases": [
                "memory",
                "encoding",
                "forgetting curve"
              ]
            },
            {
              "slug": "forgetting-and-memory-challenges",
              "title": "Forgetting and Memory Challenges",
              "summary": "We forget because of interference, decay, and retrieval failure; memories can also be reconstructed and distorted.",
              "points": [
                "Proactive and retroactive interference",
                "Misinformation effect",
                "Amnesia"
              ],
              "aliases": [
                "forgetting",
                "interference"
              ]
            },
            {
              "slug": "intelligence-and-testing",
              "title": "Intelligence and Testing",
              "summary": "Theories of intelligence and principles of reliability and validity guide testing.",
              "aliases": [
                "intelligence",
                "reliability validity"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "development-and-learning",
      "title": "Development and Learning",
      "summary": "Lifespan development and how we learn.",
      "concepts": [
        {
          "title": "Development and Learning",
          "topics": [
            {
              "slug": "developmental-psychology",
              "title": "Developmental Psychology",
              "summary": "Piaget, Erikson, and attachment research describe how we change across the lifespan.",
              "aliases": [
                "piaget",
                "erikson",
                "attachment"
              ]
            },
            {
              "slug": "cognitive-and-language-development",
              "title": "Cognitive and Language Development",
              "summary": "Piaget's stages and Vygotsky's social learning describe how thinking develops; language grows from babbling to grammar.",
              "points": [
                "Piaget's stages",
                "Vygotsky",
                "Language acquisition"
              ],
              "aliases": [
                "piaget",
                "language development"
              ]
            },
            {
              "slug": "social-emotional-development",
              "title": "Social-Emotional Development",
              "summary": "Attachment, parenting styles, and Erikson's stages shape social and emotional growth across the lifespan.",
              "points": [
                "Attachment styles",
                "Parenting styles",
                "Erikson's stages"
              ],
              "aliases": [
                "attachment",
                "erikson"
              ]
            },
            {
              "slug": "classical-conditioning",
              "title": "Classical Conditioning",
              "summary": "Pairing a neutral stimulus with an unconditioned one produces a learned response.",
              "aliases": [
                "classical conditioning",
                "pavlov"
              ]
            },
            {
              "slug": "operant-conditioning-and-social-learning",
              "title": "Operant Conditioning and Social Learning",
              "summary": "Reinforcement and punishment shape behavior, and we learn by observing others.",
              "aliases": [
                "operant conditioning",
                "reinforcement schedules",
                "bandura"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "social-psychology-and-personality",
      "title": "Social Psychology and Personality",
      "summary": "Attribution, attitudes, groups, personality, motivation, and emotion.",
      "concepts": [
        {
          "title": "Social Psychology and Personality",
          "topics": [
            {
              "slug": "attribution-attitudes-and-persuasion",
              "title": "Attribution, Attitudes, and Persuasion",
              "summary": "We explain behavior with situational or dispositional attributions, often with bias.",
              "aliases": [
                "attribution theory",
                "fundamental attribution error",
                "cognitive dissonance"
              ]
            },
            {
              "slug": "conformity-obedience-and-group-behavior",
              "title": "Conformity, Obedience, and Group Behavior",
              "summary": "Asch, Milgram, and group dynamics show the power of the situation.",
              "aliases": [
                "conformity",
                "obedience",
                "milgram",
                "group polarization"
              ]
            },
            {
              "slug": "personality-theories",
              "title": "Personality Theories",
              "summary": "Psychodynamic, humanistic, trait, and social-cognitive theories explain personality differently.",
              "aliases": [
                "personality",
                "big five",
                "freud"
              ]
            },
            {
              "slug": "motivation-and-emotion",
              "title": "Motivation and Emotion",
              "summary": "Drive, arousal, and theories of emotion explain what moves us.",
              "aliases": [
                "motivation theories",
                "theories of emotion"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "mental-and-physical-health",
      "title": "Mental and Physical Health",
      "summary": "Health psychology, positive psychology, disorders, and treatment.",
      "concepts": [
        {
          "title": "Mental and Physical Health",
          "topics": [
            {
              "slug": "stress-and-health",
              "title": "Stress and Health",
              "summary": "Stress affects the body through the general adaptation syndrome.",
              "aliases": [
                "stress",
                "general adaptation syndrome",
                "positive psychology"
              ]
            },
            {
              "slug": "positive-psychology",
              "title": "Positive Psychology",
              "summary": "Positive psychology studies well-being, character strengths, and what helps people flourish.",
              "points": [
                "Subjective well-being",
                "Character strengths",
                "Resilience"
              ],
              "aliases": [
                "positive psychology"
              ]
            },
            {
              "slug": "psychological-disorders",
              "title": "Psychological Disorders",
              "summary": "The DSM classifies disorders like depression, anxiety, and schizophrenia.",
              "aliases": [
                "psychological disorders",
                "dsm",
                "depression",
                "schizophrenia"
              ]
            },
            {
              "slug": "treatment-of-disorders",
              "title": "Treatment of Disorders",
              "summary": "Psychotherapies and biomedical treatments approach disorders differently.",
              "aliases": [
                "therapy types",
                "cbt",
                "treatment"
              ]
            }
          ]
        }
      ]
    }
  ]
};
