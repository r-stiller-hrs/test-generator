const _ = require('lodash');
const assert = require('assert');
const chai = require('chai');
const AssertionError = chai.AssertionError;

class Evaluator {
    
    eval(testcase) {
        try {
            this.prepareVerification(testcase)
            var result = testcase.functionToTest.apply(testcase.context, testcase.arguments);
            this.verifyResult(result, testcase);
        } catch(e) {
            if (e instanceof AssertionError) {
                throw e;
            }
            this.verifyError(e, testcase);
        }
    }
    
    prepareVerification(testcase) {
        testcase.expectedResult = Object.assign(
            {},
            JSON.parse(JSON.stringify(testcase.referenceResult)),
        );
    }
    
    verifyResult(result, testcase) {
        assert.fail('not implemented');
    }
    
    verifyError(e, testcase) {
        assert.fail('not implemented');
    }
    
}

class IsError extends Evaluator {
    
    constructor(errorType) {
        super();
        this.errorType = errorType;
    }
    
    prepareVerification(testcase) {
    }
    
    verifyResult(result, testcase) {
        assert.fail('expected error was not thrown');
    }
    
    verifyError(e, testcase) {
        if (!(e instanceof this.errorType)) {
            assert.fail(`another error was thrown than expected: ${e}`);
        }
    }
    
}

class Contains extends Evaluator {
    
    constructor(options, ...subtrees) {
        super();
        this.options = options;
        this.subtrees = subtrees;
    }
    
    prepareVerification(testcase) {
    }
    
    verifyResult(result, testcase) {
        try {
            // ugly but does the job ...
            let errorCount = 0;
            for (const subtree of this.subtrees) {
                try {
                    if (this.options && this.options.ignoreOtherProperties === true) {
                        chai.expect(result).to.containSubset(subtree);
                        // chai.expect(result)
                        //     .to.have.deep.property(testcase.scenario[0].property.path)
                        //     .that.is.oneOf(...this.subtrees);
                    } else {
                        const expected = Object.assign(
                            {},
                            JSON.parse(JSON.stringify(testcase.referenceResult)),
                            subtree
                        );
                        chai.expect(result).to.deep.equal(expected);
                    }
                } catch(e) {
                    if (!(e instanceof AssertionError)) {
                        throw e;
                    }
                    errorCount++;
                }
            }

            if (errorCount === this.subtrees.length) {
                assert.fail('Non of the options matched the actual result');
            }
        } catch(e) {
            if (e instanceof AssertionError) {
                throw e;
            }
            assert.fail(`invocation failed with error: ${e}`);
        }
    }
    
    verifyError(e, testcase) {
        assert.fail(`invocation failed with error: ${e}`);
    }
    
}

class AlwaysValid extends Evaluator {
    
    prepareVerification(testcase) {
    }

    verifyResult(result, testcase) {
    }
    
    verifyError(e, testcase) {
    }
    
}

class CrossScenarioEvaluator extends Evaluator {
    
    constructor(options, propertyScenarioValues) {
        super();
        this.options = options;
        this.propertyScenarioValues = propertyScenarioValues;

        if (!this.propertyScenarioValues) {
            this.propertyScenarioValues = this.options;
            this.options = null;
        }

        if (this.propertyScenarioValues) {
            this.errorScenarios = this.propertyScenarioValues
                .filter(psv => psv.scenario.evaluator instanceof IsError);
            this.resultScenarios = this.propertyScenarioValues
                .filter(psv => !(psv.scenario.evaluator instanceof IsError));
        }
    }
    
    prepareVerification(fn, testcase) {
    }
    
    verifyResult(result, testcase) {
        this.resultScenarios.forEach(resultScenario => {
            resultScenario.scenario.evaluator.verifyResult(result, testcase);
        });
    }
    
    verifyError(e, testcase) {
        this.errorScenarios.forEach(errorScenario => {
            errorScenario.scenario.evaluator.verifyError(e, testcase);
        });
    }
    
}

module.exports = {
    Evaluator,
    IsError,
    Contains,
    AlwaysValid,
    CrossScenarioEvaluator,
};
