const alo = require("./commands/alo.js")
const repo = require("./commands/repo.js")
const find = require("./commands/find.js")

const commands = { alo, repo, find }

module.exports = function (msg) {
  if (msg.channel.id == "832437445169643520" || "832561266308546592") {
    let tokens = msg.content.split (" ");
    let command = tokens.shift();
    let commandArg = tokens.join(" ")
    if (command.charAt(0) === "!") {
      command = command.substring(1);
      if ( command in commands )
        commands[command](msg, tokens);
    }
  }
}