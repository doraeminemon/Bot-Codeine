const { Sequelize } = require('sequelize');

const db = {};

const connection = new Sequelize('database', 'root', 'root', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: console.log,
    storage: 'database/repository.sqlite',
})

db.connection = connection;
db.Sequelize = Sequelize;

db.checkConnection = async function() {
    connection
        .authenticate()
        .then( () => {
            console.info("Đã kết nối với Database.")
        })
        .catch( (error) => {
            console.error("Ôi địt cụ lỗi rồi:", error)
        })
}

db.checkConnection();

const modelDefiners = [
    require('./models/repo.model')
]

for (const modelDefiner of modelDefiners) {
	modelDefiner(connection);
}

module.exports = connection;