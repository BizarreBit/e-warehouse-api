const fs = require('fs');

const { createError } = require('../utilities/createError');
const cloudinary = require('../utilities/cloudinary');

const { User } = require('../models');

exports.getMe = (req, res, next) => {
  try {
    const user = req.user
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

exports.updateImage = async (req, res, next) => {
  try {
    if (!req.file) {
      createError('profile image is required');
    }

    const result = await cloudinary.upload(req.file.path);
    await cloudinary.destroyByUrl(req.user.profileImage);

    await User.update(
      { profileImage: result.secure_url },
      { where: { id: req.user.id } }
    );

    res.json({ profileImage: result.secure_url });
  } catch (err) {
    next(err);
  } finally {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
  }
};

exports.updateDetail = async (req, res, next) => {
  try {
    const { firstName, lastName } = req.body;

    if (!(firstName || lastName)) {
      createError('firstName or lastName is required', 400);
    }

    if (
      (firstName && typeof firstName !== 'string') ||
      (lastName && typeof lastName !== 'string')
    ) {
      createError('firstName and lastName must be string', 400);
    }

    const updateValue = {};
    if (firstName) {
      updateValue.firstName = firstName;
    }
    if (lastName) {
      updateValue.lastName = lastName;
    }

    await User.update(updateValue, { where: { id: req.user.id } });

    res.json(updateValue);
  } catch (err) {
    next(err);
  }
};
