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
        const tagListToString = tagListToArray.join('\n') || 'Đéo thấy cái tag nào luôn ạ.';

        const iterator = tagListToArray.keys()
        const tagIndexing = []

        for (const key of iterator) {
            tagIndexing.push(key)
        } return (
            console.log(tagIndexing),
            msg.channel.send(`Đã thêm **${repoTitle}** vào repo. Gắn tag cho bài này: \n${tagListToString}`),
            inputTag(msg, tagIndexing, getTagList)
        )
    }

    function inputTag(msg, tagIndexing, getTagList) {

        function onlyNumbers(element, validationArray) {
            return validationArray.includes(element-1)
        }
        const filter = m => m.content.split(/[^\d]+/).map(Number).every(e => onlyNumbers(e, tagIndexing))
        const collector = msg.channel.createMessageCollector(filter, { time: 60000 });
        collector.on('collect', m => {
            console.log(`Collected ${m}`)
            if (m.size !== 0) {
                collector.stop()
            }
        });
        collector.on('end', collected => {
            if (collected.size === 0) {
                msg.channel.send('Ơ, địt mẹ không gắn tag à')
            } else {
                const processedInput = [...new Set(collected.first().content.split(/[^\d]+/).map(Number))].sort((a, b) => a - b)

                const getTagName = []
                try {
                    processedInput.forEach(e => {
                        getTagName.push(getTagList[e-1].tagName)
                    })
                    msg.channel.send(getTagName.join(', '));
                    return
                } catch (error) {
                    msg.channel.send('loi roi')
                    console.log(error)
                }
            }
        });
    }

    msg.channel.messages.fetch(referencedMessage.messageID).then(async post => {
        let postURL = 'https://discord.com/channels/' + referencedMessage.guildID + '/' + referencedMessage.channelID + '/' + referencedMessage.messageID;
        let textInPost = post.content
        const repoTitle = titleInput.trim()
        const repoContent = textInPost
        const repoAuthor = msg.author.tag
        const repoURL = postURL
        const attachmentArray = []
        post.attachments.forEach(attachment => attachmentArray.push(attachment.url))
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
                }
            });
            if (created) {
                findTags(repoTitle)
            } else {
                msg.reply(`Có cái này mất rồi.`)
            }
    })
}