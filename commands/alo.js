module.exports = function (msg) {
  let textToArray = msg.content.split(" ");
  let textMessage = textToArray.shift();

  msg.channel.send("gọi cái loz, đang ngủ")
}