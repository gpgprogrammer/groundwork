import type { CourseSpec } from "../spec";

/**
 * AP Music Theory, following the College Board Course and Exam Description (units and topics in CED order).
 */
export const musicTheory: CourseSpec = {
  "course": {
    "slug": "ap-music-theory",
    "title": "AP Music Theory",
    "shortTitle": "Music Theory",
    "exam": "AP",
    "category": "Arts",
    "description": "Pitch, rhythm, harmony, voice leading, and form, plus ear training and sight-singing.",
    "hue": 280,
    "examMonth": "May",
    "query": "AP Music Theory",
    "keywords": [
      "ap music theory",
      "music theory"
    ]
  },
  "units": [
    {
      "slug": "music-fundamentals-i",
      "title": "Unit 1: Music Fundamentals I",
      "summary": "Pitch, major scales and keys, rhythm, meter, and expressive elements.",
      "concepts": [
        {
          "title": "Unit 1: Music Fundamentals I",
          "topics": [
            {
              "slug": "pitch-clefs-and-rhythm",
              "title": "Pitch, Clefs, and Rhythm",
              "summary": "Read pitches in treble, bass, and C clefs, and count simple and compound meters.",
              "aliases": [
                "reading music",
                "time signatures",
                "clefs"
              ]
            },
            {
              "slug": "scales-and-key-signatures",
              "title": "Scales and Key Signatures",
              "summary": "Major and minor scales follow fixed patterns of whole and half steps.",
              "aliases": [
                "major scale",
                "minor scale",
                "key signatures",
                "circle of fifths"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "music-fundamentals-ii",
      "title": "Unit 2: Music Fundamentals II",
      "summary": "Minor scales and keys, melody, timbre, and texture.",
      "concepts": [
        {
          "title": "Unit 2: Music Fundamentals II",
          "topics": [
            {
              "slug": "minor-scales-melody-timbre-and-texture",
              "title": "Minor Scales, Melody, Timbre, and Texture",
              "summary": "Natural, harmonic, and melodic minor scales; how melodies are built; and how timbre and texture shape what you hear.",
              "points": [
                "Three forms of minor",
                "Melodic contour and motion",
                "Timbre and texture"
              ],
              "aliases": [
                "minor scales",
                "melody",
                "texture music"
              ]
            },
            {
              "slug": "sight-singing",
              "title": "Sight-Singing",
              "summary": "Sing a melody at sight using solfège or scale-degree numbers.",
              "aliases": [
                "sight singing",
                "solfege"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "music-fundamentals-iii",
      "title": "Unit 3: Music Fundamentals III",
      "summary": "Triads and seventh chords.",
      "concepts": [
        {
          "title": "Unit 3: Music Fundamentals III",
          "topics": [
            {
              "slug": "intervals-and-triads",
              "title": "Intervals and Triads",
              "summary": "Intervals measure distance between notes, and triads stack thirds.",
              "aliases": [
                "intervals",
                "triads",
                "seventh chords"
              ]
            },
            {
              "slug": "seventh-chords-and-inversions",
              "title": "Seventh Chords and Inversions",
              "summary": "Seventh chords add a seventh above the root; inversions and figured bass show which note is in the bass.",
              "points": [
                "Types of seventh chords",
                "Inversions",
                "Figured bass symbols"
              ],
              "aliases": [
                "seventh chords",
                "figured bass",
                "chord inversions"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "harmony-and-voice-leading-i",
      "title": "Unit 4: Harmony and Voice Leading I",
      "summary": "Chord function, cadence, and phrase.",
      "concepts": [
        {
          "title": "Unit 4: Harmony and Voice Leading I",
          "topics": [
            {
              "slug": "roman-numeral-analysis",
              "title": "Roman Numeral Analysis",
              "summary": "Roman numerals label chords by their function in a key.",
              "aliases": [
                "roman numeral analysis",
                "chord progressions"
              ]
            },
            {
              "slug": "cadences-and-nonchord-tones",
              "title": "Cadences and Nonchord Tones",
              "summary": "Authentic, half, plagal, and deceptive cadences end phrases; passing and neighbor tones decorate them.",
              "aliases": [
                "cadences",
                "nonchord tones"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "harmony-and-voice-leading-ii",
      "title": "Unit 5: Harmony and Voice Leading II",
      "summary": "Chord progressions and predominant function.",
      "concepts": [
        {
          "title": "Unit 5: Harmony and Voice Leading II",
          "topics": [
            {
              "slug": "four-part-voice-leading",
              "title": "Four-Part Voice Leading",
              "summary": "SATB part writing avoids parallel fifths and octaves and resolves tendency tones.",
              "aliases": [
                "voice leading",
                "part writing",
                "parallel fifths"
              ]
            },
            {
              "slug": "chord-progressions-and-predominant-function",
              "title": "Chord Progressions and Predominant Function",
              "summary": "Progressions usually move tonic → predominant → dominant → tonic; predominant chords like ii and IV set up the dominant.",
              "points": [
                "Tonic, predominant, dominant",
                "Common progressions",
                "Cadential 6/4"
              ],
              "aliases": [
                "chord progressions",
                "predominant",
                "harmonic function"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "harmony-and-voice-leading-iii",
      "title": "Unit 6: Harmony and Voice Leading III",
      "summary": "Embellishments, motives, and melodic devices.",
      "concepts": [
        {
          "title": "Unit 6: Harmony and Voice Leading III",
          "topics": [
            {
              "slug": "embellishments-motives-and-melodic-devices",
              "title": "Embellishments, Motives, and Melodic Devices",
              "summary": "Composers develop short motives with repetition, sequence, inversion, and augmentation, and decorate lines with embellishing tones.",
              "points": [
                "Motivic development",
                "Sequences",
                "Embellishing tones in context"
              ],
              "aliases": [
                "motives",
                "melodic devices",
                "sequence music"
              ]
            },
            {
              "slug": "melodic-and-harmonic-dictation",
              "title": "Melodic and Harmonic Dictation",
              "summary": "Write down melodies and bass lines by hearing scale degrees and chord functions.",
              "aliases": [
                "dictation",
                "ear training"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "harmony-and-voice-leading-iv",
      "title": "Unit 7: Harmony and Voice Leading IV",
      "summary": "Secondary function.",
      "concepts": [
        {
          "title": "Unit 7: Harmony and Voice Leading IV",
          "topics": [
            {
              "slug": "secondary-dominants-and-modulation",
              "title": "Secondary Dominants and Modulation",
              "summary": "Secondary dominants tonicize other chords, and modulation moves to a new key.",
              "aliases": [
                "secondary dominant",
                "modulation"
              ]
            }
          ]
        }
      ]
    },
    {
      "slug": "modes-and-form",
      "title": "Unit 8: Modes and Form",
      "summary": "Modes and musical form.",
      "concepts": [
        {
          "title": "Unit 8: Modes and Form",
          "topics": [
            {
              "slug": "modes-and-form",
              "title": "Modes and Form",
              "summary": "The church modes (Dorian, Phrygian, Lydian, Mixolydian) color melodies differently; phrases combine into forms like binary and ternary.",
              "points": [
                "The modes",
                "Phrases and periods",
                "Binary, ternary, and rondo"
              ],
              "aliases": [
                "modes music",
                "musical form",
                "binary ternary"
              ]
            }
          ]
        }
      ]
    }
  ]
};
