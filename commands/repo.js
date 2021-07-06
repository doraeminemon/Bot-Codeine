const Discord = require('discord.js')

let storedContent

const storeToDB = async ({ title, content, url, author, authorAvatarURL, attachments }) => {
    const result = {
        title,
        content,
        url,
        author,
        authorAvatarURL,
        attachments,
        tags: [],
    }
    storedContent = result
    console.log(result)
    return [null, result]
}

const getTagsFromDB = async () => {
    return ['branding', 'interaction design', 'user experience', 'print', 'illustration', 'art', 'typography']
}

const updateTag = async (tags) => {
    storedContent.tags = tags
    return storedContent
}

const getExistedRepo = async () => {
    console.log('getExistedRepo')
    return storedContent
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
        const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣']
        const tags = await getTagsFromDB()
        const options = emojis.slice(0, tags.length)
        const optionDisplayed = options.reduce((acc, current, index) => {
            return acc + `\n${current}: ${tags[index]}`
        }, '')

        // Tag Reaction Collector
        // Call getTag function
        try {
            const collectMessage = await message.channel.send('Đã thêm thành công. React để gắn thẻ!\n' +
                `'> _${titleNameInput || 'Không lấy được tiêu đề'}_ \n` +
                `${optionDisplayed}`,
            )
            await Promise.all(options.map(key => collectMessage.react(key)))
            await Promise.all(['🆗', '❌'].map(key => collectMessage.react(key)))

            // Message Reaction Collector
            const collector = collectMessage.createReactionCollector((reaction, user) => user.id === message.author.id, { time: 600 * 1000 })

            collector.on('collect', async (collected) => {
                if (collected.emoji.name === '🆗' || collected.emoji.name === '❌') {
                    collector.stop()
                }
            })

            collector.on('end', async (collected) => {
                collectMessage.delete()
                const tagCollected = collected.map(item => item._emoji.name)

                let result = storedContent
                if (tagCollected.includes('🆗')) {
                    const index = tagCollected.indexOf('🆗')
                    if (index > -1) {
                        tagCollected.splice(index, 1)
                    }
                    await updateTag(tagCollected)
                }
                else if (tagCollected.includes('❌')) {
                    result = await getExistedRepo(titleNameInput)
                }
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
            })
        }
        catch (error) {
            console.log('error', error)
        }
    },
}