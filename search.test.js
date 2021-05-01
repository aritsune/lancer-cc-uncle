const {search, getDetails} = require('./search')

test('testing the search function itself', () => {
  expect(search("blackbeard")).toBeTruthy();
});

