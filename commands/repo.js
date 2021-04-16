const Discord = require('discord.js');

module.exports = function (msg) {
  	let textToArray = msg.content.split(" ")
  	let textMessage = textToArray.shift()
  	let referencedMessage = msg.reference
  	if ( !msg.reference )
		return;
	msg.channel.messages.fetch(referencedMessage.messageID).then( message => {
		const messageEmbed = new Discord.MessageEmbed()
			.setColor('#264729')
			.setTitle('Tôi lói thật với các ông là thế này nhớ!')
			.setURL('https://design101.co/')
			.setDescription('**Sân Chơi Giới Trẻ** - điểm đến cho người trẻ về các chủ đề đương đại: văn hoá đại chúng; nghệ thuật; tư duy thiết kế; các lĩnh vực sáng tạo; định hướng sự nghiệp; thiết kế xã hội; các ý tưởng cấp tiến... Cộng đồng của chúng tôi bao gồm các chuyên gia, nghiên cứu sinh, sinh viên, nhà thiết kế trong và ngoài nước ở đa dạng lĩnh vực.')
			.addFields(
				{ name: 'Link', value:  "https://discord.com/channels/" + referencedMessage.guildID + "/" + referencedMessage.channelID + "/" + referencedMessage.messageID},
				{ name: 'Nội dung', value: message.content },
			)
			.setTimestamp()

		msg.channel.send(messageEmbed);
	} );
  // msg.channel.send("**link**\n" + "https://discord.com/channels/" + referencedMessage.guildID + "/" + referencedMessage.channelID + "/" + referencedMessage.messageID);

  // msg.channel.messages.fetch(referencedMessage.messageID)
  // .then(message => msg.channel.send("**content**\n" + message.content))
  // .catch(console.error);
}