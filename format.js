const data = require('./data');
const emoji = require('./emoji.json')
const turndownService = require('turndown')()

//Just takes data_type and outputs a pretty-print version.
// function itemTypeFormat(object) {
//   return object.data_type ? object.data_type : ''
// }

// ===== HELPERS =====

//Identifies the source of an item (e.g. SSC Metalmark 3, Talent - Ace)
function licenseFormat(object) {
  if (object.source && object.license_level === 0) return `${object.source}`
  else if (object.source && object.source.toUpperCase() === 'EXOTIC') return "Exotic"
  else if (object.tags && object.tags.find(tag => tag.id === 'tg_exotic')) return "Exotic"
  //else if (object.frame_integrated) return `${object.frame_integrated} Core Integrated`
  else if (object.source) return `${object.source} ${object.license} ${object.license_level}`
  else return ''
}

//TODO (Search Namespacing) - use this in places
function contentPackFormat(object) {
  if (object.content_pack) return `(From *${object.content_pack}*)`
  else return ''
}

function populateTag(tag) {
  //This is for weapons and systems that have tags, though not the tag's entry itself.
  //It reformats the tag's name, not including the tag definition.
  let tagData = data.tag_data.find(t => t.id === tag.id)
  tagData = tagData.name.replace(/\{VAL\}/, tag.val) //For things like HEAT {VAL} Self
  if(tagData === 'PREVENT CASCADE') tagData = 'CANNOT CASCADE' //I just don't like the name "prevent cascade"
  return tagData
  //return `${tagData["name"] + (tag.val? tag.val : '')}`
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt){
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
} //https://stackoverflow.com/a/4878800

function pilotMechActionType(action) {
  //Determines if an action is mech-only, pilot-only, or available to both.
  if (action.pilot && action.mech) { return 'Pilot and Mech ' }
  else if (action.activation && action.activation.toUpperCase() === 'DOWNTIME') { return '' }
  else if (action.pilot && !action.mech) { return 'Pilot-Only ' }
  //else if (!action.pilot) { return 'Mech-Only' }
  else { return '' }
}

function integratedFormat(integrated) {
  let out = ''
  integrated.forEach(integrated_item_id => {
    let integrated_item =
      data.weapon_data.find(w => w.id === integrated_item_id) ||
      data.system_data.find(s => s.id === integrated_item_id)
    if (integrated_item && integrated_item.data_type === 'Weapon') {
      out += weaponFormat(integrated_item)
    }
    else if (integrated_item && integrated_item.data_type === 'System') {
      out += systemFormat(integrated_item)
    }
    else {
      console.log("Couldn't find an integrated item with that id")
    }
  })
  return out;
}

function activationFormat(activation) {
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
  
  return (actionTypesPrettyPrint[activation] || activation)
  
}

// ===== FORMATTERS EMBEDDED IN OTHER FORMATTERS =====
// Systems, weapons, etc, can have Actions and Deployables embedded in them.
// Frames have Traits embedded in them.

function actionFormat(action, customActionName) {
  //Formats an action.
  //customActionName is optional and only used if the action lacks an action.name property
  
  let activCombined = `${pilotMechActionType(action)}${activationFormat(action.activation)}`
  //Activation string, e.g. "Pilot and Mech Quick Action", or "Quick Tech (Invade))"
  if (action.frequency) activCombined += `, *${action.frequency}*`
  
  let out = `**${action.name || customActionName || 'Unnamed Action'}** (${activCombined})\n`
  //Output is Action Name (Activation Type)
  
  if (action.trigger) out += `*Trigger:* ${turndownService.turndown(action.trigger)}\n` //For reactions
  out += `${action.trigger? "*Effect:* " : ''}${turndownService.turndown(action.detail)}\n`
  return out;
}

function deployableFormatter(dep) {
  //Formats a single deployable object.
  let out = `**${dep.name}** (${dep.type})\n`
  
  //Deploy, redeploy, etc
  out += `Deployment: ${activationFormat(dep.activation) || "Quick Action"}`
  out += `${dep.recall? ", Recall: " + activationFormat(dep.recall): ''}${dep.redeploy? ", Redeploy: " + activationFormat(dep.redeploy): ''}`
  out += "\n"
  
  //Stats
  if (dep.type.includes('Drone')) { //includes type: "OROCHI Drone"
    //Default stats for drones.
    out += `Size: ${dep.size || 1/2} HP: ${dep.hp || 5} Evasion: ${dep.evasion || 10}`
  }
  else { //Portable bunker still has HP stats
    //Default stats for other deployables, which would just be blank.
    out += `${dep.size? 'Size: '+ dep.size : ''} ${dep.hp? 'HP: ' + dep.hp : ''} ${dep.evasion? 'Evasion: ' + dep.evasion : ''}`
  }
  out += ` ${dep.edef ? "E-Defense: " + dep.edef : ''} ${dep.armor? "Armor: " + dep.armor : ''} ${dep.heatcap? "Heat Cap: " + dep.heatcap : ''}`
  out += ` ${dep.speed ? "Speed: " + dep.speed : ''} ${dep.save? "Save Target: " + dep.save : ''}\n`
  
  //Details
  out += `${turndownService.turndown(dep.detail)}\n`
  
  //Actions
  if (dep.actions) {
    out += `This deployable grants the following actions:\n`
    dep.actions.forEach(act => out += `${actionFormat(act)}\n`)
  }
  return out;
}

function traitFormatter(trait) {
  //Formats a single Frame Trait.
  let out = `**${trait.name}:** `
  if (trait.actions && trait.actions.length > 0) {
    //out += "\nThis trait grants the following actions:\n"
    trait.actions.forEach(act => out += actionFormat(act) + "\n")
  }
  // if (trait.deployables && trait.deployables.length > 0) {
  //   trait.deployables.forEach(dep => out += deployableFormatter(dep))
  // }
  if (!trait.actions) {
    out += turndownService.turndown(trait.description)
  }
  if (trait.integrated) out += integratedFormat(trait.integrated)
  return out.trim();
}

// ===== MAIN FORMATTERS =====
// Formatters by data_type, organized alphabetically.
// actionFormatter is handled above

function cbFormat(cb) {
  //For core bonuses.
  let out = `**${cb.name}** (${cb.source} Core Bonus)
${turndownService.turndown(cb.effect)}\n`
  if (cb.integrated) out += integratedFormat(cb.integrated)
  return out
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
  if (core.integrated) {
    out += integratedFormat(core.integrated)
  }
  if (core.deployables) {
    core.deployables.forEach(dep => out += deployableFormatter(dep))
  }
  if (core.tags) {
    core.tags.forEach(t => out+= populateTag(t))
  }
  
  //Active info
  if (core.active_name) {
    out += `**Active: ${core.active_name}** `
    out += `(Activation: ${activationFormat(core.activation)}) \n`
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
**Mounts:** ${frame.mounts.join(', ')}`
  out += `\n${frame.traits.map(trait => traitFormatter(trait)).join('\n')}\n`
  out += `CORE System: **${coreName}**`
  return out
}

function glossaryFormat(glossaryEntry) {
  //For useful rules and entries in the glossary.
  return `**${glossaryEntry.name}:** ${turndownService.turndown(glossaryEntry.description)}`
}

function modFormat(mod) {
  let out = `**${mod.name}** (${licenseFormat(mod)} Mod)\n${mod.sp} SP`
  //Tags, if any
  if(mod.tags) {
    out += `, ${mod.tags.map(tag => populateTag(tag)).join(', ').trim()}\n`;
  }
  else {
    out += '\n'
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
  out += `${combined_types.length > 0? 'Can be applied to these weapon types: ' + combined_types.join(', ').trim() + "\n" : ''}`
  out += `${combined_sizes.length > 0? 'Can be applied to these weapon sizes: ' + combined_sizes.join(', ').trim() + "\n" : ''}`
  
  out += `${turndownService.turndown(mod.effect)}`
  //Actions, if any
  // if(mod.actions) {
  //   out += "This mod grants the following actions:\n"
  //   mod.actions.forEach(act => out += actionFormat(act) + "\n")
  // }
  
  return out
}

function pilotArmorFormat(parmor) {
  let out = `**${parmor.name}** (Pilot Armor)\n`
  if (parmor.bonuses) {
    //Iterate thru each bonus and prettyprint it
    for (let bonus_indx in parmor.bonuses) {
      let bonus = parmor.bonuses[bonus_indx]
      let bonus_name = bonus.id.replace("_", " ")
      bonus_name = toTitleCase(bonus_name)
      out += `**${bonus_name}:** ${bonus.val}, `
    }
    out = out.replace(/,\s*$/, "")
    out += '\n'
  }
  out += `${turndownService.turndown(parmor.description)}`
  //Actions not implemented
  return out;
}

function pilotGearFormat(pgear) {
  let out = `**${pgear.name}** (Pilot Gear) \n`
  if(pgear.tags) {
    out += pgear.tags.map(tag => populateTag(tag)).join(', ').trim() + "\n"
  }
  out += turndownService.turndown(pgear.description) + "\n"
  if(pgear.actions) {
    out += 'This pilot gear grants the following actions: \n'
    out += pgear.actions.map(action => `${action.name} (${action.activation})`).join(', ').trim()
  }
  return out;
}

//pilotWeapons are just handled by weaponFormat

function skillFormat(skill) {
  return `**${skill.name}** (Pilot Skill) \n ${turndownService.turndown(skill.detail)}`
}

function statusFormat(object) {
  return `**${object.name}** (${object.type})
  ${turndownService.turndown(object.effects)}`
}

function systemFormat(system) {
  let out = `**${system.name}** (${licenseFormat(system)} ${system.data_type || system.type || ''})\n`
  let tagsEtc = []
  if (system.sp) tagsEtc.push(`${system.sp} SP`)
  if (system.tags) tagsEtc = tagsEtc.concat(system.tags.map(tag => populateTag(tag)))
  out += `${tagsEtc.join(', ')}\n`
  if (system.effect) out += `${turndownService.turndown(system.effect)}\n`
  if (system.actions) {
    out += `Gain the following actions: \n`
    system.actions.forEach(action => {
      out+= (action.name? actionFormat(action) : actionFormat(action, "Use " + system.name)) + "\n"
    })
  }
  if (system.deployables) {
    out += `Gain the following deployables: \n${system.deployables.map(dep => deployableFormatter(dep)).join('\n')}\n`
  }
  return out
}

function tagFormat(object) {
  //Only for when users search for specific tags.
  return `**${object.name}** (${[licenseFormat(object), object.data_type].join(' ').trim()})
  ${turndownService.turndown(object.description)}`
    .replace(/\{VAL\}/, 'X')
}

function talentFormat(talent) {
  let out = `**${talent.name}** - Talent\n`
  talent.ranks.forEach((rank, i) => {
    out += `${emoji['rank_' + (i + 1)]} **${rank.name}**: `
    
    // if(rank.integrated) {
    //   out += `You gain the following: ${integratedFormat(rank.integrated)}`
    // }
    out += turndownService.turndown(rank.description) + "\n"
    if (rank.actions && rank.actions.length > 0) {
      rank.actions.forEach(act => out += actionFormat(act))
      out += "\n"
    }
  })
  return out;
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
  if (weapon.effect) out+= turndownService.turndown(weapon.effect) + "\n"
  if (weapon.on_attack) out+= `On Attack: ${turndownService.turndown(weapon.on_attack)}\n`
  if (weapon.on_hit) out+= `On Hit: ${turndownService.turndown(weapon.on_hit)}\n`
  if (weapon.on_crit) out+= `On Crit: ${turndownService.turndown(weapon.on_crit)}\n`
  
  //Actions (e.g. autopod reaction)
  if (weapon.actions) {
    out += 'This weapon grants the following actions:\n'
    weapon.actions.forEach(act => out += actionFormat(act))
  }
  
  //Deployables (e.g. ghast drone) aaah screw it this should be done universally tbh
  if (weapon.deployables) {
    out += 'This weapon grants the following deployables:\n'
    weapon.deployables.forEach(dep => out += deployableFormatter(dep))
  }
  
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
  let objName = object.id || object.name || 'unidentified object'
  
  console.log("Formatting", objName, "of type", object.data_type)
  // console.log(object)
  
  let integrated_formatted = ['']
  // This is an array to support arbitrary depths of integrated contents 
  // (a mech with an integrated weapon with an integrated mod with an integrated...)
  // Please don't make mechs like that though.
  
  // Also, many items don't make sense as integrated (integrated mods or 
  // integrated statuses are weird). Nonetheless, they're lightly supported.

  function formatWithSource(formatter, object) {
    integrated_formatted = integrated_formatted.concat(
      `${formatter(object).trim()}

*(from ${object.content_pack})*`)
  }
  
  switch (object.data_type) {
    case 'Action':
      formatWithSource(actionFormat, object);
      break;
    case 'Condition':
      formatWithSource(statusFormat, object);
      break;
    case 'CoreBonus':
      formatWithSource(cbFormat, object);
      break;
    case 'CoreSystem':
      formatWithSource(coreFormat, object);
      break;
    case 'Frame':
      formatWithSource(frameFormat, object);
      break;
    case 'GlossaryEntry':
      formatWithSource(glossaryFormat, object);
      break;
    case 'Mod':
      formatWithSource(modFormat, object);
      break;
    case 'PilotArmor':
      formatWithSource(pilotArmorFormat, object);
      break;
    case 'PilotGear':
      formatWithSource(pilotGearFormat, object);
      break;
    case 'PilotWeapon':
      formatWithSource(weaponFormat, object);
      break;
    case 'PilotSkill':
      formatWithSource(skillFormat, object);
      break;
    case 'Status':
      formatWithSource(statusFormat, object);
      break;
    case 'System':
      formatWithSource(systemFormat, object);
      break;
    case 'Tag':
      formatWithSource(tagFormat, object);
      break;
    case 'Talent':
      formatWithSource(talentFormat, object);
      break;
    case 'Weapon':
      formatWithSource(weaponFormat, object);
      break;
    default:
      console.log("Unrecognized type", (object.data_type || object.type),
        "Object was:", (object.name || object.id || "no name or id"))
      break;
  }
  
  integrated_formatted = integrated_formatted.join('\n').trim();
  console.log("Formatted", objName) // "\n", integrated_formatted)
  return integrated_formatted
  
}