const { Sequelize } = require('sequelize');
const db = {};

const connection = new Sequelize('database', 'root', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database/repository.sqlite',
})

db.connection = connection;
db.Sequelize = Sequelize;

db.checkConnection = async function() {
    connection.authenticate()
    .then(() => {console.info("Đã kết nối với Database.")})
    .catch((error) => {console.error("Lỗi không kết nối được với database:", error)})
}

db.checkConnection();

const modelDefiners = [
    require('./models/repo.model'),
    require('./models/tags.model')
];

for (const modelDefiner of modelDefiners) {
	modelDefiner(connection);
}

module.exports = connection;