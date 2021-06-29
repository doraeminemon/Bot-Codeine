module.exports = {
    name: 'alo',
    description: 'Echo command',
    /** @param {import('../lib/context')} context */
    async execute({ message }) {
        const referencedMessage = message.reference
        if (!message.reference) return

        message.channel.messages.fetch(referencedMessage.messageID)
    },
}