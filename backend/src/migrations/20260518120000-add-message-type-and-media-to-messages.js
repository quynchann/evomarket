'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Messages', 'message_type', {
      type: Sequelize.ENUM('text', 'image', 'audio', 'file'),
      allowNull: false,
      defaultValue: 'text',
      after: 'content'
    })

    await queryInterface.addColumn('Messages', 'media_url', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'message_type'
    })

    // Update existing messages to have type 'text'
    await queryInterface.sequelize.query(`
      UPDATE Messages SET message_type = 'text' WHERE message_type IS NULL
    `)
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Messages', 'media_url')
    await queryInterface.removeColumn('Messages', 'message_type')
  }
}
