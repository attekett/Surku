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
	for(var node in nodes){	
		if(nodes[node].places.length<2){
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
	if(!isString)
		return false
	var lines=input.split('\n')
	lines.splice(this.rint(lines.length),0,this.ra(lines))
	return (lines.join('\n'))
}

function lineRepeat(input,isString){
	if(!isString)
		return false
	var lines=input.split('\n')
	var line=this.ra(lines)
	var rounds=this.wrint();
	var lineChunk=''
	while((rounds>0) || this.rint(3)){
		rounds--
		lineChunk+=(line+'\n')
	}
	lines.splice(this.rint(lines.length),0,lineChunk)
	return (lines.join('\n'))
}

function lineSwap(input,isString){
	if(!isString)
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
	if(!isString)
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
var replaceXMLValuePairRegExp=/\s\w+?=(((('|")[^\4]*?\4)?)|([^\s<\/>]+))+/g
function replaceXMLValuePair(input,isString){
	if(!isString)
		return false
	var self=this
	var prob=input.match(replaceXMLValuePairRegExp)
	if(prob != null){
		prob=prob.length
		return input.replace(replaceXMLValuePairRegExp,function(match){
			var valuePair=match.split('=')
			var key=valuePair[0].trim()
			var value=valuePair[1].trim()
			if(key.length>0  && value.length>0){
				self.storage.storeKeyValuePair([key,value],'XMLValuePairStorage')
			}
			if(!self.rint(prob) && key.length>0 ){
				prob++;
				var newValue=self.storage.getValueForKey(key,'XMLValuePairStorage')
				if(newValue!=false)
					value=newValue

				return valuePair[0]+'='+value
			}
			else
				return match
		})
	}
	return false
}

//TODO: Make this smarter!
var regExpTrickRegExp=/((\().{1,20}(\))|(\[).{1,20}(\])|({).{1,20}(})|(\/).{1,20}(\/))/gm
function regExpTrick(input,isString){
	var self=this
	if(!isString)
		return false
	return input.replace(regExpTrickRegExp,function(match){
		var what=''
		if(arguments[2])	
			what='()'
		else if(arguments[4])
			what='[]'
		else if(arguments[6])
			what='{}'
		else
			what='//'
		self.storage.storeKeyValuePair([what,match],'regExpTrickStorage')
		if(!self.rint(10) && what.length>0 ){
			var newValue=self.storage.getValueForKey(what,'regExpTrickStorage')
			if(newValue!=false)
				return newValue
		}
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
function freqString(input, isString){
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
		if(taken.length<2)
			return false;
		break;
	}
	if(taken.length>MIN && !this.rint(10))
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
var rounds=5
if(this.storage.valueStorages.hasOwnProperty('freqStringStorage')){
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
return input.substring(0,places[placesIndex])+input.substring(places[place2],places[place2+1])+input.substring(places[secondPlacesIndex],input.length)


}


//TODO: Is there a way to do this faster?
var mutateNumberRegExp=/((\d+\.?\d+)|\d)/g
function mutateNumber(input,isString){
	if(!isString)
		return false
	var matchCount=0
	var self=this
	var count=input.match(mutateNumberRegExp)
	if(count == null)
		return false	
	else{
		var replaceAt=this.rint(count)	
		return input.replace(mutateNumberRegExp, function(match) {
			matchCount++
		    if(matchCount==replaceAt)
		    	return randoms.randomNumber.call(self)
		    return match;
    	});
    }
}

function wordCopy(input,isString){
	if(!isString)
		return false
	var wordList=input.split(' ')
	var wordIndex=this.rint(wordList.length)
	var word=[wordList[wordIndex]]
	var howMany=this.wrint()
	while((howMany>0) || this.rint(3)){
		howMany--;
		word.push(word[0])
	}
	wordList.splice(this.rint(wordList.len),0,word.join(' '))
	return wordList.join(' ')
}

function bitFlip(input,isString){
	var where=this.rint(input.length)
	return input.substring(0,where)+String.fromCharCode((input.charCodeAt(where)) ^ (Math.pow(2,this.rint(8))))+input.substring(where+1,input.length+1)
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
		{mutatorFunction:regExpTrick,weight:3},
	lineCopy:
		{mutatorFunction:lineCopy,weight:2},
	lineSwap:
		{mutatorFunction:lineSwap,weight:3},
	lineMove:
		{mutatorFunction:lineMove,weight:3},
	lineRepeat:
		{mutatorFunction:lineRepeat,weight:2},
	wordCopy:
		{mutatorFunction:wordCopy,weight:2}, 
	mutateNumber:
		{mutatorFunction:mutateNumber,weight:10},
	replaceXMLValuePair:
		{mutatorFunction:replaceXMLValuePair,weight:10},	
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
}

mutators["xmlMutate"]={mutatorFunction:require('./xmlMutator.js'),weight:10}

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
