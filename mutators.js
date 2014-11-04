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

function lineCopy(input,isString){
	if(!isString && this.rint(3))
		return false
	var lines=input.split('\n')
	lines.splice(this.rint(lines.length),0,this.ra(lines))
	return (lines.join('\n'))
}

function lineRepeat(input,isString){
	if(!isString && this.rint(3))
		return false
	var lines=input.split('\n')
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

function lineSwap(input,isString){
	if(!isString && this.rint(3))
		return false
	var lines=input.split('\n')
	var index1=this.rint(lines.length)
	var index2=this.rint(lines.length)
	var line1=lines[index1]
		lines[index1]=lines[index2]
		lines[index2]=line1
	return (lines.join('\n'))

}

function lineMove(input,isString){
	if(!isString && this.rint(3))
		return false
	var lines=input.split('\n')
	lines.splice(this.rint(lines.length),0,lines.splice(this.rint(lines.length),1)[0])
	return (lines.join('\n'))
}

function strCopyShort(input,isString){
	var where=this.rint(input.length)
	var start=this.rint(input.length)
	var end=start+this.wrint(100)
	var input_start=input.substring(0,where)
	var input_end=input.substring(where,input.length+1)
	var what=input.substring(start,end)
	return input_start+what+input_end
}

function strStuttr(input,isString){
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

function strCopyLong(input,isString){
	var where=this.rint(input.length)
	var start=this.rint(input.length)
	var end=start+this.rint(Math.floor(input.length*this.r.genrand_real1()))
	var input_start=input.substring(0,where)
	var input_end=input.substring(where,input.length+1)
	var what=input.substring(start,end)
	return input_start+what+input_end
}

function strRemove(input,isString){
	var where=this.rint(input.length)
	return input.substring(0,where)+input.substring((where+this.wrint(1000-where)),input.length+1)	
}

function insertSingleChar(input,isString){
	var where=this.rint(input.length)
	return input.substring(0,where)+String.fromCharCode(this.rint(256))+input.substring(where,input.length+1)
}

function insertMultipleChar(input,isString){
	var amount=this.rint(10)+1
	var what=''
	while((amount>0) || this.rint(3)){
		amount--
		what+=String.fromCharCode(this.rint(256))
	}
	var where=this.rint(input.length)
	return input.substring(0,where)+what+input.substring(where,input.length+1)
}

function replaceSingleChar(input,isString){
	var where=this.rint(input.length)
	return input.substring(0,where)+String.fromCharCode(this.rint(256))+input.substring(where+1,input.length+1)
}

function replaceMultipleChar(input,isString){
	var amount=this.wrint()
	var what=''
	while((amount>0) || this.rint(3)){
		amount--
		what+=String.fromCharCode(this.rint(256))
	}
	var where=this.rint(input.length)
	return input.substring(0,where)+what+input.substring(where+amount,input.length+1)
}



//TODO: Performance fixes.
var replaceXMLValuePairRegExp=/\s\w+?([=\/])(((('|")[^\4]*?\4)?)|([^\s<\/>]+))+/g
/*repCount=0;
repFailCount=0;
repTotal=0;*/
function replaceXMLValuePair(input,isString){
	//console.log('replace - repTotal: '+repTotal+' repPass: '+repCount+ ' repFailCount: '+repFailCount)
	//repTotal++
	if(!isString && this.rint(3))
		return false
	var self=this
	var prob=input.match(replaceXMLValuePairRegExp)
	if(prob != null){
		prob=prob.length
		return input.replace(replaceXMLValuePairRegExp,function(match){
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
	}
	return false
}

//TODO: Make this smarter!
var regExpTrickRegExp=/((\().{1,20}?(\))|(\[).{1,20}?(\])|({).{1,20}?(})|(\/).{1,20}?(\/))/gm
function regExpTrick(input,isString){
	var self=this
	//console.log('Call')
	if(!isString && this.rint(3)){
		//console.log('Abort')
		return false
	}
	return input.replace(regExpTrickRegExp,function(match){
		//console.log('Matches:'+ match)
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
}

function repeatChar(input,isString){
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

function repeatChars(input,isString){
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
function freqString(input, isString){
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
var string=input.substring(places[placesIndex],places[secondPlacesIndex])
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
function mutateNumber(input,isString){
	if(!isString && this.rint(3))
		return false
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

function wordCopy(input,isString){
	if(!isString && this.rint(3))
		return false
	var wordList=input.split(' ')
	var wordIndex=this.rint(wordList.length)
	var word=[wordList[wordIndex]]
	var howMany=this.wrint()
	while((howMany>0) || this.rint(3)){
		howMany--;
		word.push(word[0])
	}
	wordList.splice(this.rint(wordList.length),0,word.join(' '))
	return wordList.join(' ')
}

function wordRemove(input,isString){
	if(!isString && this.rint(3))
		return false
	var wordList=input.split(' ')
	wordList.splice(this.rint(wordList.length),this.wrint(10))
	return wordList.join(' ')
}

function bitFlip(input,isString){
	var where=this.rint(input.length)
	return input.substring(0,where)+String.fromCharCode((input.charCodeAt(where)) ^ (Math.pow(2,this.rint(8))))+input.substring(where+1,input.length+1)
}

function pdfObjectMangle(input, isString){
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
			weightedMutatorsList.push(mutators[mutator].mutatorFunction)
		}
	}
	return weightedMutatorsList
}


var mutators={
	freqString:
		{mutatorFunction:freqString,weight:10},
	regExpTrick:
		{mutatorFunction:regExpTrick,weight:10},
	strStuttr:
		{mutatorFunction:strStuttr,weight:3},
	lineCopy:
		{mutatorFunction:lineCopy,weight:2},
	lineSwap:
		{mutatorFunction:lineSwap,weight:3},
	lineMove:
		{mutatorFunction:lineMove,weight:3},
	lineRepeat:
		{mutatorFunction:lineRepeat,weight:3},
	wordCopy:
		{mutatorFunction:wordCopy,weight:5},
	wordRemove:
		{mutatorFunction:wordRemove,weight:5}, 
	mutateNumber:
		{mutatorFunction:mutateNumber,weight:15},
	replaceXMLValuePair:
		{mutatorFunction:replaceXMLValuePair,weight:20},	
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
		{mutatorFunction:replaceSingleChar,weight:5},	
	replaceMultipleChar:
		{mutatorFunction:replaceMultipleChar,weight:3},
	repeatChar:
		{mutatorFunction:repeatChar,weight:4},
	repeatChars:
		{mutatorFunction:repeatChars,weight:3},
	bitFlip:
		{mutatorFunction:bitFlip,weight:5},
	pdfObjectMangle:
		{mutatorFunction:pdfObjectMangle,weight:4}
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
