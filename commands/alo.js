module.exports = {
    name: 'alo',
    description: 'Echo command',
    /** @param {import('../lib/context')} context */
    async execute({ message }) {
        message.reply('Sup')
    },
    /** @param {import('discord.js').CommandInteraction} interaction */
    async interact(interaction) {
        interaction.reply({ content: 'Sup', ephemeral: true })
    },
}