var Surku=require('../Surku.js')

function ra(array){
	return array[Math.floor(Math.random()*array.length)]
}
function rint(max){
	return Math.floor(Math.random()*max)	
}

function verifySeed(input,seed,verbose){
	var rounds=10
	var outputBuffer=[]
	var failed=false
	while(rounds--){
		var selfTest=new Surku({seed:seed,verbose:verbose})

		if(input=='string')
			outputBuffer.push(selfTest.generateTestCase(testString))
		else
			outputBuffer.push(selfTest.generateTestCase(new Buffer(testString)))
	}
	for(var x=0;x<9;x++){
		if(outputBuffer[x].toString()!=outputBuffer[1].toString()){
			console.log('Test failed.\n'+outputBuffer[x]+'!='+outputBuffer[x+1])
			failed=true
			break;
		}
	}
	if(!failed){
		console.error('Test passed. All 10 outputs were identical.')
		console.error('Output length: '+outputBuffer[0].length)
		console.log('Output:\n'+outputBuffer[0]+'\n')
	}
}


		
if(process.argv[2])
	var testString=process.argv[2]
else
	var testString='Surku on Tove Janssonin Muumi-teoksissa esiintyvä pieni ja alakuloinen koira.\nSe esiintyy vuonna 1958 ilmestyneessä Taikatalvi-kirjassa.'
var seed=Math.floor((Math.random()*10000))
var selfTest=new Surku()
console.error('Initializing new Surku with default config.\nEnabling Surku verbose. (level 0)')
selfTest.config.verbose=0
if(process.argv.indexOf("--debug")!=-1){
	selfTest.config.verbose=5
	var verbose=5;
}
console.error(selfTest.config)
selfTest.config.seed=seed
console.log('\n\nRunning with input-data: \n"'+testString+'"\n')
console.error('Input-data length: '+testString.length+'\n')

console.error('Running 10 times with seed '+seed)
verifySeed('string',seed,verbose)
seed=Math.floor((Math.random()*10000))
console.error('Changing seed to '+seed)
selfTest.config.seed=seed
verifySeed('string',seed,verbose)
selfTest.config.seed=undefined

console.error('Running with random seed')	
console.log('Output: \n'+selfTest.generateTestCase(testString)+'\n')
console.error('Running with random seed')
console.log('Output: \n'+selfTest.generateTestCase(testString)+'\n')

	