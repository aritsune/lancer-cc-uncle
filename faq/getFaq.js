const fetch = require('node-fetch');

let currentFaqData = []

//copied from https://github.com/aritsune/lancer-faq/blob/master/plugins/jsongen.js, with modifications
function markdownToJson(markdownstr) {
  const regex = /^### (.+?\n+)([^#]+)/gm
  //^### for markdown header, group1 is the question and any number of newlines
  //group2 is the answer, defined by "anything, incl whitespace, that isn't a #"
  
  const count_num_questions_regex = /###/ig
  let true_question_count = markdownstr.match(count_num_questions_regex).length
  
  const output = []
  let match
  
  while (match = regex.exec(markdownstr)) {
    const sources = []
    let answer = match[2]
    
    const wotRegex = /<wot:(\d+\/\d+)>/g
    answer = answer.replace(wotRegex, function (_, msglink) {
      sources.push(`http://discordapp.com/channels/426286410496999425/${msglink}`)
      return ''
    })
    
    output.push({
      question: match[1].trim(),
      answer: answer.trim(),
      sources
    })
  }
  
  console.log("True question count", true_question_count, "Extracted question count", output.length)
  
  return output
}

async function refreshCache() {
  const res = await fetch('https://raw.githubusercontent.com/aritsune/lancer-faq/master/src/index.md')
  const markdown_data = await res.text()
  //console.log(markdown_data)
  
  currentFaqData = markdownToJson(markdown_data)
  //console.log(currentFaqData)
  // currentFaqData = JSON.parse(json_data)
  console.log('[FAQ CACHE]', 'refreshed');
}

refreshCache();

module.exports = async function () {
  console.log('[FAQ CACHE]', 'got request');

  if (currentFaqData === []) {
    console.log('[FAQ CACHE]', 'no cache, refreshing before responding');
    await refreshCache();
  } else {
    console.log('[FAQ CACHE]', 'cache found, responding then refreshing');
    refreshCache();
  }
  return currentFaqData;

}