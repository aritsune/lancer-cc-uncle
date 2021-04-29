const staticsList = [
  {
    "id": "ms_bb_breach_blast_charges",
    "names": ["Breaching Charges"]
  },
  {
    "id": "ms_type_i_flight_system",
    "names": ["Flight"]
  }
  
  //todo -- add shortcut for tlottt, opCal, etc
  
]

const regexDynamics = {
  '^H0R_OS SYSTEM UPGRADE (I+)$': function (match) {
    const horosRoman = match[1]
    const horosNumber = horosRoman.length

    return [
      `H0R_OS SYSTEM UPGRADE ${horosNumber}`,
      `HOROS SYSTEM UPGRADE ${horosNumber}`,
      `HOROS SYSTEM UPGRADE ${horosRoman}`,
      `HOROS ${horosNumber}`,
      `HOROS ${horosRoman}`,
    ]
  },
  '^TOTAL STRENGTH SUITE (I+)$': function (match) {
    const roman = match[1]
    const number = roman.length

    return [
      `TOTAL STRENGTH SUITE ${number}`,
      `TSS${number}`,
      `TSS${roman}`,
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

          if (!item.alt_names) item.alt_names = []
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
    if (item.actions && (
        item.actions.every(action => action.activation === 'Invade') ||
        item.actions.every(action => action.activation === 'Quick Tech')
    )) {
      item.actions.forEach(action => item.alt_names.push(action.name))
    }
    
    //todo - Add traits as altnames to frames
    
    //todo - add talent ranks as altnames to ... talents

    return item
  })

  return outputData
}