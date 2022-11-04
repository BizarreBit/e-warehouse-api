'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const t = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        'families',
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
          item_count: {
            type: Sequelize.DataTypes.INTEGER,
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
      await queryInterface.addConstraint('families', {
        fields: ['group_id'],
        type: 'foreign key',
        references: {
          table: 'groups',
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
    return await queryInterface.dropTable('families');
  },
};
