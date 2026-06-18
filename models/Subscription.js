const mongoose = require("mongoose");

/**
 * Subscription model — represents one purchased term (fixed-length, prepaid,
 * non-recurring). A student renews manually by buying another plan; there is
 * no auto-debit/auto-renewal, by design (see utils/plans.js for reasoning).
 */
const subscriptionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planId: {
      type: String,
      required: true, // e.g. "3_month"
    },
    amountPaidInPaise: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "inr",
    },
    stripePaymentIntentId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "expired", "failed"],
      default: "pending",
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

subscriptionSchema.index({ student: 1, status: 1 });

module.exports = mongoose.model("Subscription", subscriptionSchema);