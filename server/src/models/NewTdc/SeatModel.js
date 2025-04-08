import { DataTypes } from "sequelize";
import sequelize from "../../db/index.js";

const VacantSeat = sequelize.define(
  "VacantSeat", // Model name
  {
    sport: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    totalSeats: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bookedSeats: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "Sport",
    freezeTableName: true, 
    timestamps: true, 
  }
);

export default VacantSeat;
