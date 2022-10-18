'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'users',
      [
        {
          email: 'user1@email.com',
          first_name: 'User1',
          last_name: 'Lastname',
          password: bcrypt.hashSync('12345678', 12),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          email: 'user2@email.com',
          first_name: 'User2',
          last_name: 'Lastname',
          password: bcrypt.hashSync('12345678', 12),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          email: 'user3@email.com',
          first_name: 'User3',
          last_name: 'Lastname',
          password: bcrypt.hashSync('12345678', 12),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('users', null, {});
  },
};
