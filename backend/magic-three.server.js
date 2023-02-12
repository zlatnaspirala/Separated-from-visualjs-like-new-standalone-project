
/**
 * @description
 * MatrixNet - Main networking class
 * for matrix-engine workplace.
 */
const ServerConfig = require("./server-config.js");
const serverConfig = new ServerConfig();

var Broadcaster = require("./broadcaster");
broadcaster = new Broadcaster(serverConfig);

if(serverConfig.ownHosting == true) {

  const compression = require("compression");
  const fs = require("fs");
  var express = require("express");
  var cors = require("cors");
  var https = require("https");


  var hostingHTTP = express();

  hostingHTTP.use(compression());
  hostingHTTP.use(cors());

  hostingHTTP.use(express.static("G://web_server/xampp/htdocs/PRIVATE_SERVER/my-threejs/PROJECT/magic-three-ammo/"));

  hostingHTTP.get('*', function(req, res, next) {
     console.log(">>" , req.hostname);
    /* if (req.hostname == "ai.maximumroulette.com") {
      //console.log(" REDIRECT NOW " )
      //req.location = "/apps/ai/";
      //res.sendFile("/apps/ai/index.html");
      //res.end();
    } */
    next();
  });

  hostingHTTP.use(function(req, res, next) {
    // res.setHeader("Content-Type", "text/html")
    res.setHeader('Content-Encoding', 'gzip');
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', false);
    // Pass to next layer of middleware
    next();
  });

  if(serverConfig.serverMode === "dev") {
    options = {
      key: fs.readFileSync(serverConfig.certPathSelf.pKeyPath),
      cert: fs.readFileSync(serverConfig.certPathSelf.pCertPath),
      ca: fs.readFileSync(serverConfig.certPathSelf.pCBPath),
    };
  } else if(serverConfig.serverMode === "prod") {
    options = {
      key: fs.readFileSync(serverConfig.certPathProd.pKeyPath),
      cert: fs.readFileSync(serverConfig.certPathProd.pCertPath),
      ca: fs.readFileSync(serverConfig.certPathProd.pCBPath),
    };
  } else {
    console.warn(
      "Something wrong with serverConfig certPathProd/certPathSelf path."
    );
  }

  if(serverConfig.ownHosting === true) {
  https.createServer(options, hostingHTTP).listen(serverConfig.ownHttpHostPort, error => {
    if (error) {
      console.warn("Something wrong with rocket-craft own host server.");
      console.error(error);
      return process.exit(1);
    } else {
      console.info("Rocket helper unsecured host started at " + serverConfig.ownHttpHostPort + " port.");
    }
  });
}

}

var Reset = '\x1b[0m';
console.log('\x1b[42m', 'Magic-Three-Server running... 🤘 [Enjoy]', Reset);
