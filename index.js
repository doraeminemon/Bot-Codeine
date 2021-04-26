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
    // logging: console.log
})
.then( () => {

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
        console.log("\nTags: " + test.tags)
    }).catch(error => console.log(error)) 


}).catch(error => console.log(error))

// client.on('debug', console.log);

client.on("ready", () => {
    console.log(`\nLogged in as ${client.user.tag}. \n`)
    client.user.setActivity('Nhấn !alo để thưa ngài.', {type: "WATCHING"})


        // client.channels.cache.get('546206789503549461').send('Hãy trả lại công bằng cho @Dank Memer!')

})

const commandHandler = require("./commands")
client.on("message", commandHandler)

// keepAlive()
client.login(mySecret)