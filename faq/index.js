const Commando = require('@iceprod/discord.js-commando')
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
  let trimmed_results = [];
  let additional_results = [];

  //The first few questions + answers are displayed;
  //If there are additional results, the next few questions (no answers) are displayed.
  if (results.length > 1) {
    trimmed_results = results.slice(0,1);
    additional_results = results.slice(1,6);
  }
  else {
    trimmed_results = results
  }
  
  // No results, return early.
  if (results.length === 0) return `No results found for *${searchStr.replace(/@/g, '\\@')}*.`
  
  // First three results have questions and answers displayed.
  trimmed_results.forEach(result => {
    console.log(result.item.question)
    out += `**${result.item.question}**${result.item.answer}`
    if (result.item.sources && result.item.sources.length > 0) {
      out += `\n*Source${result.item.sources.length === 1 ? '' : 's'}*:\n`
      result.item.sources.forEach(source => out += source + "\n")
    }
    out += '\n\n'
  })
  
  // Remaining results have only question titles displayed.
  if (additional_results.length > 0) {
    out += `**${results.length} entries found**, only showing the first one.\n**Similar questions:**\n`
    additional_results.forEach(result => {
      out += `* ${result.item.question}`
    })
  }
  
  return out
}





module.exports =
  class FaqCommand extends Commando.Command {
    constructor(client) {
      super(client, {
        name: 'faq',
        group: 'lancer',
        memberName: 'faq',
        description: 'Look up an entry in the Lancer FAQ/Errata, available here: https://lancer-faq.netlify.app',
        argsType: 'single',
        guildOnly: false,
        interactions: [{ type: "slash" }],
        args: [{
          type: "string",
          prompt: "Look up an entry in the Lancer FAQ/Errata.",
          key: "question"
        }]
      })
    }
    async run(msg, arg) {
      const question = arg.question
      console.log(question);
      const out = await getQuestion(question);
      await msg.reply(out, { split: true })
    }
  }