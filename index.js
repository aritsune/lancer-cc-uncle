const Commando = require('discord.js-commando')
const { search, getDetails } = require('./search')
const format = require('./format')
require('dotenv').config()

const client = new Commando.Client({
  owner: process.env.OWNER,
  commandPrefix: ']'
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
  async run(msg, args, fromPattern) {
    console.log(msg.content)
    let targets = [];
    const re = /\[\[(.+?)\]\]/g
    let matches;
    while ((matches = re.exec(msg.content)) != null) {
      targets.push(matches[1])
    }
    const results = targets.map((tgt, i) => {
      const tgtResults = search(tgt)
      if (tgtResults.length === 0) return `No results found for *${targets[i].replace(/@/g, '\\@')}*.`
      else return format(getDetails(tgtResults[0].ref))
    }).join('\n--\n')

    await msg.reply('\n' + results, { split: true })
  }
}

client.registry
  .registerDefaults()
  .registerGroup('lancer', 'LANCER commands')
  .registerCommand(SearchCommand)

client.login(process.env.TOKEN)

client.on('ready', () => {
  client.user.setPresence({ activity: { name: 'LANCER | use [[brackets]]' }, status: 'online' })
})