const Discord = require('discord.js')
const client = new Discord.Client()
const Sequelize = require('sequelize')
const Sqlite3 = require('sqlite3')

const sequelize = new Sequelize('sqlite::memory::')

const Tags = sequelize.define('tags', {
	name: {
		type: Sequelize.TEXT,
		unique: true,
	},
	description: Sequelize.TEXT,
	username: Sequelize.STRING,
	usage_count: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
		allowNull: false,
	},
});

client.once('ready', () => {
	Tags.sync();
});

module.exports = async function (msg) {
  	let textToArray = msg.content.split(" ")
  	let textMessage = textToArray.shift()
  	let referencedMessage = msg.reference
  	if ( !msg.reference )
		return;
	msg.channel.messages.fetch(referencedMessage.messageID).then( async message => {
        const linkToPost = "https://discord.com/channels/" + referencedMessage.guildID + "/" + referencedMessage.channelID + "/" + referencedMessage.messageID
        const textInPost = message.content

        const splitArgs = textInPost.split(' ');
        const tagName = splitArgs.shift();
        const tagDescription = splitArgs.join(' ');

        try {
            const tag = await Tags.create({
                name: tagName,
                description: tagDescription,
                username: message.author.username,
            });
            return message.reply(`Tag ${tag.name} added.`);
        }

        catch (e) {
            if (e.name === 'SequelizeUniqueConstraintError') {
                return message.reply('That tag already exists.');
            }
            return message.reply('Something went wrong with adding a tag.');
        }

		msg.channel.send(linkToPost + ";" + textInPost);
	} );
  // msg.channel.send("**link**\n" + "https://discord.com/channels/" + referencedMessage.guildID + "/" + referencedMessage.channelID + "/" + referencedMessage.messageID);

  // msg.channel.messages.fetch(referencedMessage.messageID)
  // .then(message => msg.channel.send("**content**\n" + message.content))
  // .catch(console.error);
}