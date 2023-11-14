// Extracts data from LCPs, then feeds data into format.js

// Load data out of the lancer-data module.
const lancer_data = require("@massif/lancer-data");
const long_rim_data = require("@massif/long-rim-data");
const wallflower_data = require("@massif/wallflower-data");
const ktb_data = require("@massif/ktb-data");
const osr_data = require("@massif/osr-data");
const dustgrave_data = require("@massif/dustgrave-data");

function source_data(src) {
  let {
    actions,
    core_bonuses,
    // core_systems are extracted from the frames later
    frames,
    glossary,
    info,
    lcp_manifest,
    mods,
    pilot_gear,
    skills,
    statuses,
    systems,
    tags,
    talents,
    weapons
  } = src

  let sourced_data = {
    action_data: actions,
    core_bonus_data: core_bonuses,
    // core_systems are extracted from the frames later
    frame_data: frames,
    glossary_data: glossary,
    mod_data: mods,
    pilot_items_data: pilot_gear, // pilot_gear is divided into subtypes later
    skill_data: skills,
    status_data: statuses,
    system_data: systems,
    tag_data: tags,
    talent_data: talents,
    weapon_data: weapons
  }

  const manifest = info ? info : lcp_manifest;
  const pack_name = `${manifest.name} v${manifest.version}, by ${manifest.author}`;

  // content_pack describes where data came from.
  Object.values(sourced_data).forEach(array => {
    array?.forEach(entry => entry.content_pack = pack_name)
  });

  return sourced_data;
}

let data_array = [
  lancer_data, 
  long_rim_data, 
  wallflower_data, 
  ktb_data, 
  osr_data, 
  dustgrave_data
].map(data => source_data(data));

function compile_data(data_array, data_type) {
  return [].concat(...data_array.map(data => data[data_type]).filter(data => !!data));
}

let action_data = compile_data(data_array, "action_data");
let core_bonus_data = compile_data(data_array, "core_bonus_data");
// core_systems are extracted from the frames later
let frame_data = compile_data(data_array, "frame_data");
let glossary_data = compile_data(data_array, "glossary_data");
let mod_data = compile_data(data_array, "mod_data");
let pilot_items_data = compile_data(data_array, "pilot_items_data");
let skill_data = compile_data(data_array, "skill_data");
let status_data = compile_data(data_array, "status_data");
let system_data = compile_data(data_array, "system_data");
let tag_data = compile_data(data_array, "tag_data");
let talent_data = compile_data(data_array, "talent_data");
let weapon_data = compile_data(data_array, "weapon_data");

// Load data out of supplemental modules (Long Rim, Wallflower, homebrew content packs)
const { readdirSync } = require('fs')

const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => source + dirent.name + "/")
// https://stackoverflow.com/a/26832802

const getFiles = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(fileent => fileent.isFile())
    .map(fileent => fileent.name)

let data_pack_paths = getDirectories('./data/')
console.log("Found data packs", data_pack_paths)

data_pack_paths.forEach(pack_path => {
  
  // Get files from pack_path directory
  let data_pack_files = getFiles(pack_path)
  console.log("In path", pack_path, "found files", data_pack_files)

  // Adjust filenames to have the "/<LCP directory>/<filename>.json" format,
  // stripping the "./data/" prefix
  let file_path_regex = /\.\/data(.+\.json)/

  // Get name + version number from lcp_manifest
  manifest_file_name = "." + file_path_regex.exec(pack_path+"lcp_manifest.json")[1]
  manifest_file = require(manifest_file_name)
  content_source_string = `${manifest_file.name} v${manifest_file.version}, by ${manifest_file.author}`
  // example: "Lancer Wallflower Data v1.0.7, from Massif Press"
  
  data_pack_files.forEach(file => {
    
    let adjusted_file_name = "." + file_path_regex.exec(pack_path+file)[1]

    function concatFileContentsToExisting(existing, adjusted_file_name) {
      file_contents = require(adjusted_file_name)
      file_contents.map(item => item.content_pack = content_source_string)
      return existing.concat(file_contents)
    }

    switch(file) {
      case('actions.json'):
        action_data = concatFileContentsToExisting(action_data, adjusted_file_name)
        break
      // TODO: implement bond formatting later.
      case('bonds.json'):
        // bonds_data = bonds_data.contact(require(adjusted_file_name))
        break
      case('core_bonuses.json'):
        core_bonus_data = concatFileContentsToExisting(core_bonus_data, adjusted_file_name)
        break
      case('frames.json'):
        frame_data = concatFileContentsToExisting(frame_data, adjusted_file_name)
        break
      case('glossary.json'):
        glossary_data = concatFileContentsToExisting(glossary_data, adjusted_file_name)
        break
      case('lcp_manifest.json'):
        // ignore
        break
      case('mods.json'):
        mod_data = concatFileContentsToExisting(mod_data, adjusted_file_name)
        break
      case('pilot_gear.json'):
        pilot_items_data = concatFileContentsToExisting(pilot_items_data, adjusted_file_name)
        break
      case('reserves.json'):
        // TODO: implement reserves formatting later.
        break
      case('skills.json'):
        skill_data = concatFileContentsToExisting(skill_data, adjusted_file_name)
        break
      case('statuses.json'):
        status_data = concatFileContentsToExisting(status_data, adjusted_file_name)
        break
      case('systems.json'):
        system_data = concatFileContentsToExisting(system_data, adjusted_file_name)
        break
      case('tags.json'):
        tag_data = concatFileContentsToExisting(tag_data, adjusted_file_name)
        break
      case('talents.json'):
        talent_data = concatFileContentsToExisting(talent_data, adjusted_file_name)
        break
      case('weapons.json'):
        weapon_data = concatFileContentsToExisting(weapon_data, adjusted_file_name)
        break
      default:
        console.log(adjusted_file_name, "doesn't correspond to a known LCP file, or was otherwise ignored")
        break
    }
  })
})

// Retrieves all core systems (core weapons included?), then gives each core system
// a source attribute: "you come from this frame"
let core_system_data = frame_data.map(frame => ({
  //id: `core_${frame.core_system.name.replace(' ', '_').toLowerCase()}`,
  source: `${frame.source} ${frame.name}`,
  content_pack: frame.content_pack,
  ...frame.core_system
}))

// Subdivide pilot gear
let pilot_armor_data = pilot_items_data.filter(pg => pg.type === "Armor");
let pilot_gear_data = pilot_items_data.filter(pg => pg.type === "Gear");
let pilot_weapon_data = pilot_items_data.filter(pg => pg.type === "Weapon");

// Strip out anything with an id starting with "missing_", as those are compcon-specific stubs
// glossary_data, core_system_data, statuses doesn't have IDs

action_data = action_data.filter(data_entry => !(data_entry.id.startsWith("missing_")))
core_bonus_data = core_bonus_data.filter(data_entry => !(data_entry.id.startsWith("missing_")))
core_system_data = core_system_data.filter(data_entry => !(data_entry.name === "ERR: MISSING DATA"))
frame_data = frame_data.filter(data_entry => !(data_entry.id.startsWith("missing_")))
mod_data = mod_data.filter(data_entry => !(data_entry.id.startsWith("missing_")))
pilot_armor_data = pilot_armor_data.filter(data_entry => !(data_entry.id.startsWith("missing_")))
pilot_gear_data = pilot_gear_data.filter(data_entry => !(data_entry.id.startsWith("missing_")))
pilot_weapon_data = pilot_weapon_data.filter(data_entry => !(data_entry.id.startsWith("missing_")))
skill_data = skill_data.filter(data_entry => !(data_entry.id.startsWith("missing_")))
system_data = system_data.filter(data_entry => !(data_entry.id.startsWith("missing_")))
tag_data = tag_data.filter(data_entry => !(data_entry.id.startsWith("missing_")))
talent_data = talent_data.filter(data_entry => !(data_entry.id.startsWith("missing_")))
weapon_data = weapon_data.filter(data_entry => !(data_entry.id.startsWith("missing_")))


// Manually modify structure and stress glossary entries to include the tables
glossary_data.find(glossary_entry => glossary_entry.name === 'Structure')
  .description += `

Roll 1d6 per point of structure damage marked, including the structure damage that has just been taken. Choose the lowest result and check the structure damage chart to determine the outcome.
<table class="tg">
<thead>
  <tr>
    <th class="tg-0lax">5-6</th>
    <th class="tg-0lax">Glancing Blow</th>
    <th class="tg-0lax">Mech is IMPAIRED until the end of its next turn.</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td class="tg-0lax">2-4</td>
    <td class="tg-0lax">System Trauma</td>
    <td class="tg-0lax">Roll 1d6. On 1-3, all weapons on one mount (of choice) are destroyed. On 4-6, one system (of choice) is destroyed. <br>(Weapons or systems with no LIMITED charges are not valid choices.) <br>If there are no valid weapons, destroy a system; if there are no valid systems, destroy a weapon.<br>If there are no valid weapons or systems, this becomes a Direct Hit instead.<br></td>
  </tr>
  <tr>
    <td class="tg-0lax">1</td>
    <td class="tg-0lax">Direct Hit</td>
    <td class="tg-0lax">The result depends on the mech's remaining structure:<br>3+ Structure: Mech is STUNNED until the end of its next turn.<br>2 Structure: Roll a HULL Check. On success, mech is STUNNED until the end of its next turn. On failure, mech is destroyed.<br>1 Structure: Mech is destroyed.<br></td>
  </tr>
  <tr>
    <td class="tg-0lax">Multiple 1s</td>
    <td class="tg-0lax">Crushing Hit</td>
    <td class="tg-0lax"> Mech is destroyed.</td>
  </tr>
</tbody>
</table>`

glossary_data.find(glossary_entry => glossary_entry.name === 'Stress')
  .description += `

Roll 1d6 per point of stress damage marked, including the stress damage that has just been taken. Choose the lowest result and check the overheating chart to determine the outcome.
<table class="tg">
<thead>
  <tr>
    <th class="tg-0pky">5-6</th>
    <th class="tg-0pky">Emergency Shunt<br></th>
    <th class="tg-0pky">Mech becomes IMPAIRED until end of its next turn.<br></th>
  </tr>
</thead>
<tbody>
  <tr>
    <td class="tg-0pky">2-4</td>
    <td class="tg-0pky">Destabilized Power Plant</td>
    <td class="tg-0pky">Mech becomes EXPOSED until the status is cleared.</td>
  </tr>
  <tr>
    <td class="tg-0pky">1</td>
    <td class="tg-0pky">Meltdown</td>
    <td class="tg-0pky">The result depends on the mech's remaining stress:<br>3+ Stress: Mech becomes EXPOSED.<br>2 Stress: Roll an ENGINEERING Check. On success, mech is EXPOSED. On failure, mech suffers Reactor Meltdown after 1d6 of the mech's turns. Reactor Meltdown can be prevented by retrying the ENGINEERING check as a free action.<br>1 Stress: Mech suffers a Reactor Meltdown at end of its next turn.<br></td>
  </tr>
  <tr>
    <td class="tg-0pky">Multiple 1s</td>
    <td class="tg-0pky">Irreversible Meltdown</td>
    <td class="tg-0pky">Mech suffers Reactor Meltdown at end of its next turn.</td>
  </tr>
</tbody>
</table>`

// Assigns data_type to each object; data_type is used to pretty-print the object's type.
// The old LCP format had data_type as an attribute of every object; this was removed, though.
// This also integrates the former itemTypeFormat function
action_data = action_data.map(action => ({
  ...action,
  data_type: 'Action'
}))
core_bonus_data = core_bonus_data.map(cb => ({
  ...cb,
  data_type: 'CoreBonus'
}))
core_system_data = core_system_data.map(cs => ({
  ...cs,
  data_type: 'CoreSystem'
}))
frame_data = frame_data.map(frame => ({
  ...frame,
  data_type: 'Frame'
}))
glossary_data = glossary_data.map(g => ({
  ...g,
  data_type: 'GlossaryEntry'
}))
mod_data = mod_data.map(m => ({
  ...m,
  data_type: 'Mod'
}))
pilot_armor_data = pilot_armor_data.map(pa => ({
  ...pa,
  data_type: 'PilotArmor'
}))
pilot_gear_data = pilot_gear_data.map(pg => ({
  ...pg,
  data_type: 'PilotGear'
}))
pilot_weapon_data = pilot_weapon_data.map(pw => ({
  ...pw,
  data_type: 'PilotWeapon'
}))
skill_data = skill_data.map(skill => ({
  ...skill,
  data_type: 'PilotSkill'
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
//BUT NOT REALLY - we moved integrated[] handling to search.js

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