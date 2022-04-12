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
    this.showLocal = false;
    this.virtualBackgroundInstance = null;

    this.serverTimeRequests = 0;
    this.timeOffsets = [];
    this.avgTimeOffset = 0;
    this.agoraClient = null;
    //AgoraRTC.loadModule(SegPlugin, {});

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
      if (this.vbg) {
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
      this.agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    } else {
      this.agoraClient = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
    }

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

      if (mediaType === 'video') {
        const videoStream = new MediaStream();
        console.log("user.videoTrack ", user.videoTrack._mediaStreamTrack);
        videoStream.addTrack(user.videoTrack._mediaStreamTrack);
        clientMediaStreams.video = videoStream;
        if (pendingMediaRequests) pendingMediaRequests.video.resolve(videoStream);
        //user.videoTrack
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
      [this.userid, this.localTracks.audioTrack, this.localTracks.videoTrack] = await Promise.all([this.agoraClient.join(this.appid, this.room, this.token || null, this.clientId || null), AgoraRTC.createMicrophoneAudioTrack(), AgoraRTC.createCameraVideoTrack("360p_4")]);
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

    if (this.enableVideo && this.showLocal) {
      this.localTracks.videoTrack.play("local-player");
    }

    if (this.enableVideo || this.enableAudio || this.enableAvatar) {

      await this.agoraClient.publish(Object.values(this.localTracks));
      console.log("publish success");

      // Publish the local video and audio tracks to the channel.
      if (this.enableVideo && this.vbg && this.localTracks.videoTrack) {
        const imgElement = document.createElement('img');
        imgElement.onload = async () => {
          if (!this.virtualBackgroundInstance) {
            console.log("SEG INIT ", this.localTracks.videoTrack);
            this.virtualBackgroundInstance = await SegPlugin.inject(this.localTracks.videoTrack, "/assets/wasms").catch(console.error);
            console.log("SEG INITED");
          }
          this.virtualBackgroundInstance.setOptions({ enable: true, background: imgElement });
        };
        imgElement.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAAD0lEQVR4XmNg+M+AQDg5AOk9C/VkomzYAAAAAElFTkSuQmCC';
      }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIl0sIm5hbWVzIjpbIkFnb3JhUnRjQWRhcHRlciIsImNvbnN0cnVjdG9yIiwiZWFzeXJ0YyIsImNvbnNvbGUiLCJsb2ciLCJ3aW5kb3ciLCJhcHAiLCJyb29tIiwidXNlcmlkIiwiYXBwaWQiLCJtZWRpYVN0cmVhbXMiLCJyZW1vdGVDbGllbnRzIiwicGVuZGluZ01lZGlhUmVxdWVzdHMiLCJNYXAiLCJlbmFibGVWaWRlbyIsImVuYWJsZUF1ZGlvIiwiZW5hYmxlQXZhdGFyIiwibG9jYWxUcmFja3MiLCJ2aWRlb1RyYWNrIiwiYXVkaW9UcmFjayIsInRva2VuIiwiY2xpZW50SWQiLCJ1aWQiLCJ2YmciLCJzaG93TG9jYWwiLCJ2aXJ0dWFsQmFja2dyb3VuZEluc3RhbmNlIiwic2VydmVyVGltZVJlcXVlc3RzIiwidGltZU9mZnNldHMiLCJhdmdUaW1lT2Zmc2V0IiwiYWdvcmFDbGllbnQiLCJzZXRQZWVyT3Blbkxpc3RlbmVyIiwiY2xpZW50Q29ubmVjdGlvbiIsImdldFBlZXJDb25uZWN0aW9uQnlVc2VySWQiLCJzZXRQZWVyQ2xvc2VkTGlzdGVuZXIiLCJzZXRTZXJ2ZXJVcmwiLCJ1cmwiLCJzZXRTb2NrZXRVcmwiLCJzZXRBcHAiLCJhcHBOYW1lIiwic2V0Um9vbSIsImpzb24iLCJyZXBsYWNlIiwib2JqIiwiSlNPTiIsInBhcnNlIiwibmFtZSIsIkFnb3JhUlRDIiwibG9hZE1vZHVsZSIsIlNlZ1BsdWdpbiIsImpvaW5Sb29tIiwic2V0V2ViUnRjT3B0aW9ucyIsIm9wdGlvbnMiLCJlbmFibGVEYXRhQ2hhbm5lbHMiLCJkYXRhY2hhbm5lbCIsInZpZGVvIiwiYXVkaW8iLCJlbmFibGVWaWRlb1JlY2VpdmUiLCJlbmFibGVBdWRpb1JlY2VpdmUiLCJzZXRTZXJ2ZXJDb25uZWN0TGlzdGVuZXJzIiwic3VjY2Vzc0xpc3RlbmVyIiwiZmFpbHVyZUxpc3RlbmVyIiwiY29ubmVjdFN1Y2Nlc3MiLCJjb25uZWN0RmFpbHVyZSIsInNldFJvb21PY2N1cGFudExpc3RlbmVyIiwib2NjdXBhbnRMaXN0ZW5lciIsInJvb21OYW1lIiwib2NjdXBhbnRzIiwicHJpbWFyeSIsInNldERhdGFDaGFubmVsTGlzdGVuZXJzIiwib3Blbkxpc3RlbmVyIiwiY2xvc2VkTGlzdGVuZXIiLCJtZXNzYWdlTGlzdGVuZXIiLCJzZXREYXRhQ2hhbm5lbE9wZW5MaXN0ZW5lciIsInNldERhdGFDaGFubmVsQ2xvc2VMaXN0ZW5lciIsInNldFBlZXJMaXN0ZW5lciIsInVwZGF0ZVRpbWVPZmZzZXQiLCJjbGllbnRTZW50VGltZSIsIkRhdGUiLCJub3ciLCJmZXRjaCIsImRvY3VtZW50IiwibG9jYXRpb24iLCJocmVmIiwibWV0aG9kIiwiY2FjaGUiLCJ0aGVuIiwicmVzIiwicHJlY2lzaW9uIiwic2VydmVyUmVjZWl2ZWRUaW1lIiwiaGVhZGVycyIsImdldCIsImdldFRpbWUiLCJjbGllbnRSZWNlaXZlZFRpbWUiLCJzZXJ2ZXJUaW1lIiwidGltZU9mZnNldCIsInB1c2giLCJyZWR1Y2UiLCJhY2MiLCJvZmZzZXQiLCJsZW5ndGgiLCJzZXRUaW1lb3V0IiwiY29ubmVjdCIsIlByb21pc2UiLCJhbGwiLCJyZXNvbHZlIiwicmVqZWN0IiwiX2Nvbm5lY3QiLCJfIiwiX215Um9vbUpvaW5UaW1lIiwiX2dldFJvb21Kb2luVGltZSIsImNvbm5lY3RBZ29yYSIsImNhdGNoIiwic2hvdWxkU3RhcnRDb25uZWN0aW9uVG8iLCJjbGllbnQiLCJyb29tSm9pblRpbWUiLCJzdGFydFN0cmVhbUNvbm5lY3Rpb24iLCJjYWxsIiwiY2FsbGVyIiwibWVkaWEiLCJOQUYiLCJ3cml0ZSIsImVycm9yQ29kZSIsImVycm9yVGV4dCIsImVycm9yIiwid2FzQWNjZXB0ZWQiLCJjbG9zZVN0cmVhbUNvbm5lY3Rpb24iLCJoYW5ndXAiLCJzZW5kRGF0YSIsImRhdGFUeXBlIiwiZGF0YSIsInNlbmREYXRhR3VhcmFudGVlZCIsInNlbmREYXRhV1MiLCJicm9hZGNhc3REYXRhIiwicm9vbU9jY3VwYW50cyIsImdldFJvb21PY2N1cGFudHNBc01hcCIsInJvb21PY2N1cGFudCIsIm15RWFzeXJ0Y2lkIiwiYnJvYWRjYXN0RGF0YUd1YXJhbnRlZWQiLCJkZXN0aW5hdGlvbiIsInRhcmdldFJvb20iLCJnZXRDb25uZWN0U3RhdHVzIiwic3RhdHVzIiwiSVNfQ09OTkVDVEVEIiwiYWRhcHRlcnMiLCJOT1RfQ09OTkVDVEVEIiwiQ09OTkVDVElORyIsImdldE1lZGlhU3RyZWFtIiwic3RyZWFtTmFtZSIsImhhcyIsImF1ZGlvUHJvbWlzZSIsImUiLCJ3YXJuIiwicHJvbWlzZSIsInZpZGVvUHJvbWlzZSIsInNldCIsInN0cmVhbVByb21pc2UiLCJzZXRNZWRpYVN0cmVhbSIsInN0cmVhbSIsImNsaWVudE1lZGlhU3RyZWFtcyIsImF1ZGlvVHJhY2tzIiwiZ2V0QXVkaW9UcmFja3MiLCJhdWRpb1N0cmVhbSIsIk1lZGlhU3RyZWFtIiwiZm9yRWFjaCIsInRyYWNrIiwiYWRkVHJhY2siLCJ2aWRlb1RyYWNrcyIsImdldFZpZGVvVHJhY2tzIiwidmlkZW9TdHJlYW0iLCJhZGRMb2NhbE1lZGlhU3RyZWFtIiwiaWQiLCJyZWdpc3RlcjNyZFBhcnR5TG9jYWxNZWRpYVN0cmVhbSIsIk9iamVjdCIsImtleXMiLCJhZGRTdHJlYW1Ub0NhbGwiLCJyZW1vdmVMb2NhbE1lZGlhU3RyZWFtIiwiY2xvc2VMb2NhbE1lZGlhU3RyZWFtIiwiZW5hYmxlTWljcm9waG9uZSIsImVuYWJsZWQiLCJlbmFibGVDYW1lcmEiLCJkaXNjb25uZWN0IiwiaGFuZGxlVXNlclB1Ymxpc2hlZCIsInVzZXIiLCJtZWRpYVR5cGUiLCJoYW5kbGVVc2VyVW5wdWJsaXNoZWQiLCJ0aGF0IiwiY3JlYXRlQ2xpZW50IiwibW9kZSIsImNvZGVjIiwib24iLCJzdWJzY3JpYmUiLCJfbWVkaWFTdHJlYW1UcmFjayIsImdldEVsZW1lbnRCeUlkIiwiY2FwdHVyZVN0cmVhbSIsImpvaW4iLCJjcmVhdGVNaWNyb3Bob25lQXVkaW9UcmFjayIsImNyZWF0ZUN1c3RvbVZpZGVvVHJhY2siLCJtZWRpYVN0cmVhbVRyYWNrIiwiY3JlYXRlQ2FtZXJhVmlkZW9UcmFjayIsInBsYXkiLCJwdWJsaXNoIiwidmFsdWVzIiwiaW1nRWxlbWVudCIsImNyZWF0ZUVsZW1lbnQiLCJvbmxvYWQiLCJpbmplY3QiLCJzZXRPcHRpb25zIiwiZW5hYmxlIiwiYmFja2dyb3VuZCIsInNyYyIsIm15Um9vbUlkIiwiam9pblRpbWUiLCJnZXRTZXJ2ZXJUaW1lIiwicmVnaXN0ZXIiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiO1FBQUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7OztRQUdBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwwQ0FBMEMsZ0NBQWdDO1FBQzFFO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0Esd0RBQXdELGtCQUFrQjtRQUMxRTtRQUNBLGlEQUFpRCxjQUFjO1FBQy9EOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQSx5Q0FBeUMsaUNBQWlDO1FBQzFFLGdIQUFnSCxtQkFBbUIsRUFBRTtRQUNySTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDJCQUEyQiwwQkFBMEIsRUFBRTtRQUN2RCxpQ0FBaUMsZUFBZTtRQUNoRDtRQUNBO1FBQ0E7O1FBRUE7UUFDQSxzREFBc0QsK0RBQStEOztRQUVySDtRQUNBOzs7UUFHQTtRQUNBOzs7Ozs7Ozs7Ozs7QUNsRkEsTUFBTUEsZUFBTixDQUFzQjs7QUFFcEJDLGNBQVlDLE9BQVosRUFBcUI7QUFDbkJDLFlBQVFDLEdBQVIsQ0FBWSxtQkFBWixFQUFpQ0YsT0FBakM7O0FBRUEsU0FBS0EsT0FBTCxH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QUFDQSxXQUFPaUcsUUFBUDtBQUNEOztBQUVEQyxrQkFBZ0I7QUFDZCxXQUFPdkksS0FBS0MsR0FBTCxLQUFhLEtBQUtsRCxhQUF6QjtBQUNEO0FBcmVtQjs7QUF3ZXRCMkYsSUFBSXdCLFFBQUosQ0FBYXNFLFFBQWIsQ0FBc0IsVUFBdEIsRUFBa0NyTixlQUFsQzs7QUFFQXNOLE9BQU9DLE9BQVAsR0FBaUJ2TixlQUFqQixDIiwiZmlsZSI6Im5hZi1hZ29yYS1hZGFwdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvaW5kZXguanNcIik7XG4iLCJjbGFzcyBBZ29yYVJ0Y0FkYXB0ZXIge1xuXG4gIGNvbnN0cnVjdG9yKGVhc3lydGMpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgY29uc3RydWN0b3IgXCIsIGVhc3lydGMpO1xuXG4gICAgdGhpcy5lYXN5cnRjID0gZWFzeXJ0YyB8fCB3aW5kb3cuZWFzeXJ0YztcbiAgICB0aGlzLmFwcCA9IFwiZGVmYXVsdFwiO1xuICAgIHRoaXMucm9vbSA9IFwiZGVmYXVsdFwiO1xuICAgIHRoaXMudXNlcmlkID0gMDtcbiAgICB0aGlzLmFwcGlkID0gbnVsbDtcblxuICAgIHRoaXMubWVkaWFTdHJlYW1zID0ge307XG4gICAgdGhpcy5yZW1vdGVDbGllbnRzID0ge307XG4gICAgdGhpcy5wZW5kaW5nTWVkaWFSZXF1ZXN0cyA9IG5ldyBNYXAoKTtcblxuICAgIHRoaXMuZW5hYmxlVmlkZW8gPSBmYWxzZTtcbiAgICB0aGlzLmVuYWJsZUF1ZGlvID0gZmFsc2U7XG4gICAgdGhpcy5lbmFibGVBdmF0YXIgPSBmYWxzZTtcblxuICAgIHRoaXMubG9jYWxUcmFja3MgPSB7IHZpZGVvVHJhY2s6IG51bGwsIGF1ZGlvVHJhY2s6IG51bGwgfTtcbiAgICB0aGlzLnRva2VuID0gbnVsbDtcbiAgICB0aGlzLmNsaWVudElkID0gbnVsbDtcbiAgICB0aGlzLnVpZCA9IG51bGw7XG4gICAgdGhpcy52YmcgPSBmYWxzZTtcbiAgICB0aGlzLnNob3dMb2NhbCA9IGZhbHNlO1xuICAgIHRoaXMudmlydHVhbEJhY2tncm91bmRJbnN0YW5jZSA9IG51bGw7XG5cbiAgICB0aGlzLnNlcnZlclRpbWVSZXF1ZXN0cyA9IDA7XG4gICAgdGhpcy50aW1lT2Zmc2V0cyA9IFtdO1xuICAgIHRoaXMuYXZnVGltZU9mZnNldCA9IDA7XG4gICAgdGhpcy5hZ29yYUNsaWVudCA9IG51bGw7XG4gICAgLy9BZ29yYVJUQy5sb2FkTW9kdWxlKFNlZ1BsdWdpbiwge30pO1xuXG4gICAgdGhpcy5lYXN5cnRjLnNldFBlZXJPcGVuTGlzdGVuZXIoY2xpZW50SWQgPT4ge1xuICAgICAgY29uc3QgY2xpZW50Q29ubmVjdGlvbiA9IHRoaXMuZWFzeXJ0Yy5nZXRQZWVyQ29ubmVjdGlvbkJ5VXNlcklkKGNsaWVudElkKTtcbiAgICAgIHRoaXMucmVtb3RlQ2xpZW50c1tjbGllbnRJZF0gPSBjbGllbnRDb25uZWN0aW9uO1xuICAgIH0pO1xuXG4gICAgdGhpcy5lYXN5cnRjLnNldFBlZXJDbG9zZWRMaXN0ZW5lcihjbGllbnRJZCA9PiB7XG4gICAgICBkZWxldGUgdGhpcy5yZW1vdGVDbGllbnRzW2NsaWVudElkXTtcbiAgICB9KTtcbiAgfVxuXG4gIHNldFNlcnZlclVybCh1cmwpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0U2VydmVyVXJsIFwiLCB1cmwpO1xuICAgIHRoaXMuZWFzeXJ0Yy5zZXRTb2NrZXRVcmwodXJsKTtcbiAgfVxuXG4gIHNldEFwcChhcHBOYW1lKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNldEFwcCBcIiwgYXBwTmFtZSk7XG4gICAgdGhpcy5hcHAgPSBhcHBOYW1lO1xuICAgIHRoaXMuYXBwaWQgPSBhcHBOYW1lO1xuICB9XG5cbiAgYXN5bmMgc2V0Um9vbShqc29uKSB7XG4gICAganNvbiA9IGpzb24ucmVwbGFjZSgvJy9nLCAnXCInKTtcbiAgICBjb25zdCBvYmogPSBKU09OLnBhcnNlKGpzb24pO1xuICAgIHRoaXMucm9vbSA9IG9iai5uYW1lO1xuXG4gICAgaWYgKG9iai52YmcpIHtcbiAgICAgICB0aGlzLnZiZyA9IG9iai52Ymc7XG4gICAgICAgaWYgKHRoaXMudmJnKSB7XG4gICAgICAgICAgQWdvcmFSVEMubG9hZE1vZHVsZShTZWdQbHVnaW4sIHt9KTtcbiAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG9iai5lbmFibGVBdmF0YXIpIHtcbiAgICAgIHRoaXMuZW5hYmxlQXZhdGFyID0gb2JqLmVuYWJsZUF2YXRhcjtcbiAgICB9XG5cbiAgICBpZiAob2JqLnNob3dMb2NhbCkge1xuICAgICAgdGhpcy5zaG93TG9jYWwgPSBvYmouc2hvd0xvY2FsO1xuICAgIH1cbiAgICB0aGlzLmVhc3lydGMuam9pblJvb20odGhpcy5yb29tLCBudWxsKTtcbiAgfVxuXG4gIC8vIG9wdGlvbnM6IHsgZGF0YWNoYW5uZWw6IGJvb2wsIGF1ZGlvOiBib29sLCB2aWRlbzogYm9vbCB9XG4gIHNldFdlYlJ0Y09wdGlvbnMob3B0aW9ucykge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXRXZWJSdGNPcHRpb25zIFwiLCBvcHRpb25zKTtcbiAgICAvLyB0aGlzLmVhc3lydGMuZW5hYmxlRGVidWcodHJ1ZSk7XG4gICAgdGhpcy5lYXN5cnRjLmVuYWJsZURhdGFDaGFubmVscyhvcHRpb25zLmRhdGFjaGFubmVsKTtcblxuICAgIC8vIHVzaW5nIEFnb3JhXG4gICAgdGhpcy5lbmFibGVWaWRlbyA9IG9wdGlvbnMudmlkZW87XG4gICAgdGhpcy5lbmFibGVBdWRpbyA9IG9wdGlvbnMuYXVkaW87XG5cbiAgICAvLyBub3QgZWFzeXJ0Y1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVWaWRlbyhmYWxzZSk7XG4gICAgdGhpcy5lYXN5cnRjLmVuYWJsZUF1ZGlvKGZhbHNlKTtcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlVmlkZW9SZWNlaXZlKGZhbHNlKTtcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlQXVkaW9SZWNlaXZlKGZhbHNlKTtcbiAgfVxuXG4gIHNldFNlcnZlckNvbm5lY3RMaXN0ZW5lcnMoc3VjY2Vzc0xpc3RlbmVyLCBmYWlsdXJlTGlzdGVuZXIpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0U2VydmVyQ29ubmVjdExpc3RlbmVycyBcIiwgc3VjY2Vzc0xpc3RlbmVyLCBmYWlsdXJlTGlzdGVuZXIpO1xuICAgIHRoaXMuY29ubmVjdFN1Y2Nlc3MgPSBzdWNjZXNzTGlzdGVuZXI7XG4gICAgdGhpcy5jb25uZWN0RmFpbHVyZSA9IGZhaWx1cmVMaXN0ZW5lcjtcbiAgfVxuXG4gIHNldFJvb21PY2N1cGFudExpc3RlbmVyKG9jY3VwYW50TGlzdGVuZXIpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0Um9vbU9jY3VwYW50TGlzdGVuZXIgXCIsIG9jY3VwYW50TGlzdGVuZXIpO1xuXG4gICAgdGhpcy5lYXN5cnRjLnNldFJvb21PY2N1cGFudExpc3RlbmVyKGZ1bmN0aW9uIChyb29tTmFtZSwgb2NjdXBhbnRzLCBwcmltYXJ5KSB7XG4gICAgICBvY2N1cGFudExpc3RlbmVyKG9jY3VwYW50cyk7XG4gICAgfSk7XG4gIH1cblxuICBzZXREYXRhQ2hhbm5lbExpc3RlbmVycyhvcGVuTGlzdGVuZXIsIGNsb3NlZExpc3RlbmVyLCBtZXNzYWdlTGlzdGVuZXIpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0RGF0YUNoYW5uZWxMaXN0ZW5lcnMgIFwiLCBvcGVuTGlzdGVuZXIsIGNsb3NlZExpc3RlbmVyLCBtZXNzYWdlTGlzdGVuZXIpO1xuICAgIHRoaXMuZWFzeXJ0Yy5zZXREYXRhQ2hhbm5lbE9wZW5MaXN0ZW5lcihvcGVuTGlzdGVuZXIpO1xuICAgIHRoaXMuZWFzeXJ0Yy5zZXREYXRhQ2hhbm5lbENsb3NlTGlzdGVuZXIoY2xvc2VkTGlzdGVuZXIpO1xuICAgIHRoaXMuZWFzeXJ0Yy5zZXRQZWVyTGlzdGVuZXIobWVzc2FnZUxpc3RlbmVyKTtcbiAgfVxuXG4gIHVwZGF0ZVRpbWVPZmZzZXQoKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHVwZGF0ZVRpbWVPZmZzZXQgXCIpO1xuICAgIGNvbnN0IGNsaWVudFNlbnRUaW1lID0gRGF0ZS5ub3coKSArIHRoaXMuYXZnVGltZU9mZnNldDtcblxuICAgIHJldHVybiBmZXRjaChkb2N1bWVudC5sb2NhdGlvbi5ocmVmLCB7IG1ldGhvZDogXCJIRUFEXCIsIGNhY2hlOiBcIm5vLWNhY2hlXCIgfSkudGhlbihyZXMgPT4ge1xuICAgICAgdmFyIHByZWNpc2lvbiA9IDEwMDA7XG4gICAgICB2YXIgc2VydmVyUmVjZWl2ZWRUaW1lID0gbmV3IERhdGUocmVzLmhlYWRlcnMuZ2V0KFwiRGF0ZVwiKSkuZ2V0VGltZSgpICsgcHJlY2lzaW9uIC8gMjtcbiAgICAgIHZhciBjbGllbnRSZWNlaXZlZFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgdmFyIHNlcnZlclRpbWUgPSBzZXJ2ZXJSZWNlaXZlZFRpbWUgKyAoY2xpZW50UmVjZWl2ZWRUaW1lIC0gY2xpZW50U2VudFRpbWUpIC8gMjtcbiAgICAgIHZhciB0aW1lT2Zmc2V0ID0gc2VydmVyVGltZSAtIGNsaWVudFJlY2VpdmVkVGltZTtcblxuICAgICAgdGhpcy5zZXJ2ZXJUaW1lUmVxdWVzdHMrKztcblxuICAgICAgaWYgKHRoaXMuc2VydmVyVGltZVJlcXVlc3RzIDw9IDEwKSB7XG4gICAgICAgIHRoaXMudGltZU9mZnNldHMucHVzaCh0aW1lT2Zmc2V0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudGltZU9mZnNldHNbdGhpcy5zZXJ2ZXJUaW1lUmVxdWVzdHMgJSAxMF0gPSB0aW1lT2Zmc2V0O1xuICAgICAgfVxuXG4gICAgICB0aGlzLmF2Z1RpbWVPZmZzZXQgPSB0aGlzLnRpbWVPZmZzZXRzLnJlZHVjZSgoYWNjLCBvZmZzZXQpID0+IGFjYyArPSBvZmZzZXQsIDApIC8gdGhpcy50aW1lT2Zmc2V0cy5sZW5ndGg7XG5cbiAgICAgIGlmICh0aGlzLnNlcnZlclRpbWVSZXF1ZXN0cyA+IDEwKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy51cGRhdGVUaW1lT2Zmc2V0KCksIDUgKiA2MCAqIDEwMDApOyAvLyBTeW5jIGNsb2NrIGV2ZXJ5IDUgbWludXRlcy5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudXBkYXRlVGltZU9mZnNldCgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgY29ubmVjdCgpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgY29ubmVjdCBcIik7XG4gICAgUHJvbWlzZS5hbGwoW3RoaXMudXBkYXRlVGltZU9mZnNldCgpLCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLl9jb25uZWN0KHJlc29sdmUsIHJlamVjdCk7XG4gICAgfSldKS50aGVuKChbXywgY2xpZW50SWRdKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIkJXNzMgY29ubmVjdGVkIFwiICsgY2xpZW50SWQpO1xuICAgICAgdGhpcy5jbGllbnRJZCA9IGNsaWVudElkO1xuICAgICAgdGhpcy5fbXlSb29tSm9pblRpbWUgPSB0aGlzLl9nZXRSb29tSm9pblRpbWUoY2xpZW50SWQpO1xuICAgICAgdGhpcy5jb25uZWN0QWdvcmEoKTtcbiAgICAgIHRoaXMuY29ubmVjdFN1Y2Nlc3MoY2xpZW50SWQpO1xuICAgIH0pLmNhdGNoKHRoaXMuY29ubmVjdEZhaWx1cmUpO1xuICB9XG5cbiAgc2hvdWxkU3RhcnRDb25uZWN0aW9uVG8oY2xpZW50KSB7XG4gICAgcmV0dXJuIHRoaXMuX215Um9vbUpvaW5UaW1lIDw9IGNsaWVudC5yb29tSm9pblRpbWU7XG4gIH1cblxuICBzdGFydFN0cmVhbUNvbm5lY3Rpb24oY2xpZW50SWQpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc3RhcnRTdHJlYW1Db25uZWN0aW9uIFwiLCBjbGllbnRJZCk7XG4gICAgdGhpcy5lYXN5cnRjLmNhbGwoY2xpZW50SWQsIGZ1bmN0aW9uIChjYWxsZXIsIG1lZGlhKSB7XG4gICAgICBpZiAobWVkaWEgPT09IFwiZGF0YWNoYW5uZWxcIikge1xuICAgICAgICBOQUYubG9nLndyaXRlKFwiU3VjY2Vzc2Z1bGx5IHN0YXJ0ZWQgZGF0YWNoYW5uZWwgdG8gXCIsIGNhbGxlcik7XG4gICAgICB9XG4gICAgfSwgZnVuY3Rpb24gKGVycm9yQ29kZSwgZXJyb3JUZXh0KSB7XG4gICAgICBOQUYubG9nLmVycm9yKGVycm9yQ29kZSwgZXJyb3JUZXh0KTtcbiAgICB9LCBmdW5jdGlvbiAod2FzQWNjZXB0ZWQpIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwid2FzIGFjY2VwdGVkPVwiICsgd2FzQWNjZXB0ZWQpO1xuICAgIH0pO1xuICB9XG5cbiAgY2xvc2VTdHJlYW1Db25uZWN0aW9uKGNsaWVudElkKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGNsb3NlU3RyZWFtQ29ubmVjdGlvbiBcIiwgY2xpZW50SWQpO1xuICAgIHRoaXMuZWFzeXJ0Yy5oYW5ndXAoY2xpZW50SWQpO1xuICB9XG5cbiAgc2VuZERhdGEoY2xpZW50SWQsIGRhdGFUeXBlLCBkYXRhKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNlbmREYXRhIFwiLCBjbGllbnRJZCwgZGF0YVR5cGUsIGRhdGEpO1xuICAgIC8vIHNlbmQgdmlhIHdlYnJ0YyBvdGhlcndpc2UgZmFsbGJhY2sgdG8gd2Vic29ja2V0c1xuICAgIHRoaXMuZWFzeXJ0Yy5zZW5kRGF0YShjbGllbnRJZCwgZGF0YVR5cGUsIGRhdGEpO1xuICB9XG5cbiAgc2VuZERhdGFHdWFyYW50ZWVkKGNsaWVudElkLCBkYXRhVHlwZSwgZGF0YSkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZW5kRGF0YUd1YXJhbnRlZWQgXCIsIGNsaWVudElkLCBkYXRhVHlwZSwgZGF0YSk7XG4gICAgdGhpcy5lYXN5cnRjLnNlbmREYXRhV1MoY2xpZW50SWQsIGRhdGFUeXBlLCBkYXRhKTtcbiAgfVxuXG4gIGJyb2FkY2FzdERhdGEoZGF0YVR5cGUsIGRhdGEpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgYnJvYWRjYXN0RGF0YSBcIiwgZGF0YVR5cGUsIGRhdGEpO1xuICAgIHZhciByb29tT2NjdXBhbnRzID0gdGhpcy5lYXN5cnRjLmdldFJvb21PY2N1cGFudHNBc01hcCh0aGlzLnJvb20pO1xuXG4gICAgLy8gSXRlcmF0ZSBvdmVyIHRoZSBrZXlzIG9mIHRoZSBlYXN5cnRjIHJvb20gb2NjdXBhbnRzIG1hcC5cbiAgICAvLyBnZXRSb29tT2NjdXBhbnRzQXNBcnJheSB1c2VzIE9iamVjdC5rZXlzIHdoaWNoIGFsbG9jYXRlcyBtZW1vcnkuXG4gICAgZm9yICh2YXIgcm9vbU9jY3VwYW50IGluIHJvb21PY2N1cGFudHMpIHtcbiAgICAgIGlmIChyb29tT2NjdXBhbnRzW3Jvb21PY2N1cGFudF0gJiYgcm9vbU9jY3VwYW50ICE9PSB0aGlzLmVhc3lydGMubXlFYXN5cnRjaWQpIHtcbiAgICAgICAgLy8gc2VuZCB2aWEgd2VicnRjIG90aGVyd2lzZSBmYWxsYmFjayB0byB3ZWJzb2NrZXRzXG4gICAgICAgIHRoaXMuZWFzeXJ0Yy5zZW5kRGF0YShyb29tT2NjdXBhbnQsIGRhdGFUeXBlLCBkYXRhKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBicm9hZGNhc3REYXRhR3VhcmFudGVlZChkYXRhVHlwZSwgZGF0YSkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBicm9hZGNhc3REYXRhR3VhcmFudGVlZCBcIiwgZGF0YVR5cGUsIGRhdGEpO1xuICAgIHZhciBkZXN0aW5hdGlvbiA9IHsgdGFyZ2V0Um9vbTogdGhpcy5yb29tIH07XG4gICAgdGhpcy5lYXN5cnRjLnNlbmREYXRhV1MoZGVzdGluYXRpb24sIGRhdGFUeXBlLCBkYXRhKTtcbiAgfVxuXG4gIGdldENvbm5lY3RTdGF0dXMoY2xpZW50SWQpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgZ2V0Q29ubmVjdFN0YXR1cyBcIiwgY2xpZW50SWQpO1xuICAgIHZhciBzdGF0dXMgPSB0aGlzLmVhc3lydGMuZ2V0Q29ubmVjdFN0YXR1cyhjbGllbnRJZCk7XG5cbiAgICBpZiAoc3RhdHVzID09IHRoaXMuZWFzeXJ0Yy5JU19DT05ORUNURUQpIHtcbiAgICAgIHJldHVybiBOQUYuYWRhcHRlcnMuSVNfQ09OTkVDVEVEO1xuICAgIH0gZWxzZSBpZiAoc3RhdHVzID09IHRoaXMuZWFzeXJ0Yy5OT1RfQ09OTkVDVEVEKSB7XG4gICAgICByZXR1cm4gTkFGLmFkYXB0ZXJzLk5PVF9DT05ORUNURUQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBOQUYuYWRhcHRlcnMuQ09OTkVDVElORztcbiAgICB9XG4gIH1cblxuICBnZXRNZWRpYVN0cmVhbShjbGllbnRJZCwgc3RyZWFtTmFtZSA9IFwiYXVkaW9cIikge1xuXG4gICAgY29uc29sZS5sb2coXCJCVzczIGdldE1lZGlhU3RyZWFtIFwiLCBjbGllbnRJZCwgc3RyZWFtTmFtZSk7XG5cbiAgICBpZiAodGhpcy5tZWRpYVN0cmVhbXNbY2xpZW50SWRdICYmIHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXVtzdHJlYW1OYW1lXSkge1xuICAgICAgTkFGLmxvZy53cml0ZShgQWxyZWFkeSBoYWQgJHtzdHJlYW1OYW1lfSBmb3IgJHtjbGllbnRJZH1gKTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5tZWRpYVN0cmVhbXNbY2xpZW50SWRdW3N0cmVhbU5hbWVdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgTkFGLmxvZy53cml0ZShgV2FpdGluZyBvbiAke3N0cmVhbU5hbWV9IGZvciAke2NsaWVudElkfWApO1xuXG4gICAgICAvLyBDcmVhdGUgaW5pdGlhbCBwZW5kaW5nTWVkaWFSZXF1ZXN0cyB3aXRoIGF1ZGlvfHZpZGVvIGFsaWFzXG4gICAgICBpZiAoIXRoaXMucGVuZGluZ01lZGlhUmVxdWVzdHMuaGFzKGNsaWVudElkKSkge1xuICAgICAgICBjb25zdCBwZW5kaW5nTWVkaWFSZXF1ZXN0cyA9IHt9O1xuXG4gICAgICAgIGNvbnN0IGF1ZGlvUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0cy5hdWRpbyA9IHsgcmVzb2x2ZSwgcmVqZWN0IH07XG4gICAgICAgIH0pLmNhdGNoKGUgPT4gTkFGLmxvZy53YXJuKGAke2NsaWVudElkfSBnZXRNZWRpYVN0cmVhbSBBdWRpbyBFcnJvcmAsIGUpKTtcbiAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHMuYXVkaW8ucHJvbWlzZSA9IGF1ZGlvUHJvbWlzZTtcblxuICAgICAgICBjb25zdCB2aWRlb1Byb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHMudmlkZW8gPSB7IHJlc29sdmUsIHJlamVjdCB9O1xuICAgICAgICB9KS5jYXRjaChlID0+IE5BRi5sb2cud2FybihgJHtjbGllbnRJZH0gZ2V0TWVkaWFTdHJlYW0gVmlkZW8gRXJyb3JgLCBlKSk7XG4gICAgICAgIHBlbmRpbmdNZWRpYVJlcXVlc3RzLnZpZGVvLnByb21pc2UgPSB2aWRlb1Byb21pc2U7XG5cbiAgICAgICAgdGhpcy5wZW5kaW5nTWVkaWFSZXF1ZXN0cy5zZXQoY2xpZW50SWQsIHBlbmRpbmdNZWRpYVJlcXVlc3RzKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcGVuZGluZ01lZGlhUmVxdWVzdHMgPSB0aGlzLnBlbmRpbmdNZWRpYVJlcXVlc3RzLmdldChjbGllbnRJZCk7XG5cbiAgICAgIC8vIENyZWF0ZSBpbml0aWFsIHBlbmRpbmdNZWRpYVJlcXVlc3RzIHdpdGggc3RyZWFtTmFtZVxuICAgICAgaWYgKCFwZW5kaW5nTWVkaWFSZXF1ZXN0c1tzdHJlYW1OYW1lXSkge1xuICAgICAgICBjb25zdCBzdHJlYW1Qcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIHBlbmRpbmdNZWRpYVJlcXVlc3RzW3N0cmVhbU5hbWVdID0geyByZXNvbHZlLCByZWplY3QgfTtcbiAgICAgICAgfSkuY2F0Y2goZSA9PiBOQUYubG9nLndhcm4oYCR7Y2xpZW50SWR9IGdldE1lZGlhU3RyZWFtIFwiJHtzdHJlYW1OYW1lfVwiIEVycm9yYCwgZSkpO1xuICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0c1tzdHJlYW1OYW1lXS5wcm9taXNlID0gc3RyZWFtUHJvbWlzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucGVuZGluZ01lZGlhUmVxdWVzdHMuZ2V0KGNsaWVudElkKVtzdHJlYW1OYW1lXS5wcm9taXNlO1xuICAgIH1cbiAgfVxuXG4gIHNldE1lZGlhU3RyZWFtKGNsaWVudElkLCBzdHJlYW0sIHN0cmVhbU5hbWUpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0TWVkaWFTdHJlYW0gXCIsIGNsaWVudElkLCBzdHJlYW0sIHN0cmVhbU5hbWUpO1xuICAgIGNvbnN0IHBlbmRpbmdNZWRpYVJlcXVlc3RzID0gdGhpcy5wZW5kaW5nTWVkaWFSZXF1ZXN0cy5nZXQoY2xpZW50SWQpOyAvLyByZXR1cm4gdW5kZWZpbmVkIGlmIHRoZXJlIGlzIG5vIGVudHJ5IGluIHRoZSBNYXBcbiAgICBjb25zdCBjbGllbnRNZWRpYVN0cmVhbXMgPSB0aGlzLm1lZGlhU3RyZWFtc1tjbGllbnRJZF0gPSB0aGlzLm1lZGlhU3RyZWFtc1tjbGllbnRJZF0gfHwge307XG5cbiAgICBpZiAoc3RyZWFtTmFtZSA9PT0gJ2RlZmF1bHQnKSB7XG4gICAgICAvLyBTYWZhcmkgZG9lc24ndCBsaWtlIGl0IHdoZW4geW91IHVzZSBhIG1peGVkIG1lZGlhIHN0cmVhbSB3aGVyZSBvbmUgb2YgdGhlIHRyYWNrcyBpcyBpbmFjdGl2ZSwgc28gd2VcbiAgICAgIC8vIHNwbGl0IHRoZSB0cmFja3MgaW50byB0d28gc3RyZWFtcy5cbiAgICAgIC8vIEFkZCBtZWRpYVN0cmVhbXMgYXVkaW8gc3RyZWFtTmFtZSBhbGlhc1xuICAgICAgY29uc3QgYXVkaW9UcmFja3MgPSBzdHJlYW0uZ2V0QXVkaW9UcmFja3MoKTtcbiAgICAgIGlmIChhdWRpb1RyYWNrcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGF1ZGlvU3RyZWFtID0gbmV3IE1lZGlhU3RyZWFtKCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgYXVkaW9UcmFja3MuZm9yRWFjaCh0cmFjayA9PiBhdWRpb1N0cmVhbS5hZGRUcmFjayh0cmFjaykpO1xuICAgICAgICAgIGNsaWVudE1lZGlhU3RyZWFtcy5hdWRpbyA9IGF1ZGlvU3RyZWFtO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgTkFGLmxvZy53YXJuKGAke2NsaWVudElkfSBzZXRNZWRpYVN0cmVhbSBcImF1ZGlvXCIgYWxpYXMgRXJyb3JgLCBlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlc29sdmUgdGhlIHByb21pc2UgZm9yIHRoZSB1c2VyJ3MgbWVkaWEgc3RyZWFtIGF1ZGlvIGFsaWFzIGlmIGl0IGV4aXN0cy5cbiAgICAgICAgaWYgKHBlbmRpbmdNZWRpYVJlcXVlc3RzKSBwZW5kaW5nTWVkaWFSZXF1ZXN0cy5hdWRpby5yZXNvbHZlKGF1ZGlvU3RyZWFtKTtcbiAgICAgIH1cblxuICAgICAgLy8gQWRkIG1lZGlhU3RyZWFtcyB2aWRlbyBzdHJlYW1OYW1lIGFsaWFzXG4gICAgICBjb25zdCB2aWRlb1RyYWNrcyA9IHN0cmVhbS5nZXRWaWRlb1RyYWNrcygpO1xuICAgICAgaWYgKHZpZGVvVHJhY2tzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgdmlkZW9TdHJlYW0gPSBuZXcgTWVkaWFTdHJlYW0oKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB2aWRlb1RyYWNrcy5mb3JFYWNoKHRyYWNrID0+IHZpZGVvU3RyZWFtLmFkZFRyYWNrKHRyYWNrKSk7XG4gICAgICAgICAgY2xpZW50TWVkaWFTdHJlYW1zLnZpZGVvID0gdmlkZW9TdHJlYW07XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBOQUYubG9nLndhcm4oYCR7Y2xpZW50SWR9IHNldE1lZGlhU3RyZWFtIFwidmlkZW9cIiBhbGlhcyBFcnJvcmAsIGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVzb2x2ZSB0aGUgcHJvbWlzZSBmb3IgdGhlIHVzZXIncyBtZWRpYSBzdHJlYW0gdmlkZW8gYWxpYXMgaWYgaXQgZXhpc3RzLlxuICAgICAgICBpZiAocGVuZGluZ01lZGlhUmVxdWVzdHMpIHBlbmRpbmdNZWRpYVJlcXVlc3RzLnZpZGVvLnJlc29sdmUodmlkZW9TdHJlYW0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjbGllbnRNZWRpYVN0cmVhbXNbc3RyZWFtTmFtZV0gPSBzdHJlYW07XG5cbiAgICAgIC8vIFJlc29sdmUgdGhlIHByb21pc2UgZm9yIHRoZSB1c2VyJ3MgbWVkaWEgc3RyZWFtIGJ5IFN0cmVhbU5hbWUgaWYgaXQgZXhpc3RzLlxuICAgICAgaWYgKHBlbmRpbmdNZWRpYVJlcXVlc3RzICYmIHBlbmRpbmdNZWRpYVJlcXVlc3RzW3N0cmVhbU5hbWVdKSB7XG4gICAgICAgIHBlbmRpbmdNZWRpYVJlcXVlc3RzW3N0cmVhbU5hbWVdLnJlc29sdmUoc3RyZWFtKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhZGRMb2NhbE1lZGlhU3RyZWFtKHN0cmVhbSwgc3RyZWFtTmFtZSkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBhZGRMb2NhbE1lZGlhU3RyZWFtIFwiLCBzdHJlYW0sIHN0cmVhbU5hbWUpO1xuICAgIGNvbnN0IGVhc3lydGMgPSB0aGlzLmVhc3lydGM7XG4gICAgc3RyZWFtTmFtZSA9IHN0cmVhbU5hbWUgfHwgc3RyZWFtLmlkO1xuICAgIHRoaXMuc2V0TWVkaWFTdHJlYW0oXCJsb2NhbFwiLCBzdHJlYW0sIHN0cmVhbU5hbWUpO1xuICAgIGVhc3lydGMucmVnaXN0ZXIzcmRQYXJ0eUxvY2FsTWVkaWFTdHJlYW0oc3RyZWFtLCBzdHJlYW1OYW1lKTtcblxuICAgIC8vIEFkZCBsb2NhbCBzdHJlYW0gdG8gZXhpc3RpbmcgY29ubmVjdGlvbnNcbiAgICBPYmplY3Qua2V5cyh0aGlzLnJlbW90ZUNsaWVudHMpLmZvckVhY2goY2xpZW50SWQgPT4ge1xuICAgICAgaWYgKGVhc3lydGMuZ2V0Q29ubmVjdFN0YXR1cyhjbGllbnRJZCkgIT09IGVhc3lydGMuTk9UX0NPTk5FQ1RFRCkge1xuICAgICAgICBlYXN5cnRjLmFkZFN0cmVhbVRvQ2FsbChjbGllbnRJZCwgc3RyZWFtTmFtZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICByZW1vdmVMb2NhbE1lZGlhU3RyZWFtKHN0cmVhbU5hbWUpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgcmVtb3ZlTG9jYWxNZWRpYVN0cmVhbSBcIiwgc3RyZWFtTmFtZSk7XG4gICAgdGhpcy5lYXN5cnRjLmNsb3NlTG9jYWxNZWRpYVN0cmVhbShzdHJlYW1OYW1lKTtcbiAgICBkZWxldGUgdGhpcy5tZWRpYVN0cmVhbXNbXCJsb2NhbFwiXVtzdHJlYW1OYW1lXTtcbiAgfVxuXG4gIGVuYWJsZU1pY3JvcGhvbmUoZW5hYmxlZCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBlbmFibGVNaWNyb3Bob25lIFwiLCBlbmFibGVkKTtcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlTWljcm9waG9uZShlbmFibGVkKTtcbiAgfVxuXG4gIGVuYWJsZUNhbWVyYShlbmFibGVkKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGVuYWJsZUNhbWVyYSBcIiwgZW5hYmxlZCk7XG4gICAgdGhpcy5lYXN5cnRjLmVuYWJsZUNhbWVyYShlbmFibGVkKTtcbiAgfVxuXG4gIGRpc2Nvbm5lY3QoKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGRpc2Nvbm5lY3QgXCIpO1xuICAgIHRoaXMuZWFzeXJ0Yy5kaXNjb25uZWN0KCk7XG4gIH1cblxuICBhc3luYyBoYW5kbGVVc2VyUHVibGlzaGVkKHVzZXIsIG1lZGlhVHlwZSkge31cblxuICBoYW5kbGVVc2VyVW5wdWJsaXNoZWQodXNlciwgbWVkaWFUeXBlKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGhhbmRsZVVzZXJVblB1Ymxpc2hlZCBcIik7XG4gIH1cblxuICBhc3luYyBjb25uZWN0QWdvcmEoKSB7XG4gICAgLy8gQWRkIGFuIGV2ZW50IGxpc3RlbmVyIHRvIHBsYXkgcmVtb3RlIHRyYWNrcyB3aGVuIHJlbW90ZSB1c2VyIHB1Ymxpc2hlcy5cbiAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICBpZiAodGhpcy5lbmFibGVWaWRlbyB8fCB0aGlzLmVuYWJsZUF1ZGlvKSB7XG4gICAgICB0aGlzLmFnb3JhQ2xpZW50ID0gQWdvcmFSVEMuY3JlYXRlQ2xpZW50KHsgbW9kZTogXCJydGNcIiwgY29kZWM6IFwidnA4XCIgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYWdvcmFDbGllbnQgPSBBZ29yYVJUQy5jcmVhdGVDbGllbnQoeyBtb2RlOiBcImxpdmVcIiwgY29kZWM6IFwidnA4XCIgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5hZ29yYUNsaWVudC5vbihcInVzZXItcHVibGlzaGVkXCIsIGFzeW5jICh1c2VyLCBtZWRpYVR5cGUpID0+IHtcblxuICAgICAgbGV0IGNsaWVudElkID0gdXNlci51aWQ7XG4gICAgICBjb25zb2xlLmxvZyhcIkJXNzMgaGFuZGxlVXNlclB1Ymxpc2hlZCBcIiArIGNsaWVudElkICsgXCIgXCIgKyBtZWRpYVR5cGUsIHRoYXQuYWdvcmFDbGllbnQpO1xuICAgICAgYXdhaXQgdGhhdC5hZ29yYUNsaWVudC5zdWJzY3JpYmUodXNlciwgbWVkaWFUeXBlKTtcbiAgICAgIGNvbnNvbGUubG9nKFwiQlc3MyBoYW5kbGVVc2VyUHVibGlzaGVkMiBcIiArIGNsaWVudElkICsgXCIgXCIgKyB0aGF0LmFnb3JhQ2xpZW50KTtcblxuICAgICAgY29uc3QgcGVuZGluZ01lZGlhUmVxdWVzdHMgPSB0aGF0LnBlbmRpbmdNZWRpYVJlcXVlc3RzLmdldChjbGllbnRJZCk7XG4gICAgICBjb25zdCBjbGllbnRNZWRpYVN0cmVhbXMgPSB0aGF0Lm1lZGlhU3RyZWFtc1tjbGllbnRJZF0gPSB0aGF0Lm1lZGlhU3RyZWFtc1tjbGllbnRJZF0gfHwge307XG5cbiAgICAgIGlmIChtZWRpYVR5cGUgPT09ICdhdWRpbycpIHtcbiAgICAgICAgY29uc3QgYXVkaW9TdHJlYW0gPSBuZXcgTWVkaWFTdHJlYW0oKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJ1c2VyLmF1ZGlvVHJhY2sgXCIsIHVzZXIuYXVkaW9UcmFjay5fbWVkaWFTdHJlYW1UcmFjayk7XG4gICAgICAgIGF1ZGlvU3RyZWFtLmFkZFRyYWNrKHVzZXIuYXVkaW9UcmFjay5fbWVkaWFTdHJlYW1UcmFjayk7XG4gICAgICAgIGNsaWVudE1lZGlhU3RyZWFtcy5hdWRpbyA9IGF1ZGlvU3RyZWFtO1xuICAgICAgICBpZiAocGVuZGluZ01lZGlhUmVxdWVzdHMpIHBlbmRpbmdNZWRpYVJlcXVlc3RzLmF1ZGlvLnJlc29sdmUoYXVkaW9TdHJlYW0pO1xuICAgICAgfVxuXG4gICAgICBpZiAobWVkaWFUeXBlID09PSAndmlkZW8nKSB7XG4gICAgICAgIGNvbnN0IHZpZGVvU3RyZWFtID0gbmV3IE1lZGlhU3RyZWFtKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwidXNlci52aWRlb1RyYWNrIFwiLCB1c2VyLnZpZGVvVHJhY2suX21lZGlhU3RyZWFtVHJhY2spO1xuICAgICAgICB2aWRlb1N0cmVhbS5hZGRUcmFjayh1c2VyLnZpZGVvVHJhY2suX21lZGlhU3RyZWFtVHJhY2spO1xuICAgICAgICBjbGllbnRNZWRpYVN0cmVhbXMudmlkZW8gPSB2aWRlb1N0cmVhbTtcbiAgICAgICAgaWYgKHBlbmRpbmdNZWRpYVJlcXVlc3RzKSBwZW5kaW5nTWVkaWFSZXF1ZXN0cy52aWRlby5yZXNvbHZlKHZpZGVvU3RyZWFtKTtcbiAgICAgICAgLy91c2VyLnZpZGVvVHJhY2tcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuYWdvcmFDbGllbnQub24oXCJ1c2VyLXVucHVibGlzaGVkXCIsIHRoYXQuaGFuZGxlVXNlclVucHVibGlzaGVkKTtcblxuICAgIGNvbnNvbGUubG9nKFwiY29ubmVjdCBhZ29yYSBcIik7XG4gICAgLy8gSm9pbiBhIGNoYW5uZWwgYW5kIGNyZWF0ZSBsb2NhbCB0cmFja3MuIEJlc3QgcHJhY3RpY2UgaXMgdG8gdXNlIFByb21pc2UuYWxsIGFuZCBydW4gdGhlbSBjb25jdXJyZW50bHkuXG4gICAgLy8gb1xuXG5cbiBpZiAodGhpcy5lbmFibGVBdmF0YXIpIHtcbiAgICAgICAgdmFyIHN0cmVhbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2FudmFzXCIpLmNhcHR1cmVTdHJlYW0oMzApO1xuICAgICAgICBbdGhpcy51c2VyaWQsIHRoaXMubG9jYWxUcmFja3MuYXVkaW9UcmFjaywgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgdGhpcy5hZ29yYUNsaWVudC5qb2luKHRoaXMuYXBwaWQsIHRoaXMucm9vbSwgdGhpcy50b2tlbiB8fCBudWxsLCB0aGlzLmNsaWVudElkIHx8IG51bGwpLFxuICAgICAgICBBZ29yYVJUQy5jcmVhdGVNaWNyb3Bob25lQXVkaW9UcmFjaygpLCBBZ29yYVJUQy5jcmVhdGVDdXN0b21WaWRlb1RyYWNrKHsgbWVkaWFTdHJlYW1UcmFjazogc3RyZWFtLmdldFZpZGVvVHJhY2tzKClbMF0gfSldKTtcbiB9XG4gZWxzZSBpZiAodGhpcy5lbmFibGVWaWRlbyAmJiB0aGlzLmVuYWJsZUF1ZGlvKSB7XG4gICAgICBbdGhpcy51c2VyaWQsIHRoaXMubG9jYWxUcmFja3MuYXVkaW9UcmFjaywgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgIHRoaXMuYWdvcmFDbGllbnQuam9pbih0aGlzLmFwcGlkLCB0aGlzLnJvb20sIHRoaXMudG9rZW4gfHwgbnVsbCwgdGhpcy5jbGllbnRJZCB8fCBudWxsKSxcbiAgICAgIEFnb3JhUlRDLmNyZWF0ZU1pY3JvcGhvbmVBdWRpb1RyYWNrKCksIEFnb3JhUlRDLmNyZWF0ZUNhbWVyYVZpZGVvVHJhY2soXCIzNjBwXzRcIildKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuZW5hYmxlVmlkZW8pIHtcbiAgICAgIFt0aGlzLnVzZXJpZCwgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgIC8vIEpvaW4gdGhlIGNoYW5uZWwuXG4gICAgICB0aGlzLmFnb3JhQ2xpZW50LmpvaW4odGhpcy5hcHBpZCwgdGhpcy5yb29tLCB0aGlzLnRva2VuIHx8IG51bGwsIHRoaXMuY2xpZW50SWQgfHwgbnVsbCksIEFnb3JhUlRDLmNyZWF0ZUNhbWVyYVZpZGVvVHJhY2soXCIzNjBwXzRcIildKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuZW5hYmxlQXVkaW8pIHtcbiAgICAgIFt0aGlzLnVzZXJpZCwgdGhpcy5sb2NhbFRyYWNrcy5hdWRpb1RyYWNrXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgIC8vIEpvaW4gdGhlIGNoYW5uZWwuXG4gICAgICB0aGlzLmFnb3JhQ2xpZW50LmpvaW4odGhpcy5hcHBpZCwgdGhpcy5yb29tLCB0aGlzLnRva2VuIHx8IG51bGwsIHRoaXMuY2xpZW50SWQgfHwgbnVsbCksIEFnb3JhUlRDLmNyZWF0ZU1pY3JvcGhvbmVBdWRpb1RyYWNrKCldKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy51c2VyaWQgPSBhd2FpdCB0aGlzLmFnb3JhQ2xpZW50LmpvaW4odGhpcy5hcHBpZCwgdGhpcy5yb29tLCB0aGlzLnRva2VuIHx8IG51bGwsIHRoaXMuY2xpZW50SWQgfHwgbnVsbCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZW5hYmxlVmlkZW8gJiYgdGhpcy5zaG93TG9jYWwpIHtcbiAgICAgIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjay5wbGF5KFwibG9jYWwtcGxheWVyXCIpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmVuYWJsZVZpZGVvIHx8IHRoaXMuZW5hYmxlQXVkaW8gfHwgdGhpcy5lbmFibGVBdmF0YXIpIHtcblxuICAgICAgYXdhaXQgdGhpcy5hZ29yYUNsaWVudC5wdWJsaXNoKE9iamVjdC52YWx1ZXModGhpcy5sb2NhbFRyYWNrcykpO1xuICAgICAgY29uc29sZS5sb2coXCJwdWJsaXNoIHN1Y2Nlc3NcIik7XG5cbiAgICAgIC8vIFB1Ymxpc2ggdGhlIGxvY2FsIHZpZGVvIGFuZCBhdWRpbyB0cmFja3MgdG8gdGhlIGNoYW5uZWwuXG4gICAgICBpZiAodGhpcy5lbmFibGVWaWRlbyAmJiB0aGlzLnZiZyAmJiB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2spIHtcbiAgICAgICAgY29uc3QgaW1nRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuICAgICAgICBpbWdFbGVtZW50Lm9ubG9hZCA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgICBpZiAoIXRoaXMudmlydHVhbEJhY2tncm91bmRJbnN0YW5jZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJTRUcgSU5JVCBcIiwgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrKTtcbiAgICAgICAgICAgIHRoaXMudmlydHVhbEJhY2tncm91bmRJbnN0YW5jZSA9IGF3YWl0IFNlZ1BsdWdpbi5pbmplY3QodGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrLCBcIi9hc3NldHMvd2FzbXNcIikuY2F0Y2goY29uc29sZS5lcnJvcik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlNFRyBJTklURURcIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMudmlydHVhbEJhY2tncm91bmRJbnN0YW5jZS5zZXRPcHRpb25zKHsgZW5hYmxlOiB0cnVlLCBiYWNrZ3JvdW5kOiBpbWdFbGVtZW50IH0pO1xuICAgICAgICB9O1xuICAgICAgICBpbWdFbGVtZW50LnNyYyA9ICdkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUFRQUFBQURDQUlBQUFBN2xqbVJBQUFBRDBsRVFWUjRYbU5nK00rQVFEZzVBT2s5Qy9Wa29tellBQUFBQUVsRlRrU3VRbUNDJztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUHJpdmF0ZXNcbiAgICovXG5cbiAgYXN5bmMgX2Nvbm5lY3QoY29ubmVjdFN1Y2Nlc3MsIGNvbm5lY3RGYWlsdXJlKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgYXdhaXQgdGhhdC5lYXN5cnRjLmNvbm5lY3QodGhhdC5hcHAsIGNvbm5lY3RTdWNjZXNzLCBjb25uZWN0RmFpbHVyZSk7XG5cbiAgICAvKlxuICAgICAgIHRoaXMuZWFzeXJ0Yy5zZXRTdHJlYW1BY2NlcHRvcih0aGlzLnNldE1lZGlhU3RyZWFtLmJpbmQodGhpcykpO1xuICAgICAgIHRoaXMuZWFzeXJ0Yy5zZXRPblN0cmVhbUNsb3NlZChmdW5jdGlvbihjbGllbnRJZCwgc3RyZWFtLCBzdHJlYW1OYW1lKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLm1lZGlhU3RyZWFtc1tjbGllbnRJZF1bc3RyZWFtTmFtZV07XG4gICAgICB9KTtcbiAgICAgICBpZiAodGhhdC5lYXN5cnRjLmF1ZGlvRW5hYmxlZCB8fCB0aGF0LmVhc3lydGMudmlkZW9FbmFibGVkKSB7XG4gICAgICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhKHtcbiAgICAgICAgICB2aWRlbzogdGhhdC5lYXN5cnRjLnZpZGVvRW5hYmxlZCxcbiAgICAgICAgICBhdWRpbzogdGhhdC5lYXN5cnRjLmF1ZGlvRW5hYmxlZFxuICAgICAgICB9KS50aGVuKFxuICAgICAgICAgIGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgICAgICAgICAgdGhhdC5hZGRMb2NhbE1lZGlhU3RyZWFtKHN0cmVhbSwgXCJkZWZhdWx0XCIpO1xuICAgICAgICAgICAgdGhhdC5lYXN5cnRjLmNvbm5lY3QodGhhdC5hcHAsIGNvbm5lY3RTdWNjZXNzLCBjb25uZWN0RmFpbHVyZSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBmdW5jdGlvbihlcnJvckNvZGUsIGVycm1lc2cpIHtcbiAgICAgICAgICAgIE5BRi5sb2cuZXJyb3IoZXJyb3JDb2RlLCBlcnJtZXNnKTtcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGF0LmVhc3lydGMuY29ubmVjdCh0aGF0LmFwcCwgY29ubmVjdFN1Y2Nlc3MsIGNvbm5lY3RGYWlsdXJlKTtcbiAgICAgIH1cbiAgICAgICovXG4gIH1cblxuICBfZ2V0Um9vbUpvaW5UaW1lKGNsaWVudElkKSB7XG4gICAgdmFyIG15Um9vbUlkID0gdGhpcy5yb29tOyAvL05BRi5yb29tO1xuICAgIHZhciBqb2luVGltZSA9IHRoaXMuZWFzeXJ0Yy5nZXRSb29tT2NjdXBhbnRzQXNNYXAobXlSb29tSWQpW2NsaWVudElkXS5yb29tSm9pblRpbWU7XG4gICAgcmV0dXJuIGpvaW5UaW1lO1xuICB9XG5cbiAgZ2V0U2VydmVyVGltZSgpIHtcbiAgICByZXR1cm4gRGF0ZS5ub3coKSArIHRoaXMuYXZnVGltZU9mZnNldDtcbiAgfVxufVxuXG5OQUYuYWRhcHRlcnMucmVnaXN0ZXIoXCJhZ29yYXJ0Y1wiLCBBZ29yYVJ0Y0FkYXB0ZXIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFnb3JhUnRjQWRhcHRlcjtcbiJdLCJzb3VyY2VSb290IjoiIn0=