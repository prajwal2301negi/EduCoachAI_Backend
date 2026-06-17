const asyncHandler = require("express-async-handler");
const Progress = require("../models/Progress");
const User = require("../models/User");

const WEAK_TOPIC_THRESHOLD = 60; // accuracy % below this is considered "weak"

/**
 * @desc    Get the logged-in student's progress across all topics
 * @route   GET /api/progress/me
 * @access  Private (student)
 */
const getMyProgress = asyncHandler(async (req, res) => {
  const progress = await Progress.find({ student: req.user._id }).sort({ accuracy: 1 });

  const weakTopics = progress.filter((p) => p.accuracy < WEAK_TOPIC_THRESHOLD);

  res.status(200).json({
    success: true,
    data: {
      allProgress: progress,
      weakTopics,
    },
  });
});

/**
 * @desc    Parent views a specific child's progress
 * @route   GET /api/progress/child/:studentId
 * @access  Private (parent only — must be linked to that student)
 */
const getChildProgress = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  // Ensure this parent is actually linked to this student
  const isLinked = req.user.children.some((childId) => childId.toString() === studentId);
  if (!isLinked) {
    res.status(403);
    throw new Error("You are not authorized to view this student's progress");
  }

  const student = await User.findById(studentId).select("name grade subjects");
  const progress = await Progress.find({ student: studentId }).sort({ accuracy: 1 });
  const weakTopics = progress.filter((p) => p.accuracy < WEAK_TOPIC_THRESHOLD);

  res.status(200).json({
    success: true,
    data: {
      student,
      allProgress: progress,
      weakTopics,
    },
  });
});

module.exports = { getMyProgress, getChildProgress };
