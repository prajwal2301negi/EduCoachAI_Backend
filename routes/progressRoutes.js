const express = require("express");
const { param } = require("express-validator");
const { getMyProgress, getChildProgress } = require("../controllers/progressController");
const { protect, authorize } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.get("/me", protect, authorize("student"), getMyProgress);

router.get(
  "/child/:studentId",
  protect,
  authorize("parent"),
  [param("studentId").isMongoId().withMessage("Invalid student ID")],
  validateRequest,
  getChildProgress
);

module.exports = router;
