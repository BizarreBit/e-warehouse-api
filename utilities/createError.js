const validator = require('validator');

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

const validateAndError = (value, type, message) => {
  if (
    type[0] === type[0].toUpperCase()
      ? !validator[`is${type}`]('' + value)
      : typeof value !== type || !value
  ) {
    createError(message, 400);
  }
};

module.exports = { validator, createError, validateAndError }