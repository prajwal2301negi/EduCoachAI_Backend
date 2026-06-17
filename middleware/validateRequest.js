const { validationResult } = require("express-validator");

/**
 * Runs after express-validator's check()/body() rules in a route.
 * If any validation rule failed, responds with 400 and the list of errors.
 * Usage: router.post('/route', [validationRules], validateRequest, controller)
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = validateRequest;
