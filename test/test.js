const chai = require('chai')
const chaiSubset = require('chai-subset')

const ArgumentError = require('../index').ArgumentError
const transformHotel = require('../index').transformHotel

const executeTests = require('./lib/testcase').executeTests
const singlePropertyTestCase = require('./lib/testcase').singlePropertyTestCase
const crossPropertyTestCase = require('./lib/testcase').crossPropertyTestCase

const AlwaysValid = require('./lib/evaluator').AlwaysValid
const Contains = require('./lib/evaluator').Contains
const IsError = require('./lib/evaluator').IsError

const referenceInput = require('../referenceInput.json')
const referenceResult = require('../referenceResult.json')

chai.use(chaiSubset)

const hotelNameAndFeatureTests = {
  title: 'check hotel arguments',
  properties: [
    {
      path: 'features',
      scenarios: [
        {
          description: 'features array should be empty',
          values: [
            () => null,
            () => undefined,
            () => ({})
          ],
          evaluator: new Contains(null, {
            features: []
          })
        },
        {
          description: 'features array should have single entry',
          values: [
            () => ({ free_wifi: true }),
            () => ({ breakfast_included: true }),
            () => ({ cable_tv: true })
          ],
          evaluator: new Contains(null, {
            features: [{ name: 'free_wifi', value: 'true' }]
          }, {
            features: [{ name: 'breakfast_included', value: 'true' }]
          }, {
            features: [{ name: 'cable_tv', value: 'true' }]
          })
        }
      ]
    },
    {
      path: 'name',
      scenarios: [
        {
          description: 'should throw ArgumentError',
          values: [
            () => null,
            () => undefined,
            () => '',
            () => '1A',
            () => Array(1024).join('a')
          ],
          evaluator: new IsError(ArgumentError)
        },
        {
          description: 'should return valid result',
          values: [
            () => 'Hotel2'
          ],
          evaluator: new Contains(null, {
            primaryName: 'Hotel2'
          })
        }
      ]
    },
    {
      path: 'description',
      scenarios: [
        {
          description: 'description is not required, but can be set to any value',
          values: [
            () => null,
            () => undefined,
            () => '',
            () => 'full description',
            () => Array(1024).join('a')
          ],
          evaluator: new AlwaysValid()
        }
      ]
    }
  ]
}

// executes each test scenario for its own
executeTests(
  `Single Property Tests - ${hotelNameAndFeatureTests.title}`,
  singlePropertyTestCase(
    hotelNameAndFeatureTests,
    referenceInput,
    referenceResult,
    transformHotel
  )
)

// builds a cross product / cartesian product of each
// test scenario and iterates through all the combinations
executeTests(
  `Cross Property Tests - ${hotelNameAndFeatureTests.title}`,
  crossPropertyTestCase(
    hotelNameAndFeatureTests,
    referenceInput,
    referenceResult,
    transformHotel
  )
)
