const { Client, Collection } = require('discord.js')

class SanChoiDiscordClient extends Client {
    constructor() {
        super({ partials: ['USER', 'REACTION', 'MESSAGE'] })
        /**
         * Starboard channel
         * @type {import('discord.js').TextChannel | null}
         */
        this.starboardChannel = null
        this.commands = new Collection()
    }
}

module.exports = SanChoiDiscordClient