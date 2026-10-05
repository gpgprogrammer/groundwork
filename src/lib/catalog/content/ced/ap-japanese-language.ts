import type { CourseSpec } from "../spec";

/**
 * AP Japanese Language and Culture, following the College Board Course and Exam Description (units and topics in CED order).
 */
export const japanese: CourseSpec = {
  "course": {
    "slug": "ap-japanese-language",
    "title": "AP Japanese Language and Culture",
    "shortTitle": "AP Japanese",
    "exam": "AP",
    "category": "World Languages & Cultures",
    "description": "Interpersonal, interpretive, and presentational communication in Japanese, organized around six cultural themes.",
    "hue": 350,
    "examMonth": "May",
    "query": "AP Japanese Language",
    "keywords": [
      "ap japanese"
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
              "slug": "families-and-communities-in-japanese",
              "title": "Families and Communities in Japanese",
              "summary": "How families, friendships, and communities work, with the vocabulary and structures to talk about them.",
              "aliases": []
            },
            {
              "slug": "japanese-email-reply",
              "title": "Japanese Text Chat",
              "summary": "Answer a series of text-chat messages naturally and appropriately, in the right level of politeness.",
              "aliases": [
                "ap japanese email reply"
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
              "slug": "personal-and-public-identities-in-japanese",
              "title": "Language and Culture in Japanese",
              "summary": "How language, heritage, and cultural practices shape personal and public identity.",
              "aliases": []
            },
            {
              "slug": "japanese-conversation-and-cultural-comparison",
              "title": "Japanese Conversation and Cultural Perspective Presentation",
              "summary": "Respond to conversation prompts, then present on a Japanese cultural topic and your view of it.",
              "aliases": [
                "ap japanese cultural comparison",
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
              "slug": "beauty-and-aesthetics-in-japanese",
              "title": "Art and Creativity in Japanese",
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
              "slug": "science-and-technology-in-japanese",
              "title": "Science and Technology in Japanese",
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
              "slug": "contemporary-life-in-japanese",
              "title": "Contemporary Life in Japanese",
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
              "slug": "global-challenges-in-japanese",
              "title": "Global Contexts in Japanese",
              "summary": "Environmental, economic, political, and social issues, and how people in different places respond to them.",
              "aliases": []
            },
            {
              "slug": "japanese-argumentative-essay",
              "title": "Japanese Story Narration",
              "summary": "Narrate the story shown in a four-picture sequence with a clear sequence of events and appropriate connectors.",
              "aliases": [
                "ap japanese persuasive essay",
                "argumentative essay"
              ]
            }
          ]
        }
      ]
    }
  ]
};
