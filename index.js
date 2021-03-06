const Commando = require('discord.js-commando')
const { search, getDetails } = require('./search')
const format = require('./format')
require('dotenv').config()

/*
/data/index.js is the data cleaner/importer. the result of /data/ is a data object.
/data/index.js uses altNames.js to reformat/clean some items.

/search.js imports the data object, and sets up a search function
meanwhile, /format.js sets up a prettyprint function

finally, /index.js receives user's messages, and calls /search.js. if a result is found,
pass the result to the format function.
 */

const client = new Commando.Client({
  owner: process.env.OWNER,
  commandPrefix: '::',
  intents: ['GUILDS', 'GUILD_MESSAGES', 'DIRECT_MESSAGES']
})

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}! (${client.user.id})`)
  client.user.setActivity('LANCER | use [[brackets]]')
})

class DmCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'dm-me',
      group: 'lancer',
      memberName: 'dm-me',
      aliases: ['dm_me', 'enable-dms', 'enable_dms', 'enable-dm', 'enable_dm'],
      description: 'UNCLEBot DMs you one message, enabling you to send commands via DM.',
      guildOnly: false
    })
  }
  async run(msg) {
    await msg.author.send("Added your DM to my cached channels. You can now DM me commands.")
  }
}

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
      throttling: false,
      guildOnly: false
    })
  }
  async run(msg) {
    //console.log(msg.content)
    let targets = [];
    //Identify a searchable term.
    const re = /\[\[(.+?)\]\]/g
    let matches;
    while ((matches = re.exec(msg.content)) != null) {
      targets.push(matches[1])
    }
    const results = targets.map((tgt, i) => {
      //Entry point for searches.
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
      guildOnly: false
    })
    client.on('ready', () => this.userID = client.user.id)
  }
  async run(msg) {
    await msg.reply(`Invite me to your server: https://discordapp.com/api/oauth2/authorize?client_id=${this.userID}&permissions=76800&scope=bot`)
  }
}

const FaqCommand = require('./faq')


client.registry
  .registerDefaults()
  .registerGroup('lancer', 'LANCER commands')
  .registerCommand(FaqCommand)
  .registerCommand(SearchCommand)
  .registerCommand(InviteCommand)
  .registerCommand(DmCommand)

client.login(process.env.TOKEN)