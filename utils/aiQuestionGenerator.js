const { callGroq } = require("../config/groq");
const Question = require("../models/Question");

/**
 * Asks Groq for exam-style MCQs on a subject/topic/grade, validates the
 * response strictly, and saves valid questions into the Question collection
 * (the growing question bank). Returns the saved Mongoose documents.
 *
 * Designed to be called only when the existing bank doesn't have enough
 * questions for a requested quiz — see quizController.startQuiz.
 */
const generateQuestionsWithAI = async ({ subject, topic, grade, count, difficulty = "medium" }) => {
  const systemPrompt = {
    role: "system",
    content:
      "You are an expert school exam-paper setter for the Indian curriculum (CBSE/NCERT style). " +
      "You write multiple-choice questions that mirror what actually appears in school exams and " +
      "unit tests — clear, unambiguous, age-appropriate, and testing real understanding rather than trivia. " +
      "You respond with ONLY valid JSON, no markdown, no commentary, no code fences.",
  };

  const userPrompt = {
    role: "user",
    content: `Generate exactly ${count} unique multiple-choice questions for:
Subject: ${subject}
Topic: ${topic}
Grade level: ${grade} class (Indian school system)
Difficulty: ${difficulty}

Each question must be the kind that could realistically appear in a school exam or unit test on this topic.
Vary the question style (definitions, application, short calculation/reasoning, fill-in-the-concept) where the subject allows it.

Respond with ONLY a JSON array, no other text, in exactly this shape:
[
  {
    "questionText": "string",
    "options": ["string", "string", "string", "string"],
    "correctAnswerIndex": 0,
    "explanation": "short simple-language explanation of the correct answer, under 50 words",
    "examRelevance": "one short phrase on why this is exam-relevant, e.g. 'Frequently asked in unit tests on this topic'"
  }
]

Each question must have exactly 4 options. correctAnswerIndex must be 0, 1, 2, or 3.`,
  };

  const raw = await callGroq([systemPrompt, userPrompt], {
    temperature: 0.6,
    max_tokens: Math.min(300 * count, 6000),
  });

  let parsed;
  try {
    // Strip accidental code fences in case the model adds them despite instructions
    const cleaned = raw.replace(/^```json\s*|^```\s*|```$/gm, "").trim();
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error("AI returned malformed question data. Please try again.");
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("AI did not return any valid questions.");
  }

  // Validate and filter — never trust AI output blindly before saving to DB
  const validQuestions = parsed.filter(
    (q) =>
      q &&
      typeof q.questionText === "string" &&
      q.questionText.trim().length > 0 &&
      Array.isArray(q.options) &&
      q.options.length >= 2 &&
      q.options.length <= 6 &&
      Number.isInteger(q.correctAnswerIndex) &&
      q.correctAnswerIndex >= 0 &&
      q.correctAnswerIndex < q.options.length
  );

  if (validQuestions.length === 0) {
    throw new Error("AI-generated questions failed validation. Please try again.");
  }

  const docsToInsert = validQuestions.map((q) => ({
    subject,
    topic,
    grade,
    difficulty,
    questionText: q.questionText.trim(),
    options: q.options,
    correctAnswerIndex: q.correctAnswerIndex,
    explanation: q.explanation || "",
    examRelevance: q.examRelevance || "",
    source: "ai_generated",
  }));

  const saved = await Question.insertMany(docsToInsert);
  return saved;
};

module.exports = { generateQuestionsWithAI };