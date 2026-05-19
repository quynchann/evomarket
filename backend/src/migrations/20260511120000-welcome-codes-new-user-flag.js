"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      `UPDATE Coupons SET new_user_only = 1 WHERE UPPER(TRIM(code)) REGEXP '^WELCOME[0-9]*$'`,
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `UPDATE Coupons SET new_user_only = 0 WHERE UPPER(TRIM(code)) REGEXP '^WELCOME[0-9]*$'`,
    );
  },
};
