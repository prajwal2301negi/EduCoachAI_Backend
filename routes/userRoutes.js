const express = require("express");
const { body } = require("express-validator");
const {
  updateMyProfile,
  linkChild,
  getMyChildren,
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.put("/me", protect, updateMyProfile);

router.post(
  "/link-child",
  protect,
  authorize("parent"),
  [body("studentEmail").isEmail().withMessage("Valid student email is required")],
  validateRequest,
  linkChild
);

router.get("/my-children", protect, authorize("parent"), getMyChildren);

module.exports = router;
