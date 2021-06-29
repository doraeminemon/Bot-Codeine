const Discord = require('discord.js')
const Op = require('sequelize').Op
const connection = require('../database')

module.exports = async function(message, argument) {
    if (argument.length === 0) return message.channel.send('Không được để trống tiêu đề.')

    const titleNameInput = argument.join(' ')
    const referencedMessage = message.reference

    if (!message.reference) return

    const post = await message.channel.messages.fetch(referencedMessage.messageID)

    const postURL = `https://discord.com/channels/${referencedMessage.guildID}/${referencedMessage.channelID}/${referencedMessage.messageID}`

    const repoTitle = titleNameInput.trim()
    const repoContent = post.content
    const repoAuthor = post.author.tag
    const repoAuthorAvatarURL = post.author.displayAvatarURL()
    const repoURL = postURL

    const attachmentArray = []
    post.attachments.forEach(attachment => attachmentArray.push(attachment.url))

    const repoAttachments = attachmentArray.join(', ')

    // Initailize CREATE_REPO
    connection.model('database').findOrCreate({
        where: {
            [Op.or]: [{ title: repoTitle }, { url: repoURL }],
        },
        defaults: {
            title: repoTitle,
            content: repoContent,
            url: repoURL,
            author: repoAuthor,
            authorAvatarURL: repoAuthorAvatarURL,
            attachments: repoAttachments,
            tags: '',
        },
    }).then(created => {
        replyMessage(created)
    }).catch(error => {
        message.channel.send(`Đã có lỗi xảy ra. ${error}`)
    })

    // Confirm Created or Existed
    const replyMessage = async (created) => {
        const existedRepo = created[0]
        const createRepo = created[1]

        if (createRepo) {

            console.log(message.author.id)
            const tagHandler = await getTag()
            tagCollector(tagHandler)

        }
        else if (!createRepo) {
            return message.channel.send(`Tiêu đề ${existedRepo.title} đã có trong Repo. \`@find ${existedRepo.title}\``)
        }
    }

    // Tagging –Get Tag List and set key -> value, then UPDATE tags to CREATED_REPO
    const getTag = async () => {
        const emojis = ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🟤', '⚫', '⚪']
        const tag = await connection.model('tag').findAll({ attributes: ['tagName'] })
        const tag_array = tag.map(t => t.tagName) || 'Chưa có tag nào cả.'
        const tag_map = new Map()
        tag_array.forEach((value, index) => {
            tag_map.set(emojis[index], value)
        })
        const iterator = tag_map.entries()
        const tag_listing = []
        for (const item of iterator) {
            tag_listing.push(`\`${item.join(' ')}\``)
        }
        const tagListing = tag_listing
        const tagKeys = tag_map.keys()
        return {
            tagListing,
            tagKeys,
            tag_map,
        }
    }

    // Tag Reaction Collector
    const tagCollector = async (tagHandling) => {
        // Call getTag function

        message.channel.send(`Đã thêm thành công. React để gắn thẻ!
> _${repoTitle || 'Không lấy được tiêu đề'}_
${tagHandling.tagListing.join(' ')}`)

            .then(collectReaction => {
                const filter = (reaction, user) => {
                    return user.id === message.author.id
                }
                const makeButtons = []
                for (const key of tagHandling.tagKeys) {
                    makeButtons.push(collectReaction.react(key))
                }

                // Message Reaction Collector
                Promise.race(makeButtons).then(() => {
                    const collector = collectReaction.createReactionCollector(filter, { time: 600000 })

                    collector.on('collect', collected => {
                        collectReaction.react('🆗').then(() => {
                            collectReaction.react('❌')
                        }).catch(error => console.log(error))
                        if (collected.emoji.name === '🆗' || collected.emoji.name === '❌') {
                            collector.stop()
                        }
                    })

                    collector.on('end', collected => {
                        collectReaction.delete()
                        const tagCollected = collected.map(item => item._emoji.name)

                        if (tagCollected.includes('🆗')) {
                            const index = tagCollected.indexOf('🆗')
                            const processedInput = []
                            if (index > -1) {
                                tagCollected.splice(index, 1)
                            }
                            for (const key of tagCollected) {
                                processedInput.push(tagHandling.tag_map.get(key))
                            }
                            updateTag(processedInput.join(', '))

                        }
                        else if (tagCollected.includes('❌')) {
                            findTitle(repoTitle)
                        }
                    })
                })
            }).catch(error => {console.log(error)})
    }

    const updateTag = async (tagInput) => {
        await connection.model('database').update({ tags: tagInput }, { where: { title: repoTitle } }).then(updated => {
            if (updated) {
                findTitle(repoTitle)
            }
        }).catch(error => {message.reply(`Xảy ra lỗi rồi ${error}`)})
    }

    const findTitle = (query) => {
        connection.model('database').findOne({ where: { title: query } }).then(found => {

            const successMessage = new Discord.MessageEmbed()
            successMessage
                .setTitle(found.title)
                .setDescription(found.content)
                .setURL(found.url)
                .setAuthor(found.author, found.authorAvatarURL)
                .setThumbnail('https://media3.giphy.com/media/3o7abB06u9bNzA8lu8/giphy.gif?cid=ecf05e47302639138287f826ac42639cf299da19d497d171&rid=giphy.gif&ct=g')
                .addField('Thẻ', !found.tags ? 'Chưa gắn tag' : found.tags, true)
                .addField('URL', found.url)
                .setImage(!found.attachments ? null : found.attachments)
                .setTimestamp()
                .setFooter(`${message.guild.name}`, message.guild.iconURL())
            message.channel.send(successMessage)
        })
    }


    // message.channel.messages.fetch(referencedMessage.messageID).then(async post => {
    //     const postURL = `https://discord.com/channels/${referencedMessage.guildID}/${referencedMessage.channelID}/${referencedMessage.messageID}`
    //     const postContent = post.content
    //     const repoTitle = titleNameInput.trim()
    //     const repoContent = postContent
    //     const repoAuthor = post.author.tag
    //     const repoURL = postURL
    //     const attachmentArray = []
    // post.attachments.forEach(attachment => attachmentArray.push(attachment.url))
    //     const repoAttachments = attachmentArray.join(', ')
    //     const created = await connection.model('database').findOrCreate({
    //         where: {
    //             [Op.or]: [{title: repoTitle}, {url: repoURL}]
    //         },
    //         defaults: {
    //             title: repoTitle,
    //             content: repoContent,
    //             url: repoURL,
    //             author: repoAuthor,
    //             attachments: repoAttachments,
    //             tags: '',
    //         }
    //     });
    //     if (created) {
    //         await findTags(repoTitle, post)
    //     }
    //     else message.reply(`Có cái này mất rồi.`)
    // })


    // async function findTags(repoTitle, post) {
    //     let tagIndex = 0
    //     const getTagList = await connection.model('tag').findAll({ attributes: ['tagName'] })
    //     const tagListToArray = getTagList.map(t => `\`${++tagIndex}\` **${t.tagName}**`) || 'Chưa có tag nào cả, thêm tag đi đã.'
    //     const tagListToString = tagListToArray.join('\n') || 'Chưa có danh sách tag để chọn.'
    //     const iterator = tagListToArray.keys()
    //     const tagIndexing = []

    //     try {
    //         const get_created = await connection.model('database').findOne({ where: { title: repoTitle } })

    //             if (get_created) {
    //                 const embeddedMessage = new Discord.MessageEmbed()
    //                     .setColor('#EAC545')
    //                     .setTitle(get_created.get('title'))
    //                     .setDescription(get_created.get('content'))
    //                     .setURL(get_created.get('url'))
    //                     .setAuthor(get_created.get('author'), post.author.displayAvatarURL())
    //                     .addField('Thẻ', !get_created.get('tags') ? 'Đang chờ gắn tag' : get_created.get('tags'))
    //                     .addField('URL', get_created.get('url'))
    //                     .setImage(!get_created.get('attachments') ? null : get_created.get('attachments'))
    //                     .setTimestamp()
    //                     .setFooter(message.guild.name, message.guild.iconURL())
    //                     message.channel.send(embeddedMessage)
    //             }
    //             return message.channel.send('Lỗi: Không lấy được thông tin từ database')
    //     } catch (error) { console.log(error) }

    //     return (
    //         message.channel.send(`Đã thêm **${repoTitle}** vào repo. Gắn tag cho bài này:\ ${tagListToString}`)
    //         .then(confirmedMessage => {
    //             inputTag(message, confirmedMessage, tagIndexing, getTagList, repoTitle)
    //         }).catch(error => console.log(error))
    //     )
    // }

    // function inputTag(message, confirmedMessage, tagIndexing, getTagList, repoTitle) {
    //     function onlyNumbers(element, validationArray) {
    //         return validationArray.includes(element-1)
    //     }
    // const filter = (collectMessage, collectReaction) => { return collectMessage.content.split(/[^\d]+/).map(Number).every(e => onlyNumbers(e, tagIndexing)) && collectMessage.author.id === message.author.id }
    //     const collector = message.channel.createMessageCollector(filter, { time: 30000 })
    //     // On collecting
    //     collector.on('collect', collectingMessages => {
    //         if (collectingMessages.size !== 0) collector.stop()
    //     })
    //     // Done collecting
    //     collector.on('end', async collectedMessages => {
    //         if (collectedMessages.size === 0) confirmedMessage.edit(`Đã thêm **${repoTitle}** vào repo. Ơ, địt mẹ không gắn tag à. `)
    //         else {
    //             const processedInput = [...new Set(collectedMessages.first().content.split(/[^\d]+/).map(Number))].sort((a, b) => a - b)
    //             const getTagName = []
    //             try {
    //                 processedInput.forEach(element => { getTagName.push(getTagList[element-1].tagName) })
    //                 const tagsToText = getTagName.join(', ')
    //                 const addTagToPost = await connection.model('database').update({ tags: tagsToText }, { where: { title: repoTitle } })
    //                 if (addTagToPost > 0) return message.reply(`Đã thêm tag: ${tagsToText}.`)
    //                 return message.channel.send(`Lỗi`)
    //             } catch (error) {
    //                 message.channel.send('Xảy ra lỗi, không thêm được tag cho post rồi bạn ơi.' + error)
    //             }
    //         }
    //     })
    // }

}