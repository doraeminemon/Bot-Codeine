const alo = require("./commands/alo.js")

const repo = require("./commands/repo.js")
const find = require("./commands/find.js")

//Tags
const tags = require("./commands/tags.js")
const createtag = require("./commands/createtag.js")
// const deletetag = require("./commands/deletetag.js")
// const renametag = require("./commands/renametag.js")

const commands = { alo, repo, find, tags, createtag }

module.exports = function (msg) {
  if (msg.channel.id == "832244041810575371" || "832437445169643520" || "832561266308546592") {
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