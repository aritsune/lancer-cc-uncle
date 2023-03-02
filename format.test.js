const format = require('./format')
const data = require('./data')
const turndownService = require('turndown')()

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

function searchStub(id) {
  return searchable.filter(obj => obj.id === id)[0]
}

// I got too lazy to write each action as an individual unit test,
// since for each unit test, the setup was very similar

// TODO - reformat these to use the test.each() structure

test('all actions at once', () => {
  action_data.forEach(action => {
    let output = format(action)
    let expectedDescription = turndownService.turndown(action.detail)

    //Expect output to contain the substring action.detail.
    expect(output).toEqual(expect.stringContaining(expectedDescription))
  })
})

test('all core bonuses at once', () => {
  core_bonus_data.forEach(cb => {
    let output = format(cb)
    let expectedDescription = turndownService.turndown(cb.effect)
    
    expect(output).toEqual(expect.stringContaining(expectedDescription))
  })
})

test('all core systems at once', () => {
  core_system_data.forEach(cs => {
    let output = format(cs)
    let expectedDescription = turndownService.turndown(cs.active_effect)
  
    //It's mandatory for a core system to include an active_effect.
    expect(output).toEqual(expect.stringContaining(expectedDescription))
    
    //Optional aspects of core systems.
    if (cs.passive_actions) {
      let action0Description = turndownService.turndown(cs.passive_actions[0].detail)
      expect(output).toEqual(expect.stringContaining(action0Description))
    }
    if (cs.active_actions) {
      let action1Description = turndownService.turndown(cs.active_actions[0].detail)
      expect(output).toEqual(expect.stringContaining(action1Description))
    }
    if (cs.integrated) { //Integrated weapons or systems.
      let integrated = searchStub(cs.integrated[0])
      let integratedDescription = integrated.effect || ''
      integratedDescription = turndownService.turndown(integratedDescription)
      expect(output).toEqual(expect.stringContaining(integratedDescription))
    }
    
  })
})

test('all frames at once', () => {
  frame_data.forEach(frame => {
    let output = format(frame)
    let expectedDescription = frame.name

    //Required attributes: frame name
    expect(output).toEqual(expect.stringContaining(expectedDescription))
    
    //Traits aren't technically required, but it seems reasonable to test
    if (frame.traits && frame.traits.length > 0) {
      frame.traits.forEach(trait => {
        let traitDescription = undefined
        if(trait.actions && trait.actions.length > 0) {
          traitDescription = turndownService.turndown(trait.actions[0].detail)
          expect(output).toEqual(expect.stringContaining(traitDescription))
        }
        if (!trait.actions && !trait.deployables) {
          traitDescription = turndownService.turndown(trait.description)
          expect(output).toEqual(expect.stringContaining(traitDescription))
        }
      })
    }
    
  })
})

test('all glossary entries at once', () => {
  glossary_data.forEach(glossary_entry => {
    let output = format(glossary_entry)
    let expectedDescription = turndownService.turndown(glossary_entry.description)
    
    expect(output).toEqual(expect.stringContaining(expectedDescription))
  })
})

test('all mods at once', () => {
  mod_data.forEach(mod => {
    let output = format(mod)
    let expectedDescription = turndownService.turndown(mod.effect)
    
    expect(output).toEqual(expect.stringContaining(expectedDescription))
  })
})

test('all pilot armors at once', () => {
  pilot_armor_data.forEach(parmor => {
    let output = format(parmor)
    let expectedDescription = turndownService.turndown(parmor.description)
    
    expect(output).toEqual(expect.stringContaining(expectedDescription))
  })
})

test('all pilot gears at once', () => {
  pilot_gear_data.forEach(pgear => {
    let output = format(pgear)
    let expectedDescription = turndownService.turndown(pgear.description)
    
    expect(output).toEqual(expect.stringContaining(expectedDescription))
  })
})

//pilot weapon data and weapon data are tested at the same time

test('all skills at once', () => {
  skill_data.forEach(skill => {
    let output = format(skill)
    let expectedDescription = turndownService.turndown(skill.detail)
  
    expect(output).toEqual(expect.stringContaining(expectedDescription))
  })
})

test('all statuses and conditions at once', () => {
  status_data.forEach(status => {
    let output = format(status)
    let expectedDescription = turndownService.turndown(status.effects)
    
    expect(output).toEqual(expect.stringContaining(expectedDescription))
  })
})

test('all systems at once', () => {
  system_data.forEach(system => {
    let output = format(system)
    let expectedDescription = ''
    
    //System descriptions can vary. Effects, then Actions, then Deployables.
    if(system.effect) expectedDescription = system.effect
    else if (system.actions && system.actions.length > 0) expectedDescription = system.actions[0].detail
    else if (system.deployables && system.deployables.length > 0
      && system.deployables.actions && system.deployables.actions.length > 0)
      expectedDescription = system.deployables[0].actions[0].detail
    
    expectedDescription = turndownService.turndown(expectedDescription)
    
    expect(output).toEqual(expect.stringContaining(expectedDescription))
  })
})

test('all tags at once', () => {
  tag_data.forEach(tag => {
    let output = format(tag)
    let expectedDescription = turndownService.turndown(tag.description)
  
    expect(output).toEqual(expect.stringContaining(expectedDescription))
  })
})

test('all talents at once', () => {
  talent_data.forEach(talent => {
    let output = format(talent)
    talent.ranks.forEach(rank => {
      let expectedDescription = ''
      // if(rank.integrated && rank.integrated.length > 0) {
      //   let integrated = searchStub(rank.integrated[0])
      //   expectedDescription = turndownService.turndown(integrated.detail || integrated.effect || integrated.on_hit || integrated.on_crit || integrated.on_attack || '')
      // }
      if (rank.actions && rank.actions.length > 0) {
        let action = rank.actions[0].detail
        expectedDescription = turndownService.turndown(action)
      }
      else {
        expectedDescription = turndownService.turndown(rank.description)
      }
      expect(output).toEqual(expect.stringContaining(expectedDescription))
    })
  })
})

test('all weapons at once', () => {
  let combined_weapon_data = pilot_weapon_data.concat(weapon_data)
  
  combined_weapon_data.forEach(weap => {
    let output = format(weap)
    let expectedDescription = turndownService.turndown(weap.name)
    
    expect(output).toEqual(expect.stringContaining(expectedDescription))
    
    //TODO -- figure out how to test tags, range, damage, effects, etc...
  })
})

test('Reactions should display frequency - 1/round', () => {
  let ovw = searchable.filter(item => item.id === "act_overwatch")[0]
  let ovw_output = format(ovw)
  expect(ovw_output).toEqual(expect.stringContaining("1/round"))
})

test.each(mod_data)('Mods should have SP', (item) => {
  let output = format(item)
  expect(output).toEqual(expect.stringContaining(item.sp + " SP"))
})

test('Items should display content_pack source - core rulebook', () => {
  let everest = searchable.filter(item => item.id === "mf_raleigh")[0]
  let everest_output = format(everest)
  expect(everest_output).toEqual(expect.stringContaining("Core Rulebook"))
})

test('Items should display content_pack source - solstice rain', () => {
  let chomo = searchable.filter(item => item.id === "mf_chomolungma")[0]
  let chomo_output = format(chomo)
  expect(chomo_output).toEqual(expect.stringContaining("Solstice Rain"))
})