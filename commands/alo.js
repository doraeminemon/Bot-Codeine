module.exports = {
    name: 'alo',
    description: 'Echo command',
    /** @param {import('../lib/context')} context */
    async execute({ message }) {
        message.reply('Sup')
    },
}