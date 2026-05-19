"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const couponCols = await queryInterface.describeTable("Coupons");
    if (!couponCols.new_user_only) {
      await queryInterface.addColumn("Coupons", "new_user_only", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }

    const tables = await queryInterface.showAllTables();
    const hasRedemptions = tables.some(
      (t) => String(t).toLowerCase() === "couponredemptions",
    );

    if (!hasRedemptions) {
      await queryInterface.createTable("CouponRedemptions", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      coupon_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

      await queryInterface.addIndex("CouponRedemptions", ["user_id", "coupon_id"], {
        unique: true,
        name: "coupon_redemptions_user_coupon_unique",
      });
    }

    const orderCols = await queryInterface.describeTable("Orders");
    if (!orderCols.coupon_id) {
      await queryInterface.addColumn("Orders", "coupon_id", {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }
    if (!orderCols.coupon_discount) {
      await queryInterface.addColumn("Orders", "coupon_discount", {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Orders", "coupon_discount");
    await queryInterface.removeColumn("Orders", "coupon_id");
    await queryInterface.dropTable("CouponRedemptions");
    await queryInterface.removeColumn("Coupons", "new_user_only");
  },
};
