const Commando = require('discord.js-commando')
const Fuse = require('fuse.js')


const getFaqData = require('./getFaq')

const fuseOptions = {
  isCaseSensitive: false,
  findAllMatches: true,
  includeMatches: false,
  includeScore: true,
  useExtendedSearch: false,
  minMatchCharLength: 1,
  shouldSort: true,
  threshold: 0.3, //matches should be more precise than the default 0.6
  ignoreFieldNorm: true, //by default the shorter the field the higher the relevance
  //ignoreLocation: true,
  location: 0,
  distance: 500,
  keys: [
    'question'
  ]
}

async function getQuestion(searchStr) {

  const data = await getFaqData();
  console.log('got data from cached FAQ');
  const fuseInstance = new Fuse(data, fuseOptions)

  let results = fuseInstance.search(searchStr)
  console.log(results.length)
  let out = ''
  let original_length = results.length
  let too_long_flag = (results.length > 3)
  if (results.length === 0) return `No results found for *${searchStr.replace(/@/g, '\\@')}*.`
  else if (too_long_flag) {
    results = results.slice(0,3)
  }
  
  //TODO - adjust this so the first three questions + answers are displayed,
  //then the remaining [however many] questions -- but only the question titles -- are displayed.
  
  results.forEach(result => {
    console.log(result.item.question)
    out += `**${result.item.question}**\n${result.item.answer}`
    if (result.item.sources && result.item.sources.length > 0) {
      out += `\n*Source${result.item.sources.length === 1 ? '' : 's'}*:\n`
      result.item.sources.forEach(source => out += source + "\n")
    }
    out += '\n'
  })
  
  if (too_long_flag) out += `**${original_length} entries found, only returning the first 3.**`
  
  return out
}





module.exports =
  class FaqCommand extends Commando.Command {
    constructor(client) {
      super(client, {
        name: 'faq',
        group: 'lancer',
        memberName: 'faq',
        description: 'Look up a FAQ item.',
        argsType: 'single',
        guildOnly: false
      })
    }
    async run(msg, arg) {
      console.log(arg);
      const out = await getQuestion(arg);
      await msg.reply(out, { split: true })
    }
  }