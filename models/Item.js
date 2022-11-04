module.exports = (sequelize, DataTypes) => {
  const Item = sequelize.define(
    'Item',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      sku: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      barcode: {
        type: DataTypes.STRING(13),
        unique: true,
        validate: {
          isUpc(value) {
            if (value.length === 12 || value.length === 13) {
              const digits = [...value];
              const lastDigit = digits.pop();
              digits.reverse();
              const sumOddEven = digits.reduce(
                (acc, el, idx) => {
                  if (idx % 2 === 0) {
                    return [acc[0] + +el, acc[1]];
                  } else {
                    return [acc[0], acc[1] + +el];
                  }
                },
                [0, 0]
              );
              const modulo = (3 * sumOddEven[0] + sumOddEven[1]) % 10;
              const checkDigit = modulo && 10 - modulo;
              if (+lastDigit !== checkDigit) {
                throw new Error('invalid UPC code');
              }
            } else {
              throw new Error('invalid UPC code');
            }
          },
        },
      },
      altName: DataTypes.STRING,
      image: DataTypes.STRING,
      weight: DataTypes.DECIMAL(10, 2),
      width: DataTypes.DECIMAL(10, 2),
      length: DataTypes.DECIMAL(10, 2),
      height: DataTypes.DECIMAL(10, 2),
      position: DataTypes.STRING,
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      avgCost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      underscored: true,
    }
  );

  Item.associate = (models) => {
    Item.belongsTo(models.User, {
      as: 'user',
      foreignKey: {
        name: 'userId',
        allowNull: false,
      },
      onUpdate: 'RESTRICT',
      onDelete: 'RESTRICT',
    });
    Item.belongsTo(models.Group, {
      as: 'group',
      foreignKey: {
        name: 'groupId',
      },
      onUpdate: 'RESTRICT',
      onDelete: 'SET NULL',
    });
    Item.belongsTo(models.Family, {
      as: 'family',
      foreignKey: {
        name: 'familyId',
      },
      onUpdate: 'RESTRICT',
      onDelete: 'SET NULL',
    });
  };

  return Item;
};
