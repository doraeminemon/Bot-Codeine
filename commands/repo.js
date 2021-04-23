const Discord = require("discord.js")
const client = new Discord.Client()

const connection = require('../database');

module.exports = async function(msg) {
    let textToArray = msg.content.split(" ")
    let textMessage = textToArray.shift()
    let referencedMessage = msg.reference

    let titleInput = textToArray.join(" ")

    if (!msg.reference)
        return;

    msg.channel.messages.fetch(referencedMessage.messageID).then(async post => {

        let postURL = "https://discord.com/channels/" + referencedMessage.guildID + "/" + referencedMessage.channelID + "/" + referencedMessage.messageID;
        let textInPost = post.content;

        const repoTitle = titleInput;
        const repoContent = textInPost;
        const repoAuthor = msg.author.tag;
        const repoURL = postURL;

        const attachmentArray = [];
        
        post.attachments.forEach(attachment => {
            attachmentArray.push(attachment.url)
        })

        const repoAttachments = attachmentArray.join(', ');

        console.log(repoAttachments);
    
        try {
            const repo = await connection.model('database').create({
                title: repoTitle,
                content: repoContent,
                url: repoURL,
                author: repoAuthor,
                attachments: repoAttachments,
                // tags: repoTags,
            });
            return msg.reply(`Đã thêm *${repo.title}*.`);
        }

        catch (e) {
            if (e.name === 'SequelizeUniqueConstraintError') {
                return msg.reply('Trùng rồi bạn tôi ơi.');
            }
            return msg.reply('Lỗi rồi bạn tôi ơi.');
        }

    })
}