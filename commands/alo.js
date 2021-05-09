const Discord = require('discord.js')

module.exports = async function (message, argument) {
    let textToArray = message.content.split(' ')
    let textMessage = textToArray.shift()

    const referencedMessage = message.reference
    if (!message.reference) return

    const post = await message.channel.messages.fetch(referencedMessage.messageID)
    

    console.log(post.author.displayAvatarURL())
    // message.channel.send(message.guild.iconURL())
}