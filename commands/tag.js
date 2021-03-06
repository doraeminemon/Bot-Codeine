const Op = require('sequelize').Op
const connection = require('../database')

module.exports = async function(message, argument) {
    if (argument[0] === '+') {
        argument.shift()
        if (argument.length === 0) return message.channel.send('Không được để trống tên tag.')
        const createTag = argument.join(' ')
        try {
            const tag = await connection.model('tag').create({tagName: createTag})
            return message.reply(`Đã thêm *${tag.tagName}*.`)
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') return message.reply('Tên này có rồi bạn tôi ơi.')
            return message.reply(`Đã xảy ra lỗi thêm tag rôi bạn tôi ơi. ${error}`)
        }
    }
    if (argument[0] === '-') {
        argument.shift()
        if (argument.length === 0) return message.channel.send('Nhập tên tag muốn xóa.')
        const removeTag = argument.join(' ')
        try {
            const tag = await connection.model('tag').destroy({ where: { tagName: removeTag } })
            if (!tag) return message.channel.send('Làm loz có cái tag đấy.')
            const getAllTags = await connection.model('tag').findAll({ attributes: ['tagName'] })
            const tagsToString = getAllTags.map(t => t.tagName).join(', ') || 'Hiện chưa có tag nào cả.'
            return message.channel.send(`Xóa tag thành công. Còn ${getAllTags.length} tag: ${tagsToString}`)
        } catch (error) {
            message.channel.send(`Do code ngu rồi bạn. ${error}`)
        }
    }
    if (argument[0] === '*') {
        try {
            const getAllTags = await connection.model('tag').findAll({ attributes: ['tagName'] })
            const tagsToString = getAllTags.map(t => t.tagName).join(', ') || 'Hiện chưa có tag nào cả.'
            return message.reply(`${tagsToString}`)
        } catch (error) {
            return message.reply(`Xảy ra lỗi tìm tag rồi bạn ơi: ${error}`)
        }
    }

    if (argument[0] === '%') {
        argument.shift()
        if (argument.length === 0) return message.channel.send('Không được để trống tên tag.')
        const separatorIndex = argument.indexOf(':')
        const findTagName = argument.slice(0, separatorIndex).join(' ')
        const updateTagName = argument.slice(separatorIndex+1, argument.length).join(' ')
        if (!findTagName) return message.reply('Chưa nhập tên tag muốn đổi')
        if (!updateTagName) return message.reply(`Nhập tên muốn đổi tag ${findTagName} thành!`)
        try {
            const tag = await connection.model('tag').update({ tagName: updateTagName }, { where: { tagName: findTagName } })
            if (tag > 0) return message.reply(`Đã đổi tên tag ~~${findTagName}~~ thành **${updateTagName}**.`)
            return mess

        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') message.reply(`Tag ${updateTagName} có rồi.`)
        } finally {
            try {
                const repo = await connection.model('database').findAll( {attributes: {tags: {[Op.not]: null}}} )
                const titlesOfTaggedItem = repo.map(item => item.title)
                console.log(titlesOfTaggedItem)
                Promise.all(titlesOfTaggedItem).then( () => {
                    console.log(titlesOfTaggedItem)
                    titlesOfTaggedItem.forEach(async itemTitle => {
                        const getTitle = await connection.model('database').findOne({ where: { title: itemTitle } })
                        if (getTitle) {
                            let replaceTagName = getTitle.get('tags').replace(findTagName, updateTagName)
                            try {
                                connection.model('database').update({ tags: replaceTagName }, { where: { title: itemTitle } })
                            } catch (error) {
                                console.log(error)
                            }
                        }
                    })
                    return message.channel.send('OK ông ơi')
                })
            } catch (error) {
                console.log(error)
            }
        }
    }


}