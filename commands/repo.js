const Discord = require('discord.js')
const Link = require('../notion/lib/Link')
const Notion = require('../notion')
const { URL } = require('url')

module.exports = {
    name: 'repo',
    description: 'Categorize and storing the precious link into a tag based db on Notion',
    /**
     * @param {import('@discordjs/builders').SlashCommandBuilder} commandBuilder
     */
    options(commandBuilder) {
        commandBuilder.addStringOption(opt => opt.setName('title').setDescription('Tiêu đề của bài được lưu').setRequired(true))
        commandBuilder.addStringOption(opt => opt.setName('hashtag-1').setDescription('Hashtag').setRequired(true))
        commandBuilder.addStringOption(opt => opt.setName('hashtag-2').setDescription('Hashtag').setRequired(false))
        commandBuilder.addStringOption(opt => opt.setName('hashtag-3').setDescription('Hashtag').setRequired(false))
        commandBuilder.addStringOption(opt => opt.setName('hashtag-4').setDescription('Hashtag').setRequired(false))
    },
    /**
     * @param {import('../lib/context')} context
     */
    async execute({ message, args }) {
        const howToUseMessage = 'Để sử dụng, hãy reply vào tin nhắn bạn muốn lưu trong repo với cú pháp `-repo <Tiêu đề> #<tag> #<tag2> #<tag3> ... `.Với những tag nhiều từ, hãy sử dụng `-` hoặc `_` để phân biệt, ví dụ `#art-history.`'
        if (args.length === 0) return message.channel.send(howToUseMessage)
        if (!message.reference) return message.channel.send(howToUseMessage)

        const referencedMessage = message.reference
        const post = await message.channel.messages.fetch(referencedMessage.messageID)
        const postURL = `https://discord.com/channels/${referencedMessage.guildID}/${referencedMessage.channelID}/${referencedMessage.messageID}`

        const titleNameInput = args.filter(arg => !arg.startsWith('#')).join(' ').trim()
        const tags = await Notion.getTags()
        const inlineTags = args
            .filter(arg => arg.startsWith('#'))
            .map(arg => arg.replace('#', '').replace(/[-_]+/, ' ').toLowerCase())
        const matchedTags = tags.filter(tag => inlineTags.includes(tag.name))

        if (matchedTags.length === 0) {
            return message.channel.send('Không tìm thấy tag nào phù hợp với repo. Hãy gõ `-tags` để xem những tags đã có và tìm tag phù hợp')
        }
        post.tags = matchedTags

        const existedRepo = await Notion.findItemByChatURL(postURL)
        if (!existedRepo) {
            return message.channel.send('Kết quả từ Notion không được trả về')
        }
        if (existedRepo.results.length > 0) {
            return message.channel.send('URL hoặc tin nhắn đã được lưu trong repo')
        }
        if (post.tags.length === 0) {
            return message.channel.send('No tags found, no repo added')
        }
        const link = new Link({
            title: titleNameInput,
            content: post.content,
            contributor: post.author.tag,
            chat_url: postURL,
            attachments: post.attachments.map(a => a.url),
            tags: post.tags,
        })
        const urlsToBeCaptured = post.content.split(' ')
            .map(str => {
                try {
                    new URL(str)
                    return str
                }
                catch {
                    return false
                }
            })
            .filter(url => url)
        if (urlsToBeCaptured.length > 0) {
            link.url = urlsToBeCaptured[0]
        }
        const notionResponse = await Notion.addItem(link)
        const successMessage = new Discord.MessageEmbed()
            .setTitle(titleNameInput)
            .setDescription(post.content)
            .setURL(post.url)
            .setAuthor(post.author, post.authorAvatarURL)
            // .setThumbnail('https://media3.giphy.com/media/3o7abB06u9bNzA8lu8/giphy.gif?cid=ecf05e47302639138287f826ac42639cf299da19d497d171&rid=giphy.gif&ct=g')
            .addField('Thẻ', !post.tags ? 'Chưa gắn tag' : post.tags.map(tag => tag.originalName).join(', '), true)
            .addField('URL', post.url)
            .addField('Preview', notionResponse.url)
            .setImage(post.attachments && post.attachments.length > 0 ? post.attachments : null)
            .setTimestamp()
            .setFooter(`${message.guild.name}`, message.guild.iconURL())
        message.channel.send(successMessage)
        message.delete()
    },
    /**
     * @param {import('discord.js').ContextMenuInteraction} interaction
     */
    async interact(interaction) {
        const targetMessage = await interaction.channel.messages.fetch(interaction.targetId)
        interaction.reply(targetMessage.content)
        console.log('lastMessage', targetMessage)
    },
}