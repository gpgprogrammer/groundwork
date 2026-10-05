import type { CourseSpec } from "../spec";

/**
 * AP Chinese Language and Culture, following the College Board Course and Exam Description (units and topics in CED order).
 */
export const chinese: CourseSpec = {
  "course": {
    "slug": "ap-chinese-language",
    "title": "AP Chinese Language and Culture",
    "shortTitle": "AP Chinese",
    "exam": "AP",
    "category": "World Languages & Cultures",
    "description": "Interpersonal, interpretive, and presentational communication in Chinese, organized around six cultural themes.",
    "hue": 5,
    "examMonth": "May",
    "query": "AP Chinese Language",
    "keywords": [
      "ap chinese",
      "ap mandarin"
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
              "slug": "families-and-communities-in-chinese",
              "title": "Families and Communities in Chinese",
              "summary": "How families, friendships, and communities work, with the vocabulary and structures to talk about them.",
              "aliases": []
            },
            {
              "slug": "chinese-email-reply",
              "title": "Chinese Email Response",
              "summary": "Read an email and write a reply that answers every question and asks one of your own, in the right register.",
              "aliases": [
                "ap chinese email reply"
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
              "slug": "personal-and-public-identities-in-chinese",
              "title": "Language and Culture in Chinese",
              "summary": "How language, heritage, and cultural practices shape personal and public identity.",
              "aliases": []
            },
            {
              "slug": "chinese-conversation-and-cultural-comparison",
              "title": "Chinese Conversation and Cultural Presentation",
              "summary": "Respond to six conversation prompts, then give a two-minute presentation on a Chinese cultural practice or product.",
              "aliases": [
                "ap chinese cultural comparison",
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
              "slug": "beauty-and-aesthetics-in-chinese",
              "title": "Art and Creativity in Chinese",
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
              "slug": "science-and-technology-in-chinese",
              "title": "Science and Technology in Chinese",
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
              "slug": "contemporary-life-in-chinese",
              "title": "Contemporary Life in Chinese",
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
              "slug": "global-challenges-in-chinese",
              "title": "Global Contexts in Chinese",
              "summary": "Environmental, economic, political, and social issues, and how people in different places respond to them.",
              "aliases": []
            },
            {
              "slug": "chinese-argumentative-essay",
              "title": "Chinese Story Narration",
              "summary": "Tell the story shown in a four-picture sequence with a clear beginning, middle, and end, using transitions and varied vocabulary.",
              "aliases": [
                "ap chinese persuasive essay",
                "argumentative essay"
              ]
            }
          ]
        }
      ]
    }
  ]
};
