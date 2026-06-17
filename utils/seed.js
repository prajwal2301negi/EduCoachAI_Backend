require("dotenv").config();
const mongoose = require("mongoose");
const Question = require("../models/Question");

/**
 * Seeds a handful of sample questions so you can test the quiz flow
 * immediately after setup. Run with: npm run seed
 */
const sampleQuestions = [
  // FRACTIONS (10)
  {
    subject: "Math",
    topic: "Fractions",
    grade: "6th",
    difficulty: "easy",
    questionText: "What is 1/2 + 1/4?",
    options: ["3/4", "1/4", "2/6", "1/2"],
    correctAnswerIndex: 0,
    explanation: "1/2 = 2/4, so 2/4 + 1/4 = 3/4."
  },
  {
    subject: "Math",
    topic: "Fractions",
    grade: "6th",
    difficulty: "easy",
    questionText: "What is 3/4 - 1/4?",
    options: ["1/2", "1/4", "3/8", "2/3"],
    correctAnswerIndex: 0,
    explanation: "3/4 - 1/4 = 2/4 = 1/2."
  },
  {
    subject: "Math",
    topic: "Fractions",
    grade: "6th",
    difficulty: "medium",
    questionText: "Simplify 12/18.",
    options: ["2/3", "3/4", "4/5", "6/9"],
    correctAnswerIndex: 0,
    explanation: "Divide numerator and denominator by 6."
  },
  {
    subject: "Math",
    topic: "Fractions",
    grade: "6th",
    difficulty: "easy",
    questionText: "Which fraction equals 0.25?",
    options: ["1/2", "1/4", "3/4", "2/3"],
    correctAnswerIndex: 1,
    explanation: "0.25 = 1/4."
  },
  {
    subject: "Math",
    topic: "Fractions",
    grade: "6th",
    difficulty: "medium",
    questionText: "What is 2/3 + 1/3?",
    options: ["1", "2/6", "5/6", "2/4"],
    correctAnswerIndex: 0,
    explanation: "2/3 + 1/3 = 3/3 = 1."
  },
  {
    subject: "Math",
    topic: "Fractions",
    grade: "6th",
    difficulty: "easy",
    questionText: "What is half of 1?",
    options: ["1/4", "1/2", "2", "3/4"],
    correctAnswerIndex: 1,
    explanation: "Half of 1 is 1/2."
  },
  {
    subject: "Math",
    topic: "Fractions",
    grade: "6th",
    difficulty: "medium",
    questionText: "What is 5/10 in simplest form?",
    options: ["1/2", "5/5", "2/5", "3/5"],
    correctAnswerIndex: 0,
    explanation: "5/10 simplifies to 1/2."
  },
  {
    subject: "Math",
    topic: "Fractions",
    grade: "6th",
    difficulty: "hard",
    questionText: "What is 7/8 - 3/8?",
    options: ["1/2", "4/8", "3/8", "5/8"],
    correctAnswerIndex: 1,
    explanation: "7/8 - 3/8 = 4/8 = 1/2."
  },
  {
    subject: "Math",
    topic: "Fractions",
    grade: "6th",
    difficulty: "medium",
    questionText: "Convert 0.75 to a fraction.",
    options: ["1/4", "2/3", "3/4", "4/5"],
    correctAnswerIndex: 2,
    explanation: "0.75 = 3/4."
  },
  {
    subject: "Math",
    topic: "Fractions",
    grade: "6th",
    difficulty: "hard",
    questionText: "What is 1/2 × 1/4?",
    options: ["1/8", "1/6", "2/8", "1/2"],
    correctAnswerIndex: 0,
    explanation: "Multiply numerators and denominators."
  },

  // DECIMALS (10)
  {
    subject: "Math",
    topic: "Decimals",
    grade: "6th",
    difficulty: "easy",
    questionText: "What is 0.5 + 0.2?",
    options: ["0.7", "0.8", "0.6", "0.9"],
    correctAnswerIndex: 0,
    explanation: "0.5 + 0.2 = 0.7."
  },
  {
    subject: "Math",
    topic: "Decimals",
    grade: "6th",
    difficulty: "easy",
    questionText: "What is 1.2 + 1.3?",
    options: ["2.4", "2.5", "2.6", "2.7"],
    correctAnswerIndex: 1,
    explanation: "1.2 + 1.3 = 2.5."
  },
  {
    subject: "Math",
    topic: "Decimals",
    grade: "6th",
    difficulty: "medium",
    questionText: "What is 5.5 - 2.2?",
    options: ["3.3", "3.2", "3.1", "3.4"],
    correctAnswerIndex: 0,
    explanation: "5.5 - 2.2 = 3.3."
  },
  {
    subject: "Math",
    topic: "Decimals",
    grade: "6th",
    difficulty: "easy",
    questionText: "Which decimal equals one-half?",
    options: ["0.25", "0.75", "0.5", "0.8"],
    correctAnswerIndex: 2,
    explanation: "1/2 = 0.5."
  },
  {
    subject: "Math",
    topic: "Decimals",
    grade: "6th",
    difficulty: "medium",
    questionText: "What is 3.2 × 2?",
    options: ["6.4", "6.2", "5.4", "4.2"],
    correctAnswerIndex: 0,
    explanation: "3.2 × 2 = 6.4."
  },
  {
    subject: "Math",
    topic: "Decimals",
    grade: "6th",
    difficulty: "hard",
    questionText: "What is 7.5 ÷ 3?",
    options: ["2.5", "3.5", "2", "1.5"],
    correctAnswerIndex: 0,
    explanation: "7.5 ÷ 3 = 2.5."
  },
  {
    subject: "Math",
    topic: "Decimals",
    grade: "6th",
    difficulty: "easy",
    questionText: "Round 4.67 to the nearest whole number.",
    options: ["4", "5", "6", "3"],
    correctAnswerIndex: 1,
    explanation: "4.67 rounds up to 5."
  },
  {
    subject: "Math",
    topic: "Decimals",
    grade: "6th",
    difficulty: "medium",
    questionText: "What is 0.9 - 0.4?",
    options: ["0.4", "0.5", "0.6", "0.7"],
    correctAnswerIndex: 1,
    explanation: "0.9 - 0.4 = 0.5."
  },
  {
    subject: "Math",
    topic: "Decimals",
    grade: "6th",
    difficulty: "hard",
    questionText: "What is 1.25 × 4?",
    options: ["4", "5", "6", "3"],
    correctAnswerIndex: 1,
    explanation: "1.25 × 4 = 5."
  },
  {
    subject: "Math",
    topic: "Decimals",
    grade: "6th",
    difficulty: "easy",
    questionText: "Which decimal is greater?",
    options: ["0.3", "0.7", "0.5", "0.2"],
    correctAnswerIndex: 1,
    explanation: "0.7 is the greatest."
  },

  // PHOTOSYNTHESIS (10)
  {
    subject: "Science",
    topic: "Photosynthesis",
    grade: "6th",
    difficulty: "easy",
    questionText: "What gas do plants absorb?",
    options: ["Oxygen", "Carbon Dioxide", "Hydrogen", "Nitrogen"],
    correctAnswerIndex: 1,
    explanation: "Plants absorb carbon dioxide."
  },
  {
    subject: "Science",
    topic: "Photosynthesis",
    grade: "6th",
    difficulty: "easy",
    questionText: "What pigment helps plants capture sunlight?",
    options: ["Chlorophyll", "Hemoglobin", "Melanin", "Keratin"],
    correctAnswerIndex: 0,
    explanation: "Chlorophyll captures sunlight."
  },
  {
    subject: "Science",
    topic: "Photosynthesis",
    grade: "6th",
    difficulty: "medium",
    questionText: "Which part of the plant mainly performs photosynthesis?",
    options: ["Roots", "Stem", "Leaves", "Flowers"],
    correctAnswerIndex: 2,
    explanation: "Leaves contain chloroplasts."
  },
  {
    subject: "Science",
    topic: "Photosynthesis",
    grade: "6th",
    difficulty: "easy",
    questionText: "Plants release which gas?",
    options: ["Carbon Dioxide", "Hydrogen", "Oxygen", "Nitrogen"],
    correctAnswerIndex: 2,
    explanation: "Plants release oxygen."
  },
  {
    subject: "Science",
    topic: "Photosynthesis",
    grade: "6th",
    difficulty: "medium",
    questionText: "Photosynthesis requires which source of energy?",
    options: ["Wind", "Sunlight", "Water", "Soil"],
    correctAnswerIndex: 1,
    explanation: "Sunlight provides energy."
  },

  // HUMAN BODY (10)
  {
    subject: "Science",
    topic: "Human Body",
    grade: "6th",
    difficulty: "easy",
    questionText: "How many chambers does the human heart have?",
    options: ["2", "3", "4", "5"],
    correctAnswerIndex: 2,
    explanation: "The heart has four chambers."
  },
  {
    subject: "Science",
    topic: "Human Body",
    grade: "6th",
    difficulty: "easy",
    questionText: "Which organ pumps blood?",
    options: ["Brain", "Heart", "Liver", "Lungs"],
    correctAnswerIndex: 1,
    explanation: "The heart pumps blood."
  },
  {
    subject: "Science",
    topic: "Human Body",
    grade: "6th",
    difficulty: "medium",
    questionText: "Which organ helps us breathe?",
    options: ["Kidney", "Liver", "Lungs", "Heart"],
    correctAnswerIndex: 2,
    explanation: "Lungs are responsible for breathing."
  },
  {
    subject: "Science",
    topic: "Human Body",
    grade: "6th",
    difficulty: "easy",
    questionText: "How many bones are in an adult human body?",
    options: ["206", "180", "250", "300"],
    correctAnswerIndex: 0,
    explanation: "Adults have 206 bones."
  },
  {
    subject: "Science",
    topic: "Human Body",
    grade: "6th",
    difficulty: "medium",
    questionText: "Which organ controls the body?",
    options: ["Heart", "Brain", "Kidney", "Lungs"],
    correctAnswerIndex: 1,
    explanation: "The brain controls the body."
  },

  // GEOMETRY (10)
  {
    subject: "Math",
    topic: "Geometry",
    grade: "6th",
    difficulty: "easy",
    questionText: "How many sides does a triangle have?",
    options: ["3", "4", "5", "6"],
    correctAnswerIndex: 0,
    explanation: "A triangle has 3 sides."
  },
  {
    subject: "Math",
    topic: "Geometry",
    grade: "6th",
    difficulty: "easy",
    questionText: "How many sides does a square have?",
    options: ["3", "4", "5", "6"],
    correctAnswerIndex: 1,
    explanation: "A square has 4 sides."
  },
  {
    subject: "Math",
    topic: "Geometry",
    grade: "6th",
    difficulty: "medium",
    questionText: "How many angles are in a pentagon?",
    options: ["3", "4", "5", "6"],
    correctAnswerIndex: 2,
    explanation: "A pentagon has 5 angles."
  },
  {
    subject: "Math",
    topic: "Geometry",
    grade: "6th",
    difficulty: "easy",
    questionText: "A circle has how many sides?",
    options: ["0", "1", "2", "Infinite"],
    correctAnswerIndex: 0,
    explanation: "A circle has no straight sides."
  },
  {
    subject: "Math",
    topic: "Geometry",
    grade: "6th",
    difficulty: "medium",
    questionText: "How many sides does a hexagon have?",
    options: ["5", "6", "7", "8"],
    correctAnswerIndex: 1,
    explanation: "A hexagon has 6 sides."
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    await Question.deleteMany({});
    await Question.insertMany(sampleQuestions);

    console.log(`✅ Seeded ${sampleQuestions.length} sample questions`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

seedDB();
