const Commando = require('@iceprod/discord.js-commando')
const { search, getDetails } = require('./search')
const format = require('./format')
const structureDamage = require('./util/structure-damage')
const stressDamage = require('./util/stress-damage')
require('dotenv').config()
const { Util } = require("discord.js")

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
  client.user.setActivity('LANCER | use /commands')
})

class DmCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'dm-me',
      group: 'lancer',
      memberName: 'dm-me',
      aliases: ['dm_me', 'enable-dms', 'enable_dms', 'enable-dm', 'enable_dm'],
      description: 'UNCLEBot DMs you one message, enabling you to send commands via DM.',
      guildOnly: false,
      interactions: [{ type: "slash" }]
    })
  }
  async run(msg) {
      msg.reply("Adding your DM to my cached channels.").then(async () => {
          await msg.author.send("Added your DM to my cached channels. You can now DM me commands.")
      })
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
      defaultHandling: false,
      throttling: false,
      guildOnly: false,
      interactions: [{ type: "slash" }],
      argsType: "single",
      args: [{
        type: "string",
        prompt: "Search the LANCER compendium, including supplements.",
        key: "search"
      }]
    })
  }
  async run(msg, args) {
    const searchTerm = `${args.search}`
    // console.log(searchTerm)
    let targets = [];
    //Identify a searchable term.
    const matches = searchTerm.split(":")
    if (matches.length > 1) {
      targets.push({term: matches[1], category: matches[0]})
    } else {
      targets.push({term: matches[0], category: undefined})
    }
    
    const results = targets.map(tgt => {
      //Entry point for searches.
      const results = search(tgt.term, tgt.category)
      if (results.length === 0) return `No results found for *${(tgt.category || '')}${tgt.term.replace(/@/g, '\\@')}*.`
      else return format(results[0].item)
    }).join('\n--\n')
    
    const splitMessages = Util.splitMessage('\n' + results)
    let currentMessage = msg
    for (let i = 0; i < splitMessages.length; ++i) {
      currentMessage = await currentMessage.reply(splitMessages[i])
    }
  }
}

class InviteCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'invite',
      group: 'lancer',
      memberName: 'invite',
      description: 'Get an invite link for UNCLE',
      guildOnly: false,
      interactions: [{ type: "slash" }]
    })
    client.on('ready', () => this.userID = client.user.id)
  }
  async run(msg) {
    await msg.reply(`Invite me to your server: https://discordapp.com/api/oauth2/authorize?client_id=${this.userID}&permissions=76800&scope=bot`)
  }
}

const FaqCommand = require('./faq')

class StructureCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'structure',
      aliases: ['structure-check', 'structure_check', 'structure-damage', 'structure_damage'],
      group: 'lancer',
      memberName: 'structure',
      description: 'Look up an entry on the structure check table.', // Parameters: Lowest dice rolled, Mech's remaining structure
      guildOnly: false,
      interactions: [{ type: "slash" }],
      args: [
        {
          key: 'lowest_dice_roll',
          prompt: 'Lowest dice rolled in the structure check',
          type: 'integer'
        },
        {
          key: 'structure_remaining',
          prompt: "Mech's remaining structure",
          type: 'integer'
        }
      ]
    })
  }
  
  async run(msg, {lowest_dice_roll, structure_remaining}) {
    await msg.reply(structureDamage(lowest_dice_roll, structure_remaining))
  }
}

class StressCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'stress',
      aliases: ['stress-check', 'stress_check', 'overheating'],
      group: 'lancer',
      memberName: 'stress',
      description: 'Look up an entry on the Stress/Overheating table.', //  Parameters: Lowest dice rolled, Mech's remaining stress
      guildOnly: false,
      interactions: [{ type: "slash" }],
      args: [
        {
          key: 'lowest_dice_roll',
          prompt: 'Lowest dice rolled in the structure check',
          type: 'integer'
        },
        {
          key: 'stress_remaining',
          prompt: "Mech's remaining stress",
          type: 'integer'
        }
      ]
    })
  }
  
  async run(msg, {lowest_dice_roll, stress_remaining}) {
    await msg.reply(stressDamage(lowest_dice_roll, stress_remaining))
  }
}

client.registry
  .registerDefaults()
  .registerGroup('lancer', 'LANCER commands')
  .registerCommands([
      FaqCommand,
      SearchCommand,
      InviteCommand,
      DmCommand,
      StructureCommand,
      StressCommand
  ])

client.login(process.env.TOKEN).then(async () => {
  await client.registry.registerSlashGlobally()
})