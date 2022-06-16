function randomShortInt() {
  return this.r.genrand_int32();
}

function randomSignedShortInt() {
  const sign = this.rint(2) ? "" : "-";
  return sign + this.r.genrand_int32();
}

function randomLongInt() {
  return this.r.genrand_int31() + this.r.genrand_int32();
}

function randomSignedLongInt() {
  const sign = this.rint(2) ? "" : "-";
  return sign + this.r.genrand_int32() + this.r.genrand_int32();
}

function randomShortFloat() {
  return this.r.genrand_res53();
}

function randomSignedShortFloat() {
  const sign = this.rint(2) ? "" : "-";
  return sign + this.r.genrand_res53();
}

function randomLongFloat() {
  return `${this.r.genrand_res53()}${this.r.genrand_int32()}`;
}

function randomSignedLongFloat() {
  const sign = this.rint(2) ? "" : "-";
  return sign + this.r.genrand_res53() + this.r.genrand_int32();
}

function randomInterestingNumber() {
  const interestingNumbers = [
    "-2147483648" /* Overflow signed 32-bit when decremented */,
    "-100000000" /* Large negative number (100M)            */,
    "-32769" /* Overflow signed 16-bit                  */,
    "32768" /* Overflow signed 16-bit                  */,
    "65535" /* Overflow unsig 16-bit when incremented  */,
    "65536" /* Overflow unsig 16 bit                   */,
    "100000000" /* Large positive number (100M)            */,
    "2147483647" /* Overflow signed 32-bit when incremented */,
    "-32768" /* Overflow signed 16-bit when decremented */,
    "-129" /* Overflow signed 8-bit                   */,
    "128" /* Overflow signed 8-bit                   */,
    "255" /* Overflow unsig 8-bit when incremented   */,
    "256" /* Overflow unsig 8-bit                    */,
    "512" /* One-off with common buffer size         */,
    "1000" /* One-off with common buffer size         */,
    "1024" /* One-off with common buffer size         */,
    "4096" /* One-off with common buffer size         */,
    "32767" /* Overflow signed 16-bit when incremented */,
    "-128" /* Overflow signed 8-bit when decremented  */,
    "-1" /*                                         */,
    "0" /*                                         */,
    "1" /*                                         */,
    "16" /* One-off with common buffer size         */,
    "32" /* One-off with common buffer size         */,
    "64" /* One-off with common buffer size         */,
    "100" /* One-off with common buffer size         */,
    "127" /* Overflow signed 8-bit when incremented  */,
  ];
  const endings = [
    "000000000000000000000000000000000000000000000000000001",
    "999999999999999999999999999999999999999999999999999999",
  ];
  let interestingValue = this.ra(interestingNumbers);
  if (!this.rint(3)) interestingValue += 1;
  else if (this.rint(2))
    interestingValue = `${interestingValue}.${this.ra(endings)}`;
  if (!this.rint(3)) return `-${interestingValue}`;
  return interestingValue;
}

const numberGenerators = [
  { generator: randomShortInt, weight: 4 },
  { generator: randomSignedShortInt, weight: 2 },
  { generator: randomLongInt, weight: 3 },
  { generator: randomSignedLongInt, weight: 1 },
  { generator: randomShortFloat, weight: 2 },
  { generator: randomLongFloat, weight: 2 },
  { generator: randomSignedShortFloat, weight: 1 },
  { generator: randomSignedLongFloat, weight: 1 },
  { generator: randomInterestingNumber, weight: 5 },
];

function calcGeneratorWeights(generators) {
  const weightedGeneratorsList = [];
  generators.forEach((generator) => {
    let { weight } = generator;
    while (weight--) {
      weightedGeneratorsList.push(generator.generator);
    }
  });
  return weightedGeneratorsList;
}

const numberGeneratorList = calcGeneratorWeights(numberGenerators);

module.exports = {
  randomNumber() {
    return this.ra(numberGeneratorList).call(this);
  },
};
