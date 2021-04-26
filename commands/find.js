const SQLite3 = require("sqlite3")
const Sequelize = require("sequelize")

const connection = require('../database');

module.exports = async function(msg) {
    let textToArray = msg.content.split(" ")
    let textMessage = textToArray.shift();
    let find_title = textToArray.join(" ");

    const repoTitle = find_title;
    console.log("Find tag: " + repoTitle)
    const repo = await connection.model('database').findOne({ where: { title: repoTitle } });
    if (repo) {
        console.log(repo.dataValues)
        
        return msg.channel.send("Tiêu đề: " + repo.get('title') + "\n Tác giả: " + repo.get('author') + "\nNội dung: " + repo.get('content') + "\nURL tới post: " + repo.get('url') + "\nĐính kèm: " + repo.get('attachments') + "\nĐường dẫn trong post: " + repo.get('links'));
    }
    return msg.reply(`Làm đéo có ${repoTitle}?`);
}