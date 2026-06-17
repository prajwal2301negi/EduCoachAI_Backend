const mongoose = require("mongoose");

/**
 * Progress model — one document per (student, subject, topic) combination.
 * Aggregates quiz performance over time so we can identify "weak topics"
 * (low accuracy) to target with more practice, and feed the weekly parent report.
 */
const progressSchema = new mongoose.Schema(
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
    totalQuestionsAttempted: {
      type: Number,
      default: 0,
    },
    totalCorrect: {
      type: Number,
      default: 0,
    },
    accuracy: {
      type: Number, // percentage, recalculated on each update
      default: 0,
    },
    lastAttemptedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// One progress record per student+subject+topic
progressSchema.index({ student: 1, subject: 1, topic: 1 }, { unique: true });

module.exports = mongoose.model("Progress", progressSchema);
