
//I confess, I have no idea anymore what this code does, but it works.
//TODO:UnitTests!!
function debugPrint(msg){
	if(debug)
		console.log(msg)
}

var tagStartRegExp=/<\w/g
var tagEndRegExp=/<\/\w/g
function parseXMLTagStarts(input,currentIndex,collection){
	var firstSpace=input.indexOf(' ',currentIndex)
	var firstClosure=input.indexOf('>',currentIndex);
	//debugPrint('fs: '+firstSpace)
	//debugPrint('fc: '+firstClosure)
	if(firstSpace ==-1 || firstClosure == -1)
		var tagNameEnd=firstSpace==-1 ? firstClosure : firstSpace
	else
		var tagNameEnd=firstSpace<firstClosure ? firstSpace : firstClosure
	//debugPrint(tagNameEnd)
	var tagName=input.substring(currentIndex+1,tagNameEnd)
	//debugPrint('TagName: '+tagName)
	if(collection.hasOwnProperty(tagName)){
		collection[tagName].starts.push(currentIndex-1)
		collection[tagName].startTagClosure.push(firstClosure+1)
		tagStartRegExp.lastIndex=currentIndex+1
		var re={}
		if((re=tagStartRegExp.exec(input))!==null)
			collection=parseXMLTagStarts(input,re.index,collection)
	}
	else{
		collection[tagName]={starts:[currentIndex-1],ends:[],startTagClosure:[firstClosure+1]}
		tagStartRegExp.lastIndex=currentIndex+1
		var re={}
		if((re=tagStartRegExp.exec(input))!==null){
			collection=parseXMLTagStarts(input,re.index,collection)
		}
	
	}
	return collection
}

function parseXMLTagEnds(input,currentIndex,collection){
	var firstClosure=input.indexOf('>',currentIndex);//searchWithIgnore(input,'>',currentIndex);
	//debugPrint('fc: '+firstClosure)
	//debugPrint(firstClosure)
	var tagName=input.substring(currentIndex+2,firstClosure)
	//debugPrint('EndTagName: '+tagName)
	if(collection.hasOwnProperty(tagName)){
		collection[tagName].ends.push(currentIndex)
		tagEndRegExp.lastIndex=currentIndex+1
		var re={}
		if((re=tagEndRegExp.exec(input))!==null){
			//debugPrint(re)
			parseXMLTagEnds(input,re.index,collection)
		}
	}
	else{
		tagEndRegExp.lastIndex=currentIndex+1
		var re={}
		if((re=tagEndRegExp.exec(input))!==null){
			parseXMLTagEnds(input,re.index,collection)
		}
	}
	
}

function filterTagList(collection){
	var tag
	for(tag in collection){
		while(collection[tag].starts[collection[tag].starts.length-1]>collection[tag].ends[collection[tag].ends.length-1])
			collection[tag].starts.pop()
		while(collection[tag].starts[0]>collection[tag].ends[0])
			collection[tag].ends.shift()

		if(collection[tag].starts.length!=collection[tag].ends.length){
			while(collection[tag].starts.length>collection[tag].ends.length)
				collection[tag].starts.shift()
			while(collection[tag].starts.length<collection[tag].ends.length)
				collection[tag].ends.pop()
		}
		if(collection[tag].starts.length==0 && collection[tag].ends.length==0)
			delete collection[tag]
		else
		collection[tag].ends.reverse()
	}
	return collection
}

function mutate1(input,tags){
	debugPrint('Mutate1')
	var tag=this.ra(tags)
	var tagIndex=this.rint(tag.starts.length)
	var stringStartIndex=tag.starts[tagIndex]
	var stringEndIndex=tag.ends[tagIndex]+3+tag.name.length
	var rounds=this.wrint(20)
	var where=this.rint(2)? (this.ra(tag.ends)):(this.ra(tag.startTagClosure))
	var string=''
	var what=input.substring(stringStartIndex,stringEndIndex)
	while(rounds--){
		string+=what
	}

	return input.substring(0,where)+string+input.substring(where)

}

function mutate2(input,tags){
	debugPrint('Mutate2')
	var tag=this.ra(tags)
	var tagIndex=this.rint(tag.starts.length)
	var stringStartIndex=tag.startTagClosure[tagIndex]
	var stringEndIndex=tag.ends[tagIndex]
	var rounds=this.wrint(20)
	var where=this.rint(2)? (this.ra(tag.ends)):(this.ra(tag.startTagClosure))
	var string=''
	var what=input.substring(stringStartIndex,stringEndIndex)
	while(rounds--){
		string+=what
	}

	return input.substring(0,where)+string+input.substring(where)

}

function mutate3(input,tags){
	debugPrint('Mutate3')
	var tag=this.ra(tags)
	var tag2=this.ra(tags)
	var tagIndex=this.rint(tag.starts.length)
	var stringStartIndex=tag.startTagClosure[tagIndex]+1
	var stringEndIndex=tag.ends[tagIndex]
	var rounds=this.wrint(20)
	var where=this.rint(2)? (this.ra(tag2.ends)):(this.ra(tag2.startTagClosure))
	var string=''
	var what=input.substring(stringStartIndex,stringEndIndex)
	while(rounds--){
		string+=what
	}

	return input.substring(0,where)+string+input.substring(where)

}

function mutate4(input,tags){
	var tag=this.ra(tags)
	var tag2=this.ra(tags)
	var tagIndex=this.rint(tag.starts.length)
	var stringStartIndex=tag.startTagClosure[tagIndex]+1
	var stringEndIndex=tag.ends[tagIndex]
	var rounds=this.wrint(20)
	var where=this.rint(2)? (this.ra(tag2.ends)):(this.ra(tag2.startTagClosure))
	var string=''
	var what=input.substring(stringStartIndex,stringEndIndex)
	while(rounds--){
		string+=what
	}

	return input.substring(0,where+1)+string+input.substring(where+1)

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

var xmlMutators={
	mutate1:
		{mutatorFunction:mutate1,weight:1},
	mutate2:
		{mutatorFunction:mutate2,weight:1},
	mutate3:
		{mutatorFunction:mutate3,weight:1},
}

var xmlMutatorList=calcMutatorWeights(xmlMutators)

function mutateXML(input,isString){
	if(!isString)
		return false
	debugPrint(input)
	var collection={}
	var firstStartTag=input.search(/<\w/)
	var firstEndTag=input.search(/<\/\w/)
	if(firstStartTag==-1 || firstEndTag==-1)
		return false
	//debugPrint(firstStartTag)
	parseXMLTagStarts.call(this,input,firstStartTag,collection)
	parseXMLTagEnds.call(this,input,firstEndTag,collection)
	filterTagList.call(this,collection)
	var tags=[]
	for(var test in collection){
		collection[test].name=test
		tags.push(collection[test])
	}
	if(tags.length==0)
		return 1
	input=this.ra(xmlMutatorList).call(this,input,tags)
	return input
}




if(require.main===module){
	var fs=require('fs')
	var fileNames=fs.readdirSync('./testFiles')
	var fileName=''
	var self=this
	var debug=true
	if(process.argv.indexOf('--debug')!=-1)
		debug=true
	this.rint=function(max){
		return Math.floor(Math.random()*max)
	}
	this.ra=function(array){
		return array[self.rint(array.length)]
	}
	this.wrint=function(max){
		if(max===undefined)
			max=2000
		var num=Math.random()*3
		var div=Math.random()+Number.MIN_VALUE //Avoid divide by zero.
		return (Math.floor((num/div)) ? Math.floor((num/div)) : 1) % max
	}
	while((fileName=fileNames.pop())!==undefined){
		console.log('File: '+fileName)
		console.log(mutateXML.call(this,fs.readFileSync('./testFiles/'+fileName,'binary'),true))
		console.log('')
		console.log('')
		console.log('')
		console.log('')
	}

}

module.exports=mutateXML
