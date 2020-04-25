const Commando = require('discord.js-commando')
const Fuse = require('fuse.js')


const faqJson = require('./faq.json')

const fuse = new Fuse(faqJson, {
  isCaseSensitive: false,
  findAllMatches: false,
  includeMatches: false,
  includeScore: false,
  useExtendedSearch: false,
  minMatchCharLength: 1,
  shouldSort: true,
  threshold: 0.6,
  location: 0,
  distance: 5000,
  keys: [
    'question', 'answer'
  ]
});

function getQuestion(searchStr) {
  const results = fuse.search(searchStr)
  if (results.length === 0) return `No results found for *${searchStr.replace(/@/g, '\\@')}*.`
  const result = results[0].item
  console.log(result);
  let out = `\n**${result.question}**
${result.answer}`
  if (result.sources.length > 0) {
    const sourcesStr = `\n\n*Source${result.sources.length === 1 ? '' : 's'}*:
${result.sources.join('\n')}`
    out += sourcesStr
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
        description: 'Look up a FAQ item.',
        argsType: 'single'
      })
    }
    async run(msg, arg) {
      console.log(arg);
      await msg.reply(getQuestion(arg))
    }
  }