const Discord = require("discord.js")
const client = new Discord.Client()

const connection = require('../database');

module.exports = async function(msg) {
    let textToArray = msg.content.split(" ")
    let textMessage = textToArray.shift()
    let newTagName = textToArray.join(" ")

    console.log(newTagName)

    try {
        const tagList = await connection.model('tag').findAll({ attributes: ['tagName'] });
        const tagString = tagList.map(t => t.tagName).join(', ') || 'No tags set.';
        return msg.reply(`*${tagString}*`);
    }

    catch (e) {
        if (e.name === 'SequelizeUniqueConstraintError') {
            return msg.reply('Tên này có rồi bạn tôi ơi.');
        }
        return msg.reply('Xảy ra lỗi tìm tag rồi bạn ơi.');
    }
}