const data = require('./data');
const emoji = require('./emoji.json')
const TurndownService = require('turndown')
const turndownService = new TurndownService()

function itemTypeFormat(object) {
  switch (object.data_type) {
    case 'weapon':
      return 'Weapon'
    case 'system':
      return 'System'
    case 'mod':
      return 'Mod'
    case 'tag':
      return 'Equipment Tag'
    default:
      return '';
  }
}

function licenseFormat(object) {
  if (object.source === 'GMS') return `${object.source}`
  else if (object.source) return `${object.source} ${object.license} ${object.license_level}`
  else if (object.talent_id) {
    const talentData = data.talents.find(t => t.id === object.talent_id)
    return `${talentData.name} Talent`
  }
  else return ''
}

function populateTag(tag) {
  const tagData = data.tags.find(t => t.id === tag.id)
  return tagData.name.replace(/\{VAL\}/, tag.val)
}

function frameFormat(frame) {
  const { stats } = frame
  return `**${frame.source} ${frame.name}** - ${frame.mechtype.join('/')} Frame
SIZE ${stats.size}, ARMOR ${stats.armor}, SAVE ${stats.save}, SENSOR ${stats.sensor_range}
HP ${stats.hp}, REPAIR CAP ${stats.repcap}        E-DEF ${stats.edef}, TECH ATTACK ${stats.tech_attack > 0 ? '+' : ''}${stats.tech_attack}, SP ${stats.sp}
EVASION ${stats.evasion}, SPEED ${stats.speed}        HEATCAP ${stats.heatcap}
${frame.traits.map(trait => '**' + trait.name + '**' + ': ' + trait.description).join('\n')}
Mounts: ${frame.mounts.join(', ')}`
}

function weaponFormat(weapon) {
  console.log(weapon);
  let out = `**${weapon.name}** (${[licenseFormat(weapon), itemTypeFormat(weapon)].join(' ').trim()})`
  let tagsEtc = [`${weapon.mount} ${weapon.type}`]
  if (weapon.sp) tagsEtc.push(`${weapon.sp} SP`)
  tagsEtc = tagsEtc.concat(weapon.tags.map(tag => populateTag(tag)))
  out += `\n${tagsEtc.join(', ')}\n`
  if (weapon.range.length) out += '[' + weapon.range.map(r => r.override ? r.val : `${emoji[r.type.toLowerCase()]} ${r.val}`).join(', ') + '] '
  if (weapon.damage.length) out += '[' + weapon.damage.map(dmg => dmg.override ? dmg.val : `${dmg.val}${emoji[dmg.type.toLowerCase()]}`).join(' + ') + ']'
  if (weapon.effect) out += '\n' + turndownService.turndown(weapon.effect)
  return out
}

function talentFormat(talent) {
  return `**${talent.name}** - Talent\n` +
    talent.ranks.map((rank, i) => `${emoji['rank_' + (i + 1)]} **${rank.name}**: ${turndownService.turndown(rank.description)}`).join('\n')
}

function systemFormat(system) {
  let out = `**${system.name}** (${[licenseFormat(system), itemTypeFormat(system)].join(' ').trim()})`
  let tagsEtc = []
  if (system.sp) tagsEtc.push(`${system.sp} SP`)
  tagsEtc = tagsEtc.concat(system.tags.map(tag => populateTag(tag)))
  out += `\n${tagsEtc.join(', ')}\n`
  if (system.effect) out += '\n' + turndownService.turndown(system.effect)
  return out
}

function tagFormat(object) {
  return `**${object.name}** (${[licenseFormat(object), itemTypeFormat(object)].join(' ').trim()})
  ${object.description}`.replace(/\{VAL\}/, 'X')
}

module.exports = function (object) {
  switch (object.data_type) {
    case 'frame':
      return frameFormat(object);
    case 'weapon':
      return weaponFormat(object);
    case 'system':
      return systemFormat(object);
    case 'mod':
      return systemFormat(object);
    case 'talent':
      return talentFormat(object);
    case 'tag':
      return tagFormat(object);
  }
}