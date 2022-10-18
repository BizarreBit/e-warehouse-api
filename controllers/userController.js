const fs = require('fs');
const createError = require('../utilities/createError');
const cloudinary = require('../utilities/cloudinary');

const { User } = require('../models');

exports.getMe = (req, res, next) => {
  try {
    const user = {
      id: req.user.id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      profileImage: req.user.profileImage,
    };
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
