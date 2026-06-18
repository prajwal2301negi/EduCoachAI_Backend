// const express = require("express");
// const { body, param } = require("express-validator");
// const { startQuiz, submitQuiz, getQuizHistory } = require("../controllers/quizController");
// const { protect, authorize } = require("../middleware/authMiddleware");
// const validateRequest = require("../middleware/validateRequest");

// const router = express.Router();

// router.post(
//   "/start",
//   protect,
//   authorize("student"),
//   [
//     body("subject").trim().notEmpty().withMessage("Subject is required"),
//     body("topic").trim().notEmpty().withMessage("Topic is required"),
//     body("numQuestions").optional().isInt({ min: 1, max: 20 }),
//   ],
//   validateRequest,
//   startQuiz
// );

// router.post(
//   "/:id/submit",
//   protect,
//   authorize("student"),
//   [
//     param("id").isMongoId().withMessage("Invalid quiz ID"),
//     body("answers").isArray().withMessage("Answers must be an array"),
//   ],
//   validateRequest,
//   submitQuiz
// );

// router.get("/history", protect, authorize("student"), getQuizHistory);

// module.exports = router;


const express = require("express");
const { body, param } = require("express-validator");
const { startQuiz, submitQuiz, getQuizHistory } = require("../controllers/quizController");
const { protect, authorize } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const requireSubscription = require("../middleware/requireSubscription");

const router = express.Router();

router.post(
  "/start",
  protect,
  authorize("student"),
  requireSubscription,
  [
    body("subject").trim().notEmpty().withMessage("Subject is required"),
    body("topic").trim().notEmpty().withMessage("Topic is required"),
    body("numQuestions").optional().isInt({ min: 1, max: 20 }),
  ],
  validateRequest,
  startQuiz
);

router.post(
  "/:id/submit",
  protect,
  authorize("student"),
  [
    param("id").isMongoId().withMessage("Invalid quiz ID"),
    body("answers").isArray().withMessage("Answers must be an array"),
  ],
  validateRequest,
  submitQuiz
);

router.get("/history", protect, authorize("student"), getQuizHistory);

module.exports = router;