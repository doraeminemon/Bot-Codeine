const Notion = require('../notion')

module.exports = {
    name: 'tags',
    description: 'Get all available tags from Notion',
    /**
   * @param {import('../lib/context')} context
   */
    async execute({ message }) {
        const tags = await Notion.getTags()
        const formattedTags = tags.map(tag => `#${tag.name.replace(' ', '-')}`).join(' ')
        message.channel.send(`Những tag hiện đang có trong repo: \n ${formattedTags}`)
    },
    /** @param {import('discord.js').CommandInteraction} interaction */
    async interact(interaction) {
        const tags = await Notion.getTags()
        const formattedTags = tags.map(tag => `#${tag.name.replace(' ', '-')}`).join(' ')
        interaction.reply(formattedTags)
    },
}