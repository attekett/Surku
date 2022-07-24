const randoms = require("./generators.js");

const mutatorDebug = 0;

// Helpers

function allIndexes(from, what) {
  const indices = [];
  let index = from.indexOf(what, 0);
  let i = 0;
  while (index > 0) {
    indices[i] = index;
    index++;
    i++;
    index = from.indexOf(what, index);
  }
  return indices;
}

function findPlaces(str, depth, places) {
  const returnObj = {};
  places.forEach((place) => {
    if (place + depth < str.length) {
      const character = str[place + depth];
      if (!returnObj.hasOwnProperty(character))
        returnObj[character] = { places: [place], char: character };
      else returnObj[character].places.push(place);
    }
  });
  return returnObj;
}

function getFrequent(nodes, length) {
  let returnObj = {};
  const min = 1 + this.wrint(5);
  for (var node in nodes) {
    if (nodes[node].places.length < min) {
      length -= nodes[node].places.length;
      delete nodes[node];
    }
  }
  let max = this.rint(length);
  for (var node in nodes) {
    max -= nodes[node].places.length;
    if (max <= 0) {
      returnObj = nodes[node];
      break;
    }
  }
  return returnObj;
}

const checkWhiteSpace = /\s/;
function collectTrigrams(input) {
  const trigrams = [[], []];
  let trigram = "";
  let index;
  let previousTrigram = "";
  for (let x = 0; x < input.length - 2; x++) {
    trigram = input[x] + input[x + 1] + input[x + 2];
    if (!checkWhiteSpace.test(trigram)) {
      if (trigram !== previousTrigram) {
        index = trigrams[0].indexOf(trigram);
        if (index !== -1) {
          trigrams[1][index].push(x);
        } else {
          trigrams[0].push(trigram);
          trigrams[1].push([x]);
        }
      }
    }
    previousTrigram = trigram;
  }

  const filteredTrigrams = {
    data: input,
    trigrams: [[], []],
  };
  for (let x = 0; x < trigrams[0].length; x++) {
    if (trigrams[1][x].length > 3) {
      filteredTrigrams.trigrams[0].push(trigrams[0][x]);
      filteredTrigrams.trigrams[1].push(trigrams[1][x]);
    }
  }
  return filteredTrigrams;
}

// String mutators

// Leaving in console.logs for now. Will remove them once this new mutator is tested properly.
function delimiterMutator(input) {
  const delimiter = this.ra([
    " ",
    "\n",
    "<",
    ">",
    '"',
    "'",
    ",",
    ".",
    ";",
    "|",
  ]);
  //	console.log('Delimiter: '+delimiter)
  const chunks = input.split(delimiter);
  const chunk = this.ra(chunks);
  if (chunk.length > 5 && chunk.length < 300)
    this.storage.storeKeyValuePair([delimiter, chunk], "delimiterMutator");
  const oldChunk = this.storage.getValueForKey(delimiter, "delimiterMutator");

  if (chunks.length < 3 || chunks.length < input.length / 300) {
    //		console.log('Fail:'+ (chunks.length)+'<'+(input.length/300) )
    return false;
  }
  switch (this.rint(3)) {
    case 0:
      //    	console.log('Repeat')
      return chunkRepeat.call(this, chunks, delimiter, oldChunk);
    case 1:
      //    	console.log('Swap')
      return chunkSwap.call(this, chunks, delimiter, oldChunk);
    case 2:
      //    	console.log('Move')
      return chunkMove.call(this, chunks, delimiter);
    default:
      console.log("WTF?");
      return "Mutation ERROR";
  }
}

function chunkRepeat(chunks, delimiter, oldChunk) {
  let chunk = oldChunk;
  if (!chunk || this.rint(3)) {
    chunk = this.ra(chunks);
  }
  let rounds = this.wrint(2000);
  let chunkChunk = "";
  while (rounds > 0) {
    rounds--;
    chunkChunk += chunk + delimiter;
  }
  const index = this.rint(chunks.length - 2) + 1;
  //	console.log('Inserting: '+chunkChunk+' To: '+index)
  chunks.splice(index, 0, chunkChunk);
  return chunks.join(delimiter);
}

function chunkSwap(chunks, delimiter, oldChunk) {
  if (!oldChunk || this.rint(3)) {
    const index1 = this.rint(chunks.length);
    const index2 = this.rint(chunks.length);
    //		console.log('Swapping: '+chunks[index1]+' To: '+chunks[index2])
    const chunk1 = chunks[index1];
    chunks[index1] = chunks[index2];
    chunks[index2] = chunk1;
  } else {
    const index = this.rint(chunks.length - 2) + 1;
    //		console.log('Swapping: '+chunks[index]+' To: '+oldChunk)

    chunks[index] = oldChunk;
  }
  return chunks.join(delimiter);
}

function chunkMove(chunks, delimiter) {
  const count = this.wrint(10);
  chunks.splice(
    this.rint(chunks.length - 2) + 1,
    0,
    chunks.splice(this.rint(chunks.length - 1) + 1, count).join(delimiter)
  );
  return chunks.join(delimiter);
}

function strCopyShort(input) {
  const where = this.rint(input.length);
  const start = this.rint(input.length);
  const end = start + this.wrint(100);
  const input_start = input.substring(0, where);
  const input_end = input.substring(where, input.length + 1);
  const what = input.substring(start, end);
  return input_start + what + input_end;
}

function strStuttr(input) {
  const where = this.rint(input.length);
  const start = this.rint(input.length);
  const end = start + this.wrint(100);
  const input_start = input.substring(0, where);
  const input_end = input.substring(where, input.length + 1);
  const what = input.substring(start, end);
  let chunk = "";
  let rounds = this.wrint(2000);
  while (rounds > 0 || this.rint(3)) {
    rounds--;
    chunk += what;
  }
  return input_start + chunk + input_end;
}

function strCopyLong(input) {
  const where = this.rint(input.length);
  const start = this.rint(input.length);
  const end =
    start + this.rint(Math.floor(input.length * this.r.genrand_real1()));
  const input_start = input.substring(0, where);
  const input_end = input.substring(where, input.length + 1);
  const what = input.substring(start, end);
  return input_start + what + input_end;
}

function strRemove(input) {
  const where = this.rint(input.length);
  const input_start = input.substring(0, where);
  const input_end = input.substring(
    where + this.wrint(1000 - where),
    input.length + 1
  );

  return input_start + input_end;
}

function insertSingleChar(input) {
  const where = this.rint(input.length);
  const input_start = input.substring(0, where);
  const input_end = input.substring(where + 1, input.length + 1);

  return input_start + String.fromCharCode(this.rint(256)) + input_end;
}

function insertMultipleChar(input) {
  let amount = this.rint(10) + 1;
  let what = "";
  while (amount > 0 || this.rint(3)) {
    amount--;
    what += String.fromCharCode(this.rint(256));
  }
  const where = this.rint(input.length);
  const input_start = input.substring(0, where);
  const input_end = input.substring(where + what.length, input.length + 1);

  return input_start + what + input_end;
}

function replaceSingleChar(input) {
  const where = this.rint(input.length);
  const input_start = input.substring(0, where);
  const input_end = input.substring(where + 1, input.length + 1);

  return input_start + String.fromCharCode(this.rint(256)) + input_end;
}

function replaceMultipleChar(input) {
  let amount = this.wrint();
  let what = "";
  while (amount > 0 || this.rint(3)) {
    amount--;
    what += String.fromCharCode(this.rint(256));
  }
  const where = this.rint(input.length);
  const input_start = input.substring(0, where);
  const input_end = input.substring(where + amount, input.length + 1);

  return input_start + what + input_end;
}

// TODO: Performance fixes.
const replaceXMLValuePairRegExp = /\s\w+?([=\/])(((('|")[^\4]*?\4)?)|([^\s<\/>]+))+/g;
/* repCount=0;
repFailCount=0;
repTotal=0; */
function replaceXMLValuePair(input) {
  // console.log('replace - repTotal: '+repTotal+' repPass: '+repCount+ ' repFailCount: '+repFailCount)
  // repTotal++
  if (input.indexOf("=") === -1) return false;
  const self = this;
  let prob = input.match(replaceXMLValuePairRegExp);
  if (prob != null) {
    prob = prob.length;
    const result = input.replace(replaceXMLValuePairRegExp, function (match) {
      const valuePair = match.split(arguments[1]);
      let pass = false;
      const key = valuePair[0].trim();
      let value = valuePair[1].trim();
      if (key.length > 0 && value.length > 0) {
        const newValue = self.storage.getValueForKey(
          key,
          "XMLValuePairStorage"
        );
        self.storage.storeKeyValuePair([key, value], "XMLValuePairStorage");
        if (newValue !== value) {
          pass = true;
          value = newValue;
        }
      }
      if (pass && !self.rint(prob)) {
        // repCount++;
        prob++;
        /* console.log('Mutate')
				console.log('Replacing: '+match)
				console.log('With: '+valuePair[0]+arguments[1]+value)
				*/ return (
          valuePair[0] + arguments[1] + value
        );
      }

      // repFailCount++;
      return match;
    });
    return result;
  }
  return false;
}

// TODO: Make this smarter!
const regExpTrickRegExp = /((\().{1,20}?(\))|(\[).{1,20}?(\])|({).{1,20}?(})|(\/).{1,20}?(\/))/gm;
function regExpTrick(input) {
  const self = this;
  const result = input.replace(regExpTrickRegExp, function (match) {
    // console.log('Matches:'+ (typeof match))
    let what = "";
    if (arguments[2]) what = "()";
    else if (arguments[4]) what = "[]";
    else if (arguments[6]) what = "{}";
    else what = "//";
    // console.log('Delimeter: '+what)
    if (!self.rint(3) && what.length > 0) {
      let rounds = self.wrint(100);
      let newValue = self.storage.getValueForKey(what, "regExpTrickStorage");
      if (newValue !== false) {
        if (what === "//") {
          newValue = `/${newValue.replace(/\//g, "")}`;
          while (rounds--) {
            const value = self.storage
              .getValueForKey(what, "regExpTrickStorage")
              .replace(/\//g, "");
            if (value && value !== "") {
              newValue += `/${value}`;
            }
          }

          return `${newValue}/`;
        }
        return newValue;
      }
    }
    self.storage.storeKeyValuePair([what, match], "regExpTrickStorage");
    return match;
  });
  return result;
}

function repeatChar(input) {
  const index = this.rint(input.length);
  let count = this.wrint();
  const what = input.charAt(index);
  let string = "";
  while (count > 0 || this.rint(3)) {
    count--;
    string += what;
  }
  return input.substring(0, index) + string + input.substring(index);
}

function repeatChars(input) {
  const index = this.rint(input.length);
  let count = this.wrint(100);
  const length = this.wrint(100);
  const what = input.substr(index, length);
  let string = "";
  while (count > 0 || this.rint(3)) {
    count--;
    string += what;
  }
  return input.substring(0, index) + string + input.substring(index);
}

// TODO: Verify behavior with different data chunks.
let callCount = 0;
let failCount = 0;
function freqString(input) {
  callCount++;
  let depth = 0;
  const MAX = 64;
  const MIN = 10;
  let taken = "";
  let places = [];

  for (let x = 0; x < input.length; x++) {
    places.push(x);
  }
  while (depth < MAX) {
    const nodes = findPlaces(input, depth, places);
    const node = getFrequent.call(this, nodes, places.length);
    if (!node.hasOwnProperty("places") || node.places.length <= 2) {
      if (taken.length < 3) {
        failCount++;
        return false;
      }
      break;
    }
    if (taken.length > MIN && !this.rint(2)) break;
    places = node.places;
    depth++;
    taken += node.char;
  }
  let secondPlacesIndex = this.rint(places.length - 1) + 1;
  let placesIndex = this.rint(secondPlacesIndex - 1);
  const place2 = this.rint(places.length - 1);

  const string = input.substring(places[placesIndex], places[placesIndex + 1]);
  if (taken.length >= 2 && string.length > taken.length) {
    this.storage.storeKeyValuePair([taken, string], "freqStringStorage");
  }
  const newValue = this.storage.getValueForKey(taken, "freqStringStorage");
  if (newValue !== false && this.rint(3) && newValue !== string) {
    return (
      input.substring(0, places[placesIndex]) +
      newValue +
      input.substring(places[secondPlacesIndex], input.length)
    );
  }
  let rounds = 2;
  if (
    this.storage.valueStorages.hasOwnProperty("freqStringStorage") &&
    this.rint(3)
  ) {
    while (rounds--) {
      const storageIndex = this.rint(
        this.storage.valueStorages.freqStringStorage[0].length
      );
      const inputIndex = input.indexOf(
        this.storage.valueStorages.freqStringStorage[0][storageIndex]
      );
      if (
        inputIndex !== -1 &&
        inputIndex !==
          input.lastIndexOf(
            this.storage.valueStorages.freqStringStorage[0][storageIndex]
          )
      ) {
        const matches = allIndexes(
          input,
          this.storage.valueStorages.freqStringStorage[0][storageIndex]
        );
        secondPlacesIndex = this.rint(matches.length - 1) + 1;
        placesIndex = this.rint(secondPlacesIndex - 1);
        return (
          input.substring(0, places[placesIndex]) +
          this.ra(
            this.storage.valueStorages.freqStringStorage[1][storageIndex]
          ) +
          input.substring(places[secondPlacesIndex], input.length)
        );
      }
    }
  }
  if (this.rint(5)) {
    return (
      input.substring(0, places[placesIndex]) +
      input.substring(places[place2], places[place2 + 1]) +
      input.substring(places[secondPlacesIndex], input.length)
    );
  }
  let secondRounds = this.wrint(100) + 1;
  let returnString = input.substring(0, places[placesIndex]);
  while (secondRounds--) {
    returnString += input.substring(places[place2], places[place2 + 1]);
  }
  return (
    returnString + input.substring(places[secondPlacesIndex], input.length)
  );
}

// TODO: Is there a way to do this faster?
const mutateNumberRegExp = /((\d+\.?\d+)|\d)/g;
function mutateNumber(input) {
  let matchCount = 0;
  const self = this;
  const count = input.match(mutateNumberRegExp);
  if (count == null) return false;

  const replaceAt = this.rint(count.length);
  return input.replace(mutateNumberRegExp, (match) => {
    matchCount++;
    if (matchCount === replaceAt) {
      return randoms.randomNumber.call(self);
    }
    return match;
  });
}

function bitFlip(input) {
  const where = this.rint(input.length);
  const input_start = input.substring(0, where);
  const input_end = input.substring(where + 1, input.length + 1);
  return (
    input_start +
    String.fromCharCode(input.charCodeAt(where) ^ (2 ** this.rint(8))) +
    input_end
  );
}

function chunkSwapper(input) {
  const newChunk = this.storage.getChunk();
  if (!newChunk) return false;
  return newChunk.data;
}

function chunkCollateTrigram(input) {
  const newChunk = this.storage.getChunk();
  const inputTrigrams = collectTrigrams(input);
  const chunkTrigrams = collectTrigrams(newChunk.data);
  const commonTrigrams = [];
  for (let x = 0; x < inputTrigrams.trigrams[0].length; x++) {
    if (chunkTrigrams.trigrams[0].indexOf(inputTrigrams.trigrams[0][x]) != -1)
      commonTrigrams.push(inputTrigrams.trigrams[0][x]);
  }
  if (commonTrigrams.length == 0) return false;
  const trigram = this.ra(commonTrigrams);
  let inputIndexes =
    inputTrigrams.trigrams[1][inputTrigrams.trigrams[0].indexOf(trigram)];
  let chunkIndexes =
    chunkTrigrams.trigrams[1][chunkTrigrams.trigrams[0].indexOf(trigram)];
  if (!trigram || !inputIndexes || !chunkIndexes) {
    console.log("Undefined?");
    console.log(input);
    console.log(newChunk.data);
    console.log(trigram);
    console.log(inputIndexes);
    console.log(chunkIndexes);
    return false;
  }
  inputIndexes = [this.ra(inputIndexes), this.ra(inputIndexes)].sort(
    (a, b) => a > b
  );
  chunkIndexes = [this.ra(chunkIndexes), this.ra(chunkIndexes)].sort(
    (a, b) => a > b
  );
  return (
    input.substring(0, inputIndexes[0]) +
    newChunk.data.substring(chunkIndexes[0], chunkIndexes[1] - 1) +
    input.substring(inputIndexes[1], input.length)
  );
}

function pdfObjectMangle(input) {
  const objBegins = [];
  const objBeginReg = /\d+ \d+ obj/g;
  let cur;
  while ((cur = objBeginReg.exec(input))) {
    objBegins.push(cur.index + cur[0].length);
  }

  const objEnds = [];
  const objEndReg = /endobj/g;
  while ((cur = objEndReg.exec(input))) {
    objEnds.push(cur.index);
  }

  while (objBegins[0] > objEnds[0]) {
    objEnds.shift();
  }

  if (objBegins.length > 1 && objEnds.length > 1) {
    const index = Math.floor(Math.random() * objEnds.length);

    // console.log(input.substring(objBegins[index],objEnds[index]))
    this.storage.storeKeyValuePair(
      ["obj", input.substring(objBegins[index], objEnds[index])],
      "pdfStorage"
    );
    const newValue = this.storage.getValueForKey("obj", "pdfStorage");
    if (newValue !== false) {
      return (
        input.substring(0, objBegins[index]) +
        newValue +
        input.substring(objEnds[index], input.length)
      );
    }
    return false;
  }
  return false;
}

function calcMutatorWeights(mutators) {
  const weightedMutatorsList = [];
  for (const mutator in mutators) {
    let { weight } = mutators[mutator];
    while (weight--) {
      weightedMutatorsList.push(mutators[mutator]);
    }
  }
  return weightedMutatorsList;
}

const mutators = {
  freqString: { mutatorFunction: freqString, weight: 20, stringOnly: false },
  chunkSwapper: { mutatorFunction: chunkSwapper, weight: 2, stringOnly: false },
  chunkCollateTrigram: {
    mutatorFunction: chunkCollateTrigram,
    weight: 2,
    stringOnly: false,
  },
  regExpTrick: { mutatorFunction: regExpTrick, weight: 10, stringOnly: false },
  strStuttr: { mutatorFunction: strStuttr, weight: 12, stringOnly: false },
  delimiterMutator: {
    mutatorFunction: delimiterMutator,
    weight: 12,
    stringOnly: false,
  },
  mutateNumber: {
    mutatorFunction: mutateNumber,
    weight: 10,
    stringOnly: false,
  },
  replaceXMLValuePair: {
    mutatorFunction: replaceXMLValuePair,
    weight: 5,
    stringOnly: true,
  },
  strCopyShort: {
    mutatorFunction: strCopyShort,
    weight: 10,
    stringOnly: false,
  },
  strCopyLong: { mutatorFunction: strCopyLong, weight: 5, stringOnly: false },
  strRemove: { mutatorFunction: strRemove, weight: 5, stringOnly: false },
  insertSingleChar: {
    mutatorFunction: insertSingleChar,
    weight: 5,
    stringOnly: false,
  },
  insertMultipleChar: {
    mutatorFunction: insertMultipleChar,
    weight: 10,
    stringOnly: false,
  },
  replaceSingleChar: {
    mutatorFunction: replaceSingleChar,
    weight: 10,
    stringOnly: false,
  },
  replaceMultipleChar: {
    mutatorFunction: replaceMultipleChar,
    weight: 5,
    stringOnly: false,
  },
  repeatChar: { mutatorFunction: repeatChar, weight: 10, stringOnly: false },
  repeatChars: { mutatorFunction: repeatChars, weight: 5, stringOnly: false },
  bitFlip: { mutatorFunction: bitFlip, weight: 5, stringOnly: false },
  pdfObjectMangle: {
    mutatorFunction: pdfObjectMangle,
    weight: 5,
    stringOnly: true,
  },
};

mutators.xmlMutate = {
  mutatorFunction: require("./xmlMutator.js"),
  weight: 10,
  stringOnly: true,
};

const mutatorList = calcMutatorWeights(mutators);

// TODO: Unit tests to verify that none of the functions below can cause crash.
//	    And that there is warnings for every time something goes wrong.
module.exports = {
  mutators: mutatorList,
  updateMutators() {
    this.mutators = calcMutatorWeights(mutators);
  },
  updateStringMutators() {
    this.mutators = calcMutatorWeights(mutators);
  },
  changeMutatorWeight(name, newWeight) {
    if (mutators.hasOwnProperty(name)) {
      if (parseInt(newWeight) !== "NaN")
        mutators[name].weight = parseInt(newWeight);
      else
        console.log(
          `Mutator weight update failed: Invalid new weight. Must be integer. Got ${newWeight}`
        );
    } else {
      console.log(`Mutator weight update failed: No such mutator. Got ${name}`);
    }
  },
  addNewMutator(name, weight, mutatorFunction) {
    if (
      name === undefined ||
      weight === undefined ||
      mutatorFunction === undefined
    ) {
      console.log("Mutator add failed: One or more arguments undefined.");
      return 0;
    }
    if (parseInt(weight) === "NaN") {
      console.log(
        `Mutator add failed: Invalid weight. Must be integer. Got ${weight}`
      );
      return 0;
    }
    if (!(mutatorFunction instanceof Function)) {
      console.log("Mutator add failed: mutatorFunction not type Function.");
      return 0;
    }
    if (mutators.hasOwnProperty(name))
      console.log(
        `Mutator add warning: Mutator with same type "${type}" and name "${name}" already exists. Overwriting.`
      );
    mutators[name] = { mutatorFunction, weight };
    this.updateMutators();
    return 1;
  },
  removeMutator(name) {
    if (mutators.hasOwnProperty(name)) delete mutators[name];
    else {
      console.log(`Mutator remove failed: No such mutator. Got ${name}`);
    }
    this.updateMutators();
  },
  useOnlyMutators(arrayOfMutatorNames) {
    for (const mutator in mutators) {
      if (arrayOfMutatorNames.indexOf(mutator) == -1) delete mutators[mutator];
    }
    this.updateMutators();
  },
  randomizeWeights() {
    // Warning this will break reproducibility via seed???
    for (const mutator in mutators) {
      mutators[mutator].weight = Math.floor(Math.random() * 10) + 1;
    }
    this.updateMutators();
  },
};
