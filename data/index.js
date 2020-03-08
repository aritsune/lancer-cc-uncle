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


module.exports = {
  ...lancer_data,
  frames: frame_data,
  weapons: weapon_data,
  systems: system_data,
  talents: talent_data
}