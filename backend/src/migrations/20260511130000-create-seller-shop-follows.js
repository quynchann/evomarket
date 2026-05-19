'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SellerShopFollows', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      seller_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      follower_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    })

    await queryInterface.addConstraint('SellerShopFollows', {
      fields: ['seller_id', 'follower_id'],
      type: 'unique',
      name: 'seller_shop_follows_seller_follower_uniq',
    })
    await queryInterface.addIndex('SellerShopFollows', ['seller_id'], {
      name: 'seller_shop_follows_seller_idx',
    })
    await queryInterface.addIndex('SellerShopFollows', ['follower_id'], {
      name: 'seller_shop_follows_follower_idx',
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('SellerShopFollows')
  },
}
