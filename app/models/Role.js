'use strict'
const { Model } = require('sequelize');



module.exports = (sequelize, DataTypes) => {
    
    class Role extends Model { }

    Role.init(
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
              },
        },
        {
            sequelize,
            modelName: 'Role',
            tableName: 'role',
            timestamps: false,
        }
    );
    
    return Role;
};
