const { Client, Collection, Guild, TextChannel, Message, Intents } = require('discord.js')

class SanChoiDiscordClient extends Client {
    constructor() {
        super({ partials: ['USER', 'REACTION', 'MESSAGE'], intents: [Intents.FLAGS.GUILD_MEMBERS] })
        /**
         * Starboard channel
         * @type {import('discord.js').TextChannel | null}
         */
        this.starboardChannel = null
        this.commands = new Collection()
    }

    /**
     * Set a message as reply, return the replied message
     * @param {import('../lib/client')} client
     * @param {Message} originalMessage
     * @param {string} content
     */
    async replyToMessage(client, originalMessage, content) {
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

}

module.exports = SanChoiDiscordClient