const { DataTypes } = require('sequelize');

module.exports = (connection) => {
    connection.define('database', {
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
                type: DataTypes.STRING(1000)
            },
            tags: DataTypes.TEXT
        }, {
            tableName: 'Repository',
            timestamps: false,
        }
    )
}