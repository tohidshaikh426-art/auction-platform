module.exports = (sequelize, DataTypes) => {
  const Item = sequelize.define("Item", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING, // URL or path
    },
    basePrice: {
      type: DataTypes.INTEGER,
      defaultValue: 50,
    },
    currentBid: {
      type: DataTypes.INTEGER,
      defaultValue: 50,
    },
    winnerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    auctionIndex: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    timerEnd: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      defaultValue: "product",
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "pending",
    },
    bidCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  });

  return Item;
};
