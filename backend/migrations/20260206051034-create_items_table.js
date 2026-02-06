'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Items', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      image: {
        type: Sequelize.STRING,
      },
      basePrice: {
        type: Sequelize.INTEGER,
        defaultValue: 50,
      },
      currentBid: {
        type: Sequelize.INTEGER,
        defaultValue: 50,
      },
      winnerId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      auctionIndex: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      timerEnd: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      category: {
        type: Sequelize.STRING,
        defaultValue: "product",
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: "pending",
      },
      bidCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Items');
  }
};
