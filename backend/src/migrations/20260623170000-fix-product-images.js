'use strict'

const { productImageSets } = require('../constants/productImages')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    for (const [id, { thumbnail, images }] of Object.entries(
      productImageSets,
    )) {
      const productId = Number(id)
      const imagesJson = JSON.stringify(images)

      await queryInterface.sequelize.query(
        `
        UPDATE Products
        SET thumbnail = :thumbnail, images = :images
        WHERE id = :productId;
        `,
        { replacements: { thumbnail, images: imagesJson, productId } },
      )

      await queryInterface.sequelize.query(
        `
        UPDATE OrderItems
        SET product_thumbnail = :thumbnail
        WHERE product_id = :productId;
        `,
        { replacements: { thumbnail, productId } },
      )
    }
  },

  async down() {
    // Không khôi phục URL ảnh cũ
  },
}
