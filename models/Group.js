module.exports = (sequelize, DataTypes) => {
  const Group = sequelize.define(
    'Group',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      familyCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
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

  Group.associate = (models) => {
    Group.belongsTo(models.User, {
      as: 'user',
      foreignKey: {
        name: 'userId',
        allowNull: false,
      },
      onUpdate: 'RESTRICT',
      onDelete: 'RESTRICT',
    });
    Group.hasMany(models.Family, {
      as: 'families',
      foreignKey: {
        name: 'groupId',
      },
      onUpdate: 'RESTRICT',
      onDelete: 'SET NULL',
    })
    Group.hasMany(models.Item, {
      as: 'items',
      foreignKey: {
        name: 'groupId',
      },
      onUpdate: 'RESTRICT',
      onDelete: 'SET NULL',
    })
  };

  return Group;
};
