const fs = require('fs')
const { SlashCommandBuilder } = require('@discordjs/builders')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')

// loading all commands and set to the propperty
const commands = fs.readdirSync('./commands')
    .filter(file => file.endsWith('.js'))
    .map(file => {
        const command = require(`./commands/${file}`)
        const discordCommand = new SlashCommandBuilder()
        discordCommand.setName(command.name).setDescription(command.description)
        if (command.options) {
            command.options(discordCommand)
        }
        return discordCommand.toJSON()
    })

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_BOT_TOKEN)
const clientId = process.env.DISCORD_CLIENT_ID
const guildId = process.env.DISCORD_GUILD_ID

// eslint-disable-next-line no-unexpected-multiline
(async () => {
    try {
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        )

        console.log('Successfully registered application commands.')
    }
    catch (error) {
        console.error(error)
    }
})()
