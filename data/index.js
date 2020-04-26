const lancer_data = require("lancer-data");
const {
  frames,
  weapons,
  systems,
  mods,
  talents,
} = lancer_data
const lr_frames = require("./lrd/frames.json");
const lr_weapons = require("./lrd/weapons.json");
const lr_systems = require("./lrd/systems.json");
const lr_mods = require("./lrd/mods.json");
const lr_talents = require("./lrd/talents.json");

const wf_frames = require("./wfd/frames.json");
const wf_weapons = require("./wfd/weapons.json");
const wf_systems = require("./wfd/systems.json");

const frame_data = frames.concat(lr_frames).concat(wf_frames);
const weapon_data = weapons.concat(lr_weapons).concat(wf_weapons);
const system_data = systems
  .concat(lr_systems)
  .concat(wf_systems)
  .concat(mods)
  .concat(lr_mods);
const talent_data = talents.concat(lr_talents);

frame_data.filter(frame => frame.core_system && frame.core_system.integrated && frame.core_system.integrated.id)
  .map(f => ({ intID: f.core_system.integrated.id, frame: `${f.source} ${f.name}` }))
  .forEach(({ intID, frame }) => {
    weapon_data.find(x => x.id === intID).frame_integrated = frame
  })

const core_systems = frame_data.map(frame => ({
  id: `core_${frame.core_system.name.replace(' ', '_').toLowerCase()}`,
  source: `${frame.source} ${frame.name}`,
  ...frame.core_system,
  data_type: 'core_system',
}))

let data = {
  ...lancer_data,
  frames: frame_data,
  weapons: weapon_data,
  systems: system_data,
  core_systems,
  talents: talent_data
}

const altNamesTransform = require('./altNames')

data = altNamesTransform(data)

module.exports = data