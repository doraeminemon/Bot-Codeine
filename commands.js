const alo = require('./commands/alo.js')

const repo = require('./commands/repo.js')
const find = require('./commands/find.js')

// Tags
const tag = require('./commands/tag.js')

const commands = { alo, repo, find, tag }

module.exports = function(message) {
    if (message.channel.id === '546007806516658196' || message.channel.id === '832437445169643520') {
        const tokens = message.content.replace(/<@+?!(\d+)\w+>/, '').trim().split(/ +/)
        let command = tokens.shift()
        const argument = tokens

        // If mentioning the bot to call commands
        if (message.mentions.users.has(message.client.user.id)) {
            if (command in commands) commands[command](message, argument)
            if (command === '+') commands['repo'](message, argument)
        }
        // If using @ to trigger commands
        if (command.charAt(0) === '@') {
            command = command.substring(1)
            if (command in commands) commands[command](message, argument)
        }
    }
}