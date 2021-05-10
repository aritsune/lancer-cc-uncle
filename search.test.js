const {search, getDetails} = require('./search')
const format = require('./format')

test('testing the search function itself, no category', () => {
  let search_result = search("blackbeard")[0].item
  expect(search_result.id).toEqual("mf_blackbeard");
});

test ('testing search and category', () => {
  let search_result = search("blackbeard", "Frame")[0].item
  expect(search_result.id).toEqual("mf_blackbeard");
})

test('testing category sanitization', () => {
  let search_result = search("blackbeard", " _ Fr Am_ E:::")[0].item
  //category should become FrAmE, which is matched case-insensitive
  expect(search_result.id).toEqual("mf_blackbeard")
})

test('testing search and category with the same term', () => {
  //Core Bonus: Neurolink Targeting
  let search_result_1 = search("neurolink", "CoreBonus")[0].item
  expect(search_result_1.id).toEqual("cb_neurolink_targeting")
  
  //Frame: Death's Head, which has the trait Neurolink
  let search_result_2 = search("neurolink", "Frame")[0].item
  expect(search_result_2.id).toEqual("mf_deaths_head")
  
  //No category - should return one of the above, still
  let search_result_3 = format(search("neurolink")[0].item).toLowerCase()
  expect(search_result_3).toEqual(expect.stringContaining("neurolink"))
})

test('invalid category', () => {
  let search_result = search("gun", "invalid category 1234566__")[0]
  expect(search_result).toBeFalsy()
})

test('shortcut category', () =>{
  //CB is a shortcut for Core Bonus
  let search_result = search("gyges", "cb")[0].item
  expect(search_result.id).toEqual("cb_gyges_frame")
  
  //core is a shortcut for Core System
  let search_result_2 = search("hyperspec", "core")[0].item
  expect(search_result_2.name).toEqual("Hyperspec Fuel Injector")
})