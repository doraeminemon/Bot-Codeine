/**
 * Base class for context to be used on command
 */
class DiscordContext {
    constructor(client, message, args) {
        /**
         * the current client that is being used
         * @type {import('./client')}
         */
        this.client = client
        /**
         * the current message
         * @type {import('discord.js').Message}
         */
        this.message = message
        /**
         * the arguments that is being typed, separated by whitespace
         * @type {string[]}
         */
        this.args = args
    }
}

module.exports = DiscordContext