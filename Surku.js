#!/usr/bin/env node

var fs 		 = require('fs');
var Surku = function (user_config){
	this.m 		  = require('./mersenne-twister.js')
	var mutators = require('./mutators.js')
	var self=this
	var stringCheckRegExp=/[\u0000-\u0005]+/
	var config={
		maxMutations:10,
		minMutations:1,
		chunkSize:2000,
		useOnly: undefined,
		seed: undefined,
		verbose: undefined
	}
	this.config=config
	if(user_config !== undefined){
		for(var key in user_config)
			this.config[key]=user_config[key]
	}
	
	if(this.config.useOnly!==undefined && this.config.useOnly instanceof Array){
		mutators.useOnlyMutators(this.config.useOnly)
	}

	this.ra=function (array){
		if(Array.isArray(array))
			return array[this.rint(array.length)]
		else{
			console.error("ra: called with non-array")
			console.error(array)
			return false
		}
	}

	this.rint=function (max){
		if(max || max==0){
			var rintOutput=Math.floor(this.r.genrand_real1()*max)
			if(Number.isNaN(rintOutput))
				console.error("rint: called with non-number "+max+" results to "+rintOutput)
			return rintOutput
		}
		else{
			console.error("rint: called with "+max)
			return false
		}
	}

	this.wrint=function(max){
		if(max===undefined)
			max=2000
		var num=this.r.genrand_real1()*3
		var div=this.r.genrand_real1()+Number.MIN_VALUE //Avoid divide by zero.
		return (Math.floor((num/div)) ? Math.floor((num/div)) : 1) % max
	}

	var seedBase  = this.m.newMersenneTwister(self.config.seed)
	this.seedBase=seedBase

	this.generateTestCase=function(input){
		var testCase
		this.config=self.config
		this.storage=self.storage
		this.debugPrint= function(message,level){
			if(this.config.hasOwnProperty('verbose') && this.config.verbose>=level){
				process.stderr.write(message)
			}
		}
		this.ra=self.ra

		this.rint=self.rint

		this.r=self.m.newMersenneTwister(seedBase.genrand_int31())
		return mutate.call(this,input)
	}
	
	//
	//Hold kind of linked list of stored data
	//
	/*	
		storage:{
			where:[
				[key1,key2],
				[[key1value1,key1value2],[key2value2]]
			]	
		} 
	*/
	this.storage={
		maxKeys:100,
		maxValues:30,
		valueStorages:{},
		storeKeyValuePair:function(keyValueArray,where){
			//Check if valueStorage name was provided
			var key=keyValueArray[0]
			var value=keyValueArray[1]
			//if(process.memoryUsage().heapUsed<700*1024*1024){
				if(where===undefined)
					where='defaultStorage'
				//If valueStorage named with value of where exists use it, else create empty one.
				if(this.valueStorages.hasOwnProperty(where))
					var storageObject=this.valueStorages[where]
				else{
					this.valueStorages[where]=[[],[]]
					var storageObject=this.valueStorages[where]
				}
				//Check that keyValueArray is an Array with length 2 so that storage will stay in sync.	
				if((keyValueArray instanceof Array) && keyValueArray.length==2){
					//Look from valueStorage[where] if key exists, if it does save into keys index on values array.
					//Check that size of storage is not exceeded from unshift return value.
					var index=storageObject[0].indexOf(key)
					if(index!=-1){
						if(storageObject[1][index].unshift(value)>this.maxValues){
							storageObject[1][index].pop()
						}
					}
					else{
						if(storageObject[0].unshift(key)>this.maxKeys){
							storageObject[0].pop();
							storageObject[1].pop();
						}
						storageObject[1].unshift([value])
					}
				}
				else{
					console.log('Invalid input to storeKeyValue. Must be Array [key,value] got '+keyValueArray)
				}
			/*}else{
				console.log('Memory consumption high. Skipping saves to storage.')
			}*/
		},
		getValueForKey:function(key,where){
			if(where===undefined)
				where='defaultStorage'	
			if(this.valueStorages.hasOwnProperty(where))
				var storageObject=this.valueStorages[where]
			else
				return false
			var index=storageObject[0].indexOf(key)
			if(index!=-1)
				return self.ra(storageObject[1][index])
			else 
				return false
		}
	}

	function splitToChunks(input){
		if(input.length>config.chunkSize){
			var inputLength=input.length;
			var index=0;
			var count=0;
			var tmp=[]
			for(; index<inputLength-config.chunkSize;count++)
				tmp[count]=input.slice(index,index+=(Math.floor(Math.random()*500)+1))
			tmp[count]=input.slice(index,inputLength)
			return tmp
		}
		else{
			return [input]
		}
	}
	//
	//mutate(input)
	//input: Data to be mutated
	//
	//Selects amount of mutations to be done based on config.maxMutations and config.minMutations
	//Takes data chunk size of config.chunkSize from random location inside the input data and applies mutators.
	//
	function mutate(input){	
		var string=true;
		if(input instanceof Buffer){
			string=false
			input=input.toString('binary')
		}
		else if(!(input instanceof String || typeof(input)=='string')){
			console.log("Wrong input format. Must be String or Buffer!")
			return input	
		}
		var inputLength=input.length
		input=splitToChunks(input)
		//console.log('Chunks: '+input.length)
		if(input.length!=0){
			var mutations
			if(this.config.maxMutations!==undefined)	
				mutations=this.rint(this.config.maxMutations-this.config.minMutations)+this.config.minMutations
			else
				mutations=this.config.minMutations ? (this.config.minMutations+this.wrint(100)) : this.wrint(100)
			var index;
			var mutator;
			var chunk;
			var isString;	
			var result=false;
			this.debugPrint('Start: '+process.memoryUsage().heapUsed+'\n',1)
			while(mutations--){
					this.debugPrint('Round: '+process.memoryUsage().heapUsed+'\n',1)
					index=0;
					if(input.length>1){
						index=this.rint(input.length)
						var length=0
						var chunks=0
						while(length<config.chunkSize){
							length+=input[index+chunks].length
							chunks++
							if((index+chunks)==input.length){
								break;
							}
						}
						chunk=input.splice(index,chunks).join('')
					}
					else{
						chunk=input.join('')
					}
					isString=!stringCheckRegExp.test(chunk)
					var tryCount=10
					while(tryCount--){
					mutator=this.ra(mutators.mutators)
					this.debugPrint('Mutator: '+mutator.mutatorFunction.name+' - ',1)
					if(!mutator.stringOnly || (mutator.stringOnly && isString) || !this.rint(10)){
						result=mutator.mutatorFunction.call(this,chunk,isString)
						if(result===false)
							this.debugPrint('Fail\n',1)
					}
					else{
						this.debugPrint('Fail\n',1)
						result=false
					}
					if(result!==false)
						break;
					}
					if(result === false){
						this.debugPrint('Fail\n',1)
						mutations++
					}
					else{ 
						this.debugPrint('Success\n',1)
						Array.prototype.splice.apply(input,[index,0].concat(splitToChunks(result)))
					}
					//this.debugPrint('File size: '+input.length+'\n',1)
					
			}
			this.debugPrint('End: '+process.memoryUsage().heapUsed+'\n',1)
			input=input.join('')
			if(string)
				return input
			else
				return (new Buffer(input,'binary'))
		}
		else{
			console.error('Mutate Error: Zero-sized input.');
			return input
		}
	}
	return this
}	

//
//Commandline interface wrapper.
//
//TODO: Investigate if file could be read as a Stream and mutated with just a single chunk in memory.
if(require.main===module){
	var config=require('./cmd.js')
	debugPrint= function(message,level){
		if(config.hasOwnProperty('verbose') && config.verbose>=level){
			process.stderr.write(message)
		}
	}
	debugPrint('Initializing Surku with config:\n',5)
	if(config.verbose>=5)
		console.log(config)
	var S=new Surku(config)
	if(config.randomizeWeights)
		S.mutators.randomizeWeights()
	if(config.inputPath)
		var samples=fs.readdirSync(config.inputPath);
	else if(config.inputFile){
		config.inputPath=""
		var samples=[config.inputFile]
	}

	var sampleSelectorRandom=S.m.newMersenneTwister(S.seedBase.genrand_int31())
	var output={}
	var fileName=''
	var failCount=0;
	if(config.outputName!==undefined){
		fileName=config.outputName.split('%n')
	}
	for(var x=0; x<config.count;x++){
		var index=Math.floor(sampleSelectorRandom.genrand_real1()*samples.length)
		var sample=samples[index]
		debugPrint('Input file: '+config.inputPath+'/'+sample+'\n',5)
		if(fs.statSync(config.inputPath+'/'+sample).isDirectory()){
			x--
			samples.splice(index,1)
			if(samples.length==0){
				console.log("Input folder doesn't contain any files")
				process.exit(2)
			}
		}	
		else{
			output=S.generateTestCase(fs.readFileSync(config.inputPath+'/'+sample))
			if(fileName=='')
				console.log(output.toString())
			else{
				debugPrint('Output file: '+fileName.join(x)+'\n')
				debugPrint('Output file size: '+output.length+'\n')

				fs.writeFileSync(fileName.join(x),output)
			}
		}

	}
}
else{
	module.exports=Surku
}