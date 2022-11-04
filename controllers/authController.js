const bcrypt = require('bcryptjs');
const jwtSign = require('jsonwebtoken').sign;

const { User } = require('../models');
const { createError, bulkValidate } = require('../utilities/createError');

const genToken = (payload) => {
  return jwtSign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signUp = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const varList = [
      { name: 'firstName', type: 'string' },
      { name: 'lastName', type: 'string' },
      { name: 'email', type: 'Email' },
      { name: 'password', type: 'string' },
    ];
    bulkValidate({ firstName, lastName, email, password }, varList);

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
    const varList = [
      { name: 'email', type: 'Email' },
      { name: 'password', type: 'string' },
    ];
    bulkValidate({ email, password }, varList);

    const user = await User.findOne({ where: { email } });
    if (!user) {
      createError('invalid credential', 400);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      createError('invalid credential', 400);
    }

    const token = genToken({ id: user.id });

    res.json({ token });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const varList = [
      { name: 'oldPassword', type: 'string' },
      { name: 'newPassword', type: 'string' },
    ];
    bulkValidate({ oldPassword, newPassword }, varList);

    if (newPassword.length < 8) {
      createError(
        'password length must be equal or greater than 8 characters',
        400
      );
    }
    if (oldPassword === newPassword) {
      createError('newPassword can not be the same as oldPassword', 400);
    }

    const user = await User.findOne({ where: { id: req.user.id } });
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      createError('invalid password', 400);
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      +process.env.BCRYPT_SALT_LENGTH
    );

    await User.update(
      { password: hashedPassword, pwdChangedAt: new Date() },
      { where: { id: req.user.id } }
    );

    res.status(204).json();
  } catch (err) {
    next(err);
  }
};

exports.changeEmail = async (req, res, next) => {
  try {
    const { newEmail, password } = req.body;
    const varList = [
      { name: 'newEmail', type: 'string' },
      { name: 'password', type: 'string' },
    ];
    bulkValidate({ newEmail, password }, varList);

    if (password.length < 8) {
      createError('invalid password', 400);
    }

    const user = await User.findOne({ where: { id: req.user.id } });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      createError('invalid password', 400);
    }
    if (user.email === newEmail) {
      createError('you are already registered with this email', 400);
    }

    const currentUser = await User.findOne({ where: { email: newEmail } });
    if (currentUser) {
      createError('this email is already registered', 400);
    }

    await User.update(
      { email: newEmail, pwdChangedAt: new Date() },
      { where: { id: req.user.id } }
    );

    res.status(204).json();
  } catch (err) {
    next(err);
  }
};
