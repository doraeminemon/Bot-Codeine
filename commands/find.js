const connection = require('../database');

module.exports = async function(message, argument) {
    let findRepoTitle = argument.join(' ')
    const repo = await connection.model('database').findOne({ where: { title: findRepoTitle } })
    if (repo) return message.channel.send(
`Tiêu đề: ${repo.get('title')}
Tác giả: ${repo.get('author')}
Nội dung:
${repo.get('content')}
URL tới post: ${repo.get('url')}
Đính kèm: ${repo.get('attachments') || 'Chưa có đính kèm.'}
Thẻ đã gắn: ${repo.get('tags') || 'Chưa được gắn tag.'}`)
    return message.reply(`Làm đéo có ${findRepoTitle}?`)
}