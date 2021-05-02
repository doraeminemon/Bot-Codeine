module.exports = function (message, argument) {
  let textToArray = message.content.split(' ');
  let textMessage = textToArray.shift();

  message.channel.send('Gọi cái loz, đang ngủ')
}