const Discord = require("discord.js")
const client = new Discord.Client()
const mySecret = process.env['TOKEN']
const keepAlive = require("./server.js")


client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`)
  client.user.setActivity ("cảnh sát bắt cướp", {type: "PLAYING"})
})

const commandHandler = require("./commands")

client.on("message", commandHandler)

keepAlive()
client.login(mySecret)
