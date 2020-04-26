const staticsList = [
  {
    "id": "ms_bb_breach_blast_charges",
    "names": ["Breaching Charges"]
  },
  {
    "id": "ms_type_i_flight_system",
    "names": ["Flight"]
  }
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

    // apply statics
    const statics = staticsList.find(x => x.id === item.id)

    if (statics) {
      item.alt_names = statics.names
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


    return item
  })

  return outputData
}