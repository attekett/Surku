// I confess, I have no idea anymore what this code does, but it works.
// TODO:UnitTests!!
let debug = false;
function debugPrint(msg) {
  if (debug) console.log(msg);
}

const tagStartRegExp = /<\w/g;
const tagEndRegExp = /<\/\w/g;
function parseXMLTagStarts(input, currentIndex, collection) {
  const firstSpace = input.indexOf(" ", currentIndex);
  const firstClosure = input.indexOf(">", currentIndex);
  // debugPrint('fs: '+firstSpace)
  // debugPrint('fc: '+firstClosure)
  let tagNameEnd;
  if (firstSpace === -1 || firstClosure === -1)
    tagNameEnd = firstSpace === -1 ? firstClosure : firstSpace;
  else tagNameEnd = firstSpace < firstClosure ? firstSpace : firstClosure;
  // debugPrint(tagNameEnd)
  const tagName = input.substring(currentIndex + 1, tagNameEnd);
  // debugPrint('TagName: '+tagName)
  if (collection.hasOwnProperty(tagName)) {
    collection[tagName].starts.push(currentIndex - 1);
    collection[tagName].startTagClosure.push(firstClosure + 1);
    tagStartRegExp.lastIndex = currentIndex + 1;
    const re = tagStartRegExp.exec(input);
    if (re !== null)
      collection = parseXMLTagStarts(input, re.index, collection);
  } else {
    collection[tagName] = {
      starts: [currentIndex - 1],
      ends: [],
      startTagClosure: [firstClosure + 1],
    };
    tagStartRegExp.lastIndex = currentIndex + 1;
    const re = tagStartRegExp.exec(input);
    if (re !== null) {
      collection = parseXMLTagStarts(input, re.index, collection);
    }
  }
  return collection;
}

function parseXMLTagEnds(input, currentIndex, collection) {
  const firstClosure = input.indexOf(">", currentIndex); // searchWithIgnore(input,'>',currentIndex);
  // debugPrint('fc: '+firstClosure)
  // debugPrint(firstClosure)
  const tagName = input.substring(currentIndex + 2, firstClosure);
  // debugPrint('EndTagName: '+tagName)
  if (collection.hasOwnProperty(tagName)) {
    collection[tagName].ends.push(currentIndex);
    tagEndRegExp.lastIndex = currentIndex + 1;
    const re = tagEndRegExp.exec(input);
    if (re !== null) {
      // debugPrint(re)
      parseXMLTagEnds(input, re.index, collection);
    }
  } else {
    tagEndRegExp.lastIndex = currentIndex + 1;
    const re = tagEndRegExp.exec(input);
    if (re !== null) {
      parseXMLTagEnds(input, re.index, collection);
    }
  }
}

function filterTagList(collection) {
  let tag;
  for (tag in collection) {
    while (
      collection[tag].starts[collection[tag].starts.length - 1] >
      collection[tag].ends[collection[tag].ends.length - 1]
    )
      collection[tag].starts.pop();
    while (collection[tag].starts[0] > collection[tag].ends[0])
      collection[tag].ends.shift();

    if (collection[tag].starts.length != collection[tag].ends.length) {
      while (collection[tag].starts.length > collection[tag].ends.length)
        collection[tag].starts.shift();
      while (collection[tag].starts.length < collection[tag].ends.length)
        collection[tag].ends.pop();
    }
    if (collection[tag].starts.length == 0 && collection[tag].ends.length == 0)
      delete collection[tag];
    else collection[tag].ends.reverse();
  }
  return collection;
}

function mutate1(input, tags) {
  debugPrint("Mutate1");
  const tag = this.ra(tags);
  const tagIndex = this.rint(tag.starts.length);
  const stringStartIndex = tag.starts[tagIndex];
  const stringEndIndex = tag.ends[tagIndex] + 3 + tag.name.length;
  let rounds = this.wrint(20);
  const where = this.rint(2) ? this.ra(tag.ends) : this.ra(tag.startTagClosure);
  let string = "";
  const what = input.substring(stringStartIndex, stringEndIndex);
  while (rounds--) {
    string += what;
  }

  return input.substring(0, where) + string + input.substring(where);
}

function mutate2(input, tags) {
  debugPrint("Mutate2");
  const tag = this.ra(tags);
  const tagIndex = this.rint(tag.starts.length);
  const stringStartIndex = tag.startTagClosure[tagIndex];
  const stringEndIndex = tag.ends[tagIndex];
  let rounds = this.wrint(20);
  const where = this.rint(2) ? this.ra(tag.ends) : this.ra(tag.startTagClosure);
  let string = "";
  const what = input.substring(stringStartIndex, stringEndIndex);
  while (rounds--) {
    string += what;
  }

  return input.substring(0, where) + string + input.substring(where);
}

function mutate3(input, tags) {
  debugPrint("Mutate3");
  const tag = this.ra(tags);
  const tag2 = this.ra(tags);
  const tagIndex = this.rint(tag.starts.length);
  const stringStartIndex = tag.startTagClosure[tagIndex] + 1;
  const stringEndIndex = tag.ends[tagIndex];
  let rounds = this.wrint(20);
  const where = this.rint(2)
    ? this.ra(tag2.ends)
    : this.ra(tag2.startTagClosure);
  let string = "";
  const what = input.substring(stringStartIndex, stringEndIndex);
  while (rounds--) {
    string += what;
  }

  return input.substring(0, where) + string + input.substring(where);
}

function mutate4(input, tags) {
  const tag = this.ra(tags);
  const tag2 = this.ra(tags);
  const tagIndex = this.rint(tag.starts.length);
  const stringStartIndex = tag.startTagClosure[tagIndex] + 1;
  const stringEndIndex = tag.ends[tagIndex];
  let rounds = this.wrint(20);
  const where = this.rint(2)
    ? this.ra(tag2.ends)
    : this.ra(tag2.startTagClosure);
  let string = "";
  const what = input.substring(stringStartIndex, stringEndIndex);
  while (rounds--) {
    string += what;
  }

  return input.substring(0, where + 1) + string + input.substring(where + 1);
}

function calcMutatorWeights(mutators) {
  const weightedMutatorsList = [];
  for (const mutator in mutators) {
    let { weight } = mutators[mutator];
    while (weight--) {
      weightedMutatorsList.push(mutators[mutator].mutatorFunction);
    }
  }
  return weightedMutatorsList;
}

const xmlMutators = {
  mutate1: { mutatorFunction: mutate1, weight: 1 },
  mutate2: { mutatorFunction: mutate2, weight: 1 },
  mutate3: { mutatorFunction: mutate3, weight: 1 },
};

const xmlMutatorList = calcMutatorWeights(xmlMutators);

function mutateXML(input) {
  debugPrint(input);
  const collection = {};
  const firstStartTag = input.search(/<\w/);
  const firstEndTag = input.search(/<\/\w/);
  if (firstStartTag === -1 || firstEndTag === -1) return false;
  // debugPrint(firstStartTag)
  parseXMLTagStarts.call(this, input, firstStartTag, collection);
  parseXMLTagEnds.call(this, input, firstEndTag, collection);
  filterTagList.call(this, collection);
  const tags = [];
  for (const test in collection) {
    collection[test].name = test;
    tags.push(collection[test]);
  }
  if (tags.length === 0) return 1;
  input = this.ra(xmlMutatorList).call(this, input, tags);
  return input;
}

if (require.main === module) {
  const fs = require("fs");
  const fileNames = fs.readdirSync("./testFiles");
  let fileName = "";
  const self = this;
  if (process.argv.indexOf("--debug") != -1) debug = true;
  this.rint = function (max) {
    return Math.floor(Math.random() * max);
  };
  this.ra = function (array) {
    return array[self.rint(array.length)];
  };
  this.wrint = function (max) {
    if (max === undefined) max = 2000;
    const num = Math.random() * 3;
    const div = Math.random() + Number.MIN_VALUE; // Avoid divide by zero.
    return (Math.floor(num / div) ? Math.floor(num / div) : 1) % max;
  };
  fileName = fileNames.pop();
  while (fileName !== undefined) {
    console.log(`File: ${fileName}`);
    console.log(
      mutateXML.call(
        this,
        fs.readFileSync(`./testFiles/${fileName}`, "binary"),
        true
      )
    );
    console.log("");
    console.log("");
    console.log("");
    console.log("");
    fileName = fileNames.pop();
  }
}

module.exports = mutateXML;
