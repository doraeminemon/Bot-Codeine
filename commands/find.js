const connection = require('../database')
const Discord = require('discord.js')

module.exports = function(message) {
    connection.model('database').findOne({ where: { title: 'findRepoTitle' } }).then(found => {
        const successMessage = new Discord.MessageEmbed()
        successMessage
            .setTitle(found.title)
            .setDescription(found.content)
            .setURL(found.url)
            .setAuthor(found.author, found.authorAvatarURL)
            .setThumbnail('https://media3.giphy.com/media/3o7abB06u9bNzA8lu8/giphy.gif?cid=ecf05e47302639138287f826ac42639cf299da19d497d171&rid=giphy.gif&ct=g')
            .addField('Thẻ', !found.tags ? 'Chưa gắn tag' : found.tags, true)
            .addField('URL', found.url)
            .setImage(!found.attachments ? null : found.attachments)
            .setTimestamp()
            .setFooter(`${message.guild.name}`, message.guild.iconURL())
        message.channel.send(found.authorAvatarURL)
        message.channel.send(successMessage).catch(error => {console.log(error)})
    }).catch(error => {
        message.reply(`Không tìm được. Lỗi rồi: ${error}`)
    })
}