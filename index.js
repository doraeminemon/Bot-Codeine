const Discord = require('discord.js')
const client = new Discord.Client()
const mySecret = process.env['TOKEN']
const SQLite3 = require('sqlite3')
const Sequelize = require('sequelize')

const connection = require('./database');

async function assertDatabaseConnectionOk() {
	console.log('Checking database connection…');
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
    // logging: console.log
}).then( () => {
    // connection.model('database').build( {
    //     title: 'Test Title',
    //     content: 'Test Content',
    //     author: 'Test Author',
    //     url: 'http://test.com/',
    //     attachments: 'Test Attachments',
    //     tags: 'Không có',
    // }).save()
    connection.model('database').findOne({
        where: { title: 'Test Title' }
    }).then(test => {
        console.log('Tags: ' + test.tags)
    }).catch(error => console.log(error))
}).catch(error => console.log(error))

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}.`)
    client.user.setActivity('Netflix', {type: 'WATCHING'})
    // client.channels.cache.get('827113933881081866').send('Già rồi còn non')
})

const commandHandler = require('./commands')
client.on('message', commandHandler)

// keepAlive()
client.login(mySecret)