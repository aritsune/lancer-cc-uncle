const data = require('./data');
const emoji = require('./emoji.json')
const turndownService = new require('turndown')()

//Just takes data_type and outputs a pretty-print version.
// function itemTypeFormat(object) {
//   return object.data_type ? object.data_type : ''
// }

//HELPERS

//Identifies the source of an item (e.g. SSC Metalmark 3, Talent - Ace)
function licenseFormat(object) {
  if (object.source && object.license_level === 0) return `${object.source}`
  //else if (object.frame_integrated) return `${object.frame_integrated} Core Integrated`
  else if (object.source) return `${object.source} ${object.license} ${object.license_level}`
  else if (object.talent_id) {
    const talentData = data.talent_data.find(t => t.id === object.talent_id)
    return `${talentData.name} Talent`
  }
  else return ''
}

function populateTag(tag) {
  //This is for weapons and systems that have tags.
  let tagData = data.tag_data.find(t => t.id === tag.id)
  return tagData.name.replace(/\{VAL\}/, tag.val) //For things like HEAT {VAL} Self
  //return `${tagData["name"] + (tag.val? tag.val : '')}`
}

function pilotMechActionType(action) {
  //Determines if an action is mech-only, pilot-only, or available to both.
  if (action.pilot && action.mech) { return 'Pilot and Mech' }
  else if (action.pilot && action.activation === 'Downtime') { return 'Pilot' }
  else if (action.pilot && !action.mech) { return 'Pilot-Only' }
  else if (!action.pilot) { return 'Mech-Only' }
  else { return '' }
}

//todo - a nice activation subformatter

function actionFormat(action) {
  //Maps built-in activations to pretty-printed output.
  //Activation types that don't need to be renamed (e.g. protocol) are ignored
  // console.debug("action formatter", action.activation)
  
  const actionTypesPrettyPrint = {
    'Free': 'Free Action',
    'Quick': 'Quick Action',
    'Full': 'Full Action',
    'Invade': 'Quick Tech (Invade)',
    'Downtime': 'Downtime Action'
  }
  
  const activ = (actionTypesPrettyPrint[action.activation] ? actionTypesPrettyPrint[action.activation] : action.activation)
  const activType = `${pilotMechActionType(action)} ${activ}`
  
  let out = `**${action.name ? action.name : 'Unnamed Action'}** (${activType})\n`
  if (action.trigger) out += `*Trigger:* ${action.trigger}\n`
  out += `${action.trigger? "*Effect:* " : ''}${turndownService.turndown(action.detail)}`
  return out;
}

function deployableFormatter(dep) {
  //Formats a single deployable object.
  let out = `**${dep.name}** (${dep.type})`
  
  //Deploy, redeploy, etc
  out += `\nDeployment: ${dep.activation? dep.activation : "Quick"} Action`
  out += `${dep.recall? ", Recall: " + dep.recall + " Action": ''}${dep.redeploy? ", Redeploy: " + dep.recall +" Action": ''}`
  out += "\n"
  
  //Stats
  if (dep.type.includes('Drone')) { //includes type: "OROCHI Drone"
    //Default stats for drones.
    out += `Size: ${dep.size? dep.size : 1/2} HP: ${dep.hp? dep.hp : 5} Evasion: ${dep.evasion? dep.evasion : 10}`
  }
  else { //Portable bunker still has HP stats
    //Default stats for other deployables, which would just be blank.
    out += `${dep.size? 'Size: '+ dep.size : ''} ${dep.hp? 'HP: ' + dep.hp : ''} ${dep.evasion? 'Evasion: ' + dep.evasion : ''}`
  }
  out += ` ${dep.edef ? "E-Defense: " + dep.edef : ''} ${dep.armor? "Armor: " + dep.armor : ''} ${dep.heatcap? "Heat Cap: " + dep.heatcap : ''}`
  out += ` ${dep.speed ? "Speed: " + dep.speed : ''} ${dep.save? "Save Target: " + dep.save : ''}`
  
  //Details
  out += `\n${dep.detail}\n\n`
  
  //Actions
  if (dep.actions) {
    out += `This deployable grants the following actions:\n`
    dep.actions.forEach(act => out += `${actionFormat(act)}\n`)
  }
  return out;
}

function traitFormatter(trait) {
  //Formats a single trait.
  let out = '**' + trait.name + '**' + ': ' + trait.description;
  if (trait.actions) {
    out += "\nThis trait grants the following actions:\n"
    out += trait.actions.forEach(act => actionFormat(act))
  }
  out += '\n'
  return out;
}

//MAIN FORMATTERS
//Formatters by data_type, organized alphabetically.
//actionFormatter is handled above

function cbFormat(cb) {
  //For core bonuses.
  return `**${cb.name}** (${cb.source} ${cb.data_type})
${turndownService.turndown(cb.effect)}`
}

function coreFormat(core) {
  //For core systems.
  const coreName = core.name || core.passive_name || core.active_name
  let out = `**${coreName}** (${core.source} CORE System)\n`
  
  //Passive info
  if (core.passive_name) {
    out += `**Passive: ${core.passive_name}**\n`
  }
  if (core.passive_effect) {
    out += `${turndownService.turndown(core.passive_effect)}\n`
  }
  if (core.passive_actions) {
    core.passive_actions.forEach(pa => out += `${actionFormat(pa)} \n`)
  }

  //Integrated systems, weapons, or other stuff
  // if (core.integrated) {
  //   core.integrated.forEach(iw => out += `${weaponFormat(iw)}\n`);
  // }
  if (core.deployables) {
    core.deployables.forEach(dep => out += deployableFormatter(dep))
  }
  if (core.tags) {
    core.tags.forEach(t => out+= populateTag(t))
  }
  
  //Active info
  if (core.active_name) {
    out += `**Active: ${core.active_name}** `
    out += `(Activation: ${core.activation === 'Protocol' ? 'Protocol' : core.activation + ' Action'}) \n`
    out += `${turndownService.turndown(core.active_effect)}`
  }
  if (core.active_actions) {
    core.active_actions.forEach(aa => out += `\n${actionFormat(aa)}`)
  }
  
  return out
}

function frameFormat(frame) {
  const { stats, core_system } = frame
  const coreName = core_system.name || core_system.passive_name || core_system.active_name
  let out = `**${frame.source} ${frame.name}** - ${frame.mechtype.join('/')} Frame
SIZE ${stats.size}, ARMOR ${stats.armor}, SAVE ${stats.save}, SENSOR ${stats.sensor_range}
HP ${stats.hp}, REPAIR CAP ${stats.repcap}        E-DEF ${stats.edef}, TECH ATTACK ${stats.tech_attack > 0 ? '+' : ''}${stats.tech_attack}, SP ${stats.sp}
EVASION ${stats.evasion}, SPEED ${stats.speed}        HEATCAP ${stats.heatcap}
Mounts: ${frame.mounts.join(', ')}`
  out += `\n${frame.traits.map(trait => traitFormatter(trait)).join('\n')}`
  out += `CORE System: **${coreName}**`
  return out
}

function glossaryFormat(glossaryEntry) {
  //For useful rules and entries in the glossary.
  return `**${glossaryEntry.name}:** ${glossaryEntry.description}`
}

function modFormat(mod) {
  let out = `**${mod.name}**\n (${licenseFormat(mod)} Mod)`
  //Tags, if any
  if(mod.tags) {
    out += mod.tags.forEach(tag => tagFormat(tag))
  }
  //Type/size restrictions, if any
  let combined_types = []
  let combined_sizes = []
  if(mod.allowed_types) {
    combined_types = mod.allowed_types
    if (mod.restricted_types) {
      combined_types = combined_types.filter(t => !mod.restricted_types.includes(t))
    }
  }
  if(mod.allowed_sizes) {
    combined_sizes = mod.allowed_sizes
    if (mod.restricted_sizes) {
      combined_sizes = combined_sizes.filter(s => !mod.restricted_sizes.includes(s))
    }
  }
  out += `${combined_types? 'Can be applied to these weapon types: ' + combined_types.join(', ').trim() + "\n" : ''}`
  out += `${combined_sizes? 'Can be applied to these weapon sizes: ' + combined_sizes.join(', ').trim() + "\n" : ''}`
  
  out += `${mod.effect}`
  //Actions, if any
  if(mod.actions) {
    out += mod.actions.forEach(act => actionFormat(act))
  }
  
  return out
}

function pilotArmorFormat(parmor) {
  let out = `**${parmor.name}** (Pilot Armor)\n`
  if (parmor.bonuses["pilot_hp"]) out += `Pilot HP: +${parmor.bonuses["pilot_hp"]}\n`
  if (parmor.bonuses["pilot_armor"]) out += `Pilot Armor: ${parmor.bonuses["pilot_armor"]}\n`
  if (parmor.bonuses["pilot_evasion"]) out += `Pilot Evasion: ${parmor.bonuses["pilot_evasion"]}\n`
  if (parmor.bonuses["pilot_edef"]) out += `Pilot E-Def: ${parmor.bonuses["pilot_edef"]}\n`
  if (parmor.bonuses["pilot_speed"]) out += `Pilot Speed: ${parmor.bonuses["pilot_speed"]}\n`
  out += `\n${parmor.description}`
  return out;
}

function pilotGearFormat(pgear) {
  let out = `**${pgear.name}** (Pilot Gear) \n`
  if(pgear.tags) {
    out += pgear.tags.map(tag => populateTag(tag)).join(', ').trim() + "\n"
  }
  out += pgear.description
  if(pgear.actions) {
    out += '\n\nGain the following actions: \n'
    out += pgear.actions.map(action => `${action.name} (${action.activation})`).join(', ').trim()
  }
  return out;
}

//pilotWeapons are just handled by weaponFormat

function skillFormat(skill) {
  return `**${skill.name}** (Pilot Skill) \n ${skill.detail}`
}

function statusFormat(object) {
  return `**${object.name}** (${object.type})
  ${turndownService.turndown(object.effects)}`
}

function systemFormat(system) {
  let out = `**${system.name}** (${[licenseFormat(system), system.data_type].join(' ').trim()})`
  let tagsEtc = []
  if (system.sp) tagsEtc.push(`${system.sp} SP`)
  tagsEtc = tagsEtc.concat(system.tags.map(tag => populateTag(tag)))
  out += `\n${tagsEtc.join(', ')}\n`
  if (system.effect) out += '\n' + turndownService.turndown(system.effect) + "\n"
  if (system.actions) {
    out += `\nGain the following actions: \n${system.actions.map(action => actionFormat(action)).join('\n')}\n`
  }
  if (system.deployables) {
    out += `\nGain the following deployables: \n${system.deployables.map(dep => deployableFormatter(dep)).join('\n')}\n`
  }
  return out
}

function tagFormat(object) {
  return `**${object.name}** (${[licenseFormat(object), object.data_type].join(' ').trim()})
  ${object.description}`.replace(/\{VAL\}/, 'X')
}

function talentFormat(talent) {
  return `**${talent.name}** - Talent\n` +
    talent.ranks.map((rank, i) => `${emoji['rank_' + (i + 1)]} **${rank.name}**: ${turndownService.turndown(rank.description)}`).join('\n')
}

function weaponFormat(weapon) {
  //Mount, Type, Tags
  let out = `**${weapon.name}**`
  if (weapon.id && !weapon.id.endsWith('_integrated')) {
    out += ` (${[licenseFormat(weapon), weapon.data_type].join(' ').trim()})`
  }
  let tagsEtc = [`${weapon.mount || '--'} ${weapon.type || '--'}`]
  if (weapon.sp) tagsEtc.push(`${weapon.sp} SP`)
  if (weapon.tags) tagsEtc = tagsEtc.concat(weapon.tags.map(tag => populateTag(tag)))
  out += `\n${tagsEtc.join(', ')}\n`
  
  //Range and damage
  if (weapon.range && weapon.range.length) out += '[' + weapon.range.map(r => r.override ? r.val : `${emoji[r.type.toLowerCase()]} ${r.val}`).join(', ') + '] '
  if (weapon.damage && weapon.damage.length) out += '[' + weapon.damage.map(dmg => dmg.override ? dmg.val : `${dmg.val}${emoji[dmg.type.toLowerCase()]}`).join(' + ') + ']'
  out += '\n'
  
  //Description(s)
  if (weapon.effect) out+= weapon.effect + "\n"
  if (weapon.on_attack) out+= `On Attack: ${weapon.on_attack}\n`
  if (weapon.on_hit) out+= `On Hit: ${weapon.on_hit}\n`
  if (weapon.on_crit) out+= `On Crit: ${weapon.on_crit}\n`
  
  //Recursively define profiles
  if (weapon.profiles) {
    weapon.profiles.map(profile => {
      if (!profile.mount) profile.mount = weapon.mount
      if (!profile.type) profile.type = weapon.type
    })
    weapon.profiles.forEach(profile => out += `Profile: ${weaponFormat(profile)} \n`)
  }
  
  return out
}

module.exports = function format(object) {
  console.log("Formatting", object, "of type", object.data_type)
  
  //arbitrary integrated handling
  //TODO - get this working
  let integrated_formatted = []
  if (object.integrated) {
    object.integrated.forEach(integrated_item_id => {
        console.log("id",integrated_item_id)
        let integrated_item = data.weapon_data.find(w => w.id === integrated_item_id) ||
          data.system_data.find(s => s.id === integrated_item_id)
        if (integrated_item) console.log("debug", format(integrated_item))
      }
    )}
  
  let out = '';
  
  switch (object.data_type) {
    case 'Action':
      return actionFormat(object);
    case 'Condition':
      return statusFormat(object);
    case 'Core Bonus':
      return cbFormat(object);
    case 'Core System':
      return coreFormat(object);
    case 'Frame':
      return frameFormat(object);
    case 'Glossary Entry':
      return glossaryFormat(object);
    case 'Mod':
      return modFormat(object);
    case 'Pilot Armor':
      return pilotArmorFormat(object);
    case 'Pilot Gear':
      return pilotGearFormat(object);
    case 'Pilot Weapon':
      return weaponFormat(object);
    case 'Pilot Skill':
      return skillFormat(object);
    case 'Status':
      return statusFormat(object);
    case 'System':
      return systemFormat(object);
    case 'Tag':
      return tagFormat(object);
    case 'Talent':
      return talentFormat(object);
    case 'Weapon':
      return weaponFormat(object);
    default:
      return "Unrecognized type " + object.type; //+ "; Object was: " + (object.name || object.id);
  }
  
  // if(integrated_formatted) out.concat(integrated_formatted.join())
  // console.log(out)
  // return out;
  
}