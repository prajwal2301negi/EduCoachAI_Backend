const asyncHandler = require("express-async-handler");
const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const Progress = require("../models/Progress");
const { getRedisClient } = require("../config/redis");
const { generateQuestionsWithAI } = require("../utils/aiQuestionGenerator");
const { GRADES, SUBJECTS } = require("../utils/constants.js");

const CACHE_TTL_SECONDS = 60 * 30; // 30 minutes
const MAX_QUESTIONS_PER_QUIZ = 20;

/**
 * @desc    Start a new quiz for a subject/topic. Pulls from the existing AI-generated
 *          question bank first; if there aren't enough questions yet for this exact
 *          subject/topic/grade, generates the shortfall via Groq and saves them to the
 *          bank (so future quizzes on the same topic don't need another AI call).
 * @route   POST /api/quizzes/start
 * @access  Private (student)
 */
const startQuiz = asyncHandler(async (req, res) => {
  const { subject, topic, numQuestions, difficulty } = req.body;
  const count = Math.min(numQuestions || 10, MAX_QUESTIONS_PER_QUIZ);
  const grade = req.user.grade;

  if (!grade || !GRADES.includes(grade)) {
    res.status(400);
    throw new Error("Please set a valid grade (1st–8th) on your profile before starting a quiz");
  }
  if (!SUBJECTS.includes(subject)) {
    res.status(400);
    throw new Error(`Subject must be one of: ${SUBJECTS.join(", ")}`);
  }

  const cacheKey = `questions:${subject}:${topic}:${grade}`;
  let pool = null;

  // Try cache first — holds the full pool for this subject/topic/grade
  try {
    const redis = getRedisClient();
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) pool = cached;
    }
  } catch (err) {
    console.warn("Redis read failed, falling back to DB:", err.message);
  }

  // Cache miss — fetch the existing bank from DB
  if (!pool) {
    pool = await Question.find({ subject, topic, grade }).limit(100).lean();
  }

  // Not enough questions in the bank yet — generate the shortfall via Groq
  if (pool.length < count) {
    const shortfall = count - pool.length;
    const generated = await generateQuestionsWithAI({
      subject,
      topic,
      grade,
      count: Math.max(shortfall, 5), // generate at least 5 to make the AI call worthwhile
      difficulty: difficulty || "medium",
    });
    pool = [...pool, ...generated.map((q) => q.toObject())];
  }

  // Refresh cache with the now-larger pool
  try {
    const redis = getRedisClient();
    if (redis) {
      await redis.set(cacheKey, pool, { ex: CACHE_TTL_SECONDS });
    }
  } catch (err) {
    console.warn("Redis write failed:", err.message);
  }

  if (pool.length === 0) {
    res.status(502);
    throw new Error("Could not generate or find questions for this topic. Please try again.");
  }

  // Shuffle and pick `count` questions
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  const quiz = await Quiz.create({
    student: req.user._id,
    subject,
    topic,
    questions: selected.map((q) => ({ question: q._id })),
  });

  // Return quiz with question details (but not correct answers!)
  const populatedQuiz = await Quiz.findById(quiz._id).populate(
    "questions.question",
    "questionText options subject topic difficulty examRelevance"
  );

  res.status(201).json({
    success: true,
    message: "Quiz started",
    data: populatedQuiz,
  });
});

/**
 * @desc    Submit answers for a quiz, get it scored
 * @route   POST /api/quizzes/:id/submit
 * @access  Private (student)
 */
const submitQuiz = asyncHandler(async (req, res) => {
  const { answers } = req.body; // [{ questionId, selectedAnswerIndex }]

  const quiz = await Quiz.findOne({ _id: req.params.id, student: req.user._id });
  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found");
  }

  if (quiz.status === "completed") {
    res.status(400);
    throw new Error("This quiz has already been submitted");
  }

  const questionIds = quiz.questions.map((q) => q.question);
  const fullQuestions = await Question.find({ _id: { $in: questionIds } });
  const questionMap = new Map(fullQuestions.map((q) => [q._id.toString(), q]));

  let correctCount = 0;

  quiz.questions = quiz.questions.map((qEntry) => {
    const answer = answers.find((a) => a.questionId === qEntry.question.toString());
    const fullQuestion = questionMap.get(qEntry.question.toString());
    const selectedAnswerIndex = answer ? answer.selectedAnswerIndex : null;
    const isCorrect =
      fullQuestion && selectedAnswerIndex !== null
        ? selectedAnswerIndex === fullQuestion.correctAnswerIndex
        : false;

    if (isCorrect) correctCount++;

    return {
      question: qEntry.question,
      selectedAnswerIndex,
      isCorrect,
    };
  });

  quiz.score = Math.round((correctCount / quiz.questions.length) * 100);
  quiz.status = "completed";
  quiz.completedAt = new Date();
  await quiz.save();

  // Update Progress (per subject/topic accuracy) for weak-topic tracking
  const progress = await Progress.findOneAndUpdate(
    { student: req.user._id, subject: quiz.subject, topic: quiz.topic },
    {
      $inc: {
        totalQuestionsAttempted: quiz.questions.length,
        totalCorrect: correctCount,
      },
      $set: { lastAttemptedAt: new Date() },
    },
    { upsert: true, new: true }
  );

  progress.accuracy = Math.round(
    (progress.totalCorrect / progress.totalQuestionsAttempted) * 100
  );
  await progress.save();

  res.status(200).json({
    success: true,
    message: "Quiz submitted",
    data: { quiz, score: quiz.score },
  });
});

/**
 * @desc    Get logged-in student's quiz history
 * @route   GET /api/quizzes/history
 * @access  Private (student)
 */
const getQuizHistory = asyncHandler(async (req, res) => {
  const quizzes = await Quiz.find({ student: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .select("subject topic score status createdAt completedAt");

  res.status(200).json({
    success: true,
    data: quizzes,
  });
});

module.exports = { startQuiz, submitQuiz, getQuizHistory };