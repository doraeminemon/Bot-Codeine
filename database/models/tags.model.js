const { DataTypes } = require('sequelize')

module.exports = (connection) => {
    connection.define('tag', {
        tagName: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            primaryKey: true,
        },
    })
}