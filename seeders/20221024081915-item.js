'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'items',
      [
        {
          user_id: 1,
          group_id: 1,
          family_id: 1,
          name: 'Chocolate Milk 225 ml',
          sku: 'Milk225-Choc',
          barcode: '8850123456770',
          alt_name: 'นมรสช็อคโกแลต',
          weight: 0.31,
          width: 5,
          length: 4,
          height: 12,
          position: 'Shelf E01',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          user_id: 1,
          group_id: 1,
          family_id: 1,
          name: 'Strawberry Milk 225 ml',
          sku: 'Milk225-Straw',
          barcode: '8850123456787',
          alt_name: 'นมรสสตรอว์เบอรรี่',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          user_id: 1,
          group_id: 1,
          family_id: 1,
          name: 'Plain Milk 225 ml',
          sku: 'Milk225-Plain',
          barcode: '8850123456794',
          alt_name: 'นมรสจืด',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          user_id: 1,
          group_id: 2,
          name: 'Golden Zhong Hammer',
          sku: 'ABC088268',
          barcode: '8850123456763',
          alt_name: 'ค้อนทองจีน',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('items', null, {});
  },
};
