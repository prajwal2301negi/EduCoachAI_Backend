// const mongoose = require("mongoose");
// const { GRADES, SUBJECTS } = require("../utils/constants");

// /**
//  * Question model — bank of practice questions tagged by subject/topic/difficulty.
//  * Acts as a growing cache: AI-generated questions are saved here on first
//  * generation and reused for future quizzes on the same subject/topic/grade.
//  */
// const questionSchema = new mongoose.Schema(
//   {
//     subject: {
//       type: String,
//       required: true,
//       trim: true,
//       enum: { values: SUBJECTS, message: "Invalid subject" },
//     },
//     topic: {
//       type: String,
//       required: true,
//       trim: true, // e.g. "Fractions"
//     },
//     grade: {
//       type: String,
//       required: true,
//       enum: { values: GRADES, message: "Grade must be between 1st and 8th" },
//     },
//     difficulty: {
//       type: String,
//       enum: ["easy", "medium", "hard"],
//       default: "medium",
//     },
//     questionText: {
//       type: String,
//       required: true,
//     },
//     options: {
//       type: [String],
//       validate: {
//         validator: (arr) => arr.length >= 2 && arr.length <= 6,
//         message: "A question must have between 2 and 6 options",
//       },
//       required: true,
//     },
//     correctAnswerIndex: {
//       type: Number,
//       required: true,
//       min: 0,
//     },
//     explanation: {
//       type: String, // simple-language explanation shown after answering
//       default: "",
//     },
//     examRelevance: {
//       type: String, // brief note on why/how this is exam-relevant, from AI generation
//       default: "",
//     },
//     source: {
//       type: String,
//       enum: ["ai_generated", "manual"],
//       default: "ai_generated",
//     },
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       default: null, // null if system/AI generated
//     },
//   },
//   { timestamps: true }
// );

// questionSchema.index({ subject: 1, topic: 1, grade: 1, difficulty: 1 });

// module.exports = mongoose.model("Question", questionSchema);


const mongoose = require("mongoose");
const { GRADES, SUBJECTS } = require("../utils/constants.js");

/**
 * Question model — bank of practice questions tagged by subject/topic/difficulty.
 * Acts as a growing cache: AI-generated questions are saved here on first
 * generation and reused for future quizzes on the same subject/topic/grade.
 */
const questionSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
      enum: { values: SUBJECTS, message: "Invalid subject" },
    },
    topic: {
      type: String,
      required: true,
      trim: true, // e.g. "Fractions"
    },
    grade: {
      type: String,
      required: true,
      enum: { values: GRADES, message: "Grade must be between 1st and 8th" },
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    questionText: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      validate: {
        validator: (arr) => arr.length >= 2 && arr.length <= 6,
        message: "A question must have between 2 and 6 options",
      },
      required: true,
    },
    correctAnswerIndex: {
      type: Number,
      required: true,
      min: 0,
    },
    explanation: {
      type: String, // simple-language explanation shown after answering
      default: "",
    },
    examRelevance: {
      type: String, // brief note on why/how this is exam-relevant, from AI generation
      default: "",
    },
    source: {
      type: String,
      enum: ["ai_generated", "manual"],
      default: "ai_generated",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null if system/AI generated
    },
  },
  { timestamps: true }
);

questionSchema.index({ subject: 1, topic: 1, grade: 1, difficulty: 1 });

module.exports = mongoose.model("Question", questionSchema);