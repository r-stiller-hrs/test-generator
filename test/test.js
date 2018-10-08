const chai = require('chai');
const chaiSubset = require('chai-subset');

const ArgumentError = require('../index').ArgumentError;
const transformHotel = require('../index').transformHotel;

const executeTests = require('./testcase').executeTests;
const singlePropertyTestCase = require('./testcase').singlePropertyTestCase;
const crossPropertyTestCase = require('./testcase').crossPropertyTestCase;

const AlwaysValid = require('./evaluator').AlwaysValid;
const Contains = require('./evaluator').Contains;
const CrossScenarioEvaluator = require('./evaluator').CrossScenarioEvaluator;
const Evaluator = require('./evaluator').Evaluator;
const IsError = require('./evaluator').IsError;

const printAllValues = require('./debug').printAllValues;
const printFirstValue = require('./debug').printFirstValue;

const referenceInput = require('../referenceInput.json');
const referenceResult = require('../referenceResult.json');

chai.use(chaiSubset);

const hotelNameAndFeatureTests = {
    title: 'check hotel arguments',
    properties: [
        {
            path: "features",
            scenarios: [
                {
                    description: "features array should be empty",
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
                    description: "features array should have single entry",
                    values: [
                        () => ({ free_wifi: true }),
                        () => ({ breakfast_included: true }),
                        () => ({ cable_tv: true })
                    ],
                    evaluator: new Contains(null, {
                        features: [{ name: "free_wifi", value: "true" }]
                    }, {
                        features: [{ name: "breakfast_included", value: "true" }]
                    }, {
                        features: [{ name: "cable_tv", value: "true" }]
                    })
                }
            ]
        },
        {
            path: "name",
            scenarios: [
                {
                    description: "should throw ArgumentError",
                    values: [
                        () => null,
                        () => undefined,
                        () => "",
                        () => "1A",
                        () => Array(1024).join('a')
                    ],
                    evaluator: new IsError(ArgumentError)
                },
                {
                    description: "should return valid result",
                    values: [
                        () => "Hotel2"
                    ],
                    evaluator: new Contains(null, {
                        primaryName: 'Hotel2'
                    })
                }
            ]
        },
        {
            path: "description",
            scenarios: [
                {
                    description: "description is not required, but can be set to any value",
                    values: [
                        () => null,
                        () => undefined,
                        () => "",
                        () => "full description",
                        () => Array(1024).join('a')
                    ],
                    evaluator: new AlwaysValid()
                }
            ]
        }
    ]
};

executeTests(
    `Single Property Tests - ${hotelNameAndFeatureTests.title}`,
    singlePropertyTestCase(
        hotelNameAndFeatureTests,
        referenceInput,
        referenceResult,
        transformHotel
    )
);

executeTests(
    `Cross Property Tests - ${hotelNameAndFeatureTests.title}`,
    crossPropertyTestCase(
        hotelNameAndFeatureTests,
        referenceInput,
        referenceResult,
        transformHotel
    )
);
