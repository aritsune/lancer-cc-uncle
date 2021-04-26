//Extracts data, then feeds data into format.js

//Load data out of the lancer-data module.
const lancer_data = require("lancer-data");
let {
  actions,
  core_bonuses,
  //core_systems are extracted from the frames later
  frames,
  glossary,
  mods,
  pilot_gear,
  skills,
  statuses,
  systems,
  tags,
  talents,
  weapons
} = lancer_data

//Load data out of supplemental modules (Long Rim, Wallflower, homebrew content packs)
//TODO - Ignoring this and working with just core data for now.

// const lr_frames = require("./lrd/frames.json");
// const lr_weapons = require("./lrd/weapons.json");
// const lr_systems = require("./lrd/systems.json");
// const lr_mods = require("./lrd/mods.json");
// const lr_talents = require("./lrd/talents.json");
//
// const wf_frames = require("./wfd/frames.json");
// const wf_weapons = require("./wfd/weapons.json");
// const wf_systems = require("./wfd/systems.json");

//Compile data from all sources.
// const frame_data = frames.concat(lr_frames).concat(wf_frames);
// const weapon_data = weapons.concat(lr_weapons).concat(wf_weapons);
// const system_data = systems
//   .concat(lr_systems)
//   .concat(wf_systems)
//   .concat(mods)
//   .concat(lr_mods);
// const talent_data = talents.concat(lr_talents);

//TODO - temporary stub while "concatenating other sources" is down.
let action_data = actions;
let core_bonus_data = core_bonuses;
//core_systems are extracted from the frames later
let frame_data = frames;
let glossary_data = glossary;
let mod_data = mods;
let pilot_items_data = pilot_gear; //pilot_gear is divided into subtypes later
let skill_data = skills;
let status_data = statuses;
let system_data = systems;
let tag_data = tags;
let talent_data = talents;
let weapon_data = weapons;

//Retrieves all core systems (core weapons included?), then gives each core system
//a source attribute: "you come from this frame"
let core_system_data = frame_data.map(frame => ({
  //id: `core_${frame.core_system.name.replace(' ', '_').toLowerCase()}`,
  source: `${frame.source} ${frame.name}`,
  ...frame.core_system
}))

//Subdivide pilot gear
let pilot_armor_data = pilot_items_data.filter(pg => pg.type === "Armor");
let pilot_gear_data = pilot_items_data.filter(pg => pg.type === "Gear");
let pilot_weapon_data = pilot_items_data.filter(pg => pg.type === "Weapon");

//Strip out anything with an id starting with "missing_", as those are compcon-specific stubs
//glossary_data, core_system_data, statuses doesn't have IDs
[action_data, core_bonus_data, frame_data, mod_data,
pilot_armor_data, pilot_gear_data, pilot_weapon_data, skill_data,
system_data, tag_data, talent_data, weapon_data].map( data_element =>
  data_element = data_element.filter(data_entry => !(data_entry.id.startsWith("missing_")))
)

//Assigns data_type to each object; data_type is used to pretty-print the object's type.
//Previously data_type was an attribute of every kind of object. It was removed.
//This also integrates the former itemTypeFormat function
action_data = action_data.map(action => ({
  ...action,
  data_type: 'Action'
}))
core_bonus_data = core_bonus_data.map(cb => ({
  ...cb,
  data_type: 'Core Bonus'
}))
core_system_data = core_system_data.map(cs => ({
  ...cs,
  data_type: 'Core System'
}))
frame_data = frame_data.map(frame => ({
  ...frame,
  data_type: 'Frame'
}))
glossary_data = glossary_data.map(g => ({
  ...g,
  data_type: 'Glossary Entry'
}))
mod_data = mod_data.map(m => ({
  ...m,
  data_type: 'Mod'
}))
pilot_armor_data = pilot_armor_data.map(pa => ({
  ...pa,
  data_type: 'Pilot Armor'
}))
pilot_gear_data = pilot_gear_data.map(pg => ({
  ...pg,
  data_type: 'Pilot Gear'
}))
pilot_weapon_data = pilot_weapon_data.map(pw => ({
  ...pw,
  data_type: 'Pilot Weapon'
}))
skill_data = skill_data.map(skill => ({
  ...skill,
  data_type: 'Pilot Skill'
}))
status_data = status_data.map(status => ({
  ...status,
  data_type: status.type
}))
system_data = system_data.map(system => ({
  ...system,
  data_type: 'System'
}))
tag_data = tag_data.map(tag => ({
  ...tag,
  data_type: 'Tag'
}))
talent_data = talent_data.map(talent => ({
  ...talent,
  data_type: 'Talent'
}))
weapon_data = weapon_data.map(weapon => ({
    ...weapon,
  data_type: 'Weapon'
}))

//Modifies weapon_data so that integrated weapons include their origin frame.
//BUT NOT REALLY - we moved arbitrary integrated[] handling to search.js

// integ_weapon_frames = frame_data.filter(frame => frame.core_system && frame.core_system.integrated)
// //Locates core systems that are integrated weapons (e.g. Sherman's ZF4-Solidcore)
// integ_weapons = integ_weapon_frames.map(
//   frame => frame.core_system.integrated.map(integ_weapon =>
//     ({integ_weapon_id: integ_weapon, frame: `${frame.source} ${frame.name}`})
//     //For each integrated weapon, create a simple object that is just "weapon_id and frame of origin"
//   )
// ).flat();
// integ_weapons.forEach(({integ_weapon_id, frame}) => {
//   weapon_data.find(weap => weap.id === integ_weapon_id).frame_integrated = frame
// })

let data = {
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
}

const altNamesTransform = require('./altNames')

data = altNamesTransform(data)

module.exports = data