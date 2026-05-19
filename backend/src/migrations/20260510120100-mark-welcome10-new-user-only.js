"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      `UPDATE Coupons SET new_user_only = true WHERE UPPER(code) = 'WELCOME10'`,
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `UPDATE Coupons SET new_user_only = false WHERE UPPER(code) = 'WELCOME10'`,
    );
  },
};
