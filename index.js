const Commando = require('discord.js-commando')
const { search, getDetails } = require('./search')
const format = require('./format')
require('dotenv').config()

/*
/data/index.js is the importer, exporting the data object
then /format.js looks like it reformats the data into pretty strings, and exports it as frame, weapon, etc
then /search.js takes the output of /format.js and exports a search function
finally, /index.js receives user's search commands, parses out the keyword, and uses the search function
 */

const client = new Commando.Client({
  owner: process.env.OWNER,
  commandPrefix: '::',
  intents: ['GUILDS', 'GUILD_MESSAGES']
})

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}! (${client.user.id})`)
  client.user.setActivity('LANCER | use [[brackets]]')
})

class SearchCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'search-compendium',
      group: 'lancer',
      memberName: 'search',
      aliases: ['search', 'compendium'],
      description: 'Searches the LANCER compendium, including supplements.',
      patterns: [/\[\[(.+?)\]\]/],
      defaultHandling: false,
      throttling: false
    })
  }
  async run(msg) {
    console.log(msg.content)
    let targets = [];
    //Entry point for searches.
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

const FaqCommand = require('./faq')


client.registry
  .registerDefaults()
  .registerGroup('lancer', 'LANCER commands')
  .registerCommand(FaqCommand)
  .registerCommand(SearchCommand)
  .registerCommand(InviteCommand)

client.login(process.env.TOKEN)