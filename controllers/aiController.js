const asyncHandler = require("express-async-handler");
const Question = require("../models/Question");
const { callGroq } = require("../config/groq");

/**
 * @desc    Get a simple-language AI explanation for a specific question
 *          (used after a student answers wrong on a quiz)
 * @route   POST /api/ai/explain
 * @access  Private (student)
 * @body    { questionId }
 */
const explainQuestion = asyncHandler(async (req, res) => {
  const { questionId } = req.body;

  const question = await Question.findById(questionId);
  if (!question) {
    res.status(404);
    throw new Error("Question not found");
  }

  const correctOption = question.options[question.correctAnswerIndex];
  const grade = req.user.grade || "middle school";

  const messages = [
    {
      role: "system",
      content:
        "You are a patient, encouraging tutor for school students in India. Explain concepts in very simple language, short sentences, with a relatable everyday example. Never be condescending. Keep it under 120 words.",
    },
    {
      role: "user",
      content: `Student grade: ${grade}. Subject: ${question.subject}, Topic: ${question.topic}.\nQuestion: ${question.questionText}\nCorrect answer: ${correctOption}\nExplain why this is the correct answer in simple terms a ${grade} grade student can understand.`,
    },
  ];

  const explanation = await callGroq(messages, { max_tokens: 300 });

  res.status(200).json({
    success: true,
    data: { questionId, explanation },
  });
});

/**
 * @desc    Free-form AI tutor chat, scoped to a subject/topic for focus
 * @route   POST /api/ai/tutor-chat
 * @access  Private (student)
 * @body    { subject, topic, message, history? }
 */
const tutorChat = asyncHandler(async (req, res) => {
  const { subject, topic, message, history } = req.body;
  const grade = req.user.grade || "middle school";

  const systemPrompt = {
    role: "system",
    content: `You are EduCoach AI, a friendly personal tutor for a ${grade} grade Indian student studying ${subject}${
      topic ? ` (topic: ${topic})` : ""
    }. Explain things simply, use short paragraphs, give small examples, and ask a quick follow-up question to check understanding. Stay strictly on-topic for schoolwork; politely decline unrelated requests.`,
  };

  // history: optional array of prior { role: "user"|"assistant", content } for context
  const priorMessages = Array.isArray(history) ? history.slice(-10) : [];

  const messages = [systemPrompt, ...priorMessages, { role: "user", content: message }];

  const reply = await callGroq(messages, { max_tokens: 400, temperature: 0.5 });

  res.status(200).json({
    success: true,
    data: { reply },
  });
});

module.exports = { explainQuestion, tutorChat };