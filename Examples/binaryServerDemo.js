const fs = require("fs");
const http = require("http");

const Surku = require("../Surku.js");

const Demo = new Surku();
console.error("Initializing new Surku with default config.");

let timeout = 10;

let mime = "image/png";
let tagtype = "img";
const port = 1337;
let sampleFolder;
if (process.argv[2]) sampleFolder = process.argv[2];
if (process.argv[3]) mime = process.argv[3];
if (process.argv[4]) timeout = process.argv[4];
if (mime.indexOf("video/") === 0) tagtype = "video";

if (!fs.existsSync(sampleFolder)) {
  console.log("You must provide sample folder.");
}

const clientFile =
  `<html>` +
  `<script>` +
  `timeout=setTimeout(newTestCase,${timeout});` +
  `function newTestCase(){` +
  `clearTimeout(timeout);` +
  `var target=document.getElementById("test");` +
  `target.src="/img${new Date().getTime()}";` +
  `if(target.tagName=="VIDEO"){target.play();};` +
  `timeout=setTimeout(newTestCase,${timeout});` +
  `};` +
  `</script>` +
  `<body>` +
  `<${tagtype} id="test" autoplay="true"` +
  `src="/img1"` +
  `onended="newTestCase"` +
  `onload="newTestCase"` +
  `onerror="newTestCase">` +
  `</body>` +
  `</html>`;

console.error(`Checking the sample folder: ${sampleFolder}`);
const files = fs.readdirSync(sampleFolder);
console.error(`Found ${files.length} sample files`);

const server = http.createServer((request, response) => {
  if (request.url === "/") {
    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(clientFile);
    response.end();
  } else if (request.url.indexOf("/img") === 0) {
    response.writeHead(200, { "Content-Type": mime });
    response.write(
      Demo.generateTestCase(
        fs.readFileSync(
          `${sampleFolder}/${files[Math.floor(Math.random() * files.length)]}`
        )
      )
    );
    response.end();
  }
});
server.listen(port, (err) => {
  console.log(`Server listening port :${port}`);
});
