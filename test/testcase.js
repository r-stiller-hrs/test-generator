const _ = require('lodash');

const CrossScenarioEvaluator = require("./evaluator").CrossScenarioEvaluator;

function getValueDescription(value) {
    let valueStr = JSON.stringify(value);

    if (valueStr && valueStr.length > 32) {
        valueStr = valueStr.substr(0, 32) + ` ...(+${valueStr.length - 32}, ${typeof value})`;
    } else {
        valueStr += ` (${typeof value})`;
    }

    return valueStr;
}

class FunctionTestCase {
    
    constructor() {
        this.arguments = [];
        this.context = null;
        this.description = null;
        this.descriptor = null;
        this.evaluator = null;
        this.expectedResult = null;
        this.functionToTest = null;
        this.referenceInput = null;
        this.referenceResult = null;
        this.scenario = null;
    }

    evaluate() {
        this.evaluator.eval(this);
    }
    
}

class PropertyScenarioValue {
    
    constructor(property, scenario, value) {
        this.property = property;
        this.scenario = scenario;
        this.value = value;
    }

    getValueDescription() {
        return getValueDescription(this.value);
    }
    
}

function executeTests(title, generator) {
    describe(title, () => {
        for (let tc of generator) {
            it(tc.description, () => tc.evaluate());
        }
    });
}

function executeFirstTest(title, generator) {
    describe(title, () => {
        for (let tc of generator) {
            it(tc.description, () => tc.evaluate());
            break;
        }
    });
}

function cartesianProductSimplified(...arrays) {
    let args = [];
    for (let i = 1; i < arrays.length; i++) {
        args = args.concat([cartesianProduct, arrays[i]]);
    }
    args.splice(0, 0, arrays[0]);
    return cartesianProduct(...args);
}

function* cartesianProduct(values, generator, ...generatorArgs) {
    for (const value of values) {
        if (generator) {
            for (let other of generator(...generatorArgs)) {
                yield [value, ...other];
            }
        } else {
            yield [value];
        }
    }
}

function* singlePropertyTestCase(descriptor, referenceInput, referenceResult, fn, failFast = false) {
    for (const property of descriptor.properties) {
        for (const scenario of property.scenarios) {
            for (const valueGenerator of scenario.values) {
                const value = valueGenerator();
                const testCase = new FunctionTestCase();
                const valueStr = getValueDescription(value);
                
                testCase.arguments.push(JSON.parse(JSON.stringify(referenceInput)));
                _.set(testCase.arguments[0], property.path, value);
                
                testCase.context = null;
                testCase.description = `${property.path} is ${valueStr} -> ${scenario.description}`;
                testCase.descriptor = descriptor;
                testCase.evaluator = scenario.evaluator;
                testCase.functionToTest = fn;
                testCase.referenceInput = referenceInput;
                testCase.referenceResult = referenceResult;
                testCase.scenario = [new PropertyScenarioValue(property, scenario, value)];

                const result = yield testCase;
        
                if (failFast && !result) {
                    break;
                }
            }
        }
    }
}

function* crossPropertyTestCase(descriptor, referenceInput, referenceResult, fn, failFast = false) {
    const args = [];
    for (const property of descriptor.properties) {
        const propertyScenarios = [];
        for (const scenario of property.scenarios) {
            for (const valueGenerator of scenario.values) {
                propertyScenarios.push([property, scenario, valueGenerator()]);
            }
        }
        args.push(propertyScenarios);
    }

    for (let value of cartesianProductSimplified(...args)) {
        const values = value.map(v => new PropertyScenarioValue(v[0], v[1], v[2]));
        const testCase = new FunctionTestCase();

        testCase.referenceInput = referenceInput;
        testCase.referenceResult = referenceResult;
        testCase.descriptor = descriptor;
        testCase.functionToTest = fn;
        testCase.arguments.push(JSON.parse(JSON.stringify(referenceInput)));
        testCase.description = "";
        values.forEach(psv => {
            testCase.description += `${psv.property.path} is ${psv.getValueDescription()}, `;
            _.set(testCase.arguments[0], psv.property.path, psv.value);
        });
        testCase.description = testCase.description.slice(0, -2);
        testCase.evaluator = new CrossScenarioEvaluator(values);
        testCase.scenario = values;

        const result = yield testCase;

        if (failFast && !result) {
            break;
        }
    }
}

module.exports = {
    singlePropertyTestCase,
    crossPropertyTestCase,
    cartesianProductSimplified,
    cartesianProduct,
    executeTests,
    executeFirstTest,
    getValueDescription,
    FunctionTestCase,
    PropertyScenarioValue,
};
