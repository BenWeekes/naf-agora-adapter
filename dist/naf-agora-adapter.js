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
    this.enableAudio = false;
    this.enableAvatar = false;

    this.localTracks = { videoTrack: null, audioTrack: null };
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

    if (obj.vbg) {
      this.vbg = obj.vbg;
    }

    if (obj.vbg0) {
      this.vbg0 = obj.vbg0;
      if (this.vbg0) {
        AgoraRTC.loadModule(SegPlugin, {});
      }
    }

    if (obj.enableAvatar) {
      this.enableAvatar = obj.enableAvatar;
    }

    if (obj.showLocal) {
      this.showLocal = obj.showLocal;
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

    if (this.enableVideo || this.enableAudio) {
      //this.agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      this.agoraClient = AgoraRTC.createClient({ mode: "live", codec: "h264" });
      this.agoraClient.setClientRole("host");
    } else {
      this.agoraClient = AgoraRTC.createClient({ mode: "live", codec: "h264" });
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
        const audioStream = new MediaStream();
        console.log("user.audioTrack ", user.audioTrack._mediaStreamTrack);
        audioStream.addTrack(user.audioTrack._mediaStreamTrack);
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
    } else if (this.enableVideo && this.enableAudio) {
      [this.userid, this.localTracks.audioTrack, this.localTracks.videoTrack] = await Promise.all([this.agoraClient.join(this.appid, this.room, this.token || null, this.clientId || null), AgoraRTC.createMicrophoneAudioTrack(), AgoraRTC.createCameraVideoTrack({ encoderConfig: '360p_4' })]);
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
    if (this.enableVideo) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIl0sIm5hbWVzIjpbIkFnb3JhUnRjQWRhcHRlciIsImNvbnN0cnVjdG9yIiwiZWFzeXJ0YyIsImNvbnNvbGUiLCJsb2ciLCJ3aW5kb3ciLCJhcHAiLCJyb29tIiwidXNlcmlkIiwiYXBwaWQiLCJtZWRpYVN0cmVhbXMiLCJyZW1vdGVDbGllbnRzIiwicGVuZGluZ01lZGlhUmVxdWVzdHMiLCJNYXAiLCJlbmFibGVWaWRlbyIsImVuYWJsZUF1ZGlvIiwiZW5hYmxlQXZhdGFyIiwibG9jYWxUcmFja3MiLCJ2aWRlb1RyYWNrIiwiYXVkaW9UcmFjayIsInRva2VuIiwiY2xpZW50SWQiLCJ1aWQiLCJ2YmciLCJ2YmcwIiwic2hvd0xvY2FsIiwidmlydHVhbEJhY2tncm91bmRJbnN0YW5jZSIsImV4dGVuc2lvbiIsInByb2Nlc3NvciIsInBpcGVQcm9jZXNzb3IiLCJ0cmFjayIsInBpcGUiLCJwcm9jZXNzb3JEZXN0aW5hdGlvbiIsInNlcnZlclRpbWVSZXF1ZXN0cyIsInRpbWVPZmZzZXRzIiwiYXZnVGltZU9mZnNldCIsImFnb3JhQ2xpZW50Iiwic2V0UGVlck9wZW5MaXN0ZW5lciIsImNsaWVudENvbm5lY3Rpb24iLCJnZXRQZWVyQ29ubmVjdGlvbkJ5VXNlcklkIiwic2V0UGVlckNsb3NlZExpc3RlbmVyIiwic2V0U2VydmVyVXJsIiwidXJsIiwic2V0U29ja2V0VXJsIiwic2V0QXBwIiwiYXBwTmFtZSIsInNldFJvb20iLCJqc29uIiwicmVwbGFjZSIsIm9iaiIsIkpTT04iLCJwYXJzZSIsIm5hbWUiLCJBZ29yYVJUQyIsImxvYWRNb2R1bGUiLCJTZWdQbHVnaW4iLCJqb2luUm9vbSIsInNldFdlYlJ0Y09wdGlvbnMiLCJvcHRpb25zIiwiZW5hYmxlRGF0YUNoYW5uZWxzIiwiZGF0YWNoYW5uZWwiLCJ2aWRlbyIsImF1ZGlvIiwiZW5hYmxlVmlkZW9SZWNlaXZlIiwiZW5hYmxlQXVkaW9SZWNlaXZlIiwic2V0U2VydmVyQ29ubmVjdExpc3RlbmVycyIsInN1Y2Nlc3NMaXN0ZW5lciIsImZhaWx1cmVMaXN0ZW5lciIsImNvbm5lY3RTdWNjZXNzIiwiY29ubmVjdEZhaWx1cmUiLCJzZXRSb29tT2NjdXBhbnRMaXN0ZW5lciIsIm9jY3VwYW50TGlzdGVuZXIiLCJyb29tTmFtZSIsIm9jY3VwYW50cyIsInByaW1hcnkiLCJzZXREYXRhQ2hhbm5lbExpc3RlbmVycyIsIm9wZW5MaXN0ZW5lciIsImNsb3NlZExpc3RlbmVyIiwibWVzc2FnZUxpc3RlbmVyIiwic2V0RGF0YUNoYW5uZWxPcGVuTGlzdGVuZXIiLCJzZXREYXRhQ2hhbm5lbENsb3NlTGlzdGVuZXIiLCJzZXRQZWVyTGlzdGVuZXIiLCJ1cGRhdGVUaW1lT2Zmc2V0IiwiY2xpZW50U2VudFRpbWUiLCJEYXRlIiwibm93IiwiZmV0Y2giLCJkb2N1bWVudCIsImxvY2F0aW9uIiwiaHJlZiIsIm1ldGhvZCIsImNhY2hlIiwidGhlbiIsInJlcyIsInByZWNpc2lvbiIsInNlcnZlclJlY2VpdmVkVGltZSIsImhlYWRlcnMiLCJnZXQiLCJnZXRUaW1lIiwiY2xpZW50UmVjZWl2ZWRUaW1lIiwic2VydmVyVGltZSIsInRpbWVPZmZzZXQiLCJwdXNoIiwicmVkdWNlIiwiYWNjIiwib2Zmc2V0IiwibGVuZ3RoIiwic2V0VGltZW91dCIsImNvbm5lY3QiLCJQcm9taXNlIiwiYWxsIiwicmVzb2x2ZSIsInJlamVjdCIsIl9jb25uZWN0IiwiXyIsIl9teVJvb21Kb2luVGltZSIsIl9nZXRSb29tSm9pblRpbWUiLCJjb25uZWN0QWdvcmEiLCJjYXRjaCIsInNob3VsZFN0YXJ0Q29ubmVjdGlvblRvIiwiY2xpZW50Iiwicm9vbUpvaW5UaW1lIiwic3RhcnRTdHJlYW1Db25uZWN0aW9uIiwiY2FsbCIsImNhbGxlciIsIm1lZGlhIiwiTkFGIiwid3JpdGUiLCJlcnJvckNvZGUiLCJlcnJvclRleHQiLCJlcnJvciIsIndhc0FjY2VwdGVkIiwiY2xvc2VTdHJlYW1Db25uZWN0aW9uIiwiaGFuZ3VwIiwic2VuZERhdGEiLCJkYXRhVHlwZSIsImRhdGEiLCJzZW5kRGF0YUd1YXJhbnRlZWQiLCJzZW5kRGF0YVdTIiwiYnJvYWRjYXN0RGF0YSIsInJvb21PY2N1cGFudHMiLCJnZXRSb29tT2NjdXBhbnRzQXNNYXAiLCJyb29tT2NjdXBhbnQiLCJteUVhc3lydGNpZCIsImJyb2FkY2FzdERhdGFHdWFyYW50ZWVkIiwiZGVzdGluYXRpb24iLCJ0YXJnZXRSb29tIiwiZ2V0Q29ubmVjdFN0YXR1cyIsInN0YXR1cyIsIklTX0NPTk5FQ1RFRCIsImFkYXB0ZXJzIiwiTk9UX0NPTk5FQ1RFRCIsIkNPTk5FQ1RJTkciLCJnZXRNZWRpYVN0cmVhbSIsInN0cmVhbU5hbWUiLCJoYXMiLCJhdWRpb1Byb21pc2UiLCJlIiwid2FybiIsInByb21pc2UiLCJ2aWRlb1Byb21pc2UiLCJzZXQiLCJzdHJlYW1Qcm9taXNlIiwic2V0TWVkaWFTdHJlYW0iLCJzdHJlYW0iLCJjbGllbnRNZWRpYVN0cmVhbXMiLCJhdWRpb1RyYWNrcyIsImdldEF1ZGlvVHJhY2tzIiwiYXVkaW9TdHJlYW0iLCJNZWRpYVN0cmVhbSIsImZvckVhY2giLCJhZGRUcmFjayIsInZpZGVvVHJhY2tzIiwiZ2V0VmlkZW9UcmFja3MiLCJ2aWRlb1N0cmVhbSIsImFkZExvY2FsTWVkaWFTdHJlYW0iLCJpZCIsInJlZ2lzdGVyM3JkUGFydHlMb2NhbE1lZGlhU3RyZWFtIiwiT2JqZWN0Iiwia2V5cyIsImFkZFN0cmVhbVRvQ2FsbCIsInJlbW92ZUxvY2FsTWVkaWFTdHJlYW0iLCJjbG9zZUxvY2FsTWVkaWFTdHJlYW0iLCJlbmFibGVNaWNyb3Bob25lIiwiZW5hYmxlZCIsImVuYWJsZUNhbWVyYSIsImRpc2Nvbm5lY3QiLCJoYW5kbGVVc2VyUHVibGlzaGVkIiwidXNlciIsIm1lZGlhVHlwZSIsImhhbmRsZVVzZXJVbnB1Ymxpc2hlZCIsInRoYXQiLCJjcmVhdGVDbGllbnQiLCJtb2RlIiwiY29kZWMiLCJzZXRDbGllbnRSb2xlIiwib24iLCJzdWJzY3JpYmUiLCJfbWVkaWFTdHJlYW1UcmFjayIsInF1ZXJ5U2VsZWN0b3IiLCJzcmNPYmplY3QiLCJwbGF5IiwiZ2V0RWxlbWVudEJ5SWQiLCJjYXB0dXJlU3RyZWFtIiwiam9pbiIsImNyZWF0ZU1pY3JvcGhvbmVBdWRpb1RyYWNrIiwiY3JlYXRlQ3VzdG9tVmlkZW9UcmFjayIsIm1lZGlhU3RyZWFtVHJhY2siLCJjcmVhdGVDYW1lcmFWaWRlb1RyYWNrIiwiZW5jb2RlckNvbmZpZyIsImNhbXMiLCJnZXRDYW1lcmFzIiwiaSIsImxhYmVsIiwiaW5kZXhPZiIsImRldmljZUlkIiwic2V0RGV2aWNlIiwiaW1nRWxlbWVudCIsImNyZWF0ZUVsZW1lbnQiLCJvbmxvYWQiLCJpbmplY3QiLCJzZXRPcHRpb25zIiwiZW5hYmxlIiwiYmFja2dyb3VuZCIsInNyYyIsIlZpcnR1YWxCYWNrZ3JvdW5kRXh0ZW5zaW9uIiwicmVnaXN0ZXJFeHRlbnNpb25zIiwiY3JlYXRlUHJvY2Vzc29yIiwiaW5pdCIsInR5cGUiLCJjb2xvciIsInB1Ymxpc2giLCJ2YWx1ZXMiLCJteVJvb21JZCIsImpvaW5UaW1lIiwiZ2V0U2VydmVyVGltZSIsInJlZ2lzdGVyIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0Es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TixDQUFlN0MsY0FBZixFQUErQkMsY0FBL0IsRUFBK0M7QUFDN0MsUUFBSTBILE9BQU8sSUFBWDs7QUFFQSxVQUFNQSxLQUFLN0wsT0FBTCxDQUFhMEcsT0FBYixDQUFxQm1GLEtBQUt6TCxHQUExQixFQUErQjhELGNBQS9CLEVBQStDQyxjQUEvQyxDQUFOOztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBc0JEOztBQUVEK0MsbUJBQWlCL0YsUUFBakIsRUFBMkI7QUFDekIsUUFBSW9OLFdBQVcsS0FBS2xPLElBQXBCLENBRHlCLENBQ0M7QUFDMUIsUUFBSW1PLFdBQVcsS0FBS3hPLE9BQUwsQ0FBYTJJLHFCQUFiLENBQW1DNEYsUUFBbkMsRUFBNkNwTixRQUE3QyxFQUF1RG9HLFlBQXRFO0FBQ0EsV0FBT2lILFFBQVA7QUFDRDs7QUFFREMsa0JBQWdCO0FBQ2QsV0FBT3ZKLEtBQUtDLEdBQUwsS0FBYSxLQUFLbEQsYUFBekI7QUFDRDtBQXJpQm1COztBQXdpQnRCMkYsSUFBSXdCLFFBQUosQ0FBYXNGLFFBQWIsQ0FBc0IsVUFBdEIsRUFBa0M1TyxlQUFsQzs7QUFFQTZPLE9BQU9DLE9BQVAsR0FBaUI5TyxlQUFqQixDIiwiZmlsZSI6Im5hZi1hZ29yYS1hZGFwdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvaW5kZXguanNcIik7XG4iLCJjbGFzcyBBZ29yYVJ0Y0FkYXB0ZXIge1xuXG4gIGNvbnN0cnVjdG9yKGVhc3lydGMpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgY29uc3RydWN0b3IgXCIsIGVhc3lydGMpO1xuXG4gICAgdGhpcy5lYXN5cnRjID0gZWFzeXJ0YyB8fCB3aW5kb3cuZWFzeXJ0YztcbiAgICB0aGlzLmFwcCA9IFwiZGVmYXVsdFwiO1xuICAgIHRoaXMucm9vbSA9IFwiZGVmYXVsdFwiO1xuICAgIHRoaXMudXNlcmlkID0gMDtcbiAgICB0aGlzLmFwcGlkID0gbnVsbDtcblxuICAgIHRoaXMubWVkaWFTdHJlYW1zID0ge307XG4gICAgdGhpcy5yZW1vdGVDbGllbnRzID0ge307XG4gICAgdGhpcy5wZW5kaW5nTWVkaWFSZXF1ZXN0cyA9IG5ldyBNYXAoKTtcblxuICAgIHRoaXMuZW5hYmxlVmlkZW8gPSBmYWxzZTtcbiAgICB0aGlzLmVuYWJsZUF1ZGlvID0gZmFsc2U7XG4gICAgdGhpcy5lbmFibGVBdmF0YXIgPSBmYWxzZTtcblxuICAgIHRoaXMubG9jYWxUcmFja3MgPSB7IHZpZGVvVHJhY2s6IG51bGwsIGF1ZGlvVHJhY2s6IG51bGwgfTtcbiAgICB0aGlzLnRva2VuID0gbnVsbDtcbiAgICB0aGlzLmNsaWVudElkID0gbnVsbDtcbiAgICB0aGlzLnVpZCA9IG51bGw7XG4gICAgdGhpcy52YmcgPSBmYWxzZTtcbiAgICB0aGlzLnZiZzAgPSBmYWxzZTtcbiAgICB0aGlzLnNob3dMb2NhbCA9IGZhbHNlO1xuICAgIHRoaXMudmlydHVhbEJhY2tncm91bmRJbnN0YW5jZSA9IG51bGw7XG4gdGhpcy5leHRlbnNpb24gPSBudWxsO1xuIHRoaXMucHJvY2Vzc29yID0gbnVsbDtcbiB0aGlzLnBpcGVQcm9jZXNzb3IgPSAodHJhY2ssIHByb2Nlc3NvcikgPT4ge1xuICB0cmFjay5waXBlKHByb2Nlc3NvcikucGlwZSh0cmFjay5wcm9jZXNzb3JEZXN0aW5hdGlvbik7XG4gfVxuXG5cbiAgICB0aGlzLnNlcnZlclRpbWVSZXF1ZXN0cyA9IDA7XG4gICAgdGhpcy50aW1lT2Zmc2V0cyA9IFtdO1xuICAgIHRoaXMuYXZnVGltZU9mZnNldCA9IDA7XG4gICAgdGhpcy5hZ29yYUNsaWVudCA9IG51bGw7XG5cbiAgICB0aGlzLmVhc3lydGMuc2V0UGVlck9wZW5MaXN0ZW5lcihjbGllbnRJZCA9PiB7XG4gICAgICBjb25zdCBjbGllbnRDb25uZWN0aW9uID0gdGhpcy5lYXN5cnRjLmdldFBlZXJDb25uZWN0aW9uQnlVc2VySWQoY2xpZW50SWQpO1xuICAgICAgdGhpcy5yZW1vdGVDbGllbnRzW2NsaWVudElkXSA9IGNsaWVudENvbm5lY3Rpb247XG4gICAgfSk7XG5cbiAgICB0aGlzLmVhc3lydGMuc2V0UGVlckNsb3NlZExpc3RlbmVyKGNsaWVudElkID0+IHtcbiAgICAgIGRlbGV0ZSB0aGlzLnJlbW90ZUNsaWVudHNbY2xpZW50SWRdO1xuICAgIH0pO1xuICB9XG5cbiAgc2V0U2VydmVyVXJsKHVybCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXRTZXJ2ZXJVcmwgXCIsIHVybCk7XG4gICAgdGhpcy5lYXN5cnRjLnNldFNvY2tldFVybCh1cmwpO1xuICB9XG5cbiAgc2V0QXBwKGFwcE5hbWUpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0QXBwIFwiLCBhcHBOYW1lKTtcbiAgICB0aGlzLmFwcCA9IGFwcE5hbWU7XG4gICAgdGhpcy5hcHBpZCA9IGFwcE5hbWU7XG4gIH1cblxuICBhc3luYyBzZXRSb29tKGpzb24pIHtcbiAgICBqc29uID0ganNvbi5yZXBsYWNlKC8nL2csICdcIicpO1xuICAgIGNvbnN0IG9iaiA9IEpTT04ucGFyc2UoanNvbik7XG4gICAgdGhpcy5yb29tID0gb2JqLm5hbWU7XG5cbiAgICBpZiAob2JqLnZiZykge1xuICAgICAgIHRoaXMudmJnID0gb2JqLnZiZztcbiAgICB9XG5cbiAgICBpZiAob2JqLnZiZzApIHtcbiAgICAgICB0aGlzLnZiZzAgPSBvYmoudmJnMDtcbiAgICAgICBpZiAodGhpcy52YmcwKSB7XG4gICAgICAgICAgQWdvcmFSVEMubG9hZE1vZHVsZShTZWdQbHVnaW4sIHt9KTtcbiAgICAgICB9XG4gICAgfVxuXG5cbiAgICBpZiAob2JqLmVuYWJsZUF2YXRhcikge1xuICAgICAgdGhpcy5lbmFibGVBdmF0YXIgPSBvYmouZW5hYmxlQXZhdGFyO1xuICAgIH1cblxuICAgIGlmIChvYmouc2hvd0xvY2FsKSB7XG4gICAgICB0aGlzLnNob3dMb2NhbCA9IG9iai5zaG93TG9jYWw7XG4gICAgfVxuICAgIHRoaXMuZWFzeXJ0Yy5qb2luUm9vbSh0aGlzLnJvb20sIG51bGwpO1xuICB9XG5cbiAgLy8gb3B0aW9uczogeyBkYXRhY2hhbm5lbDogYm9vbCwgYXVkaW86IGJvb2wsIHZpZGVvOiBib29sIH1cbiAgc2V0V2ViUnRjT3B0aW9ucyhvcHRpb25zKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNldFdlYlJ0Y09wdGlvbnMgXCIsIG9wdGlvbnMpO1xuICAgIC8vIHRoaXMuZWFzeXJ0Yy5lbmFibGVEZWJ1Zyh0cnVlKTtcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlRGF0YUNoYW5uZWxzKG9wdGlvbnMuZGF0YWNoYW5uZWwpO1xuXG4gICAgLy8gdXNpbmcgQWdvcmFcbiAgICB0aGlzLmVuYWJsZVZpZGVvID0gb3B0aW9ucy52aWRlbztcbiAgICB0aGlzLmVuYWJsZUF1ZGlvID0gb3B0aW9ucy5hdWRpbztcblxuICAgIC8vIG5vdCBlYXN5cnRjXG4gICAgdGhpcy5lYXN5cnRjLmVuYWJsZVZpZGVvKGZhbHNlKTtcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlQXVkaW8oZmFsc2UpO1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVWaWRlb1JlY2VpdmUoZmFsc2UpO1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVBdWRpb1JlY2VpdmUoZmFsc2UpO1xuICB9XG5cbiAgc2V0U2VydmVyQ29ubmVjdExpc3RlbmVycyhzdWNjZXNzTGlzdGVuZXIsIGZhaWx1cmVMaXN0ZW5lcikge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXRTZXJ2ZXJDb25uZWN0TGlzdGVuZXJzIFwiLCBzdWNjZXNzTGlzdGVuZXIsIGZhaWx1cmVMaXN0ZW5lcik7XG4gICAgdGhpcy5jb25uZWN0U3VjY2VzcyA9IHN1Y2Nlc3NMaXN0ZW5lcjtcbiAgICB0aGlzLmNvbm5lY3RGYWlsdXJlID0gZmFpbHVyZUxpc3RlbmVyO1xuICB9XG5cbiAgc2V0Um9vbU9jY3VwYW50TGlzdGVuZXIob2NjdXBhbnRMaXN0ZW5lcikge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXRSb29tT2NjdXBhbnRMaXN0ZW5lciBcIiwgb2NjdXBhbnRMaXN0ZW5lcik7XG5cbiAgICB0aGlzLmVhc3lydGMuc2V0Um9vbU9jY3VwYW50TGlzdGVuZXIoZnVuY3Rpb24gKHJvb21OYW1lLCBvY2N1cGFudHMsIHByaW1hcnkpIHtcbiAgICAgIG9jY3VwYW50TGlzdGVuZXIob2NjdXBhbnRzKTtcbiAgICB9KTtcbiAgfVxuXG4gIHNldERhdGFDaGFubmVsTGlzdGVuZXJzKG9wZW5MaXN0ZW5lciwgY2xvc2VkTGlzdGVuZXIsIG1lc3NhZ2VMaXN0ZW5lcikge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXREYXRhQ2hhbm5lbExpc3RlbmVycyAgXCIsIG9wZW5MaXN0ZW5lciwgY2xvc2VkTGlzdGVuZXIsIG1lc3NhZ2VMaXN0ZW5lcik7XG4gICAgdGhpcy5lYXN5cnRjLnNldERhdGFDaGFubmVsT3Blbkxpc3RlbmVyKG9wZW5MaXN0ZW5lcik7XG4gICAgdGhpcy5lYXN5cnRjLnNldERhdGFDaGFubmVsQ2xvc2VMaXN0ZW5lcihjbG9zZWRMaXN0ZW5lcik7XG4gICAgdGhpcy5lYXN5cnRjLnNldFBlZXJMaXN0ZW5lcihtZXNzYWdlTGlzdGVuZXIpO1xuICB9XG5cbiAgdXBkYXRlVGltZU9mZnNldCgpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgdXBkYXRlVGltZU9mZnNldCBcIik7XG4gICAgY29uc3QgY2xpZW50U2VudFRpbWUgPSBEYXRlLm5vdygpICsgdGhpcy5hdmdUaW1lT2Zmc2V0O1xuXG4gICAgcmV0dXJuIGZldGNoKGRvY3VtZW50LmxvY2F0aW9uLmhyZWYsIHsgbWV0aG9kOiBcIkhFQURcIiwgY2FjaGU6IFwibm8tY2FjaGVcIiB9KS50aGVuKHJlcyA9PiB7XG4gICAgICB2YXIgcHJlY2lzaW9uID0gMTAwMDtcbiAgICAgIHZhciBzZXJ2ZXJSZWNlaXZlZFRpbWUgPSBuZXcgRGF0ZShyZXMuaGVhZGVycy5nZXQoXCJEYXRlXCIpKS5nZXRUaW1lKCkgKyBwcmVjaXNpb24gLyAyO1xuICAgICAgdmFyIGNsaWVudFJlY2VpdmVkVGltZSA9IERhdGUubm93KCk7XG4gICAgICB2YXIgc2VydmVyVGltZSA9IHNlcnZlclJlY2VpdmVkVGltZSArIChjbGllbnRSZWNlaXZlZFRpbWUgLSBjbGllbnRTZW50VGltZSkgLyAyO1xuICAgICAgdmFyIHRpbWVPZmZzZXQgPSBzZXJ2ZXJUaW1lIC0gY2xpZW50UmVjZWl2ZWRUaW1lO1xuXG4gICAgICB0aGlzLnNlcnZlclRpbWVSZXF1ZXN0cysrO1xuXG4gICAgICBpZiAodGhpcy5zZXJ2ZXJUaW1lUmVxdWVzdHMgPD0gMTApIHtcbiAgICAgICAgdGhpcy50aW1lT2Zmc2V0cy5wdXNoKHRpbWVPZmZzZXQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy50aW1lT2Zmc2V0c1t0aGlzLnNlcnZlclRpbWVSZXF1ZXN0cyAlIDEwXSA9IHRpbWVPZmZzZXQ7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYXZnVGltZU9mZnNldCA9IHRoaXMudGltZU9mZnNldHMucmVkdWNlKChhY2MsIG9mZnNldCkgPT4gYWNjICs9IG9mZnNldCwgMCkgLyB0aGlzLnRpbWVPZmZzZXRzLmxlbmd0aDtcblxuICAgICAgaWYgKHRoaXMuc2VydmVyVGltZVJlcXVlc3RzID4gMTApIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLnVwZGF0ZVRpbWVPZmZzZXQoKSwgNSAqIDYwICogMTAwMCk7IC8vIFN5bmMgY2xvY2sgZXZlcnkgNSBtaW51dGVzLlxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy51cGRhdGVUaW1lT2Zmc2V0KCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBjb25uZWN0KCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBjb25uZWN0IFwiKTtcbiAgICBQcm9taXNlLmFsbChbdGhpcy51cGRhdGVUaW1lT2Zmc2V0KCksIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuX2Nvbm5lY3QocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICB9KV0pLnRoZW4oKFtfLCBjbGllbnRJZF0pID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwiQlc3MyBjb25uZWN0ZWQgXCIgKyBjbGllbnRJZCk7XG4gICAgICB0aGlzLmNsaWVudElkID0gY2xpZW50SWQ7XG4gICAgICB0aGlzLl9teVJvb21Kb2luVGltZSA9IHRoaXMuX2dldFJvb21Kb2luVGltZShjbGllbnRJZCk7XG4gICAgICB0aGlzLmNvbm5lY3RBZ29yYSgpO1xuICAgICAgdGhpcy5jb25uZWN0U3VjY2VzcyhjbGllbnRJZCk7XG4gICAgfSkuY2F0Y2godGhpcy5jb25uZWN0RmFpbHVyZSk7XG4gIH1cblxuICBzaG91bGRTdGFydENvbm5lY3Rpb25UbyhjbGllbnQpIHtcbiAgICByZXR1cm4gdGhpcy5fbXlSb29tSm9pblRpbWUgPD0gY2xpZW50LnJvb21Kb2luVGltZTtcbiAgfVxuXG4gIHN0YXJ0U3RyZWFtQ29ubmVjdGlvbihjbGllbnRJZCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzdGFydFN0cmVhbUNvbm5lY3Rpb24gXCIsIGNsaWVudElkKTtcbiAgICB0aGlzLmVhc3lydGMuY2FsbChjbGllbnRJZCwgZnVuY3Rpb24gKGNhbGxlciwgbWVkaWEpIHtcbiAgICAgIGlmIChtZWRpYSA9PT0gXCJkYXRhY2hhbm5lbFwiKSB7XG4gICAgICAgIE5BRi5sb2cud3JpdGUoXCJTdWNjZXNzZnVsbHkgc3RhcnRlZCBkYXRhY2hhbm5lbCB0byBcIiwgY2FsbGVyKTtcbiAgICAgIH1cbiAgICB9LCBmdW5jdGlvbiAoZXJyb3JDb2RlLCBlcnJvclRleHQpIHtcbiAgICAgIE5BRi5sb2cuZXJyb3IoZXJyb3JDb2RlLCBlcnJvclRleHQpO1xuICAgIH0sIGZ1bmN0aW9uICh3YXNBY2NlcHRlZCkge1xuICAgICAgLy8gY29uc29sZS5sb2coXCJ3YXMgYWNjZXB0ZWQ9XCIgKyB3YXNBY2NlcHRlZCk7XG4gICAgfSk7XG4gIH1cblxuICBjbG9zZVN0cmVhbUNvbm5lY3Rpb24oY2xpZW50SWQpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgY2xvc2VTdHJlYW1Db25uZWN0aW9uIFwiLCBjbGllbnRJZCk7XG4gICAgdGhpcy5lYXN5cnRjLmhhbmd1cChjbGllbnRJZCk7XG4gIH1cblxuICBzZW5kRGF0YShjbGllbnRJZCwgZGF0YVR5cGUsIGRhdGEpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2VuZERhdGEgXCIsIGNsaWVudElkLCBkYXRhVHlwZSwgZGF0YSk7XG4gICAgLy8gc2VuZCB2aWEgd2VicnRjIG90aGVyd2lzZSBmYWxsYmFjayB0byB3ZWJzb2NrZXRzXG4gICAgdGhpcy5lYXN5cnRjLnNlbmREYXRhKGNsaWVudElkLCBkYXRhVHlwZSwgZGF0YSk7XG4gIH1cblxuICBzZW5kRGF0YUd1YXJhbnRlZWQoY2xpZW50SWQsIGRhdGFUeXBlLCBkYXRhKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNlbmREYXRhR3VhcmFudGVlZCBcIiwgY2xpZW50SWQsIGRhdGFUeXBlLCBkYXRhKTtcbiAgICB0aGlzLmVhc3lydGMuc2VuZERhdGFXUyhjbGllbnRJZCwgZGF0YVR5cGUsIGRhdGEpO1xuICB9XG5cbiAgYnJvYWRjYXN0RGF0YShkYXRhVHlwZSwgZGF0YSkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBicm9hZGNhc3REYXRhIFwiLCBkYXRhVHlwZSwgZGF0YSk7XG4gICAgdmFyIHJvb21PY2N1cGFudHMgPSB0aGlzLmVhc3lydGMuZ2V0Um9vbU9jY3VwYW50c0FzTWFwKHRoaXMucm9vbSk7XG5cbiAgICAvLyBJdGVyYXRlIG92ZXIgdGhlIGtleXMgb2YgdGhlIGVhc3lydGMgcm9vbSBvY2N1cGFudHMgbWFwLlxuICAgIC8vIGdldFJvb21PY2N1cGFudHNBc0FycmF5IHVzZXMgT2JqZWN0LmtleXMgd2hpY2ggYWxsb2NhdGVzIG1lbW9yeS5cbiAgICBmb3IgKHZhciByb29tT2NjdXBhbnQgaW4gcm9vbU9jY3VwYW50cykge1xuICAgICAgaWYgKHJvb21PY2N1cGFudHNbcm9vbU9jY3VwYW50XSAmJiByb29tT2NjdXBhbnQgIT09IHRoaXMuZWFzeXJ0Yy5teUVhc3lydGNpZCkge1xuICAgICAgICAvLyBzZW5kIHZpYSB3ZWJydGMgb3RoZXJ3aXNlIGZhbGxiYWNrIHRvIHdlYnNvY2tldHNcbiAgICAgICAgdGhpcy5lYXN5cnRjLnNlbmREYXRhKHJvb21PY2N1cGFudCwgZGF0YVR5cGUsIGRhdGEpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGJyb2FkY2FzdERhdGFHdWFyYW50ZWVkKGRhdGFUeXBlLCBkYXRhKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGJyb2FkY2FzdERhdGFHdWFyYW50ZWVkIFwiLCBkYXRhVHlwZSwgZGF0YSk7XG4gICAgdmFyIGRlc3RpbmF0aW9uID0geyB0YXJnZXRSb29tOiB0aGlzLnJvb20gfTtcbiAgICB0aGlzLmVhc3lydGMuc2VuZERhdGFXUyhkZXN0aW5hdGlvbiwgZGF0YVR5cGUsIGRhdGEpO1xuICB9XG5cbiAgZ2V0Q29ubmVjdFN0YXR1cyhjbGllbnRJZCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBnZXRDb25uZWN0U3RhdHVzIFwiLCBjbGllbnRJZCk7XG4gICAgdmFyIHN0YXR1cyA9IHRoaXMuZWFzeXJ0Yy5nZXRDb25uZWN0U3RhdHVzKGNsaWVudElkKTtcblxuICAgIGlmIChzdGF0dXMgPT0gdGhpcy5lYXN5cnRjLklTX0NPTk5FQ1RFRCkge1xuICAgICAgcmV0dXJuIE5BRi5hZGFwdGVycy5JU19DT05ORUNURUQ7XG4gICAgfSBlbHNlIGlmIChzdGF0dXMgPT0gdGhpcy5lYXN5cnRjLk5PVF9DT05ORUNURUQpIHtcbiAgICAgIHJldHVybiBOQUYuYWRhcHRlcnMuTk9UX0NPTk5FQ1RFRDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIE5BRi5hZGFwdGVycy5DT05ORUNUSU5HO1xuICAgIH1cbiAgfVxuXG4gIGdldE1lZGlhU3RyZWFtKGNsaWVudElkLCBzdHJlYW1OYW1lID0gXCJhdWRpb1wiKSB7XG5cbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgZ2V0TWVkaWFTdHJlYW0gXCIsIGNsaWVudElkLCBzdHJlYW1OYW1lKTtcblxuICAgIGlmICh0aGlzLm1lZGlhU3RyZWFtc1tjbGllbnRJZF0gJiYgdGhpcy5tZWRpYVN0cmVhbXNbY2xpZW50SWRdW3N0cmVhbU5hbWVdKSB7XG4gICAgICBOQUYubG9nLndyaXRlKGBBbHJlYWR5IGhhZCAke3N0cmVhbU5hbWV9IGZvciAke2NsaWVudElkfWApO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLm1lZGlhU3RyZWFtc1tjbGllbnRJZF1bc3RyZWFtTmFtZV0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBOQUYubG9nLndyaXRlKGBXYWl0aW5nIG9uICR7c3RyZWFtTmFtZX0gZm9yICR7Y2xpZW50SWR9YCk7XG5cbiAgICAgIC8vIENyZWF0ZSBpbml0aWFsIHBlbmRpbmdNZWRpYVJlcXVlc3RzIHdpdGggYXVkaW98dmlkZW8gYWxpYXNcbiAgICAgIGlmICghdGhpcy5wZW5kaW5nTWVkaWFSZXF1ZXN0cy5oYXMoY2xpZW50SWQpKSB7XG4gICAgICAgIGNvbnN0IHBlbmRpbmdNZWRpYVJlcXVlc3RzID0ge307XG5cbiAgICAgICAgY29uc3QgYXVkaW9Qcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIHBlbmRpbmdNZWRpYVJlcXVlc3RzLmF1ZGlvID0geyByZXNvbHZlLCByZWplY3QgfTtcbiAgICAgICAgfSkuY2F0Y2goZSA9PiBOQUYubG9nLndhcm4oYCR7Y2xpZW50SWR9IGdldE1lZGlhU3RyZWFtIEF1ZGlvIEVycm9yYCwgZSkpO1xuICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0cy5hdWRpby5wcm9taXNlID0gYXVkaW9Qcm9taXNlO1xuXG4gICAgICAgIGNvbnN0IHZpZGVvUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0cy52aWRlbyA9IHsgcmVzb2x2ZSwgcmVqZWN0IH07XG4gICAgICAgIH0pLmNhdGNoKGUgPT4gTkFGLmxvZy53YXJuKGAke2NsaWVudElkfSBnZXRNZWRpYVN0cmVhbSBWaWRlbyBFcnJvcmAsIGUpKTtcbiAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHMudmlkZW8ucHJvbWlzZSA9IHZpZGVvUHJvbWlzZTtcblxuICAgICAgICB0aGlzLnBlbmRpbmdNZWRpYVJlcXVlc3RzLnNldChjbGllbnRJZCwgcGVuZGluZ01lZGlhUmVxdWVzdHMpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwZW5kaW5nTWVkaWFSZXF1ZXN0cyA9IHRoaXMucGVuZGluZ01lZGlhUmVxdWVzdHMuZ2V0KGNsaWVudElkKTtcblxuICAgICAgLy8gQ3JlYXRlIGluaXRpYWwgcGVuZGluZ01lZGlhUmVxdWVzdHMgd2l0aCBzdHJlYW1OYW1lXG4gICAgICBpZiAoIXBlbmRpbmdNZWRpYVJlcXVlc3RzW3N0cmVhbU5hbWVdKSB7XG4gICAgICAgIGNvbnN0IHN0cmVhbVByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHNbc3RyZWFtTmFtZV0gPSB7IHJlc29sdmUsIHJlamVjdCB9O1xuICAgICAgICB9KS5jYXRjaChlID0+IE5BRi5sb2cud2FybihgJHtjbGllbnRJZH0gZ2V0TWVkaWFTdHJlYW0gXCIke3N0cmVhbU5hbWV9XCIgRXJyb3JgLCBlKSk7XG4gICAgICAgIHBlbmRpbmdNZWRpYVJlcXVlc3RzW3N0cmVhbU5hbWVdLnByb21pc2UgPSBzdHJlYW1Qcm9taXNlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5wZW5kaW5nTWVkaWFSZXF1ZXN0cy5nZXQoY2xpZW50SWQpW3N0cmVhbU5hbWVdLnByb21pc2U7XG4gICAgfVxuICB9XG5cbiAgc2V0TWVkaWFTdHJlYW0oY2xpZW50SWQsIHN0cmVhbSwgc3RyZWFtTmFtZSkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXRNZWRpYVN0cmVhbSBcIiwgY2xpZW50SWQsIHN0cmVhbSwgc3RyZWFtTmFtZSk7XG4gICAgY29uc3QgcGVuZGluZ01lZGlhUmVxdWVzdHMgPSB0aGlzLnBlbmRpbmdNZWRpYVJlcXVlc3RzLmdldChjbGllbnRJZCk7IC8vIHJldHVybiB1bmRlZmluZWQgaWYgdGhlcmUgaXMgbm8gZW50cnkgaW4gdGhlIE1hcFxuICAgIGNvbnN0IGNsaWVudE1lZGlhU3RyZWFtcyA9IHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXSA9IHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXSB8fCB7fTtcblxuICAgIGlmIChzdHJlYW1OYW1lID09PSAnZGVmYXVsdCcpIHtcbiAgICAgIC8vIFNhZmFyaSBkb2Vzbid0IGxpa2UgaXQgd2hlbiB5b3UgdXNlIGEgbWl4ZWQgbWVkaWEgc3RyZWFtIHdoZXJlIG9uZSBvZiB0aGUgdHJhY2tzIGlzIGluYWN0aXZlLCBzbyB3ZVxuICAgICAgLy8gc3BsaXQgdGhlIHRyYWNrcyBpbnRvIHR3byBzdHJlYW1zLlxuICAgICAgLy8gQWRkIG1lZGlhU3RyZWFtcyBhdWRpbyBzdHJlYW1OYW1lIGFsaWFzXG4gICAgICBjb25zdCBhdWRpb1RyYWNrcyA9IHN0cmVhbS5nZXRBdWRpb1RyYWNrcygpO1xuICAgICAgaWYgKGF1ZGlvVHJhY2tzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgYXVkaW9TdHJlYW0gPSBuZXcgTWVkaWFTdHJlYW0oKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhdWRpb1RyYWNrcy5mb3JFYWNoKHRyYWNrID0+IGF1ZGlvU3RyZWFtLmFkZFRyYWNrKHRyYWNrKSk7XG4gICAgICAgICAgY2xpZW50TWVkaWFTdHJlYW1zLmF1ZGlvID0gYXVkaW9TdHJlYW07XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBOQUYubG9nLndhcm4oYCR7Y2xpZW50SWR9IHNldE1lZGlhU3RyZWFtIFwiYXVkaW9cIiBhbGlhcyBFcnJvcmAsIGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVzb2x2ZSB0aGUgcHJvbWlzZSBmb3IgdGhlIHVzZXIncyBtZWRpYSBzdHJlYW0gYXVkaW8gYWxpYXMgaWYgaXQgZXhpc3RzLlxuICAgICAgICBpZiAocGVuZGluZ01lZGlhUmVxdWVzdHMpIHBlbmRpbmdNZWRpYVJlcXVlc3RzLmF1ZGlvLnJlc29sdmUoYXVkaW9TdHJlYW0pO1xuICAgICAgfVxuXG4gICAgICAvLyBBZGQgbWVkaWFTdHJlYW1zIHZpZGVvIHN0cmVhbU5hbWUgYWxpYXNcbiAgICAgIGNvbnN0IHZpZGVvVHJhY2tzID0gc3RyZWFtLmdldFZpZGVvVHJhY2tzKCk7XG4gICAgICBpZiAodmlkZW9UcmFja3MubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCB2aWRlb1N0cmVhbSA9IG5ldyBNZWRpYVN0cmVhbSgpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHZpZGVvVHJhY2tzLmZvckVhY2godHJhY2sgPT4gdmlkZW9TdHJlYW0uYWRkVHJhY2sodHJhY2spKTtcbiAgICAgICAgICBjbGllbnRNZWRpYVN0cmVhbXMudmlkZW8gPSB2aWRlb1N0cmVhbTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIE5BRi5sb2cud2FybihgJHtjbGllbnRJZH0gc2V0TWVkaWFTdHJlYW0gXCJ2aWRlb1wiIGFsaWFzIEVycm9yYCwgZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZXNvbHZlIHRoZSBwcm9taXNlIGZvciB0aGUgdXNlcidzIG1lZGlhIHN0cmVhbSB2aWRlbyBhbGlhcyBpZiBpdCBleGlzdHMuXG4gICAgICAgIGlmIChwZW5kaW5nTWVkaWFSZXF1ZXN0cykgcGVuZGluZ01lZGlhUmVxdWVzdHMudmlkZW8ucmVzb2x2ZSh2aWRlb1N0cmVhbSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNsaWVudE1lZGlhU3RyZWFtc1tzdHJlYW1OYW1lXSA9IHN0cmVhbTtcblxuICAgICAgLy8gUmVzb2x2ZSB0aGUgcHJvbWlzZSBmb3IgdGhlIHVzZXIncyBtZWRpYSBzdHJlYW0gYnkgU3RyZWFtTmFtZSBpZiBpdCBleGlzdHMuXG4gICAgICBpZiAocGVuZGluZ01lZGlhUmVxdWVzdHMgJiYgcGVuZGluZ01lZGlhUmVxdWVzdHNbc3RyZWFtTmFtZV0pIHtcbiAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHNbc3RyZWFtTmFtZV0ucmVzb2x2ZShzdHJlYW0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFkZExvY2FsTWVkaWFTdHJlYW0oc3RyZWFtLCBzdHJlYW1OYW1lKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGFkZExvY2FsTWVkaWFTdHJlYW0gXCIsIHN0cmVhbSwgc3RyZWFtTmFtZSk7XG4gICAgY29uc3QgZWFzeXJ0YyA9IHRoaXMuZWFzeXJ0YztcbiAgICBzdHJlYW1OYW1lID0gc3RyZWFtTmFtZSB8fCBzdHJlYW0uaWQ7XG4gICAgdGhpcy5zZXRNZWRpYVN0cmVhbShcImxvY2FsXCIsIHN0cmVhbSwgc3RyZWFtTmFtZSk7XG4gICAgZWFzeXJ0Yy5yZWdpc3RlcjNyZFBhcnR5TG9jYWxNZWRpYVN0cmVhbShzdHJlYW0sIHN0cmVhbU5hbWUpO1xuXG4gICAgLy8gQWRkIGxvY2FsIHN0cmVhbSB0byBleGlzdGluZyBjb25uZWN0aW9uc1xuICAgIE9iamVjdC5rZXlzKHRoaXMucmVtb3RlQ2xpZW50cykuZm9yRWFjaChjbGllbnRJZCA9PiB7XG4gICAgICBpZiAoZWFzeXJ0Yy5nZXRDb25uZWN0U3RhdHVzKGNsaWVudElkKSAhPT0gZWFzeXJ0Yy5OT1RfQ09OTkVDVEVEKSB7XG4gICAgICAgIGVhc3lydGMuYWRkU3RyZWFtVG9DYWxsKGNsaWVudElkLCBzdHJlYW1OYW1lKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHJlbW92ZUxvY2FsTWVkaWFTdHJlYW0oc3RyZWFtTmFtZSkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyByZW1vdmVMb2NhbE1lZGlhU3RyZWFtIFwiLCBzdHJlYW1OYW1lKTtcbiAgICB0aGlzLmVhc3lydGMuY2xvc2VMb2NhbE1lZGlhU3RyZWFtKHN0cmVhbU5hbWUpO1xuICAgIGRlbGV0ZSB0aGlzLm1lZGlhU3RyZWFtc1tcImxvY2FsXCJdW3N0cmVhbU5hbWVdO1xuICB9XG5cbiAgZW5hYmxlTWljcm9waG9uZShlbmFibGVkKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGVuYWJsZU1pY3JvcGhvbmUgXCIsIGVuYWJsZWQpO1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVNaWNyb3Bob25lKGVuYWJsZWQpO1xuICB9XG5cbiAgZW5hYmxlQ2FtZXJhKGVuYWJsZWQpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgZW5hYmxlQ2FtZXJhIFwiLCBlbmFibGVkKTtcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlQ2FtZXJhKGVuYWJsZWQpO1xuICB9XG5cbiAgZGlzY29ubmVjdCgpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgZGlzY29ubmVjdCBcIik7XG4gICAgdGhpcy5lYXN5cnRjLmRpc2Nvbm5lY3QoKTtcbiAgfVxuXG4gIGFzeW5jIGhhbmRsZVVzZXJQdWJsaXNoZWQodXNlciwgbWVkaWFUeXBlKSB7fVxuXG4gIGhhbmRsZVVzZXJVbnB1Ymxpc2hlZCh1c2VyLCBtZWRpYVR5cGUpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgaGFuZGxlVXNlclVuUHVibGlzaGVkIFwiKTtcbiAgfVxuXG4gIGFzeW5jIGNvbm5lY3RBZ29yYSgpIHtcbiAgICAvLyBBZGQgYW4gZXZlbnQgbGlzdGVuZXIgdG8gcGxheSByZW1vdGUgdHJhY2tzIHdoZW4gcmVtb3RlIHVzZXIgcHVibGlzaGVzLlxuICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgIGlmICh0aGlzLmVuYWJsZVZpZGVvIHx8IHRoaXMuZW5hYmxlQXVkaW8pIHtcbiAgICAgIC8vdGhpcy5hZ29yYUNsaWVudCA9IEFnb3JhUlRDLmNyZWF0ZUNsaWVudCh7IG1vZGU6IFwicnRjXCIsIGNvZGVjOiBcInZwOFwiIH0pO1xuICAgICAgdGhpcy5hZ29yYUNsaWVudCA9IEFnb3JhUlRDLmNyZWF0ZUNsaWVudCh7IG1vZGU6IFwibGl2ZVwiLCBjb2RlYzogXCJoMjY0XCIgfSk7XG4gICAgICB0aGlzLmFnb3JhQ2xpZW50LnNldENsaWVudFJvbGUoXCJob3N0XCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmFnb3JhQ2xpZW50ID0gQWdvcmFSVEMuY3JlYXRlQ2xpZW50KHsgbW9kZTogXCJsaXZlXCIsIGNvZGVjOiBcImgyNjRcIiB9KTtcbiAgICB9XG5cbiAgICB0aGlzLmFnb3JhQ2xpZW50Lm9uKFwidXNlci1qb2luZWRcIiwgYXN5bmMgKHVzZXIpID0+IHtcblx0ICAgIGNvbnNvbGUud2FybihcInVzZXItam9pbmVkXCIsdXNlcik7XG4gICAgfSk7XG4gICAgdGhpcy5hZ29yYUNsaWVudC5vbihcInVzZXItcHVibGlzaGVkXCIsIGFzeW5jICh1c2VyLCBtZWRpYVR5cGUpID0+IHtcblxuICAgICAgbGV0IGNsaWVudElkID0gdXNlci51aWQ7XG4gICAgICBjb25zb2xlLmxvZyhcIkJXNzMgaGFuZGxlVXNlclB1Ymxpc2hlZCBcIiArIGNsaWVudElkICsgXCIgXCIgKyBtZWRpYVR5cGUsIHRoYXQuYWdvcmFDbGllbnQpO1xuICAgICAgYXdhaXQgdGhhdC5hZ29yYUNsaWVudC5zdWJzY3JpYmUodXNlciwgbWVkaWFUeXBlKTtcbiAgICAgIGNvbnNvbGUubG9nKFwiQlc3MyBoYW5kbGVVc2VyUHVibGlzaGVkMiBcIiArIGNsaWVudElkICsgXCIgXCIgKyB0aGF0LmFnb3JhQ2xpZW50KTtcblxuICAgICAgY29uc3QgcGVuZGluZ01lZGlhUmVxdWVzdHMgPSB0aGF0LnBlbmRpbmdNZWRpYVJlcXVlc3RzLmdldChjbGllbnRJZCk7XG4gICAgICBjb25zdCBjbGllbnRNZWRpYVN0cmVhbXMgPSB0aGF0Lm1lZGlhU3RyZWFtc1tjbGllbnRJZF0gPSB0aGF0Lm1lZGlhU3RyZWFtc1tjbGllbnRJZF0gfHwge307XG5cbiAgICAgIGlmIChtZWRpYVR5cGUgPT09ICdhdWRpbycpIHtcbiAgICAgICAgY29uc3QgYXVkaW9TdHJlYW0gPSBuZXcgTWVkaWFTdHJlYW0oKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJ1c2VyLmF1ZGlvVHJhY2sgXCIsIHVzZXIuYXVkaW9UcmFjay5fbWVkaWFTdHJlYW1UcmFjayk7XG4gICAgICAgIGF1ZGlvU3RyZWFtLmFkZFRyYWNrKHVzZXIuYXVkaW9UcmFjay5fbWVkaWFTdHJlYW1UcmFjayk7XG4gICAgICAgIGNsaWVudE1lZGlhU3RyZWFtcy5hdWRpbyA9IGF1ZGlvU3RyZWFtO1xuICAgICAgICBpZiAocGVuZGluZ01lZGlhUmVxdWVzdHMpIHBlbmRpbmdNZWRpYVJlcXVlc3RzLmF1ZGlvLnJlc29sdmUoYXVkaW9TdHJlYW0pO1xuICAgICAgfVxuXG4gICAgICBsZXQgdmlkZW9TdHJlYW0gPSBudWxsO1xuICAgICAgaWYgKG1lZGlhVHlwZSA9PT0gJ3ZpZGVvJykge1xuICAgICAgICB2aWRlb1N0cmVhbSA9IG5ldyBNZWRpYVN0cmVhbSgpO1xuICAgICAgICBjb25zb2xlLmxvZyhcInVzZXIudmlkZW9UcmFjayBcIiwgdXNlci52aWRlb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrKTtcbiAgICAgICAgdmlkZW9TdHJlYW0uYWRkVHJhY2sodXNlci52aWRlb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrKTtcbiAgICAgICAgY2xpZW50TWVkaWFTdHJlYW1zLnZpZGVvID0gdmlkZW9TdHJlYW07XG4gICAgICAgIGlmIChwZW5kaW5nTWVkaWFSZXF1ZXN0cykgcGVuZGluZ01lZGlhUmVxdWVzdHMudmlkZW8ucmVzb2x2ZSh2aWRlb1N0cmVhbSk7XG4gICAgICAgIC8vdXNlci52aWRlb1RyYWNrXG4gICAgICB9XG5cbiAgICAgIGlmIChjbGllbnRJZCA9PSAnQ0NDJykge1xuXHQgIGlmIChtZWRpYVR5cGUgPT09ICd2aWRlbycpIHtcblx0XHQvLyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInZpZGVvMzYwXCIpLnNyY09iamVjdD12aWRlb1N0cmVhbTtcblx0XHQgLy9kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3ZpZGVvMzYwXCIpLnNldEF0dHJpYnV0ZShcInNyY1wiLCB2aWRlb1N0cmVhbSk7XG5cdFx0IC8vZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN2aWRlbzM2MFwiKS5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgdXNlci52aWRlb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrKTtcblx0XHQgLy9kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3ZpZGVvMzYwXCIpLnNyY09iamVjdD0gdXNlci52aWRlb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrO1xuXHRcdCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3ZpZGVvMzYwXCIpLnNyY09iamVjdD12aWRlb1N0cmVhbTtcblx0XHQgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN2aWRlbzM2MFwiKS5wbGF5KCk7XG5cdCAgfVxuXHQgIGlmIChtZWRpYVR5cGUgPT09ICdhdWRpbycpIHtcblx0XHQgIHVzZXIuYXVkaW9UcmFjay5wbGF5KCk7XG5cdCAgfVxuICAgICAgfVxuICAgICAgaWYgKGNsaWVudElkID09ICdEREQnKSB7XG5cdCAgaWYgKG1lZGlhVHlwZSA9PT0gJ3ZpZGVvJykge1xuXHQgIFx0dXNlci52aWRlb1RyYWNrLnBsYXkoXCJ2aWRlbzM2MFwiKTtcblx0ICB9XG5cdCAgaWYgKG1lZGlhVHlwZSA9PT0gJ2F1ZGlvJykge1xuXHRcdCAgdXNlci5hdWRpb1RyYWNrLnBsYXkoKTtcblx0ICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmFnb3JhQ2xpZW50Lm9uKFwidXNlci11bnB1Ymxpc2hlZFwiLCB0aGF0LmhhbmRsZVVzZXJVbnB1Ymxpc2hlZCk7XG5cbiAgICBjb25zb2xlLmxvZyhcImNvbm5lY3QgYWdvcmEgXCIpO1xuICAgIC8vIEpvaW4gYSBjaGFubmVsIGFuZCBjcmVhdGUgbG9jYWwgdHJhY2tzLiBCZXN0IHByYWN0aWNlIGlzIHRvIHVzZSBQcm9taXNlLmFsbCBhbmQgcnVuIHRoZW0gY29uY3VycmVudGx5LlxuICAgIC8vIG9cblxuXG4gaWYgKHRoaXMuZW5hYmxlQXZhdGFyKSB7XG4gICAgICAgIHZhciBzdHJlYW0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbnZhc1wiKS5jYXB0dXJlU3RyZWFtKDMwKTtcbiAgICAgICAgW3RoaXMudXNlcmlkLCB0aGlzLmxvY2FsVHJhY2tzLmF1ZGlvVHJhY2ssIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFja10gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgIHRoaXMuYWdvcmFDbGllbnQuam9pbih0aGlzLmFwcGlkLCB0aGlzLnJvb20sIHRoaXMudG9rZW4gfHwgbnVsbCwgdGhpcy5jbGllbnRJZCB8fCBudWxsKSxcbiAgICAgICAgQWdvcmFSVEMuY3JlYXRlTWljcm9waG9uZUF1ZGlvVHJhY2soKSwgQWdvcmFSVEMuY3JlYXRlQ3VzdG9tVmlkZW9UcmFjayh7IG1lZGlhU3RyZWFtVHJhY2s6IHN0cmVhbS5nZXRWaWRlb1RyYWNrcygpWzBdIH0pXSk7XG4gfVxuIGVsc2UgaWYgKHRoaXMuZW5hYmxlVmlkZW8gJiYgdGhpcy5lbmFibGVBdWRpbykge1xuICAgICAgW3RoaXMudXNlcmlkLCB0aGlzLmxvY2FsVHJhY2tzLmF1ZGlvVHJhY2ssIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFja10gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICB0aGlzLmFnb3JhQ2xpZW50LmpvaW4odGhpcy5hcHBpZCwgdGhpcy5yb29tLCB0aGlzLnRva2VuIHx8IG51bGwsIHRoaXMuY2xpZW50SWQgfHwgbnVsbCksXG4gICAgICBBZ29yYVJUQy5jcmVhdGVNaWNyb3Bob25lQXVkaW9UcmFjaygpLCBBZ29yYVJUQy5jcmVhdGVDYW1lcmFWaWRlb1RyYWNrKHtlbmNvZGVyQ29uZmlnOiAnMzYwcF80J30pXSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmVuYWJsZVZpZGVvKSB7XG4gICAgICBbdGhpcy51c2VyaWQsIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFja10gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAvLyBKb2luIHRoZSBjaGFubmVsLlxuICAgICAgdGhpcy5hZ29yYUNsaWVudC5qb2luKHRoaXMuYXBwaWQsIHRoaXMucm9vbSwgdGhpcy50b2tlbiB8fCBudWxsLCB0aGlzLmNsaWVudElkIHx8IG51bGwpLCBBZ29yYVJUQy5jcmVhdGVDYW1lcmFWaWRlb1RyYWNrKFwiMzYwcF80XCIpXSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmVuYWJsZUF1ZGlvKSB7XG4gICAgICBbdGhpcy51c2VyaWQsIHRoaXMubG9jYWxUcmFja3MuYXVkaW9UcmFja10gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAvLyBKb2luIHRoZSBjaGFubmVsLlxuICAgICAgdGhpcy5hZ29yYUNsaWVudC5qb2luKHRoaXMuYXBwaWQsIHRoaXMucm9vbSwgdGhpcy50b2tlbiB8fCBudWxsLCB0aGlzLmNsaWVudElkIHx8IG51bGwpLCBBZ29yYVJUQy5jcmVhdGVNaWNyb3Bob25lQXVkaW9UcmFjaygpXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudXNlcmlkID0gYXdhaXQgdGhpcy5hZ29yYUNsaWVudC5qb2luKHRoaXMuYXBwaWQsIHRoaXMucm9vbSwgdGhpcy50b2tlbiB8fCBudWxsLCB0aGlzLmNsaWVudElkIHx8IG51bGwpO1xuICAgIH1cblxuXHQgIFxuICAgIC8vIHNlbGVjdCBmYWNldGltZSBjYW1lcmEgaWYgZXhpc3RzXG4gICAgaWYgKHRoaXMuZW5hYmxlVmlkZW8pIHtcblx0ICAgIGxldCBjYW1zID0gYXdhaXQgQWdvcmFSVEMuZ2V0Q2FtZXJhcygpO1xuXHQgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYW1zLmxlbmd0aDsgaSsrKSB7XG5cdCAgICAgIGlmIChjYW1zW2ldLmxhYmVsLmluZGV4T2YoXCJGYWNlVGltZVwiKSA9PSAwKSB7XG5cdFx0Y29uc29sZS5sb2coXCJzZWxlY3QgRmFjZVRpbWUgY2FtZXJhXCIsY2Ftc1tpXS5kZXZpY2VJZCApO1xuXHQgICAgXHRhd2FpdCB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2suc2V0RGV2aWNlKGNhbXNbaV0uZGV2aWNlSWQpO1xuXHQgICAgICB9XG5cdCAgICB9XG4gICAgfVxuXHQgIFxuICAgIGlmICh0aGlzLmVuYWJsZVZpZGVvICYmIHRoaXMuc2hvd0xvY2FsKSB7XG4gICAgICB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2sucGxheShcImxvY2FsLXBsYXllclwiKTtcbiAgICB9XG5cbiAgICAvLyBFbmFibGUgdmlydHVhbCBiYWNrZ3JvdW5kIE9MRCBNZXRob2RcbiAgICBpZiAodGhpcy5lbmFibGVWaWRlbyAmJiB0aGlzLnZiZzAgJiYgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrKSB7XG4gICAgICAgIGNvbnN0IGltZ0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcbiAgICAgICAgaW1nRWxlbWVudC5vbmxvYWQgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgaWYgKCF0aGlzLnZpcnR1YWxCYWNrZ3JvdW5kSW5zdGFuY2UpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiU0VHIElOSVQgXCIsIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjayk7XG4gICAgICAgICAgICB0aGlzLnZpcnR1YWxCYWNrZ3JvdW5kSW5zdGFuY2UgPSBhd2FpdCBTZWdQbHVnaW4uaW5qZWN0KHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjaywgXCIvYXNzZXRzL3dhc21zMFwiKS5jYXRjaChjb25zb2xlLmVycm9yKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiU0VHIElOSVRFRFwiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy52aXJ0dWFsQmFja2dyb3VuZEluc3RhbmNlLnNldE9wdGlvbnMoeyBlbmFibGU6IHRydWUsIGJhY2tncm91bmQ6IGltZ0VsZW1lbnQgfSk7XG4gICAgICAgIH07XG4gICAgICAgIGltZ0VsZW1lbnQuc3JjID0gJ2RhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQVFBQUFBRENBSUFBQUE3bGptUkFBQUFEMGxFUVZSNFhtTmcrTStBUURnNUFPazlDL1Zrb216WUFBQUFBRWxGVGtTdVFtQ0MnO1xuICAgIH1cblxuICAgIC8vIEVuYWJsZSB2aXJ0dWFsIGJhY2tncm91bmQgTmV3IE1ldGhvZFxuICAgIGlmICh0aGlzLmVuYWJsZVZpZGVvICYmIHRoaXMudmJnICYmIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjaykge1xuXG5cdHRoaXMuZXh0ZW5zaW9uID0gbmV3IFZpcnR1YWxCYWNrZ3JvdW5kRXh0ZW5zaW9uKCk7XG5cdEFnb3JhUlRDLnJlZ2lzdGVyRXh0ZW5zaW9ucyhbdGhpcy5leHRlbnNpb25dKTtcblx0dGhpcy5wcm9jZXNzb3IgPSB0aGlzLmV4dGVuc2lvbi5jcmVhdGVQcm9jZXNzb3IoKTtcblx0YXdhaXQgdGhpcy5wcm9jZXNzb3IuaW5pdChcIi9hc3NldHMvd2FzbXNcIik7XG5cdHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjay5waXBlKHRoaXMucHJvY2Vzc29yKS5waXBlKHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjay5wcm9jZXNzb3JEZXN0aW5hdGlvbik7XG5cdGF3YWl0IHRoaXMucHJvY2Vzc29yLnNldE9wdGlvbnMoeyB0eXBlOiAnY29sb3InLCBjb2xvcjpcIiMwMGZmMDBcIn0pO1xuXHRhd2FpdCB0aGlzLnByb2Nlc3Nvci5lbmFibGUoKTtcbiAgICB9XG5cbiAgICAvLyBQdWJsaXNoIHRoZSBsb2NhbCB2aWRlbyBhbmQgYXVkaW8gdHJhY2tzIHRvIHRoZSBjaGFubmVsLlxuICAgIGlmICh0aGlzLmVuYWJsZVZpZGVvIHx8IHRoaXMuZW5hYmxlQXVkaW8gfHwgdGhpcy5lbmFibGVBdmF0YXIpIHtcbiAgICAgIGF3YWl0IHRoaXMuYWdvcmFDbGllbnQucHVibGlzaChPYmplY3QudmFsdWVzKHRoaXMubG9jYWxUcmFja3MpKTtcbiAgICAgIGNvbnNvbGUubG9nKFwicHVibGlzaCBzdWNjZXNzXCIpO1xuICAgIH1cblxuICB9XG5cbiAgLyoqXG4gICAqIFByaXZhdGVzXG4gICAqL1xuXG4gIGFzeW5jIF9jb25uZWN0KGNvbm5lY3RTdWNjZXNzLCBjb25uZWN0RmFpbHVyZSkge1xuICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgIGF3YWl0IHRoYXQuZWFzeXJ0Yy5jb25uZWN0KHRoYXQuYXBwLCBjb25uZWN0U3VjY2VzcywgY29ubmVjdEZhaWx1cmUpO1xuXG4gICAgLypcbiAgICAgICB0aGlzLmVhc3lydGMuc2V0U3RyZWFtQWNjZXB0b3IodGhpcy5zZXRNZWRpYVN0cmVhbS5iaW5kKHRoaXMpKTtcbiAgICAgICB0aGlzLmVhc3lydGMuc2V0T25TdHJlYW1DbG9zZWQoZnVuY3Rpb24oY2xpZW50SWQsIHN0cmVhbSwgc3RyZWFtTmFtZSkge1xuICAgICAgICBkZWxldGUgdGhpcy5tZWRpYVN0cmVhbXNbY2xpZW50SWRdW3N0cmVhbU5hbWVdO1xuICAgICAgfSk7XG4gICAgICAgaWYgKHRoYXQuZWFzeXJ0Yy5hdWRpb0VuYWJsZWQgfHwgdGhhdC5lYXN5cnRjLnZpZGVvRW5hYmxlZCkge1xuICAgICAgICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYSh7XG4gICAgICAgICAgdmlkZW86IHRoYXQuZWFzeXJ0Yy52aWRlb0VuYWJsZWQsXG4gICAgICAgICAgYXVkaW86IHRoYXQuZWFzeXJ0Yy5hdWRpb0VuYWJsZWRcbiAgICAgICAgfSkudGhlbihcbiAgICAgICAgICBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICAgICAgICAgIHRoYXQuYWRkTG9jYWxNZWRpYVN0cmVhbShzdHJlYW0sIFwiZGVmYXVsdFwiKTtcbiAgICAgICAgICAgIHRoYXQuZWFzeXJ0Yy5jb25uZWN0KHRoYXQuYXBwLCBjb25uZWN0U3VjY2VzcywgY29ubmVjdEZhaWx1cmUpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgZnVuY3Rpb24oZXJyb3JDb2RlLCBlcnJtZXNnKSB7XG4gICAgICAgICAgICBOQUYubG9nLmVycm9yKGVycm9yQ29kZSwgZXJybWVzZyk7XG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhhdC5lYXN5cnRjLmNvbm5lY3QodGhhdC5hcHAsIGNvbm5lY3RTdWNjZXNzLCBjb25uZWN0RmFpbHVyZSk7XG4gICAgICB9XG4gICAgICAqL1xuICB9XG5cbiAgX2dldFJvb21Kb2luVGltZShjbGllbnRJZCkge1xuICAgIHZhciBteVJvb21JZCA9IHRoaXMucm9vbTsgLy9OQUYucm9vbTtcbiAgICB2YXIgam9pblRpbWUgPSB0aGlzLmVhc3lydGMuZ2V0Um9vbU9jY3VwYW50c0FzTWFwKG15Um9vbUlkKVtjbGllbnRJZF0ucm9vbUpvaW5UaW1lO1xuICAgIHJldHVybiBqb2luVGltZTtcbiAgfVxuXG4gIGdldFNlcnZlclRpbWUoKSB7XG4gICAgcmV0dXJuIERhdGUubm93KCkgKyB0aGlzLmF2Z1RpbWVPZmZzZXQ7XG4gIH1cbn1cblxuTkFGLmFkYXB0ZXJzLnJlZ2lzdGVyKFwiYWdvcmFydGNcIiwgQWdvcmFSdGNBZGFwdGVyKTtcblxubW9kdWxlLmV4cG9ydHMgPSBBZ29yYVJ0Y0FkYXB0ZXI7XG4iXSwic291cmNlUm9vdCI6IiJ9