
function cmd(){
	var path=require('path')
	var fs=require('fs')
	var self=this
	this.surkuConfig={
		maxMutations:20,
		minMutations:2,
		useOnly: undefined,
		seed: undefined,
		count: 1,
		outputName: undefined,
		inputPath: undefined,
		verbose: undefined
	}

	var debugPrint= function(message,level){
		if(self.surkuConfig.hasOwnProperty('verbose') && self.surkuConfig.verbose>=level){
			process.stderr.write(message)
		}
	}

	if(process.argv.indexOf('-v') != -1 || process.argv.indexOf('--verbose') != -1 )
		this.surkuConfig.verbose=5

	debugPrint('Args: \n',1)
	debugPrint(process.argv.toString().replace(/,/g,' ')+'\n',1)


	//These are sort of linked lists
	// 
	/*	
		shortArgs=[
			[argument1,			argument2],
			[argument1Function, argument2Function]
		]
	*/
	var shortArgs=[
		['-h','-a','-V','-o','-n','-s','-m','-p','-g','-M','-r','-l','-v','-Mm','-mm'],
		[	outputHelp,
			outputAbout,
			outputVersion,
			parseOutputArg,
			parseCount,
			parseSeed,
			notImplementedYet,
			notImplementedYet,
			notImplementedYet,
			notImplementedYet,
			notImplementedYet,
			notImplementedYet,
			setVerbose,
			setMaxMutations,
			setMinMutations
		]
	]

	var longArgs=[
		['--help','--about','--version','--output','--count','--seed','--mutations','--patterns','--generators','--meta','--recursive','--list','--verbose','--maxmutations','--minmutations'],
		[	outputHelp,
			outputAbout,
			outputVersion,
			parseOutputArg,
			parseCount,
			parseSeed,
			notImplementedYet,
			notImplementedYet,
			notImplementedYet,
			notImplementedYet,
			notImplementedYet,
			notImplementedYet,
			setVerbose,
			setMaxMutations,
			setMinMutations
			]
	]

	var argDescriptions=[
		[', show this thing'],
		[', what is this thing'],
		[', show version info'],
		[' <arg>, file name pattern for outputs, e.g. output/fuzz-%n.foo, required'],
		[' <arg>, how many files to generate, defaults to 1'],
		[' <arg>, which seed to use, defaults to random'],
		[' <arg>, which mutators to use, for defaults use argument "-l" or "--list"'],
		[],
		[],
		[],
		[],
		[', list default mutators'],
		[', verbosed console-outputs'],
		[' <arg>, set max mutations per output, default 20'],
		[' <arg>, set min mutations per output, default 2'],
	]

	function outputHelp(){
		console.log("This is Surku v0.1.1 Help.")
		console.log("Usage: node Surku.js [arguments] [file ...]")
		for(var x=0;x<shortArgs[0].length;x++){
			if(argDescriptions[x]!=''){
				console.log(shortArgs[0][x]+' | '+longArgs[0][x]+argDescriptions[x])
			}
		}
		process.exit(1)
	}
	if(process.argv[2]===undefined){
		outputHelp()
		process.exit(1)
	}

	function outputAbout(){
		debugPrint('Surku about:',5)
		console.log('Surku is a general purpose fuzzer')
		console.log('Its purpose is to introduce malformations into sample files,')
		console.log('in order to trigger errors in program under test.')
		console.log('In default only general mutators are available,')
		console.log('but new mutators can be added by user.')
		console.log('')
		console.log('For more info see doumentation in:')
		console.log('http://code.google.com/p/ouspg/')
		console.log('')
		console.log('Surku as written by Atte Kettunen at OUSPG')	
		process.exit(1)
	}

	function outputVersion(){
		console.log('Surku version 0.1')
		process.exit(1)
	}

	function parseOutputArg(cmd,index){
		debugPrint('parseOutputArg\n',5)
		var outputExpression=process.argv[index+1]
		var resolvedPath=path.resolve(outputExpression)
		var pathOnly=path.dirname(resolvedPath)
		var baseName=path.basename(resolvedPath)
		console.log("Output directory: "+pathOnly)
		if(!fs.existsSync(pathOnly)){
			console.log('Output path does not exist.')
			process.exit(2)
		}
		else if(baseName.indexOf("%n")==-1){
			console.log('Must have output filename syntax. e.g. fuzz-%n.html')
			process.exit(2)
		}
		else{
			cmd.surkuConfig.outputName=resolvedPath
		}

	}

	function parseCount(cmd,index){
		debugPrint('parseCount\n',5)
		var count=process.argv[index+1]
		if(!isNaN(parseInt(count))){
			cmd.surkuConfig.count=count
		}
		else{
			console.log('Invalid output file count.')
			process.exit(2)
		}
	}

	function parseSeed(cmd,index){
		debugPrint('parseSeed\n',5)
		var seed=process.argv[index+1]
		if(!isNaN(parseInt(seed))){
			cmd.surkuConfig.seed=seed
		}
		else{
			console.log('Invalid seed.')
			process.exit(2)
		}
	}

	function setMaxMutations(cmd,index){
		debugPrint('setMaxMutations: '+process.argv[index+1]+'\n',5)
		var mutations=process.argv[index+1]
		if(!isNaN(parseInt(mutations)) && parseInt(mutations)>0){
			cmd.surkuConfig.maxMutations=mutations
		}
		else{
			console.log('Invalid max mutations value.')
			process.exit(2)
		}
	}

	function setMinMutations(cmd,index){
		debugPrint('setMinMutations: '+process.argv[index+1]+'\n',5)
		var mutations=process.argv[index+1]
		if(!isNaN(parseInt(mutations)) && parseInt(mutations)>0){
			cmd.surkuConfig.minMutations=mutations
		}
		else{
			console.log('Invalid min mutations value.')
			process.exit(2)
		}
	}

	function setVerbose(cmd,index){
		debugPrint('setVerbose\n',5)
		cmd.surkuConfig.verbose=5
	}

	function notImplementedYet(cmd,index){
		debugPrint('Not implemented yet.\n')
		console.log('Argument '+ process.argv[index]+' is not implemented yet.')
	}

	process.argv.forEach(function(arg,index){
		var indexShort=shortArgs[0].indexOf(arg)
		var indexLong =longArgs[0].indexOf(arg)
		if(indexShort!=-1){
			shortArgs[1][indexShort](self,index)
		}
		if(indexLong!=-1){
			longArgs[1][indexLong](self,index)
		}
	})

	if(parseInt(self.surkuConfig.maxMutations)<parseInt(self.surkuConfig.minMutations)){
		console.log('Set max mutations is smaller than set min mutations.')
		process.exit(2)
	}

	if(process.argv[process.argv.length-2]!='-o' && process.argv[process.argv.length-2]!='--output'){
		var inputPath=path.resolve(process.argv[process.argv.length-1])
		debugPrint('inputPath: '+inputPath+'\n',5)
		if(fs.existsSync(inputPath)){
			if(fs.statSync(inputPath).isDirectory()){
				this.surkuConfig.inputPath=inputPath
			}
			else{
			    this.surkuConfig.inputFile=inputPath	
			}
		}
		else{
			console.log('Input path '+inputPath+' does not exist.')
			process.exit(2)
		}
	}
	else{
		console.log('No input path given.')
		process.exit(2)
	}
	

	return this.surkuConfig
}



module.exports=cmd()
