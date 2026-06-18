const asyncHandler = require("express-async-handler");
const stripe = require("../config/stripe");
const Subscription = require("../models/Subscription");
const User = require("../models/User");
const { PLANS } = require("../utils/plans");

/**
 * @desc    List available subscription plans
 * @route   GET /api/subscriptions/plans
 * @access  Public
 */
const getPlans = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: PLANS });
});

/**
 * @desc    Create a Stripe PaymentIntent for the chosen plan
 * @route   POST /api/subscriptions/create-payment-intent
 * @access  Private (student)
 */
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { planId } = req.body;
  const plan = PLANS[planId];

  if (!plan) {
    res.status(400);
    throw new Error("Invalid plan selected");
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: plan.priceInPaise,
    currency: "inr",
    metadata: {
      studentId: req.user._id.toString(),
      planId,
    },
  });

  await Subscription.create({
    student: req.user._id,
    planId,
    amountPaidInPaise: plan.priceInPaise,
    stripePaymentIntentId: paymentIntent.id,
    status: "pending",
  });

  res.status(201).json({
    success: true,
    data: { clientSecret: paymentIntent.client_secret },
  });
});

/**
 * @desc    Stripe webhook — confirms payment and activates the subscription.
 *          This is the source of truth for activation, not the frontend,
 *          since the frontend can't be trusted to honestly report success.
 * @route   POST /api/subscriptions/webhook
 * @access  Public (verified via Stripe signature)
 */
const handleStripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("⚠️ Stripe webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object;
    const subscription = await Subscription.findOne({ stripePaymentIntentId: intent.id });

    if (subscription && subscription.status !== "active") {
      const plan = PLANS[subscription.planId];
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

      subscription.status = "active";
      subscription.startDate = startDate;
      subscription.endDate = endDate;
      await subscription.save();

      await User.findByIdAndUpdate(subscription.student, {
        subscriptionStatus: "active",
        subscriptionEndDate: endDate,
      });

      console.log(`✅ Subscription activated for student ${subscription.student}`);
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object;
    await Subscription.findOneAndUpdate(
      { stripePaymentIntentId: intent.id },
      { status: "failed" }
    );
  }

  res.status(200).json({ received: true });
});

/**
 * @desc    Get the logged-in student's current subscription status
 * @route   GET /api/subscriptions/me
 * @access  Private (student)
 */
const getMySubscription = asyncHandler(async (req, res) => {
  const latest = await Subscription.findOne({ student: req.user._id, status: "active" }).sort({
    endDate: -1,
  });

  res.status(200).json({
    success: true,
    data: {
      subscriptionStatus: req.user.subscriptionStatus,
      subscriptionEndDate: req.user.subscriptionEndDate,
      activeSubscription: latest,
    },
  });
});

module.exports = { getPlans, createPaymentIntent, handleStripeWebhook, getMySubscription };