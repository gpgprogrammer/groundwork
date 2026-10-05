import type { CourseSpec } from "../spec";

/**
 * AP German Language and Culture, following the College Board Course and Exam Description (units and topics in CED order).
 */
export const german: CourseSpec = {
  "course": {
    "slug": "ap-german-language",
    "title": "AP German Language and Culture",
    "shortTitle": "AP German",
    "exam": "AP",
    "category": "World Languages & Cultures",
    "description": "Interpersonal, interpretive, and presentational communication in German, organized around six cultural themes.",
    "hue": 50,
    "examMonth": "May",
    "query": "AP German Language",
    "keywords": [
      "ap german"
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
              "slug": "families-and-communities-in-german",
              "title": "Families and Communities in German",
              "summary": "How families, friendships, and communities work, with the vocabulary and structures to talk about them.",
              "aliases": []
            },
            {
              "slug": "german-email-reply",
              "title": "German Email Reply",
              "summary": "Answer every question in the email, in formal register, with an elaboration for each.",
              "aliases": [
                "ap german email reply"
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
              "slug": "personal-and-public-identities-in-german",
              "title": "Language and Culture in German",
              "summary": "How language, heritage, and cultural practices shape personal and public identity.",
              "aliases": []
            },
            {
              "slug": "german-conversation-and-cultural-comparison",
              "title": "German Conversation and Cultural Comparison",
              "summary": "Respond naturally to prompts and compare a cultural product or practice with your own community.",
              "aliases": [
                "ap german cultural comparison",
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
              "slug": "beauty-and-aesthetics-in-german",
              "title": "Art and Creativity in German",
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
              "slug": "science-and-technology-in-german",
              "title": "Science and Technology in German",
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
              "slug": "contemporary-life-in-german",
              "title": "Contemporary Life in German",
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
              "slug": "global-challenges-in-german",
              "title": "Global Contexts in German",
              "summary": "Environmental, economic, political, and social issues, and how people in different places respond to them.",
              "aliases": []
            },
            {
              "slug": "german-argumentative-essay",
              "title": "German Argumentative Essay",
              "summary": "Use all three sources to support a clear position, citing them in your own words.",
              "aliases": [
                "ap german persuasive essay",
                "argumentative essay"
              ]
            }
          ]
        }
      ]
    }
  ]
};
