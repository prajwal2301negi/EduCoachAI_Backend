const asyncHandler = require("express-async-handler");

/**
 * Gate for quiz/AI-tutor routes — requires an active, unexpired subscription.
 * Place after `protect` so req.user is already populated.
 */
const requireSubscription = asyncHandler(async (req, res, next) => {
  const user = req.user;

  const isExpired = user.subscriptionEndDate && new Date(user.subscriptionEndDate) < new Date();

  if (isExpired && user.subscriptionStatus === "active") {
    user.subscriptionStatus = "expired";
    await user.save();
  }

  if (user.subscriptionStatus !== "active" || isExpired) {
    res.status(402); // Payment Required
    throw new Error("An active subscription is required to access this feature");
  }

  next();
});

module.exports = requireSubscription;