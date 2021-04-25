const data = require('./data');
const emoji = require('./emoji.json')
const turndownService = new require('turndown')()

//Just takes data_type and outputs a pretty-print version.
function itemTypeFormat(object) {
  switch (object.data_type) {
    // case 'weapon':
    //   return 'Weapon'
    // case 'system':
    //   return 'System'
    // case 'mod':
    //   return 'Mod'
    // case 'tag':
    //   return 'Equipment Tag'
    // case 'core_bonus':
    //   return 'Core Bonus'
    default:
      return object.data_type ? object.data_type : 'Null data type'
  }
}

function licenseFormat(object) {
  if (object.source === 'GMS') return `${object.source}`
  else if (object.frame_integrated) return `${object.frame_integrated} Core Integrated`
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

function cbFormat(cb) {
  return `**${cb.name}** (${cb.source} ${itemTypeFormat(cb)})
${turndownService.turndown(cb.effect)}`
}

function frameFormat(frame) {
  const { stats, core_system } = frame
  const coreName = core_system.name || core_system.passive_name || core_system.active_name
  return `**${frame.source} ${frame.name}** - ${frame.mechtype.join('/')} Frame
SIZE ${stats.size}, ARMOR ${stats.armor}, SAVE ${stats.save}, SENSOR ${stats.sensor_range}
HP ${stats.hp}, REPAIR CAP ${stats.repcap}        E-DEF ${stats.edef}, TECH ATTACK ${stats.tech_attack > 0 ? '+' : ''}${stats.tech_attack}, SP ${stats.sp}
EVASION ${stats.evasion}, SPEED ${stats.speed}        HEATCAP ${stats.heatcap}
${frame.traits.map(trait => '**' + trait.name + '**' + ': ' + trait.description).join('\n')}
Mounts: ${frame.mounts.join(', ')}
CORE System: **${coreName}**`
}

function coreFormat(core) {
  const coreName = core.name || core.passive_name || core.active_name
  let out = `**${coreName}** (${core.source} CORE System)\n`
  if (core.integrated) out += `Integrated Weapon: ${weaponFormat(core.integrated)}\n`;
  if (core.passive_name) out += `Passive: **${core.passive_name}**
${turndownService.turndown(core.passive_effect)}\n`
  if (core.active_name) out += `Active: **${core.active_name}**
${turndownService.turndown(core.active_effect)}`
  return out
}

function weaponFormat(weapon) {
  let out = `**${weapon.name}**`
  if (!weapon.id.endsWith('_integrated')) out += ` (${[licenseFormat(weapon), itemTypeFormat(weapon)].join(' ').trim()})`
  let tagsEtc = [`${weapon.mount} ${weapon.type}`]
  if (weapon.sp) tagsEtc.push(`${weapon.sp} SP`)
  if (weapon.tags) tagsEtc = tagsEtc.concat(weapon.tags.map(tag => populateTag(tag)))
  out += `\n${tagsEtc.join(', ')}\n`
  if (weapon.range && weapon.range.length) out += '[' + weapon.range.map(r => r.override ? r.val : `${emoji[r.type.toLowerCase()]} ${r.val}`).join(', ') + '] '
  if (weapon.damage && weapon.damage.length) out += '[' + weapon.damage.map(dmg => dmg.override ? dmg.val : `${dmg.val}${emoji[dmg.type.toLowerCase()]}`).join(' + ') + ']'
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

function actionFormat(object) {
  const actionNames = {
    'free': 'Free Action',
    'quick': 'Quick Action',
    'full': 'Full Action',
    'reaction': 'Reaction',
    'downtime': 'Downtime Action'
  }

  const actionName = (object.pilot ? 'Pilot ' : '') + actionNames[object.action_type]

  return `**${object.name}** (${actionName})
  ${turndownService.turndown(object.detail)}`
}

function statusFormat(object) {
  return `**${object.name}** (${object.type})
  ${turndownService.turndown(object.effects)}`
}

module.exports = function (object) {
  console.log(object)
  
  switch (object.data_type) {
    case 'frame': //Need to adjust to account for alt-frames. Broken, and works ONLY for the Death's Head frame. Weird.
      return frameFormat(object);
    case 'core_system': //Semi-broken; see Neural Shunt (missing the Mark for Death action), and superheated reactor feed/radiance
      return coreFormat(object);
    case 'weapon':
      return weaponFormat(object);
    case 'system': //VERY broken. Test with horos, mule, noah, etc. Also things like Tempest Drone.
      return systemFormat(object);
    case 'mod': //Broken. test with shock wreathe
      return systemFormat(object);
    case 'talent':
      return talentFormat(object);
    case 'core_bonus':
      return cbFormat(object);
    case 'tag':
      // Not exactly broken, but not super useful. e.g. looking up reaction states
      // "This system can be used as a reaction"...when people might want reaction rules.
      // Probably better to merge certain elements with a "rules" section.
      return tagFormat(object);
    case 'action': //VERY broken.
      return actionFormat(object);
    case 'status':
      return statusFormat(object);
  }
}