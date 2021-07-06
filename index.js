const fs = require('fs')
const DiscordContext = require('./lib/context')
const SanChoiDiscordClient = require('./lib/client')

const client = new SanChoiDiscordClient()
// discord collection is just another extended class of JS Map

// loading all commands and set to the propperty
fs.readdirSync('./commands')
    .filter(file => file.endsWith('.js'))
    .forEach(file => {
        const command = require(`./commands/${file}`)
        client.commands.set(command.name, command)
    })

const config = {
    prefix: '/',
}

client.on('ready', async () => {
    console.log(`${client.user.tag} đã tham chiến.`)
})


client.on('message', async (message) => {
    // command catcher
    if (!message.content.startsWith(config.prefix) || message.author.bot) return

    const args = message.content.slice(config.prefix.length).trim().split(/ +/)
    const command = args.shift().toLowerCase()

    if (!client.commands.has(command)) return

    try {
        const context = new DiscordContext(client, message, args)
        console.log('[DEBUG] context:', context)
        client.commands.get(command).execute(context)
    }
    catch (error) {
        console.error(error)
        message.reply('Error executing command beep boop')
    }
})

client.login(process.env.DISCORD_BOT_TOKEN)