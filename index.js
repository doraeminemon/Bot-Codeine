const Discord = require('discord.js')
const client = new Discord.Client()
const guildId = '708367190780543048'
const mySecret = process.env['TOKEN']

const connection = require('./database')

connection.sync({
    alter: true,
    // logging: console.log
}).then(() => {
    // connection.model('database').build( {
    //     title: 'Test Title',
    //     content: 'Test Content',
    //     author: 'Test Author',
    //     url: 'http://test.com/',
    //     attachments: 'Test Attachments',
    //     tags: 'Không có',
    // }).save()
    // connection.model('database').findOne({
    //     where: { title: 'Test Title' }
    // })
}).catch(error => console.log(error))

const getApp = (currentGuildId) => {
    const app = client.api.applications(client.user.id)
    if (currentGuildId) {
        app.guilds(currentGuildId)
    }
    return app
}

const createAPIMessage = async (interaction, content) => {
    const { data, files } = await Discord.APIMessage.create(
        client.channels.resolve(interaction.channel_id),
        content,
    )
        .resolveData()
        .resolveFiles()

    return { ...data, files }
}

const reply = async (interaction, response) => {
    let data = {
        content: response,
    }
    // Check for embed
    if (typeof response === 'object') {
        data = await createAPIMessage(interaction, response)
    }
    client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
            type: 4,
            data,
        },
    })
}

client.on('ready', async () => {
    console.log(`${client.user.tag} đã tham chiến.`)

    const commands = await getApp(guildId).commands.get()

    console.log(commands)

    // await getApp(guildId).commands('839157363801980978').delete()

    await getApp(guildId).commands.post({
        data: {
            name: 'repo',
            description: 'Các lệnh của repo.',
            options: [
                {
                    name: 'Title',
                    description: 'Nhập tiêu đề.',
                    required: true,
                    type: 3,
                },
                {
                    name: 'Option',
                    description: 'Chọn hành động',
                    type: 3,
                    choices: [
                        {
                            name: 'Tìm',
                            value: 'Xem chi tiết tin đã lưu.',
                        },
                        {
                            name: 'Gắn lại thẻ',
                            value: 'Sửa tag đã lưu trong bài',
                        },
                        {
                            name: 'Xóa',
                            value: 'Xóa tin này trong repo',
                        },
                    ],
                },
            ],
        },
    })

    client.ws.on('INTERACTION_CREATE', async (interaction) => {
        const { name, options } = interaction.data

        const command = name.toLowerCase()

        let args = {}
        if (options && Object.entries(options).length > 0) {
            args = options.reduce((finalObject, { currentName, value }) => {
                return { ...finalObject, [currentName]: value }
            }, {})
        }

        if (command === 'repo') {
            reply(interaction, 'pong')
            return
        }
        else if (command === 'embed') {
            const embed = new Discord.MessageEmbed()
                .setTitle('Vi du')

            for (const argument in args) {
                const value = args[argument]
                embed.addField(argument, value)
            }
            reply(interaction, embed)
            return
        }
    })

    client.user.setActivity('Netflix', { type: 'WATCHING' })
})

const commandHandler = require('./commands')
client.on('message', commandHandler)

// keepAlive()
client.login(mySecret)