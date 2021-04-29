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
                type: DataTypes.TEXT
            },
            tags: DataTypes.STRING
        }, {
            tableName: 'repository',
            timestamps: false,
        }
    )

    connection.define('tag', {
        tagName: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            primaryKey: true
        }
    })
}