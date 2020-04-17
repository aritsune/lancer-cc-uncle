const Commando = require('discord.js-commando')
const { search, getDetails } = require('./search')
const format = require('./format')
require('dotenv').config()

const client = new Commando.Client({
  owner: process.env.OWNER,
  commandPrefix: '::'
})

client.on('ready', () => console.log('UNCLE is ready!'))

class SearchCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'search-compendium',
      group: 'lancer',
      memberName: 'search',
      aliases: ['search', 'compendium'],
      description: 'Searches the LANCER compendium, including supplements.',
      patterns: [/\[\[(.+?)\]\]/g],
      defaultHandling: false,
      throttling: false
    })
  }
  async run(msg) {
    console.log(msg.content)
    let targets = [];
    const re = /\[\[(.+?)\]\]/g
    let matches;
    while ((matches = re.exec(msg.content)) != null) {
      targets.push(matches[1])
    }
    const results = targets.map((tgt, i) => {
      const results = search(tgt)
      if (results.length === 0) return `No results found for *${targets[i].replace(/@/g, '\\@')}*.`
      else return format(results[0].item)
    }).join('\n--\n')

    await msg.reply('\n' + results, { split: true })
  }
}

class InviteCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'invite',
      group: 'lancer',
      memberName: 'invite',
      description: 'Get an invite link for UNCLE',
    })
    client.on('ready', () => this.userID = client.user.id)
  }
  async run(msg) {
    await msg.reply(`Invite me to your server: https://discordapp.com/api/oauth2/authorize?client_id=${this.userID}&permissions=0&scope=bot`)
  }
}


client.registry
  .registerDefaults()
  .registerGroup('lancer', 'LANCER commands')
  .registerCommand(SearchCommand)
  .registerCommand(InviteCommand)

client.login(process.env.TOKEN)

client.on('ready', () => {
  client.user.setPresence({ activity: { name: 'LANCER | use [[brackets]]' }, status: 'online' })
})