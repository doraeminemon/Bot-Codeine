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
            inputTag(msg, tagIndexing, getTagList, repoTitle)
        )
    }

    function inputTag(msg, tagIndexing, getTagList, repoTitle) {

        function onlyNumbers(element, validationArray) {
            return validationArray.includes(element-1)
        }
        const filter = (collectMessage, collectReaction) => {
            return collectMessage.content.split(/[^\d]+/).map(Number).every(e => onlyNumbers(e, tagIndexing)) && collectMessage.author.id === msg.author.id;
        }
        const collector = msg.channel.createMessageCollector(filter, { time: 60000 });
        collector.on('collect', collectingMessages => {
            console.log(`Collected ${collectingMessages}`)
            if (collectingMessages.size !== 0) {
                collector.stop()
            }
        });
        collector.on('end', async collectedMessages => {
            if (collectedMessages.size === 0) {
                msg.channel.send('Ơ, địt mẹ không gắn tag à')
            } else {
                const processedInput = [...new Set(collectedMessages.first().content.split(/[^\d]+/).map(Number))].sort((a, b) => a - b)

                const getTagName = []
                try {
                    processedInput.forEach(e => {
                        getTagName.push(getTagList[e-1].tagName)
                    })
                    const tagsToText = getTagName.join(', ')

                    msg.channel.send(tagsToText);


                    const addTagToPost = await connection.model('database').update({ tags: tagsToText }, { where: { title: repoTitle } });

                    if (addTagToPost > 0) {
                        return msg.reply(`Đã thêm tag: ${tagsToText}.`);
                    }
                    return msg.channel.send(`Could not find a tag with name ${tagName}.`);
                } catch (error) {
                    msg.channel.send('Xảy ra lỗi, không thêm được tag cho post rồi bạn ơi.')
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
        const repoAuthor = post.author.tag
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
                    tags: '',
                }
            });
            if (created) {
                findTags(repoTitle)
            } else {
                msg.reply(`Có cái này mất rồi.`)
            }
    })
}