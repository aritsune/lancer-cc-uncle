const staticsList = [
  {
    "id": "ms_pattern_b_hex_charges",
    "names": ["Hex Charges"]
  },
  {
    "id": "ms_bb_breach_blast_charges",
    "names": ["Breaching Charges"]
  },
  {
    "id": "mw_impaler_nailgun",
    "names": ["nailgun"]
  }, //"nailgun" brings up Railgun sometimes
  {
    "id": "mf_black_witch_alt_orchidea",
    "names": ["orchis", "orchidea", "orchid"]
    //fuse's search matches orochi and horos before "ssc baronic interest orchidea"
  },
  {
    "id": "mf_swallowtail_alt_swallowtail_ranger_variant",
    "names": ["ranger", "ranger swallowtail"]
  },
  {
    "id": "ms_roller_directed_payload_charges",
    "names": ["roller charges"]
  },
  
  //https://docs.google.com/document/d/1UQRVRKkldAnoKQvDrXWGAAptA8yyv46mUh9FK-g8P1I/edit
  //"Lancer Character Corner Common Abbreviations Guide"
  {
    "id": "cb_auto_stabilizing_hardpoints",
    "names": ["autostab", "autostabs"]
  },
  {
    "id": "cb_overpower_caliber",
    "names": ["opcal"]
  },
  {
    "id": "cb_all_theater_movement_suite",
    "names": ["atms"]
  },
  {
    "id": "cb_full_subjectivity_sync",
    "names": ["fss"]
  },
  {
    "id": "cb_the_lesson_of_disbelief",
    "names": ["tlod", "disbelief"]
  },
  {
    "id": "cb_the_lesson_of_the_open_door",
    "names": ["tlotod", "open door"]
  },
  {
    "id": "cb_the_lesson_of_the_held_image",
    "names": ["tlothi", "held image"]
  },
  {
    "id": "cb_the_lesson_of_thinking_tomorrows_thought",
    "names": ["tlottt", "thinking tomorrow's thought", "thinking tomorrows thought"]
  },
  {
    "id": "cb_the_lesson_of_transubstantiation",
    "names": ["tlot", "transubstantiation"]
  },
  {
    "id": "cb_the_lesson_of_shaping",
    "names": ["tlos", "shaping"]
  },
  {
    "id": "cb_armory_sculpted_chassis",
    "names": ["asc"]
  },
  {
    "id": "cb_integrated_ammo_feeds",
    "names": ["iaf"]
  },
  {
    "id": "cb_superior_by_design",
    "names": ["sbd"]
  },
  {
    "id": "mw_assault_cannon",
    "names": ["asscan"]
  },
  {
    "id": "mw_leviathan_heavy_assault_cannon",
    "names": ["levican"]
  },
  {
    "id": "mw_deck_sweeper_automatic_shotgun",
    "names": ["dsas"]
  },
  {
    "id": "ms_perimeter_command_plate",
    "names": ["pcp"]
  },
  {
    "id": "ms_multi_gear_maneuver_system",
    "names": ["mgms"]
  },
  {
    "id": "mw_gravity_gun",
    "names": ["gravgun, grav gun"]
  },
  {
    "id": "ms_redundant_systems_upgrade",
    "names": ["rsu"]
  },
  {
    "id": "ms_deep_well_heat_sink",
    "names": ["dwhs"]
  },
  {
    "id": "ms_external_batteries",
    "names": ["exbatts", "exbats"]
  },
  {
    "id": "ms_field_approved_brass_ignorant_modifications",
    "names": ["fabi", "fabi mods"]
  },
  {
    "id": "mw_cyclone_pulse_rifle",
    "names": ["cpr"]
  },
  {
    "id": "mw_heavy_machine_gun",
    "names": ["hmg"]
  },
  {
    "id": "mw_nexus_light",
    "names": ["light nexus"]
  }, //the default name is Nexus (Light) which is annoying
  {
    "id": "mw_nexus_hunter_killer",
    "names": ["hk nexus", "hunter killer nexus"]
  },
  {
    "id": "mw_rocket_propelled_grenade",
    "names": ["rpg"]
  },
  {
    "id": "t_hacker",
    "names": ["laok"] //last argument of kings
  },
  {
    "id": "t_gunslinger",
    "names": ["ikwmh"] //i kill with my heart
  },
  {
    "id": "t_nuclear_cavalier",
    "names": ["nukecav", "nuke cav", "nucav"]
  },
  {
    "id": "mf_raleigh",
    "names": ["fmj"]
  },
  {
    "id": "mf_pegasus",
    "names": ["btwike"]
  },
  {
    "id": "mf_minotaur_alt_wraith",
    "names": ["wraith"]
  },
  {
    "id": "ms_ayah_of_the_syzygy",
    "names": ["ayah of the syzygy"]
  }
  
]

const romanToDecimal = {
  'I': 1,
  'II': 2,
  'III': 3,
  'IV': 4,
  'V': 5
}

//These altnames are pre-generated during the bot setup, not used live.
const regexDynamics = {
  '^H0R_OS SYSTEM UPGRADE (.+)$': function (match) {
    const horosRoman = match[1]
    const horosNumber = romanToDecimal[horosRoman]

    return [
      //H0R_OS SYSTEM UPGRADE horosRoman is the base name of the thing
      `H0R_OS SYSTEM UPGRADE ${horosNumber}`,
      `HOROS SYSTEM UPGRADE ${horosNumber}`,
      `HOROS SYSTEM UPGRADE ${horosRoman}`,
      `HOROS ${horosNumber}`,
      `HOROS ${horosRoman}`,
    ]
  },
  '^TOTAL STRENGTH SUITE (.+)$': function (match) {
    const roman = match[1]
    const number = romanToDecimal[roman]

    return [
      //TOTAL STRENGTH SUITE roman is the base name of the thing
      `TOTAL STRENGTH SUITE ${number}`,
      `TSS${number}`,
      `TSS${roman}`,
      `TSS ${number}`,
      `TSS ${roman}`
    ]
  },
  '^JÄGER KUNST (.+)$': function (match) {
    const roman = match[1]
    const number = romanToDecimal[roman]
    
    return [
      //JÄGER KUNST Roman is the base name of the thing
      `JÄGER KUNST ${number}`,
      `JAGER KUNST ${roman}`,
      `JAGER KUNST ${number}`,
      `JK${roman}`,
      `JK${number}`,
      `JK ${roman}`,
      `JK ${number}`
    ]
  }
}



const fromEntries = require('object.fromentries');

function nestedMap(dataArray, mapFn) {
  const entries = Object.entries(dataArray)

  const mapped = entries.map(([key, value]) => [key,
    Array.isArray(value) ? value.map(x => mapFn(x)) : value
  ])

  return fromEntries(mapped)
}


// transform function
module.exports = function (originalData) {
  let outputData = nestedMap(originalData, item => {

    item.alt_names = []
    
    // apply statics
    const statics = staticsList.find(x => x.id === item.id)

    if (statics) {
      item.alt_names = item.alt_names.concat(statics.names)
    }


    // regex dynamics
    for (const rx in regexDynamics) {
      if (regexDynamics.hasOwnProperty(rx)) {
        const fn = regexDynamics[rx];

        const match = new RegExp(rx).exec(item.name)
        if (match) {
          const newAlts = fn(match)
          item.alt_names = item.alt_names.concat(newAlts)

        }

      }
    }

    // GMS stuff
    if (item.source === "GMS") {
      const gmsAlt = `GMS ${item.name}`
      if (!item.alt_names) item.alt_names = []
      item.alt_names = item.alt_names.concat([gmsAlt])
    }
    
    //Add invasion options as altnames (e.g. Logic Bomb, Banish as altnames for Viral Logic Suite)
    //and quick tech options (e.g. Pinpoint Focus as altname for Tesseract)
    //also adds deployables and grenades as altnames to charges (e.g. bouncing mine for roller directed payload charges)
    //test cases: viral logic suite, tesseract, hex charges, roller charges, portable bunker, blinkshield
    if (item?.actions?.length > 1) {
      item.actions.forEach(action => {
        if (action.name) item.alt_names.push(action.name)
      })
    }
    if (item?.deployables?.length > 0) {
      item.deployables.forEach(dep => item.alt_names.push(dep.name))
    }
    
    //Add traits as altnames to frames
    if (item.data_type === 'Frame' && item.traits && item.traits.length > 0) {
      // TODO (Search Namespacing) - ensure traits like "Slow" or "Guardian" are NOT included as altnames
      // item.traits.forEach(trait => item.alt_names.push(trait.name))
    }
    
    //Add talent ranks as altnames to ... talents
    if (item.data_type === 'Talent' && item.ranks && item.ranks.length > 0) {
      item.ranks.forEach(rank => item.alt_names.push(rank.name))
    }

    //Add "X" in tags that have "{VAL}" (e.g. "{VAL}/round" gets the altname "X/Round")
    if (item.data_type === 'Tag' && item.name && item.name.includes("{VAL}")) {
      item.alt_names.push(item.name.replace("{VAL}", "X"))
    }

    return item
  })

  return outputData
}