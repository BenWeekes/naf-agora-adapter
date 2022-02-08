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

    this.localTracks = { videoTrack: null, audioTrack: null };
    this.token = null;
    this.clientId = null;
    this.uid = null;
    this.vbg = false;
    this.virtualBackgroundInstance = null;

    this.serverTimeRequests = 0;
    this.timeOffsets = [];
    this.avgTimeOffset = 0;
    this.agoraClient = null;
    AgoraRTC.loadModule(SegPlugin, {});

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


    if (this.enableVideo && this.enableAudio) {
      [this.userid, this.localTracks.audioTrack, this.localTracks.videoTrack] = await Promise.all([
      // Join the channel.
      this.agoraClient.join(this.appid, this.room, this.token || null, this.clientId || null),
      // Create tracks to the local microphone and camera.
      AgoraRTC.createMicrophoneAudioTrack(), AgoraRTC.createCameraVideoTrack("360p_4")]);
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

    if (this.enableVideo || this.enableAudio) {

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIl0sIm5hbWVzIjpbIkFnb3JhUnRjQWRhcHRlciIsImNvbnN0cnVjdG9yIiwiZWFzeXJ0YyIsImNvbnNvbGUiLCJsb2ciLCJ3aW5kb3ciLCJhcHAiLCJyb29tIiwidXNlcmlkIiwiYXBwaWQiLCJtZWRpYVN0cmVhbXMiLCJyZW1vdGVDbGllbnRzIiwicGVuZGluZ01lZGlhUmVxdWVzdHMiLCJNYXAiLCJlbmFibGVWaWRlbyIsImVuYWJsZUF1ZGlvIiwibG9jYWxUcmFja3MiLCJ2aWRlb1RyYWNrIiwiYXVkaW9UcmFjayIsInRva2VuIiwiY2xpZW50SWQiLCJ1aWQiLCJ2YmciLCJ2aXJ0dWFsQmFja2dyb3VuZEluc3RhbmNlIiwic2VydmVyVGltZVJlcXVlc3RzIiwidGltZU9mZnNldHMiLCJhdmdUaW1lT2Zmc2V0IiwiYWdvcmFDbGllbnQiLCJBZ29yYVJUQyIsImxvYWRNb2R1bGUiLCJTZWdQbHVnaW4iLCJzZXRQZWVyT3Blbkxpc3RlbmVyIiwiY2xpZW50Q29ubmVjdGlvbiIsImdldFBlZXJDb25uZWN0aW9uQnlVc2VySWQiLCJzZXRQZWVyQ2xvc2VkTGlzdGVuZXIiLCJzZXRTZXJ2ZXJVcmwiLCJ1cmwiLCJzZXRTb2NrZXRVcmwiLCJzZXRBcHAiLCJhcHBOYW1lIiwic2V0Um9vbSIsImpzb24iLCJyZXBsYWNlIiwib2JqIiwiSlNPTiIsInBhcnNlIiwibmFtZSIsImpvaW5Sb29tIiwic2V0V2ViUnRjT3B0aW9ucyIsIm9wdGlvbnMiLCJlbmFibGVEYXRhQ2hhbm5lbHMiLCJkYXRhY2hhbm5lbCIsInZpZGVvIiwiYXVkaW8iLCJlbmFibGVWaWRlb1JlY2VpdmUiLCJlbmFibGVBdWRpb1JlY2VpdmUiLCJzZXRTZXJ2ZXJDb25uZWN0TGlzdGVuZXJzIiwic3VjY2Vzc0xpc3RlbmVyIiwiZmFpbHVyZUxpc3RlbmVyIiwiY29ubmVjdFN1Y2Nlc3MiLCJjb25uZWN0RmFpbHVyZSIsInNldFJvb21PY2N1cGFudExpc3RlbmVyIiwib2NjdXBhbnRMaXN0ZW5lciIsInJvb21OYW1lIiwib2NjdXBhbnRzIiwicHJpbWFyeSIsInNldERhdGFDaGFubmVsTGlzdGVuZXJzIiwib3Blbkxpc3RlbmVyIiwiY2xvc2VkTGlzdGVuZXIiLCJtZXNzYWdlTGlzdGVuZXIiLCJzZXREYXRhQ2hhbm5lbE9wZW5MaXN0ZW5lciIsInNldERhdGFDaGFubmVsQ2xvc2VMaXN0ZW5lciIsInNldFBlZXJMaXN0ZW5lciIsInVwZGF0ZVRpbWVPZmZzZXQiLCJjbGllbnRTZW50VGltZSIsIkRhdGUiLCJub3ciLCJmZXRjaCIsImRvY3VtZW50IiwibG9jYXRpb24iLCJocmVmIiwibWV0aG9kIiwiY2FjaGUiLCJ0aGVuIiwicmVzIiwicHJlY2lzaW9uIiwic2VydmVyUmVjZWl2ZWRUaW1lIiwiaGVhZGVycyIsImdldCIsImdldFRpbWUiLCJjbGllbnRSZWNlaXZlZFRpbWUiLCJzZXJ2ZXJUaW1lIiwidGltZU9mZnNldCIsInB1c2giLCJyZWR1Y2UiLCJhY2MiLCJvZmZzZXQiLCJsZW5ndGgiLCJzZXRUaW1lb3V0IiwiY29ubmVjdCIsIlByb21pc2UiLCJhbGwiLCJyZXNvbHZlIiwicmVqZWN0IiwiX2Nvbm5lY3QiLCJfIiwiX215Um9vbUpvaW5UaW1lIiwiX2dldFJvb21Kb2luVGltZSIsImNvbm5lY3RBZ29yYSIsImNhdGNoIiwic2hvdWxkU3RhcnRDb25uZWN0aW9uVG8iLCJjbGllbnQiLCJyb29tSm9pblRpbWUiLCJzdGFydFN0cmVhbUNvbm5lY3Rpb24iLCJjYWxsIiwiY2FsbGVyIiwibWVkaWEiLCJOQUYiLCJ3cml0ZSIsImVycm9yQ29kZSIsImVycm9yVGV4dCIsImVycm9yIiwid2FzQWNjZXB0ZWQiLCJjbG9zZVN0cmVhbUNvbm5lY3Rpb24iLCJoYW5ndXAiLCJzZW5kRGF0YSIsImRhdGFUeXBlIiwiZGF0YSIsInNlbmREYXRhR3VhcmFudGVlZCIsInNlbmREYXRhV1MiLCJicm9hZGNhc3REYXRhIiwicm9vbU9jY3VwYW50cyIsImdldFJvb21PY2N1cGFudHNBc01hcCIsInJvb21PY2N1cGFudCIsIm15RWFzeXJ0Y2lkIiwiYnJvYWRjYXN0RGF0YUd1YXJhbnRlZWQiLCJkZXN0aW5hdGlvbiIsInRhcmdldFJvb20iLCJnZXRDb25uZWN0U3RhdHVzIiwic3RhdHVzIiwiSVNfQ09OTkVDVEVEIiwiYWRhcHRlcnMiLCJOT1RfQ09OTkVDVEVEIiwiQ09OTkVDVElORyIsImdldE1lZGlhU3RyZWFtIiwic3RyZWFtTmFtZSIsImhhcyIsImF1ZGlvUHJvbWlzZSIsImUiLCJ3YXJuIiwicHJvbWlzZSIsInZpZGVvUHJvbWlzZSIsInNldCIsInN0cmVhbVByb21pc2UiLCJzZXRNZWRpYVN0cmVhbSIsInN0cmVhbSIsImNsaWVudE1lZGlhU3RyZWFtcyIsImF1ZGlvVHJhY2tzIiwiZ2V0QXVkaW9UcmFja3MiLCJhdWRpb1N0cmVhbSIsIk1lZGlhU3RyZWFtIiwiZm9yRWFjaCIsInRyYWNrIiwiYWRkVHJhY2siLCJ2aWRlb1RyYWNrcyIsImdldFZpZGVvVHJhY2tzIiwidmlkZW9TdHJlYW0iLCJhZGRMb2NhbE1lZGlhU3RyZWFtIiwiaWQiLCJyZWdpc3RlcjNyZFBhcnR5TG9jYWxNZWRpYVN0cmVhbSIsIk9iamVjdCIsImtleXMiLCJhZGRTdHJlYW1Ub0NhbGwiLCJyZW1vdmVMb2NhbE1lZGlhU3RyZWFtIiwiY2xvc2VMb2NhbE1lZGlhU3RyZWFtIiwiZW5hYmxlTWljcm9waG9uZSIsImVuYWJsZWQiLCJlbmFibGVDYW1lcmEiLCJkaXNjb25uZWN0IiwiaGFuZGxlVXNlclB1Ymxpc2hlZCIsInVzZXIiLCJtZWRpYVR5cGUiLCJoYW5kbGVVc2VyVW5wdWJsaXNoZWQiLCJ0aGF0IiwiY3JlYXRlQ2xpZW50IiwibW9kZSIsImNvZGVjIiwib24iLCJzdWJzY3JpYmUiLCJfbWVkaWFTdHJlYW1UcmFjayIsImpvaW4iLCJjcmVhdGVNaWNyb3Bob25lQXVkaW9UcmFjayIsImNyZWF0ZUNhbWVyYVZpZGVvVHJhY2siLCJwdWJsaXNoIiwidmFsdWVzIiwiaW1nRWxlbWVudCIsImNyZWF0ZUVsZW1lbnQiLCJvbmxvYWQiLCJpbmplY3QiLCJzZXRPcHRpb25zIiwiZW5hYmxlIiwiYmFja2dyb3VuZCIsInNyYyIsIm15Um9vbUlkIiwiam9pblRpbWUiLCJnZXRTZXJ2ZXJUaW1lIiwicmVnaXN0ZXIiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiO1FBQUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7OztRQUdBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwwQ0FBMEMsZ0NBQWdDO1FBQzFFO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0Esd0RBQXdELGtCQUFrQjtRQUMxRTtRQUNBLGlEQUFpRCxjQUFjO1FBQy9EOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQSx5Q0FBeUMsaUNBQWlDO1FBQzFFLGdIQUFnSCxtQkFBbUIsRUFBRTtRQUNySTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDJCQUEyQiwwQkFBMEIsRUFBRTtRQUN2RCxpQ0FBaUMsZUFBZTtRQUNoRDtRQUNBO1FBQ0E7O1FBRUE7UUFDQSxzREFBc0QsK0RBQStEOztRQUVySDtRQUNBOzs7UUFHQTtRQUNBOzs7Ozs7Ozs7Ozs7O0FDakZBLE1BQU1BLGVBQU4sQ0FBc0I7O0FBRXBCQyxjQUFZQyxPQUFaLEVBQXFCO0FBQ2xCQyxZQUFRQyxHQUFSLENBQVksbUJBQVosRUFBaUNGLE9BQWpDOztBQUVELFNBQUtBLE9BQUwsR0FBZUEsV0FBV0csT0FBT0gsT0FBakM7QUFDQSxTQUFLSSxHQUFMLEdBQVcsU0FBWDtBQUNBLFNBQUtDLElBQUwsR0FBWSxTQUFaO0FBQ0EsU0FBS0MsTUFBTCxHQUFZLENBQVo7QUFDQSxTQUFL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TCxLQUFhLEtBQUtsRCxhQUF6QjtBQUNEO0FBbGZtQjs7QUFxZnRCMkYsSUFBSXdCLFFBQUosQ0FBYWlFLFFBQWIsQ0FBc0IsVUFBdEIsRUFBa0M5TSxlQUFsQzs7QUFFQStNLE9BQU9DLE9BQVAsR0FBaUJoTixlQUFqQixDIiwiZmlsZSI6Im5hZi1hZ29yYS1hZGFwdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvaW5kZXguanNcIik7XG4iLCJcbmNsYXNzIEFnb3JhUnRjQWRhcHRlciB7XG5cbiAgY29uc3RydWN0b3IoZWFzeXJ0Yykge1xuICAgICBjb25zb2xlLmxvZyhcIkJXNzMgY29uc3RydWN0b3IgXCIsIGVhc3lydGMpO1xuXG4gICAgdGhpcy5lYXN5cnRjID0gZWFzeXJ0YyB8fCB3aW5kb3cuZWFzeXJ0YztcbiAgICB0aGlzLmFwcCA9IFwiZGVmYXVsdFwiO1xuICAgIHRoaXMucm9vbSA9IFwiZGVmYXVsdFwiO1xuICAgIHRoaXMudXNlcmlkPTA7XG4gICAgdGhpcy5hcHBpZD1udWxsO1xuXG4gICAgdGhpcy5tZWRpYVN0cmVhbXMgPSB7fTtcbiAgICB0aGlzLnJlbW90ZUNsaWVudHMgPSB7fTtcbiAgICB0aGlzLnBlbmRpbmdNZWRpYVJlcXVlc3RzID0gbmV3IE1hcCgpO1xuXG4gICAgdGhpcy5lbmFibGVWaWRlbz1mYWxzZTtcbiAgICB0aGlzLmVuYWJsZUF1ZGlvPWZhbHNlO1xuXG4gICAgdGhpcy5sb2NhbFRyYWNrcyA9IHsgdmlkZW9UcmFjazogbnVsbCwgYXVkaW9UcmFjazogbnVsbCB9O1xuICAgIHRoaXMudG9rZW49bnVsbDtcbiAgICB0aGlzLmNsaWVudElkPW51bGw7XG4gICAgdGhpcy51aWQ9bnVsbDtcbiAgICB0aGlzLnZiZz1mYWxzZTtcbiAgICB0aGlzLnZpcnR1YWxCYWNrZ3JvdW5kSW5zdGFuY2U9bnVsbDtcblx0IFxuICAgIHRoaXMuc2VydmVyVGltZVJlcXVlc3RzID0gMDtcbiAgICB0aGlzLnRpbWVPZmZzZXRzID0gW107XG4gICAgdGhpcy5hdmdUaW1lT2Zmc2V0ID0gMDtcbiAgICB0aGlzLmFnb3JhQ2xpZW50PW51bGw7XG4gICAgQWdvcmFSVEMubG9hZE1vZHVsZShTZWdQbHVnaW4sIHt9KTtcblxuICAgIHRoaXMuZWFzeXJ0Yy5zZXRQZWVyT3Blbkxpc3RlbmVyKChjbGllbnRJZCkgPT4ge1xuICAgICAgY29uc3QgY2xpZW50Q29ubmVjdGlvbiA9IHRoaXMuZWFzeXJ0Yy5nZXRQZWVyQ29ubmVjdGlvbkJ5VXNlcklkKGNsaWVudElkKTtcbiAgICAgIHRoaXMucmVtb3RlQ2xpZW50c1tjbGllbnRJZF0gPSBjbGllbnRDb25uZWN0aW9uO1xuICAgIH0pO1xuXG4gICAgdGhpcy5lYXN5cnRjLnNldFBlZXJDbG9zZWRMaXN0ZW5lcigoY2xpZW50SWQpID0+IHtcbiAgICAgIGRlbGV0ZSB0aGlzLnJlbW90ZUNsaWVudHNbY2xpZW50SWRdO1xuICAgIH0pO1xuICB9XG5cbiAgc2V0U2VydmVyVXJsKHVybCkge1xuICAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0U2VydmVyVXJsIFwiLCB1cmwpO1xuICAgIHRoaXMuZWFzeXJ0Yy5zZXRTb2NrZXRVcmwodXJsKTtcbiAgfVxuXG4gIHNldEFwcChhcHBOYW1lKSB7XG4gICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXRBcHAgXCIsIGFwcE5hbWUpO1xuICAgIHRoaXMuYXBwID0gYXBwTmFtZTtcbiAgICB0aGlzLmFwcGlkID0gYXBwTmFtZTtcbiAgfVxuXG4gIGFzeW5jIHNldFJvb20oanNvbikge1xuICAgIGpzb249anNvbi5yZXBsYWNlKC8nL2csICdcIicpO1xuICAgIGNvbnN0IG9iaiA9IEpTT04ucGFyc2UoanNvbik7XG4gICAgdGhpcy5yb29tID0gb2JqLm5hbWU7XG5cbiAgICBpZiAob2JqLnZiZykge1xuICBcdCAgdGhpcy52Ymc9b2JqLnZiZztcbiAgICB9XG4gICAgdGhpcy5lYXN5cnRjLmpvaW5Sb29tKHRoaXMucm9vbSwgbnVsbCk7XG4gIH1cblxuICAvLyBvcHRpb25zOiB7IGRhdGFjaGFubmVsOiBib29sLCBhdWRpbzogYm9vbCwgdmlkZW86IGJvb2wgfVxuICBzZXRXZWJSdGNPcHRpb25zKG9wdGlvbnMpIHtcbiAgICAgY29uc29sZS5sb2coXCJCVzczIHNldFdlYlJ0Y09wdGlvbnMgXCIsIG9wdGlvbnMpO1xuICAgIC8vIHRoaXMuZWFzeXJ0Yy5lbmFibGVEZWJ1Zyh0cnVlKTtcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlRGF0YUNoYW5uZWxzKG9wdGlvbnMuZGF0YWNoYW5uZWwpO1xuXG4gICAgLy8gdXNpbmcgQWdvcmFcbiAgICB0aGlzLmVuYWJsZVZpZGVvPW9wdGlvbnMudmlkZW87XG4gICAgdGhpcy5lbmFibGVBdWRpbz1vcHRpb25zLmF1ZGlvO1xuXHRcbiAgICAvLyBub3QgZWFzeXJ0Y1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVWaWRlbyhmYWxzZSk7XG4gICAgdGhpcy5lYXN5cnRjLmVuYWJsZUF1ZGlvKGZhbHNlKTtcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlVmlkZW9SZWNlaXZlKGZhbHNlKTtcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlQXVkaW9SZWNlaXZlKGZhbHNlKTtcbiAgfVxuXG4gIHNldFNlcnZlckNvbm5lY3RMaXN0ZW5lcnMoc3VjY2Vzc0xpc3RlbmVyLCBmYWlsdXJlTGlzdGVuZXIpIHtcbiAgICAgY29uc29sZS5sb2coXCJCVzczIHNldFNlcnZlckNvbm5lY3RMaXN0ZW5lcnMgXCIsIHN1Y2Nlc3NMaXN0ZW5lciwgZmFpbHVyZUxpc3RlbmVyKTtcbiAgICB0aGlzLmNvbm5lY3RTdWNjZXNzID0gc3VjY2Vzc0xpc3RlbmVyO1xuICAgIHRoaXMuY29ubmVjdEZhaWx1cmUgPSBmYWlsdXJlTGlzdGVuZXI7XG4gIH1cblxuICBzZXRSb29tT2NjdXBhbnRMaXN0ZW5lcihvY2N1cGFudExpc3RlbmVyKSB7XG4gICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXRSb29tT2NjdXBhbnRMaXN0ZW5lciBcIiwgb2NjdXBhbnRMaXN0ZW5lcik7XG5cdCAgXG4gICAgdGhpcy5lYXN5cnRjLnNldFJvb21PY2N1cGFudExpc3RlbmVyKGZ1bmN0aW9uKFxuICAgICAgcm9vbU5hbWUsXG4gICAgICBvY2N1cGFudHMsXG4gICAgICBwcmltYXJ5XG4gICAgKSB7XG4gICAgICBvY2N1cGFudExpc3RlbmVyKG9jY3VwYW50cyk7XG4gICAgfSk7XG4gIH1cblxuICBzZXREYXRhQ2hhbm5lbExpc3RlbmVycyhvcGVuTGlzdGVuZXIsIGNsb3NlZExpc3RlbmVyLCBtZXNzYWdlTGlzdGVuZXIpIHtcbiAgICAgY29uc29sZS5sb2coXCJCVzczIHNldERhdGFDaGFubmVsTGlzdGVuZXJzICBcIiwgb3Blbkxpc3RlbmVyLCBjbG9zZWRMaXN0ZW5lciwgbWVzc2FnZUxpc3RlbmVyKTtcbiAgICB0aGlzLmVhc3lydGMuc2V0RGF0YUNoYW5uZWxPcGVuTGlzdGVuZXIob3Blbkxpc3RlbmVyKTtcbiAgICB0aGlzLmVhc3lydGMuc2V0RGF0YUNoYW5uZWxDbG9zZUxpc3RlbmVyKGNsb3NlZExpc3RlbmVyKTtcbiAgICB0aGlzLmVhc3lydGMuc2V0UGVlckxpc3RlbmVyKG1lc3NhZ2VMaXN0ZW5lcik7XG4gIH1cblxuICB1cGRhdGVUaW1lT2Zmc2V0KCkge1xuICAgICBjb25zb2xlLmxvZyhcIkJXNzMgdXBkYXRlVGltZU9mZnNldCBcIik7XG4gICAgY29uc3QgY2xpZW50U2VudFRpbWUgPSBEYXRlLm5vdygpICsgdGhpcy5hdmdUaW1lT2Zmc2V0O1xuXG4gICAgcmV0dXJuIGZldGNoKGRvY3VtZW50LmxvY2F0aW9uLmhyZWYsIHsgbWV0aG9kOiBcIkhFQURcIiwgY2FjaGU6IFwibm8tY2FjaGVcIiB9KVxuICAgICAgLnRoZW4ocmVzID0+IHtcbiAgICAgICAgdmFyIHByZWNpc2lvbiA9IDEwMDA7XG4gICAgICAgIHZhciBzZXJ2ZXJSZWNlaXZlZFRpbWUgPSBuZXcgRGF0ZShyZXMuaGVhZGVycy5nZXQoXCJEYXRlXCIpKS5nZXRUaW1lKCkgKyAocHJlY2lzaW9uIC8gMik7XG4gICAgICAgIHZhciBjbGllbnRSZWNlaXZlZFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICB2YXIgc2VydmVyVGltZSA9IHNlcnZlclJlY2VpdmVkVGltZSArICgoY2xpZW50UmVjZWl2ZWRUaW1lIC0gY2xpZW50U2VudFRpbWUpIC8gMik7XG4gICAgICAgIHZhciB0aW1lT2Zmc2V0ID0gc2VydmVyVGltZSAtIGNsaWVudFJlY2VpdmVkVGltZTtcblxuICAgICAgICB0aGlzLnNlcnZlclRpbWVSZXF1ZXN0cysrO1xuXG4gICAgICAgIGlmICh0aGlzLnNlcnZlclRpbWVSZXF1ZXN0cyA8PSAxMCkge1xuICAgICAgICAgIHRoaXMudGltZU9mZnNldHMucHVzaCh0aW1lT2Zmc2V0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnRpbWVPZmZzZXRzW3RoaXMuc2VydmVyVGltZVJlcXVlc3RzICUgMTBdID0gdGltZU9mZnNldDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYXZnVGltZU9mZnNldCA9IHRoaXMudGltZU9mZnNldHMucmVkdWNlKChhY2MsIG9mZnNldCkgPT4gYWNjICs9IG9mZnNldCwgMCkgLyB0aGlzLnRpbWVPZmZzZXRzLmxlbmd0aDtcblxuICAgICAgICBpZiAodGhpcy5zZXJ2ZXJUaW1lUmVxdWVzdHMgPiAxMCkge1xuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy51cGRhdGVUaW1lT2Zmc2V0KCksIDUgKiA2MCAqIDEwMDApOyAvLyBTeW5jIGNsb2NrIGV2ZXJ5IDUgbWludXRlcy5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnVwZGF0ZVRpbWVPZmZzZXQoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cblxuICBjb25uZWN0KCkge1xuICAgICBjb25zb2xlLmxvZyhcIkJXNzMgY29ubmVjdCBcIik7XG4gICAgUHJvbWlzZS5hbGwoW1xuICAgICAgdGhpcy51cGRhdGVUaW1lT2Zmc2V0KCksXG4gICAgICBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIHRoaXMuX2Nvbm5lY3QocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgIH0pXG4gICAgXSkudGhlbigoW18sIGNsaWVudElkXSkgPT4ge1xuICAgICBjb25zb2xlLmxvZyhcIkJXNzMgY29ubmVjdGVkIFwiK2NsaWVudElkKTtcbiAgICAgIHRoaXMuY2xpZW50SWQ9Y2xpZW50SWQ7XG4gICAgICB0aGlzLl9teVJvb21Kb2luVGltZSA9IHRoaXMuX2dldFJvb21Kb2luVGltZShjbGllbnRJZCk7XG4gICAgICB0aGlzLmNvbm5lY3RBZ29yYSgpO1xuICAgICAgdGhpcy5jb25uZWN0U3VjY2VzcyhjbGllbnRJZCk7XG4gICAgfSkuY2F0Y2godGhpcy5jb25uZWN0RmFpbHVyZSk7XG4gIH1cblxuICBzaG91bGRTdGFydENvbm5lY3Rpb25UbyhjbGllbnQpIHtcbiAgICByZXR1cm4gdGhpcy5fbXlSb29tSm9pblRpbWUgPD0gY2xpZW50LnJvb21Kb2luVGltZTtcbiAgfVxuXG4gIHN0YXJ0U3RyZWFtQ29ubmVjdGlvbihjbGllbnRJZCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzdGFydFN0cmVhbUNvbm5lY3Rpb24gXCIsICBjbGllbnRJZCk7XG4gICAgdGhpcy5lYXN5cnRjLmNhbGwoXG4gICAgICBjbGllbnRJZCxcbiAgICAgIGZ1bmN0aW9uKGNhbGxlciwgbWVkaWEpIHtcbiAgICAgICAgaWYgKG1lZGlhID09PSBcImRhdGFjaGFubmVsXCIpIHtcbiAgICAgICAgICBOQUYubG9nLndyaXRlKFwiU3VjY2Vzc2Z1bGx5IHN0YXJ0ZWQgZGF0YWNoYW5uZWwgdG8gXCIsIGNhbGxlcik7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbihlcnJvckNvZGUsIGVycm9yVGV4dCkge1xuICAgICAgICBOQUYubG9nLmVycm9yKGVycm9yQ29kZSwgZXJyb3JUZXh0KTtcbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbih3YXNBY2NlcHRlZCkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcIndhcyBhY2NlcHRlZD1cIiArIHdhc0FjY2VwdGVkKTtcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgY2xvc2VTdHJlYW1Db25uZWN0aW9uKGNsaWVudElkKSB7XG4gICAgIGNvbnNvbGUubG9nKFwiQlc3MyBjbG9zZVN0cmVhbUNvbm5lY3Rpb24gXCIsIGNsaWVudElkKTtcbiAgICB0aGlzLmVhc3lydGMuaGFuZ3VwKGNsaWVudElkKTtcbiAgfVxuXG4gIHNlbmREYXRhKGNsaWVudElkLCBkYXRhVHlwZSwgZGF0YSkge1xuICAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2VuZERhdGEgXCIsIGNsaWVudElkLCBkYXRhVHlwZSwgZGF0YSk7XG4gICAgLy8gc2VuZCB2aWEgd2VicnRjIG90aGVyd2lzZSBmYWxsYmFjayB0byB3ZWJzb2NrZXRzXG4gICAgdGhpcy5lYXN5cnRjLnNlbmREYXRhKGNsaWVudElkLCBkYXRhVHlwZSwgZGF0YSk7XG4gIH1cblxuICBzZW5kRGF0YUd1YXJhbnRlZWQoY2xpZW50SWQsIGRhdGFUeXBlLCBkYXRhKSB7XG4gICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZW5kRGF0YUd1YXJhbnRlZWQgXCIsIGNsaWVudElkLCAgZGF0YVR5cGUsIGRhdGEpO1xuICAgIHRoaXMuZWFzeXJ0Yy5zZW5kRGF0YVdTKGNsaWVudElkLCBkYXRhVHlwZSwgZGF0YSk7XG4gIH1cblxuICBicm9hZGNhc3REYXRhKGRhdGFUeXBlLCBkYXRhKSB7XG4gICAgIGNvbnNvbGUubG9nKFwiQlc3MyBicm9hZGNhc3REYXRhIFwiLCBkYXRhVHlwZSwgZGF0YSk7XG4gICAgdmFyIHJvb21PY2N1cGFudHMgPSB0aGlzLmVhc3lydGMuZ2V0Um9vbU9jY3VwYW50c0FzTWFwKHRoaXMucm9vbSk7XG5cbiAgICAvLyBJdGVyYXRlIG92ZXIgdGhlIGtleXMgb2YgdGhlIGVhc3lydGMgcm9vbSBvY2N1cGFudHMgbWFwLlxuICAgIC8vIGdldFJvb21PY2N1cGFudHNBc0FycmF5IHVzZXMgT2JqZWN0LmtleXMgd2hpY2ggYWxsb2NhdGVzIG1lbW9yeS5cbiAgICBmb3IgKHZhciByb29tT2NjdXBhbnQgaW4gcm9vbU9jY3VwYW50cykge1xuICAgICAgaWYgKFxuICAgICAgICByb29tT2NjdXBhbnRzW3Jvb21PY2N1cGFudF0gJiZcbiAgICAgICAgcm9vbU9jY3VwYW50ICE9PSB0aGlzLmVhc3lydGMubXlFYXN5cnRjaWRcbiAgICAgICkge1xuICAgICAgICAvLyBzZW5kIHZpYSB3ZWJydGMgb3RoZXJ3aXNlIGZhbGxiYWNrIHRvIHdlYnNvY2tldHNcbiAgICAgICAgdGhpcy5lYXN5cnRjLnNlbmREYXRhKHJvb21PY2N1cGFudCwgZGF0YVR5cGUsIGRhdGEpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGJyb2FkY2FzdERhdGFHdWFyYW50ZWVkKGRhdGFUeXBlLCBkYXRhKSB7XG4gICAgIGNvbnNvbGUubG9nKFwiQlc3MyBicm9hZGNhc3REYXRhR3VhcmFudGVlZCBcIiwgZGF0YVR5cGUsIGRhdGEpO1xuICAgIHZhciBkZXN0aW5hdGlvbiA9IHsgdGFyZ2V0Um9vbTogdGhpcy5yb29tIH07XG4gICAgdGhpcy5lYXN5cnRjLnNlbmREYXRhV1MoZGVzdGluYXRpb24sIGRhdGFUeXBlLCBkYXRhKTtcbiAgfVxuXG4gIGdldENvbm5lY3RTdGF0dXMoY2xpZW50SWQpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgZ2V0Q29ubmVjdFN0YXR1cyBcIiwgY2xpZW50SWQpO1xuICAgIHZhciBzdGF0dXMgPSB0aGlzLmVhc3lydGMuZ2V0Q29ubmVjdFN0YXR1cyhjbGllbnRJZCk7XG5cbiAgICBpZiAoc3RhdHVzID09IHRoaXMuZWFzeXJ0Yy5JU19DT05ORUNURUQpIHtcbiAgICAgIHJldHVybiBOQUYuYWRhcHRlcnMuSVNfQ09OTkVDVEVEO1xuICAgIH0gZWxzZSBpZiAoc3RhdHVzID09IHRoaXMuZWFzeXJ0Yy5OT1RfQ09OTkVDVEVEKSB7XG4gICAgICByZXR1cm4gTkFGLmFkYXB0ZXJzLk5PVF9DT05ORUNURUQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBOQUYuYWRhcHRlcnMuQ09OTkVDVElORztcbiAgICB9XG4gIH1cblxuICBnZXRNZWRpYVN0cmVhbShjbGllbnRJZCwgc3RyZWFtTmFtZSA9IFwiYXVkaW9cIikge1xuXG4gICAgIGNvbnNvbGUubG9nKFwiQlc3MyBnZXRNZWRpYVN0cmVhbSBcIiwgY2xpZW50SWQsIHN0cmVhbU5hbWUpO1xuXG4gICAgaWYgKHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXSAmJiB0aGlzLm1lZGlhU3RyZWFtc1tjbGllbnRJZF1bc3RyZWFtTmFtZV0pIHtcbiAgICAgIE5BRi5sb2cud3JpdGUoYEFscmVhZHkgaGFkICR7c3RyZWFtTmFtZX0gZm9yICR7Y2xpZW50SWR9YCk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXVtzdHJlYW1OYW1lXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIE5BRi5sb2cud3JpdGUoYFdhaXRpbmcgb24gJHtzdHJlYW1OYW1lfSBmb3IgJHtjbGllbnRJZH1gKTtcblxuICAgICAgLy8gQ3JlYXRlIGluaXRpYWwgcGVuZGluZ01lZGlhUmVxdWVzdHMgd2l0aCBhdWRpb3x2aWRlbyBhbGlhc1xuICAgICAgaWYgKCF0aGlzLnBlbmRpbmdNZWRpYVJlcXVlc3RzLmhhcyhjbGllbnRJZCkpIHtcbiAgICAgICAgY29uc3QgcGVuZGluZ01lZGlhUmVxdWVzdHMgPSB7fTtcblxuICAgICAgICBjb25zdCBhdWRpb1Byb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHMuYXVkaW8gPSB7IHJlc29sdmUsIHJlamVjdCB9O1xuICAgICAgICB9KS5jYXRjaChlID0+IE5BRi5sb2cud2FybihgJHtjbGllbnRJZH0gZ2V0TWVkaWFTdHJlYW0gQXVkaW8gRXJyb3JgLCBlKSk7XG4gICAgICAgIHBlbmRpbmdNZWRpYVJlcXVlc3RzLmF1ZGlvLnByb21pc2UgPSBhdWRpb1Byb21pc2U7XG5cbiAgICAgICAgY29uc3QgdmlkZW9Qcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIHBlbmRpbmdNZWRpYVJlcXVlc3RzLnZpZGVvID0geyByZXNvbHZlLCByZWplY3QgfTtcbiAgICAgICAgfSkuY2F0Y2goZSA9PiBOQUYubG9nLndhcm4oYCR7Y2xpZW50SWR9IGdldE1lZGlhU3RyZWFtIFZpZGVvIEVycm9yYCwgZSkpO1xuICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0cy52aWRlby5wcm9taXNlID0gdmlkZW9Qcm9taXNlO1xuXG4gICAgICAgIHRoaXMucGVuZGluZ01lZGlhUmVxdWVzdHMuc2V0KGNsaWVudElkLCBwZW5kaW5nTWVkaWFSZXF1ZXN0cyk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBlbmRpbmdNZWRpYVJlcXVlc3RzID0gdGhpcy5wZW5kaW5nTWVkaWFSZXF1ZXN0cy5nZXQoY2xpZW50SWQpO1xuXG4gICAgICAvLyBDcmVhdGUgaW5pdGlhbCBwZW5kaW5nTWVkaWFSZXF1ZXN0cyB3aXRoIHN0cmVhbU5hbWVcbiAgICAgIGlmICghcGVuZGluZ01lZGlhUmVxdWVzdHNbc3RyZWFtTmFtZV0pIHtcbiAgICAgICAgY29uc3Qgc3RyZWFtUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0c1tzdHJlYW1OYW1lXSA9IHsgcmVzb2x2ZSwgcmVqZWN0IH07XG4gICAgICAgIH0pLmNhdGNoKGUgPT4gTkFGLmxvZy53YXJuKGAke2NsaWVudElkfSBnZXRNZWRpYVN0cmVhbSBcIiR7c3RyZWFtTmFtZX1cIiBFcnJvcmAsIGUpKVxuICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0c1tzdHJlYW1OYW1lXS5wcm9taXNlID0gc3RyZWFtUHJvbWlzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucGVuZGluZ01lZGlhUmVxdWVzdHMuZ2V0KGNsaWVudElkKVtzdHJlYW1OYW1lXS5wcm9taXNlO1xuICAgIH1cbiAgfVxuXG4gIHNldE1lZGlhU3RyZWFtKGNsaWVudElkLCBzdHJlYW0sIHN0cmVhbU5hbWUpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0TWVkaWFTdHJlYW0gXCIsIGNsaWVudElkLCBzdHJlYW0sIHN0cmVhbU5hbWUpO1xuICAgIGNvbnN0IHBlbmRpbmdNZWRpYVJlcXVlc3RzID0gdGhpcy5wZW5kaW5nTWVkaWFSZXF1ZXN0cy5nZXQoY2xpZW50SWQpOyAvLyByZXR1cm4gdW5kZWZpbmVkIGlmIHRoZXJlIGlzIG5vIGVudHJ5IGluIHRoZSBNYXBcbiAgICBjb25zdCBjbGllbnRNZWRpYVN0cmVhbXMgPSB0aGlzLm1lZGlhU3RyZWFtc1tjbGllbnRJZF0gPSB0aGlzLm1lZGlhU3RyZWFtc1tjbGllbnRJZF0gfHwge307XG5cbiAgICBpZiAoc3RyZWFtTmFtZSA9PT0gJ2RlZmF1bHQnKSB7XG4gICAgICAvLyBTYWZhcmkgZG9lc24ndCBsaWtlIGl0IHdoZW4geW91IHVzZSBhIG1peGVkIG1lZGlhIHN0cmVhbSB3aGVyZSBvbmUgb2YgdGhlIHRyYWNrcyBpcyBpbmFjdGl2ZSwgc28gd2VcbiAgICAgIC8vIHNwbGl0IHRoZSB0cmFja3MgaW50byB0d28gc3RyZWFtcy5cbiAgICAgIC8vIEFkZCBtZWRpYVN0cmVhbXMgYXVkaW8gc3RyZWFtTmFtZSBhbGlhc1xuICAgICAgY29uc3QgYXVkaW9UcmFja3MgPSBzdHJlYW0uZ2V0QXVkaW9UcmFja3MoKTtcbiAgICAgIGlmIChhdWRpb1RyYWNrcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGF1ZGlvU3RyZWFtID0gbmV3IE1lZGlhU3RyZWFtKCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgYXVkaW9UcmFja3MuZm9yRWFjaCh0cmFjayA9PiBhdWRpb1N0cmVhbS5hZGRUcmFjayh0cmFjaykpO1xuICAgICAgICAgIGNsaWVudE1lZGlhU3RyZWFtcy5hdWRpbyA9IGF1ZGlvU3RyZWFtO1xuICAgICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgICBOQUYubG9nLndhcm4oYCR7Y2xpZW50SWR9IHNldE1lZGlhU3RyZWFtIFwiYXVkaW9cIiBhbGlhcyBFcnJvcmAsIGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVzb2x2ZSB0aGUgcHJvbWlzZSBmb3IgdGhlIHVzZXIncyBtZWRpYSBzdHJlYW0gYXVkaW8gYWxpYXMgaWYgaXQgZXhpc3RzLlxuICAgICAgICBpZiAocGVuZGluZ01lZGlhUmVxdWVzdHMpIHBlbmRpbmdNZWRpYVJlcXVlc3RzLmF1ZGlvLnJlc29sdmUoYXVkaW9TdHJlYW0pO1xuICAgICAgfVxuXG4gICAgICAvLyBBZGQgbWVkaWFTdHJlYW1zIHZpZGVvIHN0cmVhbU5hbWUgYWxpYXNcbiAgICAgIGNvbnN0IHZpZGVvVHJhY2tzID0gc3RyZWFtLmdldFZpZGVvVHJhY2tzKCk7XG4gICAgICBpZiAodmlkZW9UcmFja3MubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCB2aWRlb1N0cmVhbSA9IG5ldyBNZWRpYVN0cmVhbSgpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHZpZGVvVHJhY2tzLmZvckVhY2godHJhY2sgPT4gdmlkZW9TdHJlYW0uYWRkVHJhY2sodHJhY2spKTtcbiAgICAgICAgICBjbGllbnRNZWRpYVN0cmVhbXMudmlkZW8gPSB2aWRlb1N0cmVhbTtcbiAgICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICAgTkFGLmxvZy53YXJuKGAke2NsaWVudElkfSBzZXRNZWRpYVN0cmVhbSBcInZpZGVvXCIgYWxpYXMgRXJyb3JgLCBlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlc29sdmUgdGhlIHByb21pc2UgZm9yIHRoZSB1c2VyJ3MgbWVkaWEgc3RyZWFtIHZpZGVvIGFsaWFzIGlmIGl0IGV4aXN0cy5cbiAgICAgICAgaWYgKHBlbmRpbmdNZWRpYVJlcXVlc3RzKSBwZW5kaW5nTWVkaWFSZXF1ZXN0cy52aWRlby5yZXNvbHZlKHZpZGVvU3RyZWFtKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY2xpZW50TWVkaWFTdHJlYW1zW3N0cmVhbU5hbWVdID0gc3RyZWFtO1xuXG4gICAgICAvLyBSZXNvbHZlIHRoZSBwcm9taXNlIGZvciB0aGUgdXNlcidzIG1lZGlhIHN0cmVhbSBieSBTdHJlYW1OYW1lIGlmIGl0IGV4aXN0cy5cbiAgICAgIGlmIChwZW5kaW5nTWVkaWFSZXF1ZXN0cyAmJiBwZW5kaW5nTWVkaWFSZXF1ZXN0c1tzdHJlYW1OYW1lXSkge1xuICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0c1tzdHJlYW1OYW1lXS5yZXNvbHZlKHN0cmVhbSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYWRkTG9jYWxNZWRpYVN0cmVhbShzdHJlYW0sIHN0cmVhbU5hbWUpIHtcbiAgICAgY29uc29sZS5sb2coXCJCVzczIGFkZExvY2FsTWVkaWFTdHJlYW0gXCIsIHN0cmVhbSwgc3RyZWFtTmFtZSk7XG4gICAgY29uc3QgZWFzeXJ0YyA9IHRoaXMuZWFzeXJ0YztcbiAgICBzdHJlYW1OYW1lID0gc3RyZWFtTmFtZSB8fCBzdHJlYW0uaWQ7XG4gICAgdGhpcy5zZXRNZWRpYVN0cmVhbShcImxvY2FsXCIsIHN0cmVhbSwgc3RyZWFtTmFtZSk7XG4gICAgZWFzeXJ0Yy5yZWdpc3RlcjNyZFBhcnR5TG9jYWxNZWRpYVN0cmVhbShzdHJlYW0sIHN0cmVhbU5hbWUpO1xuXG4gICAgLy8gQWRkIGxvY2FsIHN0cmVhbSB0byBleGlzdGluZyBjb25uZWN0aW9uc1xuICAgIE9iamVjdC5rZXlzKHRoaXMucmVtb3RlQ2xpZW50cykuZm9yRWFjaCgoY2xpZW50SWQpID0+IHtcbiAgICAgIGlmIChlYXN5cnRjLmdldENvbm5lY3RTdGF0dXMoY2xpZW50SWQpICE9PSBlYXN5cnRjLk5PVF9DT05ORUNURUQpIHtcbiAgICAgICAgZWFzeXJ0Yy5hZGRTdHJlYW1Ub0NhbGwoY2xpZW50SWQsIHN0cmVhbU5hbWUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcmVtb3ZlTG9jYWxNZWRpYVN0cmVhbShzdHJlYW1OYW1lKSBcblx0e1xuICAgICBjb25zb2xlLmxvZyhcIkJXNzMgcmVtb3ZlTG9jYWxNZWRpYVN0cmVhbSBcIiwgc3RyZWFtTmFtZSk7XG4gICAgdGhpcy5lYXN5cnRjLmNsb3NlTG9jYWxNZWRpYVN0cmVhbShzdHJlYW1OYW1lKTtcbiAgICBkZWxldGUgdGhpcy5tZWRpYVN0cmVhbXNbXCJsb2NhbFwiXVtzdHJlYW1OYW1lXTtcbiAgfVxuXG4gIGVuYWJsZU1pY3JvcGhvbmUoZW5hYmxlZCkge1xuICAgICBjb25zb2xlLmxvZyhcIkJXNzMgZW5hYmxlTWljcm9waG9uZSBcIiwgZW5hYmxlZCk7XG4gICAgdGhpcy5lYXN5cnRjLmVuYWJsZU1pY3JvcGhvbmUoZW5hYmxlZCk7XG4gIH1cblxuICBlbmFibGVDYW1lcmEoZW5hYmxlZCkge1xuICAgICBjb25zb2xlLmxvZyhcIkJXNzMgZW5hYmxlQ2FtZXJhIFwiLCBlbmFibGVkKTtcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlQ2FtZXJhKGVuYWJsZWQpO1xuICB9XG5cbiAgZGlzY29ubmVjdCgpIHtcbiAgICAgY29uc29sZS5sb2coXCJCVzczIGRpc2Nvbm5lY3QgXCIpO1xuICAgIHRoaXMuZWFzeXJ0Yy5kaXNjb25uZWN0KCk7XG4gIH1cblxuYXN5bmMgaGFuZGxlVXNlclB1Ymxpc2hlZCh1c2VyLCBtZWRpYVR5cGUpIHtcblxuXG59XG5cbiBoYW5kbGVVc2VyVW5wdWJsaXNoZWQodXNlciwgbWVkaWFUeXBlKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGhhbmRsZVVzZXJVblB1Ymxpc2hlZCBcIik7XG59XG5cbmFzeW5jIGNvbm5lY3RBZ29yYSgpIHtcbiAgLy8gQWRkIGFuIGV2ZW50IGxpc3RlbmVyIHRvIHBsYXkgcmVtb3RlIHRyYWNrcyB3aGVuIHJlbW90ZSB1c2VyIHB1Ymxpc2hlcy5cbiAgdmFyIHRoYXQ9dGhpcztcblxuICBpZiAodGhpcy5lbmFibGVWaWRlbyB8fCB0aGlzLmVuYWJsZUF1ZGlvKSB7XG4gICAgdGhpcy5hZ29yYUNsaWVudD0gQWdvcmFSVEMuY3JlYXRlQ2xpZW50KHttb2RlOiBcInJ0Y1wiLCBjb2RlYzogXCJ2cDhcIn0pO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuYWdvcmFDbGllbnQ9IEFnb3JhUlRDLmNyZWF0ZUNsaWVudCh7bW9kZTogXCJsaXZlXCIsIGNvZGVjOiBcInZwOFwifSk7XG4gIH1cblxuICB0aGlzLmFnb3JhQ2xpZW50Lm9uKFwidXNlci1wdWJsaXNoZWRcIiwgYXN5bmMgKHVzZXIsIG1lZGlhVHlwZSkgPT4ge1xuXG4gICBsZXQgY2xpZW50SWQgPSB1c2VyLnVpZDtcbiAgIGNvbnNvbGUubG9nKFwiQlc3MyBoYW5kbGVVc2VyUHVibGlzaGVkIFwiK2NsaWVudElkK1wiIFwiK21lZGlhVHlwZSx0aGF0LmFnb3JhQ2xpZW50KTtcbiAgIGF3YWl0IHRoYXQuYWdvcmFDbGllbnQuc3Vic2NyaWJlKHVzZXIsIG1lZGlhVHlwZSk7XG4gICBjb25zb2xlLmxvZyhcIkJXNzMgaGFuZGxlVXNlclB1Ymxpc2hlZDIgXCIrY2xpZW50SWQrXCIgXCIrdGhhdC5hZ29yYUNsaWVudCk7XG5cbiAgIGNvbnN0IHBlbmRpbmdNZWRpYVJlcXVlc3RzID0gdGhhdC5wZW5kaW5nTWVkaWFSZXF1ZXN0cy5nZXQoY2xpZW50SWQpOyBcbiAgIGNvbnN0IGNsaWVudE1lZGlhU3RyZWFtcyA9IHRoYXQubWVkaWFTdHJlYW1zW2NsaWVudElkXSA9IHRoYXQubWVkaWFTdHJlYW1zW2NsaWVudElkXSB8fCB7fTtcblxuICBpZiAobWVkaWFUeXBlID09PSAnYXVkaW8nKSB7XG4gICAgIGNvbnN0IGF1ZGlvU3RyZWFtID0gbmV3IE1lZGlhU3RyZWFtKCk7XG4gICAgIGNvbnNvbGUubG9nKFwidXNlci5hdWRpb1RyYWNrIFwiLHVzZXIuYXVkaW9UcmFjay5fbWVkaWFTdHJlYW1UcmFjayk7XG4gICAgIGF1ZGlvU3RyZWFtLmFkZFRyYWNrKHVzZXIuYXVkaW9UcmFjay5fbWVkaWFTdHJlYW1UcmFjayk7XG4gICAgIGNsaWVudE1lZGlhU3RyZWFtcy5hdWRpbyA9IGF1ZGlvU3RyZWFtO1xuICAgICBpZiAocGVuZGluZ01lZGlhUmVxdWVzdHMpIHBlbmRpbmdNZWRpYVJlcXVlc3RzLmF1ZGlvLnJlc29sdmUoYXVkaW9TdHJlYW0pO1xuICB9IFxuXG4gIGlmIChtZWRpYVR5cGUgPT09ICd2aWRlbycpIHtcbiAgICAgY29uc3QgdmlkZW9TdHJlYW0gPSBuZXcgTWVkaWFTdHJlYW0oKTtcbiAgICAgY29uc29sZS5sb2coXCJ1c2VyLnZpZGVvVHJhY2sgXCIsdXNlci52aWRlb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrKTtcbiAgICAgdmlkZW9TdHJlYW0uYWRkVHJhY2sodXNlci52aWRlb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrKTtcbiAgICAgY2xpZW50TWVkaWFTdHJlYW1zLnZpZGVvID0gdmlkZW9TdHJlYW07XG4gICAgIGlmIChwZW5kaW5nTWVkaWFSZXF1ZXN0cykgcGVuZGluZ01lZGlhUmVxdWVzdHMudmlkZW8ucmVzb2x2ZSh2aWRlb1N0cmVhbSk7XG5cdCAgLy91c2VyLnZpZGVvVHJhY2tcbiAgfSBcblxufSk7XG5cbiAgdGhpcy5hZ29yYUNsaWVudC5vbihcInVzZXItdW5wdWJsaXNoZWRcIiwgdGhhdC5oYW5kbGVVc2VyVW5wdWJsaXNoZWQpO1xuXG4gIGNvbnNvbGUubG9nKFwiY29ubmVjdCBhZ29yYSBcIik7XG4gIC8vIEpvaW4gYSBjaGFubmVsIGFuZCBjcmVhdGUgbG9jYWwgdHJhY2tzLiBCZXN0IHByYWN0aWNlIGlzIHRvIHVzZSBQcm9taXNlLmFsbCBhbmQgcnVuIHRoZW0gY29uY3VycmVudGx5LlxuLy8gb1xuXG5cblxuICBpZiAodGhpcy5lbmFibGVWaWRlbyAmJiB0aGlzLmVuYWJsZUF1ZGlvKSB7XG4gICAgIFsgdGhpcy51c2VyaWQsIHRoaXMubG9jYWxUcmFja3MuYXVkaW9UcmFjaywgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrIF0gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgLy8gSm9pbiB0aGUgY2hhbm5lbC5cbiAgICAgICB0aGlzLmFnb3JhQ2xpZW50LmpvaW4odGhpcy5hcHBpZCwgdGhpcy5yb29tLCB0aGlzLnRva2VuIHx8IG51bGwsIHRoaXMuY2xpZW50SWQgfHwgbnVsbCksXG4gICAgICAgLy8gQ3JlYXRlIHRyYWNrcyB0byB0aGUgbG9jYWwgbWljcm9waG9uZSBhbmQgY2FtZXJhLlxuICAgICAgIEFnb3JhUlRDLmNyZWF0ZU1pY3JvcGhvbmVBdWRpb1RyYWNrKCksXG4gICAgICAgQWdvcmFSVEMuY3JlYXRlQ2FtZXJhVmlkZW9UcmFjayhcIjM2MHBfNFwiKVxuICAgICBdKTtcbiAgfSBlbHNlIGlmICh0aGlzLmVuYWJsZVZpZGVvKSB7XG4gICAgIFsgdGhpcy51c2VyaWQsIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjayBdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgIC8vIEpvaW4gdGhlIGNoYW5uZWwuXG4gICAgICAgdGhpcy5hZ29yYUNsaWVudC5qb2luKHRoaXMuYXBwaWQsIHRoaXMucm9vbSwgdGhpcy50b2tlbiB8fCBudWxsLCB0aGlzLmNsaWVudElkIHx8IG51bGwpLFxuICAgICAgIEFnb3JhUlRDLmNyZWF0ZUNhbWVyYVZpZGVvVHJhY2soXCIzNjBwXzRcIilcbiAgICAgXSk7XG4gIH0gZWxzZSBpZiAodGhpcy5lbmFibGVBdWRpbykge1xuICAgICBbIHRoaXMudXNlcmlkLCB0aGlzLmxvY2FsVHJhY2tzLmF1ZGlvVHJhY2sgXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAvLyBKb2luIHRoZSBjaGFubmVsLlxuICAgICAgIHRoaXMuYWdvcmFDbGllbnQuam9pbih0aGlzLmFwcGlkLCB0aGlzLnJvb20sIHRoaXMudG9rZW4gfHwgbnVsbCwgdGhpcy5jbGllbnRJZCB8fCBudWxsKSxcbiAgICAgICBBZ29yYVJUQy5jcmVhdGVNaWNyb3Bob25lQXVkaW9UcmFjaygpXG4gICAgIF0pO1xuICB9IGVsc2UgIHtcblx0ICB0aGlzLnVzZXJpZD1hd2FpdCB0aGlzLmFnb3JhQ2xpZW50LmpvaW4odGhpcy5hcHBpZCwgdGhpcy5yb29tLCB0aGlzLnRva2VuIHx8IG51bGwsIHRoaXMuY2xpZW50SWQgfHwgbnVsbCk7XG4gIH1cblxuXG4gIGlmICh0aGlzLmVuYWJsZVZpZGVvIHx8IHRoaXMuZW5hYmxlQXVkaW8pIHtcblxuICAgYXdhaXQgdGhpcy5hZ29yYUNsaWVudC5wdWJsaXNoKE9iamVjdC52YWx1ZXModGhpcy5sb2NhbFRyYWNrcykpO1xuICAgY29uc29sZS5sb2coXCJwdWJsaXNoIHN1Y2Nlc3NcIik7XG5cbiAgLy8gUHVibGlzaCB0aGUgbG9jYWwgdmlkZW8gYW5kIGF1ZGlvIHRyYWNrcyB0byB0aGUgY2hhbm5lbC5cbiAgaWYgKHRoaXMuZW5hYmxlVmlkZW8gJiYgIHRoaXMudmJnICYmICB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2spIHtcbiAgICAgIGNvbnN0IGltZ0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcbiAgICAgIGltZ0VsZW1lbnQub25sb2FkID0gYXN5bmMoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy52aXJ0dWFsQmFja2dyb3VuZEluc3RhbmNlKSB7XG5cdCAgY29uc29sZS5sb2coXCJTRUcgSU5JVCBcIix0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2spO1xuICAgICAgICAgIHRoaXMudmlydHVhbEJhY2tncm91bmRJbnN0YW5jZSA9IGF3YWl0IFNlZ1BsdWdpbi5pbmplY3QodGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrLCBcIi9hc3NldHMvd2FzbXNcIikuY2F0Y2goY29uc29sZS5lcnJvcik7XG5cdCAgY29uc29sZS5sb2coXCJTRUcgSU5JVEVEXCIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudmlydHVhbEJhY2tncm91bmRJbnN0YW5jZS5zZXRPcHRpb25zKHtlbmFibGU6IHRydWUsIGJhY2tncm91bmQ6IGltZ0VsZW1lbnR9KTtcbiAgICAgIH1cbiAgICAgaW1nRWxlbWVudC5zcmMgPSAnZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFBUUFBQUFEQ0FJQUFBQTdsam1SQUFBQUQwbEVRVlI0WG1OZytNK0FRRGc1QU9rOUMvVmtvbXpZQUFBQUFFbEZUa1N1UW1DQyc7XG4gIH0gXG4gIH1cbn1cblxuICAvKipcbiAgICogUHJpdmF0ZXNcbiAgICovXG5cbiAgYXN5bmMgX2Nvbm5lY3QoY29ubmVjdFN1Y2Nlc3MsIGNvbm5lY3RGYWlsdXJlKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gIGF3YWl0IHRoYXQuZWFzeXJ0Yy5jb25uZWN0KHRoYXQuYXBwLCBjb25uZWN0U3VjY2VzcywgY29ubmVjdEZhaWx1cmUpO1xuXG5cbiBcdC8qXG5cbiAgICB0aGlzLmVhc3lydGMuc2V0U3RyZWFtQWNjZXB0b3IodGhpcy5zZXRNZWRpYVN0cmVhbS5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuZWFzeXJ0Yy5zZXRPblN0cmVhbUNsb3NlZChmdW5jdGlvbihjbGllbnRJZCwgc3RyZWFtLCBzdHJlYW1OYW1lKSB7XG4gICAgICBkZWxldGUgdGhpcy5tZWRpYVN0cmVhbXNbY2xpZW50SWRdW3N0cmVhbU5hbWVdO1xuICAgIH0pO1xuXG4gICAgaWYgKHRoYXQuZWFzeXJ0Yy5hdWRpb0VuYWJsZWQgfHwgdGhhdC5lYXN5cnRjLnZpZGVvRW5hYmxlZCkge1xuICAgICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEoe1xuICAgICAgICB2aWRlbzogdGhhdC5lYXN5cnRjLnZpZGVvRW5hYmxlZCxcbiAgICAgICAgYXVkaW86IHRoYXQuZWFzeXJ0Yy5hdWRpb0VuYWJsZWRcbiAgICAgIH0pLnRoZW4oXG4gICAgICAgIGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgICAgICAgIHRoYXQuYWRkTG9jYWxNZWRpYVN0cmVhbShzdHJlYW0sIFwiZGVmYXVsdFwiKTtcbiAgICAgICAgICB0aGF0LmVhc3lydGMuY29ubmVjdCh0aGF0LmFwcCwgY29ubmVjdFN1Y2Nlc3MsIGNvbm5lY3RGYWlsdXJlKTtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24oZXJyb3JDb2RlLCBlcnJtZXNnKSB7XG4gICAgICAgICAgTkFGLmxvZy5lcnJvcihlcnJvckNvZGUsIGVycm1lc2cpO1xuICAgICAgICB9XG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGF0LmVhc3lydGMuY29ubmVjdCh0aGF0LmFwcCwgY29ubmVjdFN1Y2Nlc3MsIGNvbm5lY3RGYWlsdXJlKTtcbiAgICB9XG4gICAgKi9cbiAgfVxuXG4gIF9nZXRSb29tSm9pblRpbWUoY2xpZW50SWQpIHtcbiAgICB2YXIgbXlSb29tSWQgPSB0aGlzLnJvb207IC8vTkFGLnJvb207XG4gICAgdmFyIGpvaW5UaW1lID0gdGhpcy5lYXN5cnRjLmdldFJvb21PY2N1cGFudHNBc01hcChteVJvb21JZClbY2xpZW50SWRdXG4gICAgICAucm9vbUpvaW5UaW1lO1xuICAgIHJldHVybiBqb2luVGltZTtcbiAgfVxuXG4gIGdldFNlcnZlclRpbWUoKSB7XG4gICAgcmV0dXJuIERhdGUubm93KCkgKyB0aGlzLmF2Z1RpbWVPZmZzZXQ7XG4gIH1cbn1cblxuTkFGLmFkYXB0ZXJzLnJlZ2lzdGVyKFwiYWdvcmFydGNcIiwgQWdvcmFSdGNBZGFwdGVyKTtcblxubW9kdWxlLmV4cG9ydHMgPSBBZ29yYVJ0Y0FkYXB0ZXI7XG4iXSwic291cmNlUm9vdCI6IiJ9