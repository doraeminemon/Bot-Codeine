module.exports = {
    name: 'set_starboard',
    description: 'set starboard',
    /**
     * @param {import('../lib/context')} context
     */
    execute(context) {
        if (context.message.channel.type !== 'text') {
            context.message.send('Channel is not a text channel')
            return
        }
        context.client.starboardChannel = context.message.channel
        context.message.channel.send('Channel has been set as starboard')
    },
}