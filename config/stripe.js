const Stripe = require("stripe");

/**
 * Stripe client for one-time plan purchases (not recurring subscriptions —
 * see Subscription model comments for why fixed-term prepaid plans were
 * chosen over auto-renewing subscriptions for the Indian market).
 */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = stripe;