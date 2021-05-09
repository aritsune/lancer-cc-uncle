const data = require('./data');
const Fuse = require('fuse.js')

const {
  action_data,
  core_bonus_data,
  core_system_data,
  frame_data,
  glossary_data,
  mod_data,
  pilot_armor_data,
  pilot_gear_data,
  pilot_weapon_data,
  skill_data,
  status_data,
  system_data,
  tag_data,
  talent_data,
  weapon_data
} = data


// const traits = frames.flatMap(frame => frame.traits.map(trait => ({
//   id: `trait_${trait.name.replace(/ /g, '_').toLowerCase()}`,
//   name: trait.name,
//   effect: trait.description,
//   data_type: 'trait'
// })))

// const weapons_without_integrated = weapon_data.filter(w => !w.id.endsWith('_integrated'))
//
// const core_systems_with_iw = core_system_data.map(coreSys => {
//   if (!coreSys.integrated || !coreSys.integrated.id) return { ...coreSys, integrated: null };
//
//   const integratedWeapon = weapon_data.find(w => w.id === coreSys.integrated.id)
//   return { ...coreSys, integrated: integratedWeapon }
// })

let searchable = [
  // ...core_systems_with_iw,
  // ...actions.map(x => ({ ...x, data_type: 'action' })),
  // ...statuses.map(x => ({ ...x, data_type: 'status' })),
  // ...weapons_without_integrated.map(w => ({ ...w, data_type: 'weapon' })), ...systems, ...mods, ...frames,
  // ...talents.map(t => ({ ...t, ranknames: t.ranks.map(x => x.name), data_type: 'talent' })),
  // ...tags.filter(x => !x.filter_ignore).map(t => ({ ...t, data_type: 'tag' })),
  // ...core_bonuses.map(t => ({ ...t, data_type: 'core_bonus' })),
  action_data,
  core_bonus_data,
  core_system_data,
  //core_systems_with_iw,
  frame_data,
  glossary_data,
  mod_data,
  pilot_armor_data,
  pilot_gear_data,
  pilot_weapon_data,
  skill_data,
  status_data,
  system_data,
  tag_data,
  talent_data,
  weapon_data
  //weapons_without_integrated
].flat()

//console.log(searchable[0])

//integrated attribute handler
// for (let item in searchable) {
//   if (item.integrated) {
//     item.integrated.map(item_id => weapon_data.find(item_id) || system_data.find(item_id))
//   }
// }

// console.log("SEARCHABLE", searchable)

const options = {
  isCaseSensitive: false,
  findAllMatches: false,
  includeMatches: false,
  includeScore: false,
  useExtendedSearch: false,
  minMatchCharLength: 1,
  shouldSort: true,
  threshold: 0.6,
  // location: 0,
  // distance: 100,
  ignoreLocation: true,
  keys: [
    "name",
    //"ranknames",
    "integrated.name",
    "active_name",
    "passive_name",
    "alt_names"
  ]
};

const fuse = new Fuse(searchable, options);

module.exports = {
  search(term, category) {
    //TODO -- search namespacing
    console.log("SEARCH CATEGORY", category, "SEARCH TERM", term)
    
    if (category) {
      //TODO -- do some cleanup on user-specified categories
      //convert casing to uniform casing, convert underscores to spaces, etc
    }
    
    return fuse.search(term)
  }
}