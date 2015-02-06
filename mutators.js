var randoms=require('./generators.js')

var mutatorDebug=0

//Helpers

function allIndexes(from, what) {
    var indices = new Array();
    var index = 0;
    var i=0;
    while((index = from.indexOf(what, index)) > 0) {
        indices[i] = index;
        index++
        i++;
     }
    return indices;
}

function findPlaces(str,depth,places){
	var returnObj={}
	places.forEach(function(place){
		if((place+depth)<str.length){
			var character=str[place+depth]
			if(!returnObj.hasOwnProperty(character))
				returnObj[character]={places:[place],char:character}
			else
				returnObj[character].places.push(place)
		}
	})
	return returnObj
}

function getFrequent(nodes,length){
	var returnObj={}
	var min=1+this.wrint(5)
	for(var node in nodes){	
		if(nodes[node].places.length<min){
			length=length-nodes[node].places.length
			delete nodes[node]
		}
	}
	var max=this.rint(length)
	for(var node in nodes){	
		max-=nodes[node].places.length
		if(max<=0){
			returnObj=nodes[node]
			break
		}
	}
	return returnObj
}

//String mutators

function lineCopy(input){
	var lines=input.split('\n')
	if(lines.length<3)
		return false
	lines.splice(this.rint(lines.length),0,this.ra(lines))
	return (lines.join('\n'))
}

function lineRepeat(input){
	var lines=input.split('\n')
	if(lines.length<3)
		return false
	var line=this.ra(lines)
	var rounds=this.wrint(2000);
	var lineChunk=''
	while((rounds>0) || this.rint(3)){
		rounds--
		lineChunk+=(line+'\n')
	}
	lines.splice(this.rint(lines.length),0,lineChunk)
	return (lines.join('\n'))
}

function lineSwap(input){
	var lines=input.split('\n')
	if(lines.length<3)
		return false
	var index1=this.rint(lines.length)
	var index2=this.rint(lines.length)
	var line1=lines[index1]
		lines[index1]=lines[index2]
		lines[index2]=line1
	return (lines.join('\n'))

}

function lineMove(input){
	var lines=input.split('\n')
	if(lines.length<3)
		return false
	lines.splice(this.rint(lines.length),0,lines.splice(this.rint(lines.length),1)[0])
	return (lines.join('\n'))
}

function strCopyShort(input){
	var where=this.rint(input.length)
	var start=this.rint(input.length)
	var end=start+this.wrint(100)
	var input_start=input.substring(0,where)
	var input_end=input.substring(where,input.length+1)
	var what=input.substring(start,end)
	return input_start+what+input_end
}

function strStuttr(input){
	var where=this.rint(input.length)
	var start=this.rint(input.length)
	var end=start+this.wrint(100)
	var input_start=input.substring(0,where)
	var input_end=input.substring(where,input.length+1)
	var what=input.substring(start,end)
	var chunk=""
	var rounds=this.wrint(2000);
	while((rounds>0) || this.rint(3)){
		rounds--;
		chunk+=what;
	}
	return input_start+what+input_end	
}

function strCopyLong(input){
	var where=this.rint(input.length)
	var start=this.rint(input.length)
	var end=start+this.rint(Math.floor(input.length*this.r.genrand_real1()))
	var input_start=input.substring(0,where)
	var input_end=input.substring(where,input.length+1)
	var what=input.substring(start,end)
	return input_start+what+input_end
}

function strRemove(input){
	var where=this.rint(input.length)
	var input_start=input.substring(0,where)
	var input_end=input.substring((where+this.wrint(1000-where)),input.length+1)	

	return input_start+input_end
}

function insertSingleChar(input){
	var where=this.rint(input.length)
	var input_start=input.substring(0,where)
	var input_end=input.substring(where+1,input.length+1)

	return input_start+String.fromCharCode(this.rint(256))+input_end
}

function insertMultipleChar(input){
	var amount=this.rint(10)+1
	var what=''
	while((amount>0) || this.rint(3)){
		amount--
		what+=String.fromCharCode(this.rint(256))
	}
	var where=this.rint(input.length)
	var input_start=input.substring(0,where)
	var input_end=input.substring(where+what.length,input.length+1)
	
	return input_start+what+input_end
}

function replaceSingleChar(input){
	var where=this.rint(input.length)
	var input_start=input.substring(0,where)
	var input_end=input.substring(where+1,input.length+1)
	
	return input_start+String.fromCharCode(this.rint(256))+input_end
}

function replaceMultipleChar(input){
	var amount=this.wrint()
	var what=''
	while((amount>0) || this.rint(3)){
		amount--
		what+=String.fromCharCode(this.rint(256))
	}
	var where=this.rint(input.length)
	var input_start=input.substring(0,where)
	var input_end=input.substring(where+amount,input.length+1)
	
	return input_start+what+input_end
}



//TODO: Performance fixes.
var replaceXMLValuePairRegExp=/\s\w+?([=\/])(((('|")[^\4]*?\4)?)|([^\s<\/>]+))+/g
/*repCount=0;
repFailCount=0;
repTotal=0;*/
function replaceXMLValuePair(input){
	//console.log('replace - repTotal: '+repTotal+' repPass: '+repCount+ ' repFailCount: '+repFailCount)
	//repTotal++
	if(input.indexOf('=')==-1)
		return false
	var self=this
	var prob=input.match(replaceXMLValuePairRegExp)
	if(prob != null){
		prob=prob.length
		var result=input.replace(replaceXMLValuePairRegExp,function(match){
			var valuePair=match.split(arguments[1])
			var pass=false
			var key=valuePair[0].trim()
			var value=valuePair[1].trim()
			if(key.length>0  && value.length>0){
				var newValue=self.storage.getValueForKey(key,'XMLValuePairStorage')
				self.storage.storeKeyValuePair([key,value],'XMLValuePairStorage')
				if(newValue!=value){
					pass=true;
					value=newValue;
				}
			}
			if(pass && !self.rint(prob)){
				//repCount++;
				prob++;
				/*console.log('Mutate')
				console.log('Replacing: '+match)
				console.log('With: '+valuePair[0]+arguments[1]+value)
				*/return valuePair[0]+arguments[1]+value
			}
			else{
				//repFailCount++;
				return match
			}
		})
		return result
	}
	return false
}

//TODO: Make this smarter!
var regExpTrickRegExp=/((\().{1,20}?(\))|(\[).{1,20}?(\])|({).{1,20}?(})|(\/).{1,20}?(\/))/gm
function regExpTrick(input){
	var self=this
	var result=input.replace(regExpTrickRegExp,function(match){
		//console.log('Matches:'+ (typeof match))
		var what=''
		if(arguments[2])	
			what='()'
		else if(arguments[4])
			what='[]'
		else if(arguments[6])
			what='{}'
		else
			what='//'
		//console.log('Delimeter: '+what)
		if(!self.rint(3) && what.length>0 ){

			var rounds=self.wrint(100)
			var newValue=self.storage.getValueForKey(what,'regExpTrickStorage')
			if(newValue!=false){
				if(what=='//'){
					newValue='/'+newValue.replace(/\//g,'')
					while(rounds--){
						var value=self.storage.getValueForKey(what,'regExpTrickStorage').replace(/\//g,'')
						if(value && value!=""){
							newValue+='/'+value
						}
					}
					
					return newValue+'/'
				}
				return newValue
			}
		}
		self.storage.storeKeyValuePair([what,match],'regExpTrickStorage')
		return match
	})
	return result
}

function repeatChar(input){
	var index=this.rint(input.length)
	var count=this.wrint()
	var what=input.charAt(index)
	var string=''
	while((count>0) || this.rint(3)){
		count--
		string+=what
	}
	return input.substring(0,index)+string+input.substring(index)
}

function repeatChars(input){
	var index=this.rint(input.length)
	var count=this.wrint(100)
	var length=this.wrint(100)
	var what=input.substr(index,length)
	var string=''
	while((count>0) || this.rint(3)){
		count--
		string+=what
	}
	return input.substring(0,index)+string+input.substring(index)
}

//TODO: Verify behavior with different data chunks.
var callCount=0;
var failCount=0;
function freqString(input){
callCount++;
var depth=0;
var MAX=64
var MIN=10
var taken=""
var places=[]
for(var x=0; x<input.length;x++){
	places.push(x)
}
while(depth<MAX){
	var nodes=findPlaces(input,depth,places);
	var node =getFrequent.call(this,nodes, places.length)
	if(!node.hasOwnProperty('places') || node.places.length<=2){
		if(taken.length<3){
			failCount++;
			return false;
		}
		break;
	}
	if(taken.length>MIN && !this.rint(2))
		break;
	places=node.places
	depth++;
	taken+=node.char
}
var secondPlacesIndex=this.rint(places.length-1)+1
var placesIndex=this.rint((secondPlacesIndex-1))
var place2=this.rint(places.length-1)

var string=input.substring(places[placesIndex],places[placesIndex+1])
if(taken.length>=2 && string.length>taken.length){
	this.storage.storeKeyValuePair([taken,string],'freqStringStorage')
}
var newValue=this.storage.getValueForKey(taken,'freqStringStorage')
if(newValue!=false && this.rint(3) && newValue!=string){
	return input.substring(0,places[placesIndex])+newValue+input.substring(places[secondPlacesIndex],input.length)
}
var rounds=2
if(this.storage.valueStorages.hasOwnProperty('freqStringStorage') && this.rint(3)){
	while(rounds--){
		var storageIndex=this.rint(this.storage.valueStorages['freqStringStorage'][0].length)
		var inputIndex=input.indexOf(this.storage.valueStorages['freqStringStorage'][0][storageIndex])
		if(inputIndex!=-1 && inputIndex!=(input.lastIndexOf(this.storage.valueStorages['freqStringStorage'][0][storageIndex]))){
			var matches=allIndexes(input,this.storage.valueStorages['freqStringStorage'][0][storageIndex])
			var secondPlacesIndex=this.rint(matches.length-1)+1
			var placesIndex=this.rint((secondPlacesIndex-1))
			return input.substring(0,places[placesIndex])+this.ra(this.storage.valueStorages['freqStringStorage'][1][storageIndex])+input.substring(places[secondPlacesIndex],input.length)
		}	
	}
}
if(this.rint(5)){
	return input.substring(0,places[placesIndex])+input.substring(places[place2],places[place2+1])+input.substring(places[secondPlacesIndex],input.length)
}else{
	var rounds=this.wrint(100)+1
	var returnString=input.substring(0,places[placesIndex])
	while(rounds--){
		returnString+=input.substring(places[place2],places[place2+1])
	}
	return returnString+input.substring(places[secondPlacesIndex],input.length)
}

}


//TODO: Is there a way to do this faster?
var mutateNumberRegExp=/((\d+\.?\d+)|\d)/g
function mutateNumber(input){
	var matchCount=0
	var self=this
	var count=input.match(mutateNumberRegExp)
	if(count == null)
		return false	
	else{
		var replaceAt=this.rint(count.length)
		return input.replace(mutateNumberRegExp, function(match) {
			matchCount++
		    if(matchCount==replaceAt){
		    	return randoms.randomNumber.call(self)
		    }
		    return match;
    	});
    }
}

function wordCopy(input){
	var wordList=input.split(' ')
	if(wordList.length<3)
		return false
	var wordIndex=this.rint(wordList.length)
	var word=[wordList[wordIndex]]
	if(word[0].length>200){
		return false
	}
	var howMany=this.wrint()
	while((howMany>0) || this.rint(3)){
		howMany--;
		word.push(word[0])
	}
	wordList.splice(this.rint(wordList.length),0,word.join(' '))
	var result=wordList.join(' ')
	return result
}

function wordRemove(input){
	var wordList=input.split(' ')
	if(wordList.length<(input.length/100))
		return false
	wordList.splice(this.rint(wordList.length),this.wrint(10))
	var result=wordList.join(' ')
	return result
}

function bitFlip(input){
	var where=this.rint(input.length)
	var input_start=input.substring(0,where)
	var input_end=input.substring(where+1,input.length+1)
	return input_start+String.fromCharCode((input.charCodeAt(where)) ^ (Math.pow(2,this.rint(8))))+input_end
}

function chunkSwapper(input){
	var newChunk=this.storage.getChunk()
	if(!newChunk)
		return false
	return newChunk.data
}

function pdfObjectMangle(input){
	var objBegins=[]
	var objBeginReg=/\d+ \d+ obj/g
	var cur;
	while(cur = objBeginReg.exec(input)){
		objBegins.push(cur.index+cur[0].length)
	}

	var objEnds=[]
	var objEndReg=/endobj/g
	while(cur = objEndReg.exec(input)){
		objEnds.push(cur.index)
	}

	while(objBegins[0]>objEnds[0]){
		objEnds.shift()
	}

	if(objBegins.length>1 && objEnds.length>1){

		var index=Math.floor(Math.random()*objEnds.length)
	
		//console.log(input.substring(objBegins[index],objEnds[index]))
		this.storage.storeKeyValuePair(['obj',input.substring(objBegins[index],objEnds[index])],'pdfStorage')
		var newValue= this.storage.getValueForKey('obj','pdfStorage')
		if(newValue!=false){
			return input.substring(0,objBegins[index])+newValue+input.substring(objEnds[index],input.length)
		}
		else
			return false
	}
	else 
		return false
}



function calcMutatorWeights(mutators){
	var weightedMutatorsList=new Array()
	for(var mutator in mutators){
		var weight=mutators[mutator].weight
		while(weight--){
			weightedMutatorsList.push(mutators[mutator])
		}
	}
	return weightedMutatorsList
}


var mutators={
	freqString:
		{mutatorFunction:freqString,weight:20,stringOnly:false},
	chunkSwapper:
		{mutatorFunction:chunkSwapper,weight:2,stringOnly:false},
	regExpTrick:
		{mutatorFunction:regExpTrick,weight:10,stringOnly:false},
	strStuttr:
		{mutatorFunction:strStuttr,weight:12,stringOnly:false},
	lineCopy:
		{mutatorFunction:lineCopy,weight:5,stringOnly:true},
	lineSwap:
		{mutatorFunction:lineSwap,weight:5,stringOnly:true},
	lineMove:
		{mutatorFunction:lineMove,weight:5,stringOnly:true},
	lineRepeat:
		{mutatorFunction:lineRepeat,weight:5,stringOnly:true},
	wordCopy:
		{mutatorFunction:wordCopy,weight:5,stringOnly:true},
	wordRemove:
		{mutatorFunction:wordRemove,weight:5,stringOnly:true}, 
	mutateNumber:
		{mutatorFunction:mutateNumber,weight:10,stringOnly:false},
	replaceXMLValuePair:
		{mutatorFunction:replaceXMLValuePair,weight:5,stringOnly:true},	
	strCopyShort:
		{mutatorFunction:strCopyShort,weight:10,stringOnly:false},
	strCopyLong:
		{mutatorFunction:strCopyLong,weight:5,stringOnly:false},	
	strRemove:
		{mutatorFunction:strRemove,weight:5,stringOnly:false},
	insertSingleChar:
		{mutatorFunction:insertSingleChar,weight:5,stringOnly:false},	
	insertMultipleChar:
		{mutatorFunction:insertMultipleChar,weight:10,stringOnly:false},
	replaceSingleChar:
		{mutatorFunction:replaceSingleChar,weight:10,stringOnly:false},	
	replaceMultipleChar:
		{mutatorFunction:replaceMultipleChar,weight:5,stringOnly:false},
	repeatChar:
		{mutatorFunction:repeatChar,weight:10,stringOnly:false},
	repeatChars:
		{mutatorFunction:repeatChars,weight:5,stringOnly:false},
	bitFlip:
		{mutatorFunction:bitFlip,weight:5,stringOnly:false},
	pdfObjectMangle:
		{mutatorFunction:pdfObjectMangle,weight:5,stringOnly:true}
}

mutators["xmlMutate"]={mutatorFunction:require('./xmlMutator.js'),weight:20}

var mutatorList=calcMutatorWeights(mutators)


//TODO: Unit tests to verify that none of the functions below can cause crash.
//	    And that there is warnings for every time something goes wrong.
module.exports={
	mutators:mutatorList,
	updateMutators:function(){
		this.mutators=calcMutatorWeights(mutators)
	},
	updateStringMutators:function(){
		this.mutators=calcMutatorWeights(mutators)
	},
	changeMutatorWeight:function(name,newWeight){
		if(mutators.hasOwnProperty(name)){
			if(parseInt(newWeight) != 'NaN')
				mutators[name].weight=parseInt(newWeight)
			else
				console.log('Mutator weight update failed: Invalid new weight. Must be integer. Got '+newWeight)
		}
		else{
			console.log('Mutator weight update failed: No such mutator. Got '+name)
		}
	},
	addNewMutator:function(name,weight,mutatorFunction){
		if(name===undefined || weight===undefined || mutatorFunction===undefined){
			console.log('Mutator add failed: One or more arguments undefined.')
			return 0
		}
		if(parseInt(weight) == 'NaN'){
			console.log('Mutator add failed: Invalid weight. Must be integer. Got '+weight)
			return 0
		}
		if(!(mutatorFunction instanceof Function)){
			console.log('Mutator add failed: mutatorFunction not type Function.')
			return 0
		}
		if(mutators.hasOwnProperty(name))
			console.log('Mutator add warning: Mutator with same type "'+type+'" and name "'+name+'" already exists. Overwriting.')
		mutators[name]={mutatorFunction:mutatorFunction,weight:weight}
		this.updateMutators()
	},
	removeMutator:function(name){
		if(mutators.hasOwnProperty(name))
			delete mutators[name]
		else{
			console.log('Mutator remove failed: No such mutator. Got '+name)
		}
		this.updateMutators()
	},
	useOnlyMutators:function(arrayOfMutatorNames){
		for(var mutator in mutators){
			if(arrayOfMutatorNames.indexOf(mutator)==-1)
				delete mutators[mutator]
		}	
		this.updateMutators()	
	},
	randomizeWeights:function(){
		//Warning this will break reproducibility via seed???
		for(var mutator in mutators){
			mutators[mutator].weight=Math.floor(Math.random()*10)+1
		}
		this.updateMutators()
	}
}
