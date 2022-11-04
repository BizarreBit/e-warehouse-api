'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'groups',
      [
        {
          user_id: 1,
          name: 'Dairy',
          family_count: 1,
          item_count: 3,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          user_id: 1,
          name: 'Tools',
          family_count: 0,
          item_count: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          user_id: 1,
          name: 'Housekeeping & Laundry',
          family_count: 0,
          item_count: 0,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('groups', null, {});
  }
};
