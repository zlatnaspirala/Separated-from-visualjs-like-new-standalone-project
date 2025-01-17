
class ServerConfig {

  constructor() {

    /**
     * Define backend staff
     * 
     * @version 0.2.0
     * Implementing multiRTC3 for data streaming operation
     */
    this.version = "0.2.0";

    // not implemented yet
    // enum : 'dev', 'prod', `mongodb.net` or `mongodb.net-dev`
    // this.serverMode = "mongodb.net";
    this.serverMode = "dev";

    this.ownHosting = false;
    // For noe i force default broser ports to avoid CORS errors
    // at for https://localhost:PORT any port.
    this.ownHttpHostPort = 443;
    this.networkDeepLogs = false;
    this.rtcServerPort = 11034;
    this.rtc3ServerPort = 9001; // samo like Visual-ts server
    this.connectorPort = 9111;

    /**
     * @description
     * Represent prop for many handling in aspect of 
     * what is actual ServerMode.
     * It's simple and nice solution, we never n
     */
    this.domain = {
      dev: "localhost",
      prod: "maximumroulette.com"
    };

    /**
     * @description
     * Represent Public Channel, webrtc session name.
     * Interest prop for manipulation.
     * This can be upgraded to the Object type.
     */
    this.masterServerKey = "magic.three.main.channel";

    /**
     * @description
     * Strongly recommended https for local also for production!
     */
    this.protocol = "https";

    /**
     * @description
     * Just for help if needed if you wanna use pem.
     * No pem currently used at the moment.
     */
    this.certPathSelfOrigin = {
      pKeyPath: "./apache-local-cert/server.key",
      pCertPath: "./apache-local-cert/server.crt",
      pCBPath: "./apache-local-cert/server.csr",
    };

    /**
     * @description
     * Just for help if needed.
     */
    this.certPathSelf = {
      pKeyPath: "./apache-local-cert/server.key",
      pCertPath: "./apache-local-cert/server.crt",
      pCBPath: "./apache-local-cert/server.csr",
    };

    // production
    this.certPathProd = {
      pKeyPath: "/etc/letsencrypt/live/maximumroulette.com/privkey.pem",
      pCertPath: "/etc/letsencrypt/live/maximumroulette.com/cert.pem",
      pCBPath: "/etc/letsencrypt/live/maximumroulette.com/fullchain.pem"
    };

    this.appUseAccountsSystem = false;
    this.appUseBroadcaster = true;
    this.databaseName = "masterdatabase";

    this.databaseRoot = {
      dev: "mongodb://localhost:27017",
      prod: "mongodb://userAdmin:*************@localhost:27017/admin",
      freeService: "mongodb+srv://userAdmin:**********@cluster0.piqav.mongodb.net/masterdatabase?retryWrites=true&w=majority"
    };

    this.specialRoute = {
      "default": "/var/www/html/applications/visual-typescript-game-engine/last-build/multiplayer"
    };

    console.log("Server running under configuration => ", this.serverMode);

    if(this.serverMode == "dev") {
      console.log("-rtc domain dev", this.domain.dev);
    } else if(this.serverMode == "prod") {
      console.log("-rtc domain prod", this.domain.prod);
    }

    var Reset = '\x1b[0m';
    console.log('\x1b[42m', 'MAgic-Three-Server params 🧪 ', Reset);
    console.log('\x1b[42m', "-rtc masterServerKey", this.masterServerKey, Reset);
    console.log('\x1b[42m', "-rtc rtcServerPort", this.rtcServerPort, Reset);
    console.log('\x1b[42m', "-rtc rtc3/broadcaster is enabled", this.appUseBroadcaster, Reset);
    console.log('\x1b[42m', "-rtc rtc3ServerPort", this.rtc3ServerPort, Reset);
    console.log('\x1b[42m', "-rtc protocol", this.protocol, Reset);
    console.log('\x1b[42m', "-rtc isSecure", this.isSecure, Reset);
  }

  /**
   * @returns {any}
   */
  get getAppUseBroadcaster() {
    return this.appUseBroadcaster;
  };

  get getProtocol() {
    if(this.isSecure) {
      this.protocol = "https";
    } else if(this.serverMode === "mongodb.net" || this.serverMode === "mongodb.net-dev") {
      this.protocol = "https";
    } else {
      this.protocol = "http";
    }
    return this.protocol;
  }

  get getRtcServerPort() {
    return this.rtcServerPort;
  }

  get getRtc3ServerPort() {
    return this.rtc3ServerPort;
  }

  get getDatabaseRoot() {

    if(this.serverMode == "dev") {
      return this.databaseRoot.dev;
    } else if(this.serverMode == "prod") {
      return this.databaseRoot.prod;
    } else if(this.serverMode == "mongodb.net" || this.serverMode === "mongodb.net-dev") {
      return this.databaseRoot.freeService;
    }

  }

  get IsDatabaseActive() {
    return this.appUseAccountsSystem;
  }

  get getConnectorPort() {
    return this.connectorPort;
  }

  get getRemoteServerAddress() {

    if(this.serverMode == "dev") {
      return (this.isSecure ? "wss" : "ws") + "://" + this.domain.dev + ":" + this.rtcServerPort + "/";
    } else if(this.serverMode == "prod") {
      return (this.isSecure ? "wss" : "ws") + "://" + this.domain.prod + ":" + this.rtcServerPort + "/";
    } else if(this.serverMode == "mongodb.net") {
      return (this.isSecure ? "wss" : "ws") + "://" + this.domain.prod + ":" + this.rtcServerPort + "/";
    } else if(this.serverMode == "mongodb.net-dev") {
      return (this.isSecure ? "wss" : "ws") + "://" + this.domain.dev + ":" + this.rtcServerPort + "/";
    }

  }

  set setNetworkDeepLog(newState) {
    this.networkDeepLogs = newState;
  }

  get getNetworkDeepLog() {
    return this.networkDeepLogs;
  }

  get getMasterServerKey() {
    return this.masterServerKey;
  }

}
module.exports = ServerConfig;
