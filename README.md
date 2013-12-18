Surku
=====

Surku is a mutation-based general purpose fuzzer, written in JavaScript. Surku runs on
Node.js platform and is tested on version 0.8.x and 0.10.x.

If you have any ideas for improvements or want to contribute new mutator(s) contact me via 
IRC (attekett  irc.freenode.com)
twitter (@attekett)
email ( attekett(at)gmail.com) 

Files in this release:

	Surku.js: The core implementation of Surku

	cmd.js: Commandline parser

	mersenne-twister.js: Random number generator

	mutators.js: Contains default mutators and Surku.mutators API

	generators.js: Contains some prewritten random number generators.

	xmlMutator.js: xml-mutations

	Examples: Contains some basic examples what can be done with Node.js and Surku


Commandline interface:

Implemented:

	-h | --help, show this thing

	-a | --about, what is this thing
	
	-V | --version, show version info
	
	-o | --output <arg>, file name pattern for outputs, e.g. output/fuzz-%n.foo, required
	
	-n | --count <arg>, how many files to generate, defaults to 1
	
	-s | --seed <arg>, which seed to use, defaults to random
	
	-v | --verbose, verbosed console-outputs
	
	-Mm | --maxmutations <arg>, set max mutations per output, default 20
	
	-mm | --minmutations <arg>, set min mutations per output, default 2


Not implemented yet:

	-m | --mutations <arg>, which mutators to use, for defaults use argument "-l" or "--list"

	-l | --list, list default mutators


Usage examples:
	
	#stdout output
	:/Surku$ echo "Hello Fuzz..." > test.txt
	:/Surku$ node Surku.js -Mm 2 -mm 1 ./test.txt
			 Hell���c㚶3��Ggo Fuzz...

	:/Surku$ node Surku.js -Mm 2 -mm 1 ./test.txt
			 Hello Fuzz..z...

	:/Surku$ node Surku.js -Mm 2 -mm 1 ./test.txt
			 Hello Fuzz�..

	#Generate multiple files into folder ./output		 
	:/Surku$ node Surku.js -n 10 -o ./output/fuzz-%n.txt ./test.txt

Application interface:

Through application interface you can dynamically add and remove mutators and change probabilities for mutators.

Simple init without specific configuration:

	var Surku=require('./Surku.js')
	var newGenerator=new Surku()
	var testCase=newGenerator.generateTestCase('Hello Fuzz World')
	console.log(testCase)


Init with specific configuration - Creates new Surku instance with max and min mutations per testcase set to 1 :

	var Surku=require('./Surku.js')
	var newGenerator=new Surku({maxMutations:1,minMutations:1})
	var testCase=newGenerator.generateTestCase('Hello Fuzz World')
	console.log(testCase)

Possible config-object values:
	
	maxMutations - indicates how many mutations at max are done per test case, defaults to 20
	minMutations - indicates how many mutations at least are done per test case, defaults to 2,
	useOnly - if set, specifies what mutators are used, must contain an array of mutator names. default value, undefined
	seed - if set, defines seed which with the random generator is initialized with. default value, undefined
		   if not set, the random generator is initialized with (new Date().getTime())+Math.floor(Math.random()*100000)
	verbose - if set, enables verbose output, set with integer with max value 5, higher value == more logging

--Mutators--

Surku mutators are function that as a first argument take in at max config.chunkSize defined mount of data from a sample file, do mutation to the data and return the result. 

The input data is in form of binary-string:
Node.js - Encoding: 'binary' - A way of encoding raw binary data into strings by using only the first 8 bits of each character.

binary-string was selected because it allows fast manipulation of both binary and string data without corruption in
conversion. Usage of normal strings limit usage of Surku into string only formats and usage of Buffers is not as simple.

There has been some talk about deprecation of binary-strings but so far it has been delayed every time.
If in some time that would actually happen I have few plans how to survive without any modifications on
mutators.

As a second argument the function is provided with isString boolean, which can be used if the mutation 
can be applied only to either string- or binary-format data.(See replaceXMLValuePair mutator in mutators.js) 
The detection of string/binary-data is done with regexping the slice of the sample for /[\u0000-\u0005]+/ 
(I know this method is far from perfect. :D ) 

Mutators can also use storage that allows data collected from previous executions to be reused in next executions.
(functionality of storage can be seen from Surku.js and is used in example replaceXMLValuePair-mutator.)

Surku also includes generators.js which contains few number-generators that are already bind to the seeding, so
that those can be used in mutators without breaking the reproducing with seed.


Available default mutators: (Note: See more specific funtionality of each mutator from mutators.js)

	freqString:
		{mutatorFunction:freqString,weight:10},
	regExpTrick:
		{mutatorFunction:regExpTrick,weight:3},
	lineCopy:
		{mutatorFunction:lineCopy,weight:3},
	lineSwap:
		{mutatorFunction:lineSwap,weight:4},
	lineMove:
		{mutatorFunction:lineMove,weight:4},
	lineRepeat:
		{mutatorFunction:lineRepeat,weight:5},
	wordCopy:
		{mutatorFunction:wordCopy,weight:2}, 
	mutateNumber:
		{mutatorFunction:mutateNumber,weight:10},
	replaceXMLValuePair:
		{mutatorFunction:replaceXMLValuePair,weight:4},	
	strCopyShort:
		{mutatorFunction:strCopyShort,weight:2},
	strCopyLong:
		{mutatorFunction:strCopyLong,weight:1},	
	strRemove:
		{mutatorFunction:strRemove,weight:2},
	insertSingleChar:
		{mutatorFunction:insertSingleChar,weight:2},	
	insertMultipleChar:
		{mutatorFunction:insertMultipleChar,weight:2},
	replaceSingleChar:
		{mutatorFunction:replaceSingleChar,weight:2},	
	replaceMultipleChar:
		{mutatorFunction:replaceMultipleChar,weight:1},
	repeatChar:
		{mutatorFunction:repeatChar,weight:2},
	repeatChars:
		{mutatorFunction:repeatChars,weight:1},
	bitFlip:
		{mutatorFunction:bitFlip,weight:4}


Add new mutators:(Note:  You must add the new mutator for every Surku instance you create, 
							or add it into mutators.js)

	var Surku=require('./Surku.js')
	var newGenerator=new Surku({maxMutations:1,minMutations:1,useOnly:[]})

	//addNewMutator:function(type,name,weight,mutatorFunction)
	newGenerator.mutators.addNewMutator('DemoMutator',5,function(input){
		var where=Math.floor(Math.random()*input.length)
		return input.slice(0,where)+'Hello World'+input.slice(where,input.length)
	})

Remove mutator: 

	var Surku=require('./Surku.js')
	var newGenerator=new Surku()

	//removeMutator:function(name)
	newGenerator.mutators.removeMutator('bitFlip')


Enable only specific mutators:

	var Surku=require('./Surku.js')
	var newGenerator=new Surku()

	//useOnlyMutators:function(arrayOfMutatorNames
	newGenerator.mutators.useOnlyMutators(['bitFlip','freqString'])

Randomize mutator weights:(Note: this method randomly set weight for each mutation into range 1-10)

	var Surku=require('./Surku.js')
	var newGenerator=new Surku()

	newGenerator.mutators.randomizeWeights()

Usage:

	var Surku=require('./Surku.js')
	var newGenerator=new Surku()

	console.log(newGenerator.generateTestCase(sample))

sample can be either String(e.g. user input) or Buffer(e.g. fs.readFileSync() output). 
