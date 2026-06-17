// const express = require("express");
// const { body } = require("express-validator");
// const { registerUser, loginUser, getMe } = require("../controllers/authController");
// const { protect } = require("../middleware/authMiddleware");
// const validateRequest = require("../middleware/validateRequest");

// const router = express.Router();

// router.post(
//   "/register",
//   [
//     body("name").trim().notEmpty().withMessage("Name is required"),
//     body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
//     body("password")
//       .isLength({ min: 6 })
//       .withMessage("Password must be at least 6 characters"),
//     body("role")
//       .optional()
//       .isIn(["student", "parent"])
//       .withMessage("Role must be student or parent"),
//   ],
//   validateRequest,
//   registerUser
// );

// router.post(
//   "/login",
//   [
//     body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
//     body("password").notEmpty().withMessage("Password is required"),
//   ],
//   validateRequest,
//   loginUser
// );

// router.get("/me", protect, getMe);

// module.exports = router;


const express = require("express");
const { body } = require("express-validator");
const { registerUser, loginUser, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { GRADES, SUBJECTS } = require("../utils/constants.js");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .optional()
      .isIn(["student", "parent"])
      .withMessage("Role must be student or parent"),
    body("grade")
      .optional()
      .isIn(GRADES)
      .withMessage(`Grade must be one of: ${GRADES.join(", ")}`),
    body("subjects")
      .optional()
      .isArray()
      .custom((arr) => arr.every((s) => SUBJECTS.includes(s)))
      .withMessage(`Subjects must be from: ${SUBJECTS.join(", ")}`),
  ],
  validateRequest,
  registerUser
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validateRequest,
  loginUser
);

router.get("/me", protect, getMe);

module.exports = router;