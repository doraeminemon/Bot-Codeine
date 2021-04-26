const Op = require('sequelize').Op
const connection = require('../database')

module.exports = async function(msg) {
    let textToArray = msg.content.split(' ')
    let textMessage = textToArray.shift()
    let titleInput = textToArray.join(' ')
    let referencedMessage = msg.reference

    if (!msg.reference)
        return;

    async function findTags(repoTitle) {
        let tagIndex = 0
        const getTagList = await connection.model('tag').findAll({ attributes: ['tagName'] });
        const tagListToArray = getTagList.map(t => `\`${++tagIndex}\` **${t.tagName}**`) || 'Đéo thấy cái tag nào luôn ạ.';
        const tagListToString = tagListToArray.join(' | ') || 'Đéo thấy cái tag nào luôn ạ.';

        const iterator = tagListToArray.keys()
        const tagIndexing = []

        for (const key of iterator) {
            tagIndexing.push(key)
        } return (
            msg.reply(`\n👍 Đã thêm \`title\`:\n\> **${repoTitle}**\n\n👉 Nhập một hoặc nhiều số ứng với thẻ muốn gắn:\n${tagListToString}`)
        )
            

    }

    msg.channel.messages.fetch(referencedMessage.messageID).then(async post => {

        let postURL = 'https://discord.com/channels/' + referencedMessage.guildID + '/' + referencedMessage.channelID + '/' + referencedMessage.messageID;
        let textInPost = post.content

        const repoTitle = titleInput.trim()
        const repoContent = textInPost
        const repoAuthor = msg.author.tag
        const repoURL = postURL
        const attachmentArray = []
        post.attachments.forEach(attachment => {
            attachmentArray.push(attachment.url)
        })
        const repoAttachments = attachmentArray.join(', ');

            const [repo, created] = await connection.model('database').findOrCreate({
                where: {
                    [Op.or]: [{title: repoTitle}, {url: repoURL}]
                },
                defaults: {
                    title: repoTitle,
                    content: repoContent,
                    url: repoURL,
                    author: repoAuthor,
                    attachments: repoAttachments,
                    // tags: repoTags
                }
            });

            if (created) {
                findTags(repoTitle)
                
            } else {
                msg.reply(`Có cái này mất rồi.`)
            }


    })
}