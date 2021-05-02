const Op = require('sequelize').Op
const connection = require('../database')

module.exports = async function(message, argument) {
    if (argument.length === 0) return message.channel.send('Không được để trống tiêu đề')

    const titleNameInput = argument.join(' ')
    const referencedMessage = message.reference

    if (!message.reference) return
    async function findTags(repoTitle) {
        let tagIndex = 0
        const getTagList = await connection.model('tag').findAll({ attributes: ['tagName'] });
        const tagListToArray = getTagList.map(t => `\`${++tagIndex}\` **${t.tagName}**`) || 'Chưa có tag nào cả, thêm tag đi đã.'
        const tagListToString = tagListToArray.join('\n') || 'Chưa có danh sách tag để chọn.'
        const iterator = tagListToArray.keys()
        const tagIndexing = []

        for (const key of iterator) tagIndexing.push(key)
        return (
            message.channel.send(`Đã thêm **${repoTitle}** vào repo. Gắn tag cho bài này:
${tagListToString}`).then(confirmedMessage => {
                inputTag(message, confirmedMessage, tagIndexing, getTagList, repoTitle)
            }).catch(error => console.log(error))
        )
    }
    function inputTag(message, confirmedMessage, tagIndexing, getTagList, repoTitle) {
        function onlyNumbers(element, validationArray) {
            return validationArray.includes(element-1)
        }
        const filter = (collectMessage, collectReaction) => { return collectMessage.content.split(/[^\d]+/).map(Number).every(e => onlyNumbers(e, tagIndexing)) && collectMessage.author.id === message.author.id }
        const collector = message.channel.createMessageCollector(filter, { time: 30000 })   
        // On collecting
        collector.on('collect', collectingMessages => {
            if (collectingMessages.size !== 0) collector.stop()
        })
        // Done collecting
        collector.on('end', async collectedMessages => {
            if (collectedMessages.size === 0) confirmedMessage.edit(`Đã thêm **${repoTitle}** vào repo. Ơ, địt mẹ không gắn tag à. `)
            else {
                const processedInput = [...new Set(collectedMessages.first().content.split(/[^\d]+/).map(Number))].sort((a, b) => a - b)
                const getTagName = []
                try {
                    processedInput.forEach(element => { getTagName.push(getTagList[element-1].tagName) })
                    const tagsToText = getTagName.join(', ')
                    const addTagToPost = await connection.model('database').update({ tags: tagsToText }, { where: { title: repoTitle } })
                    if (addTagToPost > 0) return message.reply(`Đã thêm tag: ${tagsToText}.`)
                    return message.channel.send(`Lỗi`)
                } catch (error) {
                    message.channel.send('Xảy ra lỗi, không thêm được tag cho post rồi bạn ơi.' + error)
                }
            }
        })
    }

    message.channel.messages.fetch(referencedMessage.messageID).then(async post => {
        const postURL = 'https://discord.com/channels/' + referencedMessage.guildID + '/' + referencedMessage.channelID + '/' + referencedMessage.messageID;
        const textInPost = post.content
        const repoTitle = titleNameInput.trim()
        const repoContent = textInPost
        const repoAuthor = post.author.tag
        const repoURL = postURL
        const attachmentArray = []
        post.attachments.forEach(attachment => attachmentArray.push(attachment.url))
        const repoAttachments = attachmentArray.join(', ')
        const created = await connection.model('database').findOrCreate({
            where: {
                [Op.or]: [{title: repoTitle}, {url: repoURL}]
            },
            defaults: {
                title: repoTitle,
                content: repoContent,
                url: repoURL,
                author: repoAuthor,
                attachments: repoAttachments,
                tags: '',
            }
        });
        if (created) findTags(repoTitle)
        else message.reply(`Có cái này mất rồi.`)
    })
}