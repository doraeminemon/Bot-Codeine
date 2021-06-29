const Op = require('sequelize').Op
const connection = require('../database')

module.exports = {
    name: 'tag',
    description: 'Tag the related info',
    /**
     * @param {import('../lib/client')} context
     */
    async execute({ message, args }) {
        if (args[0] === '+') {
            args.shift()
            if (args.length === 0) return message.channel.send('Không được để trống tên tag.')
            const createTag = args.join(' ')
            try {
                const tag = await connection.model('tag').create({ tagName: createTag })
                return message.reply(`Đã thêm *${tag.tagName}*.`)
            }
            catch (error) {
                if (error.name === 'SequelizeUniqueConstraintError') return message.reply('Tên này có rồi bạn tôi ơi.')
                return message.reply(`Đã xảy ra lỗi thêm tag rôi bạn tôi ơi. ${error}`)
            }
        }
        if (args[0] === '-') {
            args.shift()
            if (args.length === 0) return message.channel.send('Nhập tên tag muốn xóa.')
            const removeTag = args.join(' ')
            try {
                const tag = await connection.model('tag').destroy({ where: { tagName: removeTag } })
                if (!tag) return message.channel.send('Làm loz có cái tag đấy.')
                const getAllTags = await connection.model('tag').findAll({ attributes: ['tagName'] })
                const tagsToString = getAllTags.map(t => t.tagName).join(', ') || 'Hiện chưa có tag nào cả.'
                return message.channel.send(`Xóa tag thành công. Còn ${getAllTags.length} tag: ${tagsToString}`)
            }
            catch (error) {
                message.channel.send(`Do code ngu rồi bạn. ${error}`)
            }
        }
        if (args[0] === '*') {
            try {
                const getAllTags = await connection.model('tag').findAll({ attributes: ['tagName'] })
                const tagsToString = getAllTags.map(t => t.tagName).join(', ') || 'Hiện chưa có tag nào cả.'
                return message.reply(`${tagsToString}`)
            }
            catch (error) {
                return message.reply(`Xảy ra lỗi tìm tag rồi bạn ơi: ${error}`)
            }
        }

        if (args[0] === '%') {
            args.shift()
            if (args.length === 0) return message.channel.send('Không được để trống tên tag.')
            const separatorIndex = args.indexOf(':')
            const findTagName = args.slice(0, separatorIndex).join(' ')
            const updateTagName = args.slice(separatorIndex + 1, args.length).join(' ')
            if (!findTagName) return message.reply('Chưa nhập tên tag muốn đổi')
            if (!updateTagName) return message.reply(`Nhập tên muốn đổi tag ${findTagName} thành!`)
            try {
                const tag = await connection.model('tag').update({ tagName: updateTagName }, { where: { tagName: findTagName } })
                if (tag > 0) return message.reply(`Đã đổi tên tag ~~${findTagName}~~ thành **${updateTagName}**.`)
                return message

            }
            catch (error) {
                if (error.name === 'SequelizeUniqueConstraintError') message.reply(`Tag ${updateTagName} có rồi.`)
            }
            finally {
                try {
                    const repo = await connection.model('database').findAll({ attributes: { tags: { [Op.not]: null } } })
                    const titlesOfTaggedItem = repo.map(item => item.title)
                    console.log(titlesOfTaggedItem)
                    Promise.all(titlesOfTaggedItem).then(() => {
                        console.log(titlesOfTaggedItem)
                        titlesOfTaggedItem.forEach(async itemTitle => {
                            const getTitle = await connection.model('database').findOne({ where: { title: itemTitle } })
                            if (getTitle) {
                                const replaceTagName = getTitle.get('tags').replace(findTagName, updateTagName)
                                try {
                                    connection.model('database').update({ tags: replaceTagName }, { where: { title: itemTitle } })
                                }
                                catch (error) {
                                    console.log(error)
                                }
                            }
                        })
                        return message.channel.send('OK ông ơi')
                    })
                }
                catch (error) {
                    console.log(error)
                }
            }
        }
    },
}