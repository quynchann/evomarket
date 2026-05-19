'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const cols = await queryInterface.describeTable('Orders')

    if (!cols.shipping_fee) {
      await queryInterface.addColumn('Orders', 'shipping_fee', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      })
    }

    if (!cols.shipping_method_ui) {
      await queryInterface.addColumn('Orders', 'shipping_method_ui', {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'standard',
        comment: 'standard | express — không liên kết đơn vị vận chuyển, chỉ option checkout',
      })
    }
  },

  async down(queryInterface) {
    const cols = await queryInterface.describeTable('Orders')
    if (cols.shipping_method_ui) {
      await queryInterface.removeColumn('Orders', 'shipping_method_ui')
    }
    if (cols.shipping_fee) {
      await queryInterface.removeColumn('Orders', 'shipping_fee')
    }
  },
}
