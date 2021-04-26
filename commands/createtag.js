const Discord = require("discord.js")
const client = new Discord.Client()

const connection = require('../database');

module.exports = async function(msg) {
    let textToArray = msg.content.split(" ")
    let textMessage = textToArray.shift()
    let newTagName = textToArray.join(" ")

    console.log(newTagName)

    try {
            const tags = await connection.model('tag').create({
                tagName: newTagName,
            });
            return msg.reply(`Đã thêm *${tags.tagName}*.`);
        }

        catch (e) {
            if (e.name === 'SequelizeUniqueConstraintError') {
                return msg.reply('Tên này có rồi bạn tôi ơi.');
            }
            return msg.reply('Lỗi thêm tag, bạn tôi ơi.');
        }
}