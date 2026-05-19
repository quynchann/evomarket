'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SellerShopVisits', {
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
      visit_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      visitor_key: {
        type: Sequelize.STRING(64),
        allowNull: false,
        comment: 'u:<userId> hoặc a:<uuid> — unique mỗi ngày / shop',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    })

    await queryInterface.addIndex(
      'SellerShopVisits',
      ['seller_id', 'visit_date', 'visitor_key'],
      {
        unique: true,
        name: 'seller_shop_visits_seller_date_visitor_uniq',
      },
    )
    await queryInterface.addIndex('SellerShopVisits', ['seller_id', 'visit_date'], {
      name: 'seller_shop_visits_seller_date_idx',
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('SellerShopVisits')
  },
}
