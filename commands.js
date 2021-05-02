const alo = require('./commands/alo.js')

const repo = require('./commands/repo.js')
const find = require('./commands/find.js')

//Tags
const tag = require('./commands/tag.js')

const commands = { alo, repo, find, tag }

module.exports = function (message) {
  if (message.channel.id == '832244041810575371' || '832437445169643520' || '832561266308546592') {
    let tokens = message.content.replace(/<@+?!(\d+)\w+>/, '').trim().split(/ +/)
    let command = tokens.shift()
    let argument = tokens

    if (message.mentions.users.has(message.client.user.id)) {// If mentioning the bot to call commands
        if (command in commands) commands[command](message, argument)
        if (command === '+') commands['repo'](message, argument)
    }
    
    if (command.charAt(0) === "@") { // If using @ to trigger commands
        command = command.substring(1);
        if (command in commands) commands[command](message, argument)
    }
  }
}