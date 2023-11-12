import fetch from 'node-fetch';

let currentFaqData = []

async function refreshCache() {
  const res = await fetch('https://lancer-faq.netlify.app/faq.json')
  const data = await res.text()
  currentFaqData = JSON.parse(data)
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