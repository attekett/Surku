const Surku = require("../Surku.js");

const demoSurku = new Surku({ maxMutations: 1, minMutations: 1, useOnly: [] });

// addNewMutator:function(name,weight,mutatorFunction)
demoSurku.mutators.addNewMutator("DemoMutator", 5, (input) => {
  const where = Math.floor(Math.random() * input.length);
  return `${input.slice(0, where)}Hello World${input.slice(
    where,
    input.length
  )}`;
});

if (process.argv[2] !== undefined)
  console.log(demoSurku.generateTestCase(process.argv[2]));
else console.log(demoSurku.generateTestCase("I am Surku."));
