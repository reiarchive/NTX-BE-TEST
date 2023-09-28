'use strict'
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    
    class UsersWithRole extends Model { }

    UsersWithRole.init(
        {
            fullname: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true
            },
            roleId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'UsersWithRole',
            tableName: 'users_with_role',
            timestamps: true,
        }
    );

    return UsersWithRole;
}