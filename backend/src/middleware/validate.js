'use strict';

const { validationResult } = require('express-validator');

/**
 * Middleware: return 422 with validation errors if any.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
}

module.exports = { validate };
