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

    if (obj.enableVideoFiltered) {
      this.enableVideoFiltered = obj.enableVideoFiltered;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIl0sIm5hbWVzIjpbIkFnb3JhUnRjQWRhcHRlciIsImNvbnN0cnVjdG9yIiwiZWFzeXJ0YyIsImNvbnNvbGUiLCJsb2ciLCJ3aW5kb3ciLCJhcHAiLCJyb29tIiwidXNlcmlkIiwiYXBwaWQiLCJtZWRpYVN0cmVhbXMiLCJyZW1vdGVDbGllbnRzIiwicGVuZGluZ01lZGlhUmVxdWVzdHMiLCJNYXAiLCJlbmFibGVWaWRlbyIsImVuYWJsZVZpZGVvRmlsdGVyZWQiLCJlbmFibGVBdWRpbyIsImVuYWJsZUF2YXRhciIsImxvY2FsVHJhY2tzIiwidmlkZW9UcmFjayIsImF1ZGlvVHJhY2siLCJ0b2tlbiIsImNsaWVudElkIiwidWlkIiwidmJnIiwidmJnMCIsInNob3dMb2NhbCIsInZpcnR1YWxCYWNrZ3JvdW5kSW5zdGFuY2UiLCJleHRlbnNpb24iLCJwcm9jZXNzb3IiLCJwaXBlUHJvY2Vzc29yIiwidHJhY2siLCJwaXBlIiwicHJvY2Vzc29yRGVzdGluYXRpb24iLCJzZXJ2ZXJUaW1lUmVxdWVzdHMiLCJ0aW1lT2Zmc2V0cyIsImF2Z1RpbWVPZmZzZXQiLCJhZ29yYUNsaWVudCIsInNldFBlZXJPcGVuTGlzdGVuZXIiLCJjbGllbnRDb25uZWN0aW9uIiwiZ2V0UGVlckNvbm5lY3Rpb25CeVVzZXJJZCIsInNldFBlZXJDbG9zZWRMaXN0ZW5lciIsInNldFNlcnZlclVybCIsInVybCIsInNldFNvY2tldFVybCIsInNldEFwcCIsImFwcE5hbWUiLCJzZXRSb29tIiwianNvbiIsInJlcGxhY2UiLCJvYmoiLCJKU09OIiwicGFyc2UiLCJuYW1lIiwiQWdvcmFSVEMiLCJsb2FkTW9kdWxlIiwiU2VnUGx1Z2luIiwiam9pblJvb20iLCJzZXRXZWJSdGNPcHRpb25zIiwib3B0aW9ucyIsImVuYWJsZURhdGFDaGFubmVscyIsImRhdGFjaGFubmVsIiwidmlkZW8iLCJhdWRpbyIsImVuYWJsZVZpZGVvUmVjZWl2ZSIsImVuYWJsZUF1ZGlvUmVjZWl2ZSIsInNldFNlcnZlckNvbm5lY3RMaXN0ZW5lcnMiLCJzdWNjZXNzTGlzdGVuZXIiLCJmYWlsdXJlTGlzdGVuZXIiLCJjb25uZWN0U3VjY2VzcyIsImNvbm5lY3RGYWlsdXJlIiwic2V0Um9vbU9jY3VwYW50TGlzdGVuZXIiLCJvY2N1cGFudExpc3RlbmVyIiwicm9vbU5hbWUiLCJvY2N1cGFudHMiLCJwcmltYXJ5Iiwic2V0RGF0YUNoYW5uZWxMaXN0ZW5lcnMiLCJvcGVuTGlzdGVuZXIiLCJjbG9zZWRMaXN0ZW5lciIsIm1lc3NhZ2VMaXN0ZW5lciIsInNldERhdGFDaGFubmVsT3Blbkxpc3RlbmVyIiwic2V0RGF0YUNoYW5uZWxDbG9zZUxpc3RlbmVyIiwic2V0UGVlckxpc3RlbmVyIiwidXBkYXRlVGltZU9mZnNldCIsImNsaWVudFNlbnRUaW1lIiwiRGF0ZSIsIm5vdyIsImZldGNoIiwiZG9jdW1lbnQiLCJsb2NhdGlvbiIsImhyZWYiLCJtZXRob2QiLCJjYWNoZSIsInRoZW4iLCJyZXMiLCJwcmVjaXNpb24iLCJzZXJ2ZXJSZWNlaXZlZFRpbWUiLCJoZWFkZXJzIiwiZ2V0IiwiZ2V0VGltZSIsImNsaWVudFJlY2VpdmVkVGltZSIsInNlcnZlclRpbWUiLCJ0aW1lT2Zmc2V0IiwicHVzaCIsInJlZHVjZSIsImFjYyIsIm9mZnNldCIsImxlbmd0aCIsInNldFRpbWVvdXQiLCJjb25uZWN0IiwiUHJvbWlzZSIsImFsbCIsInJlc29sdmUiLCJyZWplY3QiLCJfY29ubmVjdCIsIl8iLCJfbXlSb29tSm9pblRpbWUiLCJfZ2V0Um9vbUpvaW5UaW1lIiwiY29ubmVjdEFnb3JhIiwiY2F0Y2giLCJzaG91bGRTdGFydENvbm5lY3Rpb25UbyIsImNsaWVudCIsInJvb21Kb2luVGltZSIsInN0YXJ0U3RyZWFtQ29ubmVjdGlvbiIsImNhbGwiLCJjYWxsZXIiLCJtZWRpYSIsIk5BRiIsIndyaXRlIiwiZXJyb3JDb2RlIiwiZXJyb3JUZXh0IiwiZXJyb3IiLCJ3YXNBY2NlcHRlZCIsImNsb3NlU3RyZWFtQ29ubmVjdGlvbiIsImhhbmd1cCIsInNlbmREYXRhIiwiZGF0YVR5cGUiLCJkYXRhIiwic2VuZERhdGFHdWFyYW50ZWVkIiwic2VuZERhdGFXUyIsImJyb2FkY2FzdERhdGEiLCJyb29tT2NjdXBhbnRzIiwiZ2V0Um9vbU9jY3VwYW50c0FzTWFwIiwicm9vbU9jY3VwYW50IiwibXlFYXN5cnRjaWQiLCJicm9hZGNhc3REYXRhR3VhcmFudGVlZCIsImRlc3RpbmF0aW9uIiwidGFyZ2V0Um9vbSIsImdldENvbm5lY3RTdGF0dXMiLCJzdGF0dXMiLCJJU19DT05ORUNURUQiLCJhZGFwdGVycyIsIk5PVF9DT05ORUNURUQiLCJDT05ORUNUSU5HIiwiZ2V0TWVkaWFTdHJlYW0iLCJzdHJlYW1OYW1lIiwiaGFzIiwiYXVkaW9Qcm9taXNlIiwiZSIsIndhcm4iLCJwcm9taXNlIiwidmlkZW9Qcm9taXNlIiwic2V0Iiwic3RyZWFtUHJvbWlzZSIsInNldE1lZGlhU3RyZWFtIiwic3RyZWFtIiwiY2xpZW50TWVkaWFTdHJlYW1zIiwiYXVkaW9UcmFja3MiLCJnZXRBdWRpb1RyYWNrcyIsImF1ZGlvU3RyZWFtIiwiTWVkaWFTdHJlYW0iLCJmb3JFYWNoIiwiYWRkVHJhY2siLCJ2aWRlb1RyYWNrcyIsImdldFZpZGVvVHJhY2tzIiwidmlkZW9TdHJlYW0iLCJhZGRMb2NhbE1lZGlhU3RyZWFtIiwiaWQiLCJyZWdpc3RlcjNyZFBhcnR5TG9jYWxNZWRpYVN0cmVhbSIsIk9iamVjdCIsImtleXMiLCJhZGRTdHJlYW1Ub0NhbGwiLCJyZW1vdmVMb2NhbE1lZGlhU3RyZWFtIiwiY2xvc2VMb2NhbE1lZGlhU3RyZWFtIiwiZW5hYmxlTWljcm9waG9uZSIsImVuYWJsZWQiLCJlbmFibGVDYW1lcmEiLCJkaXNjb25uZWN0IiwiaGFuZGxlVXNlclB1Ymxpc2hlZCIsInVzZXIiLCJtZWRpYVR5cGUiLCJoYW5kbGVVc2VyVW5wdWJsaXNoZWQiLCJ0aGF0IiwiY3JlYXRlQ2xpZW50IiwibW9kZSIsImNvZGVjIiwic2V0Q2xpZW50Um9sZSIsIm9uIiwic3Vic2NyaWJlIiwicGxheSIsIl9tZWRpYVN0cmVhbVRyYWNrIiwicXVlcnlTZWxlY3RvciIsInNyY09iamVjdCIsImdldEVsZW1lbnRCeUlkIiwiY2FwdHVyZVN0cmVhbSIsImpvaW4iLCJjcmVhdGVNaWNyb3Bob25lQXVkaW9UcmFjayIsImNyZWF0ZUN1c3RvbVZpZGVvVHJhY2siLCJtZWRpYVN0cmVhbVRyYWNrIiwiY3JlYXRlQ2FtZXJhVmlkZW9UcmFjayIsImVuY29kZXJDb25maWciLCJjYW1zIiwiZ2V0Q2FtZXJhcyIsImkiLCJsYWJlbCIsImluZGV4T2YiLCJkZXZpY2VJZCIsInNldERldmljZSIsImltZ0VsZW1lbnQiLCJjcmVhdGVFbGVtZW50Iiwib25sb2FkIiwiaW5qZWN0Iiwic2V0T3B0aW9ucyIsImVuYWJsZSIsImJhY2tncm91bmQiLCJzcmMiLCJWaXJ0dWFsQmFja2dyb3VuZEV4dGVuc2lvbiIsInJlZ2lzdGVyRXh0ZW5zaW9ucyIsImNyZWF0ZVByb2Nlc3NvciIsImluaXQiLCJ0eXBlIiwiY29sb3IiLCJwdWJsaXNoIiwidmFsdWVzIiwibXlSb29tSWQiLCJqb2luVGltZSIsImdldFNlcnZlclRpbWUiLCJyZWdpc3RlciIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7UUFBQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTs7O1FBR0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDBDQUEwQyxnQ0FBZ0M7UUFDMUU7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSx3REFBd0Qsa0JBQWtCO1FBQzFFO1FBQ0EsaURBQWlELGNBQWM7UUFDL0Q7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBLHlDQUF5QyxpQ0FBaUM7UUFDMUUsZ0hBQWdILG1CQUFtQixFQUFFO1FBQ3JJO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMkJBQTJCLDBCQUEwQixFQUFFO1FBQ3ZELGlDQUFpQyxlQUFlO1FBQ2hEO1FBQ0E7UUFDQTs7UUFFQTtRQUNBLHNEQUFzRCwrREFBK0Q7O1FBRXJIO1FBQ0E7OztRQUdBO1FBQ0E7Ozs7Ozs7Ozs7OztBQ2xGQSxNQUFNQSxlQUFOLENBQXNCOztBQUVwQkMsY0FBWUMsT0FBWixFQUFxQjtBQUNuQkMsWUFBUUMsR0FBUixDQUFZLG1CQUFaLEVBQWlDRixPQUFqQzs7QUFFQSxTQUFLQSxPQUFMLEdBQWVBLFdBQVdHLE9BQU9ILE9BQWpDO0FBQ0EsU0FBS0ksR0FBTCxHQUFXLFNBQVg7QUFDQSxTQUFLQyxJQUFMLEdBQVksU0FBWjtBQUNBLFNBQUtDLE1BQUwsR0FBYyxDQUFkO0FBQ0EsU0FBS0MsS0FBTCxHQUFhLElBQWI7O0FBRUEsU0FBS0MsWUFBTCxHQUFvQixFQUFwQjtBQUNBLFNBQUtDLGFBQUwsR0FBcUIsRUFBckI7QUFDQSxTQUFLQyxvQkFBTCxHQUE0QixJQUFJQyxHQUFKLEVBQTVCOztBQUVBLFNBQUtDLFdBQUwsR0FBbUIsS0FBbkI7QUFDQSxTQUFLQyxtQkFBTCxHQUEyQixLQUEzQjtBQUNBLFNBQUtDLFdBQUwsR0FBbUIsS0FBbkI7QUFDQSxTQUFLQyxZQUFMLEdBQW9CLEtBQXBCOztBQUVBLFNBQUtDLFdBQUwsR0FBbUIsRUFBRUMsWUFBWSxJQUFkLEVBQW9CQyxZQUFZLElBQWhDLEVBQW5CO0FBQ0FmLFdBQU9hLFdBQVAsR0FBbUIsS0FBS0EsV0FBeEI7QUFDQSxTQUFLRyxLQUFMLEdBQWEsSUFBYjtBQUNBLFNBQUtDLFFBQUwsR0FBZ0IsSUFBaEI7QUFDQSxTQUFLQyxHQUFMLEdBQVcsSUFBWDtBQUNBLFNBQUtDLEdBQUwsR0FBVyxLQUFYO0FBQ0EsU0FBS0MsSUFBTCxHQUFZLEtBQVo7QUFDQSxTQUFLQyxTQUFMLEdBQWlCLEtBQWpCO0FBQ0EsU0FBS0MseUJBQUwsR0FBaUMsSUFBakM7QUFDSCxTQUFLQyxTQUFMLEdBQWlCLElBQWpCO0FBQ0EsU0FBS0MsU0FBTCxHQUFpQixJQUFqQjtBQUNBLFNBQUtDLGFBQUwsR0FBcUIsQ0FBQ0MsS0FBRCxFQUFRRixTQUFSLEtBQXNCO0FBQzFDRSxZQUFNQyxJQUFOLENBQVdILFNBQVgsRUFBc0JHLElBQXRCLENBQTJCRCxNQUFNRSxvQkFBakM7QUFDQSxLQUZEOztBQUtHLFNBQUtDLGtCQUFMLEdBQTBCLENBQTFCO0FBQ0EsU0FBS0MsV0FBTCxHQUFtQixFQUFuQjtBQUNBLFNBQUtDLGFBQUwsR0FBcUIsQ0FBckI7QUFDQSxTQUFLQyxXQUFMLEdBQW1CLElBQW5COztBQUVBLFNBQUtuQyxPQUFMLENBQWFvQyxtQkFBYixDQUFpQ2hCLFlBQVk7QUFDM0MsWUFBTWlCLG1CQUFtQixLQUFLckMsT0FBTCxDQUFhc0MseUJBQWIsQ0FBdUNsQixRQUF2QyxDQUF6QjtBQUNBLFdBQUtYLGFBQUwsQ0FBbUJXLFFBQW5CLElBQStCaUIsZ0JBQS9CO0FBQ0QsS0FIRDs7QUFLQSxTQUFLckMsT0FBTCxDQUFhdUMscUJBQWIsQ0FBbUNuQixZQUFZO0FBQzdDLGFBQU8sS0FBS1gsYUFBTCxDQUFtQlcsUUFBbkIsQ0FBUDtBQUNELEtBRkQ7QUFHRDs7QUFFRG9CLGVBQWFDLEdBQWIsRUFBa0I7QUFDaEJ4QyxZQUFRQyxHQUFSLENBQVksb0JBQVosRUFBa0N1QyxHQUFsQztBQUNBLFNBQUt6QyxPQUFMLENBQWEwQyxZQUFiLENBQTBCRCxHQUExQjtBQUNEOztBQUVERSxTQUFPQyxPQUFQLEVBQWdCO0FBQ2QzQyxZQUFRQyxHQUFSLENBQVksY0FBWixFQUE0QjBDLE9BQTVCO0FBQ0EsU0FBS3hDLEdBQUwsR0FBV3dDLE9BQVg7QUFDQSxTQUFLckMsS0FBTCxHQUFhcUMsT0FBYjtBQUNEOztBQUVELFFBQU1DLE9BQU4sQ0FBY0MsSUFBZCxFQUFvQjtBQUNsQkEsV0FBT0EsS0FBS0MsT0FBTCxDQUFhLElBQWIsRUFBbUIsR0FBbkIsQ0FBUDtBQUNBLFVBQU1DLE1BQU1DLEtBQUtDLEtBQUwsQ0FBV0osSUFBWCxDQUFaO0FBQ0EsU0FBS3pDLElBQUwsR0FBWTJDLElBQUlHLElBQWhCOztBQUVBLFFBQUlILElBQUkxQixHQUFSLEVBQWE7QUFDVixXQUFLQSxHQUFMLEdBQVcwQixJQUFJMUIsR0FBZjtBQUNGOztBQUVELFFBQUkwQixJQUFJekIsSUFBUixFQUFjO0FBQ1gsV0FBS0EsSUFBTCxHQUFZeUIsSUFBSXpCLElBQWhCO0FBQ0EsVUFBSSxLQUFLQSxJQUFULEVBQWU7QUFDWjZCLGlCQUFTQyxVQUFULENBQW9CQyxTQUFwQixFQUErQixFQUEvQjtBQUNGO0FBQ0g7O0FBR0QsUUFBSU4sSUFBSWpDLFlBQVIsRUFBc0I7QUFDcEIsV0FBS0EsWUFBTCxHQUFvQmlDLElBQUlqQyxZQUF4QjtBQUNEOztBQUVELFFBQUlpQyxJQUFJeEIsU0FBUixFQUFtQjtBQUNqQixXQUFLQSxTQUFMLEdBQWlCd0IsSUFBSXhCLFNBQXJCO0FBQ0Q7O0FBRUQsUUFBSXdCLElBQUluQyxtQkFBUixFQUE2QjtBQUMzQixXQUFLQSxtQkFBTCxHQUEyQm1DLElBQUluQyxtQkFBL0I7QUFDRDtBQUNELFNBQUtiLE9BQUwsQ0FBYXVELFFBQWIsQ0FBc0IsS0FBS2xELElBQTNCLEVBQWlDLElBQWpDO0FBQ0Q7O0FBRUQ7QUFDQW1ELG1CQUFpQkMsT0FBakIsRUFBMEI7QUFDeEJ4RCxZQUFRQyxHQUFSLENBQVksd0JBQVosRUFBc0N1RCxPQUF0QztBQUNBO0FBQ0EsU0FBS3pELE9BQUwsQ0FBYTBELGtCQUFiLENBQWdDRCxRQUFRRSxXQUF4Qzs7QUFFQTtBQUNBLFNBQUsvQyxXQUFMLEdBQW1CNkMsUUFBUUcsS0FBM0I7QUFDQSxTQUFLOUMsV0FBTCxHQUFtQjJDLFFBQVFJLEtBQTNCOztBQUVBO0FBQ0EsU0FBSzdELE9BQUwsQ0FBYVksV0FBYixDQUF5QixLQUF6QjtBQUNBLFNBQUtaLE9BQUwsQ0FBYWMsV0FBYixDQUF5QixLQUF6QjtBQUNBLFNBQUtkLE9BQUwsQ0FBYThELGtCQUFiLENBQWdDLEtBQWhDO0FBQ0EsU0FBSzlELE9BQUwsQ0FBYStELGtCQUFiLENBQWdDLEtBQWhDO0FBQ0Q7O0FBRURDLDRCQUEwQkMsZUFBMUIsRUFBMkNDLGVBQTNDLEVBQTREO0FBQzFEakUsWUFBUUMsR0FBUixDQUFZLGlDQUFaLEVBQStDK0QsZUFBL0MsRUFBZ0VDLGVBQWhFO0FBQ0EsU0FBS0MsY0FBTCxHQUFzQkYsZUFBdEI7QUFDQSxTQUFLRyxjQUFMLEdBQXNCRixlQUF0QjtBQUNEOztBQUVERywwQkFBd0JDLGdCQUF4QixFQUEwQztBQUN4Q3JFLFlBQVFDLEdBQVIsQ0FBWSwrQkFBWixFQUE2Q29FLGdCQUE3Qzs7QUFFQSxTQUFLdEUsT0FBTCxDQUFhcUUsdUJBQWIsQ0FBcUMsVUFBVUUsUUFBVixFQUFvQkMsU0FBcEIsRUFBK0JDLE9BQS9CLEVBQXdDO0FBQzNFSCx1QkFBaUJFLFNBQWpCO0FBQ0QsS0FGRDtBQUdEOztBQUVERSwwQkFBd0JDLFlBQXhCLEVBQXNDQyxjQUF0QyxFQUFzREMsZUFBdEQsRUFBdUU7QUFDckU1RSxZQUFRQyxHQUFSLENBQVksZ0NBQVosRUFBOEN5RSxZQUE5QyxFQUE0REMsY0FBNUQsRUFBNEVDLGVBQTVFO0FBQ0EsU0FBSzdFLE9BQUwsQ0FBYThFLDBCQUFiLENBQXdDSCxZQUF4QztBQUNBLFNBQUszRSxPQUFMLENBQWErRSwyQkFBYixDQUF5Q0gsY0FBekM7QUFDQSxTQUFLNUUsT0FBTCxDQUFhZ0YsZUFBYixDQUE2QkgsZUFBN0I7QUFDRDs7QUFFREkscUJBQW1CO0FBQ2pCaEYsWUFBUUMsR0FBUixDQUFZLHdCQUFaO0FBQ0EsVUFBTWdGLGlCQUFpQkMsS0FBS0MsR0FBTCxLQUFhLEtBQUtsRCxhQUF6Qzs7QUFFQSxXQUFPbUQsTUFBTUMsU0FBU0MsUUFBVCxDQUFrQkMsSUFBeEIsRUFBOEIsRUFBRUMsUUFBUSxNQUFWLEVBQWtCQyxPQUFPLFVBQXpCLEVBQTlCLEVBQXFFQyxJQUFyRSxDQUEwRUMsT0FBTztBQUN0RixVQUFJQyxZQUFZLElBQWhCO0FBQ0EsVUFBSUMscUJBQXFCLElBQUlYLElBQUosQ0FBU1MsSUFBSUcsT0FBSixDQUFZQyxHQUFaLENBQWdCLE1BQWhCLENBQVQsRUFBa0NDLE9BQWxDLEtBQThDSixZQUFZLENBQW5GO0FBQ0EsVUFBSUsscUJBQXFCZixLQUFLQyxHQUFMLEVBQXpCO0FBQ0EsVUFBSWUsYUFBYUwscUJBQXFCLENBQUNJLHFCQUFxQmhCLGNBQXRCLElBQXdDLENBQTlFO0FBQ0EsVUFBSWtCLGFBQWFELGFBQWFELGtCQUE5Qjs7QUFFQSxXQUFLbEUsa0JBQUw7O0FBRUEsVUFBSSxLQUFLQSxrQkFBTCxJQUEyQixFQUEvQixFQUFtQztBQUNqQyxhQUFLQyxXQUFMLENBQWlCb0UsSUFBakIsQ0FBc0JELFVBQXRCO0FBQ0QsT0FGRCxNQUVPO0FBQ0wsYUFBS25FLFdBQUwsQ0FBaUIsS0FBS0Qsa0JBQUwsR0FBMEIsRUFBM0MsSUFBaURvRSxVQUFqRDtBQUNEOztBQUVELFdBQUtsRSxhQUFMLEdBQXFCLEtBQUtELFdBQUwsQ0FBaUJxRSxNQUFqQixDQUF3QixDQUFDQyxHQUFELEVBQU1DLE1BQU4sS0FBaUJELE9BQU9DLE1BQWhELEVBQXdELENBQXhELElBQTZELEtBQUt2RSxXQUFMLENBQWlCd0UsTUFBbkc7O0FBRUEsVUFBSSxLQUFLekUsa0JBQUwsR0FBMEIsRUFBOUIsRUFBa0M7QUFDaEMwRSxtQkFBVyxNQUFNLEtBQUt6QixnQkFBTCxFQUFqQixFQUEwQyxJQUFJLEVBQUosR0FBUyxJQUFuRCxFQURnQyxDQUMwQjtBQUMzRCxPQUZELE1BRU87QUFDTCxhQUFLQSxnQkFBTDtBQUNEO0FBQ0YsS0F0Qk0sQ0FBUDtBQXVCRDs7QUFFRDBCLFlBQVU7QUFDUjFHLFlBQVFDLEdBQVIsQ0FBWSxlQUFaO0FBQ0EwRyxZQUFRQyxHQUFSLENBQVksQ0FBQyxLQUFLNUIsZ0JBQUwsRUFBRCxFQUEwQixJQUFJMkIsT0FBSixDQUFZLENBQUNFLE9BQUQsRUFBVUMsTUFBVixLQUFxQjtBQUNyRSxXQUFLQyxRQUFMLENBQWNGLE9BQWQsRUFBdUJDLE1BQXZCO0FBQ0QsS0FGcUMsQ0FBMUIsQ0FBWixFQUVLcEIsSUFGTCxDQUVVLENBQUMsQ0FBQ3NCLENBQUQsRUFBSTdGLFFBQUosQ0FBRCxLQUFtQjtBQUMzQm5CLGNBQVFDLEdBQVIsQ0FBWSxvQkFBb0JrQixRQUFoQztBQUNBLFdBQUtBLFFBQUwsR0FBZ0JBLFFBQWhCO0FBQ0EsV0FBSzhGLGVBQUwsR0FBdUIsS0FBS0MsZ0JBQUwsQ0FBc0IvRixRQUF0QixDQUF2QjtBQUNBLFdBQUtnRyxZQUFMO0FBQ0EsV0FBS2pELGNBQUwsQ0FBb0IvQyxRQUFwQjtBQUNELEtBUkQsRUFRR2lHLEtBUkgsQ0FRUyxLQUFLakQsY0FSZDtBQVNEOztBQUVEa0QsMEJBQXdCQyxNQUF4QixFQUFnQztBQUM5QixXQUFPLEtBQUtMLGVBQUwsSUFBd0JLLE9BQU9DLFlBQXRDO0FBQ0Q7O0FBRURDLHdCQUFzQnJHLFFBQXRCLEVBQWdDO0FBQzlCbkIsWUFBUUMsR0FBUixDQUFZLDZCQUFaLEVBQTJDa0IsUUFBM0M7QUFDQSxTQUFLcEIsT0FBTCxDQUFhMEgsSUFBYixDQUFrQnRHLFFBQWxCLEVBQTRCLFVBQVV1RyxNQUFWLEVBQWtCQyxLQUFsQixFQUF5QjtBQUNuRCxVQUFJQSxVQUFVLGFBQWQsRUFBNkI7QUFDM0JDLFlBQUkzSCxHQUFKLENBQVE0SCxLQUFSLENBQWMsc0NBQWQsRUFBc0RILE1BQXREO0FBQ0Q7QUFDRixLQUpELEVBSUcsVUFBVUksU0FBVixFQUFxQkMsU0FBckIsRUFBZ0M7QUFDakNILFVBQUkzSCxHQUFKLENBQVErSCxLQUFSLENBQWNGLFNBQWQsRUFBeUJDLFNBQXpCO0FBQ0QsS0FORCxFQU1HLFVBQVVFLFdBQVYsRUFBdUI7QUFDeEI7QUFDRCxLQVJEO0FBU0Q7O0FBRURDLHdCQUFzQi9HLFFBQXRCLEVBQWdDO0FBQzlCbkIsWUFBUUMsR0FBUixDQUFZLDZCQUFaLEVBQTJDa0IsUUFBM0M7QUFDQSxTQUFLcEIsT0FBTCxDQUFhb0ksTUFBYixDQUFvQmhILFFBQXBCO0FBQ0Q7O0FBRURpSCxXQUFTakgsUUFBVCxFQUFtQmtILFFBQW5CLEVBQTZCQyxJQUE3QixFQUFtQztBQUNqQ3RJLFlBQVFDLEdBQVIsQ0FBWSxnQkFBWixFQUE4QmtCLFFBQTlCLEVBQXdDa0gsUUFBeEMsRUFBa0RDLElBQWxEO0FBQ0E7QUFDQSxTQUFLdkksT0FBTCxDQUFhcUksUUFBYixDQUFzQmpILFFBQXRCLEVBQWdDa0gsUUFBaEMsRUFBMENDLElBQTFDO0FBQ0Q7O0FBRURDLHFCQUFtQnBILFFBQW5CLEVBQTZCa0gsUUFBN0IsRUFBdUNDLElBQXZDLEVBQTZDO0FBQzNDdEksWUFBUUMsR0FBUixDQUFZLDBCQUFaLEVBQXdDa0IsUUFBeEMsRUFBa0RrSCxRQUFsRCxFQUE0REMsSUFBNUQ7QUFDQSxTQUFLdkksT0FBTCxDQUFheUksVUFBYixDQUF3QnJILFFBQXhCLEVBQWtDa0gsUUFBbEMsRUFBNENDLElBQTVDO0FBQ0Q7O0FBRURHLGdCQUFjSixRQUFkLEVBQXdCQyxJQUF4QixFQUE4QjtBQUM1QnRJLFlBQVFDLEdBQVIsQ0FBWSxxQkFBWixFQUFtQ29JLFFBQW5DLEVBQTZDQyxJQUE3QztBQUNBLFFBQUlJLGdCQUFnQixLQUFLM0ksT0FBTCxDQUFhNEkscUJBQWIsQ0FBbUMsS0FBS3ZJLElBQXhDLENBQXBCOztBQUVBO0FBQ0E7QUFDQSxTQUFLLElBQUl3SSxZQUFULElBQXlCRixhQUF6QixFQUF3QztBQUN0QyxVQUFJQSxjQUFjRSxZQUFkLEtBQStCQSxpQkFBaUIsS0FBSzdJLE9BQUwsQ0FBYThJLFdBQWpFLEVBQThFO0FBQzVFO0FBQ0EsYUFBSzlJLE9BQUwsQ0FBYXFJLFFBQWIsQ0FBc0JRLFlBQXRCLEVBQW9DUCxRQUFwQyxFQUE4Q0MsSUFBOUM7QUFDRDtBQUNGO0FBQ0Y7O0FBRURRLDBCQUF3QlQsUUFBeEIsRUFBa0NDLElBQWxDLEVBQXdDO0FBQ3RDdEksWUFBUUMsR0FBUixDQUFZLCtCQUFaLEVBQTZDb0ksUUFBN0MsRUFBdURDLElBQXZEO0FBQ0EsUUFBSVMsY0FBYyxFQUFFQyxZQUFZLEtBQUs1SSxJQUFuQixFQUFsQjtBQUNBLFNBQUtMLE9BQUwsQ0FBYXlJLFVBQWIsQ0FBd0JPLFdBQXhCLEVBQXFDVixRQUFyQyxFQUErQ0MsSUFBL0M7QUFDRDs7QUFFRFcsbUJBQWlCOUgsUUFBakIsRUFBMkI7QUFDekJuQixZQUFRQyxHQUFSLENBQVksd0JBQVosRUFBc0NrQixRQUF0QztBQUNBLFFBQUkrSCxTQUFTLEtBQUtuSixPQUFMLENBQWFrSixnQkFBYixDQUE4QjlILFFBQTlCLENBQWI7O0FBRUEsUUFBSStILFVBQVUsS0FBS25KLE9BQUwsQ0FBYW9KLFlBQTNCLEVBQXlDO0FBQ3ZDLGFBQU92QixJQUFJd0IsUUFBSixDQUFhRCxZQUFwQjtBQUNELEtBRkQsTUFFTyxJQUFJRCxVQUFVLEtBQUtuSixPQUFMLENBQWFzSixhQUEzQixFQUEwQztBQUMvQyxhQUFPekIsSUFBSXdCLFFBQUosQ0FBYUMsYUFBcEI7QUFDRCxLQUZNLE1BRUE7QUFDTCxhQUFPekIsSUFBSXdCLFFBQUosQ0FBYUUsVUFBcEI7QUFDRDtBQUNGOztBQUVEQyxpQkFBZXBJLFFBQWYsRUFBeUJxSSxhQUFhLE9BQXRDLEVBQStDOztBQUU3Q3hKLFlBQVFDLEdBQVIsQ0FBWSxzQkFBWixFQUFvQ2tCLFFBQXBDLEVBQThDcUksVUFBOUM7QUFDRDtBQUNHO0FBQ0Y7O0FBRUEsUUFBSSxLQUFLakosWUFBTCxDQUFrQlksUUFBbEIsS0FBK0IsS0FBS1osWUFBTCxDQUFrQlksUUFBbEIsRUFBNEJxSSxVQUE1QixDQUFuQyxFQUE0RTtBQUMxRTVCLFVBQUkzSCxHQUFKLENBQVE0SCxLQUFSLENBQWUsZUFBYzJCLFVBQVcsUUFBT3JJLFFBQVMsRUFBeEQ7QUFDQSxhQUFPd0YsUUFBUUUsT0FBUixDQUFnQixLQUFLdEcsWUFBTCxDQUFrQlksUUFBbEIsRUFBNEJxSSxVQUE1QixDQUFoQixDQUFQO0FBQ0QsS0FIRCxNQUdPO0FBQ0w1QixVQUFJM0gsR0FBSixDQUFRNEgsS0FBUixDQUFlLGNBQWEyQixVQUFXLFFBQU9ySSxRQUFTLEVBQXZEOztBQUVBO0FBQ0EsVUFBSSxDQUFDLEtBQUtWLG9CQUFMLENBQTBCZ0osR0FBMUIsQ0FBOEJ0SSxRQUE5QixDQUFMLEVBQThDO0FBQzVDLGNBQU1WLHVCQUF1QixFQUE3Qjs7QUFFQSxjQUFNaUosZUFBZSxJQUFJL0MsT0FBSixDQUFZLENBQUNFLE9BQUQsRUFBVUMsTUFBVixLQUFxQjtBQUNwRHJHLCtCQUFxQm1ELEtBQXJCLEdBQTZCLEVBQUVpRCxPQUFGLEVBQVdDLE1BQVgsRUFBN0I7QUFDRCxTQUZvQixFQUVsQk0sS0FGa0IsQ0FFWnVDLEtBQUsvQixJQUFJM0gsR0FBSixDQUFRMkosSUFBUixDQUFjLEdBQUV6SSxRQUFTLDZCQUF6QixFQUF1RHdJLENBQXZELENBRk8sQ0FBckI7O0FBSUFsSiw2QkFBcUJtRCxLQUFyQixDQUEyQmlHLE9BQTNCLEdBQXFDSCxZQUFyQzs7QUFFQSxjQUFNSSxlQUFlLElBQUluRCxPQUFKLENBQVksQ0FBQ0UsT0FBRCxFQUFVQyxNQUFWLEtBQXFCO0FBQ3BEckcsK0JBQXFCa0QsS0FBckIsR0FBNkIsRUFBRWtELE9BQUYsRUFBV0MsTUFBWCxFQUE3QjtBQUNELFNBRm9CLEVBRWxCTSxLQUZrQixDQUVadUMsS0FBSy9CLElBQUkzSCxHQUFKLENBQVEySixJQUFSLENBQWMsR0FBRXpJLFFBQVMsNkJBQXpCLEVBQXVEd0ksQ0FBdkQsQ0FGTyxDQUFyQjtBQUdBbEosNkJBQXFCa0QsS0FBckIsQ0FBMkJrRyxPQUEzQixHQUFxQ0MsWUFBckM7O0FBRUEsYUFBS3JKLG9CQUFMLENBQTBCc0osR0FBMUIsQ0FBOEI1SSxRQUE5QixFQUF3Q1Ysb0JBQXhDO0FBQ0Q7O0FBRUQsWUFBTUEsdUJBQXVCLEtBQUtBLG9CQUFMLENBQTBCc0YsR0FBMUIsQ0FBOEI1RSxRQUE5QixDQUE3Qjs7QUFFQTtBQUNBLFVBQUksQ0FBQ1YscUJBQXFCK0ksVUFBckIsQ0FBTCxFQUF1QztBQUNyQyxjQUFNUSxnQkFBZ0IsSUFBSXJELE9BQUosQ0FBWSxDQUFDRSxPQUFELEVBQVVDLE1BQVYsS0FBcUI7QUFDckRyRywrQkFBcUIrSSxVQUFyQixJQUFtQyxFQUFFM0MsT0FBRixFQUFXQyxNQUFYLEVBQW5DO0FBQ0QsU0FGcUIsRUFFbkJNLEtBRm1CLENBRWJ1QyxLQUFLL0IsSUFBSTNILEdBQUosQ0FBUTJKLElBQVIsQ0FBYyxHQUFFekksUUFBUyxvQkFBbUJxSSxVQUFXLFNBQXZELEVBQWlFRyxDQUFqRSxDQUZRLENBQXRCO0FBR0FsSiw2QkFBcUIrSSxVQUFyQixFQUFpQ0ssT0FBakMsR0FBMkNHLGFBQTNDO0FBQ0Q7O0FBRUQsYUFBTyxLQUFLdkosb0JBQUwsQ0FBMEJzRixHQUExQixDQUE4QjVFLFFBQTlCLEVBQXdDcUksVUFBeEMsRUFBb0RLLE9BQTNEO0FBQ0Q7QUFDRjs7QUFFREksaUJBQWU5SSxRQUFmLEVBQXlCK0ksTUFBekIsRUFBaUNWLFVBQWpDLEVBQTZDO0FBQzNDeEosWUFBUUMsR0FBUixDQUFZLHNCQUFaLEVBQW9Da0IsUUFBcEMsRUFBOEMrSSxNQUE5QyxFQUFzRFYsVUFBdEQ7QUFDQSxVQUFNL0ksdUJBQXVCLEtBQUtBLG9CQUFMLENBQTBCc0YsR0FBMUIsQ0FBOEI1RSxRQUE5QixDQUE3QixDQUYyQyxDQUUyQjtBQUN0RSxVQUFNZ0oscUJBQXFCLEtBQUs1SixZQUFMLENBQWtCWSxRQUFsQixJQUE4QixLQUFLWixZQUFMLENBQWtCWSxRQUFsQixLQUErQixFQUF4Rjs7QUFFQSxRQUFJcUksZUFBZSxTQUFuQixFQUE4QjtBQUM1QjtBQUNBO0FBQ0E7QUFDQSxZQUFNWSxjQUFjRixPQUFPRyxjQUFQLEVBQXBCO0FBQ0EsVUFBSUQsWUFBWTVELE1BQVosR0FBcUIsQ0FBekIsRUFBNEI7QUFDMUIsY0FBTThELGNBQWMsSUFBSUMsV0FBSixFQUFwQjtBQUNBLFlBQUk7QUFDRkgsc0JBQVlJLE9BQVosQ0FBb0I1SSxTQUFTMEksWUFBWUcsUUFBWixDQUFxQjdJLEtBQXJCLENBQTdCO0FBQ0F1SSw2QkFBbUJ2RyxLQUFuQixHQUEyQjBHLFdBQTNCO0FBQ0QsU0FIRCxDQUdFLE9BQU9YLENBQVAsRUFBVTtBQUNWL0IsY0FBSTNILEdBQUosQ0FBUTJKLElBQVIsQ0FBYyxHQUFFekksUUFBUyxxQ0FBekIsRUFBK0R3SSxDQUEvRDtBQUNEOztBQUVEO0FBQ0EsWUFBSWxKLG9CQUFKLEVBQTBCQSxxQkFBcUJtRCxLQUFyQixDQUEyQmlELE9BQTNCLENBQW1DeUQsV0FBbkM7QUFDM0I7O0FBRUQ7QUFDQSxZQUFNSSxjQUFjUixPQUFPUyxjQUFQLEVBQXBCO0FBQ0EsVUFBSUQsWUFBWWxFLE1BQVosR0FBcUIsQ0FBekIsRUFBNEI7QUFDMUIsY0FBTW9FLGNBQWMsSUFBSUwsV0FBSixFQUFwQjtBQUNBLFlBQUk7QUFDRkcsc0JBQVlGLE9BQVosQ0FBb0I1SSxTQUFTZ0osWUFBWUgsUUFBWixDQUFxQjdJLEtBQXJCLENBQTdCO0FBQ0F1SSw2QkFBbUJ4RyxLQUFuQixHQUEyQmlILFdBQTNCO0FBQ0QsU0FIRCxDQUdFLE9BQU9qQixDQUFQLEVBQVU7QUFDVi9CLGNBQUkzSCxHQUFKLENBQVEySixJQUFSLENBQWMsR0FBRXpJLFFBQVMscUNBQXpCLEVBQStEd0ksQ0FBL0Q7QUFDRDs7QUFFRDtBQUNBLFlBQUlsSixvQkFBSixFQUEwQkEscUJBQXFCa0QsS0FBckIsQ0FBMkJrRCxPQUEzQixDQUFtQytELFdBQW5DO0FBQzNCO0FBQ0YsS0FoQ0QsTUFnQ087QUFDTFQseUJBQW1CWCxVQUFuQixJQUFpQ1UsTUFBakM7O0FBRUE7QUFDQSxVQUFJekosd0JBQXdCQSxxQkFBcUIrSSxVQUFyQixDQUE1QixFQUE4RDtBQUM1RC9JLDZCQUFxQitJLFVBQXJCLEVBQWlDM0MsT0FBakMsQ0FBeUNxRCxNQUF6QztBQUNEO0FBQ0Y7QUFDRjs7QUFFRFcsc0JBQW9CWCxNQUFwQixFQUE0QlYsVUFBNUIsRUFBd0M7QUFDdEN4SixZQUFRQyxHQUFSLENBQVksMkJBQVosRUFBeUNpSyxNQUF6QyxFQUFpRFYsVUFBakQ7QUFDQSxVQUFNekosVUFBVSxLQUFLQSxPQUFyQjtBQUNBeUosaUJBQWFBLGNBQWNVLE9BQU9ZLEVBQWxDO0FBQ0EsU0FBS2IsY0FBTCxDQUFvQixPQUFwQixFQUE2QkMsTUFBN0IsRUFBcUNWLFVBQXJDO0FBQ0F6SixZQUFRZ0wsZ0NBQVIsQ0FBeUNiLE1BQXpDLEVBQWlEVixVQUFqRDs7QUFFQTtBQUNBd0IsV0FBT0MsSUFBUCxDQUFZLEtBQUt6SyxhQUFqQixFQUFnQ2dLLE9BQWhDLENBQXdDckosWUFBWTtBQUNsRCxVQUFJcEIsUUFBUWtKLGdCQUFSLENBQXlCOUgsUUFBekIsTUFBdUNwQixRQUFRc0osYUFBbkQsRUFBa0U7QUFDaEV0SixnQkFBUW1MLGVBQVIsQ0FBd0IvSixRQUF4QixFQUFrQ3FJLFVBQWxDO0FBQ0Q7QUFDRixLQUpEO0FBS0Q7O0FBRUQyQix5QkFBdUIzQixVQUF2QixFQUFtQztBQUNqQ3hKLFlBQVFDLEdBQVIsQ0FBWSw4QkFBWixFQUE0Q3VKLFVBQTVDO0FBQ0EsU0FBS3pKLE9BQUwsQ0FBYXFMLHFCQUFiLENBQW1DNUIsVUFBbkM7QUFDQSxXQUFPLEtBQUtqSixZQUFMLENBQWtCLE9BQWxCLEVBQTJCaUosVUFBM0IsQ0FBUDtBQUNEOztBQUVENkIsbUJBQWlCQyxPQUFqQixFQUEwQjtBQUN4QnRMLFlBQVFDLEdBQVIsQ0FBWSx3QkFBWixFQUFzQ3FMLE9BQXRDO0FBQ0EsU0FBS3ZMLE9BQUwsQ0FBYXNMLGdCQUFiLENBQThCQyxPQUE5QjtBQUNEOztBQUVEQyxlQUFhRCxPQUFiLEVBQXNCO0FBQ3BCdEwsWUFBUUMsR0FBUixDQUFZLG9CQUFaLEVBQWtDcUwsT0FBbEM7QUFDQSxTQUFLdkwsT0FBTCxDQUFhd0wsWUFBYixDQUEwQkQsT0FBMUI7QUFDRDs7QUFFREUsZUFBYTtBQUNYeEwsWUFBUUMsR0FBUixDQUFZLGtCQUFaO0FBQ0EsU0FBS0YsT0FBTCxDQUFheUwsVUFBYjtBQUNEOztBQUVELFFBQU1DLG1CQUFOLENBQTBCQyxJQUExQixFQUFnQ0MsU0FBaEMsRUFBMkMsQ0FBRTs7QUFFN0NDLHdCQUFzQkYsSUFBdEIsRUFBNEJDLFNBQTVCLEVBQXVDO0FBQ3JDM0wsWUFBUUMsR0FBUixDQUFZLDZCQUFaO0FBQ0Q7O0FBRUQsUUFBTWtILFlBQU4sR0FBcUI7QUFDbkI7QUFDQSxRQUFJMEUsT0FBTyxJQUFYOztBQUVBLFNBQUszSixXQUFMLEdBQW1CaUIsU0FBUzJJLFlBQVQsQ0FBc0IsRUFBRUMsTUFBTSxNQUFSLEVBQWdCQyxPQUFPLEtBQXZCLEVBQXRCLENBQW5CO0FBQ0EsUUFBSSxLQUFLcEwsbUJBQUwsSUFBNEIsS0FBS0QsV0FBakMsSUFBZ0QsS0FBS0UsV0FBekQsRUFBc0U7QUFDcEU7QUFDQTtBQUNBLFdBQUtxQixXQUFMLENBQWlCK0osYUFBakIsQ0FBK0IsTUFBL0I7QUFDRCxLQUpELE1BSU87QUFDTDtBQUNBO0FBQ0Q7O0FBRUQsU0FBSy9KLFdBQUwsQ0FBaUJnSyxFQUFqQixDQUFvQixhQUFwQixFQUFtQyxNQUFPUixJQUFQLElBQWdCO0FBQ2xEMUwsY0FBUTRKLElBQVIsQ0FBYSxhQUFiLEVBQTJCOEIsSUFBM0I7QUFDQSxLQUZEO0FBR0EsU0FBS3hKLFdBQUwsQ0FBaUJnSyxFQUFqQixDQUFvQixnQkFBcEIsRUFBc0MsT0FBT1IsSUFBUCxFQUFhQyxTQUFiLEtBQTJCOztBQUUvRCxVQUFJeEssV0FBV3VLLEtBQUt0SyxHQUFwQjtBQUNBcEIsY0FBUUMsR0FBUixDQUFZLDhCQUE4QmtCLFFBQTlCLEdBQXlDLEdBQXpDLEdBQStDd0ssU0FBM0QsRUFBc0VFLEtBQUszSixXQUEzRTtBQUNBLFlBQU0ySixLQUFLM0osV0FBTCxDQUFpQmlLLFNBQWpCLENBQTJCVCxJQUEzQixFQUFpQ0MsU0FBakMsQ0FBTjtBQUNBM0wsY0FBUUMsR0FBUixDQUFZLCtCQUErQmtCLFFBQS9CLEdBQTBDLEdBQTFDLEdBQWdEMEssS0FBSzNKLFdBQWpFOztBQUVBLFlBQU16Qix1QkFBdUJvTCxLQUFLcEwsb0JBQUwsQ0FBMEJzRixHQUExQixDQUE4QjVFLFFBQTlCLENBQTdCO0FBQ0EsWUFBTWdKLHFCQUFxQjBCLEtBQUt0TCxZQUFMLENBQWtCWSxRQUFsQixJQUE4QjBLLEtBQUt0TCxZQUFMLENBQWtCWSxRQUFsQixLQUErQixFQUF4Rjs7QUFFQSxVQUFJd0ssY0FBYyxPQUFsQixFQUEyQjtBQUMxQkQsYUFBS3pLLFVBQUwsQ0FBZ0JtTCxJQUFoQjs7QUFFQyxjQUFNOUIsY0FBYyxJQUFJQyxXQUFKLEVBQXBCO0FBQ0F2SyxnQkFBUUMsR0FBUixDQUFZLGtCQUFaLEVBQWdDeUwsS0FBS3pLLFVBQUwsQ0FBZ0JvTCxpQkFBaEQ7QUFDQTtBQUNBbEMsMkJBQW1CdkcsS0FBbkIsR0FBMkIwRyxXQUEzQjtBQUNBLFlBQUk3SixvQkFBSixFQUEwQkEscUJBQXFCbUQsS0FBckIsQ0FBMkJpRCxPQUEzQixDQUFtQ3lELFdBQW5DO0FBQzNCOztBQUVELFVBQUlNLGNBQWMsSUFBbEI7QUFDQSxVQUFJZSxjQUFjLE9BQWxCLEVBQTJCO0FBQ3pCZixzQkFBYyxJQUFJTCxXQUFKLEVBQWQ7QUFDQXZLLGdCQUFRQyxHQUFSLENBQVksa0JBQVosRUFBZ0N5TCxLQUFLMUssVUFBTCxDQUFnQnFMLGlCQUFoRDtBQUNBekIsb0JBQVlILFFBQVosQ0FBcUJpQixLQUFLMUssVUFBTCxDQUFnQnFMLGlCQUFyQztBQUNBbEMsMkJBQW1CeEcsS0FBbkIsR0FBMkJpSCxXQUEzQjtBQUNBLFlBQUluSyxvQkFBSixFQUEwQkEscUJBQXFCa0QsS0FBckIsQ0FBMkJrRCxPQUEzQixDQUFtQytELFdBQW5DO0FBQzFCO0FBQ0Q7O0FBRUQsVUFBSXpKLFlBQVksS0FBaEIsRUFBdUI7QUFDMUIsWUFBSXdLLGNBQWMsT0FBbEIsRUFBMkI7QUFDNUI7QUFDQztBQUNBO0FBQ0E7QUFDQXRHLG1CQUFTaUgsYUFBVCxDQUF1QixXQUF2QixFQUFvQ0MsU0FBcEMsR0FBOEMzQixXQUE5QztBQUNBdkYsbUJBQVNpSCxhQUFULENBQXVCLFdBQXZCLEVBQW9DRixJQUFwQztBQUNDO0FBQ0QsWUFBSVQsY0FBYyxPQUFsQixFQUEyQjtBQUMxQkQsZUFBS3pLLFVBQUwsQ0FBZ0JtTCxJQUFoQjtBQUNBO0FBQ0c7QUFDRCxVQUFJakwsWUFBWSxLQUFoQixFQUF1QjtBQUMxQixZQUFJd0ssY0FBYyxPQUFsQixFQUEyQjtBQUMxQkQsZUFBSzFLLFVBQUwsQ0FBZ0JvTCxJQUFoQixDQUFxQixVQUFyQjtBQUNBO0FBQ0QsWUFBSVQsY0FBYyxPQUFsQixFQUEyQjtBQUMxQkQsZUFBS3pLLFVBQUwsQ0FBZ0JtTCxJQUFoQjtBQUNBO0FBQ0c7QUFDRixLQW5ERDs7QUFxREEsU0FBS2xLLFdBQUwsQ0FBaUJnSyxFQUFqQixDQUFvQixrQkFBcEIsRUFBd0NMLEtBQUtELHFCQUE3Qzs7QUFFQTVMLFlBQVFDLEdBQVIsQ0FBWSxnQkFBWjtBQUNBO0FBQ0E7OztBQUdILFFBQUksS0FBS2EsWUFBVCxFQUF1QjtBQUNoQixVQUFJb0osU0FBUzdFLFNBQVNtSCxjQUFULENBQXdCLFFBQXhCLEVBQWtDQyxhQUFsQyxDQUFnRCxFQUFoRCxDQUFiO0FBQ0EsT0FBQyxLQUFLcE0sTUFBTixFQUFjLEtBQUtVLFdBQUwsQ0FBaUJFLFVBQS9CLEVBQTJDLEtBQUtGLFdBQUwsQ0FBaUJDLFVBQTVELElBQTBFLE1BQU0yRixRQUFRQyxHQUFSLENBQVksQ0FDNUYsS0FBSzFFLFdBQUwsQ0FBaUJ3SyxJQUFqQixDQUFzQixLQUFLcE0sS0FBM0IsRUFBa0MsS0FBS0YsSUFBdkMsRUFBNkMsS0FBS2MsS0FBTCxJQUFjLElBQTNELEVBQWlFLEtBQUtDLFFBQUwsSUFBaUIsSUFBbEYsQ0FENEYsRUFFNUZnQyxTQUFTd0osMEJBQVQsRUFGNEYsRUFFckR4SixTQUFTeUosc0JBQVQsQ0FBZ0MsRUFBRUMsa0JBQWtCM0MsT0FBT1MsY0FBUCxHQUF3QixDQUF4QixDQUFwQixFQUFoQyxDQUZxRCxDQUFaLENBQWhGO0FBR04sS0FMRCxNQU1LLElBQUksS0FBSy9KLG1CQUFMLElBQTRCLEtBQUtDLFdBQXJDLEVBQWtEO0FBQ2xELFVBQUlxSixTQUFTN0UsU0FBU21ILGNBQVQsQ0FBd0IsZUFBeEIsRUFBeUNDLGFBQXpDLENBQXVELEVBQXZELENBQWI7QUFDQSxPQUFDLEtBQUtwTSxNQUFOLEVBQWMsS0FBS1UsV0FBTCxDQUFpQkUsVUFBL0IsRUFBMkMsS0FBS0YsV0FBTCxDQUFpQkMsVUFBNUQsSUFBMEUsTUFBTTJGLFFBQVFDLEdBQVIsQ0FBWSxDQUFDLEtBQUsxRSxXQUFMLENBQWlCd0ssSUFBakIsQ0FBc0IsS0FBS3BNLEtBQTNCLEVBQWtDLEtBQUtGLElBQXZDLEVBQTZDLEtBQUtjLEtBQUwsSUFBYyxJQUEzRCxFQUFpRSxLQUFLQyxRQUFMLElBQWlCLElBQWxGLENBQUQsRUFBMEZnQyxTQUFTd0osMEJBQVQsRUFBMUYsRUFBaUl4SixTQUFTeUosc0JBQVQsQ0FBZ0MsRUFBRUMsa0JBQWtCM0MsT0FBT1MsY0FBUCxHQUF3QixDQUF4QixDQUFwQixFQUFoQyxDQUFqSSxDQUFaLENBQWhGO0FBQ0osS0FISSxNQUlBLElBQUksS0FBS2hLLFdBQUwsSUFBb0IsS0FBS0UsV0FBN0IsRUFBMEM7QUFDMUMsT0FBQyxLQUFLUixNQUFOLEVBQWMsS0FBS1UsV0FBTCxDQUFpQkUsVUFBL0IsRUFBMkMsS0FBS0YsV0FBTCxDQUFpQkMsVUFBNUQsSUFBMEUsTUFBTTJGLFFBQVFDLEdBQVIsQ0FBWSxDQUM1RixLQUFLMUUsV0FBTCxDQUFpQndLLElBQWpCLENBQXNCLEtBQUtwTSxLQUEzQixFQUFrQyxLQUFLRixJQUF2QyxFQUE2QyxLQUFLYyxLQUFMLElBQWMsSUFBM0QsRUFBaUUsS0FBS0MsUUFBTCxJQUFpQixJQUFsRixDQUQ0RixFQUU1RmdDLFNBQVN3SiwwQkFBVCxFQUY0RixFQUVyRHhKLFNBQVMySixzQkFBVCxDQUFnQyxFQUFDQyxlQUFlLFFBQWhCLEVBQWhDLENBRnFELENBQVosQ0FBaEY7QUFHRCxLQUpDLE1BSUssSUFBSSxLQUFLcE0sV0FBVCxFQUFzQjtBQUMzQixPQUFDLEtBQUtOLE1BQU4sRUFBYyxLQUFLVSxXQUFMLENBQWlCQyxVQUEvQixJQUE2QyxNQUFNMkYsUUFBUUMsR0FBUixDQUFZO0FBQy9EO0FBQ0EsV0FBSzFFLFdBQUwsQ0FBaUJ3SyxJQUFqQixDQUFzQixLQUFLcE0sS0FBM0IsRUFBa0MsS0FBS0YsSUFBdkMsRUFBNkMsS0FBS2MsS0FBTCxJQUFjLElBQTNELEVBQWlFLEtBQUtDLFFBQUwsSUFBaUIsSUFBbEYsQ0FGK0QsRUFFMEJnQyxTQUFTMkosc0JBQVQsQ0FBZ0MsUUFBaEMsQ0FGMUIsQ0FBWixDQUFuRDtBQUdELEtBSk0sTUFJQSxJQUFJLEtBQUtqTSxXQUFULEVBQXNCO0FBQzNCLE9BQUMsS0FBS1IsTUFBTixFQUFjLEtBQUtVLFdBQUwsQ0FBaUJFLFVBQS9CLElBQTZDLE1BQU0wRixRQUFRQyxHQUFSLENBQVk7QUFDL0Q7QUFDQSxXQUFLMUUsV0FBTCxDQUFpQndLLElBQWpCLENBQXNCLEtBQUtwTSxLQUEzQixFQUFrQyxLQUFLRixJQUF2QyxFQUE2QyxLQUFLYyxLQUFMLElBQWMsSUFBM0QsRUFBaUUsS0FBS0MsUUFBTCxJQUFpQixJQUFsRixDQUYrRCxFQUUwQmdDLFNBQVN3SiwwQkFBVCxFQUYxQixDQUFaLENBQW5EO0FBR0QsS0FKTSxNQUlBO0FBQ0wsV0FBS3RNLE1BQUwsR0FBYyxNQUFNLEtBQUs2QixXQUFMLENBQWlCd0ssSUFBakIsQ0FBc0IsS0FBS3BNLEtBQTNCLEVBQWtDLEtBQUtGLElBQXZDLEVBQTZDLEtBQUtjLEtBQUwsSUFBYyxJQUEzRCxFQUFpRSxLQUFLQyxRQUFMLElBQWlCLElBQWxGLENBQXBCO0FBQ0Q7O0FBR0Q7QUFDQSxRQUFJLEtBQUtSLFdBQUwsSUFBb0IsQ0FBQyxLQUFLQyxtQkFBOUIsRUFBbUQ7QUFDbEQsVUFBSW9NLE9BQU8sTUFBTTdKLFNBQVM4SixVQUFULEVBQWpCO0FBQ0EsV0FBSyxJQUFJQyxJQUFJLENBQWIsRUFBZ0JBLElBQUlGLEtBQUt4RyxNQUF6QixFQUFpQzBHLEdBQWpDLEVBQXNDO0FBQ3BDLFlBQUlGLEtBQUtFLENBQUwsRUFBUUMsS0FBUixDQUFjQyxPQUFkLENBQXNCLFVBQXRCLEtBQXFDLENBQXpDLEVBQTRDO0FBQ2pEcE4sa0JBQVFDLEdBQVIsQ0FBWSx3QkFBWixFQUFxQytNLEtBQUtFLENBQUwsRUFBUUcsUUFBN0M7QUFDSSxnQkFBTSxLQUFLdE0sV0FBTCxDQUFpQkMsVUFBakIsQ0FBNEJzTSxTQUE1QixDQUFzQ04sS0FBS0UsQ0FBTCxFQUFRRyxRQUE5QyxDQUFOO0FBQ0U7QUFDRjtBQUNEOztBQUVELFFBQUksS0FBSzFNLFdBQUwsSUFBb0IsS0FBS1ksU0FBN0IsRUFBd0M7QUFDdEMsV0FBS1IsV0FBTCxDQUFpQkMsVUFBakIsQ0FBNEJvTCxJQUE1QixDQUFpQyxjQUFqQztBQUNEOztBQUVEO0FBQ0EsUUFBSSxLQUFLekwsV0FBTCxJQUFvQixLQUFLVyxJQUF6QixJQUFpQyxLQUFLUCxXQUFMLENBQWlCQyxVQUF0RCxFQUFrRTtBQUM5RCxZQUFNdU0sYUFBYWxJLFNBQVNtSSxhQUFULENBQXVCLEtBQXZCLENBQW5CO0FBQ0FELGlCQUFXRSxNQUFYLEdBQW9CLFlBQVk7QUFDOUIsWUFBSSxDQUFDLEtBQUtqTSx5QkFBVixFQUFxQztBQUNuQ3hCLGtCQUFRQyxHQUFSLENBQVksV0FBWixFQUF5QixLQUFLYyxXQUFMLENBQWlCQyxVQUExQztBQUNBLGVBQUtRLHlCQUFMLEdBQWlDLE1BQU02QixVQUFVcUssTUFBVixDQUFpQixLQUFLM00sV0FBTCxDQUFpQkMsVUFBbEMsRUFBOEMsZ0JBQTlDLEVBQWdFb0csS0FBaEUsQ0FBc0VwSCxRQUFRZ0ksS0FBOUUsQ0FBdkM7QUFDQWhJLGtCQUFRQyxHQUFSLENBQVksWUFBWjtBQUNEO0FBQ0QsYUFBS3VCLHlCQUFMLENBQStCbU0sVUFBL0IsQ0FBMEMsRUFBRUMsUUFBUSxJQUFWLEVBQWdCQyxZQUFZTixVQUE1QixFQUExQztBQUNELE9BUEQ7QUFRQUEsaUJBQVdPLEdBQVgsR0FBaUIsd0hBQWpCO0FBQ0g7O0FBRUQ7QUFDQSxRQUFJLEtBQUtuTixXQUFMLElBQW9CLEtBQUtVLEdBQXpCLElBQWdDLEtBQUtOLFdBQUwsQ0FBaUJDLFVBQXJELEVBQWlFOztBQUVwRSxXQUFLUyxTQUFMLEdBQWlCLElBQUlzTSwwQkFBSixFQUFqQjtBQUNBNUssZUFBUzZLLGtCQUFULENBQTRCLENBQUMsS0FBS3ZNLFNBQU4sQ0FBNUI7QUFDQSxXQUFLQyxTQUFMLEdBQWlCLEtBQUtELFNBQUwsQ0FBZXdNLGVBQWYsRUFBakI7QUFDQSxZQUFNLEtBQUt2TSxTQUFMLENBQWV3TSxJQUFmLENBQW9CLGVBQXBCLENBQU47QUFDQSxXQUFLbk4sV0FBTCxDQUFpQkMsVUFBakIsQ0FBNEJhLElBQTVCLENBQWlDLEtBQUtILFNBQXRDLEVBQWlERyxJQUFqRCxDQUFzRCxLQUFLZCxXQUFMLENBQWlCQyxVQUFqQixDQUE0QmMsb0JBQWxGO0FBQ0EsWUFBTSxLQUFLSixTQUFMLENBQWVpTSxVQUFmLENBQTBCLEVBQUVRLE1BQU0sT0FBUixFQUFpQkMsT0FBTSxTQUF2QixFQUExQixDQUFOO0FBQ0EsWUFBTSxLQUFLMU0sU0FBTCxDQUFla00sTUFBZixFQUFOO0FBQ0k7O0FBRUQ7QUFDQSxRQUFJLEtBQUtqTixXQUFMLElBQW9CLEtBQUtFLFdBQXpCLElBQXdDLEtBQUtDLFlBQWpELEVBQStEO0FBQzdELFlBQU0sS0FBS29CLFdBQUwsQ0FBaUJtTSxPQUFqQixDQUF5QnJELE9BQU9zRCxNQUFQLENBQWMsS0FBS3ZOLFdBQW5CLENBQXpCLENBQU47QUFDQWYsY0FBUUMsR0FBUixDQUFZLGlCQUFaO0FBQ0Q7QUFFRjs7QUFFRDs7OztBQUlBLFFBQU04RyxRQUFOLENBQWU3QyxjQUFmLEVBQStCQyxjQUEvQixFQUErQztBQUM3QyxRQUFJMEgsT0FBTyxJQUFYOztBQUVBLFVBQU1BLEtBQUs5TCxPQUFMLENBQWEyRyxPQUFiLENBQXFCbUYsS0FBSzFMLEdBQTFCLEVBQStCK0QsY0FBL0IsRUFBK0NDLGNBQS9DLENBQU47O0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFzQkQ7O0FBRUQrQyxtQkFBaUIvRixRQUFqQixFQUEyQjtBQUN6QixRQUFJb04sV0FBVyxLQUFLbk8sSUFBcEIsQ0FEeUIsQ0FDQztBQUMxQixRQUFJb08sV0FBVyxLQUFLek8sT0FBTCxDQUFhNEkscUJBQWIsQ0FBbUM0RixRQUFuQyxFQUE2Q3BOLFFBQTdDLEVBQXVEb0csWUFBdEU7QUFDQSxXQUFPaUgsUUFBUDtBQUNEOztBQUVEQyxrQkFBZ0I7QUFDZCxXQUFPdkosS0FBS0MsR0FBTCxLQUFhLEtBQUtsRCxhQUF6QjtBQUNEO0FBdmpCbUI7O0FBMGpCdEIyRixJQUFJd0IsUUFBSixDQUFhc0YsUUFBYixDQUFzQixVQUF0QixFQUFrQzdPLGVBQWxDOztBQUVBOE8sT0FBT0MsT0FBUCxHQUFpQi9PLGVBQWpCLEMiLCJmaWxlIjoibmFmLWFnb3JhLWFkYXB0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9pbmRleC5qc1wiKTtcbiIsImNsYXNzIEFnb3JhUnRjQWRhcHRlciB7XG5cbiAgY29uc3RydWN0b3IoZWFzeXJ0Yykge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBjb25zdHJ1Y3RvciBcIiwgZWFzeXJ0Yyk7XG5cbiAgICB0aGlzLmVhc3lydGMgPSBlYXN5cnRjIHx8IHdpbmRvdy5lYXN5cnRjO1xuICAgIHRoaXMuYXBwID0gXCJkZWZhdWx0XCI7XG4gICAgdGhpcy5yb29tID0gXCJkZWZhdWx0XCI7XG4gICAgdGhpcy51c2VyaWQgPSAwO1xuICAgIHRoaXMuYXBwaWQgPSBudWxsO1xuXG4gICAgdGhpcy5tZWRpYVN0cmVhbXMgPSB7fTtcbiAgICB0aGlzLnJlbW90ZUNsaWVudHMgPSB7fTtcbiAgICB0aGlzLnBlbmRpbmdNZWRpYVJlcXVlc3RzID0gbmV3IE1hcCgpO1xuXG4gICAgdGhpcy5lbmFibGVWaWRlbyA9IGZhbHNlO1xuICAgIHRoaXMuZW5hYmxlVmlkZW9GaWx0ZXJlZCA9IGZhbHNlO1xuICAgIHRoaXMuZW5hYmxlQXVkaW8gPSBmYWxzZTtcbiAgICB0aGlzLmVuYWJsZUF2YXRhciA9IGZhbHNlO1xuXG4gICAgdGhpcy5sb2NhbFRyYWNrcyA9IHsgdmlkZW9UcmFjazogbnVsbCwgYXVkaW9UcmFjazogbnVsbCB9O1xuICAgIHdpbmRvdy5sb2NhbFRyYWNrcz10aGlzLmxvY2FsVHJhY2tzO1xuICAgIHRoaXMudG9rZW4gPSBudWxsO1xuICAgIHRoaXMuY2xpZW50SWQgPSBudWxsO1xuICAgIHRoaXMudWlkID0gbnVsbDtcbiAgICB0aGlzLnZiZyA9IGZhbHNlO1xuICAgIHRoaXMudmJnMCA9IGZhbHNlO1xuICAgIHRoaXMuc2hvd0xvY2FsID0gZmFsc2U7XG4gICAgdGhpcy52aXJ0dWFsQmFja2dyb3VuZEluc3RhbmNlID0gbnVsbDtcbiB0aGlzLmV4dGVuc2lvbiA9IG51bGw7XG4gdGhpcy5wcm9jZXNzb3IgPSBudWxsO1xuIHRoaXMucGlwZVByb2Nlc3NvciA9ICh0cmFjaywgcHJvY2Vzc29yKSA9PiB7XG4gIHRyYWNrLnBpcGUocHJvY2Vzc29yKS5waXBlKHRyYWNrLnByb2Nlc3NvckRlc3RpbmF0aW9uKTtcbiB9XG5cblxuICAgIHRoaXMuc2VydmVyVGltZVJlcXVlc3RzID0gMDtcbiAgICB0aGlzLnRpbWVPZmZzZXRzID0gW107XG4gICAgdGhpcy5hdmdUaW1lT2Zmc2V0ID0gMDtcbiAgICB0aGlzLmFnb3JhQ2xpZW50ID0gbnVsbDtcblxuICAgIHRoaXMuZWFzeXJ0Yy5zZXRQZWVyT3Blbkxpc3RlbmVyKGNsaWVudElkID0+IHtcbiAgICAgIGNvbnN0IGNsaWVudENvbm5lY3Rpb24gPSB0aGlzLmVhc3lydGMuZ2V0UGVlckNvbm5lY3Rpb25CeVVzZXJJZChjbGllbnRJZCk7XG4gICAgICB0aGlzLnJlbW90ZUNsaWVudHNbY2xpZW50SWRdID0gY2xpZW50Q29ubmVjdGlvbjtcbiAgICB9KTtcblxuICAgIHRoaXMuZWFzeXJ0Yy5zZXRQZWVyQ2xvc2VkTGlzdGVuZXIoY2xpZW50SWQgPT4ge1xuICAgICAgZGVsZXRlIHRoaXMucmVtb3RlQ2xpZW50c1tjbGllbnRJZF07XG4gICAgfSk7XG4gIH1cblxuICBzZXRTZXJ2ZXJVcmwodXJsKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNldFNlcnZlclVybCBcIiwgdXJsKTtcbiAgICB0aGlzLmVhc3lydGMuc2V0U29ja2V0VXJsKHVybCk7XG4gIH1cblxuICBzZXRBcHAoYXBwTmFtZSkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXRBcHAgXCIsIGFwcE5hbWUpO1xuICAgIHRoaXMuYXBwID0gYXBwTmFtZTtcbiAgICB0aGlzLmFwcGlkID0gYXBwTmFtZTtcbiAgfVxuXG4gIGFzeW5jIHNldFJvb20oanNvbikge1xuICAgIGpzb24gPSBqc29uLnJlcGxhY2UoLycvZywgJ1wiJyk7XG4gICAgY29uc3Qgb2JqID0gSlNPTi5wYXJzZShqc29uKTtcbiAgICB0aGlzLnJvb20gPSBvYmoubmFtZTtcblxuICAgIGlmIChvYmoudmJnKSB7XG4gICAgICAgdGhpcy52YmcgPSBvYmoudmJnO1xuICAgIH1cblxuICAgIGlmIChvYmoudmJnMCkge1xuICAgICAgIHRoaXMudmJnMCA9IG9iai52YmcwO1xuICAgICAgIGlmICh0aGlzLnZiZzApIHtcbiAgICAgICAgICBBZ29yYVJUQy5sb2FkTW9kdWxlKFNlZ1BsdWdpbiwge30pO1xuICAgICAgIH1cbiAgICB9XG5cblxuICAgIGlmIChvYmouZW5hYmxlQXZhdGFyKSB7XG4gICAgICB0aGlzLmVuYWJsZUF2YXRhciA9IG9iai5lbmFibGVBdmF0YXI7XG4gICAgfVxuXG4gICAgaWYgKG9iai5zaG93TG9jYWwpIHtcbiAgICAgIHRoaXMuc2hvd0xvY2FsID0gb2JqLnNob3dMb2NhbDtcbiAgICB9XG5cbiAgICBpZiAob2JqLmVuYWJsZVZpZGVvRmlsdGVyZWQpIHtcbiAgICAgIHRoaXMuZW5hYmxlVmlkZW9GaWx0ZXJlZCA9IG9iai5lbmFibGVWaWRlb0ZpbHRlcmVkO1xuICAgIH1cbiAgICB0aGlzLmVhc3lydGMuam9pblJvb20odGhpcy5yb29tLCBudWxsKTtcbiAgfVxuXG4gIC8vIG9wdGlvbnM6IHsgZGF0YWNoYW5uZWw6IGJvb2wsIGF1ZGlvOiBib29sLCB2aWRlbzogYm9vbCB9XG4gIHNldFdlYlJ0Y09wdGlvbnMob3B0aW9ucykge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXRXZWJSdGNPcHRpb25zIFwiLCBvcHRpb25zKTtcbiAgICAvLyB0aGlzLmVhc3lydGMuZW5hYmxlRGVidWcodHJ1ZSk7XG4gICAgdGhpcy5lYXN5cnRjLmVuYWJsZURhdGFDaGFubmVscyhvcHRpb25zLmRhdGFjaGFubmVsKTtcblxuICAgIC8vIHVzaW5nIEFnb3JhXG4gICAgdGhpcy5lbmFibGVWaWRlbyA9IG9wdGlvbnMudmlkZW87XG4gICAgdGhpcy5lbmFibGVBdWRpbyA9IG9wdGlvbnMuYXVkaW87XG5cbiAgICAvLyBub3QgZWFzeXJ0Y1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVWaWRlbyhmYWxzZSk7XG4gICAgdGhpcy5lYXN5cnRjLmVuYWJsZUF1ZGlvKGZhbHNlKTtcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlVmlkZW9SZWNlaXZlKGZhbHNlKTtcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlQXVkaW9SZWNlaXZlKGZhbHNlKTtcbiAgfVxuXG4gIHNldFNlcnZlckNvbm5lY3RMaXN0ZW5lcnMoc3VjY2Vzc0xpc3RlbmVyLCBmYWlsdXJlTGlzdGVuZXIpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0U2VydmVyQ29ubmVjdExpc3RlbmVycyBcIiwgc3VjY2Vzc0xpc3RlbmVyLCBmYWlsdXJlTGlzdGVuZXIpO1xuICAgIHRoaXMuY29ubmVjdFN1Y2Nlc3MgPSBzdWNjZXNzTGlzdGVuZXI7XG4gICAgdGhpcy5jb25uZWN0RmFpbHVyZSA9IGZhaWx1cmVMaXN0ZW5lcjtcbiAgfVxuXG4gIHNldFJvb21PY2N1cGFudExpc3RlbmVyKG9jY3VwYW50TGlzdGVuZXIpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0Um9vbU9jY3VwYW50TGlzdGVuZXIgXCIsIG9jY3VwYW50TGlzdGVuZXIpO1xuXG4gICAgdGhpcy5lYXN5cnRjLnNldFJvb21PY2N1cGFudExpc3RlbmVyKGZ1bmN0aW9uIChyb29tTmFtZSwgb2NjdXBhbnRzLCBwcmltYXJ5KSB7XG4gICAgICBvY2N1cGFudExpc3RlbmVyKG9jY3VwYW50cyk7XG4gICAgfSk7XG4gIH1cblxuICBzZXREYXRhQ2hhbm5lbExpc3RlbmVycyhvcGVuTGlzdGVuZXIsIGNsb3NlZExpc3RlbmVyLCBtZXNzYWdlTGlzdGVuZXIpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0RGF0YUNoYW5uZWxMaXN0ZW5lcnMgIFwiLCBvcGVuTGlzdGVuZXIsIGNsb3NlZExpc3RlbmVyLCBtZXNzYWdlTGlzdGVuZXIpO1xuICAgIHRoaXMuZWFzeXJ0Yy5zZXREYXRhQ2hhbm5lbE9wZW5MaXN0ZW5lcihvcGVuTGlzdGVuZXIpO1xuICAgIHRoaXMuZWFzeXJ0Yy5zZXREYXRhQ2hhbm5lbENsb3NlTGlzdGVuZXIoY2xvc2VkTGlzdGVuZXIpO1xuICAgIHRoaXMuZWFzeXJ0Yy5zZXRQZWVyTGlzdGVuZXIobWVzc2FnZUxpc3RlbmVyKTtcbiAgfVxuXG4gIHVwZGF0ZVRpbWVPZmZzZXQoKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHVwZGF0ZVRpbWVPZmZzZXQgXCIpO1xuICAgIGNvbnN0IGNsaWVudFNlbnRUaW1lID0gRGF0ZS5ub3coKSArIHRoaXMuYXZnVGltZU9mZnNldDtcblxuICAgIHJldHVybiBmZXRjaChkb2N1bWVudC5sb2NhdGlvbi5ocmVmLCB7IG1ldGhvZDogXCJIRUFEXCIsIGNhY2hlOiBcIm5vLWNhY2hlXCIgfSkudGhlbihyZXMgPT4ge1xuICAgICAgdmFyIHByZWNpc2lvbiA9IDEwMDA7XG4gICAgICB2YXIgc2VydmVyUmVjZWl2ZWRUaW1lID0gbmV3IERhdGUocmVzLmhlYWRlcnMuZ2V0KFwiRGF0ZVwiKSkuZ2V0VGltZSgpICsgcHJlY2lzaW9uIC8gMjtcbiAgICAgIHZhciBjbGllbnRSZWNlaXZlZFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgdmFyIHNlcnZlclRpbWUgPSBzZXJ2ZXJSZWNlaXZlZFRpbWUgKyAoY2xpZW50UmVjZWl2ZWRUaW1lIC0gY2xpZW50U2VudFRpbWUpIC8gMjtcbiAgICAgIHZhciB0aW1lT2Zmc2V0ID0gc2VydmVyVGltZSAtIGNsaWVudFJlY2VpdmVkVGltZTtcblxuICAgICAgdGhpcy5zZXJ2ZXJUaW1lUmVxdWVzdHMrKztcblxuICAgICAgaWYgKHRoaXMuc2VydmVyVGltZVJlcXVlc3RzIDw9IDEwKSB7XG4gICAgICAgIHRoaXMudGltZU9mZnNldHMucHVzaCh0aW1lT2Zmc2V0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudGltZU9mZnNldHNbdGhpcy5zZXJ2ZXJUaW1lUmVxdWVzdHMgJSAxMF0gPSB0aW1lT2Zmc2V0O1xuICAgICAgfVxuXG4gICAgICB0aGlzLmF2Z1RpbWVPZmZzZXQgPSB0aGlzLnRpbWVPZmZzZXRzLnJlZHVjZSgoYWNjLCBvZmZzZXQpID0+IGFjYyArPSBvZmZzZXQsIDApIC8gdGhpcy50aW1lT2Zmc2V0cy5sZW5ndGg7XG5cbiAgICAgIGlmICh0aGlzLnNlcnZlclRpbWVSZXF1ZXN0cyA+IDEwKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy51cGRhdGVUaW1lT2Zmc2V0KCksIDUgKiA2MCAqIDEwMDApOyAvLyBTeW5jIGNsb2NrIGV2ZXJ5IDUgbWludXRlcy5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudXBkYXRlVGltZU9mZnNldCgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgY29ubmVjdCgpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgY29ubmVjdCBcIik7XG4gICAgUHJvbWlzZS5hbGwoW3RoaXMudXBkYXRlVGltZU9mZnNldCgpLCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLl9jb25uZWN0KHJlc29sdmUsIHJlamVjdCk7XG4gICAgfSldKS50aGVuKChbXywgY2xpZW50SWRdKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIkJXNzMgY29ubmVjdGVkIFwiICsgY2xpZW50SWQpO1xuICAgICAgdGhpcy5jbGllbnRJZCA9IGNsaWVudElkO1xuICAgICAgdGhpcy5fbXlSb29tSm9pblRpbWUgPSB0aGlzLl9nZXRSb29tSm9pblRpbWUoY2xpZW50SWQpO1xuICAgICAgdGhpcy5jb25uZWN0QWdvcmEoKTtcbiAgICAgIHRoaXMuY29ubmVjdFN1Y2Nlc3MoY2xpZW50SWQpO1xuICAgIH0pLmNhdGNoKHRoaXMuY29ubmVjdEZhaWx1cmUpO1xuICB9XG5cbiAgc2hvdWxkU3RhcnRDb25uZWN0aW9uVG8oY2xpZW50KSB7XG4gICAgcmV0dXJuIHRoaXMuX215Um9vbUpvaW5UaW1lIDw9IGNsaWVudC5yb29tSm9pblRpbWU7XG4gIH1cblxuICBzdGFydFN0cmVhbUNvbm5lY3Rpb24oY2xpZW50SWQpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc3RhcnRTdHJlYW1Db25uZWN0aW9uIFwiLCBjbGllbnRJZCk7XG4gICAgdGhpcy5lYXN5cnRjLmNhbGwoY2xpZW50SWQsIGZ1bmN0aW9uIChjYWxsZXIsIG1lZGlhKSB7XG4gICAgICBpZiAobWVkaWEgPT09IFwiZGF0YWNoYW5uZWxcIikge1xuICAgICAgICBOQUYubG9nLndyaXRlKFwiU3VjY2Vzc2Z1bGx5IHN0YXJ0ZWQgZGF0YWNoYW5uZWwgdG8gXCIsIGNhbGxlcik7XG4gICAgICB9XG4gICAgfSwgZnVuY3Rpb24gKGVycm9yQ29kZSwgZXJyb3JUZXh0KSB7XG4gICAgICBOQUYubG9nLmVycm9yKGVycm9yQ29kZSwgZXJyb3JUZXh0KTtcbiAgICB9LCBmdW5jdGlvbiAod2FzQWNjZXB0ZWQpIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwid2FzIGFjY2VwdGVkPVwiICsgd2FzQWNjZXB0ZWQpO1xuICAgIH0pO1xuICB9XG5cbiAgY2xvc2VTdHJlYW1Db25uZWN0aW9uKGNsaWVudElkKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGNsb3NlU3RyZWFtQ29ubmVjdGlvbiBcIiwgY2xpZW50SWQpO1xuICAgIHRoaXMuZWFzeXJ0Yy5oYW5ndXAoY2xpZW50SWQpO1xuICB9XG5cbiAgc2VuZERhdGEoY2xpZW50SWQsIGRhdGFUeXBlLCBkYXRhKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNlbmREYXRhIFwiLCBjbGllbnRJZCwgZGF0YVR5cGUsIGRhdGEpO1xuICAgIC8vIHNlbmQgdmlhIHdlYnJ0YyBvdGhlcndpc2UgZmFsbGJhY2sgdG8gd2Vic29ja2V0c1xuICAgIHRoaXMuZWFzeXJ0Yy5zZW5kRGF0YShjbGllbnRJZCwgZGF0YVR5cGUsIGRhdGEpO1xuICB9XG5cbiAgc2VuZERhdGFHdWFyYW50ZWVkKGNsaWVudElkLCBkYXRhVHlwZSwgZGF0YSkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZW5kRGF0YUd1YXJhbnRlZWQgXCIsIGNsaWVudElkLCBkYXRhVHlwZSwgZGF0YSk7XG4gICAgdGhpcy5lYXN5cnRjLnNlbmREYXRhV1MoY2xpZW50SWQsIGRhdGFUeXBlLCBkYXRhKTtcbiAgfVxuXG4gIGJyb2FkY2FzdERhdGEoZGF0YVR5cGUsIGRhdGEpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgYnJvYWRjYXN0RGF0YSBcIiwgZGF0YVR5cGUsIGRhdGEpO1xuICAgIHZhciByb29tT2NjdXBhbnRzID0gdGhpcy5lYXN5cnRjLmdldFJvb21PY2N1cGFudHNBc01hcCh0aGlzLnJvb20pO1xuXG4gICAgLy8gSXRlcmF0ZSBvdmVyIHRoZSBrZXlzIG9mIHRoZSBlYXN5cnRjIHJvb20gb2NjdXBhbnRzIG1hcC5cbiAgICAvLyBnZXRSb29tT2NjdXBhbnRzQXNBcnJheSB1c2VzIE9iamVjdC5rZXlzIHdoaWNoIGFsbG9jYXRlcyBtZW1vcnkuXG4gICAgZm9yICh2YXIgcm9vbU9jY3VwYW50IGluIHJvb21PY2N1cGFudHMpIHtcbiAgICAgIGlmIChyb29tT2NjdXBhbnRzW3Jvb21PY2N1cGFudF0gJiYgcm9vbU9jY3VwYW50ICE9PSB0aGlzLmVhc3lydGMubXlFYXN5cnRjaWQpIHtcbiAgICAgICAgLy8gc2VuZCB2aWEgd2VicnRjIG90aGVyd2lzZSBmYWxsYmFjayB0byB3ZWJzb2NrZXRzXG4gICAgICAgIHRoaXMuZWFzeXJ0Yy5zZW5kRGF0YShyb29tT2NjdXBhbnQsIGRhdGFUeXBlLCBkYXRhKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBicm9hZGNhc3REYXRhR3VhcmFudGVlZChkYXRhVHlwZSwgZGF0YSkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBicm9hZGNhc3REYXRhR3VhcmFudGVlZCBcIiwgZGF0YVR5cGUsIGRhdGEpO1xuICAgIHZhciBkZXN0aW5hdGlvbiA9IHsgdGFyZ2V0Um9vbTogdGhpcy5yb29tIH07XG4gICAgdGhpcy5lYXN5cnRjLnNlbmREYXRhV1MoZGVzdGluYXRpb24sIGRhdGFUeXBlLCBkYXRhKTtcbiAgfVxuXG4gIGdldENvbm5lY3RTdGF0dXMoY2xpZW50SWQpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgZ2V0Q29ubmVjdFN0YXR1cyBcIiwgY2xpZW50SWQpO1xuICAgIHZhciBzdGF0dXMgPSB0aGlzLmVhc3lydGMuZ2V0Q29ubmVjdFN0YXR1cyhjbGllbnRJZCk7XG5cbiAgICBpZiAoc3RhdHVzID09IHRoaXMuZWFzeXJ0Yy5JU19DT05ORUNURUQpIHtcbiAgICAgIHJldHVybiBOQUYuYWRhcHRlcnMuSVNfQ09OTkVDVEVEO1xuICAgIH0gZWxzZSBpZiAoc3RhdHVzID09IHRoaXMuZWFzeXJ0Yy5OT1RfQ09OTkVDVEVEKSB7XG4gICAgICByZXR1cm4gTkFGLmFkYXB0ZXJzLk5PVF9DT05ORUNURUQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBOQUYuYWRhcHRlcnMuQ09OTkVDVElORztcbiAgICB9XG4gIH1cblxuICBnZXRNZWRpYVN0cmVhbShjbGllbnRJZCwgc3RyZWFtTmFtZSA9IFwiYXVkaW9cIikge1xuXG4gICAgY29uc29sZS5sb2coXCJCVzczIGdldE1lZGlhU3RyZWFtIFwiLCBjbGllbnRJZCwgc3RyZWFtTmFtZSk7XG4gICAvLyBpZiAoIHN0cmVhbU5hbWUgPSBcImF1ZGlvXCIpIHtcblx0ICAgICAvL3N0cmVhbU5hbWUgPSBcImJvZF9hdWRpb1wiO1xuICAgIC8vfVxuXG4gICAgaWYgKHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXSAmJiB0aGlzLm1lZGlhU3RyZWFtc1tjbGllbnRJZF1bc3RyZWFtTmFtZV0pIHtcbiAgICAgIE5BRi5sb2cud3JpdGUoYEFscmVhZHkgaGFkICR7c3RyZWFtTmFtZX0gZm9yICR7Y2xpZW50SWR9YCk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXVtzdHJlYW1OYW1lXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIE5BRi5sb2cud3JpdGUoYFdhaXRpbmcgb24gJHtzdHJlYW1OYW1lfSBmb3IgJHtjbGllbnRJZH1gKTtcblxuICAgICAgLy8gQ3JlYXRlIGluaXRpYWwgcGVuZGluZ01lZGlhUmVxdWVzdHMgd2l0aCBhdWRpb3x2aWRlbyBhbGlhc1xuICAgICAgaWYgKCF0aGlzLnBlbmRpbmdNZWRpYVJlcXVlc3RzLmhhcyhjbGllbnRJZCkpIHtcbiAgICAgICAgY29uc3QgcGVuZGluZ01lZGlhUmVxdWVzdHMgPSB7fTtcblxuICAgICAgICBjb25zdCBhdWRpb1Byb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHMuYXVkaW8gPSB7IHJlc29sdmUsIHJlamVjdCB9O1xuICAgICAgICB9KS5jYXRjaChlID0+IE5BRi5sb2cud2FybihgJHtjbGllbnRJZH0gZ2V0TWVkaWFTdHJlYW0gQXVkaW8gRXJyb3JgLCBlKSk7XG5cbiAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHMuYXVkaW8ucHJvbWlzZSA9IGF1ZGlvUHJvbWlzZTtcblxuICAgICAgICBjb25zdCB2aWRlb1Byb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHMudmlkZW8gPSB7IHJlc29sdmUsIHJlamVjdCB9O1xuICAgICAgICB9KS5jYXRjaChlID0+IE5BRi5sb2cud2FybihgJHtjbGllbnRJZH0gZ2V0TWVkaWFTdHJlYW0gVmlkZW8gRXJyb3JgLCBlKSk7XG4gICAgICAgIHBlbmRpbmdNZWRpYVJlcXVlc3RzLnZpZGVvLnByb21pc2UgPSB2aWRlb1Byb21pc2U7XG5cbiAgICAgICAgdGhpcy5wZW5kaW5nTWVkaWFSZXF1ZXN0cy5zZXQoY2xpZW50SWQsIHBlbmRpbmdNZWRpYVJlcXVlc3RzKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcGVuZGluZ01lZGlhUmVxdWVzdHMgPSB0aGlzLnBlbmRpbmdNZWRpYVJlcXVlc3RzLmdldChjbGllbnRJZCk7XG5cbiAgICAgIC8vIENyZWF0ZSBpbml0aWFsIHBlbmRpbmdNZWRpYVJlcXVlc3RzIHdpdGggc3RyZWFtTmFtZVxuICAgICAgaWYgKCFwZW5kaW5nTWVkaWFSZXF1ZXN0c1tzdHJlYW1OYW1lXSkge1xuICAgICAgICBjb25zdCBzdHJlYW1Qcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIHBlbmRpbmdNZWRpYVJlcXVlc3RzW3N0cmVhbU5hbWVdID0geyByZXNvbHZlLCByZWplY3QgfTtcbiAgICAgICAgfSkuY2F0Y2goZSA9PiBOQUYubG9nLndhcm4oYCR7Y2xpZW50SWR9IGdldE1lZGlhU3RyZWFtIFwiJHtzdHJlYW1OYW1lfVwiIEVycm9yYCwgZSkpO1xuICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0c1tzdHJlYW1OYW1lXS5wcm9taXNlID0gc3RyZWFtUHJvbWlzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucGVuZGluZ01lZGlhUmVxdWVzdHMuZ2V0KGNsaWVudElkKVtzdHJlYW1OYW1lXS5wcm9taXNlO1xuICAgIH1cbiAgfVxuXG4gIHNldE1lZGlhU3RyZWFtKGNsaWVudElkLCBzdHJlYW0sIHN0cmVhbU5hbWUpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0TWVkaWFTdHJlYW0gXCIsIGNsaWVudElkLCBzdHJlYW0sIHN0cmVhbU5hbWUpO1xuICAgIGNvbnN0IHBlbmRpbmdNZWRpYVJlcXVlc3RzID0gdGhpcy5wZW5kaW5nTWVkaWFSZXF1ZXN0cy5nZXQoY2xpZW50SWQpOyAvLyByZXR1cm4gdW5kZWZpbmVkIGlmIHRoZXJlIGlzIG5vIGVudHJ5IGluIHRoZSBNYXBcbiAgICBjb25zdCBjbGllbnRNZWRpYVN0cmVhbXMgPSB0aGlzLm1lZGlhU3RyZWFtc1tjbGllbnRJZF0gPSB0aGlzLm1lZGlhU3RyZWFtc1tjbGllbnRJZF0gfHwge307XG5cbiAgICBpZiAoc3RyZWFtTmFtZSA9PT0gJ2RlZmF1bHQnKSB7XG4gICAgICAvLyBTYWZhcmkgZG9lc24ndCBsaWtlIGl0IHdoZW4geW91IHVzZSBhIG1peGVkIG1lZGlhIHN0cmVhbSB3aGVyZSBvbmUgb2YgdGhlIHRyYWNrcyBpcyBpbmFjdGl2ZSwgc28gd2VcbiAgICAgIC8vIHNwbGl0IHRoZSB0cmFja3MgaW50byB0d28gc3RyZWFtcy5cbiAgICAgIC8vIEFkZCBtZWRpYVN0cmVhbXMgYXVkaW8gc3RyZWFtTmFtZSBhbGlhc1xuICAgICAgY29uc3QgYXVkaW9UcmFja3MgPSBzdHJlYW0uZ2V0QXVkaW9UcmFja3MoKTtcbiAgICAgIGlmIChhdWRpb1RyYWNrcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGF1ZGlvU3RyZWFtID0gbmV3IE1lZGlhU3RyZWFtKCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgYXVkaW9UcmFja3MuZm9yRWFjaCh0cmFjayA9PiBhdWRpb1N0cmVhbS5hZGRUcmFjayh0cmFjaykpO1xuICAgICAgICAgIGNsaWVudE1lZGlhU3RyZWFtcy5hdWRpbyA9IGF1ZGlvU3RyZWFtO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgTkFGLmxvZy53YXJuKGAke2NsaWVudElkfSBzZXRNZWRpYVN0cmVhbSBcImF1ZGlvXCIgYWxpYXMgRXJyb3JgLCBlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlc29sdmUgdGhlIHByb21pc2UgZm9yIHRoZSB1c2VyJ3MgbWVkaWEgc3RyZWFtIGF1ZGlvIGFsaWFzIGlmIGl0IGV4aXN0cy5cbiAgICAgICAgaWYgKHBlbmRpbmdNZWRpYVJlcXVlc3RzKSBwZW5kaW5nTWVkaWFSZXF1ZXN0cy5hdWRpby5yZXNvbHZlKGF1ZGlvU3RyZWFtKTtcbiAgICAgIH1cblxuICAgICAgLy8gQWRkIG1lZGlhU3RyZWFtcyB2aWRlbyBzdHJlYW1OYW1lIGFsaWFzXG4gICAgICBjb25zdCB2aWRlb1RyYWNrcyA9IHN0cmVhbS5nZXRWaWRlb1RyYWNrcygpO1xuICAgICAgaWYgKHZpZGVvVHJhY2tzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgdmlkZW9TdHJlYW0gPSBuZXcgTWVkaWFTdHJlYW0oKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB2aWRlb1RyYWNrcy5mb3JFYWNoKHRyYWNrID0+IHZpZGVvU3RyZWFtLmFkZFRyYWNrKHRyYWNrKSk7XG4gICAgICAgICAgY2xpZW50TWVkaWFTdHJlYW1zLnZpZGVvID0gdmlkZW9TdHJlYW07XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBOQUYubG9nLndhcm4oYCR7Y2xpZW50SWR9IHNldE1lZGlhU3RyZWFtIFwidmlkZW9cIiBhbGlhcyBFcnJvcmAsIGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVzb2x2ZSB0aGUgcHJvbWlzZSBmb3IgdGhlIHVzZXIncyBtZWRpYSBzdHJlYW0gdmlkZW8gYWxpYXMgaWYgaXQgZXhpc3RzLlxuICAgICAgICBpZiAocGVuZGluZ01lZGlhUmVxdWVzdHMpIHBlbmRpbmdNZWRpYVJlcXVlc3RzLnZpZGVvLnJlc29sdmUodmlkZW9TdHJlYW0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjbGllbnRNZWRpYVN0cmVhbXNbc3RyZWFtTmFtZV0gPSBzdHJlYW07XG5cbiAgICAgIC8vIFJlc29sdmUgdGhlIHByb21pc2UgZm9yIHRoZSB1c2VyJ3MgbWVkaWEgc3RyZWFtIGJ5IFN0cmVhbU5hbWUgaWYgaXQgZXhpc3RzLlxuICAgICAgaWYgKHBlbmRpbmdNZWRpYVJlcXVlc3RzICYmIHBlbmRpbmdNZWRpYVJlcXVlc3RzW3N0cmVhbU5hbWVdKSB7XG4gICAgICAgIHBlbmRpbmdNZWRpYVJlcXVlc3RzW3N0cmVhbU5hbWVdLnJlc29sdmUoc3RyZWFtKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhZGRMb2NhbE1lZGlhU3RyZWFtKHN0cmVhbSwgc3RyZWFtTmFtZSkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBhZGRMb2NhbE1lZGlhU3RyZWFtIFwiLCBzdHJlYW0sIHN0cmVhbU5hbWUpO1xuICAgIGNvbnN0IGVhc3lydGMgPSB0aGlzLmVhc3lydGM7XG4gICAgc3RyZWFtTmFtZSA9IHN0cmVhbU5hbWUgfHwgc3RyZWFtLmlkO1xuICAgIHRoaXMuc2V0TWVkaWFTdHJlYW0oXCJsb2NhbFwiLCBzdHJlYW0sIHN0cmVhbU5hbWUpO1xuICAgIGVhc3lydGMucmVnaXN0ZXIzcmRQYXJ0eUxvY2FsTWVkaWFTdHJlYW0oc3RyZWFtLCBzdHJlYW1OYW1lKTtcblxuICAgIC8vIEFkZCBsb2NhbCBzdHJlYW0gdG8gZXhpc3RpbmcgY29ubmVjdGlvbnNcbiAgICBPYmplY3Qua2V5cyh0aGlzLnJlbW90ZUNsaWVudHMpLmZvckVhY2goY2xpZW50SWQgPT4ge1xuICAgICAgaWYgKGVhc3lydGMuZ2V0Q29ubmVjdFN0YXR1cyhjbGllbnRJZCkgIT09IGVhc3lydGMuTk9UX0NPTk5FQ1RFRCkge1xuICAgICAgICBlYXN5cnRjLmFkZFN0cmVhbVRvQ2FsbChjbGllbnRJZCwgc3RyZWFtTmFtZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICByZW1vdmVMb2NhbE1lZGlhU3RyZWFtKHN0cmVhbU5hbWUpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgcmVtb3ZlTG9jYWxNZWRpYVN0cmVhbSBcIiwgc3RyZWFtTmFtZSk7XG4gICAgdGhpcy5lYXN5cnRjLmNsb3NlTG9jYWxNZWRpYVN0cmVhbShzdHJlYW1OYW1lKTtcbiAgICBkZWxldGUgdGhpcy5tZWRpYVN0cmVhbXNbXCJsb2NhbFwiXVtzdHJlYW1OYW1lXTtcbiAgfVxuXG4gIGVuYWJsZU1pY3JvcGhvbmUoZW5hYmxlZCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBlbmFibGVNaWNyb3Bob25lIFwiLCBlbmFibGVkKTtcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlTWljcm9waG9uZShlbmFibGVkKTtcbiAgfVxuXG4gIGVuYWJsZUNhbWVyYShlbmFibGVkKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGVuYWJsZUNhbWVyYSBcIiwgZW5hYmxlZCk7XG4gICAgdGhpcy5lYXN5cnRjLmVuYWJsZUNhbWVyYShlbmFibGVkKTtcbiAgfVxuXG4gIGRpc2Nvbm5lY3QoKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGRpc2Nvbm5lY3QgXCIpO1xuICAgIHRoaXMuZWFzeXJ0Yy5kaXNjb25uZWN0KCk7XG4gIH1cblxuICBhc3luYyBoYW5kbGVVc2VyUHVibGlzaGVkKHVzZXIsIG1lZGlhVHlwZSkge31cblxuICBoYW5kbGVVc2VyVW5wdWJsaXNoZWQodXNlciwgbWVkaWFUeXBlKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGhhbmRsZVVzZXJVblB1Ymxpc2hlZCBcIik7XG4gIH1cblxuICBhc3luYyBjb25uZWN0QWdvcmEoKSB7XG4gICAgLy8gQWRkIGFuIGV2ZW50IGxpc3RlbmVyIHRvIHBsYXkgcmVtb3RlIHRyYWNrcyB3aGVuIHJlbW90ZSB1c2VyIHB1Ymxpc2hlcy5cbiAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICB0aGlzLmFnb3JhQ2xpZW50ID0gQWdvcmFSVEMuY3JlYXRlQ2xpZW50KHsgbW9kZTogXCJsaXZlXCIsIGNvZGVjOiBcInZwOFwiIH0pO1xuICAgIGlmICh0aGlzLmVuYWJsZVZpZGVvRmlsdGVyZWQgfHwgdGhpcy5lbmFibGVWaWRlbyB8fCB0aGlzLmVuYWJsZUF1ZGlvKSB7XG4gICAgICAvL3RoaXMuYWdvcmFDbGllbnQgPSBBZ29yYVJUQy5jcmVhdGVDbGllbnQoeyBtb2RlOiBcInJ0Y1wiLCBjb2RlYzogXCJ2cDhcIiB9KTtcbiAgICAgIC8vdGhpcy5hZ29yYUNsaWVudCA9IEFnb3JhUlRDLmNyZWF0ZUNsaWVudCh7IG1vZGU6IFwibGl2ZVwiLCBjb2RlYzogXCJoMjY0XCIgfSk7XG4gICAgICB0aGlzLmFnb3JhQ2xpZW50LnNldENsaWVudFJvbGUoXCJob3N0XCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvL3RoaXMuYWdvcmFDbGllbnQgPSBBZ29yYVJUQy5jcmVhdGVDbGllbnQoeyBtb2RlOiBcImxpdmVcIiwgY29kZWM6IFwiaDI2NFwiIH0pO1xuICAgICAgLy90aGlzLmFnb3JhQ2xpZW50ID0gQWdvcmFSVEMuY3JlYXRlQ2xpZW50KHsgbW9kZTogXCJsaXZlXCIsIGNvZGVjOiBcInZwOFwiIH0pO1xuICAgIH1cblxuICAgIHRoaXMuYWdvcmFDbGllbnQub24oXCJ1c2VyLWpvaW5lZFwiLCBhc3luYyAodXNlcikgPT4ge1xuXHQgICAgY29uc29sZS53YXJuKFwidXNlci1qb2luZWRcIix1c2VyKTtcbiAgICB9KTtcbiAgICB0aGlzLmFnb3JhQ2xpZW50Lm9uKFwidXNlci1wdWJsaXNoZWRcIiwgYXN5bmMgKHVzZXIsIG1lZGlhVHlwZSkgPT4ge1xuXG4gICAgICBsZXQgY2xpZW50SWQgPSB1c2VyLnVpZDtcbiAgICAgIGNvbnNvbGUubG9nKFwiQlc3MyBoYW5kbGVVc2VyUHVibGlzaGVkIFwiICsgY2xpZW50SWQgKyBcIiBcIiArIG1lZGlhVHlwZSwgdGhhdC5hZ29yYUNsaWVudCk7XG4gICAgICBhd2FpdCB0aGF0LmFnb3JhQ2xpZW50LnN1YnNjcmliZSh1c2VyLCBtZWRpYVR5cGUpO1xuICAgICAgY29uc29sZS5sb2coXCJCVzczIGhhbmRsZVVzZXJQdWJsaXNoZWQyIFwiICsgY2xpZW50SWQgKyBcIiBcIiArIHRoYXQuYWdvcmFDbGllbnQpO1xuXG4gICAgICBjb25zdCBwZW5kaW5nTWVkaWFSZXF1ZXN0cyA9IHRoYXQucGVuZGluZ01lZGlhUmVxdWVzdHMuZ2V0KGNsaWVudElkKTtcbiAgICAgIGNvbnN0IGNsaWVudE1lZGlhU3RyZWFtcyA9IHRoYXQubWVkaWFTdHJlYW1zW2NsaWVudElkXSA9IHRoYXQubWVkaWFTdHJlYW1zW2NsaWVudElkXSB8fCB7fTtcblxuICAgICAgaWYgKG1lZGlhVHlwZSA9PT0gJ2F1ZGlvJykge1xuXHQgICAgICB1c2VyLmF1ZGlvVHJhY2sucGxheSgpO1xuXG4gICAgICAgIGNvbnN0IGF1ZGlvU3RyZWFtID0gbmV3IE1lZGlhU3RyZWFtKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwidXNlci5hdWRpb1RyYWNrIFwiLCB1c2VyLmF1ZGlvVHJhY2suX21lZGlhU3RyZWFtVHJhY2spO1xuICAgICAgICAvL2F1ZGlvU3RyZWFtLmFkZFRyYWNrKHVzZXIuYXVkaW9UcmFjay5fbWVkaWFTdHJlYW1UcmFjayk7XG4gICAgICAgIGNsaWVudE1lZGlhU3RyZWFtcy5hdWRpbyA9IGF1ZGlvU3RyZWFtO1xuICAgICAgICBpZiAocGVuZGluZ01lZGlhUmVxdWVzdHMpIHBlbmRpbmdNZWRpYVJlcXVlc3RzLmF1ZGlvLnJlc29sdmUoYXVkaW9TdHJlYW0pO1xuICAgICAgfVxuXG4gICAgICBsZXQgdmlkZW9TdHJlYW0gPSBudWxsO1xuICAgICAgaWYgKG1lZGlhVHlwZSA9PT0gJ3ZpZGVvJykge1xuICAgICAgICB2aWRlb1N0cmVhbSA9IG5ldyBNZWRpYVN0cmVhbSgpO1xuICAgICAgICBjb25zb2xlLmxvZyhcInVzZXIudmlkZW9UcmFjayBcIiwgdXNlci52aWRlb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrKTtcbiAgICAgICAgdmlkZW9TdHJlYW0uYWRkVHJhY2sodXNlci52aWRlb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrKTtcbiAgICAgICAgY2xpZW50TWVkaWFTdHJlYW1zLnZpZGVvID0gdmlkZW9TdHJlYW07XG4gICAgICAgIGlmIChwZW5kaW5nTWVkaWFSZXF1ZXN0cykgcGVuZGluZ01lZGlhUmVxdWVzdHMudmlkZW8ucmVzb2x2ZSh2aWRlb1N0cmVhbSk7XG4gICAgICAgIC8vdXNlci52aWRlb1RyYWNrXG4gICAgICB9XG5cbiAgICAgIGlmIChjbGllbnRJZCA9PSAnQ0NDJykge1xuXHQgIGlmIChtZWRpYVR5cGUgPT09ICd2aWRlbycpIHtcblx0XHQvLyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInZpZGVvMzYwXCIpLnNyY09iamVjdD12aWRlb1N0cmVhbTtcblx0XHQgLy9kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3ZpZGVvMzYwXCIpLnNldEF0dHJpYnV0ZShcInNyY1wiLCB2aWRlb1N0cmVhbSk7XG5cdFx0IC8vZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN2aWRlbzM2MFwiKS5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgdXNlci52aWRlb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrKTtcblx0XHQgLy9kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3ZpZGVvMzYwXCIpLnNyY09iamVjdD0gdXNlci52aWRlb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrO1xuXHRcdCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3ZpZGVvMzYwXCIpLnNyY09iamVjdD12aWRlb1N0cmVhbTtcblx0XHQgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN2aWRlbzM2MFwiKS5wbGF5KCk7XG5cdCAgfVxuXHQgIGlmIChtZWRpYVR5cGUgPT09ICdhdWRpbycpIHtcblx0XHQgIHVzZXIuYXVkaW9UcmFjay5wbGF5KCk7XG5cdCAgfVxuICAgICAgfVxuICAgICAgaWYgKGNsaWVudElkID09ICdEREQnKSB7XG5cdCAgaWYgKG1lZGlhVHlwZSA9PT0gJ3ZpZGVvJykge1xuXHQgIFx0dXNlci52aWRlb1RyYWNrLnBsYXkoXCJ2aWRlbzM2MFwiKTtcblx0ICB9XG5cdCAgaWYgKG1lZGlhVHlwZSA9PT0gJ2F1ZGlvJykge1xuXHRcdCAgdXNlci5hdWRpb1RyYWNrLnBsYXkoKTtcblx0ICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmFnb3JhQ2xpZW50Lm9uKFwidXNlci11bnB1Ymxpc2hlZFwiLCB0aGF0LmhhbmRsZVVzZXJVbnB1Ymxpc2hlZCk7XG5cbiAgICBjb25zb2xlLmxvZyhcImNvbm5lY3QgYWdvcmEgXCIpO1xuICAgIC8vIEpvaW4gYSBjaGFubmVsIGFuZCBjcmVhdGUgbG9jYWwgdHJhY2tzLiBCZXN0IHByYWN0aWNlIGlzIHRvIHVzZSBQcm9taXNlLmFsbCBhbmQgcnVuIHRoZW0gY29uY3VycmVudGx5LlxuICAgIC8vIG9cblxuXG4gaWYgKHRoaXMuZW5hYmxlQXZhdGFyKSB7XG4gICAgICAgIHZhciBzdHJlYW0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbnZhc1wiKS5jYXB0dXJlU3RyZWFtKDMwKTtcbiAgICAgICAgW3RoaXMudXNlcmlkLCB0aGlzLmxvY2FsVHJhY2tzLmF1ZGlvVHJhY2ssIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFja10gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgIHRoaXMuYWdvcmFDbGllbnQuam9pbih0aGlzLmFwcGlkLCB0aGlzLnJvb20sIHRoaXMudG9rZW4gfHwgbnVsbCwgdGhpcy5jbGllbnRJZCB8fCBudWxsKSxcbiAgICAgICAgQWdvcmFSVEMuY3JlYXRlTWljcm9waG9uZUF1ZGlvVHJhY2soKSwgQWdvcmFSVEMuY3JlYXRlQ3VzdG9tVmlkZW9UcmFjayh7IG1lZGlhU3RyZWFtVHJhY2s6IHN0cmVhbS5nZXRWaWRlb1RyYWNrcygpWzBdIH0pXSk7XG4gfVxuIGVsc2UgaWYgKHRoaXMuZW5hYmxlVmlkZW9GaWx0ZXJlZCAmJiB0aGlzLmVuYWJsZUF1ZGlvKSB7XG4gICAgICB2YXIgc3RyZWFtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYW52YXNfc2VjcmV0XCIpLmNhcHR1cmVTdHJlYW0oMzApO1xuICAgICAgW3RoaXMudXNlcmlkLCB0aGlzLmxvY2FsVHJhY2tzLmF1ZGlvVHJhY2ssIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFja10gPSBhd2FpdCBQcm9taXNlLmFsbChbdGhpcy5hZ29yYUNsaWVudC5qb2luKHRoaXMuYXBwaWQsIHRoaXMucm9vbSwgdGhpcy50b2tlbiB8fCBudWxsLCB0aGlzLmNsaWVudElkIHx8IG51bGwpLCBBZ29yYVJUQy5jcmVhdGVNaWNyb3Bob25lQXVkaW9UcmFjaygpLCBBZ29yYVJUQy5jcmVhdGVDdXN0b21WaWRlb1RyYWNrKHsgbWVkaWFTdHJlYW1UcmFjazogc3RyZWFtLmdldFZpZGVvVHJhY2tzKClbMF0gfSldKTtcbiB9XG4gZWxzZSBpZiAodGhpcy5lbmFibGVWaWRlbyAmJiB0aGlzLmVuYWJsZUF1ZGlvKSB7XG4gICAgICBbdGhpcy51c2VyaWQsIHRoaXMubG9jYWxUcmFja3MuYXVkaW9UcmFjaywgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgIHRoaXMuYWdvcmFDbGllbnQuam9pbih0aGlzLmFwcGlkLCB0aGlzLnJvb20sIHRoaXMudG9rZW4gfHwgbnVsbCwgdGhpcy5jbGllbnRJZCB8fCBudWxsKSxcbiAgICAgIEFnb3JhUlRDLmNyZWF0ZU1pY3JvcGhvbmVBdWRpb1RyYWNrKCksIEFnb3JhUlRDLmNyZWF0ZUNhbWVyYVZpZGVvVHJhY2soe2VuY29kZXJDb25maWc6ICc0ODBwXzInfSldKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuZW5hYmxlVmlkZW8pIHtcbiAgICAgIFt0aGlzLnVzZXJpZCwgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgIC8vIEpvaW4gdGhlIGNoYW5uZWwuXG4gICAgICB0aGlzLmFnb3JhQ2xpZW50LmpvaW4odGhpcy5hcHBpZCwgdGhpcy5yb29tLCB0aGlzLnRva2VuIHx8IG51bGwsIHRoaXMuY2xpZW50SWQgfHwgbnVsbCksIEFnb3JhUlRDLmNyZWF0ZUNhbWVyYVZpZGVvVHJhY2soXCIzNjBwXzRcIildKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuZW5hYmxlQXVkaW8pIHtcbiAgICAgIFt0aGlzLnVzZXJpZCwgdGhpcy5sb2NhbFRyYWNrcy5hdWRpb1RyYWNrXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgIC8vIEpvaW4gdGhlIGNoYW5uZWwuXG4gICAgICB0aGlzLmFnb3JhQ2xpZW50LmpvaW4odGhpcy5hcHBpZCwgdGhpcy5yb29tLCB0aGlzLnRva2VuIHx8IG51bGwsIHRoaXMuY2xpZW50SWQgfHwgbnVsbCksIEFnb3JhUlRDLmNyZWF0ZU1pY3JvcGhvbmVBdWRpb1RyYWNrKCldKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy51c2VyaWQgPSBhd2FpdCB0aGlzLmFnb3JhQ2xpZW50LmpvaW4odGhpcy5hcHBpZCwgdGhpcy5yb29tLCB0aGlzLnRva2VuIHx8IG51bGwsIHRoaXMuY2xpZW50SWQgfHwgbnVsbCk7XG4gICAgfVxuXG5cdCAgXG4gICAgLy8gc2VsZWN0IGZhY2V0aW1lIGNhbWVyYSBpZiBleGlzdHNcbiAgICBpZiAodGhpcy5lbmFibGVWaWRlbyAmJiAhdGhpcy5lbmFibGVWaWRlb0ZpbHRlcmVkKSB7XG5cdCAgICBsZXQgY2FtcyA9IGF3YWl0IEFnb3JhUlRDLmdldENhbWVyYXMoKTtcblx0ICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2Ftcy5sZW5ndGg7IGkrKykge1xuXHQgICAgICBpZiAoY2Ftc1tpXS5sYWJlbC5pbmRleE9mKFwiRmFjZVRpbWVcIikgPT0gMCkge1xuXHRcdGNvbnNvbGUubG9nKFwic2VsZWN0IEZhY2VUaW1lIGNhbWVyYVwiLGNhbXNbaV0uZGV2aWNlSWQgKTtcblx0ICAgIFx0YXdhaXQgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrLnNldERldmljZShjYW1zW2ldLmRldmljZUlkKTtcblx0ICAgICAgfVxuXHQgICAgfVxuICAgIH1cblx0ICBcbiAgICBpZiAodGhpcy5lbmFibGVWaWRlbyAmJiB0aGlzLnNob3dMb2NhbCkge1xuICAgICAgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrLnBsYXkoXCJsb2NhbC1wbGF5ZXJcIik7XG4gICAgfVxuXG4gICAgLy8gRW5hYmxlIHZpcnR1YWwgYmFja2dyb3VuZCBPTEQgTWV0aG9kXG4gICAgaWYgKHRoaXMuZW5hYmxlVmlkZW8gJiYgdGhpcy52YmcwICYmIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjaykge1xuICAgICAgICBjb25zdCBpbWdFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG4gICAgICAgIGltZ0VsZW1lbnQub25sb2FkID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICAgIGlmICghdGhpcy52aXJ0dWFsQmFja2dyb3VuZEluc3RhbmNlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlNFRyBJTklUIFwiLCB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2spO1xuICAgICAgICAgICAgdGhpcy52aXJ0dWFsQmFja2dyb3VuZEluc3RhbmNlID0gYXdhaXQgU2VnUGx1Z2luLmluamVjdCh0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2ssIFwiL2Fzc2V0cy93YXNtczBcIikuY2F0Y2goY29uc29sZS5lcnJvcik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlNFRyBJTklURURcIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMudmlydHVhbEJhY2tncm91bmRJbnN0YW5jZS5zZXRPcHRpb25zKHsgZW5hYmxlOiB0cnVlLCBiYWNrZ3JvdW5kOiBpbWdFbGVtZW50IH0pO1xuICAgICAgICB9O1xuICAgICAgICBpbWdFbGVtZW50LnNyYyA9ICdkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUFRQUFBQURDQUlBQUFBN2xqbVJBQUFBRDBsRVFWUjRYbU5nK00rQVFEZzVBT2s5Qy9Wa29tellBQUFBQUVsRlRrU3VRbUNDJztcbiAgICB9XG5cbiAgICAvLyBFbmFibGUgdmlydHVhbCBiYWNrZ3JvdW5kIE5ldyBNZXRob2RcbiAgICBpZiAodGhpcy5lbmFibGVWaWRlbyAmJiB0aGlzLnZiZyAmJiB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2spIHtcblxuXHR0aGlzLmV4dGVuc2lvbiA9IG5ldyBWaXJ0dWFsQmFja2dyb3VuZEV4dGVuc2lvbigpO1xuXHRBZ29yYVJUQy5yZWdpc3RlckV4dGVuc2lvbnMoW3RoaXMuZXh0ZW5zaW9uXSk7XG5cdHRoaXMucHJvY2Vzc29yID0gdGhpcy5leHRlbnNpb24uY3JlYXRlUHJvY2Vzc29yKCk7XG5cdGF3YWl0IHRoaXMucHJvY2Vzc29yLmluaXQoXCIvYXNzZXRzL3dhc21zXCIpO1xuXHR0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2sucGlwZSh0aGlzLnByb2Nlc3NvcikucGlwZSh0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2sucHJvY2Vzc29yRGVzdGluYXRpb24pO1xuXHRhd2FpdCB0aGlzLnByb2Nlc3Nvci5zZXRPcHRpb25zKHsgdHlwZTogJ2NvbG9yJywgY29sb3I6XCIjMDBmZjAwXCJ9KTtcblx0YXdhaXQgdGhpcy5wcm9jZXNzb3IuZW5hYmxlKCk7XG4gICAgfVxuXG4gICAgLy8gUHVibGlzaCB0aGUgbG9jYWwgdmlkZW8gYW5kIGF1ZGlvIHRyYWNrcyB0byB0aGUgY2hhbm5lbC5cbiAgICBpZiAodGhpcy5lbmFibGVWaWRlbyB8fCB0aGlzLmVuYWJsZUF1ZGlvIHx8IHRoaXMuZW5hYmxlQXZhdGFyKSB7XG4gICAgICBhd2FpdCB0aGlzLmFnb3JhQ2xpZW50LnB1Ymxpc2goT2JqZWN0LnZhbHVlcyh0aGlzLmxvY2FsVHJhY2tzKSk7XG4gICAgICBjb25zb2xlLmxvZyhcInB1Ymxpc2ggc3VjY2Vzc1wiKTtcbiAgICB9XG5cbiAgfVxuXG4gIC8qKlxuICAgKiBQcml2YXRlc1xuICAgKi9cblxuICBhc3luYyBfY29ubmVjdChjb25uZWN0U3VjY2VzcywgY29ubmVjdEZhaWx1cmUpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICBhd2FpdCB0aGF0LmVhc3lydGMuY29ubmVjdCh0aGF0LmFwcCwgY29ubmVjdFN1Y2Nlc3MsIGNvbm5lY3RGYWlsdXJlKTtcblxuICAgIC8qXG4gICAgICAgdGhpcy5lYXN5cnRjLnNldFN0cmVhbUFjY2VwdG9yKHRoaXMuc2V0TWVkaWFTdHJlYW0uYmluZCh0aGlzKSk7XG4gICAgICAgdGhpcy5lYXN5cnRjLnNldE9uU3RyZWFtQ2xvc2VkKGZ1bmN0aW9uKGNsaWVudElkLCBzdHJlYW0sIHN0cmVhbU5hbWUpIHtcbiAgICAgICAgZGVsZXRlIHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXVtzdHJlYW1OYW1lXTtcbiAgICAgIH0pO1xuICAgICAgIGlmICh0aGF0LmVhc3lydGMuYXVkaW9FbmFibGVkIHx8IHRoYXQuZWFzeXJ0Yy52aWRlb0VuYWJsZWQpIHtcbiAgICAgICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEoe1xuICAgICAgICAgIHZpZGVvOiB0aGF0LmVhc3lydGMudmlkZW9FbmFibGVkLFxuICAgICAgICAgIGF1ZGlvOiB0aGF0LmVhc3lydGMuYXVkaW9FbmFibGVkXG4gICAgICAgIH0pLnRoZW4oXG4gICAgICAgICAgZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgICAgICAgICB0aGF0LmFkZExvY2FsTWVkaWFTdHJlYW0oc3RyZWFtLCBcImRlZmF1bHRcIik7XG4gICAgICAgICAgICB0aGF0LmVhc3lydGMuY29ubmVjdCh0aGF0LmFwcCwgY29ubmVjdFN1Y2Nlc3MsIGNvbm5lY3RGYWlsdXJlKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGZ1bmN0aW9uKGVycm9yQ29kZSwgZXJybWVzZykge1xuICAgICAgICAgICAgTkFGLmxvZy5lcnJvcihlcnJvckNvZGUsIGVycm1lc2cpO1xuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoYXQuZWFzeXJ0Yy5jb25uZWN0KHRoYXQuYXBwLCBjb25uZWN0U3VjY2VzcywgY29ubmVjdEZhaWx1cmUpO1xuICAgICAgfVxuICAgICAgKi9cbiAgfVxuXG4gIF9nZXRSb29tSm9pblRpbWUoY2xpZW50SWQpIHtcbiAgICB2YXIgbXlSb29tSWQgPSB0aGlzLnJvb207IC8vTkFGLnJvb207XG4gICAgdmFyIGpvaW5UaW1lID0gdGhpcy5lYXN5cnRjLmdldFJvb21PY2N1cGFudHNBc01hcChteVJvb21JZClbY2xpZW50SWRdLnJvb21Kb2luVGltZTtcbiAgICByZXR1cm4gam9pblRpbWU7XG4gIH1cblxuICBnZXRTZXJ2ZXJUaW1lKCkge1xuICAgIHJldHVybiBEYXRlLm5vdygpICsgdGhpcy5hdmdUaW1lT2Zmc2V0O1xuICB9XG59XG5cbk5BRi5hZGFwdGVycy5yZWdpc3RlcihcImFnb3JhcnRjXCIsIEFnb3JhUnRjQWRhcHRlcik7XG5cbm1vZHVsZS5leHBvcnRzID0gQWdvcmFSdGNBZGFwdGVyO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==