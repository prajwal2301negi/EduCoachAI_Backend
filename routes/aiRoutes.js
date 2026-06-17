const express = require("express");
const { body } = require("express-validator");
const { explainQuestion, tutorChat } = require("../controllers/aiController");
const { protect, authorize } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.post(
  "/explain",
  protect,
  authorize("student"),
  [body("questionId").isMongoId().withMessage("Valid questionId is required")],
  validateRequest,
  explainQuestion
);

router.post(
  "/tutor-chat",
  protect,
  authorize("student"),
  [
    body("subject").trim().notEmpty().withMessage("Subject is required"),
    body("message").trim().notEmpty().withMessage("Message is required"),
  ],
  validateRequest,
  tutorChat
);

module.exports = router;