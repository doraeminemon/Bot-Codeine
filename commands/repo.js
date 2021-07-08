const Discord = require('discord.js')
const Link = require('../notion/lib/Link')
const { addItem, findItem } = require('../notion')
const getURLs = require('get-urls')

const getTagsFromDB = async () => {
    return ['branding', 'interaction design', 'user experience', 'print', 'illustration', 'art', 'typography']
}

module.exports = {
    name: 'repo',
    description: 'Categorize and storing the precious link into a tag based db on Notion',
    /**
     * @param {import('../lib/context')} context
     */
    async execute({ message, args: argument }) {
        if (argument.length === 0) return message.channel.send('Không được để trống tiêu đề.')
        if (!message.reference) return message.channel.send('Cần reply vào 1 tin nhắn để lưu vào repo')

        const referencedMessage = message.reference
        const post = await message.channel.messages.fetch(referencedMessage.messageID)
        const postURL = `https://discord.com/channels/${referencedMessage.guildID}/${referencedMessage.channelID}/${referencedMessage.messageID}`

        const titleNameInput = argument.join(' ').trim()

        // Initailize CREATE_REPO
        // check connection
        const existedRepo = await findItem(postURL)
        if (!existedRepo) {
            return message.channel.send('Notion failed')
        }
        if (existedRepo.results.length > 0) {
            return message.channel.send('URL hoặc tin nhắn đã được lưu trong repo')
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
            const collectMessage = await message.channel.send('React để gắn thẻ!\n' +
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

                if (tagCollected.includes('🆗')) {
                    const index = tagCollected.indexOf('🆗')
                    if (index > -1) {
                        tagCollected.splice(index, 1)
                    }
                    post.tags = tagCollected.map((tag, id) => tags[id])
                }
                const link = new Link({
                    title: titleNameInput,
                    content: post.content,
                    contributor: post.author.tag,
                    chat_url: postURL,
                    attachments: post.attachments.map(a => a.url),
                    tags: post.tags,
                })
                const urlsToBeCaptured = Array.from(getURLs(post.content))
                if (urlsToBeCaptured.length > 0) {
                    link.url = urlsToBeCaptured[0]
                }
                await addItem(link)
                const successMessage = new Discord.MessageEmbed()
                    .setTitle(titleNameInput)
                    .setDescription(post.content)
                    .setURL(post.url)
                    .setAuthor(post.author, post.authorAvatarURL)
                    // .setThumbnail('https://media3.giphy.com/media/3o7abB06u9bNzA8lu8/giphy.gif?cid=ecf05e47302639138287f826ac42639cf299da19d497d171&rid=giphy.gif&ct=g')
                    .addField('Thẻ', !post.tags ? 'Chưa gắn tag' : post.tags.join(' ,'), true)
                    .addField('URL', post.url)
                    .setImage(post.attachments && post.attachments.length > 0 ? post.attachments : null)
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