const mongoose = require("mongoose");

/**
 * Quiz model — represents a single quiz instance generated for a student,
 * with the questions included, the student's answers, and the resulting score.
 * This is the core unit used to derive "weak topics" over time.
 */
const quizSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    questions: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        selectedAnswerIndex: {
          type: Number,
          default: null, // null until student answers
        },
        isCorrect: {
          type: Boolean,
          default: null,
        },
      },
    ],
    status: {
      type: String,
      enum: ["in_progress", "completed"],
      default: "in_progress",
    },
    score: {
      type: Number, // percentage, calculated on completion
      default: null,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

quizSchema.index({ student: 1, createdAt: -1 });

module.exports = mongoose.model("Quiz", quizSchema);
