#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const Surku = function (user_config) {
  this.m = require("./mersenne-twister.js");
  const mutators = require("./mutators.js");
  this.mutators = mutators;
  const self = this;
  // eslint-disable-next-line no-control-regex
  const stringCheckRegExp = /[\u0000-\u0005]+/;
  // eslint-disable-next-line no-control-regex
  const isNonNullRegExp = /[^\u0000-\u0005]+/;
  const config = {
    maxMutations: 20,
    minMutations: 1,
    chunkSize: 3000,
    useOnly: undefined,
    seed: undefined,
    verbose: undefined,
  };

  this.config = config;
  if (user_config !== undefined) {
    for (const key in user_config) this.config[key] = user_config[key];
  }

  if (
    this.config.useOnly !== undefined &&
    this.config.useOnly instanceof Array
  ) {
    mutators.useOnlyMutators(this.config.useOnly);
  }

  this.ra = function (array) {
    if (Array.isArray(array)) return array[this.rint(array.length)];

    console.error("ra: called with non-array");
    console.error(array);
    return false;
  };

  this.rint = function (max) {
    if (max || max === 0) {
      const rintOutput = Math.floor(this.r.genrand_real1() * max);
      if (Number.isNaN(rintOutput))
        console.error(
          `rint: called with non-number ${max} results to ${rintOutput}`
        );
      return rintOutput;
    }
    console.error(`rint: called with ${max}`);
    return false;
  };

  this.wrint = function (max) {
    if (max === undefined) max = 2000;
    const num = this.r.genrand_real1() * 3;
    const div = this.r.genrand_real1() + Number.MIN_VALUE; // Avoid divide by zero.
    return (Math.floor(num / div) ? Math.floor(num / div) : 1) % max;
  };

  const seedBase = this.m.newMersenneTwister(self.config.seed);
  this.seedBase = seedBase;

  this.generateTestCase = function (input) {
    this.config = self.config;
    this.storage = self.storage;
    this.debugPrint = function (message, level) {
      if (
        self.config.hasOwnProperty("verbose") &&
        self.config.verbose >= level
      ) {
        process.stderr.write(message);
      }
    };
    this.ra = self.ra;

    this.rint = self.rint;

    this.r = self.m.newMersenneTwister(seedBase.genrand_int31());
    return mutate.call(this, input);
  };

  //
  // Hold kind of linked list of stored data
  //
  /*	
		storage:{
			where:[
				[key1,key2],
				[[key1value1,key1value2],[key2value2]]
			]	
		} 
	*/
  this.storage = {
    lastChunks: [],
    maxKeys: 100,
    maxValues: 30,
    maxChunks: 10,
    valueStorages: {},
    storeKeyValuePair(keyValueArray, where) {
      // Check if valueStorage name was provided
      const key = keyValueArray[0];
      const value = keyValueArray[1];
      let storageObject;
      // if(process.memoryUsage().heapUsed<700*1024*1024){
      if (where === undefined) where = "defaultStorage";
      // If valueStorage named with value of where exists use it, else create empty one.
      if (this.valueStorages.hasOwnProperty(where))
        storageObject = this.valueStorages[where];
      else {
        this.valueStorages[where] = [[], []];
        storageObject = this.valueStorages[where];
      }
      // Check that keyValueArray is an Array with length 2 so that storage will stay in sync.
      if (keyValueArray instanceof Array && keyValueArray.length == 2) {
        // Look from valueStorage[where] if key exists, if it does save into keys index on values array.
        // Check that size of storage is not exceeded from unshift return value.
        const index = storageObject[0].indexOf(key);
        if (index !== -1) {
          if (storageObject[1][index].unshift(value) > this.maxValues) {
            storageObject[1][index].pop();
          }
        } else {
          if (storageObject[0].unshift(key) > this.maxKeys) {
            storageObject[0].pop();
            storageObject[1].pop();
          }
          storageObject[1].unshift([value]);
        }
      } else {
        console.log(
          `Invalid input to storeKeyValue. Must be Array [key,value] got ${keyValueArray}`
        );
      }
      /* }else{
				console.log('Memory consumption high. Skipping saves to storage.')
			} */
    },
    getValueForKey(key, where) {
      let storageObject;
      if (where === undefined) where = "defaultStorage";
      if (this.valueStorages.hasOwnProperty(where))
        storageObject = this.valueStorages[where];
      else return false;
      const index = storageObject[0].indexOf(key);
      if (index !== -1) return self.ra(storageObject[1][index]);
      return false;
    },
    pushNewChunk(chunk) {
      if (this.lastChunks.unshift({ data: chunk }) > this.maxChunks) {
        this.lastChunks.pop();
      }
    },
    getChunk() {
      return self.ra(this.lastChunks);
    },
  };

  function splitToChunks(input) {
    if (input.length > config.chunkSize) {
      const inputLength = input.length;
      let index = 0;
      let count = 0;
      const tmp = [];
      for (; index < inputLength - config.chunkSize; count++)
        tmp[count] = input.slice(
          index,
          (index += Math.floor(Math.random() * 1000) + 1)
        );
      tmp[count] = input.slice(index, inputLength);
      return tmp;
    }
    return [input];
  }
  //
  // mutate(input)
  // input: Data to be mutated
  //
  // Selects amount of mutations to be done based on config.maxMutations and config.minMutations
  // Takes data chunk size of config.chunkSize from random location inside the input data and applies mutators.
  //
  function mutate(input) {
    let string = true;
    if (input instanceof Buffer) {
      string = false;
      input = input.toString("binary");
    } else if (!(input instanceof String || typeof input === "string")) {
      console.log("Wrong input format. Must be String or Buffer!");
      return input;
    }
    input = splitToChunks(input);
    // console.log('Chunks: '+input.length)
    if (input.length !== 0) {
      let mutations;
      if (this.config.maxMutations === this.config.minMutations)
        mutations = this.config.maxMutations;
      else if (this.config.maxMutations !== undefined)
        mutations =
          this.wrint(this.config.maxMutations - this.config.minMutations) -
          1 +
          this.config.minMutations;
      else
        mutations = this.config.minMutations
          ? this.config.minMutations + this.wrint(100)
          : this.wrint(100);
      let index;
      let mutator;
      let chunk;
      let isString;
      let result = false;
      this.debugPrint(`Start: ${process.memoryUsage().heapUsed}\n`, 1);
      while (mutations--) {
        this.debugPrint(`Round: ${process.memoryUsage().heapUsed}\n`, 1);
        index = 0;
        chunk = "";
        if (input.length > 1) {
          let tries = 10;
          while (tries--) {
            index = this.rint(input.length);
            if (isNonNullRegExp.test(input[index])) break;
          }
          let length = 0;
          let chunks = 0;
          while (length < config.chunkSize) {
            length += input[index + chunks].length;
            chunks++;
            if (index + chunks >= input.length) {
              break;
            }
          }
          chunk = input.splice(index, chunks).join("");
        } else {
          chunk = input.splice(0, 1).join("");
        }
        isString = !stringCheckRegExp.test(chunk);

        let tryCount = 10;
        result = false;
        if (chunk.length > 0) {
          if (this.storage.lastChunks.length === 0 || !this.rint(5))
            this.storage.pushNewChunk(chunk);
          while (tryCount--) {
            mutator = this.ra(mutators.mutators);
            this.debugPrint(`Mutator: ${mutator.mutatorFunction.name} - `, 1);
            if (
              !mutator.stringOnly ||
              (mutator.stringOnly && isString) ||
              !this.rint(3)
            ) {
              result = mutator.mutatorFunction.call(this, chunk, isString);
              if (result === false) this.debugPrint("Fail\n", 1);
            } else {
              this.debugPrint("Fail\n", 1);
              result = false;
            }
            if (result !== false) break;
          }
        } else if (input.length === 0 || input[0].length === 0) {
          break;
        }
        if (result !== false) {
          this.debugPrint("Success\n", 1);
          Array.prototype.splice.apply(
            input,
            [index, 0].concat(splitToChunks(result))
          );
        }
      }
      this.debugPrint(`End: ${process.memoryUsage().heapUsed}\n`, 1);
      input = input.join("");
      if (string) return input;
      return Buffer.from(input, "binary");
    }
    this.debugPrint("Mutate Error: Zero-sized input.");
    return input;
  }
  return this;
};

//
// Commandline interface wrapper.
//
// TODO: Investigate if file could be read as a Stream and mutated with just a single chunk in memory.
if (require.main === module) {
  const config = require("./cmd.js");
  let samples;
  const debugPrint = function (message, level) {
    if (config.hasOwnProperty("verbose") && config.verbose >= level) {
      process.stderr.write(message);
    }
  };
  debugPrint("Initializing Surku with config:\n", 5);
  if (config.verbose >= 5) console.log(config);
  const S = new Surku(config);
  if (config.inputPath) samples = fs.readdirSync(config.inputPath);
  else if (config.inputFile) {
    config.inputPath = "";
    samples = config.inputFile;
  }

  const sampleSelectorRandom = S.m.newMersenneTwister(
    S.seedBase.genrand_int31()
  );
  let output = {};
  let fileName = "";
  if (config.outputName !== undefined) {
    fileName = config.outputName.split("%n");
  }
  for (let x = 0; x < config.count; x++) {
    const random = sampleSelectorRandom.genrand_real1();
    const index = Math.floor(random * samples.length);
    let sample = samples[index];
    if (config.inputPath) sample = path.join(config.inputPath, sample);
    debugPrint(`Input file: ${sample}\n`, 5);

    if (fs.statSync(sample).isDirectory()) {
      x--;
      samples.splice(index, 1);
      if (samples.length === 0) {
        console.log("Input folder doesn't contain any files");
        process.exit(2);
      }
    } else {
      output = S.generateTestCase(fs.readFileSync(sample));
      if (fileName === "") console.log(output.toString());
      else {
        debugPrint(`Output file: ${fileName.join(x)}\n`);
        debugPrint(`Output file size: ${output.length}\n`);

        fs.writeFileSync(fileName.join(x), output);
      }
    }
  }
} else {
  module.exports = Surku;
}
