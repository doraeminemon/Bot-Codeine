const { Sequelize } = require('sequelize');

const db = {};

const connection = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    // logging: console.log,
    storage: 'database/repository.sqlite',
})

db.connection = connection;
db.Sequelize = Sequelize;

db.checkConnection = async function() {
    connection
        .authenticate()
        .then( () => {
            console.info("\nINFO - Database connected.")
        })
        .catch( (err) => {
            console.error("ERROR - Unable to connect to the database:", err)
        })
}

const modelDefiners = [
    require('./models/repo.model')
]

for (const modelDefiner of modelDefiners) {
	modelDefiner(connection);
}

module.exports = connection;