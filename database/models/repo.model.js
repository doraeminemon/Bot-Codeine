const { DataTypes } = require('sequelize');

module.exports = (connection) => {
    connection.define('repository', {
            title: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false,
                primaryKey: true,
                validation: {
                    len: [10, 200],
                }
            },
            content: DataTypes.TEXT,
            author: DataTypes.STRING,
            url: {
                type: DataTypes.STRING,
                unique: true,
            },
            attachments: {
                type: DataTypes.TEXT
            }, 
            links: {
                type: DataTypes.TEXT
            },
            tags: DataTypes.TEXT
        }, {
            timestamps: false,
        }
    )
}