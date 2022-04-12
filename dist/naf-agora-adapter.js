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
    this.showLocal = false;
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

    if (this.enableVideo && this.showLocal) {
      this.localTracks.videoTrack.play("local-player");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIl0sIm5hbWVzIjpbIkFnb3JhUnRjQWRhcHRlciIsImNvbnN0cnVjdG9yIiwiZWFzeXJ0YyIsImNvbnNvbGUiLCJsb2ciLCJ3aW5kb3ciLCJhcHAiLCJyb29tIiwidXNlcmlkIiwiYXBwaWQiLCJtZWRpYVN0cmVhbXMiLCJyZW1vdGVDbGllbnRzIiwicGVuZGluZ01lZGlhUmVxdWVzdHMiLCJNYXAiLCJlbmFibGVWaWRlbyIsImVuYWJsZUF1ZGlvIiwibG9jYWxUcmFja3MiLCJ2aWRlb1RyYWNrIiwiYXVkaW9UcmFjayIsInRva2VuIiwiY2xpZW50SWQiLCJ1aWQiLCJ2YmciLCJzaG93TG9jYWwiLCJ2aXJ0dWFsQmFja2dyb3VuZEluc3RhbmNlIiwic2VydmVyVGltZVJlcXVlc3RzIiwidGltZU9mZnNldHMiLCJhdmdUaW1lT2Zmc2V0IiwiYWdvcmFDbGllbnQiLCJBZ29yYVJUQyIsImxvYWRNb2R1bGUiLCJTZWdQbHVnaW4iLCJzZXRQZWVyT3Blbkxpc3RlbmVyIiwiY2xpZW50Q29ubmVjdGlvbiIsImdldFBlZXJDb25uZWN0aW9uQnlVc2VySWQiLCJzZXRQZWVyQ2xvc2VkTGlzdGVuZXIiLCJzZXRTZXJ2ZXJVcmwiLCJ1cmwiLCJzZXRTb2NrZXRVcmwiLCJzZXRBcHAiLCJhcHBOYW1lIiwic2V0Um9vbSIsImpzb24iLCJyZXBsYWNlIiwib2JqIiwiSlNPTiIsInBhcnNlIiwibmFtZSIsImpvaW5Sb29tIiwic2V0V2ViUnRjT3B0aW9ucyIsIm9wdGlvbnMiLCJlbmFibGVEYXRhQ2hhbm5lbHMiLCJkYXRhY2hhbm5lbCIsInZpZGVvIiwiYXVkaW8iLCJlbmFibGVWaWRlb1JlY2VpdmUiLCJlbmFibGVBdWRpb1JlY2VpdmUiLCJzZXRTZXJ2ZXJDb25uZWN0TGlzdGVuZXJzIiwic3VjY2Vzc0xpc3RlbmVyIiwiZmFpbHVyZUxpc3RlbmVyIiwiY29ubmVjdFN1Y2Nlc3MiLCJjb25uZWN0RmFpbHVyZSIsInNldFJvb21PY2N1cGFudExpc3RlbmVyIiwib2NjdXBhbnRMaXN0ZW5lciIsInJvb21OYW1lIiwib2NjdXBhbnRzIiwicHJpbWFyeSIsInNldERhdGFDaGFubmVsTGlzdGVuZXJzIiwib3Blbkxpc3RlbmVyIiwiY2xvc2VkTGlzdGVuZXIiLCJtZXNzYWdlTGlzdGVuZXIiLCJzZXREYXRhQ2hhbm5lbE9wZW5MaXN0ZW5lciIsInNldERhdGFDaGFubmVsQ2xvc2VMaXN0ZW5lciIsInNldFBlZXJMaXN0ZW5lciIsInVwZGF0ZVRpbWVPZmZzZXQiLCJjbGllbnRTZW50VGltZSIsIkRhdGUiLCJub3ciLCJmZXRjaCIsImRvY3VtZW50IiwibG9jYXRpb24iLCJocmVmIiwibWV0aG9kIiwiY2FjaGUiLCJ0aGVuIiwicmVzIiwicHJlY2lzaW9uIiwic2VydmVyUmVjZWl2ZWRUaW1lIiwiaGVhZGVycyIsImdldCIsImdldFRpbWUiLCJjbGllbnRSZWNlaXZlZFRpbWUiLCJzZXJ2ZXJUaW1lIiwidGltZU9mZnNldCIsInB1c2giLCJyZWR1Y2UiLCJhY2MiLCJvZmZzZXQiLCJsZW5ndGgiLCJzZXRUaW1lb3V0IiwiY29ubmVjdCIsIlByb21pc2UiLCJhbGwiLCJyZXNvbHZlIiwicmVqZWN0IiwiX2Nvbm5lY3QiLCJfIiwiX215Um9vbUpvaW5UaW1lIiwiX2dldFJvb21Kb2luVGltZSIsImNvbm5lY3RBZ29yYSIsImNhdGNoIiwic2hvdWxkU3RhcnRDb25uZWN0aW9uVG8iLCJjbGllbnQiLCJyb29tSm9pblRpbWUiLCJzdGFydFN0cmVhbUNvbm5lY3Rpb24iLCJjYWxsIiwiY2FsbGVyIiwibWVkaWEiLCJOQUYiLCJ3cml0ZSIsImVycm9yQ29kZSIsImVycm9yVGV4dCIsImVycm9yIiwid2FzQWNjZXB0ZWQiLCJjbG9zZVN0cmVhbUNvbm5lY3Rpb24iLCJoYW5ndXAiLCJzZW5kRGF0YSIsImRhdGFUeXBlIiwiZGF0YSIsInNlbmREYXRhR3VhcmFudGVlZCIsInNlbmREYXRhV1MiLCJicm9hZGNhc3REYXRhIiwicm9vbU9jY3VwYW50cyIsImdldFJvb21PY2N1cGFudHNBc01hcCIsInJvb21PY2N1cGFudCIsIm15RWFzeXJ0Y2lkIiwiYnJvYWRjYXN0RGF0YUd1YXJhbnRlZWQiLCJkZXN0aW5hdGlvbiIsInRhcmdldFJvb20iLCJnZXRDb25uZWN0U3RhdHVzIiwic3RhdHVzIiwiSVNfQ09OTkVDVEVEIiwiYWRhcHRlcnMiLCJOT1RfQ09OTkVDVEVEIiwiQ09OTkVDVElORyIsImdldE1lZGlhU3RyZWFtIiwic3RyZWFtTmFtZSIsImhhcyIsImF1ZGlvUHJvbWlzZSIsImUiLCJ3YXJuIiwicHJvbWlzZSIsInZpZGVvUHJvbWlzZSIsInNldCIsInN0cmVhbVByb21pc2UiLCJzZXRNZWRpYVN0cmVhbSIsInN0cmVhbSIsImNsaWVudE1lZGlhU3RyZWFtcyIsImF1ZGlvVHJhY2tzIiwiZ2V0QXVkaW9UcmFja3MiLCJhdWRpb1N0cmVhbSIsIk1lZGlhU3RyZWFtIiwiZm9yRWFjaCIsInRyYWNrIiwiYWRkVHJhY2siLCJ2aWRlb1RyYWNrcyIsImdldFZpZGVvVHJhY2tzIiwidmlkZW9TdHJlYW0iLCJhZGRMb2NhbE1lZGlhU3RyZWFtIiwiaWQiLCJyZWdpc3RlcjNyZFBhcnR5TG9jYWxNZWRpYVN0cmVhbSIsIk9iamVjdCIsImtleXMiLCJhZGRTdHJlYW1Ub0NhbGwiLCJyZW1vdmVMb2NhbE1lZGlhU3RyZWFtIiwiY2xvc2VMb2NhbE1lZGlhU3RyZWFtIiwiZW5hYmxlTWljcm9waG9uZSIsImVuYWJsZWQiLCJlbmFibGVDYW1lcmEiLCJkaXNjb25uZWN0IiwiaGFuZGxlVXNlclB1Ymxpc2hlZCIsInVzZXIiLCJtZWRpYVR5cGUiLCJoYW5kbGVVc2VyVW5wdWJsaXNoZWQiLCJ0aGF0IiwiY3JlYXRlQ2xpZW50IiwibW9kZSIsImNvZGVjIiwib24iLCJzdWJzY3JpYmUiLCJfbWVkaWFTdHJlYW1UcmFjayIsImpvaW4iLCJjcmVhdGVNaWNyb3Bob25lQXVkaW9UcmFjayIsImNyZWF0ZUNhbWVyYVZpZGVvVHJhY2siLCJwbGF5IiwicHVibGlzaCIsInZhbHVlcyIsImltZ0VsZW1lbnQiLCJjcmVhdGVFbGVtZW50Iiwib25sb2FkIiwiaW5qZWN0Iiwic2V0T3B0aW9ucyIsImVuYWJsZSIsImJhY2tncm91bmQiLCJzcmMiLCJteVJvb21JZCIsImpvaW5UaW1lIiwiZ2V0U2VydmVyVGltZSIsInJlZ2lzdGVyIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7UUFDQTs7O1FBR0E7UUFDQTs7Ozs7Ozs7Ozs7OztBQ2pGQSxNQUFNQSxlQUFOLENBQXNCOztBQUVwQkMsY0FBWUMsT0FBWixFQUFxQjtBQUNsQkMsWUFBUUMsR0FBUixDQUFZLG1CQUFaLEVBQWlDRixPQUFqQzs7QUFFRCxTQUFLQSxPQUFMLEdBQWVBLFdBQVdHLE9BQU9ILE9BQWpDO0FBQ0EsU0FBS0ksR0FBTCxHQUFXLFNBQVg7QUFDQSxTQUFLQyxJQUFMLEdBQVksU0FBWjtBQUNBLFNBQUtDLE1BQUws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Ozs7Ozs7Ozs7O0FBeUJDOztBQUVEK0MsbUJBQWlCeEYsUUFBakIsRUFBMkI7QUFDekIsUUFBSXlMLFdBQVcsS0FBS3RNLElBQXBCLENBRHlCLENBQ0M7QUFDMUIsUUFBSXVNLFdBQVcsS0FBSzVNLE9BQUwsQ0FBYW1JLHFCQUFiLENBQW1Dd0UsUUFBbkMsRUFBNkN6TCxRQUE3QyxFQUNaNkYsWUFESDtBQUVBLFdBQU82RixRQUFQO0FBQ0Q7O0FBRURDLGtCQUFnQjtBQUNkLFdBQU9uSSxLQUFLQyxHQUFMLEtBQWEsS0FBS2xELGFBQXpCO0FBQ0Q7QUF6Zm1COztBQTRmdEIyRixJQUFJd0IsUUFBSixDQUFha0UsUUFBYixDQUFzQixVQUF0QixFQUFrQ2hOLGVBQWxDOztBQUVBaU4sT0FBT0MsT0FBUCxHQUFpQmxOLGVBQWpCLEMiLCJmaWxlIjoibmFmLWFnb3JhLWFkYXB0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9pbmRleC5qc1wiKTtcbiIsIlxuY2xhc3MgQWdvcmFSdGNBZGFwdGVyIHtcblxuICBjb25zdHJ1Y3RvcihlYXN5cnRjKSB7XG4gICAgIGNvbnNvbGUubG9nKFwiQlc3MyBjb25zdHJ1Y3RvciBcIiwgZWFzeXJ0Yyk7XG5cbiAgICB0aGlzLmVhc3lydGMgPSBlYXN5cnRjIHx8IHdpbmRvdy5lYXN5cnRjO1xuICAgIHRoaXMuYXBwID0gXCJkZWZhdWx0XCI7XG4gICAgdGhpcy5yb29tID0gXCJkZWZhdWx0XCI7XG4gICAgdGhpcy51c2VyaWQ9MDtcbiAgICB0aGlzLmFwcGlkPW51bGw7XG5cbiAgICB0aGlzLm1lZGlhU3RyZWFtcyA9IHt9O1xuICAgIHRoaXMucmVtb3RlQ2xpZW50cyA9IHt9O1xuICAgIHRoaXMucGVuZGluZ01lZGlhUmVxdWVzdHMgPSBuZXcgTWFwKCk7XG5cbiAgICB0aGlzLmVuYWJsZVZpZGVvPWZhbHNlO1xuICAgIHRoaXMuZW5hYmxlQXVkaW89ZmFsc2U7XG5cbiAgICB0aGlzLmxvY2FsVHJhY2tzID0geyB2aWRlb1RyYWNrOiBudWxsLCBhdWRpb1RyYWNrOiBudWxsIH07XG4gICAgdGhpcy50b2tlbj1udWxsO1xuICAgIHRoaXMuY2xpZW50SWQ9bnVsbDtcbiAgICB0aGlzLnVpZD1udWxsO1xuICAgIHRoaXMudmJnPWZhbHNlO1xuICAgIHRoaXMuc2hvd0xvY2FsPWZhbHNlO1xuICAgIHRoaXMudmlydHVhbEJhY2tncm91bmRJbnN0YW5jZT1udWxsO1xuXHQgXG4gICAgdGhpcy5zZXJ2ZXJUaW1lUmVxdWVzdHMgPSAwO1xuICAgIHRoaXMudGltZU9mZnNldHMgPSBbXTtcbiAgICB0aGlzLmF2Z1RpbWVPZmZzZXQgPSAwO1xuICAgIHRoaXMuYWdvcmFDbGllbnQ9bnVsbDtcbiAgICBBZ29yYVJUQy5sb2FkTW9kdWxlKFNlZ1BsdWdpbiwge30pO1xuXG4gICAgdGhpcy5lYXN5cnRjLnNldFBlZXJPcGVuTGlzdGVuZXIoKGNsaWVudElkKSA9PiB7XG4gICAgICBjb25zdCBjbGllbnRDb25uZWN0aW9uID0gdGhpcy5lYXN5cnRjLmdldFBlZXJDb25uZWN0aW9uQnlVc2VySWQoY2xpZW50SWQpO1xuICAgICAgdGhpcy5yZW1vdGVDbGllbnRzW2NsaWVudElkXSA9IGNsaWVudENvbm5lY3Rpb247XG4gICAgfSk7XG5cbiAgICB0aGlzLmVhc3lydGMuc2V0UGVlckNsb3NlZExpc3RlbmVyKChjbGllbnRJZCkgPT4ge1xuICAgICAgZGVsZXRlIHRoaXMucmVtb3RlQ2xpZW50c1tjbGllbnRJZF07XG4gICAgfSk7XG4gIH1cblxuICBzZXRTZXJ2ZXJVcmwodXJsKSB7XG4gICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXRTZXJ2ZXJVcmwgXCIsIHVybCk7XG4gICAgdGhpcy5lYXN5cnRjLnNldFNvY2tldFVybCh1cmwpO1xuICB9XG5cbiAgc2V0QXBwKGFwcE5hbWUpIHtcbiAgICAgY29uc29sZS5sb2coXCJCVzczIHNldEFwcCBcIiwgYXBwTmFtZSk7XG4gICAgdGhpcy5hcHAgPSBhcHBOYW1lO1xuICAgIHRoaXMuYXBwaWQgPSBhcHBOYW1lO1xuICB9XG5cbiAgYXN5bmMgc2V0Um9vbShqc29uKSB7XG4gICAganNvbj1qc29uLnJlcGxhY2UoLycvZywgJ1wiJyk7XG4gICAgY29uc3Qgb2JqID0gSlNPTi5wYXJzZShqc29uKTtcbiAgICB0aGlzLnJvb20gPSBvYmoubmFtZTtcblxuICAgIGlmIChvYmoudmJnKSB7XG4gIFx0ICB0aGlzLnZiZz1vYmoudmJnO1xuICAgIH1cbiAgICBpZiAob2JqLnNob3dMb2NhbCkge1xuICBcdCAgdGhpcy5zaG93TG9jYWw9b2JqLnNob3dMb2NhbDtcbiAgICB9XG4gICAgdGhpcy5lYXN5cnRjLmpvaW5Sb29tKHRoaXMucm9vbSwgbnVsbCk7XG4gIH1cblxuICAvLyBvcHRpb25zOiB7IGRhdGFjaGFubmVsOiBib29sLCBhdWRpbzogYm9vbCwgdmlkZW86IGJvb2wgfVxuICBzZXRXZWJSdGNPcHRpb25zKG9wdGlvbnMpIHtcbiAgICAgY29uc29sZS5sb2coXCJCVzczIHNldFdlYlJ0Y09wdGlvbnMgXCIsIG9wdGlvbnMpO1xuICAgIC8vIHRoaXMuZWFzeXJ0Yy5lbmFibGVEZWJ1Zyh0cnVlKTtcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlRGF0YUNoYW5uZWxzKG9wdGlvbnMuZGF0YWNoYW5uZWwpO1xuXG4gICAgLy8gdXNpbmcgQWdvcmFcbiAgICB0aGlzLmVuYWJsZVZpZGVvPW9wdGlvbnMudmlkZW87XG4gICAgdGhpcy5lbmFibGVBdWRpbz1vcHRpb25zLmF1ZGlvO1xuXHRcbiAgICAvLyBub3QgZWFzeXJ0Y1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVWaWRlbyhmYWxzZSk7XG4gICAgdGhpcy5lYXN5cnRjLmVuYWJsZUF1ZGlvKGZhbHNlKTtcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlVmlkZW9SZWNlaXZlKGZhbHNlKTtcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlQXVkaW9SZWNlaXZlKGZhbHNlKTtcbiAgfVxuXG4gIHNldFNlcnZlckNvbm5lY3RMaXN0ZW5lcnMoc3VjY2Vzc0xpc3RlbmVyLCBmYWlsdXJlTGlzdGVuZXIpIHtcbiAgICAgY29uc29sZS5sb2coXCJCVzczIHNldFNlcnZlckNvbm5lY3RMaXN0ZW5lcnMgXCIsIHN1Y2Nlc3NMaXN0ZW5lciwgZmFpbHVyZUxpc3RlbmVyKTtcbiAgICB0aGlzLmNvbm5lY3RTdWNjZXNzID0gc3VjY2Vzc0xpc3RlbmVyO1xuICAgIHRoaXMuY29ubmVjdEZhaWx1cmUgPSBmYWlsdXJlTGlzdGVuZXI7XG4gIH1cblxuICBzZXRSb29tT2NjdXBhbnRMaXN0ZW5lcihvY2N1cGFudExpc3RlbmVyKSB7XG4gICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXRSb29tT2NjdXBhbnRMaXN0ZW5lciBcIiwgb2NjdXBhbnRMaXN0ZW5lcik7XG5cdCAgXG4gICAgdGhpcy5lYXN5cnRjLnNldFJvb21PY2N1cGFudExpc3RlbmVyKGZ1bmN0aW9uKFxuICAgICAgcm9vbU5hbWUsXG4gICAgICBvY2N1cGFudHMsXG4gICAgICBwcmltYXJ5XG4gICAgKSB7XG4gICAgICBvY2N1cGFudExpc3RlbmVyKG9jY3VwYW50cyk7XG4gICAgfSk7XG4gIH1cblxuICBzZXREYXRhQ2hhbm5lbExpc3RlbmVycyhvcGVuTGlzdGVuZXIsIGNsb3NlZExpc3RlbmVyLCBtZXNzYWdlTGlzdGVuZXIpIHtcbiAgICAgY29uc29sZS5sb2coXCJCVzczIHNldERhdGFDaGFubmVsTGlzdGVuZXJzICBcIiwgb3Blbkxpc3RlbmVyLCBjbG9zZWRMaXN0ZW5lciwgbWVzc2FnZUxpc3RlbmVyKTtcbiAgICB0aGlzLmVhc3lydGMuc2V0RGF0YUNoYW5uZWxPcGVuTGlzdGVuZXIob3Blbkxpc3RlbmVyKTtcbiAgICB0aGlzLmVhc3lydGMuc2V0RGF0YUNoYW5uZWxDbG9zZUxpc3RlbmVyKGNsb3NlZExpc3RlbmVyKTtcbiAgICB0aGlzLmVhc3lydGMuc2V0UGVlckxpc3RlbmVyKG1lc3NhZ2VMaXN0ZW5lcik7XG4gIH1cblxuICB1cGRhdGVUaW1lT2Zmc2V0KCkge1xuICAgICBjb25zb2xlLmxvZyhcIkJXNzMgdXBkYXRlVGltZU9mZnNldCBcIik7XG4gICAgY29uc3QgY2xpZW50U2VudFRpbWUgPSBEYXRlLm5vdygpICsgdGhpcy5hdmdUaW1lT2Zmc2V0O1xuXG4gICAgcmV0dXJuIGZldGNoKGRvY3VtZW50LmxvY2F0aW9uLmhyZWYsIHsgbWV0aG9kOiBcIkhFQURcIiwgY2FjaGU6IFwibm8tY2FjaGVcIiB9KVxuICAgICAgLnRoZW4ocmVzID0+IHtcbiAgICAgICAgdmFyIHByZWNpc2lvbiA9IDEwMDA7XG4gICAgICAgIHZhciBzZXJ2ZXJSZWNlaXZlZFRpbWUgPSBuZXcgRGF0ZShyZXMuaGVhZGVycy5nZXQoXCJEYXRlXCIpKS5nZXRUaW1lKCkgKyAocHJlY2lzaW9uIC8gMik7XG4gICAgICAgIHZhciBjbGllbnRSZWNlaXZlZFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICB2YXIgc2VydmVyVGltZSA9IHNlcnZlclJlY2VpdmVkVGltZSArICgoY2xpZW50UmVjZWl2ZWRUaW1lIC0gY2xpZW50U2VudFRpbWUpIC8gMik7XG4gICAgICAgIHZhciB0aW1lT2Zmc2V0ID0gc2VydmVyVGltZSAtIGNsaWVudFJlY2VpdmVkVGltZTtcblxuICAgICAgICB0aGlzLnNlcnZlclRpbWVSZXF1ZXN0cysrO1xuXG4gICAgICAgIGlmICh0aGlzLnNlcnZlclRpbWVSZXF1ZXN0cyA8PSAxMCkge1xuICAgICAgICAgIHRoaXMudGltZU9mZnNldHMucHVzaCh0aW1lT2Zmc2V0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnRpbWVPZmZzZXRzW3RoaXMuc2VydmVyVGltZVJlcXVlc3RzICUgMTBdID0gdGltZU9mZnNldDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYXZnVGltZU9mZnNldCA9IHRoaXMudGltZU9mZnNldHMucmVkdWNlKChhY2MsIG9mZnNldCkgPT4gYWNjICs9IG9mZnNldCwgMCkgLyB0aGlzLnRpbWVPZmZzZXRzLmxlbmd0aDtcblxuICAgICAgICBpZiAodGhpcy5zZXJ2ZXJUaW1lUmVxdWVzdHMgPiAxMCkge1xuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy51cGRhdGVUaW1lT2Zmc2V0KCksIDUgKiA2MCAqIDEwMDApOyAvLyBTeW5jIGNsb2NrIGV2ZXJ5IDUgbWludXRlcy5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnVwZGF0ZVRpbWVPZmZzZXQoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cblxuICBjb25uZWN0KCkge1xuICAgICBjb25zb2xlLmxvZyhcIkJXNzMgY29ubmVjdCBcIik7XG4gICAgUHJvbWlzZS5hbGwoW1xuICAgICAgdGhpcy51cGRhdGVUaW1lT2Zmc2V0KCksXG4gICAgICBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIHRoaXMuX2Nvbm5lY3QocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgIH0pXG4gICAgXSkudGhlbigoW18sIGNsaWVudElkXSkgPT4ge1xuICAgICBjb25zb2xlLmxvZyhcIkJXNzMgY29ubmVjdGVkIFwiK2NsaWVudElkKTtcbiAgICAgIHRoaXMuY2xpZW50SWQ9Y2xpZW50SWQ7XG4gICAgICB0aGlzLl9teVJvb21Kb2luVGltZSA9IHRoaXMuX2dldFJvb21Kb2luVGltZShjbGllbnRJZCk7XG4gICAgICB0aGlzLmNvbm5lY3RBZ29yYSgpO1xuICAgICAgdGhpcy5jb25uZWN0U3VjY2VzcyhjbGllbnRJZCk7XG4gICAgfSkuY2F0Y2godGhpcy5jb25uZWN0RmFpbHVyZSk7XG4gIH1cblxuICBzaG91bGRTdGFydENvbm5lY3Rpb25UbyhjbGllbnQpIHtcbiAgICByZXR1cm4gdGhpcy5fbXlSb29tSm9pblRpbWUgPD0gY2xpZW50LnJvb21Kb2luVGltZTtcbiAgfVxuXG4gIHN0YXJ0U3RyZWFtQ29ubmVjdGlvbihjbGllbnRJZCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzdGFydFN0cmVhbUNvbm5lY3Rpb24gXCIsICBjbGllbnRJZCk7XG4gICAgdGhpcy5lYXN5cnRjLmNhbGwoXG4gICAgICBjbGllbnRJZCxcbiAgICAgIGZ1bmN0aW9uKGNhbGxlciwgbWVkaWEpIHtcbiAgICAgICAgaWYgKG1lZGlhID09PSBcImRhdGFjaGFubmVsXCIpIHtcbiAgICAgICAgICBOQUYubG9nLndyaXRlKFwiU3VjY2Vzc2Z1bGx5IHN0YXJ0ZWQgZGF0YWNoYW5uZWwgdG8gXCIsIGNhbGxlcik7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbihlcnJvckNvZGUsIGVycm9yVGV4dCkge1xuICAgICAgICBOQUYubG9nLmVycm9yKGVycm9yQ29kZSwgZXJyb3JUZXh0KTtcbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbih3YXNBY2NlcHRlZCkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcIndhcyBhY2NlcHRlZD1cIiArIHdhc0FjY2VwdGVkKTtcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgY2xvc2VTdHJlYW1Db25uZWN0aW9uKGNsaWVudElkKSB7XG4gICAgIGNvbnNvbGUubG9nKFwiQlc3MyBjbG9zZVN0cmVhbUNvbm5lY3Rpb24gXCIsIGNsaWVudElkKTtcbiAgICB0aGlzLmVhc3lydGMuaGFuZ3VwKGNsaWVudElkKTtcbiAgfVxuXG4gIHNlbmREYXRhKGNsaWVudElkLCBkYXRhVHlwZSwgZGF0YSkge1xuICAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2VuZERhdGEgXCIsIGNsaWVudElkLCBkYXRhVHlwZSwgZGF0YSk7XG4gICAgLy8gc2VuZCB2aWEgd2VicnRjIG90aGVyd2lzZSBmYWxsYmFjayB0byB3ZWJzb2NrZXRzXG4gICAgdGhpcy5lYXN5cnRjLnNlbmREYXRhKGNsaWVudElkLCBkYXRhVHlwZSwgZGF0YSk7XG4gIH1cblxuICBzZW5kRGF0YUd1YXJhbnRlZWQoY2xpZW50SWQsIGRhdGFUeXBlLCBkYXRhKSB7XG4gICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZW5kRGF0YUd1YXJhbnRlZWQgXCIsIGNsaWVudElkLCAgZGF0YVR5cGUsIGRhdGEpO1xuICAgIHRoaXMuZWFzeXJ0Yy5zZW5kRGF0YVdTKGNsaWVudElkLCBkYXRhVHlwZSwgZGF0YSk7XG4gIH1cblxuICBicm9hZGNhc3REYXRhKGRhdGFUeXBlLCBkYXRhKSB7XG4gICAgIGNvbnNvbGUubG9nKFwiQlc3MyBicm9hZGNhc3REYXRhIFwiLCBkYXRhVHlwZSwgZGF0YSk7XG4gICAgdmFyIHJvb21PY2N1cGFudHMgPSB0aGlzLmVhc3lydGMuZ2V0Um9vbU9jY3VwYW50c0FzTWFwKHRoaXMucm9vbSk7XG5cbiAgICAvLyBJdGVyYXRlIG92ZXIgdGhlIGtleXMgb2YgdGhlIGVhc3lydGMgcm9vbSBvY2N1cGFudHMgbWFwLlxuICAgIC8vIGdldFJvb21PY2N1cGFudHNBc0FycmF5IHVzZXMgT2JqZWN0LmtleXMgd2hpY2ggYWxsb2NhdGVzIG1lbW9yeS5cbiAgICBmb3IgKHZhciByb29tT2NjdXBhbnQgaW4gcm9vbU9jY3VwYW50cykge1xuICAgICAgaWYgKFxuICAgICAgICByb29tT2NjdXBhbnRzW3Jvb21PY2N1cGFudF0gJiZcbiAgICAgICAgcm9vbU9jY3VwYW50ICE9PSB0aGlzLmVhc3lydGMubXlFYXN5cnRjaWRcbiAgICAgICkge1xuICAgICAgICAvLyBzZW5kIHZpYSB3ZWJydGMgb3RoZXJ3aXNlIGZhbGxiYWNrIHRvIHdlYnNvY2tldHNcbiAgICAgICAgdGhpcy5lYXN5cnRjLnNlbmREYXRhKHJvb21PY2N1cGFudCwgZGF0YVR5cGUsIGRhdGEpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGJyb2FkY2FzdERhdGFHdWFyYW50ZWVkKGRhdGFUeXBlLCBkYXRhKSB7XG4gICAgIGNvbnNvbGUubG9nKFwiQlc3MyBicm9hZGNhc3REYXRhR3VhcmFudGVlZCBcIiwgZGF0YVR5cGUsIGRhdGEpO1xuICAgIHZhciBkZXN0aW5hdGlvbiA9IHsgdGFyZ2V0Um9vbTogdGhpcy5yb29tIH07XG4gICAgdGhpcy5lYXN5cnRjLnNlbmREYXRhV1MoZGVzdGluYXRpb24sIGRhdGFUeXBlLCBkYXRhKTtcbiAgfVxuXG4gIGdldENvbm5lY3RTdGF0dXMoY2xpZW50SWQpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgZ2V0Q29ubmVjdFN0YXR1cyBcIiwgY2xpZW50SWQpO1xuICAgIHZhciBzdGF0dXMgPSB0aGlzLmVhc3lydGMuZ2V0Q29ubmVjdFN0YXR1cyhjbGllbnRJZCk7XG5cbiAgICBpZiAoc3RhdHVzID09IHRoaXMuZWFzeXJ0Yy5JU19DT05ORUNURUQpIHtcbiAgICAgIHJldHVybiBOQUYuYWRhcHRlcnMuSVNfQ09OTkVDVEVEO1xuICAgIH0gZWxzZSBpZiAoc3RhdHVzID09IHRoaXMuZWFzeXJ0Yy5OT1RfQ09OTkVDVEVEKSB7XG4gICAgICByZXR1cm4gTkFGLmFkYXB0ZXJzLk5PVF9DT05ORUNURUQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBOQUYuYWRhcHRlcnMuQ09OTkVDVElORztcbiAgICB9XG4gIH1cblxuICBnZXRNZWRpYVN0cmVhbShjbGllbnRJZCwgc3RyZWFtTmFtZSA9IFwiYXVkaW9cIikge1xuXG4gICAgIGNvbnNvbGUubG9nKFwiQlc3MyBnZXRNZWRpYVN0cmVhbSBcIiwgY2xpZW50SWQsIHN0cmVhbU5hbWUpO1xuXG4gICAgaWYgKHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXSAmJiB0aGlzLm1lZGlhU3RyZWFtc1tjbGllbnRJZF1bc3RyZWFtTmFtZV0pIHtcbiAgICAgIE5BRi5sb2cud3JpdGUoYEFscmVhZHkgaGFkICR7c3RyZWFtTmFtZX0gZm9yICR7Y2xpZW50SWR9YCk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXVtzdHJlYW1OYW1lXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIE5BRi5sb2cud3JpdGUoYFdhaXRpbmcgb24gJHtzdHJlYW1OYW1lfSBmb3IgJHtjbGllbnRJZH1gKTtcblxuICAgICAgLy8gQ3JlYXRlIGluaXRpYWwgcGVuZGluZ01lZGlhUmVxdWVzdHMgd2l0aCBhdWRpb3x2aWRlbyBhbGlhc1xuICAgICAgaWYgKCF0aGlzLnBlbmRpbmdNZWRpYVJlcXVlc3RzLmhhcyhjbGllbnRJZCkpIHtcbiAgICAgICAgY29uc3QgcGVuZGluZ01lZGlhUmVxdWVzdHMgPSB7fTtcblxuICAgICAgICBjb25zdCBhdWRpb1Byb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHMuYXVkaW8gPSB7IHJlc29sdmUsIHJlamVjdCB9O1xuICAgICAgICB9KS5jYXRjaChlID0+IE5BRi5sb2cud2FybihgJHtjbGllbnRJZH0gZ2V0TWVkaWFTdHJlYW0gQXVkaW8gRXJyb3JgLCBlKSk7XG4gICAgICAgIHBlbmRpbmdNZWRpYVJlcXVlc3RzLmF1ZGlvLnByb21pc2UgPSBhdWRpb1Byb21pc2U7XG5cbiAgICAgICAgY29uc3QgdmlkZW9Qcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIHBlbmRpbmdNZWRpYVJlcXVlc3RzLnZpZGVvID0geyByZXNvbHZlLCByZWplY3QgfTtcbiAgICAgICAgfSkuY2F0Y2goZSA9PiBOQUYubG9nLndhcm4oYCR7Y2xpZW50SWR9IGdldE1lZGlhU3RyZWFtIFZpZGVvIEVycm9yYCwgZSkpO1xuICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0cy52aWRlby5wcm9taXNlID0gdmlkZW9Qcm9taXNlO1xuXG4gICAgICAgIHRoaXMucGVuZGluZ01lZGlhUmVxdWVzdHMuc2V0KGNsaWVudElkLCBwZW5kaW5nTWVkaWFSZXF1ZXN0cyk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBlbmRpbmdNZWRpYVJlcXVlc3RzID0gdGhpcy5wZW5kaW5nTWVkaWFSZXF1ZXN0cy5nZXQoY2xpZW50SWQpO1xuXG4gICAgICAvLyBDcmVhdGUgaW5pdGlhbCBwZW5kaW5nTWVkaWFSZXF1ZXN0cyB3aXRoIHN0cmVhbU5hbWVcbiAgICAgIGlmICghcGVuZGluZ01lZGlhUmVxdWVzdHNbc3RyZWFtTmFtZV0pIHtcbiAgICAgICAgY29uc3Qgc3RyZWFtUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0c1tzdHJlYW1OYW1lXSA9IHsgcmVzb2x2ZSwgcmVqZWN0IH07XG4gICAgICAgIH0pLmNhdGNoKGUgPT4gTkFGLmxvZy53YXJuKGAke2NsaWVudElkfSBnZXRNZWRpYVN0cmVhbSBcIiR7c3RyZWFtTmFtZX1cIiBFcnJvcmAsIGUpKVxuICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0c1tzdHJlYW1OYW1lXS5wcm9taXNlID0gc3RyZWFtUHJvbWlzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucGVuZGluZ01lZGlhUmVxdWVzdHMuZ2V0KGNsaWVudElkKVtzdHJlYW1OYW1lXS5wcm9taXNlO1xuICAgIH1cbiAgfVxuXG4gIHNldE1lZGlhU3RyZWFtKGNsaWVudElkLCBzdHJlYW0sIHN0cmVhbU5hbWUpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0TWVkaWFTdHJlYW0gXCIsIGNsaWVudElkLCBzdHJlYW0sIHN0cmVhbU5hbWUpO1xuICAgIGNvbnN0IHBlbmRpbmdNZWRpYVJlcXVlc3RzID0gdGhpcy5wZW5kaW5nTWVkaWFSZXF1ZXN0cy5nZXQoY2xpZW50SWQpOyAvLyByZXR1cm4gdW5kZWZpbmVkIGlmIHRoZXJlIGlzIG5vIGVudHJ5IGluIHRoZSBNYXBcbiAgICBjb25zdCBjbGllbnRNZWRpYVN0cmVhbXMgPSB0aGlzLm1lZGlhU3RyZWFtc1tjbGllbnRJZF0gPSB0aGlzLm1lZGlhU3RyZWFtc1tjbGllbnRJZF0gfHwge307XG5cbiAgICBpZiAoc3RyZWFtTmFtZSA9PT0gJ2RlZmF1bHQnKSB7XG4gICAgICAvLyBTYWZhcmkgZG9lc24ndCBsaWtlIGl0IHdoZW4geW91IHVzZSBhIG1peGVkIG1lZGlhIHN0cmVhbSB3aGVyZSBvbmUgb2YgdGhlIHRyYWNrcyBpcyBpbmFjdGl2ZSwgc28gd2VcbiAgICAgIC8vIHNwbGl0IHRoZSB0cmFja3MgaW50byB0d28gc3RyZWFtcy5cbiAgICAgIC8vIEFkZCBtZWRpYVN0cmVhbXMgYXVkaW8gc3RyZWFtTmFtZSBhbGlhc1xuICAgICAgY29uc3QgYXVkaW9UcmFja3MgPSBzdHJlYW0uZ2V0QXVkaW9UcmFja3MoKTtcbiAgICAgIGlmIChhdWRpb1RyYWNrcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGF1ZGlvU3RyZWFtID0gbmV3IE1lZGlhU3RyZWFtKCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgYXVkaW9UcmFja3MuZm9yRWFjaCh0cmFjayA9PiBhdWRpb1N0cmVhbS5hZGRUcmFjayh0cmFjaykpO1xuICAgICAgICAgIGNsaWVudE1lZGlhU3RyZWFtcy5hdWRpbyA9IGF1ZGlvU3RyZWFtO1xuICAgICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgICBOQUYubG9nLndhcm4oYCR7Y2xpZW50SWR9IHNldE1lZGlhU3RyZWFtIFwiYXVkaW9cIiBhbGlhcyBFcnJvcmAsIGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVzb2x2ZSB0aGUgcHJvbWlzZSBmb3IgdGhlIHVzZXIncyBtZWRpYSBzdHJlYW0gYXVkaW8gYWxpYXMgaWYgaXQgZXhpc3RzLlxuICAgICAgICBpZiAocGVuZGluZ01lZGlhUmVxdWVzdHMpIHBlbmRpbmdNZWRpYVJlcXVlc3RzLmF1ZGlvLnJlc29sdmUoYXVkaW9TdHJlYW0pO1xuICAgICAgfVxuXG4gICAgICAvLyBBZGQgbWVkaWFTdHJlYW1zIHZpZGVvIHN0cmVhbU5hbWUgYWxpYXNcbiAgICAgIGNvbnN0IHZpZGVvVHJhY2tzID0gc3RyZWFtLmdldFZpZGVvVHJhY2tzKCk7XG4gICAgICBpZiAodmlkZW9UcmFja3MubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCB2aWRlb1N0cmVhbSA9IG5ldyBNZWRpYVN0cmVhbSgpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHZpZGVvVHJhY2tzLmZvckVhY2godHJhY2sgPT4gdmlkZW9TdHJlYW0uYWRkVHJhY2sodHJhY2spKTtcbiAgICAgICAgICBjbGllbnRNZWRpYVN0cmVhbXMudmlkZW8gPSB2aWRlb1N0cmVhbTtcbiAgICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICAgTkFGLmxvZy53YXJuKGAke2NsaWVudElkfSBzZXRNZWRpYVN0cmVhbSBcInZpZGVvXCIgYWxpYXMgRXJyb3JgLCBlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlc29sdmUgdGhlIHByb21pc2UgZm9yIHRoZSB1c2VyJ3MgbWVkaWEgc3RyZWFtIHZpZGVvIGFsaWFzIGlmIGl0IGV4aXN0cy5cbiAgICAgICAgaWYgKHBlbmRpbmdNZWRpYVJlcXVlc3RzKSBwZW5kaW5nTWVkaWFSZXF1ZXN0cy52aWRlby5yZXNvbHZlKHZpZGVvU3RyZWFtKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY2xpZW50TWVkaWFTdHJlYW1zW3N0cmVhbU5hbWVdID0gc3RyZWFtO1xuXG4gICAgICAvLyBSZXNvbHZlIHRoZSBwcm9taXNlIGZvciB0aGUgdXNlcidzIG1lZGlhIHN0cmVhbSBieSBTdHJlYW1OYW1lIGlmIGl0IGV4aXN0cy5cbiAgICAgIGlmIChwZW5kaW5nTWVkaWFSZXF1ZXN0cyAmJiBwZW5kaW5nTWVkaWFSZXF1ZXN0c1tzdHJlYW1OYW1lXSkge1xuICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0c1tzdHJlYW1OYW1lXS5yZXNvbHZlKHN0cmVhbSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYWRkTG9jYWxNZWRpYVN0cmVhbShzdHJlYW0sIHN0cmVhbU5hbWUpIHtcbiAgICAgY29uc29sZS5sb2coXCJCVzczIGFkZExvY2FsTWVkaWFTdHJlYW0gXCIsIHN0cmVhbSwgc3RyZWFtTmFtZSk7XG4gICAgY29uc3QgZWFzeXJ0YyA9IHRoaXMuZWFzeXJ0YztcbiAgICBzdHJlYW1OYW1lID0gc3RyZWFtTmFtZSB8fCBzdHJlYW0uaWQ7XG4gICAgdGhpcy5zZXRNZWRpYVN0cmVhbShcImxvY2FsXCIsIHN0cmVhbSwgc3RyZWFtTmFtZSk7XG4gICAgZWFzeXJ0Yy5yZWdpc3RlcjNyZFBhcnR5TG9jYWxNZWRpYVN0cmVhbShzdHJlYW0sIHN0cmVhbU5hbWUpO1xuXG4gICAgLy8gQWRkIGxvY2FsIHN0cmVhbSB0byBleGlzdGluZyBjb25uZWN0aW9uc1xuICAgIE9iamVjdC5rZXlzKHRoaXMucmVtb3RlQ2xpZW50cykuZm9yRWFjaCgoY2xpZW50SWQpID0+IHtcbiAgICAgIGlmIChlYXN5cnRjLmdldENvbm5lY3RTdGF0dXMoY2xpZW50SWQpICE9PSBlYXN5cnRjLk5PVF9DT05ORUNURUQpIHtcbiAgICAgICAgZWFzeXJ0Yy5hZGRTdHJlYW1Ub0NhbGwoY2xpZW50SWQsIHN0cmVhbU5hbWUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcmVtb3ZlTG9jYWxNZWRpYVN0cmVhbShzdHJlYW1OYW1lKSBcblx0e1xuICAgICBjb25zb2xlLmxvZyhcIkJXNzMgcmVtb3ZlTG9jYWxNZWRpYVN0cmVhbSBcIiwgc3RyZWFtTmFtZSk7XG4gICAgdGhpcy5lYXN5cnRjLmNsb3NlTG9jYWxNZWRpYVN0cmVhbShzdHJlYW1OYW1lKTtcbiAgICBkZWxldGUgdGhpcy5tZWRpYVN0cmVhbXNbXCJsb2NhbFwiXVtzdHJlYW1OYW1lXTtcbiAgfVxuXG4gIGVuYWJsZU1pY3JvcGhvbmUoZW5hYmxlZCkge1xuICAgICBjb25zb2xlLmxvZyhcIkJXNzMgZW5hYmxlTWljcm9waG9uZSBcIiwgZW5hYmxlZCk7XG4gICAgdGhpcy5lYXN5cnRjLmVuYWJsZU1pY3JvcGhvbmUoZW5hYmxlZCk7XG4gIH1cblxuICBlbmFibGVDYW1lcmEoZW5hYmxlZCkge1xuICAgICBjb25zb2xlLmxvZyhcIkJXNzMgZW5hYmxlQ2FtZXJhIFwiLCBlbmFibGVkKTtcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlQ2FtZXJhKGVuYWJsZWQpO1xuICB9XG5cbiAgZGlzY29ubmVjdCgpIHtcbiAgICAgY29uc29sZS5sb2coXCJCVzczIGRpc2Nvbm5lY3QgXCIpO1xuICAgIHRoaXMuZWFzeXJ0Yy5kaXNjb25uZWN0KCk7XG4gIH1cblxuYXN5bmMgaGFuZGxlVXNlclB1Ymxpc2hlZCh1c2VyLCBtZWRpYVR5cGUpIHtcblxuXG59XG5cbiBoYW5kbGVVc2VyVW5wdWJsaXNoZWQodXNlciwgbWVkaWFUeXBlKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGhhbmRsZVVzZXJVblB1Ymxpc2hlZCBcIik7XG59XG5cbmFzeW5jIGNvbm5lY3RBZ29yYSgpIHtcbiAgLy8gQWRkIGFuIGV2ZW50IGxpc3RlbmVyIHRvIHBsYXkgcmVtb3RlIHRyYWNrcyB3aGVuIHJlbW90ZSB1c2VyIHB1Ymxpc2hlcy5cbiAgdmFyIHRoYXQ9dGhpcztcblxuICBpZiAodGhpcy5lbmFibGVWaWRlbyB8fCB0aGlzLmVuYWJsZUF1ZGlvKSB7XG4gICAgdGhpcy5hZ29yYUNsaWVudD0gQWdvcmFSVEMuY3JlYXRlQ2xpZW50KHttb2RlOiBcInJ0Y1wiLCBjb2RlYzogXCJ2cDhcIn0pO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuYWdvcmFDbGllbnQ9IEFnb3JhUlRDLmNyZWF0ZUNsaWVudCh7bW9kZTogXCJsaXZlXCIsIGNvZGVjOiBcInZwOFwifSk7XG4gIH1cblxuICB0aGlzLmFnb3JhQ2xpZW50Lm9uKFwidXNlci1wdWJsaXNoZWRcIiwgYXN5bmMgKHVzZXIsIG1lZGlhVHlwZSkgPT4ge1xuXG4gICBsZXQgY2xpZW50SWQgPSB1c2VyLnVpZDtcbiAgIGNvbnNvbGUubG9nKFwiQlc3MyBoYW5kbGVVc2VyUHVibGlzaGVkIFwiK2NsaWVudElkK1wiIFwiK21lZGlhVHlwZSx0aGF0LmFnb3JhQ2xpZW50KTtcbiAgIGF3YWl0IHRoYXQuYWdvcmFDbGllbnQuc3Vic2NyaWJlKHVzZXIsIG1lZGlhVHlwZSk7XG4gICBjb25zb2xlLmxvZyhcIkJXNzMgaGFuZGxlVXNlclB1Ymxpc2hlZDIgXCIrY2xpZW50SWQrXCIgXCIrdGhhdC5hZ29yYUNsaWVudCk7XG5cbiAgIGNvbnN0IHBlbmRpbmdNZWRpYVJlcXVlc3RzID0gdGhhdC5wZW5kaW5nTWVkaWFSZXF1ZXN0cy5nZXQoY2xpZW50SWQpOyBcbiAgIGNvbnN0IGNsaWVudE1lZGlhU3RyZWFtcyA9IHRoYXQubWVkaWFTdHJlYW1zW2NsaWVudElkXSA9IHRoYXQubWVkaWFTdHJlYW1zW2NsaWVudElkXSB8fCB7fTtcblxuICBpZiAobWVkaWFUeXBlID09PSAnYXVkaW8nKSB7XG4gICAgIGNvbnN0IGF1ZGlvU3RyZWFtID0gbmV3IE1lZGlhU3RyZWFtKCk7XG4gICAgIGNvbnNvbGUubG9nKFwidXNlci5hdWRpb1RyYWNrIFwiLHVzZXIuYXVkaW9UcmFjay5fbWVkaWFTdHJlYW1UcmFjayk7XG4gICAgIGF1ZGlvU3RyZWFtLmFkZFRyYWNrKHVzZXIuYXVkaW9UcmFjay5fbWVkaWFTdHJlYW1UcmFjayk7XG4gICAgIGNsaWVudE1lZGlhU3RyZWFtcy5hdWRpbyA9IGF1ZGlvU3RyZWFtO1xuICAgICBpZiAocGVuZGluZ01lZGlhUmVxdWVzdHMpIHBlbmRpbmdNZWRpYVJlcXVlc3RzLmF1ZGlvLnJlc29sdmUoYXVkaW9TdHJlYW0pO1xuICB9IFxuXG4gIGlmIChtZWRpYVR5cGUgPT09ICd2aWRlbycpIHtcbiAgICAgY29uc3QgdmlkZW9TdHJlYW0gPSBuZXcgTWVkaWFTdHJlYW0oKTtcbiAgICAgY29uc29sZS5sb2coXCJ1c2VyLnZpZGVvVHJhY2sgXCIsdXNlci52aWRlb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrKTtcbiAgICAgdmlkZW9TdHJlYW0uYWRkVHJhY2sodXNlci52aWRlb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrKTtcbiAgICAgY2xpZW50TWVkaWFTdHJlYW1zLnZpZGVvID0gdmlkZW9TdHJlYW07XG4gICAgIGlmIChwZW5kaW5nTWVkaWFSZXF1ZXN0cykgcGVuZGluZ01lZGlhUmVxdWVzdHMudmlkZW8ucmVzb2x2ZSh2aWRlb1N0cmVhbSk7XG5cdCAgLy91c2VyLnZpZGVvVHJhY2tcbiAgfSBcblxufSk7XG5cbiAgdGhpcy5hZ29yYUNsaWVudC5vbihcInVzZXItdW5wdWJsaXNoZWRcIiwgdGhhdC5oYW5kbGVVc2VyVW5wdWJsaXNoZWQpO1xuXG4gIGNvbnNvbGUubG9nKFwiY29ubmVjdCBhZ29yYSBcIik7XG4gIC8vIEpvaW4gYSBjaGFubmVsIGFuZCBjcmVhdGUgbG9jYWwgdHJhY2tzLiBCZXN0IHByYWN0aWNlIGlzIHRvIHVzZSBQcm9taXNlLmFsbCBhbmQgcnVuIHRoZW0gY29uY3VycmVudGx5LlxuLy8gb1xuXG5cblxuICBpZiAodGhpcy5lbmFibGVWaWRlbyAmJiB0aGlzLmVuYWJsZUF1ZGlvKSB7XG4gICAgIFsgdGhpcy51c2VyaWQsIHRoaXMubG9jYWxUcmFja3MuYXVkaW9UcmFjaywgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrIF0gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgLy8gSm9pbiB0aGUgY2hhbm5lbC5cbiAgICAgICB0aGlzLmFnb3JhQ2xpZW50LmpvaW4odGhpcy5hcHBpZCwgdGhpcy5yb29tLCB0aGlzLnRva2VuIHx8IG51bGwsIHRoaXMuY2xpZW50SWQgfHwgbnVsbCksXG4gICAgICAgLy8gQ3JlYXRlIHRyYWNrcyB0byB0aGUgbG9jYWwgbWljcm9waG9uZSBhbmQgY2FtZXJhLlxuICAgICAgIEFnb3JhUlRDLmNyZWF0ZU1pY3JvcGhvbmVBdWRpb1RyYWNrKCksXG4gICAgICAgQWdvcmFSVEMuY3JlYXRlQ2FtZXJhVmlkZW9UcmFjayhcIjM2MHBfNFwiKVxuICAgICBdKTtcbiAgfSBlbHNlIGlmICh0aGlzLmVuYWJsZVZpZGVvKSB7XG4gICAgIFsgdGhpcy51c2VyaWQsIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjayBdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgIC8vIEpvaW4gdGhlIGNoYW5uZWwuXG4gICAgICAgdGhpcy5hZ29yYUNsaWVudC5qb2luKHRoaXMuYXBwaWQsIHRoaXMucm9vbSwgdGhpcy50b2tlbiB8fCBudWxsLCB0aGlzLmNsaWVudElkIHx8IG51bGwpLFxuICAgICAgIEFnb3JhUlRDLmNyZWF0ZUNhbWVyYVZpZGVvVHJhY2soXCIzNjBwXzRcIilcbiAgICAgXSk7XG4gIH0gZWxzZSBpZiAodGhpcy5lbmFibGVBdWRpbykge1xuICAgICBbIHRoaXMudXNlcmlkLCB0aGlzLmxvY2FsVHJhY2tzLmF1ZGlvVHJhY2sgXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAvLyBKb2luIHRoZSBjaGFubmVsLlxuICAgICAgIHRoaXMuYWdvcmFDbGllbnQuam9pbih0aGlzLmFwcGlkLCB0aGlzLnJvb20sIHRoaXMudG9rZW4gfHwgbnVsbCwgdGhpcy5jbGllbnRJZCB8fCBudWxsKSxcbiAgICAgICBBZ29yYVJUQy5jcmVhdGVNaWNyb3Bob25lQXVkaW9UcmFjaygpXG4gICAgIF0pO1xuICB9IGVsc2UgIHtcblx0ICB0aGlzLnVzZXJpZD1hd2FpdCB0aGlzLmFnb3JhQ2xpZW50LmpvaW4odGhpcy5hcHBpZCwgdGhpcy5yb29tLCB0aGlzLnRva2VuIHx8IG51bGwsIHRoaXMuY2xpZW50SWQgfHwgbnVsbCk7XG4gIH1cblxuICAgIFx0aWYgKHRoaXMuZW5hYmxlVmlkZW8gJiYgdGhpcy5zaG93TG9jYWwpIHtcblx0XHR0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2sucGxheShcImxvY2FsLXBsYXllclwiKTtcblx0fVxuXG4gIGlmICh0aGlzLmVuYWJsZVZpZGVvIHx8IHRoaXMuZW5hYmxlQXVkaW8pIHtcblxuICAgYXdhaXQgdGhpcy5hZ29yYUNsaWVudC5wdWJsaXNoKE9iamVjdC52YWx1ZXModGhpcy5sb2NhbFRyYWNrcykpO1xuICAgY29uc29sZS5sb2coXCJwdWJsaXNoIHN1Y2Nlc3NcIik7XG5cbiAgLy8gUHVibGlzaCB0aGUgbG9jYWwgdmlkZW8gYW5kIGF1ZGlvIHRyYWNrcyB0byB0aGUgY2hhbm5lbC5cbiAgaWYgKHRoaXMuZW5hYmxlVmlkZW8gJiYgIHRoaXMudmJnICYmICB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2spIHtcbiAgICAgIGNvbnN0IGltZ0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcbiAgICAgIGltZ0VsZW1lbnQub25sb2FkID0gYXN5bmMoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy52aXJ0dWFsQmFja2dyb3VuZEluc3RhbmNlKSB7XG5cdCAgY29uc29sZS5sb2coXCJTRUcgSU5JVCBcIix0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2spO1xuICAgICAgICAgIHRoaXMudmlydHVhbEJhY2tncm91bmRJbnN0YW5jZSA9IGF3YWl0IFNlZ1BsdWdpbi5pbmplY3QodGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrLCBcIi9hc3NldHMvd2FzbXNcIikuY2F0Y2goY29uc29sZS5lcnJvcik7XG5cdCAgY29uc29sZS5sb2coXCJTRUcgSU5JVEVEXCIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudmlydHVhbEJhY2tncm91bmRJbnN0YW5jZS5zZXRPcHRpb25zKHtlbmFibGU6IHRydWUsIGJhY2tncm91bmQ6IGltZ0VsZW1lbnR9KTtcbiAgICAgIH1cbiAgICAgaW1nRWxlbWVudC5zcmMgPSAnZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFBUUFBQUFEQ0FJQUFBQTdsam1SQUFBQUQwbEVRVlI0WG1OZytNK0FRRGc1QU9rOUMvVmtvbXpZQUFBQUFFbEZUa1N1UW1DQyc7XG4gIH0gXG4gIH1cbn1cblxuICAvKipcbiAgICogUHJpdmF0ZXNcbiAgICovXG5cbiAgYXN5bmMgX2Nvbm5lY3QoY29ubmVjdFN1Y2Nlc3MsIGNvbm5lY3RGYWlsdXJlKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gIGF3YWl0IHRoYXQuZWFzeXJ0Yy5jb25uZWN0KHRoYXQuYXBwLCBjb25uZWN0U3VjY2VzcywgY29ubmVjdEZhaWx1cmUpO1xuXG5cbiBcdC8qXG5cbiAgICB0aGlzLmVhc3lydGMuc2V0U3RyZWFtQWNjZXB0b3IodGhpcy5zZXRNZWRpYVN0cmVhbS5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuZWFzeXJ0Yy5zZXRPblN0cmVhbUNsb3NlZChmdW5jdGlvbihjbGllbnRJZCwgc3RyZWFtLCBzdHJlYW1OYW1lKSB7XG4gICAgICBkZWxldGUgdGhpcy5tZWRpYVN0cmVhbXNbY2xpZW50SWRdW3N0cmVhbU5hbWVdO1xuICAgIH0pO1xuXG4gICAgaWYgKHRoYXQuZWFzeXJ0Yy5hdWRpb0VuYWJsZWQgfHwgdGhhdC5lYXN5cnRjLnZpZGVvRW5hYmxlZCkge1xuICAgICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEoe1xuICAgICAgICB2aWRlbzogdGhhdC5lYXN5cnRjLnZpZGVvRW5hYmxlZCxcbiAgICAgICAgYXVkaW86IHRoYXQuZWFzeXJ0Yy5hdWRpb0VuYWJsZWRcbiAgICAgIH0pLnRoZW4oXG4gICAgICAgIGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgICAgICAgIHRoYXQuYWRkTG9jYWxNZWRpYVN0cmVhbShzdHJlYW0sIFwiZGVmYXVsdFwiKTtcbiAgICAgICAgICB0aGF0LmVhc3lydGMuY29ubmVjdCh0aGF0LmFwcCwgY29ubmVjdFN1Y2Nlc3MsIGNvbm5lY3RGYWlsdXJlKTtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24oZXJyb3JDb2RlLCBlcnJtZXNnKSB7XG4gICAgICAgICAgTkFGLmxvZy5lcnJvcihlcnJvckNvZGUsIGVycm1lc2cpO1xuICAgICAgICB9XG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGF0LmVhc3lydGMuY29ubmVjdCh0aGF0LmFwcCwgY29ubmVjdFN1Y2Nlc3MsIGNvbm5lY3RGYWlsdXJlKTtcbiAgICB9XG4gICAgKi9cbiAgfVxuXG4gIF9nZXRSb29tSm9pblRpbWUoY2xpZW50SWQpIHtcbiAgICB2YXIgbXlSb29tSWQgPSB0aGlzLnJvb207IC8vTkFGLnJvb207XG4gICAgdmFyIGpvaW5UaW1lID0gdGhpcy5lYXN5cnRjLmdldFJvb21PY2N1cGFudHNBc01hcChteVJvb21JZClbY2xpZW50SWRdXG4gICAgICAucm9vbUpvaW5UaW1lO1xuICAgIHJldHVybiBqb2luVGltZTtcbiAgfVxuXG4gIGdldFNlcnZlclRpbWUoKSB7XG4gICAgcmV0dXJuIERhdGUubm93KCkgKyB0aGlzLmF2Z1RpbWVPZmZzZXQ7XG4gIH1cbn1cblxuTkFGLmFkYXB0ZXJzLnJlZ2lzdGVyKFwiYWdvcmFydGNcIiwgQWdvcmFSdGNBZGFwdGVyKTtcblxubW9kdWxlLmV4cG9ydHMgPSBBZ29yYVJ0Y0FkYXB0ZXI7XG4iXSwic291cmNlUm9vdCI6IiJ9