const format = require('../format')
const data = require('../data')

test('testing formatter test', () => {
  let searchResult = data.frame_data.filter(obj => obj.id === "mf_blackbeard")[0]
  let output = format(searchResult)
  console.log(output)
  expect(output).toEqual(expect.stringContaining("BLACKBEARD"))
})