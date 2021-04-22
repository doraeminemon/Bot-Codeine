const SQLite3 = require("sqlite3")
const Sequelize = require("sequelize")

const connection = require('../database');

module.exports = async function(msg) {
    let textToArray = msg.content.split(" ")
    let textMessage = textToArray.shift();
    let find_title = textToArray.join(" ")

    console.log(textMessage)
        const repoTitle = find_title;
        console.log("Find tag: " + repoTitle)
        const repo = await connection.model('repository').findOne({ where: { title: repoTitle } });
        if (repo) {

            return msg.channel.send("Tiêu đề: " + repo.get('title') + "\nTác giả:" + repo.get('author') + "\nNội dung:" + repo.get('content') + "\nURL tới post: " + repo.get('url') + "\n\nĐính kèm: " + repo.get('attachments') + "\nĐường dẫn trong post: " + repo.get('links'));
        }
        return msg.reply(`Could not find tag: ${repoTitle}`);
}