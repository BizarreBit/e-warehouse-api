const { bulkValidate, createError } = require('../utilities/createError');
const cloudinary = require('../utilities/cloudinary');
const { Family, Group, Item, sequelize } = require('../models');

const exclude = ['userId', 'createdAt', 'updatedAt'];

const varList = [{ name: 'name', type: 'string' }];

exports.createGroup = async (req, res, next) => {
  try {
    const { name } = req.body;
    const { id: userId } = req.user;

    bulkValidate({ name }, varList);

    const group = await Group.create({ name, userId });

    exclude.forEach((el) => {
      delete group.dataValues[el];
    });

    res.status(201).json({ group });
  } catch (err) {
    next(err);
  }
};

exports.getGroup = async (req, res, next) => {
  try {
    const { id: userId } = req.user;

    const groups = await Group.findAll({
      where: { userId },
      attributes: { exclude },
    });

    res.json({ groups });
  } catch (err) {
    next(err);
  }
};

exports.editGroup = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { groupId } = req.params;
    const { name } = req.body;

    bulkValidate({ name }, varList);

    const group = await Group.findOne({ where: { id: groupId } });
    if (!group) {
      createError('group not found', 400);
    }

    if (group.userId !== userId) {
      createError('you have no permission', 403);
    }

    group.name = name;
    await group.save();

    exclude.forEach((el) => {
      delete group.dataValues[el];
    });

    res.json({ group });
  } catch (err) {
    next(err);
  }
};

exports.deleteGroup = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const { id: userId } = req.user;
    const { groupId } = req.params;
    const { isCascadeDelete } = req.body;

    if (isCascadeDelete !== undefined && typeof isCascadeDelete !== 'boolean') {
      createError('isCascadeDelete must be boolean or undefined', 400);
    }

    const group = await Group.findOne({ where: { id: groupId } });
    if (!group) {
      createError('group not found', 400);
    }

    if (group.userId !== userId) {
      createError('you have no permission', 403);
    }

    if (isCascadeDelete) {
      //Cascade Count Adjust And Delete
      //[1. Delete items with groupId]
      // count to-be-deleted items with groupId by familyId
      const items = await Item.findAll({ where: { groupId } });
      const affectedFamily = items.reduce(
        (acc, item) => ({
          ...acc,
          [item.familyId]: (acc[item.familyId] || 0) + 1,
        }),
        {}
      );
      // adjust itemCount of families with affected family id
      for (let key in affectedFamily) {
        await Family.increment(
          { itemCount: -affectedFamily[key] },
          { where: { id: key }, transaction: t }
        );
      }
      // delete items with groupId
      for (let item of items) {
        await cloudinary.destroyByUrl(item.image);
      }
      await Item.destroy({ where: { groupId }, transaction: t });

      //[2. Delete Families with groupId]
      //get to-be-deleted families with groupId
      const families = await Family.findAll({ where: { groupId } });
      for (let family of families) {
        // count to-be-deleted items by other groupId
        const familyIdItems = await Item.findAll({
          where: { familyId: family.id },
        });
        const otherAffectedGroup = familyIdItems.reduce((acc, item) => {
          if (item.groupId === groupId) {
            return acc;
          }
          return {
            ...acc,
            [item.groupId]: (acc[item.groupId] || 0) + 1,
          };
        }, {});
        // adjust itemCount of groups with other affected group id
        for (let key in otherAffectedGroup) {
          await Group.increment(
            { itemCount: -otherAffectedGroup[key] },
            { where: { id: key }, transaction: t }
          );
        }
        // delete items with familyId of families with groupId
        for (let item of familyIdItems) {
          await cloudinary.destroyByUrl(item.image);
        }
        await Item.destroy({
          where: { familyId: family.id },
          transaction: t,
        });
      }
      // delete families with groupId
      await Family.destroy({ where: { groupId }, transaction: t });
    }
    await group.destroy({ transaction: t });

    await t.commit();

    if (isCascadeDelete !== undefined) {
      res.json({ isCascadeDelete });
    } else {
      res.status(204).json();
    }
  } catch (err) {
    await t.rollback();
    next(err);
  }
};
