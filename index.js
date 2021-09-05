const fs = require('fs')
const express = require('express')
const DiscordContext = require('./lib/context')
const SanChoiDiscordClient = require('./lib/client')

const port = process.env.PORT || 3000
const app = express()
const client = new SanChoiDiscordClient()
// discord collection is just another extended class of JS Map

app.get('/', (request, response) => {
    response.send('Hello from Express!')
})

app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`server is listening on ${port}`)
})

// loading all commands and set to the propperty
fs.readdirSync('./commands')
    .filter(file => file.endsWith('.js'))
    .forEach(file => {
        const command = require(`./commands/${file}`)
        client.commands.set(command.name, command)
    })

const config = {
    prefix: '-',
    permissiveRoles: 'Thủ Thư',
}

client.on('ready', async () => {
    console.log(`${client.user.tag} đã tham chiến.`)
})


client.on('message', async (message) => {
    // command catcher
    if (!message.content.startsWith(config.prefix) || message.author.bot) return
    if (!message.member.roles.cache.some(role => role.name === config.permissiveRoles)) return

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

client.on('interactionCreate', async (interaction) => {
    if (interaction.isCommand()) {
        if (!client.commands.has(interaction.commandName)) return
        const command = client.commands.get(interaction.commandName)
        if (!command.interact) return
        command.interact(client, interaction)
    }

    if (interaction.isContextMenu()) {
        const command = client.commands.get(interaction.commandName)
        if (!command.interact) return
        command.interact(client, interaction)
    }
})

client.login(process.env.DISCORD_BOT_TOKEN)