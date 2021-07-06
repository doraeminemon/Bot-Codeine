const Discord = require('discord.js')
const Link = require('../notion/lib/Link')
const { addItem, findItem } = require('../notion')

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
        if (!message.reference) return

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
        console.log('[DEBUG] existed repo', existedRepo)
        if (existedRepo.results.length > 0) {
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
                    url: postURL,
                    attachments: post.attachments.map(a => a.url),
                })
                await addItem(link)
                const successMessage = new Discord.MessageEmbed()
                    .setTitle(post.title)
                    .setDescription(post.content)
                    .setURL(post.url)
                    .setAuthor(post.author, post.authorAvatarURL)
                    .setThumbnail('https://media3.giphy.com/media/3o7abB06u9bNzA8lu8/giphy.gif?cid=ecf05e47302639138287f826ac42639cf299da19d497d171&rid=giphy.gif&ct=g')
                    .addField('Thẻ', !post.tags ? 'Chưa gắn tag' : post.tags.join(' ,'), true)
                    .addField('URL', post.url)
                    .setImage(!post.attachments ? null : post.attachments)
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