'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Attacks extends Model { }

    Attacks.init(
        {
            sourceCountry: {
                type: DataTypes.STRING(155),
                allowNull: false,
            },
            destinationCountry: {
                type: DataTypes.STRING(155),
                allowNull: true,
            },
            millisecond: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            type: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            weight: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            attackTime: {
                type: DataTypes.DATEONLY,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'Attacks',
            tableName: 'map_attacks',
            timestamps: true,
            createdAt: 'createdAt',
            updatedAt: 'updatedAt',
        }
    );

    return Attacks;
};