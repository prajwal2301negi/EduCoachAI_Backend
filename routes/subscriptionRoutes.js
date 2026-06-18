const express = require("express");
const { body } = require("express-validator");
const {
  getPlans,
  createPaymentIntent,
  getMySubscription,
} = require("../controllers/subscriptionController");
const { protect, authorize } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { PLANS } = require("../utils/plans");

const router = express.Router();

router.get("/plans", getPlans);

router.post(
  "/create-payment-intent",
  protect,
  authorize("student"),
  [body("planId").isIn(Object.keys(PLANS)).withMessage("Invalid plan ID")],
  validateRequest,
  createPaymentIntent
);

router.get("/me", protect, authorize("student"), getMySubscription);

module.exports = router;