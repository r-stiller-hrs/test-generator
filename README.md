# test-generator

This is a proof of concept for testing simple functions.

## features

* streaming testcases (low memory footprint)
* uses descriptor to generate tests for a function
* produces a combination of all test scenarios

## limitations

* can address only one argument (of type object) - no arrays, no primitives yet
* limited assertions

## how to run

This command tests the [transformation function](./index.js) in `./index.js` using the
files `./referenceInput.json` and  `./referenceResult.json`.

The [reference input file](./referenceInput.json) is used to give a 'default' argument which is
modified for each test scenario accordingly.

The [reference result file](./referenceResult.json) is used the same way, but for the resulting object.

The [test scenario descriptor](./test/test.js) can be found in `./test/test.js`
(this could also be a simple json file in the future).

```shell
npm test
```

# LICENSE

[GNU GENERAL PUBLIC LICENSE Version 3](./LICENSE)
