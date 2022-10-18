const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwtSign = require('jsonwebtoken').sign;

const { User } = require('../models');
const createError = require('../utilities/createError');

const validateAndError = (value, type, message) => {
  if (
    type[0] === type[0].toUpperCase()
      ? !validator[`is${type}`]('' + value)
      : typeof value !== type || !value
  ) {
    createError(message, 400);
  }
};

const genToken = (payload) => {
  return jwtSign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signUp = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    validateAndError(firstName, 'string', 'first name is required');
    validateAndError(lastName, 'string', 'last name is required');
    validateAndError(email, 'Email', 'email is required');
    validateAndError(password, 'string', 'password is required');
    if (password.length < 8) {
      createError(
        'password length must be equal or greater than 8 characters',
        400
      );
    }

    const hashedPassword = await bcrypt.hash(
      password,
      +process.env.BCRYPT_SALT_LENGTH
    );

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    const token = genToken({ id: user.id });

    res.json({ token });
  } catch (err) {
    next(err);
  }
};

exports.signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    validateAndError(email, 'Email', 'email is required');
    validateAndError(password, 'string', 'password is required');

    const user = await User.findOne({ where: { email } });
    if (!user) {
      createError('invalid credential', 400);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      createError('invalid credential', 400);
    }

    console.log(user)
    const token = genToken({ id: user.id });

    res.json({ token });
  } catch (err) {
    next(err);
  }
};
