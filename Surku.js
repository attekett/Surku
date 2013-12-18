#!/usr/bin/env node

/*

Surku v 0.1.1


*/

var fs 		 = require('fs');
var Surku = function (user_config){
	this.m 		  = require('./mersenne-twister.js')
	this.mutators = require('./mutators.js')
	var self=this
	var stringCheckRegExp=/[\u0000-\u0005]+/
	this.config={
		maxMutations:20,
		minMutations:1,
		chunkSize:2000,
		useOnly: undefined,
		seed: undefined,
		verbose: undefined
	}

	if(user_config !== undefined){
		for(var key in user_config)
			this.config[key]=user_config[key]
	}
	
	if(this.config.useOnly!==undefined && this.config.useOnly instanceof Array){
		this.mutators.useOnlyMutators(this.config.useOnly)
	}

	this.ra=function (array){
		if(array)
			return array[this.rint(array.length)]
		else
			return false
	}

	this.rint=function (max){
		var rintOutput=Math.floor(this.r.genrand_real1()*max)
		return rintOutput
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
		
		if(input instanceof Buffer){
			input=new Buffer((mutate.call(this,input.toString('binary'))),'binary')
			return input
		}
		else if(input instanceof String || typeof(input)=='string'){
			return mutate.call(this,input)
		}
		else{
			console.log("Wrong input format. Must be String or Buffer!")
		}
		
	}
	
	//
	//Hold kind of linked list of stored data
	//
	/*	
		storage:{
			where:[
				[key1,key2],
				[[key1value1,key1value2],key2valueq]
			]	
		} 
	*/
	this.storage={
		maxKeys:400,
		maxValues:50,
		valueStorages:{},
		storeKeyValuePair:function(keyValueArray,where){
			//Check if valueStorage name was provided
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
				var index=storageObject[0].indexOf(keyValueArray[0])
				if(index!=-1){
					if(storageObject[1][index].unshift(keyValueArray[1])>this.maxValues){
						storageObject[1][index].pop()
					}
				}
				else{
					if(storageObject[0].unshift(keyValueArray[0])>this.maxKeys){
						storageObject[0].pop();
						storageObject[1].pop();
					}
					storageObject[1].unshift([keyValueArray[1]])
				}
			}
			else{
				console.log('Invalid input to storeKeyValue. Must be Array [key,value] got '+keyValueArray)
			}
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

	//
	//mutate(input)
	//input: Data to be mutated
	//
	//
	//
	function mutate(input){	
		if(input.length!=0){
			if(this.config.maxMutations!==undefined)	
				var mutations=this.rint(this.config.maxMutations-this.config.minMutations)+this.config.minMutations
			else
				var mutations=this.config.minMutations ? (this.config.minMutations+this.wrint(100)) : this.wrint(100)
			
			this.debugPrint('Running mutate with seed: '+self.config.seed+"\n",1)
			
			this.debugPrint('Running with n mutations: '+mutations+"\n",1)
			while(mutations--){
					var index=0;
					if(input.length>this.config.chunkSize)
						index=this.rint(input.length-this.config.chunkSize)
					var mutator=this.ra(this.mutators.mutators)
					var chunk=input.substring(index,index+this.config.chunkSize)
					var isString=!stringCheckRegExp.test(chunk)
					this.debugPrint('Mutator: '+mutator.name+' - ',1)
					result=(mutator.call(this,chunk,isString))
					if(result === false){
						this.debugPrint('Fail\n',1)
						mutations++
					}
					else{
						this.debugPrint('Success\n',1)
						input=input.substring(0,index)+result+input.substring(index+this.config.chunkSize)			
					}
			}
			return input
		}
		else{
			console.error('Mutate Error: Zero-sized input.');
			return input
		}
	}
	return this
}	

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

	
	var sampleSelectorRandom=S.m.newMersenneTwister(S.seedBase.genrand_int31())
	var output={}
	var fileName=''
	var failCount=0;
	if(config.outputName!==undefined){
		fileName=config.outputName.split('%n')
	}
	if(config.inputPath){
		var samples=fs.readdirSync(config.inputPath);
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
					fs.writeFileSync(fileName.join(x))
				}
			}

		}
	}
	else{
		var input=fs.readFileSync(config.inputFile)
		for(var x=0; x<config.count;x++){
				output=S.generateTestCase(input)
				if(fileName=='')
					console.log(output.toString())
				else{
					debugPrint('Output file: '+fileName.join(x)+'\n')
					fs.writeFileSync(fileName.join(x))
				}
		}
	}
}
else{
	module.exports=Surku
}