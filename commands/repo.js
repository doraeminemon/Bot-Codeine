const Discord = require('discord.js')

const storeToDB = async ({ title, content, url, author, authorAvatarURL, attachments }) => ({
    title,
    content,
    url,
    author,
    authorAvatarURL,
    attachments,
    tags: '',
})

const getTagsFromDB = async () => {
    return []
}

const updateTag = async () => {
    return {}
}

module.exports = {
    name: 'repo',
    description: 'Categorize and storing the precious link into a tag based db on Notion',
    /**
     * @param {import('../lib/context')} context
     */
    async execute({ message, args: argument }) {
        if (argument.length === 0) return message.channel.send('Không được để trống tiêu đề.')
        if (!message.reference) return

        const referencedMessage = message.reference
        const post = await message.channel.messages.fetch(referencedMessage.messageID)
        const postURL = `https://discord.com/channels/${referencedMessage.guildID}/${referencedMessage.channelID}/${referencedMessage.messageID}`

        const titleNameInput = argument.join(' ').trim()

        // Initailize CREATE_REPO
        // check connection
        const [existedRepo, createdRepo] = await storeToDB({
            title: titleNameInput,
            content: post.content,
            author: post.author.tag,
            authorAvatarURL: post.author.displayAvatarURL(),
            url: postURL,
            attachments: post.attachments.map(a => a.url).join(', '),
        })
        if (!createdRepo) {
            return message.channel.send(`Tiêu đề ${existedRepo.title} đã có trong Repo. \`@find ${existedRepo.title}\``)
        }
        // Confirm Created or Existed
        console.log(message.author.id)
        const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣']
        const tags = await getTagsFromDB()
        const tagMap = tags.map(t => t.tagName).entries().reduce((acc, [, v], index) => {
            acc[emojis[index]] = v
            return acc
        }, new Map())
        const tagListing = tagMap.entries().map(item => `\`${item.join(' ')}\``)
        const tagKeys = tagMap.keys()


        // Tag Reaction Collector
        // Call getTag function
        try {
            const collectMessage = await message.channel.send('Đã thêm thành công. React để gắn thẻ!\n' +
                `'> _${titleNameInput || 'Không lấy được tiêu đề'}_ \n` +
                `${tagListing.join(' ')}`,
            )
            await Promise.all(tagKeys.map(key => collectMessage.react(key)))

            // Message Reaction Collector
            const collector = collectMessage.createReactionCollector((reaction, user) => user.id === message.author.id, { time: 600 * 1000 })

            collector.on('collect', async collected => {
                await collectMessage.react('🆗') || await collectMessage.react('❌')
                if (collected.emoji.name === '🆗' || collected.emoji.name === '❌') {
                    collector.stop()
                }
            })

            collector.on('end', collected => {
                collectMessage.delete()
                const tagCollected = collected.map(item => item._emoji.name)

                if (tagCollected.includes('🆗')) {
                    const index = tagCollected.indexOf('🆗')
                    if (index > -1) {
                        tagCollected.splice(index, 1)
                    }
                    const processedInput = tagCollected.map(key => tagMap.get(key)).join(', ')
                    updateTag(processedInput)
                }
                else if (tagCollected.includes('❌')) {
                    const result = {}
                    await getExistedRepo(titleNameInput)
                    const successMessage = new Discord.MessageEmbed()
                        .setTitle(result.title)
                        .setDescription(result.content)
                        .setURL(result.url)
                        .setAuthor(result.author, result.authorAvatarURL)
                        .setThumbnail('https://media3.giphy.com/media/3o7abB06u9bNzA8lu8/giphy.gif?cid=ecf05e47302639138287f826ac42639cf299da19d497d171&rid=giphy.gif&ct=g')
                        .addField('Thẻ', !result.tags ? 'Chưa gắn tag' : result.tags, true)
                        .addField('URL', result.url)
                        .setImage(!result.attachments ? null : result.attachments)
                        .setTimestamp()
                        .setFooter(`${message.guild.name}`, message.guild.iconURL())
                    message.channel.send(successMessage)
                }
            })
        }
        catch (error) {
            console.log('error', error)
        }
    },
}