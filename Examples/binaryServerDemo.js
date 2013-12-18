var fs=require('fs')
var http = require('http')

var Surku=require('../Surku.js')
var Demo=new Surku()
console.error('Initializing new Surku with default config.')

var timeout=10

var mime='image/png'
var tagtype='img'
var port=1337

if(process.argv[2])
	var sampleFolder=process.argv[2]			
if(process.argv[3])
	var mime=process.argv[3]
if(process.argv[4])
	var timeout=process.argv[4]
if(mime.indexOf('video/')==0)
	tagtype='video'

if(!fs.existsSync(sampleFolder)){
	console.log("You must provide sample folder.")
}

var clientFile='<html>'
				+'<script>' 
						+'timeout=setTimeout(newTestCase,'+timeout+');' 
		 	    		+'function newTestCase(){'
		 	    			  +'clearTimeout(timeout);' 
		 	    			  +'var target=document.getElementById("test");' 
		 	    			  +'target.src="/img'+new Date().getTime()+'";'
		 	    			  +'if(target.tagName=="VIDEO"){target.play();};' 
		 	    			  +'timeout=setTimeout(newTestCase,'+timeout+');'
		 	    		+'};'
		 	    	+'</script>'
		 	    	+'<body>'
		 	    		+'<'+tagtype+' id="test" autoplay="true"' 
		 	    			  	   +'src="/img1"'
		 	    			  	   +'onended="newTestCase"' 
		 	    			       +'onload="newTestCase"' 
		 	    			       +'onerror="newTestCase">'
		 	    	+'</body>'
		 	    +'</html>'

console.error('Checking the sample folder: '+sampleFolder)
var files=fs.readdirSync(sampleFolder)
console.error('Found '+files.length+' sample files')

var server = http.createServer(function(request, response) {
			if(request.url=='/'){	
				response.writeHead(200,{'Content-Type':'text/html'});
		 	    response.write(clientFile)
		    	response.end();
		    }
		    else if(request.url.indexOf('/img')==0){
		    	response.writeHead(200,{'Content-Type':mime});
		 	    response.write(Demo.generateTestCase(fs.readFileSync(sampleFolder+'/'+files[Math.floor(Math.random()*files.length)])))
		    	response.end();	    	
		    }
});
server.listen(port, function(err) {
		console.log('Server listening port :'+port)
});

