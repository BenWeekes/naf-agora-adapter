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

    if (this.enableVideo && this.showLocal) {
      this.localTracks.videoTrack.play("local-player");
    }

    // select facetime camera if exists
    let cams = await AgoraRTC.getCameras();
    for (var i = 0; i < cams.length; i++) {
      if (cams[i].label.indexOf("FaceTime") == 0) {
        console.log("select FaceTime camera", cams[i].deviceId);
        await this.localTracks.videoTrack.setDevice(cams[i].deviceId);
      }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIl0sIm5hbWVzIjpbIkFnb3JhUnRjQWRhcHRlciIsImNvbnN0cnVjdG9yIiwiZWFzeXJ0YyIsImNvbnNvbGUiLCJsb2ciLCJ3aW5kb3ciLCJhcHAiLCJyb29tIiwidXNlcmlkIiwiYXBwaWQiLCJtZWRpYVN0cmVhbXMiLCJyZW1vdGVDbGllbnRzIiwicGVuZGluZ01lZGlhUmVxdWVzdHMiLCJNYXAiLCJlbmFibGVWaWRlbyIsImVuYWJsZUF1ZGlvIiwiZW5hYmxlQXZhdGFyIiwibG9jYWxUcmFja3MiLCJ2aWRlb1RyYWNrIiwiYXVkaW9UcmFjayIsInRva2VuIiwiY2xpZW50SWQiLCJ1aWQiLCJ2YmciLCJ2YmcwIiwic2hvd0xvY2FsIiwidmlydHVhbEJhY2tncm91bmRJbnN0YW5jZSIsImV4dGVuc2lvbiIsInByb2Nlc3NvciIsInBpcGVQcm9jZXNzb3IiLCJ0cmFjayIsInBpcGUiLCJwcm9jZXNzb3JEZXN0aW5hdGlvbiIsInNlcnZlclRpbWVSZXF1ZXN0cyIsInRpbWVPZmZzZXRzIiwiYXZnVGltZU9mZnNldCIsImFnb3JhQ2xpZW50Iiwic2V0UGVlck9wZW5MaXN0ZW5lciIsImNsaWVudENvbm5lY3Rpb24iLCJnZXRQZWVyQ29ubmVjdGlvbkJ5VXNlcklkIiwic2V0UGVlckNsb3NlZExpc3RlbmVyIiwic2V0U2VydmVyVXJsIiwidXJsIiwic2V0U29ja2V0VXJsIiwic2V0QXBwIiwiYXBwTmFtZSIsInNldFJvb20iLCJqc29uIiwicmVwbGFjZSIsIm9iaiIsIkpTT04iLCJwYXJzZSIsIm5hbWUiLCJBZ29yYVJUQyIsImxvYWRNb2R1bGUiLCJTZWdQbHVnaW4iLCJqb2luUm9vbSIsInNldFdlYlJ0Y09wdGlvbnMiLCJvcHRpb25zIiwiZW5hYmxlRGF0YUNoYW5uZWxzIiwiZGF0YWNoYW5uZWwiLCJ2aWRlbyIsImF1ZGlvIiwiZW5hYmxlVmlkZW9SZWNlaXZlIiwiZW5hYmxlQXVkaW9SZWNlaXZlIiwic2V0U2VydmVyQ29ubmVjdExpc3RlbmVycyIsInN1Y2Nlc3NMaXN0ZW5lciIsImZhaWx1cmVMaXN0ZW5lciIsImNvbm5lY3RTdWNjZXNzIiwiY29ubmVjdEZhaWx1cmUiLCJzZXRSb29tT2NjdXBhbnRMaXN0ZW5lciIsIm9jY3VwYW50TGlzdGVuZXIiLCJyb29tTmFtZSIsIm9jY3VwYW50cyIsInByaW1hcnkiLCJzZXREYXRhQ2hhbm5lbExpc3RlbmVycyIsIm9wZW5MaXN0ZW5lciIsImNsb3NlZExpc3RlbmVyIiwibWVzc2FnZUxpc3RlbmVyIiwic2V0RGF0YUNoYW5uZWxPcGVuTGlzdGVuZXIiLCJzZXREYXRhQ2hhbm5lbENsb3NlTGlzdGVuZXIiLCJzZXRQZWVyTGlzdGVuZXIiLCJ1cGRhdGVUaW1lT2Zmc2V0IiwiY2xpZW50U2VudFRpbWUiLCJEYXRlIiwibm93IiwiZmV0Y2giLCJkb2N1bWVudCIsImxvY2F0aW9uIiwiaHJlZiIsIm1ldGhvZCIsImNhY2hlIiwidGhlbiIsInJlcyIsInByZWNpc2lvbiIsInNlcnZlclJlY2VpdmVkVGltZSIsImhlYWRlcnMiLCJnZXQiLCJnZXRUaW1lIiwiY2xpZW50UmVjZWl2ZWRUaW1lIiwic2VydmVyVGltZSIsInRpbWVPZmZzZXQiLCJwdXNoIiwicmVkdWNlIiwiYWNjIiwib2Zmc2V0IiwibGVuZ3RoIiwic2V0VGltZW91dCIsImNvbm5lY3QiLCJQcm9taXNlIiwiYWxsIiwicmVzb2x2ZSIsInJlamVjdCIsIl9jb25uZWN0IiwiXyIsIl9teVJvb21Kb2luVGltZSIsIl9nZXRSb29tSm9pblRpbWUiLCJjb25uZWN0QWdvcmEiLCJjYXRjaCIsInNob3VsZFN0YXJ0Q29ubmVjdGlvblRvIiwiY2xpZW50Iiwicm9vbUpvaW5UaW1lIiwic3RhcnRTdHJlYW1Db25uZWN0aW9uIiwiY2FsbCIsImNhbGxlciIsIm1lZGlhIiwiTkFGIiwid3JpdGUiLCJlcnJvckNvZGUiLCJlcnJvclRleHQiLCJlcnJvciIsIndhc0FjY2VwdGVkIiwiY2xvc2VTdHJlYW1Db25uZWN0aW9uIiwiaGFuZ3VwIiwic2VuZERhdGEiLCJkYXRhVHlwZSIsImRhdGEiLCJzZW5kRGF0YUd1YXJhbnRlZWQiLCJzZW5kRGF0YVdTIiwiYnJvYWRjYXN0RGF0YSIsInJvb21PY2N1cGFudHMiLCJnZXRSb29tT2NjdXBhbnRzQXNNYXAiLCJyb29tT2NjdXBhbnQiLCJteUVhc3lydGNpZCIsImJyb2FkY2FzdERhdGFHdWFyYW50ZWVkIiwiZGVzdGluYXRpb24iLCJ0YXJnZXRSb29tIiwiZ2V0Q29ubmVjdFN0YXR1cyIsInN0YXR1cyIsIklTX0NPTk5FQ1RFRCIsImFkYXB0ZXJzIiwiTk9UX0NPTk5FQ1RFRCIsIkNPTk5FQ1RJTkciLCJnZXRNZWRpYVN0cmVhbSIsInN0cmVhbU5hbWUiLCJoYXMiLCJhdWRpb1Byb21pc2UiLCJlIiwid2FybiIsInByb21pc2UiLCJ2aWRlb1Byb21pc2UiLCJzZXQiLCJzdHJlYW1Qcm9taXNlIiwic2V0TWVkaWFTdHJlYW0iLCJzdHJlYW0iLCJjbGllbnRNZWRpYVN0cmVhbXMiLCJhdWRpb1RyYWNrcyIsImdldEF1ZGlvVHJhY2tzIiwiYXVkaW9TdHJlYW0iLCJNZWRpYVN0cmVhbSIsImZvckVhY2giLCJhZGRUcmFjayIsInZpZGVvVHJhY2tzIiwiZ2V0VmlkZW9UcmFja3MiLCJ2aWRlb1N0cmVhbSIsImFkZExvY2FsTWVkaWFTdHJlYW0iLCJpZCIsInJlZ2lzdGVyM3JkUGFydHlMb2NhbE1lZGlhU3RyZWFtIiwiT2JqZWN0Iiwia2V5cyIsImFkZFN0cmVhbVRvQ2FsbCIsInJlbW92ZUxvY2FsTWVkaWFTdHJlYW0iLCJjbG9zZUxvY2FsTWVkaWFTdHJlYW0iLCJlbmFibGVNaWNyb3Bob25lIiwiZW5hYmxlZCIsImVuYWJsZUNhbWVyYSIsImRpc2Nvbm5lY3QiLCJoYW5kbGVVc2VyUHVibGlzaGVkIiwidXNlciIsIm1lZGlhVHlwZSIsImhhbmRsZVVzZXJVbnB1Ymxpc2hlZCIsInRoYXQiLCJjcmVhdGVDbGllbnQiLCJtb2RlIiwiY29kZWMiLCJvbiIsInN1YnNjcmliZSIsIl9tZWRpYVN0cmVhbVRyYWNrIiwiZ2V0RWxlbWVudEJ5SWQiLCJjYXB0dXJlU3RyZWFtIiwiam9pbiIsImNyZWF0ZU1pY3JvcGhvbmVBdWRpb1RyYWNrIiwiY3JlYXRlQ3VzdG9tVmlkZW9UcmFjayIsIm1lZGlhU3RyZWFtVHJhY2siLCJjcmVhdGVDYW1lcmFWaWRlb1RyYWNrIiwiZW5jb2RlckNvbmZpZyIsInBsYXkiLCJjYW1zIiwiZ2V0Q2FtZXJhcyIsImkiLCJsYWJlbCIsImluZGV4T2YiLCJkZXZpY2VJZCIsInNldERldmljZSIsImltZ0VsZW1lbnQiLCJjcmVhdGVFbGVtZW50Iiwib25sb2FkIiwiaW5qZWN0Iiwic2V0T3B0aW9ucyIsImVuYWJsZSIsImJhY2tncm91bmQiLCJzcmMiLCJWaXJ0dWFsQmFja2dyb3VuZEV4dGVuc2lvbiIsInJlZ2lzdGVyRXh0ZW5zaW9ucyIsImNyZWF0ZVByb2Nlc3NvciIsImluaXQiLCJ0eXBlIiwiY29sb3IiLCJwdWJsaXNoIiwidmFsdWVzIiwibXlSb29tSWQiLCJqb2luVGltZSIsImdldFNlcnZlclRpbWUiLCJyZWdpc3RlciIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7UUFBQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTs7O1FBR0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDBDQUEwQyxnQ0FBZ0M7UUFDMUU7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSx3REFBd0Qsa0JBQWtCO1FBQzFFO1FBQ0EsaURBQWlELGNBQWM7UUFDL0Q7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBLHlDQUF5QyxpQ0FBaUM7UUFDMUUsZ0hBQWdILG1CQUFtQixFQUFFO1FBQ3JJ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QUFMLElBQW9CLEtBQUtDLFdBQXpCLElBQXdDLEtBQUtDLFlBQWpELEVBQStEO0FBQzdELFlBQU0sS0FBS29CLFdBQUwsQ0FBaUJnTSxPQUFqQixDQUF5QmxELE9BQU9tRCxNQUFQLENBQWMsS0FBS3BOLFdBQW5CLENBQXpCLENBQU47QUFDQWQsY0FBUUMsR0FBUixDQUFZLGlCQUFaO0FBQ0Q7QUFFRjs7QUFFRDs7OztBQUlBLFFBQU02RyxRQUFOLENBQWU3QyxjQUFmLEVBQStCQyxjQUEvQixFQUErQztBQUM3QyxRQUFJMEgsT0FBTyxJQUFYOztBQUVBLFVBQU1BLEtBQUs3TCxPQUFMLENBQWEwRyxPQUFiLENBQXFCbUYsS0FBS3pMLEdBQTFCLEVBQStCOEQsY0FBL0IsRUFBK0NDLGNBQS9DLENBQU47O0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFzQkQ7O0FBRUQrQyxtQkFBaUIvRixRQUFqQixFQUEyQjtBQUN6QixRQUFJaU4sV0FBVyxLQUFLL04sSUFBcEIsQ0FEeUIsQ0FDQztBQUMxQixRQUFJZ08sV0FBVyxLQUFLck8sT0FBTCxDQUFhMkkscUJBQWIsQ0FBbUN5RixRQUFuQyxFQUE2Q2pOLFFBQTdDLEVBQXVEb0csWUFBdEU7QUFDQSxXQUFPOEcsUUFBUDtBQUNEOztBQUVEQyxrQkFBZ0I7QUFDZCxXQUFPcEosS0FBS0MsR0FBTCxLQUFhLEtBQUtsRCxhQUF6QjtBQUNEO0FBdmdCbUI7O0FBMGdCdEIyRixJQUFJd0IsUUFBSixDQUFhbUYsUUFBYixDQUFzQixVQUF0QixFQUFrQ3pPLGVBQWxDOztBQUVBME8sT0FBT0MsT0FBUCxHQUFpQjNPLGVBQWpCLEMiLCJmaWxlIjoibmFmLWFnb3JhLWFkYXB0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9pbmRleC5qc1wiKTtcbiIsImNsYXNzIEFnb3JhUnRjQWRhcHRlciB7XG5cbiAgY29uc3RydWN0b3IoZWFzeXJ0Yykge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBjb25zdHJ1Y3RvciBcIiwgZWFzeXJ0Yyk7XG5cbiAgICB0aGlzLmVhc3lydGMgPSBlYXN5cnRjIHx8IHdpbmRvdy5lYXN5cnRjO1xuICAgIHRoaXMuYXBwID0gXCJkZWZhdWx0XCI7XG4gICAgdGhpcy5yb29tID0gXCJkZWZhdWx0XCI7XG4gICAgdGhpcy51c2VyaWQgPSAwO1xuICAgIHRoaXMuYXBwaWQgPSBudWxsO1xuXG4gICAgdGhpcy5tZWRpYVN0cmVhbXMgPSB7fTtcbiAgICB0aGlzLnJlbW90ZUNsaWVudHMgPSB7fTtcbiAgICB0aGlzLnBlbmRpbmdNZWRpYVJlcXVlc3RzID0gbmV3IE1hcCgpO1xuXG4gICAgdGhpcy5lbmFibGVWaWRlbyA9IGZhbHNlO1xuICAgIHRoaXMuZW5hYmxlQXVkaW8gPSBmYWxzZTtcbiAgICB0aGlzLmVuYWJsZUF2YXRhciA9IGZhbHNlO1xuXG4gICAgdGhpcy5sb2NhbFRyYWNrcyA9IHsgdmlkZW9UcmFjazogbnVsbCwgYXVkaW9UcmFjazogbnVsbCB9O1xuICAgIHRoaXMudG9rZW4gPSBudWxsO1xuICAgIHRoaXMuY2xpZW50SWQgPSBudWxsO1xuICAgIHRoaXMudWlkID0gbnVsbDtcbiAgICB0aGlzLnZiZyA9IGZhbHNlO1xuICAgIHRoaXMudmJnMCA9IGZhbHNlO1xuICAgIHRoaXMuc2hvd0xvY2FsID0gZmFsc2U7XG4gICAgdGhpcy52aXJ0dWFsQmFja2dyb3VuZEluc3RhbmNlID0gbnVsbDtcbiB0aGlzLmV4dGVuc2lvbiA9IG51bGw7XG4gdGhpcy5wcm9jZXNzb3IgPSBudWxsO1xuIHRoaXMucGlwZVByb2Nlc3NvciA9ICh0cmFjaywgcHJvY2Vzc29yKSA9PiB7XG4gIHRyYWNrLnBpcGUocHJvY2Vzc29yKS5waXBlKHRyYWNrLnByb2Nlc3NvckRlc3RpbmF0aW9uKTtcbiB9XG5cblxuICAgIHRoaXMuc2VydmVyVGltZVJlcXVlc3RzID0gMDtcbiAgICB0aGlzLnRpbWVPZmZzZXRzID0gW107XG4gICAgdGhpcy5hdmdUaW1lT2Zmc2V0ID0gMDtcbiAgICB0aGlzLmFnb3JhQ2xpZW50ID0gbnVsbDtcblxuICAgIHRoaXMuZWFzeXJ0Yy5zZXRQZWVyT3Blbkxpc3RlbmVyKGNsaWVudElkID0+IHtcbiAgICAgIGNvbnN0IGNsaWVudENvbm5lY3Rpb24gPSB0aGlzLmVhc3lydGMuZ2V0UGVlckNvbm5lY3Rpb25CeVVzZXJJZChjbGllbnRJZCk7XG4gICAgICB0aGlzLnJlbW90ZUNsaWVudHNbY2xpZW50SWRdID0gY2xpZW50Q29ubmVjdGlvbjtcbiAgICB9KTtcblxuICAgIHRoaXMuZWFzeXJ0Yy5zZXRQZWVyQ2xvc2VkTGlzdGVuZXIoY2xpZW50SWQgPT4ge1xuICAgICAgZGVsZXRlIHRoaXMucmVtb3RlQ2xpZW50c1tjbGllbnRJZF07XG4gICAgfSk7XG4gIH1cblxuICBzZXRTZXJ2ZXJVcmwodXJsKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNldFNlcnZlclVybCBcIiwgdXJsKTtcbiAgICB0aGlzLmVhc3lydGMuc2V0U29ja2V0VXJsKHVybCk7XG4gIH1cblxuICBzZXRBcHAoYXBwTmFtZSkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXRBcHAgXCIsIGFwcE5hbWUpO1xuICAgIHRoaXMuYXBwID0gYXBwTmFtZTtcbiAgICB0aGlzLmFwcGlkID0gYXBwTmFtZTtcbiAgfVxuXG4gIGFzeW5jIHNldFJvb20oanNvbikge1xuICAgIGpzb24gPSBqc29uLnJlcGxhY2UoLycvZywgJ1wiJyk7XG4gICAgY29uc3Qgb2JqID0gSlNPTi5wYXJzZShqc29uKTtcbiAgICB0aGlzLnJvb20gPSBvYmoubmFtZTtcblxuICAgIGlmIChvYmoudmJnKSB7XG4gICAgICAgdGhpcy52YmcgPSBvYmoudmJnO1xuICAgIH1cblxuICAgIGlmIChvYmoudmJnMCkge1xuICAgICAgIHRoaXMudmJnMCA9IG9iai52YmcwO1xuICAgICAgIGlmICh0aGlzLnZiZzApIHtcbiAgICAgICAgICBBZ29yYVJUQy5sb2FkTW9kdWxlKFNlZ1BsdWdpbiwge30pO1xuICAgICAgIH1cbiAgICB9XG5cblxuICAgIGlmIChvYmouZW5hYmxlQXZhdGFyKSB7XG4gICAgICB0aGlzLmVuYWJsZUF2YXRhciA9IG9iai5lbmFibGVBdmF0YXI7XG4gICAgfVxuXG4gICAgaWYgKG9iai5zaG93TG9jYWwpIHtcbiAgICAgIHRoaXMuc2hvd0xvY2FsID0gb2JqLnNob3dMb2NhbDtcbiAgICB9XG4gICAgdGhpcy5lYXN5cnRjLmpvaW5Sb29tKHRoaXMucm9vbSwgbnVsbCk7XG4gIH1cblxuICAvLyBvcHRpb25zOiB7IGRhdGFjaGFubmVsOiBib29sLCBhdWRpbzogYm9vbCwgdmlkZW86IGJvb2wgfVxuICBzZXRXZWJSdGNPcHRpb25zKG9wdGlvbnMpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0V2ViUnRjT3B0aW9ucyBcIiwgb3B0aW9ucyk7XG4gICAgLy8gdGhpcy5lYXN5cnRjLmVuYWJsZURlYnVnKHRydWUpO1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVEYXRhQ2hhbm5lbHMob3B0aW9ucy5kYXRhY2hhbm5lbCk7XG5cbiAgICAvLyB1c2luZyBBZ29yYVxuICAgIHRoaXMuZW5hYmxlVmlkZW8gPSBvcHRpb25zLnZpZGVvO1xuICAgIHRoaXMuZW5hYmxlQXVkaW8gPSBvcHRpb25zLmF1ZGlvO1xuXG4gICAgLy8gbm90IGVhc3lydGNcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlVmlkZW8oZmFsc2UpO1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVBdWRpbyhmYWxzZSk7XG4gICAgdGhpcy5lYXN5cnRjLmVuYWJsZVZpZGVvUmVjZWl2ZShmYWxzZSk7XG4gICAgdGhpcy5lYXN5cnRjLmVuYWJsZUF1ZGlvUmVjZWl2ZShmYWxzZSk7XG4gIH1cblxuICBzZXRTZXJ2ZXJDb25uZWN0TGlzdGVuZXJzKHN1Y2Nlc3NMaXN0ZW5lciwgZmFpbHVyZUxpc3RlbmVyKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNldFNlcnZlckNvbm5lY3RMaXN0ZW5lcnMgXCIsIHN1Y2Nlc3NMaXN0ZW5lciwgZmFpbHVyZUxpc3RlbmVyKTtcbiAgICB0aGlzLmNvbm5lY3RTdWNjZXNzID0gc3VjY2Vzc0xpc3RlbmVyO1xuICAgIHRoaXMuY29ubmVjdEZhaWx1cmUgPSBmYWlsdXJlTGlzdGVuZXI7XG4gIH1cblxuICBzZXRSb29tT2NjdXBhbnRMaXN0ZW5lcihvY2N1cGFudExpc3RlbmVyKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNldFJvb21PY2N1cGFudExpc3RlbmVyIFwiLCBvY2N1cGFudExpc3RlbmVyKTtcblxuICAgIHRoaXMuZWFzeXJ0Yy5zZXRSb29tT2NjdXBhbnRMaXN0ZW5lcihmdW5jdGlvbiAocm9vbU5hbWUsIG9jY3VwYW50cywgcHJpbWFyeSkge1xuICAgICAgb2NjdXBhbnRMaXN0ZW5lcihvY2N1cGFudHMpO1xuICAgIH0pO1xuICB9XG5cbiAgc2V0RGF0YUNoYW5uZWxMaXN0ZW5lcnMob3Blbkxpc3RlbmVyLCBjbG9zZWRMaXN0ZW5lciwgbWVzc2FnZUxpc3RlbmVyKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNldERhdGFDaGFubmVsTGlzdGVuZXJzICBcIiwgb3Blbkxpc3RlbmVyLCBjbG9zZWRMaXN0ZW5lciwgbWVzc2FnZUxpc3RlbmVyKTtcbiAgICB0aGlzLmVhc3lydGMuc2V0RGF0YUNoYW5uZWxPcGVuTGlzdGVuZXIob3Blbkxpc3RlbmVyKTtcbiAgICB0aGlzLmVhc3lydGMuc2V0RGF0YUNoYW5uZWxDbG9zZUxpc3RlbmVyKGNsb3NlZExpc3RlbmVyKTtcbiAgICB0aGlzLmVhc3lydGMuc2V0UGVlckxpc3RlbmVyKG1lc3NhZ2VMaXN0ZW5lcik7XG4gIH1cblxuICB1cGRhdGVUaW1lT2Zmc2V0KCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyB1cGRhdGVUaW1lT2Zmc2V0IFwiKTtcbiAgICBjb25zdCBjbGllbnRTZW50VGltZSA9IERhdGUubm93KCkgKyB0aGlzLmF2Z1RpbWVPZmZzZXQ7XG5cbiAgICByZXR1cm4gZmV0Y2goZG9jdW1lbnQubG9jYXRpb24uaHJlZiwgeyBtZXRob2Q6IFwiSEVBRFwiLCBjYWNoZTogXCJuby1jYWNoZVwiIH0pLnRoZW4ocmVzID0+IHtcbiAgICAgIHZhciBwcmVjaXNpb24gPSAxMDAwO1xuICAgICAgdmFyIHNlcnZlclJlY2VpdmVkVGltZSA9IG5ldyBEYXRlKHJlcy5oZWFkZXJzLmdldChcIkRhdGVcIikpLmdldFRpbWUoKSArIHByZWNpc2lvbiAvIDI7XG4gICAgICB2YXIgY2xpZW50UmVjZWl2ZWRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgIHZhciBzZXJ2ZXJUaW1lID0gc2VydmVyUmVjZWl2ZWRUaW1lICsgKGNsaWVudFJlY2VpdmVkVGltZSAtIGNsaWVudFNlbnRUaW1lKSAvIDI7XG4gICAgICB2YXIgdGltZU9mZnNldCA9IHNlcnZlclRpbWUgLSBjbGllbnRSZWNlaXZlZFRpbWU7XG5cbiAgICAgIHRoaXMuc2VydmVyVGltZVJlcXVlc3RzKys7XG5cbiAgICAgIGlmICh0aGlzLnNlcnZlclRpbWVSZXF1ZXN0cyA8PSAxMCkge1xuICAgICAgICB0aGlzLnRpbWVPZmZzZXRzLnB1c2godGltZU9mZnNldCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnRpbWVPZmZzZXRzW3RoaXMuc2VydmVyVGltZVJlcXVlc3RzICUgMTBdID0gdGltZU9mZnNldDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5hdmdUaW1lT2Zmc2V0ID0gdGhpcy50aW1lT2Zmc2V0cy5yZWR1Y2UoKGFjYywgb2Zmc2V0KSA9PiBhY2MgKz0gb2Zmc2V0LCAwKSAvIHRoaXMudGltZU9mZnNldHMubGVuZ3RoO1xuXG4gICAgICBpZiAodGhpcy5zZXJ2ZXJUaW1lUmVxdWVzdHMgPiAxMCkge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMudXBkYXRlVGltZU9mZnNldCgpLCA1ICogNjAgKiAxMDAwKTsgLy8gU3luYyBjbG9jayBldmVyeSA1IG1pbnV0ZXMuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnVwZGF0ZVRpbWVPZmZzZXQoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGNvbm5lY3QoKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGNvbm5lY3QgXCIpO1xuICAgIFByb21pc2UuYWxsKFt0aGlzLnVwZGF0ZVRpbWVPZmZzZXQoKSwgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5fY29ubmVjdChyZXNvbHZlLCByZWplY3QpO1xuICAgIH0pXSkudGhlbigoW18sIGNsaWVudElkXSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJCVzczIGNvbm5lY3RlZCBcIiArIGNsaWVudElkKTtcbiAgICAgIHRoaXMuY2xpZW50SWQgPSBjbGllbnRJZDtcbiAgICAgIHRoaXMuX215Um9vbUpvaW5UaW1lID0gdGhpcy5fZ2V0Um9vbUpvaW5UaW1lKGNsaWVudElkKTtcbiAgICAgIHRoaXMuY29ubmVjdEFnb3JhKCk7XG4gICAgICB0aGlzLmNvbm5lY3RTdWNjZXNzKGNsaWVudElkKTtcbiAgICB9KS5jYXRjaCh0aGlzLmNvbm5lY3RGYWlsdXJlKTtcbiAgfVxuXG4gIHNob3VsZFN0YXJ0Q29ubmVjdGlvblRvKGNsaWVudCkge1xuICAgIHJldHVybiB0aGlzLl9teVJvb21Kb2luVGltZSA8PSBjbGllbnQucm9vbUpvaW5UaW1lO1xuICB9XG5cbiAgc3RhcnRTdHJlYW1Db25uZWN0aW9uKGNsaWVudElkKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHN0YXJ0U3RyZWFtQ29ubmVjdGlvbiBcIiwgY2xpZW50SWQpO1xuICAgIHRoaXMuZWFzeXJ0Yy5jYWxsKGNsaWVudElkLCBmdW5jdGlvbiAoY2FsbGVyLCBtZWRpYSkge1xuICAgICAgaWYgKG1lZGlhID09PSBcImRhdGFjaGFubmVsXCIpIHtcbiAgICAgICAgTkFGLmxvZy53cml0ZShcIlN1Y2Nlc3NmdWxseSBzdGFydGVkIGRhdGFjaGFubmVsIHRvIFwiLCBjYWxsZXIpO1xuICAgICAgfVxuICAgIH0sIGZ1bmN0aW9uIChlcnJvckNvZGUsIGVycm9yVGV4dCkge1xuICAgICAgTkFGLmxvZy5lcnJvcihlcnJvckNvZGUsIGVycm9yVGV4dCk7XG4gICAgfSwgZnVuY3Rpb24gKHdhc0FjY2VwdGVkKSB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIndhcyBhY2NlcHRlZD1cIiArIHdhc0FjY2VwdGVkKTtcbiAgICB9KTtcbiAgfVxuXG4gIGNsb3NlU3RyZWFtQ29ubmVjdGlvbihjbGllbnRJZCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBjbG9zZVN0cmVhbUNvbm5lY3Rpb24gXCIsIGNsaWVudElkKTtcbiAgICB0aGlzLmVhc3lydGMuaGFuZ3VwKGNsaWVudElkKTtcbiAgfVxuXG4gIHNlbmREYXRhKGNsaWVudElkLCBkYXRhVHlwZSwgZGF0YSkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZW5kRGF0YSBcIiwgY2xpZW50SWQsIGRhdGFUeXBlLCBkYXRhKTtcbiAgICAvLyBzZW5kIHZpYSB3ZWJydGMgb3RoZXJ3aXNlIGZhbGxiYWNrIHRvIHdlYnNvY2tldHNcbiAgICB0aGlzLmVhc3lydGMuc2VuZERhdGEoY2xpZW50SWQsIGRhdGFUeXBlLCBkYXRhKTtcbiAgfVxuXG4gIHNlbmREYXRhR3VhcmFudGVlZChjbGllbnRJZCwgZGF0YVR5cGUsIGRhdGEpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2VuZERhdGFHdWFyYW50ZWVkIFwiLCBjbGllbnRJZCwgZGF0YVR5cGUsIGRhdGEpO1xuICAgIHRoaXMuZWFzeXJ0Yy5zZW5kRGF0YVdTKGNsaWVudElkLCBkYXRhVHlwZSwgZGF0YSk7XG4gIH1cblxuICBicm9hZGNhc3REYXRhKGRhdGFUeXBlLCBkYXRhKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGJyb2FkY2FzdERhdGEgXCIsIGRhdGFUeXBlLCBkYXRhKTtcbiAgICB2YXIgcm9vbU9jY3VwYW50cyA9IHRoaXMuZWFzeXJ0Yy5nZXRSb29tT2NjdXBhbnRzQXNNYXAodGhpcy5yb29tKTtcblxuICAgIC8vIEl0ZXJhdGUgb3ZlciB0aGUga2V5cyBvZiB0aGUgZWFzeXJ0YyByb29tIG9jY3VwYW50cyBtYXAuXG4gICAgLy8gZ2V0Um9vbU9jY3VwYW50c0FzQXJyYXkgdXNlcyBPYmplY3Qua2V5cyB3aGljaCBhbGxvY2F0ZXMgbWVtb3J5LlxuICAgIGZvciAodmFyIHJvb21PY2N1cGFudCBpbiByb29tT2NjdXBhbnRzKSB7XG4gICAgICBpZiAocm9vbU9jY3VwYW50c1tyb29tT2NjdXBhbnRdICYmIHJvb21PY2N1cGFudCAhPT0gdGhpcy5lYXN5cnRjLm15RWFzeXJ0Y2lkKSB7XG4gICAgICAgIC8vIHNlbmQgdmlhIHdlYnJ0YyBvdGhlcndpc2UgZmFsbGJhY2sgdG8gd2Vic29ja2V0c1xuICAgICAgICB0aGlzLmVhc3lydGMuc2VuZERhdGEocm9vbU9jY3VwYW50LCBkYXRhVHlwZSwgZGF0YSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYnJvYWRjYXN0RGF0YUd1YXJhbnRlZWQoZGF0YVR5cGUsIGRhdGEpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgYnJvYWRjYXN0RGF0YUd1YXJhbnRlZWQgXCIsIGRhdGFUeXBlLCBkYXRhKTtcbiAgICB2YXIgZGVzdGluYXRpb24gPSB7IHRhcmdldFJvb206IHRoaXMucm9vbSB9O1xuICAgIHRoaXMuZWFzeXJ0Yy5zZW5kRGF0YVdTKGRlc3RpbmF0aW9uLCBkYXRhVHlwZSwgZGF0YSk7XG4gIH1cblxuICBnZXRDb25uZWN0U3RhdHVzKGNsaWVudElkKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGdldENvbm5lY3RTdGF0dXMgXCIsIGNsaWVudElkKTtcbiAgICB2YXIgc3RhdHVzID0gdGhpcy5lYXN5cnRjLmdldENvbm5lY3RTdGF0dXMoY2xpZW50SWQpO1xuXG4gICAgaWYgKHN0YXR1cyA9PSB0aGlzLmVhc3lydGMuSVNfQ09OTkVDVEVEKSB7XG4gICAgICByZXR1cm4gTkFGLmFkYXB0ZXJzLklTX0NPTk5FQ1RFRDtcbiAgICB9IGVsc2UgaWYgKHN0YXR1cyA9PSB0aGlzLmVhc3lydGMuTk9UX0NPTk5FQ1RFRCkge1xuICAgICAgcmV0dXJuIE5BRi5hZGFwdGVycy5OT1RfQ09OTkVDVEVEO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gTkFGLmFkYXB0ZXJzLkNPTk5FQ1RJTkc7XG4gICAgfVxuICB9XG5cbiAgZ2V0TWVkaWFTdHJlYW0oY2xpZW50SWQsIHN0cmVhbU5hbWUgPSBcImF1ZGlvXCIpIHtcblxuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBnZXRNZWRpYVN0cmVhbSBcIiwgY2xpZW50SWQsIHN0cmVhbU5hbWUpO1xuXG4gICAgaWYgKHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXSAmJiB0aGlzLm1lZGlhU3RyZWFtc1tjbGllbnRJZF1bc3RyZWFtTmFtZV0pIHtcbiAgICAgIE5BRi5sb2cud3JpdGUoYEFscmVhZHkgaGFkICR7c3RyZWFtTmFtZX0gZm9yICR7Y2xpZW50SWR9YCk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXVtzdHJlYW1OYW1lXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIE5BRi5sb2cud3JpdGUoYFdhaXRpbmcgb24gJHtzdHJlYW1OYW1lfSBmb3IgJHtjbGllbnRJZH1gKTtcblxuICAgICAgLy8gQ3JlYXRlIGluaXRpYWwgcGVuZGluZ01lZGlhUmVxdWVzdHMgd2l0aCBhdWRpb3x2aWRlbyBhbGlhc1xuICAgICAgaWYgKCF0aGlzLnBlbmRpbmdNZWRpYVJlcXVlc3RzLmhhcyhjbGllbnRJZCkpIHtcbiAgICAgICAgY29uc3QgcGVuZGluZ01lZGlhUmVxdWVzdHMgPSB7fTtcblxuICAgICAgICBjb25zdCBhdWRpb1Byb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHMuYXVkaW8gPSB7IHJlc29sdmUsIHJlamVjdCB9O1xuICAgICAgICB9KS5jYXRjaChlID0+IE5BRi5sb2cud2FybihgJHtjbGllbnRJZH0gZ2V0TWVkaWFTdHJlYW0gQXVkaW8gRXJyb3JgLCBlKSk7XG4gICAgICAgIHBlbmRpbmdNZWRpYVJlcXVlc3RzLmF1ZGlvLnByb21pc2UgPSBhdWRpb1Byb21pc2U7XG5cbiAgICAgICAgY29uc3QgdmlkZW9Qcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIHBlbmRpbmdNZWRpYVJlcXVlc3RzLnZpZGVvID0geyByZXNvbHZlLCByZWplY3QgfTtcbiAgICAgICAgfSkuY2F0Y2goZSA9PiBOQUYubG9nLndhcm4oYCR7Y2xpZW50SWR9IGdldE1lZGlhU3RyZWFtIFZpZGVvIEVycm9yYCwgZSkpO1xuICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0cy52aWRlby5wcm9taXNlID0gdmlkZW9Qcm9taXNlO1xuXG4gICAgICAgIHRoaXMucGVuZGluZ01lZGlhUmVxdWVzdHMuc2V0KGNsaWVudElkLCBwZW5kaW5nTWVkaWFSZXF1ZXN0cyk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBlbmRpbmdNZWRpYVJlcXVlc3RzID0gdGhpcy5wZW5kaW5nTWVkaWFSZXF1ZXN0cy5nZXQoY2xpZW50SWQpO1xuXG4gICAgICAvLyBDcmVhdGUgaW5pdGlhbCBwZW5kaW5nTWVkaWFSZXF1ZXN0cyB3aXRoIHN0cmVhbU5hbWVcbiAgICAgIGlmICghcGVuZGluZ01lZGlhUmVxdWVzdHNbc3RyZWFtTmFtZV0pIHtcbiAgICAgICAgY29uc3Qgc3RyZWFtUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0c1tzdHJlYW1OYW1lXSA9IHsgcmVzb2x2ZSwgcmVqZWN0IH07XG4gICAgICAgIH0pLmNhdGNoKGUgPT4gTkFGLmxvZy53YXJuKGAke2NsaWVudElkfSBnZXRNZWRpYVN0cmVhbSBcIiR7c3RyZWFtTmFtZX1cIiBFcnJvcmAsIGUpKTtcbiAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHNbc3RyZWFtTmFtZV0ucHJvbWlzZSA9IHN0cmVhbVByb21pc2U7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnBlbmRpbmdNZWRpYVJlcXVlc3RzLmdldChjbGllbnRJZClbc3RyZWFtTmFtZV0ucHJvbWlzZTtcbiAgICB9XG4gIH1cblxuICBzZXRNZWRpYVN0cmVhbShjbGllbnRJZCwgc3RyZWFtLCBzdHJlYW1OYW1lKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNldE1lZGlhU3RyZWFtIFwiLCBjbGllbnRJZCwgc3RyZWFtLCBzdHJlYW1OYW1lKTtcbiAgICBjb25zdCBwZW5kaW5nTWVkaWFSZXF1ZXN0cyA9IHRoaXMucGVuZGluZ01lZGlhUmVxdWVzdHMuZ2V0KGNsaWVudElkKTsgLy8gcmV0dXJuIHVuZGVmaW5lZCBpZiB0aGVyZSBpcyBubyBlbnRyeSBpbiB0aGUgTWFwXG4gICAgY29uc3QgY2xpZW50TWVkaWFTdHJlYW1zID0gdGhpcy5tZWRpYVN0cmVhbXNbY2xpZW50SWRdID0gdGhpcy5tZWRpYVN0cmVhbXNbY2xpZW50SWRdIHx8IHt9O1xuXG4gICAgaWYgKHN0cmVhbU5hbWUgPT09ICdkZWZhdWx0Jykge1xuICAgICAgLy8gU2FmYXJpIGRvZXNuJ3QgbGlrZSBpdCB3aGVuIHlvdSB1c2UgYSBtaXhlZCBtZWRpYSBzdHJlYW0gd2hlcmUgb25lIG9mIHRoZSB0cmFja3MgaXMgaW5hY3RpdmUsIHNvIHdlXG4gICAgICAvLyBzcGxpdCB0aGUgdHJhY2tzIGludG8gdHdvIHN0cmVhbXMuXG4gICAgICAvLyBBZGQgbWVkaWFTdHJlYW1zIGF1ZGlvIHN0cmVhbU5hbWUgYWxpYXNcbiAgICAgIGNvbnN0IGF1ZGlvVHJhY2tzID0gc3RyZWFtLmdldEF1ZGlvVHJhY2tzKCk7XG4gICAgICBpZiAoYXVkaW9UcmFja3MubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBhdWRpb1N0cmVhbSA9IG5ldyBNZWRpYVN0cmVhbSgpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGF1ZGlvVHJhY2tzLmZvckVhY2godHJhY2sgPT4gYXVkaW9TdHJlYW0uYWRkVHJhY2sodHJhY2spKTtcbiAgICAgICAgICBjbGllbnRNZWRpYVN0cmVhbXMuYXVkaW8gPSBhdWRpb1N0cmVhbTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIE5BRi5sb2cud2FybihgJHtjbGllbnRJZH0gc2V0TWVkaWFTdHJlYW0gXCJhdWRpb1wiIGFsaWFzIEVycm9yYCwgZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZXNvbHZlIHRoZSBwcm9taXNlIGZvciB0aGUgdXNlcidzIG1lZGlhIHN0cmVhbSBhdWRpbyBhbGlhcyBpZiBpdCBleGlzdHMuXG4gICAgICAgIGlmIChwZW5kaW5nTWVkaWFSZXF1ZXN0cykgcGVuZGluZ01lZGlhUmVxdWVzdHMuYXVkaW8ucmVzb2x2ZShhdWRpb1N0cmVhbSk7XG4gICAgICB9XG5cbiAgICAgIC8vIEFkZCBtZWRpYVN0cmVhbXMgdmlkZW8gc3RyZWFtTmFtZSBhbGlhc1xuICAgICAgY29uc3QgdmlkZW9UcmFja3MgPSBzdHJlYW0uZ2V0VmlkZW9UcmFja3MoKTtcbiAgICAgIGlmICh2aWRlb1RyYWNrcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IHZpZGVvU3RyZWFtID0gbmV3IE1lZGlhU3RyZWFtKCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdmlkZW9UcmFja3MuZm9yRWFjaCh0cmFjayA9PiB2aWRlb1N0cmVhbS5hZGRUcmFjayh0cmFjaykpO1xuICAgICAgICAgIGNsaWVudE1lZGlhU3RyZWFtcy52aWRlbyA9IHZpZGVvU3RyZWFtO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgTkFGLmxvZy53YXJuKGAke2NsaWVudElkfSBzZXRNZWRpYVN0cmVhbSBcInZpZGVvXCIgYWxpYXMgRXJyb3JgLCBlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlc29sdmUgdGhlIHByb21pc2UgZm9yIHRoZSB1c2VyJ3MgbWVkaWEgc3RyZWFtIHZpZGVvIGFsaWFzIGlmIGl0IGV4aXN0cy5cbiAgICAgICAgaWYgKHBlbmRpbmdNZWRpYVJlcXVlc3RzKSBwZW5kaW5nTWVkaWFSZXF1ZXN0cy52aWRlby5yZXNvbHZlKHZpZGVvU3RyZWFtKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY2xpZW50TWVkaWFTdHJlYW1zW3N0cmVhbU5hbWVdID0gc3RyZWFtO1xuXG4gICAgICAvLyBSZXNvbHZlIHRoZSBwcm9taXNlIGZvciB0aGUgdXNlcidzIG1lZGlhIHN0cmVhbSBieSBTdHJlYW1OYW1lIGlmIGl0IGV4aXN0cy5cbiAgICAgIGlmIChwZW5kaW5nTWVkaWFSZXF1ZXN0cyAmJiBwZW5kaW5nTWVkaWFSZXF1ZXN0c1tzdHJlYW1OYW1lXSkge1xuICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0c1tzdHJlYW1OYW1lXS5yZXNvbHZlKHN0cmVhbSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYWRkTG9jYWxNZWRpYVN0cmVhbShzdHJlYW0sIHN0cmVhbU5hbWUpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgYWRkTG9jYWxNZWRpYVN0cmVhbSBcIiwgc3RyZWFtLCBzdHJlYW1OYW1lKTtcbiAgICBjb25zdCBlYXN5cnRjID0gdGhpcy5lYXN5cnRjO1xuICAgIHN0cmVhbU5hbWUgPSBzdHJlYW1OYW1lIHx8IHN0cmVhbS5pZDtcbiAgICB0aGlzLnNldE1lZGlhU3RyZWFtKFwibG9jYWxcIiwgc3RyZWFtLCBzdHJlYW1OYW1lKTtcbiAgICBlYXN5cnRjLnJlZ2lzdGVyM3JkUGFydHlMb2NhbE1lZGlhU3RyZWFtKHN0cmVhbSwgc3RyZWFtTmFtZSk7XG5cbiAgICAvLyBBZGQgbG9jYWwgc3RyZWFtIHRvIGV4aXN0aW5nIGNvbm5lY3Rpb25zXG4gICAgT2JqZWN0LmtleXModGhpcy5yZW1vdGVDbGllbnRzKS5mb3JFYWNoKGNsaWVudElkID0+IHtcbiAgICAgIGlmIChlYXN5cnRjLmdldENvbm5lY3RTdGF0dXMoY2xpZW50SWQpICE9PSBlYXN5cnRjLk5PVF9DT05ORUNURUQpIHtcbiAgICAgICAgZWFzeXJ0Yy5hZGRTdHJlYW1Ub0NhbGwoY2xpZW50SWQsIHN0cmVhbU5hbWUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcmVtb3ZlTG9jYWxNZWRpYVN0cmVhbShzdHJlYW1OYW1lKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHJlbW92ZUxvY2FsTWVkaWFTdHJlYW0gXCIsIHN0cmVhbU5hbWUpO1xuICAgIHRoaXMuZWFzeXJ0Yy5jbG9zZUxvY2FsTWVkaWFTdHJlYW0oc3RyZWFtTmFtZSk7XG4gICAgZGVsZXRlIHRoaXMubWVkaWFTdHJlYW1zW1wibG9jYWxcIl1bc3RyZWFtTmFtZV07XG4gIH1cblxuICBlbmFibGVNaWNyb3Bob25lKGVuYWJsZWQpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgZW5hYmxlTWljcm9waG9uZSBcIiwgZW5hYmxlZCk7XG4gICAgdGhpcy5lYXN5cnRjLmVuYWJsZU1pY3JvcGhvbmUoZW5hYmxlZCk7XG4gIH1cblxuICBlbmFibGVDYW1lcmEoZW5hYmxlZCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBlbmFibGVDYW1lcmEgXCIsIGVuYWJsZWQpO1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVDYW1lcmEoZW5hYmxlZCk7XG4gIH1cblxuICBkaXNjb25uZWN0KCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBkaXNjb25uZWN0IFwiKTtcbiAgICB0aGlzLmVhc3lydGMuZGlzY29ubmVjdCgpO1xuICB9XG5cbiAgYXN5bmMgaGFuZGxlVXNlclB1Ymxpc2hlZCh1c2VyLCBtZWRpYVR5cGUpIHt9XG5cbiAgaGFuZGxlVXNlclVucHVibGlzaGVkKHVzZXIsIG1lZGlhVHlwZSkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBoYW5kbGVVc2VyVW5QdWJsaXNoZWQgXCIpO1xuICB9XG5cbiAgYXN5bmMgY29ubmVjdEFnb3JhKCkge1xuICAgIC8vIEFkZCBhbiBldmVudCBsaXN0ZW5lciB0byBwbGF5IHJlbW90ZSB0cmFja3Mgd2hlbiByZW1vdGUgdXNlciBwdWJsaXNoZXMuXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgaWYgKHRoaXMuZW5hYmxlVmlkZW8gfHwgdGhpcy5lbmFibGVBdWRpbykge1xuICAgICAgdGhpcy5hZ29yYUNsaWVudCA9IEFnb3JhUlRDLmNyZWF0ZUNsaWVudCh7IG1vZGU6IFwicnRjXCIsIGNvZGVjOiBcInZwOFwiIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmFnb3JhQ2xpZW50ID0gQWdvcmFSVEMuY3JlYXRlQ2xpZW50KHsgbW9kZTogXCJsaXZlXCIsIGNvZGVjOiBcInZwOFwiIH0pO1xuICAgIH1cblxuICAgIHRoaXMuYWdvcmFDbGllbnQub24oXCJ1c2VyLXB1Ymxpc2hlZFwiLCBhc3luYyAodXNlciwgbWVkaWFUeXBlKSA9PiB7XG5cbiAgICAgIGxldCBjbGllbnRJZCA9IHVzZXIudWlkO1xuICAgICAgY29uc29sZS5sb2coXCJCVzczIGhhbmRsZVVzZXJQdWJsaXNoZWQgXCIgKyBjbGllbnRJZCArIFwiIFwiICsgbWVkaWFUeXBlLCB0aGF0LmFnb3JhQ2xpZW50KTtcbiAgICAgIGF3YWl0IHRoYXQuYWdvcmFDbGllbnQuc3Vic2NyaWJlKHVzZXIsIG1lZGlhVHlwZSk7XG4gICAgICBjb25zb2xlLmxvZyhcIkJXNzMgaGFuZGxlVXNlclB1Ymxpc2hlZDIgXCIgKyBjbGllbnRJZCArIFwiIFwiICsgdGhhdC5hZ29yYUNsaWVudCk7XG5cbiAgICAgIGNvbnN0IHBlbmRpbmdNZWRpYVJlcXVlc3RzID0gdGhhdC5wZW5kaW5nTWVkaWFSZXF1ZXN0cy5nZXQoY2xpZW50SWQpO1xuICAgICAgY29uc3QgY2xpZW50TWVkaWFTdHJlYW1zID0gdGhhdC5tZWRpYVN0cmVhbXNbY2xpZW50SWRdID0gdGhhdC5tZWRpYVN0cmVhbXNbY2xpZW50SWRdIHx8IHt9O1xuXG4gICAgICBpZiAobWVkaWFUeXBlID09PSAnYXVkaW8nKSB7XG4gICAgICAgIGNvbnN0IGF1ZGlvU3RyZWFtID0gbmV3IE1lZGlhU3RyZWFtKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwidXNlci5hdWRpb1RyYWNrIFwiLCB1c2VyLmF1ZGlvVHJhY2suX21lZGlhU3RyZWFtVHJhY2spO1xuICAgICAgICBhdWRpb1N0cmVhbS5hZGRUcmFjayh1c2VyLmF1ZGlvVHJhY2suX21lZGlhU3RyZWFtVHJhY2spO1xuICAgICAgICBjbGllbnRNZWRpYVN0cmVhbXMuYXVkaW8gPSBhdWRpb1N0cmVhbTtcbiAgICAgICAgaWYgKHBlbmRpbmdNZWRpYVJlcXVlc3RzKSBwZW5kaW5nTWVkaWFSZXF1ZXN0cy5hdWRpby5yZXNvbHZlKGF1ZGlvU3RyZWFtKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG1lZGlhVHlwZSA9PT0gJ3ZpZGVvJykge1xuICAgICAgICBjb25zdCB2aWRlb1N0cmVhbSA9IG5ldyBNZWRpYVN0cmVhbSgpO1xuICAgICAgICBjb25zb2xlLmxvZyhcInVzZXIudmlkZW9UcmFjayBcIiwgdXNlci52aWRlb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrKTtcbiAgICAgICAgdmlkZW9TdHJlYW0uYWRkVHJhY2sodXNlci52aWRlb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrKTtcbiAgICAgICAgY2xpZW50TWVkaWFTdHJlYW1zLnZpZGVvID0gdmlkZW9TdHJlYW07XG4gICAgICAgIGlmIChwZW5kaW5nTWVkaWFSZXF1ZXN0cykgcGVuZGluZ01lZGlhUmVxdWVzdHMudmlkZW8ucmVzb2x2ZSh2aWRlb1N0cmVhbSk7XG4gICAgICAgIC8vdXNlci52aWRlb1RyYWNrXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmFnb3JhQ2xpZW50Lm9uKFwidXNlci11bnB1Ymxpc2hlZFwiLCB0aGF0LmhhbmRsZVVzZXJVbnB1Ymxpc2hlZCk7XG5cbiAgICBjb25zb2xlLmxvZyhcImNvbm5lY3QgYWdvcmEgXCIpO1xuICAgIC8vIEpvaW4gYSBjaGFubmVsIGFuZCBjcmVhdGUgbG9jYWwgdHJhY2tzLiBCZXN0IHByYWN0aWNlIGlzIHRvIHVzZSBQcm9taXNlLmFsbCBhbmQgcnVuIHRoZW0gY29uY3VycmVudGx5LlxuICAgIC8vIG9cblxuXG4gaWYgKHRoaXMuZW5hYmxlQXZhdGFyKSB7XG4gICAgICAgIHZhciBzdHJlYW0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbnZhc1wiKS5jYXB0dXJlU3RyZWFtKDMwKTtcbiAgICAgICAgW3RoaXMudXNlcmlkLCB0aGlzLmxvY2FsVHJhY2tzLmF1ZGlvVHJhY2ssIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFja10gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgIHRoaXMuYWdvcmFDbGllbnQuam9pbih0aGlzLmFwcGlkLCB0aGlzLnJvb20sIHRoaXMudG9rZW4gfHwgbnVsbCwgdGhpcy5jbGllbnRJZCB8fCBudWxsKSxcbiAgICAgICAgQWdvcmFSVEMuY3JlYXRlTWljcm9waG9uZUF1ZGlvVHJhY2soKSwgQWdvcmFSVEMuY3JlYXRlQ3VzdG9tVmlkZW9UcmFjayh7IG1lZGlhU3RyZWFtVHJhY2s6IHN0cmVhbS5nZXRWaWRlb1RyYWNrcygpWzBdIH0pXSk7XG4gfVxuIGVsc2UgaWYgKHRoaXMuZW5hYmxlVmlkZW8gJiYgdGhpcy5lbmFibGVBdWRpbykge1xuICAgICAgW3RoaXMudXNlcmlkLCB0aGlzLmxvY2FsVHJhY2tzLmF1ZGlvVHJhY2ssIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFja10gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICB0aGlzLmFnb3JhQ2xpZW50LmpvaW4odGhpcy5hcHBpZCwgdGhpcy5yb29tLCB0aGlzLnRva2VuIHx8IG51bGwsIHRoaXMuY2xpZW50SWQgfHwgbnVsbCksXG4gICAgICBBZ29yYVJUQy5jcmVhdGVNaWNyb3Bob25lQXVkaW9UcmFjaygpLCBBZ29yYVJUQy5jcmVhdGVDYW1lcmFWaWRlb1RyYWNrKHtlbmNvZGVyQ29uZmlnOiAnMzYwcF80J30pXSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmVuYWJsZVZpZGVvKSB7XG4gICAgICBbdGhpcy51c2VyaWQsIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFja10gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAvLyBKb2luIHRoZSBjaGFubmVsLlxuICAgICAgdGhpcy5hZ29yYUNsaWVudC5qb2luKHRoaXMuYXBwaWQsIHRoaXMucm9vbSwgdGhpcy50b2tlbiB8fCBudWxsLCB0aGlzLmNsaWVudElkIHx8IG51bGwpLCBBZ29yYVJUQy5jcmVhdGVDYW1lcmFWaWRlb1RyYWNrKFwiMzYwcF80XCIpXSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmVuYWJsZUF1ZGlvKSB7XG4gICAgICBbdGhpcy51c2VyaWQsIHRoaXMubG9jYWxUcmFja3MuYXVkaW9UcmFja10gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAvLyBKb2luIHRoZSBjaGFubmVsLlxuICAgICAgdGhpcy5hZ29yYUNsaWVudC5qb2luKHRoaXMuYXBwaWQsIHRoaXMucm9vbSwgdGhpcy50b2tlbiB8fCBudWxsLCB0aGlzLmNsaWVudElkIHx8IG51bGwpLCBBZ29yYVJUQy5jcmVhdGVNaWNyb3Bob25lQXVkaW9UcmFjaygpXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudXNlcmlkID0gYXdhaXQgdGhpcy5hZ29yYUNsaWVudC5qb2luKHRoaXMuYXBwaWQsIHRoaXMucm9vbSwgdGhpcy50b2tlbiB8fCBudWxsLCB0aGlzLmNsaWVudElkIHx8IG51bGwpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmVuYWJsZVZpZGVvICYmIHRoaXMuc2hvd0xvY2FsKSB7XG4gICAgICB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2sucGxheShcImxvY2FsLXBsYXllclwiKTtcbiAgICB9XG5cdCAgXG4gICAgLy8gc2VsZWN0IGZhY2V0aW1lIGNhbWVyYSBpZiBleGlzdHNcbiAgICBsZXQgY2FtcyA9IGF3YWl0IEFnb3JhUlRDLmdldENhbWVyYXMoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNhbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChjYW1zW2ldLmxhYmVsLmluZGV4T2YoXCJGYWNlVGltZVwiKSA9PSAwKSB7XG5cdGNvbnNvbGUubG9nKFwic2VsZWN0IEZhY2VUaW1lIGNhbWVyYVwiLGNhbXNbaV0uZGV2aWNlSWQgKTtcbiAgICBcdGF3YWl0IHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjay5zZXREZXZpY2UoY2Ftc1tpXS5kZXZpY2VJZCk7XG4gICAgICB9XG4gICAgfVxuXHQgIFxuXG4gICAgLy8gRW5hYmxlIHZpcnR1YWwgYmFja2dyb3VuZCBPTEQgTWV0aG9kXG4gICAgaWYgKHRoaXMuZW5hYmxlVmlkZW8gJiYgdGhpcy52YmcwICYmIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjaykge1xuICAgICAgICBjb25zdCBpbWdFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG4gICAgICAgIGltZ0VsZW1lbnQub25sb2FkID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICAgIGlmICghdGhpcy52aXJ0dWFsQmFja2dyb3VuZEluc3RhbmNlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlNFRyBJTklUIFwiLCB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2spO1xuICAgICAgICAgICAgdGhpcy52aXJ0dWFsQmFja2dyb3VuZEluc3RhbmNlID0gYXdhaXQgU2VnUGx1Z2luLmluamVjdCh0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2ssIFwiL2Fzc2V0cy93YXNtczBcIikuY2F0Y2goY29uc29sZS5lcnJvcik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlNFRyBJTklURURcIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMudmlydHVhbEJhY2tncm91bmRJbnN0YW5jZS5zZXRPcHRpb25zKHsgZW5hYmxlOiB0cnVlLCBiYWNrZ3JvdW5kOiBpbWdFbGVtZW50IH0pO1xuICAgICAgICB9O1xuICAgICAgICBpbWdFbGVtZW50LnNyYyA9ICdkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUFRQUFBQURDQUlBQUFBN2xqbVJBQUFBRDBsRVFWUjRYbU5nK00rQVFEZzVBT2s5Qy9Wa29tellBQUFBQUVsRlRrU3VRbUNDJztcbiAgICB9XG5cbiAgICAvLyBFbmFibGUgdmlydHVhbCBiYWNrZ3JvdW5kIE5ldyBNZXRob2RcbiAgICBpZiAodGhpcy5lbmFibGVWaWRlbyAmJiB0aGlzLnZiZyAmJiB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2spIHtcblxuXHR0aGlzLmV4dGVuc2lvbiA9IG5ldyBWaXJ0dWFsQmFja2dyb3VuZEV4dGVuc2lvbigpO1xuXHRBZ29yYVJUQy5yZWdpc3RlckV4dGVuc2lvbnMoW3RoaXMuZXh0ZW5zaW9uXSk7XG5cdHRoaXMucHJvY2Vzc29yID0gdGhpcy5leHRlbnNpb24uY3JlYXRlUHJvY2Vzc29yKCk7XG5cdGF3YWl0IHRoaXMucHJvY2Vzc29yLmluaXQoXCIvYXNzZXRzL3dhc21zXCIpO1xuXHR0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2sucGlwZSh0aGlzLnByb2Nlc3NvcikucGlwZSh0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2sucHJvY2Vzc29yRGVzdGluYXRpb24pO1xuXHRhd2FpdCB0aGlzLnByb2Nlc3Nvci5zZXRPcHRpb25zKHsgdHlwZTogJ2NvbG9yJywgY29sb3I6XCIjMDBmZjAwXCJ9KTtcblx0YXdhaXQgdGhpcy5wcm9jZXNzb3IuZW5hYmxlKCk7XG4gICAgfVxuXG4gICAgLy8gUHVibGlzaCB0aGUgbG9jYWwgdmlkZW8gYW5kIGF1ZGlvIHRyYWNrcyB0byB0aGUgY2hhbm5lbC5cbiAgICBpZiAodGhpcy5lbmFibGVWaWRlbyB8fCB0aGlzLmVuYWJsZUF1ZGlvIHx8IHRoaXMuZW5hYmxlQXZhdGFyKSB7XG4gICAgICBhd2FpdCB0aGlzLmFnb3JhQ2xpZW50LnB1Ymxpc2goT2JqZWN0LnZhbHVlcyh0aGlzLmxvY2FsVHJhY2tzKSk7XG4gICAgICBjb25zb2xlLmxvZyhcInB1Ymxpc2ggc3VjY2Vzc1wiKTtcbiAgICB9XG5cbiAgfVxuXG4gIC8qKlxuICAgKiBQcml2YXRlc1xuICAgKi9cblxuICBhc3luYyBfY29ubmVjdChjb25uZWN0U3VjY2VzcywgY29ubmVjdEZhaWx1cmUpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICBhd2FpdCB0aGF0LmVhc3lydGMuY29ubmVjdCh0aGF0LmFwcCwgY29ubmVjdFN1Y2Nlc3MsIGNvbm5lY3RGYWlsdXJlKTtcblxuICAgIC8qXG4gICAgICAgdGhpcy5lYXN5cnRjLnNldFN0cmVhbUFjY2VwdG9yKHRoaXMuc2V0TWVkaWFTdHJlYW0uYmluZCh0aGlzKSk7XG4gICAgICAgdGhpcy5lYXN5cnRjLnNldE9uU3RyZWFtQ2xvc2VkKGZ1bmN0aW9uKGNsaWVudElkLCBzdHJlYW0sIHN0cmVhbU5hbWUpIHtcbiAgICAgICAgZGVsZXRlIHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXVtzdHJlYW1OYW1lXTtcbiAgICAgIH0pO1xuICAgICAgIGlmICh0aGF0LmVhc3lydGMuYXVkaW9FbmFibGVkIHx8IHRoYXQuZWFzeXJ0Yy52aWRlb0VuYWJsZWQpIHtcbiAgICAgICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEoe1xuICAgICAgICAgIHZpZGVvOiB0aGF0LmVhc3lydGMudmlkZW9FbmFibGVkLFxuICAgICAgICAgIGF1ZGlvOiB0aGF0LmVhc3lydGMuYXVkaW9FbmFibGVkXG4gICAgICAgIH0pLnRoZW4oXG4gICAgICAgICAgZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgICAgICAgICB0aGF0LmFkZExvY2FsTWVkaWFTdHJlYW0oc3RyZWFtLCBcImRlZmF1bHRcIik7XG4gICAgICAgICAgICB0aGF0LmVhc3lydGMuY29ubmVjdCh0aGF0LmFwcCwgY29ubmVjdFN1Y2Nlc3MsIGNvbm5lY3RGYWlsdXJlKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGZ1bmN0aW9uKGVycm9yQ29kZSwgZXJybWVzZykge1xuICAgICAgICAgICAgTkFGLmxvZy5lcnJvcihlcnJvckNvZGUsIGVycm1lc2cpO1xuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoYXQuZWFzeXJ0Yy5jb25uZWN0KHRoYXQuYXBwLCBjb25uZWN0U3VjY2VzcywgY29ubmVjdEZhaWx1cmUpO1xuICAgICAgfVxuICAgICAgKi9cbiAgfVxuXG4gIF9nZXRSb29tSm9pblRpbWUoY2xpZW50SWQpIHtcbiAgICB2YXIgbXlSb29tSWQgPSB0aGlzLnJvb207IC8vTkFGLnJvb207XG4gICAgdmFyIGpvaW5UaW1lID0gdGhpcy5lYXN5cnRjLmdldFJvb21PY2N1cGFudHNBc01hcChteVJvb21JZClbY2xpZW50SWRdLnJvb21Kb2luVGltZTtcbiAgICByZXR1cm4gam9pblRpbWU7XG4gIH1cblxuICBnZXRTZXJ2ZXJUaW1lKCkge1xuICAgIHJldHVybiBEYXRlLm5vdygpICsgdGhpcy5hdmdUaW1lT2Zmc2V0O1xuICB9XG59XG5cbk5BRi5hZGFwdGVycy5yZWdpc3RlcihcImFnb3JhcnRjXCIsIEFnb3JhUnRjQWRhcHRlcik7XG5cbm1vZHVsZS5leHBvcnRzID0gQWdvcmFSdGNBZGFwdGVyO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==