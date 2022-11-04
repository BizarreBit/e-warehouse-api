module.exports = (sequelize, DataTypes) => {
  const Family = sequelize.define(
    'Family',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      itemCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      underscored: true,
    }
  );

  Family.associate = (models) => {
    Family.belongsTo(models.User, {
      as: 'user',
      foreignKey: {
        name: 'userId',
        allowNull: false,
      },
      onUpdate: 'RESTRICT',
      onDelete: 'RESTRICT',
    })
    Family.belongsTo(models.Group, {
      as: 'group',
      foreignKey: {
        name: 'groupId',
      },
      onUpdate: 'RESTRICT',
      onDelete: 'SET NULL',
    })
    Family.hasMany(models.Item, {
      as: 'items',
      foreignKey: {
        name: 'familyId',
      },
      onUpdate: 'RESTRICT',
      onDelete: 'SET NULL',
    })
  }

  return Family;
};
