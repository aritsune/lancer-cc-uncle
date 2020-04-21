const data = require('./data');
const Fuse = require('fuse.js')

const { weapons, systems, mods, frames, tags, talents, core_bonuses, core_systems, actions, statuses } = data


// const traits = frames.flatMap(frame => frame.traits.map(trait => ({
//   id: `trait_${trait.name.replace(/ /g, '_').toLowerCase()}`,
//   name: trait.name,
//   effect: trait.description,
//   data_type: 'trait'
// })))

const weapons_without_integrated = weapons.filter(w => !w.id.endsWith('_integrated'))

const core_systems_with_iw = core_systems.map(coreSys => {
  if (!coreSys.integrated || !coreSys.integrated.id) return { ...coreSys, integrated: null };

  const integratedWeapon = weapons.find(w => w.id === coreSys.integrated.id)
  return { ...coreSys, integrated: integratedWeapon }
})


const searchable = [
  ...core_systems_with_iw,
  ...actions.map(x => ({ ...x, data_type: 'action' })),
  ...statuses.map(x => ({ ...x, data_type: 'status' })),
  ...weapons_without_integrated.map(w => ({ ...w, data_type: 'weapon' })), ...systems, ...mods, ...frames,
  ...talents.map(t => ({ ...t, ranknames: t.ranks.map(x => x.name), data_type: 'talent' })),
  ...tags.filter(x => !x.filter_ignore).map(t => ({ ...t, data_type: 'tag' })),
  ...core_bonuses.map(t => ({ ...t, data_type: 'core_bonus' })),
]

const options = {
  isCaseSensitive: false,
  findAllMatches: false,
  includeMatches: false,
  includeScore: false,
  useExtendedSearch: false,
  minMatchCharLength: 1,
  shouldSort: true,
  threshold: 0.6,
  location: 0,
  distance: 100,
  keys: [
    "name",
    "ranknames",
    "integrated.name",
    "active_name",
    "passive_name"
  ]
};

const fuse = new Fuse(searchable, options);

module.exports = {
  search(term) {
    return fuse.search(term)
  }
}