const { bulkValidate, createError } = require('../utilities/createError');
const cloudinary = require('../utilities/cloudinary');
const { Family, Group, Item, sequelize } = require('../models');

const exclude = ['userId', 'createdAt', 'updatedAt'];

const varList = [
  { name: 'name', type: 'string' },
  { name: 'groupId', type: 'number', isRequired: false },
];

exports.createFamily = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { name, groupId } = req.body;
    const { id: userId } = req.user;

    bulkValidate({ name, groupId }, varList);

    //Count Adjust
    if (groupId) {
      await Group.increment(
        { familyCount: 1 },
        { where: { id: groupId }, transaction: t }
      );
    }

    const family = await Family.create(
      {
        name,
        userId,
        groupId,
      },
      { transaction: t }
    );

    await t.commit();

    exclude.forEach((el) => {
      delete family.dataValues[el];
    });

    res.status(201).json({ family });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

exports.getFamily = async (req, res, next) => {
  try {
    const { id: userId } = req.user;

    const families = await Family.findAll({
      where: { userId },
      attributes: { exclude: [...exclude, 'groupId'] },
      include: {
        model: Group,
        as: 'group',
        attributes: { exclude },
      },
    });

    res.json({ families });
  } catch (err) {
    next(err);
  }
};

exports.editFamily = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { id: userId } = req.user;
    const { familyId } = req.params;
    const { name, groupId, isCascadeGroupEdit } = req.body;

    const passValidate = bulkValidate({ name, groupId }, varList, false, [
      {
        name: 'isCascadeGroupEdit',
        type: 'boolean',
        isInvalid: typeof isCascadeGroupEdit !== 'boolean',
      },
    ]);

    const family = await Family.findOne({ where: { id: familyId } });
    if (!family) {
      createError('family not found', 400);
    }

    if (family.userId !== userId) {
      createError('you have no permission', 403);
    }

    const oldGroupId = family.groupId;
    Object.keys(passValidate).forEach((el) => (family[el] = req.body[el]));

    //Direct Count Adjust
    if (family.groupId !== oldGroupId) {
      if (!oldGroupId) {
        await Group.increment(
          { familyCount: 1 },
          { where: { id: family.groupId }, transaction: t }
        );
      } else {
        await Group.increment(
          { familyCount: -1 },
          { where: { id: oldGroupId }, transaction: t }
        );
        if (family.groupId) {
          await Group.increment(
            { familyCount: 1 },
            { where: { id: family.groupId }, transaction: t }
          );
        }
      }
    }

    if (isCascadeGroupEdit) {
      //Cascade Count Adjust And Edit
      const items = await Item.findAll({ where: { familyId: family.id } });
      // count to-be-edit items by changed groupId
      const changedGroup = items.reduce((acc, item) => {
        if (item.groupId === family.groupId) {
          return acc;
        }
        return {
          ...acc,
          [item.groupId]: (acc[item.groupId] || 0) + 1,
        };
      }, {});
      // decrease itemCount of groups with changed group id
      for (let key in changedGroup) {
        if (key !== 'null') {
          await Group.increment(
            { itemCount: -changedGroup[key] },
            { where: { id: key }, transaction: t }
          );
        }
      }
      // increase itemCount of the group with id: family.groupId
      if (family.groupId) {
        const sumCount = Object.values(changedGroup).reduce(
          (acc, count) => acc + +count,
          0
        );
        await Group.increment(
          { itemCount: sumCount },
          { where: { id: family.groupId }, transaction: t }
        );
      }
      // edit all items with familyId to have groupId: family.groupId
      await Item.update(
        { groupId: family.groupId },
        {
          where: { familyId: family.id },
          transaction: t,
        }
      );
    }

    await family.save({ transaction: t });

    await t.commit();

    exclude.forEach((el) => {
      delete family.dataValues[el];
    });

    res.json({ family, isCascadeGroupEdit });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

exports.deleteFamily = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const { id: userId } = req.user;
    const { familyId } = req.params;
    const { isCascadeDelete } = req.body;

    if (isCascadeDelete !== undefined && typeof isCascadeDelete !== 'boolean') {
      createError('isCascadeDelete must be boolean or undefined', 400);
    }

    const family = await Family.findOne({ where: { id: familyId } });
    if (!family) {
      createError('family not found', 400);
    }

    if (family.userId !== userId) {
      createError('you have no permission', 403);
    }

    //Direct Count Adjust
    if (family.groupId) {
      await Group.increment(
        { familyCount: -1 },
        { where: { id: family.groupId }, transaction: t }
      );
    }

    if (isCascadeDelete) {
      //Cascade Count Adjust And Delete
      // count to-be-deleted items with groupId by groupId
      const items = await Item.findAll({ where: { familyId } });
      const affectedGroup = items.reduce(
        (acc, item) => ({
          ...acc,
          [item.groupId]: (acc[item.groupId] || 0) + 1,
        }),
        {}
      );
      // adjust itemCount of groups with affected group id
      for (let key in affectedGroup) {
        await Group.increment(
          { itemCount: -affectedGroup[key] },
          { where: { id: key }, transaction: t }
        );
      }
      // delete items with familyId
      for (let item of items) {
        await cloudinary.destroyByUrl(item.image);
      }
      await Item.destroy({ where: { familyId } }, { transaction: t });
    }

    await family.destroy({ transaction: t });

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
