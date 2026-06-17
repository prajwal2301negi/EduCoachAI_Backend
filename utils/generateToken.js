const jwt = require("jsonwebtoken");

/**
 * Generates a signed JWT for a given user ID.
 * This token is sent to the client and must be passed back as:
 * Authorization: Bearer <token>
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });
};

module.exports = generateToken;
