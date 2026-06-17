const asyncHandler = require("express-async-handler");
const Report = require("../models/Report");
const { generateWeeklyReportForStudent } = require("../utils/reportGenerator");

/**
 * @desc    Get the logged-in student's own report history
 * @route   GET /api/reports/me
 * @access  Private (student)
 */
const getMyReports = asyncHandler(async (req, res) => {
  const reports = await Report.find({ student: req.user._id })
    .sort({ periodEnd: -1 })
    .limit(12); // last ~3 months of weekly reports

  res.status(200).json({ success: true, data: reports });
});

/**
 * @desc    Parent views a specific linked child's report history
 * @route   GET /api/reports/child/:studentId
 * @access  Private (parent only — must be linked to that student)
 */
const getChildReports = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const isLinked = req.user.children.some((childId) => childId.toString() === studentId);
  if (!isLinked) {
    res.status(403);
    throw new Error("You are not authorized to view this student's reports");
  }

  const reports = await Report.find({ student: studentId })
    .sort({ periodEnd: -1 })
    .limit(12);

  res.status(200).json({ success: true, data: reports });
});

/**
 * @desc    Manually generate a report right now (useful for testing without
 *          waiting for Sunday, or if a parent wants a fresh on-demand snapshot)
 * @route   POST /api/reports/generate
 * @access  Private (student — generates their own report)
 */
const generateMyReportNow = asyncHandler(async (req, res) => {
  const report = await generateWeeklyReportForStudent(req.user._id);
  res.status(201).json({ success: true, message: "Report generated", data: report });
});

module.exports = { getMyReports, getChildReports, generateMyReportNow };