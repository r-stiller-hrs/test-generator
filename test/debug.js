function printAllValues (generator) {
  for (let value of generator) {
    console.log(value)
  }
}

function printFirstValue (generator) {
  for (let value of generator) {
    console.log(value)
    break
  }
}

module.exports = {
  printAllValues,
  printFirstValue
}
