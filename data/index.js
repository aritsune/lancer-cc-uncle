//Extracts data, then feeds data into format.js

/* In total, search.js expects
 weapons, --handled here
 systems,  --handled here
 mods, --handled here
 frames, --handled here
 talents, --handled here
 core_systems, --handled here

 --These would come from lancer-data directly, but may need to be overhauled b/c new data format
 tags,
 core_bonuses,
 actions,
 statuses
 */

const lancer_data = require("lancer-data");
const {
  frames,
  weapons,
  systems,
  mods,
  talents,
} = lancer_data

//Ignoring these and working with just core data for now.

// const lr_frames = require("./lrd/frames.json");
// const lr_weapons = require("./lrd/weapons.json");
// const lr_systems = require("./lrd/systems.json");
// const lr_mods = require("./lrd/mods.json");
// const lr_talents = require("./lrd/talents.json");
//
// const wf_frames = require("./wfd/frames.json");
// const wf_weapons = require("./wfd/weapons.json");
// const wf_systems = require("./wfd/systems.json");

// const frame_data = frames.concat(lr_frames).concat(wf_frames);
// const weapon_data = weapons.concat(lr_weapons).concat(wf_weapons);
// const system_data = systems
//   .concat(lr_systems)
//   .concat(wf_systems)
//   .concat(mods)
//   .concat(lr_mods);
// const talent_data = talents.concat(lr_talents);

const frame_data = frames;
const weapon_data = weapons;
const system_data = systems
  .concat(mods);
const talent_data = talents;

//Assigns data_type to each object. The formatter changes its output depending on the data_type

//Locates core systems that are integrated weapons (e.g. Sherman's ZF4-Solidcore),
//then goes to each weapon and says "this frame is where you came from".
integ_weapon_frames = frame_data.filter(frame => frame.core_system && frame.core_system.integrated)
integ_weapons = integ_weapon_frames.map(
  frame => frame.core_system.integrated.map(integ_weapon =>
    ({integ_weapon_id: integ_weapon, frame: `${frame.source} ${frame.name}`})
  ) //For each integrated weapon, create a simple object that is just "weapon and frame of origin"
).flat();
integ_weapons.forEach(({integ_weapon_id, frame}) => {
  weapon_data.find(weap => weap.id === integ_weapon_id).frame_integrated = frame
  })

//Retrieves all core systems, core weapons included, then tells each core system
//"you come from this frame"
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