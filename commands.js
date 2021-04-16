
const alo = require("./commands/alo.js")
const repo = require("./commands/repo.js")

const commands = { alo, repo }

module.exports = function (msg) {
  if (msg.channel.id == "832437445169643520" || "832561266308546592") {
    let tokens = msg.content.split (" ");
    let command = tokens.shift();
    if (command.charAt(0) === "!") {
      command = command.substring(1);
      commands[command](msg, tokens);
    }
  }
}
