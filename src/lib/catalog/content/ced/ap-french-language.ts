import type { CourseSpec } from "../spec";

/**
 * AP French Language and Culture, following the College Board Course and Exam Description (units and topics in CED order).
 */
export const french: CourseSpec = {
  "course": {
    "slug": "ap-french-language",
    "title": "AP French Language and Culture",
    "shortTitle": "AP French",
    "exam": "AP",
    "category": "World Languages & Cultures",
    "description": "Interpersonal, interpretive, and presentational communication in French, organized around six cultural themes.",
    "hue": 230,
    "examMonth": "May",
    "query": "AP French Language",
    "keywords": [
      "ap french"
    ]
  },
  "units": [
    {
      "slug": "families-and-communities",
      "title": "Families and Communities",
      "summary": "Family, friendships, and community life.",
      "concepts": [
        {
          "title": "Families and Communities",
          "topics": [
            {
              "slug": "families-and-communities-in-french",
              "title": "Families and Communities in French",
              "summary": "How families, friendships, and communities work, with the vocabulary and structures to talk about them.",
              "aliases": []
            },
            {
              "slug": "french-email-reply",
              "title": "French Email Reply",
              "summary": "Answer every question in the email, in formal register, with an elaboration for each.",
              "aliases": [
                "ap french email reply"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "language-and-culture",
      "title": "Language and Culture",
      "summary": "How language and culture shape identity.",
      "concepts": [
        {
          "title": "Language and Culture",
          "topics": [
            {
              "slug": "personal-and-public-identities-in-french",
              "title": "Language and Culture in French",
              "summary": "How language, heritage, and cultural practices shape personal and public identity.",
              "aliases": []
            },
            {
              "slug": "french-conversation-and-cultural-comparison",
              "title": "French Conversation and Cultural Comparison",
              "summary": "Respond naturally to prompts and compare a cultural product or practice with your own community.",
              "aliases": [
                "ap french cultural comparison",
                "speaking"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "art-and-creativity",
      "title": "Art and Creativity",
      "summary": "Art, music, literature, and creative expression.",
      "concepts": [
        {
          "title": "Art and Creativity",
          "topics": [
            {
              "slug": "beauty-and-aesthetics-in-french",
              "title": "Art and Creativity in French",
              "summary": "Visual art, music, literature, and design, and how they express a culture's ideas of beauty.",
              "aliases": []
            }
          ]
        }
      ]
    },
    {
      "slug": "science-and-technology",
      "title": "Science and Technology",
      "summary": "How science and technology affect daily life.",
      "concepts": [
        {
          "title": "Science and Technology",
          "topics": [
            {
              "slug": "science-and-technology-in-french",
              "title": "Science and Technology in French",
              "summary": "Discuss technology's effects on daily life, health, and the environment.",
              "aliases": []
            }
          ]
        }
      ]
    },
    {
      "slug": "contemporary-life",
      "title": "Contemporary Life",
      "summary": "School, work, travel, and daily routines.",
      "concepts": [
        {
          "title": "Contemporary Life",
          "topics": [
            {
              "slug": "contemporary-life-in-french",
              "title": "Contemporary Life in French",
              "summary": "Everyday topics like school, careers, holidays, and travel.",
              "aliases": []
            }
          ]
        }
      ]
    },
    {
      "slug": "global-contexts",
      "title": "Global Contexts",
      "summary": "Environmental, political, and social challenges around the world.",
      "concepts": [
        {
          "title": "Global Contexts",
          "topics": [
            {
              "slug": "global-challenges-in-french",
              "title": "Global Contexts in French",
              "summary": "Environmental, economic, political, and social issues, and how people in different places respond to them.",
              "aliases": []
            },
            {
              "slug": "french-argumentative-essay",
              "title": "French Argumentative Essay",
              "summary": "Use all three sources to support a clear position, citing them in your own words.",
              "aliases": [
                "ap french persuasive essay",
                "argumentative essay"
              ]
            }
          ]
        }
      ]
    }
  ]
};
