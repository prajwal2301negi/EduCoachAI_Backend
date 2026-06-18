/**
 * Single source of truth for subscription plans. Fixed-term prepaid plans,
 * not auto-renewing — manual renewal required at term end. This avoids
 * recurring-mandate friction (UPI Autopay caps, bank approval flows, and
 * the general distrust of auto-debit in the Indian market) while still
 * rewarding longer commitments with a visible discount.
 *
 * Prices are in paise (smallest currency unit) since Stripe expects amounts
 * in the smallest unit — ₹299 = 29900 paise.
 */
const PLANS = {
  "1_month": {
    label: "1 Month",
    durationDays: 30,
    priceInPaise: 29900, // ₹299
    displayPrice: "₹299",
  },
  "3_month": {
    label: "3 Months",
    durationDays: 90,
    priceInPaise: 74900, // ₹749
    displayPrice: "₹749",
  },
  "6_month": {
    label: "6 Months",
    durationDays: 180,
    priceInPaise: 129900, // ₹1,299
    displayPrice: "₹1,299",
  },
  "12_month": {
    label: "12 Months",
    durationDays: 365,
    priceInPaise: 219900, // ₹2,199
    displayPrice: "₹2,199",
  },
};

module.exports = { PLANS };