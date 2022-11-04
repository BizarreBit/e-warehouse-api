'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        'items',
        {
          id: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
          },
          name: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
            unique: true,
          },
          sku: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
            unique: true,
          },
          barcode: {
            type: Sequelize.DataTypes.STRING(13),
            unique: true,
          },
          alt_name: Sequelize.DataTypes.STRING,
          image: Sequelize.DataTypes.STRING,
          weight: Sequelize.DataTypes.DECIMAL(10, 2),
          width: Sequelize.DataTypes.DECIMAL(10, 2),
          length: Sequelize.DataTypes.DECIMAL(10, 2),
          height: Sequelize.DataTypes.DECIMAL(10, 2),
          position: Sequelize.DataTypes.STRING,
          active: {
            type: Sequelize.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
          },
          quantity: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
          },
          price: {
            type: Sequelize.DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
          },
          avg_cost: {
            type: Sequelize.DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
          },
          user_id: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: {
                tableName: 'users',
              },
              key: 'id',
            },
          },
          group_id: Sequelize.DataTypes.INTEGER,
          family_id: Sequelize.DataTypes.INTEGER,
          created_at: {
            type: Sequelize.DataTypes.DATE,
            allowNull: false,
          },
          updated_at: {
            type: Sequelize.DataTypes.DATE,
            allowNull: false,
          },
        },
        { transaction: t }
      );
      await queryInterface.addConstraint('items', {
        fields: ['group_id'],
        type: 'foreign key',
        references: {
          table: 'groups',
          field: 'id',
        },
        onDelete: 'set null',
        transaction: t,
      });
      await queryInterface.addConstraint('items', {
        fields: ['family_id'],
        type: 'foreign key',
        references: {
          table: 'families',
          field: 'id',
        },
        onDelete: 'set null',
        transaction: t,
      });
      return t.commit();
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.dropTable('items');
  },
};
