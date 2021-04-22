const Discord = require("discord.js")
const client = new Discord.Client()
const mySecret = process.env['TOKEN']
const SQLite3 = require("sqlite3")
const Sequelize = require("sequelize")

const connection = require('./database');

async function assertDatabaseConnectionOk() {
	console.log(`Checking database connection...`);
	try {
		await connection.authenticate();
		console.log('Database connection OK!');
	} catch (error) {
		console.log('Unable to connect to the database:');
		console.log(error.message);
		process.exit(1);
	}
}

connection.sync({
    // force: true,
    logging: console.log
})

// .then(function () {
//     connection.model('repository').create({
//         title: '1',
//         content: 'Dummy Text',
//         author: 'CODY',
//         url: 'https://google.com/',
//         attachments: '',
//         links: ''
//     })
//     connection.model('repository').findOne({ where: { title: '1' }
//     }).then(function(test) {
//         console.log("\n" + test.content)
//     }).catch(err=>console.log(err))
// })
// .catch(err=>console.log(err))

// client.on('debug', console.log);

client.on("ready", () => {
    console.log(`\nLogged in as ${client.user.tag}. \n`)
    client.user.setActivity ("Sẽ mãi mãi yêu em là thế", {type: "LISTENING"})
})

const commandHandler = require("./commands")
client.on("message", commandHandler)

// keepAlive()
client.login(mySecret)