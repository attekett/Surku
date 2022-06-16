const Surku = require("../Surku.js");

function verifySeed(input, seed, verbose) {
  let rounds = 10;
  const outputBuffer = [];
  let failed = false;
  while (rounds--) {
    const selfTest = new Surku({ seed, verbose });

    if (input === "string")
      outputBuffer.push(selfTest.generateTestCase(testString));
    else outputBuffer.push(selfTest.generateTestCase(Buffer.from(testString)));
  }
  for (let x = 0; x < 9; x++) {
    if (outputBuffer[x].toString() !== outputBuffer[1].toString()) {
      console.log(`Test failed.\n${outputBuffer[x]}!=${outputBuffer[x + 1]}`);
      failed = true;
      break;
    }
  }
  if (!failed) {
    console.error("Test passed. All 10 outputs were identical.");
    console.error(`Output length: ${outputBuffer[0].length}`);
    console.log(`Output:\n${outputBuffer[0]}\n`);
  }
}

let testString;
if (process.argv[2]) testString = process.argv[2];
else
  testString =
    "Surku on Tove Janssonin Muumi-teoksissa esiintyvä pieni ja alakuloinen koira.\nSe esiintyy vuonna 1958 ilmestyneessä Taikatalvi-kirjassa.";

let seed = Math.floor(Math.random() * 10000);
const selfTest = new Surku();
console.error(
  "Initializing new Surku with default config.\nEnabling Surku verbose. (level 0)"
);

selfTest.config.verbose = 0;
if (process.argv.indexOf("--debug") !== -1) {
  selfTest.config.verbose = 5;
}
console.error(selfTest.config);

selfTest.config.seed = seed;
console.log(`\n\nRunning with input-data: \n"${testString}"\n`);
console.error(`Input-data length: ${testString.length}\n`);

console.error(`Running 10 times with seed ${seed}`);
verifySeed("string", seed, selfTest.config.verbose);

seed = Math.floor(Math.random() * 10000);
console.error(`Changing seed to ${seed}`);
selfTest.config.seed = seed;
verifySeed("string", seed, selfTest.config.verbose);
selfTest.config.seed = undefined;

console.error("Running with random seed");
console.log(`Output: \n${selfTest.generateTestCase(testString)}\n`);

console.error("Running with random seed");
console.log(`Output: \n${selfTest.generateTestCase(testString)}\n`);
