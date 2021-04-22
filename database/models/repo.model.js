const { DataTypes } = require('sequelize');

module.exports = (connection) => {
    connection.define('repository', {
            title: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false
            },
            content: DataTypes.TEXT,
            author: DataTypes.STRING,
            url: {
                type: DataTypes.STRING,
                unique: true,
            },
            attachments: {
                type: DataTypes.TEXT,
                allowNull: false
            }, 
            links: {
                type: DataTypes.TEXT
            },
            // tags: Sequelize.ARRAY,
            usage_count: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            }
        }
    )
}