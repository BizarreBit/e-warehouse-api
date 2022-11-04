const fs = require('fs');

const { createError, bulkValidate } = require('../utilities/createError');
const cloudinary = require('../utilities/cloudinary');

const { Family, Group, Item, sequelize } = require('../models');

const exclude = ['userId', 'createdAt', 'updatedAt'];

const varList = [
  { name: 'name', type: 'string' },
  { name: 'sku', type: 'string' },
  { name: 'barcode', type: 'string', isRequired: false },
  { name: 'altName', type: 'string', isRequired: false },
  { name: 'altName', type: 'string', isRequired: false },
  { name: 'weight', type: 'number', isRequired: false },
  { name: 'width', type: 'number', isRequired: false },
  { name: 'length', type: 'number', isRequired: false },
  { name: 'height', type: 'number', isRequired: false },
  { name: 'position', type: 'string', isRequired: false },
  { name: 'active', type: 'boolean', isRequired: false },
  { name: 'quantity', type: 'number', isRequired: false },
  { name: 'price', type: 'number', isRequired: false },
  { name: 'avgCost', type: 'number', isRequired: false },
  { name: 'groupId', type: 'number', isRequired: false },
  { name: 'familyId', type: 'number', isRequired: false },
];

exports.createItem = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const {
      name,
      sku,
      barcode,
      altName,
      weight,
      width,
      length,
      height,
      position,
      active,
      quantity,
      price,
      avgCost,
      groupId,
      familyId,
    } = req.body;
    const { id: userId } = req.user;

    bulkValidate(
      {
        name,
        sku,
        altName,
        weight,
        width,
        length,
        height,
        position,
        active,
        quantity,
        price,
        avgCost,
        groupId,
        familyId,
      },
      varList
    );

    let image;
    if (req.file) {
      const result = await cloudinary.upload(req.file.path);
      image = result.secure_url;
    }

    //Count Adjust
    if (groupId) {
      await Group.increment(
        { itemCount: 1 },
        { where: { id: groupId }, transaction: t }
      );
    }
    if (familyId) {
      await Family.increment(
        { itemCount: 1 },
        { where: { id: familyId }, transaction: t }
      );
    }

    const item = await Item.create(
      {
        name,
        sku,
        barcode,
        altName,
        image,
        weight,
        width,
        length,
        height,
        position,
        active,
        quantity,
        price,
        avgCost,
        userId,
        groupId,
        familyId,
      },
      { transaction: t }
    );

    await t.commit();

    exclude.forEach((el) => {
      delete item.dataValues[el];
    });

    res.status(201).json({ item });
  } catch (err) {
    await t.rollback();
    next(err);
  } finally {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
  }
};

exports.getItem = async (req, res, next) => {
  try {
    const { id: userId } = req.user;

    const families = await Item.findAll({
      where: { userId },
      attributes: { exclude: [...exclude, 'groupId', 'familyId'] },
      include: [
        {
          model: Group,
          as: 'group',
          attributes: { exclude },
        },
        {
          model: Family,
          as: 'family',
          attributes: { exclude: [...exclude, 'groupId'] },
        },
      ],
    });

    res.json({ families });
  } catch (err) {
    next(err);
  }
};

exports.editItem = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { id: userId } = req.user;
    const { itemId } = req.params;
    const {
      name,
      sku,
      barcode,
      altName,
      image: noImage,
      weight,
      width,
      length,
      height,
      position,
      active,
      quantity,
      price,
      avgCost,
      groupId,
      familyId,
    } = req.body;

    const passValidate = bulkValidate(
      {
        name,
        sku,
        barcode,
        altName,
        weight,
        width,
        length,
        height,
        position,
        active,
        quantity,
        price,
        avgCost,
        groupId,
        familyId,
      },
      varList,
      false,
      [
        {
          name: 'image',
          type: "form-data, 'NOIMAGE'",
          isInvalid: !req.file && noImage !== 'NOIMAGE',
        },
      ]
    );

    const item = await Item.findOne({ where: { id: itemId } });
    if (!item) {
      createError('item not found', 400);
    }

    if (item.userId !== userId) {
      createError('you have no permission', 403);
    }

    if (req.file) {
      const { secure_url: image } = await cloudinary.upload(req.file.path);
      await cloudinary.destroyByUrl(item.image);
      passValidate.image = image;
    } else if (noImage === 'NOIMAGE') {
      passValidate.image = null;
    }

    const oldGroupId = item.groupId;
    const oldFamilyId = item.familyId;
    Object.keys(passValidate).forEach((el) => (item[el] = passValidate[el]));

    //Direct Count Adjust
    if (item.groupId !== oldGroupId) {
      if (!oldGroupId) {
        await Group.increment(
          { itemCount: 1 },
          { where: { id: item.groupId }, transaction: t }
        );
      } else {
        await Group.increment(
          { itemCount: -1 },
          { where: { id: oldGroupId }, transaction: t }
        );
        if (item.groupId) {
          await Group.increment(
            { itemCount: 1 },
            { where: { id: item.groupId }, transaction: t }
          );
        }
      }
    }
    if (item.familyId !== oldFamilyId) {
      if (!oldFamilyId) {
        await Family.increment(
          { itemCount: 1 },
          { where: { id: item.familyId }, transaction: t }
        );
      } else {
        await Family.increment(
          { itemCount: -1 },
          { where: { id: oldFamilyId }, transaction: t }
        );
        if (item.familyId) {
          await Family.increment(
            { itemCount: 1 },
            { where: { id: item.familyId }, transaction: t }
          );
        }
      }
    }
    await item.save({ transaction: t });

    await t.commit();

    exclude.forEach((el) => {
      delete item.dataValues[el];
    });

    res.json({ item });
  } catch (err) {
    await t.rollback();
    next(err);
  } finally {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
  }
};

exports.deleteItem = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { id: userId } = req.user;
    const { itemId } = req.params;

    const item = await Item.findOne({ where: { id: itemId } });
    if (!item) {
      createError('item not found', 400);
    }

    if (item.userId !== userId) {
      createError('you have no permission', 403);
    }

    //Direct Count Adjust
    if (item.groupId) {
      await Group.increment(
        { itemCount: -1 },
        { where: { id: item.groupId }, transaction: t }
      );
    }
    if (item.familyId) {
      await Family.increment(
        { itemCount: -1 },
        { where: { id: item.familyId }, transaction: t }
      );
    }

    await cloudinary.destroyByUrl(item.image);
    await item.destroy({ transaction: t });

    await t.commit();

    res.status(204).json();
  } catch (err) {
    await t.rollback();
    next(err);
  }
};
