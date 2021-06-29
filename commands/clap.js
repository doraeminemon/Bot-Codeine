const { Guild, TextChannel, Message, MessageEmbed } = require('discord.js')

/**
 * Set a message as reply, return the replied message
 * @param {import('../lib/client')} client
 * @param {Message} originalMessage
 * @param {string} content
 */
const replyToMessage = async (client, originalMessage, content) => {
    const response = await client.api.channels[originalMessage.channel.id].messages.post({
        data: {
            content,
            message_reference: {
                message_id: originalMessage.id,
                channel_id: originalMessage.channel.id,
                guild_id: originalMessage.guild.id,
            },
        },
    })
    const guild = new Guild(client, { id: response.message_reference.guild_id })
    const currentChannel = new TextChannel(guild, { id: response.message_reference.channel_id })
    const botMessage = new Message(client, response, currentChannel)
    return botMessage
}

module.exports = {
    name: 'clap',
    description: 'Highlight message worth clapping',
    /**
     * @param {import('../lib/context')} context
     */
    async execute({ client, message }) {
        const minimumCounterNeeded = 2
        const awaitTimeInSeconds = 15
        if (client.starboardChannel === null) {
            message.channel.send('Command need a starboard to works')
            return
        }
        if (!message.reference) {
            message.channel.send('Need to reference a message')
            return
        }
        const referencedMessage = await message.channel.messages.fetch(message.reference.messageID)
        const botMessage = await replyToMessage(client, referencedMessage, 'Message worth clap for ?')
        if (botMessage) {
            botMessage.react('👏')
        }
        const collected = await botMessage.awaitReactions(
            (reaction) => reaction.emoji.name === '👏',
            { time: awaitTimeInSeconds * 1000 },
        )
        if (collected.get('👏').count < minimumCounterNeeded) return
        const embeddedMessage = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${referencedMessage.author.tag} with ${ collected.get('👏').count} claps`)
            .setDescription(referencedMessage.content)
            .setURL()
        if (referencedMessage.attachments.array().length > 0) {
            embeddedMessage
                .setThumbnail(referencedMessage.attachments.array()[0].attachment)
                .setImage(referencedMessage.attachments.array()[0].attachment)
        }
        console.log({ referencedMessage })
        client.starboardChannel.send(embeddedMessage)
    },
}
