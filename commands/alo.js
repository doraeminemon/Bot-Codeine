module.exports = async function(message) {
    const referencedMessage = message.reference
    if (!message.reference) return

    const post = await message.channel.messages.fetch(referencedMessage.messageID)


    console.log(post.author.displayAvatarURL())
    // message.channel.send(message.guild.iconURL())
}