/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

class AgoraRtcAdapter {

  constructor(easyrtc) {
    console.log("BW73 constructor ", easyrtc);

    this.easyrtc = easyrtc || window.easyrtc;
    this.app = "default";
    this.room = "default";
    this.userid = 0;
    this.appid = null;

    this.mediaStreams = {};
    this.remoteClients = {};
    this.pendingMediaRequests = new Map();

    this.enableVideo = false;
    this.enableVideoFiltered = false;
    this.enableAudio = false;
    this.enableAvatar = false;

    this.localTracks = { videoTrack: null, audioTrack: null };
    window.localTracks = this.localTracks;
    console.error("ASS ", window.localTracks);
    this.token = null;
    this.clientId = null;
    this.uid = null;
    this.vbg = false;
    this.vbg0 = false;
    this.showLocal = false;
    this.virtualBackgroundInstance = null;
    this.extension = null;
    this.processor = null;
    this.pipeProcessor = (track, processor) => {
      track.pipe(processor).pipe(track.processorDestination);
    };

    this.serverTimeRequests = 0;
    this.timeOffsets = [];
    this.avgTimeOffset = 0;
    this.agoraClient = null;

    this.easyrtc.setPeerOpenListener(clientId => {
      const clientConnection = this.easyrtc.getPeerConnectionByUserId(clientId);
      this.remoteClients[clientId] = clientConnection;
    });

    this.easyrtc.setPeerClosedListener(clientId => {
      delete this.remoteClients[clientId];
    });
  }

  setServerUrl(url) {
    console.log("BW73 setServerUrl ", url);
    this.easyrtc.setSocketUrl(url);
  }

  setApp(appName) {
    console.log("BW73 setApp ", appName);
    this.app = appName;
    this.appid = appName;
  }

  async setRoom(json) {
    json = json.replace(/'/g, '"');
    const obj = JSON.parse(json);
    this.room = obj.name;

    if (obj.vbg && obj.vbg == 'true') {
      this.vbg = true;
    }

    if (obj.vbg0 && obj.vbg0 == 'true') {
      this.vbg0 = true;
      AgoraRTC.loadModule(SegPlugin, {});
    }

    if (obj.enableAvatar && obj.enableAvatar == 'true') {
      this.enableAvatar = true;
    }

    if (obj.showLocal && obj.showLocal == 'true') {
      this.showLocal = true;
    }

    if (obj.enableVideoFiltered && obj.enableVideoFiltered == 'true') {
      this.enableVideoFiltered = true;
    }
    this.easyrtc.joinRoom(this.room, null);
  }

  // options: { datachannel: bool, audio: bool, video: bool }
  setWebRtcOptions(options) {
    console.log("BW73 setWebRtcOptions ", options);
    // this.easyrtc.enableDebug(true);
    this.easyrtc.enableDataChannels(options.datachannel);

    // using Agora
    this.enableVideo = options.video;
    this.enableAudio = options.audio;

    // not easyrtc
    this.easyrtc.enableVideo(false);
    this.easyrtc.enableAudio(false);
    this.easyrtc.enableVideoReceive(false);
    this.easyrtc.enableAudioReceive(false);
  }

  setServerConnectListeners(successListener, failureListener) {
    console.log("BW73 setServerConnectListeners ", successListener, failureListener);
    this.connectSuccess = successListener;
    this.connectFailure = failureListener;
  }

  setRoomOccupantListener(occupantListener) {
    console.log("BW73 setRoomOccupantListener ", occupantListener);

    this.easyrtc.setRoomOccupantListener(function (roomName, occupants, primary) {
      occupantListener(occupants);
    });
  }

  setDataChannelListeners(openListener, closedListener, messageListener) {
    console.log("BW73 setDataChannelListeners  ", openListener, closedListener, messageListener);
    this.easyrtc.setDataChannelOpenListener(openListener);
    this.easyrtc.setDataChannelCloseListener(closedListener);
    this.easyrtc.setPeerListener(messageListener);
  }

  updateTimeOffset() {
    console.log("BW73 updateTimeOffset ");
    const clientSentTime = Date.now() + this.avgTimeOffset;

    return fetch(document.location.href, { method: "HEAD", cache: "no-cache" }).then(res => {
      var precision = 1000;
      var serverReceivedTime = new Date(res.headers.get("Date")).getTime() + precision / 2;
      var clientReceivedTime = Date.now();
      var serverTime = serverReceivedTime + (clientReceivedTime - clientSentTime) / 2;
      var timeOffset = serverTime - clientReceivedTime;

      this.serverTimeRequests++;

      if (this.serverTimeRequests <= 10) {
        this.timeOffsets.push(timeOffset);
      } else {
        this.timeOffsets[this.serverTimeRequests % 10] = timeOffset;
      }

      this.avgTimeOffset = this.timeOffsets.reduce((acc, offset) => acc += offset, 0) / this.timeOffsets.length;

      if (this.serverTimeRequests > 10) {
        setTimeout(() => this.updateTimeOffset(), 5 * 60 * 1000); // Sync clock every 5 minutes.
      } else {
        this.updateTimeOffset();
      }
    });
  }

  connect() {
    console.log("BW73 connect ");
    Promise.all([this.updateTimeOffset(), new Promise((resolve, reject) => {
      this._connect(resolve, reject);
    })]).then(([_, clientId]) => {
      console.log("BW73 connected " + clientId);
      this.clientId = clientId;
      this._myRoomJoinTime = this._getRoomJoinTime(clientId);
      this.connectAgora();
      this.connectSuccess(clientId);
    }).catch(this.connectFailure);
  }

  shouldStartConnectionTo(client) {
    return this._myRoomJoinTime <= client.roomJoinTime;
  }

  startStreamConnection(clientId) {
    console.log("BW73 startStreamConnection ", clientId);
    this.easyrtc.call(clientId, function (caller, media) {
      if (media === "datachannel") {
        NAF.log.write("Successfully started datachannel to ", caller);
      }
    }, function (errorCode, errorText) {
      NAF.log.error(errorCode, errorText);
    }, function (wasAccepted) {
      // console.log("was accepted=" + wasAccepted);
    });
  }

  closeStreamConnection(clientId) {
    console.log("BW73 closeStreamConnection ", clientId);
    this.easyrtc.hangup(clientId);
  }

  sendData(clientId, dataType, data) {
    console.log("BW73 sendData ", clientId, dataType, data);
    // send via webrtc otherwise fallback to websockets
    this.easyrtc.sendData(clientId, dataType, data);
  }

  sendDataGuaranteed(clientId, dataType, data) {
    console.log("BW73 sendDataGuaranteed ", clientId, dataType, data);
    this.easyrtc.sendDataWS(clientId, dataType, data);
  }

  broadcastData(dataType, data) {
    console.log("BW73 broadcastData ", dataType, data);
    var roomOccupants = this.easyrtc.getRoomOccupantsAsMap(this.room);

    // Iterate over the keys of the easyrtc room occupants map.
    // getRoomOccupantsAsArray uses Object.keys which allocates memory.
    for (var roomOccupant in roomOccupants) {
      if (roomOccupants[roomOccupant] && roomOccupant !== this.easyrtc.myEasyrtcid) {
        // send via webrtc otherwise fallback to websockets
        this.easyrtc.sendData(roomOccupant, dataType, data);
      }
    }
  }

  broadcastDataGuaranteed(dataType, data) {
    console.log("BW73 broadcastDataGuaranteed ", dataType, data);
    var destination = { targetRoom: this.room };
    this.easyrtc.sendDataWS(destination, dataType, data);
  }

  getConnectStatus(clientId) {
    console.log("BW73 getConnectStatus ", clientId);
    var status = this.easyrtc.getConnectStatus(clientId);

    if (status == this.easyrtc.IS_CONNECTED) {
      return NAF.adapters.IS_CONNECTED;
    } else if (status == this.easyrtc.NOT_CONNECTED) {
      return NAF.adapters.NOT_CONNECTED;
    } else {
      return NAF.adapters.CONNECTING;
    }
  }

  getMediaStream(clientId, streamName = "audio") {

    console.log("BW73 getMediaStream ", clientId, streamName);
    // if ( streamName = "audio") {
    //streamName = "bod_audio";
    //}

    if (this.mediaStreams[clientId] && this.mediaStreams[clientId][streamName]) {
      NAF.log.write(`Already had ${streamName} for ${clientId}`);
      return Promise.resolve(this.mediaStreams[clientId][streamName]);
    } else {
      NAF.log.write(`Waiting on ${streamName} for ${clientId}`);

      // Create initial pendingMediaRequests with audio|video alias
      if (!this.pendingMediaRequests.has(clientId)) {
        const pendingMediaRequests = {};

        const audioPromise = new Promise((resolve, reject) => {
          pendingMediaRequests.audio = { resolve, reject };
        }).catch(e => NAF.log.warn(`${clientId} getMediaStream Audio Error`, e));

        pendingMediaRequests.audio.promise = audioPromise;

        const videoPromise = new Promise((resolve, reject) => {
          pendingMediaRequests.video = { resolve, reject };
        }).catch(e => NAF.log.warn(`${clientId} getMediaStream Video Error`, e));
        pendingMediaRequests.video.promise = videoPromise;

        this.pendingMediaRequests.set(clientId, pendingMediaRequests);
      }

      const pendingMediaRequests = this.pendingMediaRequests.get(clientId);

      // Create initial pendingMediaRequests with streamName
      if (!pendingMediaRequests[streamName]) {
        const streamPromise = new Promise((resolve, reject) => {
          pendingMediaRequests[streamName] = { resolve, reject };
        }).catch(e => NAF.log.warn(`${clientId} getMediaStream "${streamName}" Error`, e));
        pendingMediaRequests[streamName].promise = streamPromise;
      }

      return this.pendingMediaRequests.get(clientId)[streamName].promise;
    }
  }

  setMediaStream(clientId, stream, streamName) {
    console.log("BW73 setMediaStream ", clientId, stream, streamName);
    const pendingMediaRequests = this.pendingMediaRequests.get(clientId); // return undefined if there is no entry in the Map
    const clientMediaStreams = this.mediaStreams[clientId] = this.mediaStreams[clientId] || {};

    if (streamName === 'default') {
      // Safari doesn't like it when you use a mixed media stream where one of the tracks is inactive, so we
      // split the tracks into two streams.
      // Add mediaStreams audio streamName alias
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        const audioStream = new MediaStream();
        try {
          audioTracks.forEach(track => audioStream.addTrack(track));
          clientMediaStreams.audio = audioStream;
        } catch (e) {
          NAF.log.warn(`${clientId} setMediaStream "audio" alias Error`, e);
        }

        // Resolve the promise for the user's media stream audio alias if it exists.
        if (pendingMediaRequests) pendingMediaRequests.audio.resolve(audioStream);
      }

      // Add mediaStreams video streamName alias
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length > 0) {
        const videoStream = new MediaStream();
        try {
          videoTracks.forEach(track => videoStream.addTrack(track));
          clientMediaStreams.video = videoStream;
        } catch (e) {
          NAF.log.warn(`${clientId} setMediaStream "video" alias Error`, e);
        }

        // Resolve the promise for the user's media stream video alias if it exists.
        if (pendingMediaRequests) pendingMediaRequests.video.resolve(videoStream);
      }
    } else {
      clientMediaStreams[streamName] = stream;

      // Resolve the promise for the user's media stream by StreamName if it exists.
      if (pendingMediaRequests && pendingMediaRequests[streamName]) {
        pendingMediaRequests[streamName].resolve(stream);
      }
    }
  }

  addLocalMediaStream(stream, streamName) {
    console.log("BW73 addLocalMediaStream ", stream, streamName);
    const easyrtc = this.easyrtc;
    streamName = streamName || stream.id;
    this.setMediaStream("local", stream, streamName);
    easyrtc.register3rdPartyLocalMediaStream(stream, streamName);

    // Add local stream to existing connections
    Object.keys(this.remoteClients).forEach(clientId => {
      if (easyrtc.getConnectStatus(clientId) !== easyrtc.NOT_CONNECTED) {
        easyrtc.addStreamToCall(clientId, streamName);
      }
    });
  }

  removeLocalMediaStream(streamName) {
    console.log("BW73 removeLocalMediaStream ", streamName);
    this.easyrtc.closeLocalMediaStream(streamName);
    delete this.mediaStreams["local"][streamName];
  }

  enableMicrophone(enabled) {
    console.log("BW73 enableMicrophone ", enabled);
    this.easyrtc.enableMicrophone(enabled);
  }

  enableCamera(enabled) {
    console.log("BW73 enableCamera ", enabled);
    this.easyrtc.enableCamera(enabled);
  }

  disconnect() {
    console.log("BW73 disconnect ");
    this.easyrtc.disconnect();
  }

  async handleUserPublished(user, mediaType) {}

  handleUserUnpublished(user, mediaType) {
    console.log("BW73 handleUserUnPublished ");
  }

  async connectAgora() {
    // Add an event listener to play remote tracks when remote user publishes.
    var that = this;

    this.agoraClient = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
    if (this.enableVideoFiltered || this.enableVideo || this.enableAudio) {
      //this.agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      //this.agoraClient = AgoraRTC.createClient({ mode: "live", codec: "h264" });
      this.agoraClient.setClientRole("host");
    } else {
      //this.agoraClient = AgoraRTC.createClient({ mode: "live", codec: "h264" });
      //this.agoraClient = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
    }

    this.agoraClient.on("user-joined", async user => {
      console.warn("user-joined", user);
    });
    this.agoraClient.on("user-published", async (user, mediaType) => {

      let clientId = user.uid;
      console.log("BW73 handleUserPublished " + clientId + " " + mediaType, that.agoraClient);
      await that.agoraClient.subscribe(user, mediaType);
      console.log("BW73 handleUserPublished2 " + clientId + " " + that.agoraClient);

      const pendingMediaRequests = that.pendingMediaRequests.get(clientId);
      const clientMediaStreams = that.mediaStreams[clientId] = that.mediaStreams[clientId] || {};

      if (mediaType === 'audio') {
        user.audioTrack.play();

        const audioStream = new MediaStream();
        console.log("user.audioTrack ", user.audioTrack._mediaStreamTrack);
        //audioStream.addTrack(user.audioTrack._mediaStreamTrack);
        clientMediaStreams.audio = audioStream;
        if (pendingMediaRequests) pendingMediaRequests.audio.resolve(audioStream);
      }

      let videoStream = null;
      if (mediaType === 'video') {
        videoStream = new MediaStream();
        console.log("user.videoTrack ", user.videoTrack._mediaStreamTrack);
        videoStream.addTrack(user.videoTrack._mediaStreamTrack);
        clientMediaStreams.video = videoStream;
        if (pendingMediaRequests) pendingMediaRequests.video.resolve(videoStream);
        //user.videoTrack
      }

      if (clientId == 'CCC') {
        if (mediaType === 'video') {
          // document.getElementById("video360").srcObject=videoStream;
          //document.querySelector("#video360").setAttribute("src", videoStream);
          //document.querySelector("#video360").setAttribute("src", user.videoTrack._mediaStreamTrack);
          //document.querySelector("#video360").srcObject= user.videoTrack._mediaStreamTrack;
          document.querySelector("#video360").srcObject = videoStream;
          document.querySelector("#video360").play();
        }
        if (mediaType === 'audio') {
          user.audioTrack.play();
        }
      }
      if (clientId == 'DDD') {
        if (mediaType === 'video') {
          user.videoTrack.play("video360");
        }
        if (mediaType === 'audio') {
          user.audioTrack.play();
        }
      }
    });

    this.agoraClient.on("user-unpublished", that.handleUserUnpublished);

    console.log("connect agora ");
    // Join a channel and create local tracks. Best practice is to use Promise.all and run them concurrently.
    // o


    if (this.enableAvatar) {
      var stream = document.getElementById("canvas").captureStream(30);
      [this.userid, this.localTracks.audioTrack, this.localTracks.videoTrack] = await Promise.all([this.agoraClient.join(this.appid, this.room, this.token || null, this.clientId || null), AgoraRTC.createMicrophoneAudioTrack(), AgoraRTC.createCustomVideoTrack({ mediaStreamTrack: stream.getVideoTracks()[0] })]);
    } else if (this.enableVideoFiltered && this.enableAudio) {
      var stream = document.getElementById("canvas_secret").captureStream(30);
      [this.userid, this.localTracks.audioTrack, this.localTracks.videoTrack] = await Promise.all([this.agoraClient.join(this.appid, this.room, this.token || null, this.clientId || null), AgoraRTC.createMicrophoneAudioTrack(), AgoraRTC.createCustomVideoTrack({ mediaStreamTrack: stream.getVideoTracks()[0] })]);
    } else if (this.enableVideo && this.enableAudio) {
      [this.userid, this.localTracks.audioTrack, this.localTracks.videoTrack] = await Promise.all([this.agoraClient.join(this.appid, this.room, this.token || null, this.clientId || null), AgoraRTC.createMicrophoneAudioTrack(), AgoraRTC.createCameraVideoTrack({ encoderConfig: '480p_2' })]);
    } else if (this.enableVideo) {
      [this.userid, this.localTracks.videoTrack] = await Promise.all([
      // Join the channel.
      this.agoraClient.join(this.appid, this.room, this.token || null, this.clientId || null), AgoraRTC.createCameraVideoTrack("360p_4")]);
    } else if (this.enableAudio) {
      [this.userid, this.localTracks.audioTrack] = await Promise.all([
      // Join the channel.
      this.agoraClient.join(this.appid, this.room, this.token || null, this.clientId || null), AgoraRTC.createMicrophoneAudioTrack()]);
    } else {
      this.userid = await this.agoraClient.join(this.appid, this.room, this.token || null, this.clientId || null);
    }

    // select facetime camera if exists
    if (this.enableVideo && !this.enableVideoFiltered) {
      let cams = await AgoraRTC.getCameras();
      for (var i = 0; i < cams.length; i++) {
        if (cams[i].label.indexOf("FaceTime") == 0) {
          console.log("select FaceTime camera", cams[i].deviceId);
          await this.localTracks.videoTrack.setDevice(cams[i].deviceId);
        }
      }
    }

    if (this.enableVideo && this.showLocal) {
      this.localTracks.videoTrack.play("local-player");
    }

    // Enable virtual background OLD Method
    if (this.enableVideo && this.vbg0 && this.localTracks.videoTrack) {
      const imgElement = document.createElement('img');
      imgElement.onload = async () => {
        if (!this.virtualBackgroundInstance) {
          console.log("SEG INIT ", this.localTracks.videoTrack);
          this.virtualBackgroundInstance = await SegPlugin.inject(this.localTracks.videoTrack, "/assets/wasms0").catch(console.error);
          console.log("SEG INITED");
        }
        this.virtualBackgroundInstance.setOptions({ enable: true, background: imgElement });
      };
      imgElement.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAAD0lEQVR4XmNg+M+AQDg5AOk9C/VkomzYAAAAAElFTkSuQmCC';
    }

    // Enable virtual background New Method
    if (this.enableVideo && this.vbg && this.localTracks.videoTrack) {

      this.extension = new VirtualBackgroundExtension();
      AgoraRTC.registerExtensions([this.extension]);
      this.processor = this.extension.createProcessor();
      await this.processor.init("/assets/wasms");
      this.localTracks.videoTrack.pipe(this.processor).pipe(this.localTracks.videoTrack.processorDestination);
      await this.processor.setOptions({ type: 'color', color: "#00ff00" });
      await this.processor.enable();
    }

    window.localTracks = this.localTracks;

    console.error("ASS 2 ", window.localTracks);

    // Publish the local video and audio tracks to the channel.
    if (this.enableVideo || this.enableAudio || this.enableAvatar) {
      await this.agoraClient.publish(Object.values(this.localTracks));
      console.log("publish success");
    }
  }

  /**
   * Privates
   */

  async _connect(connectSuccess, connectFailure) {
    var that = this;

    await that.easyrtc.connect(that.app, connectSuccess, connectFailure);

    /*
       this.easyrtc.setStreamAcceptor(this.setMediaStream.bind(this));
       this.easyrtc.setOnStreamClosed(function(clientId, stream, streamName) {
        delete this.mediaStreams[clientId][streamName];
      });
       if (that.easyrtc.audioEnabled || that.easyrtc.videoEnabled) {
        navigator.mediaDevices.getUserMedia({
          video: that.easyrtc.videoEnabled,
          audio: that.easyrtc.audioEnabled
        }).then(
          function(stream) {
            that.addLocalMediaStream(stream, "default");
            that.easyrtc.connect(that.app, connectSuccess, connectFailure);
          },
          function(errorCode, errmesg) {
            NAF.log.error(errorCode, errmesg);
          }
        );
      } else {
        that.easyrtc.connect(that.app, connectSuccess, connectFailure);
      }
      */
  }

  _getRoomJoinTime(clientId) {
    var myRoomId = this.room; //NAF.room;
    var joinTime = this.easyrtc.getRoomOccupantsAsMap(myRoomId)[clientId].roomJoinTime;
    return joinTime;
  }

  getServerTime() {
    return Date.now() + this.avgTimeOffset;
  }
}

NAF.adapters.register("agorartc", AgoraRtcAdapter);

module.exports = AgoraRtcAdapter;

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIl0sIm5hbWVzIjpbIkFnb3JhUnRjQWRhcHRlciIsImNvbnN0cnVjdG9yIiwiZWFzeXJ0YyIsImNvbnNvbGUiLCJsb2ciLCJ3aW5kb3ciLCJhcHAiLCJyb29tIiwidXNlcmlkIiwiYXBwaWQiLCJtZWRpYVN0cmVhbXMiLCJyZW1vdGVDbGllbnRzIiwicGVuZGluZ01lZGlhUmVxdWVzdHMiLCJNYXAiLCJlbmFibGVWaWRlbyIsImVuYWJsZVZpZGVvRmlsdGVyZWQiLCJlbmFibGVBdWRpbyIsImVuYWJsZUF2YXRhciIsImxvY2FsVHJhY2tzIiwidmlkZW9UcmFjayIsImF1ZGlvVHJhY2siLCJlcnJvciIsInRva2VuIiwiY2xpZW50SWQiLCJ1aWQiLCJ2YmciLCJ2YmcwIiwic2hvd0xvY2FsIiwidmlydHVhbEJhY2tncm91bmRJbnN0YW5jZSIsImV4dGVuc2lvbiIsInByb2Nlc3NvciIsInBpcGVQcm9jZXNzb3IiLCJ0cmFjayIsInBpcGUiLCJwcm9jZXNzb3JEZXN0aW5hdGlvbiIsInNlcnZlclRpbWVSZXF1ZXN0cyIsInRpbWVPZmZzZXRzIiwiYXZnVGltZU9mZnNldCIsImFnb3JhQ2xpZW50Iiwic2V0UGVlck9wZW5MaXN0ZW5lciIsImNsaWVudENvbm5lY3Rpb24iLCJnZXRQZWVyQ29ubmVjdGlvbkJ5VXNlcklkIiwic2V0UGVlckNsb3NlZExpc3RlbmVyIiwic2V0U2VydmVyVXJsIiwidXJsIiwic2V0U29ja2V0VXJsIiwic2V0QXBwIiwiYXBwTmFtZSIsInNldFJvb20iLCJqc29uIiwicmVwbGFjZSIsIm9iaiIsIkpTT04iLCJwYXJzZSIsIm5hbWUiLCJBZ29yYVJUQyIsImxvYWRNb2R1bGUiLCJTZWdQbHVnaW4iLCJqb2luUm9vbSIsInNldFdlYlJ0Y09wdGlvbnMiLCJvcHRpb25zIiwiZW5hYmxlRGF0YUNoYW5uZWxzIiwiZGF0YWNoYW5uZWwiLCJ2aWRlbyIsImF1ZGlvIiwiZW5hYmxlVmlkZW9SZWNlaXZlIiwiZW5hYmxlQXVkaW9SZWNlaXZlIiwic2V0U2VydmVyQ29ubmVjdExpc3RlbmVycyIsInN1Y2Nlc3NMaXN0ZW5lciIsImZhaWx1cmVMaXN0ZW5lciIsImNvbm5lY3RTdWNjZXNzIiwiY29ubmVjdEZhaWx1cmUiLCJzZXRSb29tT2NjdXBhbnRMaXN0ZW5lciIsIm9jY3VwYW50TGlzdGVuZXIiLCJyb29tTmFtZSIsIm9jY3VwYW50cyIsInByaW1hcnkiLCJzZXREYXRhQ2hhbm5lbExpc3RlbmVycyIsIm9wZW5MaXN0ZW5lciIsImNsb3NlZExpc3RlbmVyIiwibWVzc2FnZUxpc3RlbmVyIiwic2V0RGF0YUNoYW5uZWxPcGVuTGlzdGVuZXIiLCJzZXREYXRhQ2hhbm5lbENsb3NlTGlzdGVuZXIiLCJzZXRQZWVyTGlzdGVuZXIiLCJ1cGRhdGVUaW1lT2Zmc2V0IiwiY2xpZW50U2VudFRpbWUiLCJEYXRlIiwibm93IiwiZmV0Y2giLCJkb2N1bWVudCIsImxvY2F0aW9uIiwiaHJlZiIsIm1ldGhvZCIsImNhY2hlIiwidGhlbiIsInJlcyIsInByZWNpc2lvbiIsInNlcnZlclJlY2VpdmVkVGltZSIsImhlYWRlcnMiLCJnZXQiLCJnZXRUaW1lIiwiY2xpZW50UmVjZWl2ZWRUaW1lIiwic2VydmVyVGltZSIsInRpbWVPZmZzZXQiLCJwdXNoIiwicmVkdWNlIiwiYWNjIiwib2Zmc2V0IiwibGVuZ3RoIiwic2V0VGltZW91dCIsImNvbm5lY3QiLCJQcm9taXNlIiwiYWxsIiwicmVzb2x2ZSIsInJlamVjdCIsIl9jb25uZWN0IiwiXyIsIl9teVJvb21Kb2luVGltZSIsIl9nZXRSb29tSm9pblRpbWUiLCJjb25uZWN0QWdvcmEiLCJjYXRjaCIsInNob3VsZFN0YXJ0Q29ubmVjdGlvblRvIiwiY2xpZW50Iiwicm9vbUpvaW5UaW1lIiwic3RhcnRTdHJlYW1Db25uZWN0aW9uIiwiY2FsbCIsImNhbGxlciIsIm1lZGlhIiwiTkFGIiwid3JpdGUiLCJlcnJvckNvZGUiLCJlcnJvclRleHQiLCJ3YXNBY2NlcHRlZCIsImNsb3NlU3RyZWFtQ29ubmVjdGlvbiIsImhhbmd1cCIsInNlbmREYXRhIiwiZGF0YVR5cGUiLCJkYXRhIiwic2VuZERhdGFHdWFyYW50ZWVkIiwic2VuZERhdGFXUyIsImJyb2FkY2FzdERhdGEiLCJyb29tT2NjdXBhbnRzIiwiZ2V0Um9vbU9jY3VwYW50c0FzTWFwIiwicm9vbU9jY3VwYW50IiwibXlFYXN5cnRjaWQiLCJicm9hZGNhc3REYXRhR3VhcmFudGVlZCIsImRlc3RpbmF0aW9uIiwidGFyZ2V0Um9vbSIsImdldENvbm5lY3RTdGF0dXMiLCJzdGF0dXMiLCJJU19DT05ORUNURUQiLCJhZGFwdGVycyIsIk5PVF9DT05ORUNURUQiLCJDT05ORUNUSU5HIiwiZ2V0TWVkaWFTdHJlYW0iLCJzdHJlYW1OYW1lIiwiaGFzIiwiYXVkaW9Qcm9taXNlIiwiZSIsIndhcm4iLCJwcm9taXNlIiwidmlkZW9Qcm9taXNlIiwic2V0Iiwic3RyZWFtUHJvbWlzZSIsInNldE1lZGlhU3RyZWFtIiwic3RyZWFtIiwiY2xpZW50TWVkaWFTdHJlYW1zIiwiYXVkaW9UcmFja3MiLCJnZXRBdWRpb1RyYWNrcyIsImF1ZGlvU3RyZWFtIiwiTWVkaWFTdHJlYW0iLCJmb3JFYWNoIiwiYWRkVHJhY2siLCJ2aWRlb1RyYWNrcyIsImdldFZpZGVvVHJhY2tzIiwidmlkZW9TdHJlYW0iLCJhZGRMb2NhbE1lZGlhU3RyZWFtIiwiaWQiLCJyZWdpc3RlcjNyZFBhcnR5TG9jYWxNZWRpYVN0cmVhbSIsIk9iamVjdCIsImtleXMiLCJhZGRTdHJlYW1Ub0NhbGwiLCJyZW1vdmVMb2NhbE1lZGlhU3RyZWFtIiwiY2xvc2VMb2NhbE1lZGlhU3RyZWFtIiwiZW5hYmxlTWljcm9waG9uZSIsImVuYWJsZWQiLCJlbmFibGVDYW1lcmEiLCJkaXNjb25uZWN0IiwiaGFuZGxlVXNlclB1Ymxpc2hlZCIsInVzZXIiLCJtZWRpYVR5cGUiLCJoYW5kbGVVc2VyVW5wdWJsaXNoZWQiLCJ0aGF0IiwiY3JlYXRlQ2xpZW50IiwibW9kZSIsImNvZGVjIiwic2V0Q2xpZW50Um9sZSIsIm9uIiwic3Vic2NyaWJlIiwicGxheSIsIl9tZWRpYVN0cmVhbVRyYWNrIiwicXVlcnlTZWxlY3RvciIsInNyY09iamVjdCIsImdldEVsZW1lbnRCeUlkIiwiY2FwdHVyZVN0cmVhbSIsImpvaW4iLCJjcmVhdGVNaWNyb3Bob25lQXVkaW9UcmFjayIsImNyZWF0ZUN1c3RvbVZpZGVvVHJhY2siLCJtZWRpYVN0cmVhbVRyYWNrIiwiY3JlYXRlQ2FtZXJhVmlkZW9UcmFjayIsImVuY29kZXJDb25maWciLCJjYW1zIiwiZ2V0Q2FtZXJhcyIsImkiLCJsYWJlbCIsImluZGV4T2YiLCJkZXZpY2VJZCIsInNldERldmljZSIsImltZ0VsZW1lbnQiLCJjcmVhdGVFbGVtZW50Iiwib25sb2FkIiwiaW5qZWN0Iiwic2V0T3B0aW9ucyIsImVuYWJsZSIsImJhY2tncm91bmQiLCJzcmMiLCJWaXJ0dWFsQmFja2dyb3VuZEV4dGVuc2lvbiIsInJlZ2lzdGVyRXh0ZW5zaW9ucyIsImNyZWF0ZVByb2Nlc3NvciIsImluaXQiLCJ0eXBlIiwiY29sb3IiLCJwdWJsaXNoIiwidmFsdWVzIiwibXlSb29tSWQiLCJqb2luVGltZSIsImdldFNlcnZlclRpbWUiLCJyZWdpc3RlciIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7UUFBQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTs7O1FBR0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDBDQUEwQyxnQ0FBZ0M7UUFDMUU7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSx3REFBd0Qsa0JBQWtCO1FBQzFFO1FBQ0EsaURBQWlELGNBQWM7UUFDL0Q7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFD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VUFBTUEsS0FBSzlMLE9BQUwsQ0FBYTRHLE9BQWIsQ0FBcUJrRixLQUFLMUwsR0FBMUIsRUFBK0JnRSxjQUEvQixFQUErQ0MsY0FBL0MsQ0FBTjs7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXNCRDs7QUFFRCtDLG1CQUFpQi9GLFFBQWpCLEVBQTJCO0FBQ3pCLFFBQUltTixXQUFXLEtBQUtuTyxJQUFwQixDQUR5QixDQUNDO0FBQzFCLFFBQUlvTyxXQUFXLEtBQUt6TyxPQUFMLENBQWE0SSxxQkFBYixDQUFtQzRGLFFBQW5DLEVBQTZDbk4sUUFBN0MsRUFBdURvRyxZQUF0RTtBQUNBLFdBQU9nSCxRQUFQO0FBQ0Q7O0FBRURDLGtCQUFnQjtBQUNkLFdBQU90SixLQUFLQyxHQUFMLEtBQWEsS0FBS2xELGFBQXpCO0FBQ0Q7QUF6akJtQjs7QUE0akJ0QjJGLElBQUl1QixRQUFKLENBQWFzRixRQUFiLENBQXNCLFVBQXRCLEVBQWtDN08sZUFBbEM7O0FBRUE4TyxPQUFPQyxPQUFQLEdBQWlCL08sZUFBakIsQyIsImZpbGUiOiJuYWYtYWdvcmEtYWRhcHRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL2luZGV4LmpzXCIpO1xuIiwiY2xhc3MgQWdvcmFSdGNBZGFwdGVyIHtcblxuICBjb25zdHJ1Y3RvcihlYXN5cnRjKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGNvbnN0cnVjdG9yIFwiLCBlYXN5cnRjKTtcblxuICAgIHRoaXMuZWFzeXJ0YyA9IGVhc3lydGMgfHwgd2luZG93LmVhc3lydGM7XG4gICAgdGhpcy5hcHAgPSBcImRlZmF1bHRcIjtcbiAgICB0aGlzLnJvb20gPSBcImRlZmF1bHRcIjtcbiAgICB0aGlzLnVzZXJpZCA9IDA7XG4gICAgdGhpcy5hcHBpZCA9IG51bGw7XG5cbiAgICB0aGlzLm1lZGlhU3RyZWFtcyA9IHt9O1xuICAgIHRoaXMucmVtb3RlQ2xpZW50cyA9IHt9O1xuICAgIHRoaXMucGVuZGluZ01lZGlhUmVxdWVzdHMgPSBuZXcgTWFwKCk7XG5cbiAgICB0aGlzLmVuYWJsZVZpZGVvID0gZmFsc2U7XG4gICAgdGhpcy5lbmFibGVWaWRlb0ZpbHRlcmVkID0gZmFsc2U7XG4gICAgdGhpcy5lbmFibGVBdWRpbyA9IGZhbHNlO1xuICAgIHRoaXMuZW5hYmxlQXZhdGFyID0gZmFsc2U7XG5cbiAgICB0aGlzLmxvY2FsVHJhY2tzID0geyB2aWRlb1RyYWNrOiBudWxsLCBhdWRpb1RyYWNrOiBudWxsIH07XG4gICAgd2luZG93LmxvY2FsVHJhY2tzID0gdGhpcy5sb2NhbFRyYWNrcztcbiAgICBjb25zb2xlLmVycm9yKFwiQVNTIFwiLCB3aW5kb3cubG9jYWxUcmFja3MpO1xuICAgIHRoaXMudG9rZW4gPSBudWxsO1xuICAgIHRoaXMuY2xpZW50SWQgPSBudWxsO1xuICAgIHRoaXMudWlkID0gbnVsbDtcbiAgICB0aGlzLnZiZyA9IGZhbHNlO1xuICAgIHRoaXMudmJnMCA9IGZhbHNlO1xuICAgIHRoaXMuc2hvd0xvY2FsID0gZmFsc2U7XG4gICAgdGhpcy52aXJ0dWFsQmFja2dyb3VuZEluc3RhbmNlID0gbnVsbDtcbiAgICB0aGlzLmV4dGVuc2lvbiA9IG51bGw7XG4gICAgdGhpcy5wcm9jZXNzb3IgPSBudWxsO1xuICAgIHRoaXMucGlwZVByb2Nlc3NvciA9ICh0cmFjaywgcHJvY2Vzc29yKSA9PiB7XG4gICAgICB0cmFjay5waXBlKHByb2Nlc3NvcikucGlwZSh0cmFjay5wcm9jZXNzb3JEZXN0aW5hdGlvbik7XG4gICAgfVxuXG5cbiAgICB0aGlzLnNlcnZlclRpbWVSZXF1ZXN0cyA9IDA7XG4gICAgdGhpcy50aW1lT2Zmc2V0cyA9IFtdO1xuICAgIHRoaXMuYXZnVGltZU9mZnNldCA9IDA7XG4gICAgdGhpcy5hZ29yYUNsaWVudCA9IG51bGw7XG5cbiAgICB0aGlzLmVhc3lydGMuc2V0UGVlck9wZW5MaXN0ZW5lcihjbGllbnRJZCA9PiB7XG4gICAgICBjb25zdCBjbGllbnRDb25uZWN0aW9uID0gdGhpcy5lYXN5cnRjLmdldFBlZXJDb25uZWN0aW9uQnlVc2VySWQoY2xpZW50SWQpO1xuICAgICAgdGhpcy5yZW1vdGVDbGllbnRzW2NsaWVudElkXSA9IGNsaWVudENvbm5lY3Rpb247XG4gICAgfSk7XG5cbiAgICB0aGlzLmVhc3lydGMuc2V0UGVlckNsb3NlZExpc3RlbmVyKGNsaWVudElkID0+IHtcbiAgICAgIGRlbGV0ZSB0aGlzLnJlbW90ZUNsaWVudHNbY2xpZW50SWRdO1xuICAgIH0pO1xuICB9XG5cbiAgc2V0U2VydmVyVXJsKHVybCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXRTZXJ2ZXJVcmwgXCIsIHVybCk7XG4gICAgdGhpcy5lYXN5cnRjLnNldFNvY2tldFVybCh1cmwpO1xuICB9XG5cbiAgc2V0QXBwKGFwcE5hbWUpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0QXBwIFwiLCBhcHBOYW1lKTtcbiAgICB0aGlzLmFwcCA9IGFwcE5hbWU7XG4gICAgdGhpcy5hcHBpZCA9IGFwcE5hbWU7XG4gIH1cblxuICBhc3luYyBzZXRSb29tKGpzb24pIHtcbiAgICBqc29uID0ganNvbi5yZXBsYWNlKC8nL2csICdcIicpO1xuICAgIGNvbnN0IG9iaiA9IEpTT04ucGFyc2UoanNvbik7XG4gICAgdGhpcy5yb29tID0gb2JqLm5hbWU7XG5cbiAgICBpZiAob2JqLnZiZyAmJiBvYmoudmJnPT0ndHJ1ZScgKSB7ICAgICAgXG4gICAgICB0aGlzLnZiZyA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKG9iai52YmcwICYmIG9iai52YmcwPT0ndHJ1ZScgKSB7XG4gICAgICB0aGlzLnZiZzAgPSB0cnVlO1xuICAgICAgQWdvcmFSVEMubG9hZE1vZHVsZShTZWdQbHVnaW4sIHt9KTtcbiAgICB9XG5cbiAgICBpZiAob2JqLmVuYWJsZUF2YXRhciAmJiBvYmouZW5hYmxlQXZhdGFyPT0ndHJ1ZScgKSB7XG4gICAgICB0aGlzLmVuYWJsZUF2YXRhciA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKG9iai5zaG93TG9jYWwgICYmIG9iai5zaG93TG9jYWw9PSd0cnVlJykge1xuICAgICAgdGhpcy5zaG93TG9jYWwgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChvYmouZW5hYmxlVmlkZW9GaWx0ZXJlZCAmJiBvYmouZW5hYmxlVmlkZW9GaWx0ZXJlZD09J3RydWUnICkge1xuICAgICAgdGhpcy5lbmFibGVWaWRlb0ZpbHRlcmVkID0gdHJ1ZTtcbiAgICB9XG4gICAgdGhpcy5lYXN5cnRjLmpvaW5Sb29tKHRoaXMucm9vbSwgbnVsbCk7XG4gIH1cblxuICAvLyBvcHRpb25zOiB7IGRhdGFjaGFubmVsOiBib29sLCBhdWRpbzogYm9vbCwgdmlkZW86IGJvb2wgfVxuICBzZXRXZWJSdGNPcHRpb25zKG9wdGlvbnMpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0V2ViUnRjT3B0aW9ucyBcIiwgb3B0aW9ucyk7XG4gICAgLy8gdGhpcy5lYXN5cnRjLmVuYWJsZURlYnVnKHRydWUpO1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVEYXRhQ2hhbm5lbHMob3B0aW9ucy5kYXRhY2hhbm5lbCk7XG5cbiAgICAvLyB1c2luZyBBZ29yYVxuICAgIHRoaXMuZW5hYmxlVmlkZW8gPSBvcHRpb25zLnZpZGVvO1xuICAgIHRoaXMuZW5hYmxlQXVkaW8gPSBvcHRpb25zLmF1ZGlvO1xuXG4gICAgLy8gbm90IGVhc3lydGNcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlVmlkZW8oZmFsc2UpO1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVBdWRpbyhmYWxzZSk7XG4gICAgdGhpcy5lYXN5cnRjLmVuYWJsZVZpZGVvUmVjZWl2ZShmYWxzZSk7XG4gICAgdGhpcy5lYXN5cnRjLmVuYWJsZUF1ZGlvUmVjZWl2ZShmYWxzZSk7XG4gIH1cblxuICBzZXRTZXJ2ZXJDb25uZWN0TGlzdGVuZXJzKHN1Y2Nlc3NMaXN0ZW5lciwgZmFpbHVyZUxpc3RlbmVyKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNldFNlcnZlckNvbm5lY3RMaXN0ZW5lcnMgXCIsIHN1Y2Nlc3NMaXN0ZW5lciwgZmFpbHVyZUxpc3RlbmVyKTtcbiAgICB0aGlzLmNvbm5lY3RTdWNjZXNzID0gc3VjY2Vzc0xpc3RlbmVyO1xuICAgIHRoaXMuY29ubmVjdEZhaWx1cmUgPSBmYWlsdXJlTGlzdGVuZXI7XG4gIH1cblxuICBzZXRSb29tT2NjdXBhbnRMaXN0ZW5lcihvY2N1cGFudExpc3RlbmVyKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNldFJvb21PY2N1cGFudExpc3RlbmVyIFwiLCBvY2N1cGFudExpc3RlbmVyKTtcblxuICAgIHRoaXMuZWFzeXJ0Yy5zZXRSb29tT2NjdXBhbnRMaXN0ZW5lcihmdW5jdGlvbiAocm9vbU5hbWUsIG9jY3VwYW50cywgcHJpbWFyeSkge1xuICAgICAgb2NjdXBhbnRMaXN0ZW5lcihvY2N1cGFudHMpO1xuICAgIH0pO1xuICB9XG5cbiAgc2V0RGF0YUNoYW5uZWxMaXN0ZW5lcnMob3Blbkxpc3RlbmVyLCBjbG9zZWRMaXN0ZW5lciwgbWVzc2FnZUxpc3RlbmVyKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNldERhdGFDaGFubmVsTGlzdGVuZXJzICBcIiwgb3Blbkxpc3RlbmVyLCBjbG9zZWRMaXN0ZW5lciwgbWVzc2FnZUxpc3RlbmVyKTtcbiAgICB0aGlzLmVhc3lydGMuc2V0RGF0YUNoYW5uZWxPcGVuTGlzdGVuZXIob3Blbkxpc3RlbmVyKTtcbiAgICB0aGlzLmVhc3lydGMuc2V0RGF0YUNoYW5uZWxDbG9zZUxpc3RlbmVyKGNsb3NlZExpc3RlbmVyKTtcbiAgICB0aGlzLmVhc3lydGMuc2V0UGVlckxpc3RlbmVyKG1lc3NhZ2VMaXN0ZW5lcik7XG4gIH1cblxuICB1cGRhdGVUaW1lT2Zmc2V0KCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyB1cGRhdGVUaW1lT2Zmc2V0IFwiKTtcbiAgICBjb25zdCBjbGllbnRTZW50VGltZSA9IERhdGUubm93KCkgKyB0aGlzLmF2Z1RpbWVPZmZzZXQ7XG5cbiAgICByZXR1cm4gZmV0Y2goZG9jdW1lbnQubG9jYXRpb24uaHJlZiwgeyBtZXRob2Q6IFwiSEVBRFwiLCBjYWNoZTogXCJuby1jYWNoZVwiIH0pLnRoZW4ocmVzID0+IHtcbiAgICAgIHZhciBwcmVjaXNpb24gPSAxMDAwO1xuICAgICAgdmFyIHNlcnZlclJlY2VpdmVkVGltZSA9IG5ldyBEYXRlKHJlcy5oZWFkZXJzLmdldChcIkRhdGVcIikpLmdldFRpbWUoKSArIHByZWNpc2lvbiAvIDI7XG4gICAgICB2YXIgY2xpZW50UmVjZWl2ZWRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgIHZhciBzZXJ2ZXJUaW1lID0gc2VydmVyUmVjZWl2ZWRUaW1lICsgKGNsaWVudFJlY2VpdmVkVGltZSAtIGNsaWVudFNlbnRUaW1lKSAvIDI7XG4gICAgICB2YXIgdGltZU9mZnNldCA9IHNlcnZlclRpbWUgLSBjbGllbnRSZWNlaXZlZFRpbWU7XG5cbiAgICAgIHRoaXMuc2VydmVyVGltZVJlcXVlc3RzKys7XG5cbiAgICAgIGlmICh0aGlzLnNlcnZlclRpbWVSZXF1ZXN0cyA8PSAxMCkge1xuICAgICAgICB0aGlzLnRpbWVPZmZzZXRzLnB1c2godGltZU9mZnNldCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnRpbWVPZmZzZXRzW3RoaXMuc2VydmVyVGltZVJlcXVlc3RzICUgMTBdID0gdGltZU9mZnNldDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5hdmdUaW1lT2Zmc2V0ID0gdGhpcy50aW1lT2Zmc2V0cy5yZWR1Y2UoKGFjYywgb2Zmc2V0KSA9PiBhY2MgKz0gb2Zmc2V0LCAwKSAvIHRoaXMudGltZU9mZnNldHMubGVuZ3RoO1xuXG4gICAgICBpZiAodGhpcy5zZXJ2ZXJUaW1lUmVxdWVzdHMgPiAxMCkge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMudXBkYXRlVGltZU9mZnNldCgpLCA1ICogNjAgKiAxMDAwKTsgLy8gU3luYyBjbG9jayBldmVyeSA1IG1pbnV0ZXMuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnVwZGF0ZVRpbWVPZmZzZXQoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGNvbm5lY3QoKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGNvbm5lY3QgXCIpO1xuICAgIFByb21pc2UuYWxsKFt0aGlzLnVwZGF0ZVRpbWVPZmZzZXQoKSwgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5fY29ubmVjdChyZXNvbHZlLCByZWplY3QpO1xuICAgIH0pXSkudGhlbigoW18sIGNsaWVudElkXSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJCVzczIGNvbm5lY3RlZCBcIiArIGNsaWVudElkKTtcbiAgICAgIHRoaXMuY2xpZW50SWQgPSBjbGllbnRJZDtcbiAgICAgIHRoaXMuX215Um9vbUpvaW5UaW1lID0gdGhpcy5fZ2V0Um9vbUpvaW5UaW1lKGNsaWVudElkKTtcbiAgICAgIHRoaXMuY29ubmVjdEFnb3JhKCk7XG4gICAgICB0aGlzLmNvbm5lY3RTdWNjZXNzKGNsaWVudElkKTtcbiAgICB9KS5jYXRjaCh0aGlzLmNvbm5lY3RGYWlsdXJlKTtcbiAgfVxuXG4gIHNob3VsZFN0YXJ0Q29ubmVjdGlvblRvKGNsaWVudCkge1xuICAgIHJldHVybiB0aGlzLl9teVJvb21Kb2luVGltZSA8PSBjbGllbnQucm9vbUpvaW5UaW1lO1xuICB9XG5cbiAgc3RhcnRTdHJlYW1Db25uZWN0aW9uKGNsaWVudElkKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHN0YXJ0U3RyZWFtQ29ubmVjdGlvbiBcIiwgY2xpZW50SWQpO1xuICAgIHRoaXMuZWFzeXJ0Yy5jYWxsKGNsaWVudElkLCBmdW5jdGlvbiAoY2FsbGVyLCBtZWRpYSkge1xuICAgICAgaWYgKG1lZGlhID09PSBcImRhdGFjaGFubmVsXCIpIHtcbiAgICAgICAgTkFGLmxvZy53cml0ZShcIlN1Y2Nlc3NmdWxseSBzdGFydGVkIGRhdGFjaGFubmVsIHRvIFwiLCBjYWxsZXIpO1xuICAgICAgfVxuICAgIH0sIGZ1bmN0aW9uIChlcnJvckNvZGUsIGVycm9yVGV4dCkge1xuICAgICAgTkFGLmxvZy5lcnJvcihlcnJvckNvZGUsIGVycm9yVGV4dCk7XG4gICAgfSwgZnVuY3Rpb24gKHdhc0FjY2VwdGVkKSB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIndhcyBhY2NlcHRlZD1cIiArIHdhc0FjY2VwdGVkKTtcbiAgICB9KTtcbiAgfVxuXG4gIGNsb3NlU3RyZWFtQ29ubmVjdGlvbihjbGllbnRJZCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBjbG9zZVN0cmVhbUNvbm5lY3Rpb24gXCIsIGNsaWVudElkKTtcbiAgICB0aGlzLmVhc3lydGMuaGFuZ3VwKGNsaWVudElkKTtcbiAgfVxuXG4gIHNlbmREYXRhKGNsaWVudElkLCBkYXRhVHlwZSwgZGF0YSkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZW5kRGF0YSBcIiwgY2xpZW50SWQsIGRhdGFUeXBlLCBkYXRhKTtcbiAgICAvLyBzZW5kIHZpYSB3ZWJydGMgb3RoZXJ3aXNlIGZhbGxiYWNrIHRvIHdlYnNvY2tldHNcbiAgICB0aGlzLmVhc3lydGMuc2VuZERhdGEoY2xpZW50SWQsIGRhdGFUeXBlLCBkYXRhKTtcbiAgfVxuXG4gIHNlbmREYXRhR3VhcmFudGVlZChjbGllbnRJZCwgZGF0YVR5cGUsIGRhdGEpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2VuZERhdGFHdWFyYW50ZWVkIFwiLCBjbGllbnRJZCwgZGF0YVR5cGUsIGRhdGEpO1xuICAgIHRoaXMuZWFzeXJ0Yy5zZW5kRGF0YVdTKGNsaWVudElkLCBkYXRhVHlwZSwgZGF0YSk7XG4gIH1cblxuICBicm9hZGNhc3REYXRhKGRhdGFUeXBlLCBkYXRhKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGJyb2FkY2FzdERhdGEgXCIsIGRhdGFUeXBlLCBkYXRhKTtcbiAgICB2YXIgcm9vbU9jY3VwYW50cyA9IHRoaXMuZWFzeXJ0Yy5nZXRSb29tT2NjdXBhbnRzQXNNYXAodGhpcy5yb29tKTtcblxuICAgIC8vIEl0ZXJhdGUgb3ZlciB0aGUga2V5cyBvZiB0aGUgZWFzeXJ0YyByb29tIG9jY3VwYW50cyBtYXAuXG4gICAgLy8gZ2V0Um9vbU9jY3VwYW50c0FzQXJyYXkgdXNlcyBPYmplY3Qua2V5cyB3aGljaCBhbGxvY2F0ZXMgbWVtb3J5LlxuICAgIGZvciAodmFyIHJvb21PY2N1cGFudCBpbiByb29tT2NjdXBhbnRzKSB7XG4gICAgICBpZiAocm9vbU9jY3VwYW50c1tyb29tT2NjdXBhbnRdICYmIHJvb21PY2N1cGFudCAhPT0gdGhpcy5lYXN5cnRjLm15RWFzeXJ0Y2lkKSB7XG4gICAgICAgIC8vIHNlbmQgdmlhIHdlYnJ0YyBvdGhlcndpc2UgZmFsbGJhY2sgdG8gd2Vic29ja2V0c1xuICAgICAgICB0aGlzLmVhc3lydGMuc2VuZERhdGEocm9vbU9jY3VwYW50LCBkYXRhVHlwZSwgZGF0YSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYnJvYWRjYXN0RGF0YUd1YXJhbnRlZWQoZGF0YVR5cGUsIGRhdGEpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgYnJvYWRjYXN0RGF0YUd1YXJhbnRlZWQgXCIsIGRhdGFUeXBlLCBkYXRhKTtcbiAgICB2YXIgZGVzdGluYXRpb24gPSB7IHRhcmdldFJvb206IHRoaXMucm9vbSB9O1xuICAgIHRoaXMuZWFzeXJ0Yy5zZW5kRGF0YVdTKGRlc3RpbmF0aW9uLCBkYXRhVHlwZSwgZGF0YSk7XG4gIH1cblxuICBnZXRDb25uZWN0U3RhdHVzKGNsaWVudElkKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGdldENvbm5lY3RTdGF0dXMgXCIsIGNsaWVudElkKTtcbiAgICB2YXIgc3RhdHVzID0gdGhpcy5lYXN5cnRjLmdldENvbm5lY3RTdGF0dXMoY2xpZW50SWQpO1xuXG4gICAgaWYgKHN0YXR1cyA9PSB0aGlzLmVhc3lydGMuSVNfQ09OTkVDVEVEKSB7XG4gICAgICByZXR1cm4gTkFGLmFkYXB0ZXJzLklTX0NPTk5FQ1RFRDtcbiAgICB9IGVsc2UgaWYgKHN0YXR1cyA9PSB0aGlzLmVhc3lydGMuTk9UX0NPTk5FQ1RFRCkge1xuICAgICAgcmV0dXJuIE5BRi5hZGFwdGVycy5OT1RfQ09OTkVDVEVEO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gTkFGLmFkYXB0ZXJzLkNPTk5FQ1RJTkc7XG4gICAgfVxuICB9XG5cbiAgZ2V0TWVkaWFTdHJlYW0oY2xpZW50SWQsIHN0cmVhbU5hbWUgPSBcImF1ZGlvXCIpIHtcblxuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBnZXRNZWRpYVN0cmVhbSBcIiwgY2xpZW50SWQsIHN0cmVhbU5hbWUpO1xuICAgIC8vIGlmICggc3RyZWFtTmFtZSA9IFwiYXVkaW9cIikge1xuICAgIC8vc3RyZWFtTmFtZSA9IFwiYm9kX2F1ZGlvXCI7XG4gICAgLy99XG5cbiAgICBpZiAodGhpcy5tZWRpYVN0cmVhbXNbY2xpZW50SWRdICYmIHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXVtzdHJlYW1OYW1lXSkge1xuICAgICAgTkFGLmxvZy53cml0ZShgQWxyZWFkeSBoYWQgJHtzdHJlYW1OYW1lfSBmb3IgJHtjbGllbnRJZH1gKTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5tZWRpYVN0cmVhbXNbY2xpZW50SWRdW3N0cmVhbU5hbWVdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgTkFGLmxvZy53cml0ZShgV2FpdGluZyBvbiAke3N0cmVhbU5hbWV9IGZvciAke2NsaWVudElkfWApO1xuXG4gICAgICAvLyBDcmVhdGUgaW5pdGlhbCBwZW5kaW5nTWVkaWFSZXF1ZXN0cyB3aXRoIGF1ZGlvfHZpZGVvIGFsaWFzXG4gICAgICBpZiAoIXRoaXMucGVuZGluZ01lZGlhUmVxdWVzdHMuaGFzKGNsaWVudElkKSkge1xuICAgICAgICBjb25zdCBwZW5kaW5nTWVkaWFSZXF1ZXN0cyA9IHt9O1xuXG4gICAgICAgIGNvbnN0IGF1ZGlvUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0cy5hdWRpbyA9IHsgcmVzb2x2ZSwgcmVqZWN0IH07XG4gICAgICAgIH0pLmNhdGNoKGUgPT4gTkFGLmxvZy53YXJuKGAke2NsaWVudElkfSBnZXRNZWRpYVN0cmVhbSBBdWRpbyBFcnJvcmAsIGUpKTtcblxuICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0cy5hdWRpby5wcm9taXNlID0gYXVkaW9Qcm9taXNlO1xuXG4gICAgICAgIGNvbnN0IHZpZGVvUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0cy52aWRlbyA9IHsgcmVzb2x2ZSwgcmVqZWN0IH07XG4gICAgICAgIH0pLmNhdGNoKGUgPT4gTkFGLmxvZy53YXJuKGAke2NsaWVudElkfSBnZXRNZWRpYVN0cmVhbSBWaWRlbyBFcnJvcmAsIGUpKTtcbiAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHMudmlkZW8ucHJvbWlzZSA9IHZpZGVvUHJvbWlzZTtcblxuICAgICAgICB0aGlzLnBlbmRpbmdNZWRpYVJlcXVlc3RzLnNldChjbGllbnRJZCwgcGVuZGluZ01lZGlhUmVxdWVzdHMpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwZW5kaW5nTWVkaWFSZXF1ZXN0cyA9IHRoaXMucGVuZGluZ01lZGlhUmVxdWVzdHMuZ2V0KGNsaWVudElkKTtcblxuICAgICAgLy8gQ3JlYXRlIGluaXRpYWwgcGVuZGluZ01lZGlhUmVxdWVzdHMgd2l0aCBzdHJlYW1OYW1lXG4gICAgICBpZiAoIXBlbmRpbmdNZWRpYVJlcXVlc3RzW3N0cmVhbU5hbWVdKSB7XG4gICAgICAgIGNvbnN0IHN0cmVhbVByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHNbc3RyZWFtTmFtZV0gPSB7IHJlc29sdmUsIHJlamVjdCB9O1xuICAgICAgICB9KS5jYXRjaChlID0+IE5BRi5sb2cud2FybihgJHtjbGllbnRJZH0gZ2V0TWVkaWFTdHJlYW0gXCIke3N0cmVhbU5hbWV9XCIgRXJyb3JgLCBlKSk7XG4gICAgICAgIHBlbmRpbmdNZWRpYVJlcXVlc3RzW3N0cmVhbU5hbWVdLnByb21pc2UgPSBzdHJlYW1Qcm9taXNlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5wZW5kaW5nTWVkaWFSZXF1ZXN0cy5nZXQoY2xpZW50SWQpW3N0cmVhbU5hbWVdLnByb21pc2U7XG4gICAgfVxuICB9XG5cbiAgc2V0TWVkaWFTdHJlYW0oY2xpZW50SWQsIHN0cmVhbSwgc3RyZWFtTmFtZSkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXRNZWRpYVN0cmVhbSBcIiwgY2xpZW50SWQsIHN0cmVhbSwgc3RyZWFtTmFtZSk7XG4gICAgY29uc3QgcGVuZGluZ01lZGlhUmVxdWVzdHMgPSB0aGlzLnBlbmRpbmdNZWRpYVJlcXVlc3RzLmdldChjbGllbnRJZCk7IC8vIHJldHVybiB1bmRlZmluZWQgaWYgdGhlcmUgaXMgbm8gZW50cnkgaW4gdGhlIE1hcFxuICAgIGNvbnN0IGNsaWVudE1lZGlhU3RyZWFtcyA9IHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXSA9IHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXSB8fCB7fTtcblxuICAgIGlmIChzdHJlYW1OYW1lID09PSAnZGVmYXVsdCcpIHtcbiAgICAgIC8vIFNhZmFyaSBkb2Vzbid0IGxpa2UgaXQgd2hlbiB5b3UgdXNlIGEgbWl4ZWQgbWVkaWEgc3RyZWFtIHdoZXJlIG9uZSBvZiB0aGUgdHJhY2tzIGlzIGluYWN0aXZlLCBzbyB3ZVxuICAgICAgLy8gc3BsaXQgdGhlIHRyYWNrcyBpbnRvIHR3byBzdHJlYW1zLlxuICAgICAgLy8gQWRkIG1lZGlhU3RyZWFtcyBhdWRpbyBzdHJlYW1OYW1lIGFsaWFzXG4gICAgICBjb25zdCBhdWRpb1RyYWNrcyA9IHN0cmVhbS5nZXRBdWRpb1RyYWNrcygpO1xuICAgICAgaWYgKGF1ZGlvVHJhY2tzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgYXVkaW9TdHJlYW0gPSBuZXcgTWVkaWFTdHJlYW0oKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhdWRpb1RyYWNrcy5mb3JFYWNoKHRyYWNrID0+IGF1ZGlvU3RyZWFtLmFkZFRyYWNrKHRyYWNrKSk7XG4gICAgICAgICAgY2xpZW50TWVkaWFTdHJlYW1zLmF1ZGlvID0gYXVkaW9TdHJlYW07XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBOQUYubG9nLndhcm4oYCR7Y2xpZW50SWR9IHNldE1lZGlhU3RyZWFtIFwiYXVkaW9cIiBhbGlhcyBFcnJvcmAsIGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVzb2x2ZSB0aGUgcHJvbWlzZSBmb3IgdGhlIHVzZXIncyBtZWRpYSBzdHJlYW0gYXVkaW8gYWxpYXMgaWYgaXQgZXhpc3RzLlxuICAgICAgICBpZiAocGVuZGluZ01lZGlhUmVxdWVzdHMpIHBlbmRpbmdNZWRpYVJlcXVlc3RzLmF1ZGlvLnJlc29sdmUoYXVkaW9TdHJlYW0pO1xuICAgICAgfVxuXG4gICAgICAvLyBBZGQgbWVkaWFTdHJlYW1zIHZpZGVvIHN0cmVhbU5hbWUgYWxpYXNcbiAgICAgIGNvbnN0IHZpZGVvVHJhY2tzID0gc3RyZWFtLmdldFZpZGVvVHJhY2tzKCk7XG4gICAgICBpZiAodmlkZW9UcmFja3MubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCB2aWRlb1N0cmVhbSA9IG5ldyBNZWRpYVN0cmVhbSgpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHZpZGVvVHJhY2tzLmZvckVhY2godHJhY2sgPT4gdmlkZW9TdHJlYW0uYWRkVHJhY2sodHJhY2spKTtcbiAgICAgICAgICBjbGllbnRNZWRpYVN0cmVhbXMudmlkZW8gPSB2aWRlb1N0cmVhbTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIE5BRi5sb2cud2FybihgJHtjbGllbnRJZH0gc2V0TWVkaWFTdHJlYW0gXCJ2aWRlb1wiIGFsaWFzIEVycm9yYCwgZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZXNvbHZlIHRoZSBwcm9taXNlIGZvciB0aGUgdXNlcidzIG1lZGlhIHN0cmVhbSB2aWRlbyBhbGlhcyBpZiBpdCBleGlzdHMuXG4gICAgICAgIGlmIChwZW5kaW5nTWVkaWFSZXF1ZXN0cykgcGVuZGluZ01lZGlhUmVxdWVzdHMudmlkZW8ucmVzb2x2ZSh2aWRlb1N0cmVhbSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNsaWVudE1lZGlhU3RyZWFtc1tzdHJlYW1OYW1lXSA9IHN0cmVhbTtcblxuICAgICAgLy8gUmVzb2x2ZSB0aGUgcHJvbWlzZSBmb3IgdGhlIHVzZXIncyBtZWRpYSBzdHJlYW0gYnkgU3RyZWFtTmFtZSBpZiBpdCBleGlzdHMuXG4gICAgICBpZiAocGVuZGluZ01lZGlhUmVxdWVzdHMgJiYgcGVuZGluZ01lZGlhUmVxdWVzdHNbc3RyZWFtTmFtZV0pIHtcbiAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHNbc3RyZWFtTmFtZV0ucmVzb2x2ZShzdHJlYW0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFkZExvY2FsTWVkaWFTdHJlYW0oc3RyZWFtLCBzdHJlYW1OYW1lKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGFkZExvY2FsTWVkaWFTdHJlYW0gXCIsIHN0cmVhbSwgc3RyZWFtTmFtZSk7XG4gICAgY29uc3QgZWFzeXJ0YyA9IHRoaXMuZWFzeXJ0YztcbiAgICBzdHJlYW1OYW1lID0gc3RyZWFtTmFtZSB8fCBzdHJlYW0uaWQ7XG4gICAgdGhpcy5zZXRNZWRpYVN0cmVhbShcImxvY2FsXCIsIHN0cmVhbSwgc3RyZWFtTmFtZSk7XG4gICAgZWFzeXJ0Yy5yZWdpc3RlcjNyZFBhcnR5TG9jYWxNZWRpYVN0cmVhbShzdHJlYW0sIHN0cmVhbU5hbWUpO1xuXG4gICAgLy8gQWRkIGxvY2FsIHN0cmVhbSB0byBleGlzdGluZyBjb25uZWN0aW9uc1xuICAgIE9iamVjdC5rZXlzKHRoaXMucmVtb3RlQ2xpZW50cykuZm9yRWFjaChjbGllbnRJZCA9PiB7XG4gICAgICBpZiAoZWFzeXJ0Yy5nZXRDb25uZWN0U3RhdHVzKGNsaWVudElkKSAhPT0gZWFzeXJ0Yy5OT1RfQ09OTkVDVEVEKSB7XG4gICAgICAgIGVhc3lydGMuYWRkU3RyZWFtVG9DYWxsKGNsaWVudElkLCBzdHJlYW1OYW1lKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHJlbW92ZUxvY2FsTWVkaWFTdHJlYW0oc3RyZWFtTmFtZSkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyByZW1vdmVMb2NhbE1lZGlhU3RyZWFtIFwiLCBzdHJlYW1OYW1lKTtcbiAgICB0aGlzLmVhc3lydGMuY2xvc2VMb2NhbE1lZGlhU3RyZWFtKHN0cmVhbU5hbWUpO1xuICAgIGRlbGV0ZSB0aGlzLm1lZGlhU3RyZWFtc1tcImxvY2FsXCJdW3N0cmVhbU5hbWVdO1xuICB9XG5cbiAgZW5hYmxlTWljcm9waG9uZShlbmFibGVkKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGVuYWJsZU1pY3JvcGhvbmUgXCIsIGVuYWJsZWQpO1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVNaWNyb3Bob25lKGVuYWJsZWQpO1xuICB9XG5cbiAgZW5hYmxlQ2FtZXJhKGVuYWJsZWQpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgZW5hYmxlQ2FtZXJhIFwiLCBlbmFibGVkKTtcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlQ2FtZXJhKGVuYWJsZWQpO1xuICB9XG5cbiAgZGlzY29ubmVjdCgpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgZGlzY29ubmVjdCBcIik7XG4gICAgdGhpcy5lYXN5cnRjLmRpc2Nvbm5lY3QoKTtcbiAgfVxuXG4gIGFzeW5jIGhhbmRsZVVzZXJQdWJsaXNoZWQodXNlciwgbWVkaWFUeXBlKSB7IH1cblxuICBoYW5kbGVVc2VyVW5wdWJsaXNoZWQodXNlciwgbWVkaWFUeXBlKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGhhbmRsZVVzZXJVblB1Ymxpc2hlZCBcIik7XG4gIH1cblxuICBhc3luYyBjb25uZWN0QWdvcmEoKSB7XG4gICAgLy8gQWRkIGFuIGV2ZW50IGxpc3RlbmVyIHRvIHBsYXkgcmVtb3RlIHRyYWNrcyB3aGVuIHJlbW90ZSB1c2VyIHB1Ymxpc2hlcy5cbiAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICB0aGlzLmFnb3JhQ2xpZW50ID0gQWdvcmFSVEMuY3JlYXRlQ2xpZW50KHsgbW9kZTogXCJsaXZlXCIsIGNvZGVjOiBcInZwOFwiIH0pO1xuICAgIGlmICh0aGlzLmVuYWJsZVZpZGVvRmlsdGVyZWQgfHwgdGhpcy5lbmFibGVWaWRlbyB8fCB0aGlzLmVuYWJsZUF1ZGlvKSB7XG4gICAgICAvL3RoaXMuYWdvcmFDbGllbnQgPSBBZ29yYVJUQy5jcmVhdGVDbGllbnQoeyBtb2RlOiBcInJ0Y1wiLCBjb2RlYzogXCJ2cDhcIiB9KTtcbiAgICAgIC8vdGhpcy5hZ29yYUNsaWVudCA9IEFnb3JhUlRDLmNyZWF0ZUNsaWVudCh7IG1vZGU6IFwibGl2ZVwiLCBjb2RlYzogXCJoMjY0XCIgfSk7XG4gICAgICB0aGlzLmFnb3JhQ2xpZW50LnNldENsaWVudFJvbGUoXCJob3N0XCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvL3RoaXMuYWdvcmFDbGllbnQgPSBBZ29yYVJUQy5jcmVhdGVDbGllbnQoeyBtb2RlOiBcImxpdmVcIiwgY29kZWM6IFwiaDI2NFwiIH0pO1xuICAgICAgLy90aGlzLmFnb3JhQ2xpZW50ID0gQWdvcmFSVEMuY3JlYXRlQ2xpZW50KHsgbW9kZTogXCJsaXZlXCIsIGNvZGVjOiBcInZwOFwiIH0pO1xuICAgIH1cblxuICAgIHRoaXMuYWdvcmFDbGllbnQub24oXCJ1c2VyLWpvaW5lZFwiLCBhc3luYyAodXNlcikgPT4ge1xuICAgICAgY29uc29sZS53YXJuKFwidXNlci1qb2luZWRcIiwgdXNlcik7XG4gICAgfSk7XG4gICAgdGhpcy5hZ29yYUNsaWVudC5vbihcInVzZXItcHVibGlzaGVkXCIsIGFzeW5jICh1c2VyLCBtZWRpYVR5cGUpID0+IHtcblxuICAgICAgbGV0IGNsaWVudElkID0gdXNlci51aWQ7XG4gICAgICBjb25zb2xlLmxvZyhcIkJXNzMgaGFuZGxlVXNlclB1Ymxpc2hlZCBcIiArIGNsaWVudElkICsgXCIgXCIgKyBtZWRpYVR5cGUsIHRoYXQuYWdvcmFDbGllbnQpO1xuICAgICAgYXdhaXQgdGhhdC5hZ29yYUNsaWVudC5zdWJzY3JpYmUodXNlciwgbWVkaWFUeXBlKTtcbiAgICAgIGNvbnNvbGUubG9nKFwiQlc3MyBoYW5kbGVVc2VyUHVibGlzaGVkMiBcIiArIGNsaWVudElkICsgXCIgXCIgKyB0aGF0LmFnb3JhQ2xpZW50KTtcblxuICAgICAgY29uc3QgcGVuZGluZ01lZGlhUmVxdWVzdHMgPSB0aGF0LnBlbmRpbmdNZWRpYVJlcXVlc3RzLmdldChjbGllbnRJZCk7XG4gICAgICBjb25zdCBjbGllbnRNZWRpYVN0cmVhbXMgPSB0aGF0Lm1lZGlhU3RyZWFtc1tjbGllbnRJZF0gPSB0aGF0Lm1lZGlhU3RyZWFtc1tjbGllbnRJZF0gfHwge307XG5cbiAgICAgIGlmIChtZWRpYVR5cGUgPT09ICdhdWRpbycpIHtcbiAgICAgICAgdXNlci5hdWRpb1RyYWNrLnBsYXkoKTtcblxuICAgICAgICBjb25zdCBhdWRpb1N0cmVhbSA9IG5ldyBNZWRpYVN0cmVhbSgpO1xuICAgICAgICBjb25zb2xlLmxvZyhcInVzZXIuYXVkaW9UcmFjayBcIiwgdXNlci5hdWRpb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrKTtcbiAgICAgICAgLy9hdWRpb1N0cmVhbS5hZGRUcmFjayh1c2VyLmF1ZGlvVHJhY2suX21lZGlhU3RyZWFtVHJhY2spO1xuICAgICAgICBjbGllbnRNZWRpYVN0cmVhbXMuYXVkaW8gPSBhdWRpb1N0cmVhbTtcbiAgICAgICAgaWYgKHBlbmRpbmdNZWRpYVJlcXVlc3RzKSBwZW5kaW5nTWVkaWFSZXF1ZXN0cy5hdWRpby5yZXNvbHZlKGF1ZGlvU3RyZWFtKTtcbiAgICAgIH1cblxuICAgICAgbGV0IHZpZGVvU3RyZWFtID0gbnVsbDtcbiAgICAgIGlmIChtZWRpYVR5cGUgPT09ICd2aWRlbycpIHtcbiAgICAgICAgdmlkZW9TdHJlYW0gPSBuZXcgTWVkaWFTdHJlYW0oKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJ1c2VyLnZpZGVvVHJhY2sgXCIsIHVzZXIudmlkZW9UcmFjay5fbWVkaWFTdHJlYW1UcmFjayk7XG4gICAgICAgIHZpZGVvU3RyZWFtLmFkZFRyYWNrKHVzZXIudmlkZW9UcmFjay5fbWVkaWFTdHJlYW1UcmFjayk7XG4gICAgICAgIGNsaWVudE1lZGlhU3RyZWFtcy52aWRlbyA9IHZpZGVvU3RyZWFtO1xuICAgICAgICBpZiAocGVuZGluZ01lZGlhUmVxdWVzdHMpIHBlbmRpbmdNZWRpYVJlcXVlc3RzLnZpZGVvLnJlc29sdmUodmlkZW9TdHJlYW0pO1xuICAgICAgICAvL3VzZXIudmlkZW9UcmFja1xuICAgICAgfVxuXG4gICAgICBpZiAoY2xpZW50SWQgPT0gJ0NDQycpIHtcbiAgICAgICAgaWYgKG1lZGlhVHlwZSA9PT0gJ3ZpZGVvJykge1xuICAgICAgICAgIC8vIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidmlkZW8zNjBcIikuc3JjT2JqZWN0PXZpZGVvU3RyZWFtO1xuICAgICAgICAgIC8vZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN2aWRlbzM2MFwiKS5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgdmlkZW9TdHJlYW0pO1xuICAgICAgICAgIC8vZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN2aWRlbzM2MFwiKS5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgdXNlci52aWRlb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrKTtcbiAgICAgICAgICAvL2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdmlkZW8zNjBcIikuc3JjT2JqZWN0PSB1c2VyLnZpZGVvVHJhY2suX21lZGlhU3RyZWFtVHJhY2s7XG4gICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN2aWRlbzM2MFwiKS5zcmNPYmplY3QgPSB2aWRlb1N0cmVhbTtcbiAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3ZpZGVvMzYwXCIpLnBsYXkoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobWVkaWFUeXBlID09PSAnYXVkaW8nKSB7XG4gICAgICAgICAgdXNlci5hdWRpb1RyYWNrLnBsYXkoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGNsaWVudElkID09ICdEREQnKSB7XG4gICAgICAgIGlmIChtZWRpYVR5cGUgPT09ICd2aWRlbycpIHtcbiAgICAgICAgICB1c2VyLnZpZGVvVHJhY2sucGxheShcInZpZGVvMzYwXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtZWRpYVR5cGUgPT09ICdhdWRpbycpIHtcbiAgICAgICAgICB1c2VyLmF1ZGlvVHJhY2sucGxheSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmFnb3JhQ2xpZW50Lm9uKFwidXNlci11bnB1Ymxpc2hlZFwiLCB0aGF0LmhhbmRsZVVzZXJVbnB1Ymxpc2hlZCk7XG5cbiAgICBjb25zb2xlLmxvZyhcImNvbm5lY3QgYWdvcmEgXCIpO1xuICAgIC8vIEpvaW4gYSBjaGFubmVsIGFuZCBjcmVhdGUgbG9jYWwgdHJhY2tzLiBCZXN0IHByYWN0aWNlIGlzIHRvIHVzZSBQcm9taXNlLmFsbCBhbmQgcnVuIHRoZW0gY29uY3VycmVudGx5LlxuICAgIC8vIG9cblxuXG4gICAgaWYgKHRoaXMuZW5hYmxlQXZhdGFyKSB7XG4gICAgICB2YXIgc3RyZWFtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYW52YXNcIikuY2FwdHVyZVN0cmVhbSgzMCk7XG4gICAgICBbdGhpcy51c2VyaWQsIHRoaXMubG9jYWxUcmFja3MuYXVkaW9UcmFjaywgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgdGhpcy5hZ29yYUNsaWVudC5qb2luKHRoaXMuYXBwaWQsIHRoaXMucm9vbSwgdGhpcy50b2tlbiB8fCBudWxsLCB0aGlzLmNsaWVudElkIHx8IG51bGwpLFxuICAgICAgICBBZ29yYVJUQy5jcmVhdGVNaWNyb3Bob25lQXVkaW9UcmFjaygpLCBBZ29yYVJUQy5jcmVhdGVDdXN0b21WaWRlb1RyYWNrKHsgbWVkaWFTdHJlYW1UcmFjazogc3RyZWFtLmdldFZpZGVvVHJhY2tzKClbMF0gfSldKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodGhpcy5lbmFibGVWaWRlb0ZpbHRlcmVkICYmIHRoaXMuZW5hYmxlQXVkaW8pIHtcbiAgICAgIHZhciBzdHJlYW0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbnZhc19zZWNyZXRcIikuY2FwdHVyZVN0cmVhbSgzMCk7XG4gICAgICBbdGhpcy51c2VyaWQsIHRoaXMubG9jYWxUcmFja3MuYXVkaW9UcmFjaywgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrXSA9IGF3YWl0IFByb21pc2UuYWxsKFt0aGlzLmFnb3JhQ2xpZW50LmpvaW4odGhpcy5hcHBpZCwgdGhpcy5yb29tLCB0aGlzLnRva2VuIHx8IG51bGwsIHRoaXMuY2xpZW50SWQgfHwgbnVsbCksIEFnb3JhUlRDLmNyZWF0ZU1pY3JvcGhvbmVBdWRpb1RyYWNrKCksIEFnb3JhUlRDLmNyZWF0ZUN1c3RvbVZpZGVvVHJhY2soeyBtZWRpYVN0cmVhbVRyYWNrOiBzdHJlYW0uZ2V0VmlkZW9UcmFja3MoKVswXSB9KV0pO1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLmVuYWJsZVZpZGVvICYmIHRoaXMuZW5hYmxlQXVkaW8pIHtcbiAgICAgIFt0aGlzLnVzZXJpZCwgdGhpcy5sb2NhbFRyYWNrcy5hdWRpb1RyYWNrLCB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2tdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICB0aGlzLmFnb3JhQ2xpZW50LmpvaW4odGhpcy5hcHBpZCwgdGhpcy5yb29tLCB0aGlzLnRva2VuIHx8IG51bGwsIHRoaXMuY2xpZW50SWQgfHwgbnVsbCksXG4gICAgICAgIEFnb3JhUlRDLmNyZWF0ZU1pY3JvcGhvbmVBdWRpb1RyYWNrKCksIEFnb3JhUlRDLmNyZWF0ZUNhbWVyYVZpZGVvVHJhY2soeyBlbmNvZGVyQ29uZmlnOiAnNDgwcF8yJyB9KV0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5lbmFibGVWaWRlbykge1xuICAgICAgW3RoaXMudXNlcmlkLCB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2tdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAvLyBKb2luIHRoZSBjaGFubmVsLlxuICAgICAgICB0aGlzLmFnb3JhQ2xpZW50LmpvaW4odGhpcy5hcHBpZCwgdGhpcy5yb29tLCB0aGlzLnRva2VuIHx8IG51bGwsIHRoaXMuY2xpZW50SWQgfHwgbnVsbCksIEFnb3JhUlRDLmNyZWF0ZUNhbWVyYVZpZGVvVHJhY2soXCIzNjBwXzRcIildKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuZW5hYmxlQXVkaW8pIHtcbiAgICAgIFt0aGlzLnVzZXJpZCwgdGhpcy5sb2NhbFRyYWNrcy5hdWRpb1RyYWNrXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgLy8gSm9pbiB0aGUgY2hhbm5lbC5cbiAgICAgICAgdGhpcy5hZ29yYUNsaWVudC5qb2luKHRoaXMuYXBwaWQsIHRoaXMucm9vbSwgdGhpcy50b2tlbiB8fCBudWxsLCB0aGlzLmNsaWVudElkIHx8IG51bGwpLCBBZ29yYVJUQy5jcmVhdGVNaWNyb3Bob25lQXVkaW9UcmFjaygpXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudXNlcmlkID0gYXdhaXQgdGhpcy5hZ29yYUNsaWVudC5qb2luKHRoaXMuYXBwaWQsIHRoaXMucm9vbSwgdGhpcy50b2tlbiB8fCBudWxsLCB0aGlzLmNsaWVudElkIHx8IG51bGwpO1xuICAgIH1cblxuXG4gICAgLy8gc2VsZWN0IGZhY2V0aW1lIGNhbWVyYSBpZiBleGlzdHNcbiAgICBpZiAodGhpcy5lbmFibGVWaWRlbyAmJiAhdGhpcy5lbmFibGVWaWRlb0ZpbHRlcmVkKSB7XG4gICAgICBsZXQgY2FtcyA9IGF3YWl0IEFnb3JhUlRDLmdldENhbWVyYXMoKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2Ftcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoY2Ftc1tpXS5sYWJlbC5pbmRleE9mKFwiRmFjZVRpbWVcIikgPT0gMCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwic2VsZWN0IEZhY2VUaW1lIGNhbWVyYVwiLCBjYW1zW2ldLmRldmljZUlkKTtcbiAgICAgICAgICBhd2FpdCB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2suc2V0RGV2aWNlKGNhbXNbaV0uZGV2aWNlSWQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZW5hYmxlVmlkZW8gJiYgdGhpcy5zaG93TG9jYWwpIHtcbiAgICAgIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjay5wbGF5KFwibG9jYWwtcGxheWVyXCIpO1xuICAgIH1cblxuICAgIC8vIEVuYWJsZSB2aXJ0dWFsIGJhY2tncm91bmQgT0xEIE1ldGhvZFxuICAgIGlmICh0aGlzLmVuYWJsZVZpZGVvICYmIHRoaXMudmJnMCAmJiB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2spIHtcbiAgICAgIGNvbnN0IGltZ0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcbiAgICAgIGltZ0VsZW1lbnQub25sb2FkID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMudmlydHVhbEJhY2tncm91bmRJbnN0YW5jZSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiU0VHIElOSVQgXCIsIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjayk7XG4gICAgICAgICAgdGhpcy52aXJ0dWFsQmFja2dyb3VuZEluc3RhbmNlID0gYXdhaXQgU2VnUGx1Z2luLmluamVjdCh0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2ssIFwiL2Fzc2V0cy93YXNtczBcIikuY2F0Y2goY29uc29sZS5lcnJvcik7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJTRUcgSU5JVEVEXCIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudmlydHVhbEJhY2tncm91bmRJbnN0YW5jZS5zZXRPcHRpb25zKHsgZW5hYmxlOiB0cnVlLCBiYWNrZ3JvdW5kOiBpbWdFbGVtZW50IH0pO1xuICAgICAgfTtcbiAgICAgIGltZ0VsZW1lbnQuc3JjID0gJ2RhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQVFBQUFBRENBSUFBQUE3bGptUkFBQUFEMGxFUVZSNFhtTmcrTStBUURnNUFPazlDL1Zrb216WUFBQUFBRWxGVGtTdVFtQ0MnO1xuICAgIH1cblxuICAgIC8vIEVuYWJsZSB2aXJ0dWFsIGJhY2tncm91bmQgTmV3IE1ldGhvZFxuICAgIGlmICh0aGlzLmVuYWJsZVZpZGVvICYmIHRoaXMudmJnICYmIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjaykge1xuXG4gICAgICB0aGlzLmV4dGVuc2lvbiA9IG5ldyBWaXJ0dWFsQmFja2dyb3VuZEV4dGVuc2lvbigpO1xuICAgICAgQWdvcmFSVEMucmVnaXN0ZXJFeHRlbnNpb25zKFt0aGlzLmV4dGVuc2lvbl0pO1xuICAgICAgdGhpcy5wcm9jZXNzb3IgPSB0aGlzLmV4dGVuc2lvbi5jcmVhdGVQcm9jZXNzb3IoKTtcbiAgICAgIGF3YWl0IHRoaXMucHJvY2Vzc29yLmluaXQoXCIvYXNzZXRzL3dhc21zXCIpO1xuICAgICAgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrLnBpcGUodGhpcy5wcm9jZXNzb3IpLnBpcGUodGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrLnByb2Nlc3NvckRlc3RpbmF0aW9uKTtcbiAgICAgIGF3YWl0IHRoaXMucHJvY2Vzc29yLnNldE9wdGlvbnMoeyB0eXBlOiAnY29sb3InLCBjb2xvcjogXCIjMDBmZjAwXCIgfSk7XG4gICAgICBhd2FpdCB0aGlzLnByb2Nlc3Nvci5lbmFibGUoKTtcbiAgICB9XG5cbiAgICB3aW5kb3cubG9jYWxUcmFja3MgPSB0aGlzLmxvY2FsVHJhY2tzO1xuXG4gICAgY29uc29sZS5lcnJvcihcIkFTUyAyIFwiLCB3aW5kb3cubG9jYWxUcmFja3MpO1xuXG4gICAgLy8gUHVibGlzaCB0aGUgbG9jYWwgdmlkZW8gYW5kIGF1ZGlvIHRyYWNrcyB0byB0aGUgY2hhbm5lbC5cbiAgICBpZiAodGhpcy5lbmFibGVWaWRlbyB8fCB0aGlzLmVuYWJsZUF1ZGlvIHx8IHRoaXMuZW5hYmxlQXZhdGFyKSB7XG4gICAgICBhd2FpdCB0aGlzLmFnb3JhQ2xpZW50LnB1Ymxpc2goT2JqZWN0LnZhbHVlcyh0aGlzLmxvY2FsVHJhY2tzKSk7XG4gICAgICBjb25zb2xlLmxvZyhcInB1Ymxpc2ggc3VjY2Vzc1wiKTtcbiAgICB9XG5cbiAgfVxuXG4gIC8qKlxuICAgKiBQcml2YXRlc1xuICAgKi9cblxuICBhc3luYyBfY29ubmVjdChjb25uZWN0U3VjY2VzcywgY29ubmVjdEZhaWx1cmUpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICBhd2FpdCB0aGF0LmVhc3lydGMuY29ubmVjdCh0aGF0LmFwcCwgY29ubmVjdFN1Y2Nlc3MsIGNvbm5lY3RGYWlsdXJlKTtcblxuICAgIC8qXG4gICAgICAgdGhpcy5lYXN5cnRjLnNldFN0cmVhbUFjY2VwdG9yKHRoaXMuc2V0TWVkaWFTdHJlYW0uYmluZCh0aGlzKSk7XG4gICAgICAgdGhpcy5lYXN5cnRjLnNldE9uU3RyZWFtQ2xvc2VkKGZ1bmN0aW9uKGNsaWVudElkLCBzdHJlYW0sIHN0cmVhbU5hbWUpIHtcbiAgICAgICAgZGVsZXRlIHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXVtzdHJlYW1OYW1lXTtcbiAgICAgIH0pO1xuICAgICAgIGlmICh0aGF0LmVhc3lydGMuYXVkaW9FbmFibGVkIHx8IHRoYXQuZWFzeXJ0Yy52aWRlb0VuYWJsZWQpIHtcbiAgICAgICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEoe1xuICAgICAgICAgIHZpZGVvOiB0aGF0LmVhc3lydGMudmlkZW9FbmFibGVkLFxuICAgICAgICAgIGF1ZGlvOiB0aGF0LmVhc3lydGMuYXVkaW9FbmFibGVkXG4gICAgICAgIH0pLnRoZW4oXG4gICAgICAgICAgZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgICAgICAgICB0aGF0LmFkZExvY2FsTWVkaWFTdHJlYW0oc3RyZWFtLCBcImRlZmF1bHRcIik7XG4gICAgICAgICAgICB0aGF0LmVhc3lydGMuY29ubmVjdCh0aGF0LmFwcCwgY29ubmVjdFN1Y2Nlc3MsIGNvbm5lY3RGYWlsdXJlKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGZ1bmN0aW9uKGVycm9yQ29kZSwgZXJybWVzZykge1xuICAgICAgICAgICAgTkFGLmxvZy5lcnJvcihlcnJvckNvZGUsIGVycm1lc2cpO1xuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoYXQuZWFzeXJ0Yy5jb25uZWN0KHRoYXQuYXBwLCBjb25uZWN0U3VjY2VzcywgY29ubmVjdEZhaWx1cmUpO1xuICAgICAgfVxuICAgICAgKi9cbiAgfVxuXG4gIF9nZXRSb29tSm9pblRpbWUoY2xpZW50SWQpIHtcbiAgICB2YXIgbXlSb29tSWQgPSB0aGlzLnJvb207IC8vTkFGLnJvb207XG4gICAgdmFyIGpvaW5UaW1lID0gdGhpcy5lYXN5cnRjLmdldFJvb21PY2N1cGFudHNBc01hcChteVJvb21JZClbY2xpZW50SWRdLnJvb21Kb2luVGltZTtcbiAgICByZXR1cm4gam9pblRpbWU7XG4gIH1cblxuICBnZXRTZXJ2ZXJUaW1lKCkge1xuICAgIHJldHVybiBEYXRlLm5vdygpICsgdGhpcy5hdmdUaW1lT2Zmc2V0O1xuICB9XG59XG5cbk5BRi5hZGFwdGVycy5yZWdpc3RlcihcImFnb3JhcnRjXCIsIEFnb3JhUnRjQWRhcHRlcik7XG5cbm1vZHVsZS5leHBvcnRzID0gQWdvcmFSdGNBZGFwdGVyO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==