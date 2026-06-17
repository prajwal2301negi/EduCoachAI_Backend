const express = require("express");
const { param } = require("express-validator");
const {
  getMyReports,
  getChildReports,
  generateMyReportNow,
} = require("../controllers/reportController");
const { protect, authorize } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.get("/me", protect, authorize("student"), getMyReports);
router.post("/generate", protect, authorize("student"), generateMyReportNow);

router.get(
  "/child/:studentId",
  protect,
  authorize("parent"),
  [param("studentId").isMongoId().withMessage("Invalid student ID")],
  validateRequest,
  getChildReports
);

module.exports = router;