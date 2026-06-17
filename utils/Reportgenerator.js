const Progress = require("../models/Progress");
const Quiz = require("../models/Quiz");
const Report = require("../models/Report");
const User = require("../models/User");
const { callGroq } = require("../config/groq");

const WEAK_TOPIC_THRESHOLD = 60;
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Builds and saves a weekly Report document for a single student:
 * pulls all Progress + Quiz activity from the last 7 days, asks Groq for a
 * short plain-language narrative a parent can read in 30 seconds, then saves.
 */
const generateWeeklyReportForStudent = async (studentId) => {
  const periodEnd = new Date();
  const periodStart = new Date(periodEnd.getTime() - ONE_WEEK_MS);

  const student = await User.findById(studentId);
  if (!student) return null;

  const recentQuizzes = await Quiz.find({
    student: studentId,
    status: "completed",
    completedAt: { $gte: periodStart, $lte: periodEnd },
  });

  const allProgress = await Progress.find({ student: studentId });
  const weakTopics = allProgress
    .filter((p) => p.accuracy < WEAK_TOPIC_THRESHOLD)
    .map((p) => ({ subject: p.subject, topic: p.topic, accuracy: p.accuracy }));

  const quizzesTaken = recentQuizzes.length;
  const averageScore = quizzesTaken
    ? Math.round(recentQuizzes.reduce((sum, q) => sum + (q.score || 0), 0) / quizzesTaken)
    : 0;

  const subjectBreakdown = allProgress.map((p) => ({
    subject: p.subject,
    topic: p.topic,
    accuracy: p.accuracy,
    questionsAttempted: p.totalQuestionsAttempted,
  }));

  // If there's no activity at all this week, skip the AI call and save a minimal report
  let aiSummary = "";
  if (quizzesTaken > 0 || allProgress.length > 0) {
    try {
      const messages = [
        {
          role: "system",
          content:
            "You write short, warm, plain-language weekly progress summaries for parents of school students in India. " +
            "No jargon, no fluff, 3-5 sentences max. Mention what went well, what needs more practice, and one encouraging note.",
        },
        {
          role: "user",
          content: `Student: ${student.name}, Grade: ${student.grade || "not set"}.
Quizzes completed this week: ${quizzesTaken}.
Average score this week: ${averageScore}%.
Topics needing more practice: ${
            weakTopics.length ? weakTopics.map((t) => `${t.subject} - ${t.topic} (${t.accuracy}%)`).join(", ") : "none currently"
          }.
Write a short weekly summary for the parent.`,
        },
      ];
      aiSummary = await callGroq(messages, { max_tokens: 220, temperature: 0.5 });
    } catch (err) {
      console.error("⚠️ Groq summary generation failed, saving report without it:", err.message);
      aiSummary = "Summary unavailable this week. See the detailed breakdown below.";
    }
  } else {
    aiSummary = `${student.name} didn't complete any quizzes this week. A little regular practice goes a long way!`;
  }

  const report = await Report.create({
    student: studentId,
    periodStart,
    periodEnd,
    quizzesTaken,
    averageScore,
    subjectBreakdown,
    weakTopics,
    aiSummary,
  });

  return report;
};

module.exports = { generateWeeklyReportForStudent };