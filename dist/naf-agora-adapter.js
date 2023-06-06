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
    this.mocapData = "";
    this.mocapPrevData = "";
    this.logi = 0;
    this.logo = 0;
    this.mediaStreams = {};
    this.remoteClients = {};
    this.audioJitter = {};
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

    this.isChrome = navigator.userAgent.indexOf('Firefox') === -1 && navigator.userAgent.indexOf('Chrome') > -1;

    if (this.isChrome) {
      window.oldRTCPeerConnection = RTCPeerConnection;
      window.RTCPeerConnection = new Proxy(window.RTCPeerConnection, {
        construct: function (target, args) {
          if (args.length > 0) {
            args[0]["encodedInsertableStreams"] = true;
          } else {
            args.push({ encodedInsertableStreams: true });
          }

          const pc = new window.oldRTCPeerConnection(...args);
          return pc;
        }
      });
      const oldSetConfiguration = window.RTCPeerConnection.prototype.setConfiguration;
      window.RTCPeerConnection.prototype.setConfiguration = function () {
        const args = arguments;
        if (args.length > 0) {
          args[0]["encodedInsertableStreams"] = true;
        } else {
          args.push({ encodedInsertableStreams: true });
        }

        oldSetConfiguration.apply(this, args);
      };
    }

    // custom data append params
    this.CustomDataDetector = 'AGORAMOCAP';
    this.CustomDatLengthByteCount = 4;
    this.senderChannel = new MessageChannel();
    this.receiverChannel;
    //this.r_receiver=null;
    //this.r_clientId=null;

    this._vad_audioTrack = null;
    this._voiceActivityDetectionFrequency = 150;

    this._vad_MaxAudioSamples = 400;
    this._vad_MaxBackgroundNoiseLevel = 20;
    this._vad_SilenceOffeset = 4;
    this._vad_audioSamplesArr = [];
    this._vad_audioSamplesArrSorted = [];
    this._vad_exceedCount = 0;
    this._vad_exceedCountThreshold = 2;
    this._vad_exceedCountThresholdLow = 1;
    this._voiceActivityDetectionInterval;
    window.AgoraRtcAdapter = this;
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

  sendMocap(mocap) {
    if (mocap == this.mocapPrevData) {
      //   console.log("blank");
      mocap = "";
    }

    // set to blank after sending
    if (this.mocapData === "") {
      this.mocapData = mocap;
    }

    if (!this.isChrome) {
      this.senderChannel.port1.postMessage({ watermark: mocap });
    }
  }

  async createEncoder(sender) {
    if (this.isChrome) {
      const streams = sender.createEncodedStreams();
      const textEncoder = new TextEncoder();
      var that = this;
      const transformer = new TransformStream({
        transform(chunk, controller) {
          const mocap = textEncoder.encode(that.mocapData);
          //    console.error("appending ",that.mocapData);
          that.mocapPrevData = that.mocapData;
          that.mocapData = "";
          const frame = chunk.data;
          const data = new Uint8Array(chunk.data.byteLength + mocap.byteLength + that.CustomDatLengthByteCount + that.CustomDataDetector.length);
          data.set(new Uint8Array(frame), 0);
          data.set(mocap, frame.byteLength);
          var bytes = that.getIntBytes(mocap.byteLength);
          for (let i = 0; i < that.CustomDatLengthByteCount; i++) {
            data[frame.byteLength + mocap.byteLength + i] = bytes[i];
          }

          // Set magic string at the end
          const magicIndex = frame.byteLength + mocap.byteLength + that.CustomDatLengthByteCount;
          for (let i = 0; i < that.CustomDataDetector.length; i++) {
            data[magicIndex + i] = that.CustomDataDetector.charCodeAt(i);
          }
          chunk.data = data.buffer;
          //          try {
          //            console.error("sending ", mocap.byteLength," to ", chunk.data.byteLength);
          controller.enqueue(chunk);
          //    console.error("sent ", mocap.byteLength," to ", chunk.data.byteLength);

          //          } catch (e) {
          //            console.error(e);
          //          }
        }
      });

      streams.readable.pipeThrough(transformer).pipeTo(streams.writable);
    } else {
      var that = this;
      const worker = new Worker('/dist/script-transform-worker.js');
      await new Promise(resolve => worker.onmessage = event => {
        if (event.data === 'registered') {
          resolve();
        }
      });
      const senderTransform = new RTCRtpScriptTransform(worker, { name: 'outgoing', port: that.senderChannel.port2 }, [that.senderChannel.port2]);
      senderTransform.port = that.senderChannel.port1;
      sender.transform = senderTransform;
      await new Promise(resolve => worker.onmessage = event => {
        if (event.data === 'started') {
          resolve();
        }
      });

      senderTransform.port.onmessage = e => {
        if (e.data == "CLEAR") {
          that.mocapPrevData = that.mocapData;
          that.mocapData = "";
        }
      };
      that.senderChannel.port1.postMessage({ watermark: that.mocapData });
    }
  }

  /*
  async recreateDecoder(){
    this.createDecoder(this.r_receiver,this.r_clientId);
  }*/

  async createDecoder(receiver, clientId) {
    if (this.isChrome) {
      const streams = receiver.createEncodedStreams();
      const textDecoder = new TextDecoder();
      var that = this;

      const transformer = new TransformStream({
        transform(chunk, controller) {
          const view = new DataView(chunk.data);
          const magicData = new Uint8Array(chunk.data, chunk.data.byteLength - that.CustomDataDetector.length, that.CustomDataDetector.length);
          let magic = [];
          for (let i = 0; i < that.CustomDataDetector.length; i++) {
            magic.push(magicData[i]);
          }
          let magicString = String.fromCharCode(...magic);
          if (magicString === that.CustomDataDetector) {
            const mocapLen = view.getUint32(chunk.data.byteLength - (that.CustomDatLengthByteCount + that.CustomDataDetector.length), false);
            const frameSize = chunk.data.byteLength - (mocapLen + that.CustomDatLengthByteCount + that.CustomDataDetector.length);
            const mocapBuffer = new Uint8Array(chunk.data, frameSize, mocapLen);
            const mocap = textDecoder.decode(mocapBuffer);
            if (mocap.length > 0) {
              window.remoteMocap(mocap + "," + clientId);
            }
            const frame = chunk.data;
            chunk.data = new ArrayBuffer(frameSize);
            const data = new Uint8Array(chunk.data);
            data.set(new Uint8Array(frame, 0, frameSize));
          }
          controller.enqueue(chunk);
        }
      });
      streams.readable.pipeThrough(transformer).pipeTo(streams.writable);
    } else {
      this.receiverChannel = new MessageChannel();
      var that = this;
      const worker = new Worker('/dist/script-transform-worker.js');
      await new Promise(resolve => worker.onmessage = event => {
        if (event.data === 'registered') {

          resolve();
        }
      });

      const receiverTransform = new RTCRtpScriptTransform(worker, { name: 'incoming', port: that.receiverChannel.port2 }, [that.receiverChannel.port2]);

      receiverTransform.port = that.receiverChannel.port1;
      receiver.transform = receiverTransform;
      receiverTransform.port.onmessage = e => {
        if (e.data.length > 0) {
          window.remoteMocap(e.data + "," + clientId);
        }
      };

      await new Promise(resolve => worker.onmessage = event => {
        if (event.data === 'started') {
          //  console.warn("incoming 5a",clientId,event.data );
          resolve();
        }
        //   console.warn("incoming 5",clientId,event.data );
      });
      //  console.warn("incoming 6",clientId );
    }
  }

  async readStats() {

    if (!this.agoraClient._users) {
      return;
    }
    for (var u = 0; u < this.agoraClient._users.length; u++) {
      if (this.agoraClient._users[u].audioTrack && this.agoraClient._users[u].audioTrack._mediaStreamTrack) {
        await this.agoraClient._p2pChannel.connection.peerConnection.getStats(this.agoraClient._users[u].audioTrack._mediaStreamTrack).then(async stats => {
          await stats.forEach(report => {
            if (report.type === "inbound-rtp" && report.kind === "audio") {
              var jitterBufferDelay = (report["jitterBufferDelay"] / report["jitterBufferEmittedCount"]).toFixed(3);
              if (!isNaN(jitterBufferDelay)) {
                this.audioJitter[this.agoraClient._users[u].uid] = jitterBufferDelay * 1000;
              } else {
                this.audioJitter[this.agoraClient._users[u].uid] = 80; // default ms
              }
            }
          });
        });
      }
    }
  }

  sendData(clientId, dataType, data) {
    //  console.log("BW73 sendData ", clientId, dataType, data);
    // send via webrtc otherwise fallback to websockets
    this.easyrtc.sendData(clientId, dataType, data);
  }

  sendDataGuaranteed(clientId, dataType, data) {
    //  console.log("BW73 sendDataGuaranteed ", clientId, dataType, data);
    this.easyrtc.sendDataWS(clientId, dataType, data);
  }

  broadcastData(dataType, data) {
    return this.broadcastDataGuaranteed(dataType, data);
    /*
    console.log("BW73 broadcastData ", dataType, data);
    var roomOccupants = this.easyrtc.getRoomOccupantsAsMap(this.room);
     // Iterate over the keys of the easyrtc room occupants map.
    // getRoomOccupantsAsArray uses Object.keys which allocates memory.
    for (var roomOccupant in roomOccupants) {
      if (roomOccupants[roomOccupant] && roomOccupant !== this.easyrtc.myEasyrtcid) {
        // send via webrtc otherwise fallback to websockets
        try {
          this.easyrtc.sendData(roomOccupant, dataType, data);
        } catch (e) {
           console.error("sendData",e);
        }
      }
    }
    */
  }

  broadcastDataGuaranteed(dataType, data) {
    // console.log("BW73 broadcastDataGuaranteed ", dataType, data);
    var destination = { targetRoom: this.room };
    this.easyrtc.sendDataWS(destination, dataType, data);
  }

  getConnectStatus(clientId) {
    //  console.log("BW73 getConnectStatus ", clientId);
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

  getIntBytes(x) {
    var bytes = [];
    var i = this.CustomDatLengthByteCount;
    do {
      bytes[--i] = x & 255;
      x = x >> 8;
    } while (i);
    return bytes;
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

  getInputLevel(track) {
    var analyser = track._source.volumeLevelAnalyser.analyserNode;
    //var analyser = track._source.analyserNode;
    const bufferLength = analyser.frequencyBinCount;
    var data = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(data);
    var values = 0;
    var average;
    var length = data.length;
    for (var i = 0; i < length; i++) {
      values += data[i];
    }
    average = Math.floor(values / length);
    return average;
  }

  voiceActivityDetection() {
    if (!this._vad_audioTrack || !this._vad_audioTrack._enabled) return;

    var audioLevel = this.getInputLevel(this._vad_audioTrack);
    if (audioLevel <= this._vad_MaxBackgroundNoiseLevel) {
      if (this._vad_audioSamplesArr.length >= this._vad_MaxAudioSamples) {
        var removed = this._vad_audioSamplesArr.shift();
        var removedIndex = this._vad_audioSamplesArrSorted.indexOf(removed);
        if (removedIndex > -1) {
          this._vad_audioSamplesArrSorted.splice(removedIndex, 1);
        }
      }
      this._vad_audioSamplesArr.push(audioLevel);
      this._vad_audioSamplesArrSorted.push(audioLevel);
      this._vad_audioSamplesArrSorted.sort((a, b) => a - b);
    }
    var background = Math.floor(3 * this._vad_audioSamplesArrSorted[Math.floor(this._vad_audioSamplesArrSorted.length / 2)] / 2);
    if (audioLevel > background + this._vad_SilenceOffeset) {
      this._vad_exceedCount++;
    } else {
      this._vad_exceedCount = 0;
    }

    if (this._vad_exceedCount > this._vad_exceedCountThresholdLow) {
      //AgoraRTCUtilEvents.emit("VoiceActivityDetectedFast", this._vad_exceedCount);
      window._state_stop_at = Date.now();
      //console.log("BOOM", audioLevel, background, this._vad_SilenceOffeset,this._vad_exceedCount,this._vad_exceedCountThresholdLow);
      //    } else {
      //      console.log(audioLevel, background, this._vad_SilenceOffeset,this._vad_exceedCount,this._vad_exceedCountThresholdLow);
    }

    if (this._vad_exceedCount > this._vad_exceedCountThreshold) {
      //AgoraRTCUtilEvents.emit("VoiceActivityDetected", this._vad_exceedCount);
      this._vad_exceedCount = 0;
      window._state_stop_at = Date.now();
      //   console.error("VAD ",Date.now()-window._state_stop_at);
    }
  }

  async connectAgora() {
    // Add an event listener to play remote tracks when remote user publishes.
    var that = this;

    this.agoraClient = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
    AgoraRTC.setParameter('SYNC_GROUP', false);
    //    AgoraRTC.setParameter('SUBSCRIBE_TWCC', true);
    setInterval(() => {
      this.readStats();
    }, 1000);

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

      let enc_id = 'na';
      if (mediaType === 'audio') {
        enc_id = user.audioTrack._mediaStreamTrack.id;
      } else {
        // enc_id=user.videoTrack._mediaStreamTrack.id;
      }

      const pc = this.agoraClient._p2pChannel.connection.peerConnection;
      const receivers = pc.getReceivers();
      for (let i = 0; i < receivers.length; i++) {
        if (receivers[i].track && receivers[i].track.id === enc_id) {
          console.warn("Match", mediaType, enc_id);
          //          this.r_receiver=receivers[i];
          //this.r_clientId=clientId;
          this.createDecoder(receivers[i], clientId);
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
      let audio_track;
      if (window.gum_stream) {
        // avoid double allow iOs

        audio_track = AgoraRTC.createCustomAudioTrack({ mediaStreamTrack: window.gum_stream.getAudioTracks()[0] });
        console.warn(audio_track, "audio_track");
      } else {
        audio_track = AgoraRTC.createMicrophoneAudioTrack();
      }

      [this.userid, this.localTracks.audioTrack] = await Promise.all([
      // Join the channel.
      this.agoraClient.join(this.appid, this.room, this.token || null, this.clientId || null), audio_track]);
      //console.log("createMicrophoneAudioTrack");
      this._vad_audioTrack = this.localTracks.audioTrack;
      if (!this._voiceActivityDetectionInterval) {
        this._voiceActivityDetectionInterval = setInterval(() => {
          this.voiceActivityDetection();
        }, this._voiceActivityDetectionFrequency);
      }
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

    // Publish the local video and audio tracks to the channel.
    if (this.enableVideo || this.enableAudio || this.enableAvatar) {
      if (this.localTracks.audioTrack) await this.agoraClient.publish(this.localTracks.audioTrack);
      if (this.localTracks.videoTrack) await this.agoraClient.publish(this.localTracks.videoTrack);

      console.log("publish success");
      const pc = this.agoraClient._p2pChannel.connection.peerConnection;
      const senders = pc.getSenders();
      let i = 0;
      for (i = 0; i < senders.length; i++) {
        if (senders[i].track && senders[i].track.kind == 'audio') {
          this.createEncoder(senders[i]);
        }
      }
    }

    // RTM
  }

  /**
   * Privates
   */

  async _connect(connectSuccess, connectFailure) {
    var that = this;
    await that.easyrtc.connect(that.app, connectSuccess, connectFailure);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIl0sIm5hbWVzIjpbIkFnb3JhUnRjQWRhcHRlciIsImNvbnN0cnVjdG9yIiwiZWFzeXJ0YyIsImNvbnNvbGUiLCJsb2ciLCJ3aW5kb3ciLCJhcHAiLCJyb29tIiwidXNlcmlkIiwiYXBwaWQiLCJtb2NhcERhdGEiLCJtb2NhcFByZXZEYXRhIiwibG9naSIsImxvZ28iLCJtZWRpYVN0cmVhbXMiLCJyZW1vdGVDbGllbnRzIiwiYXVkaW9KaXR0ZXIiLCJwZW5kaW5nTWVkaWFSZXF1ZXN0cyIsIk1hcCIsImVuYWJsZVZpZGVvIiwiZW5hYmxlVmlkZW9GaWx0ZXJlZCIsImVuYWJsZUF1ZGlvIiwiZW5hYmxlQXZhdGFyIiwibG9jYWxUcmFja3MiLCJ2aWRlb1RyYWNrIiwiYXVkaW9UcmFjayIsInRva2VuIiwiY2xpZW50SWQiLCJ1aWQiLCJ2YmciLCJ2YmcwIiwic2hvd0xvY2FsIiwidmlydHVhbEJhY2tncm91bmRJbnN0YW5jZSIsImV4dGVuc2lvbiIsInByb2Nlc3NvciIsInBpcGVQcm9jZXNzb3IiLCJ0cmFjayIsInBpcGUiLCJwcm9jZXNzb3JEZXN0aW5hdGlvbiIsInNlcnZlclRpbWVSZXF1ZXN0cyIsInRpbWVPZmZzZXRzIiwiYXZnVGltZU9mZnNldCIsImFnb3JhQ2xpZW50Iiwic2V0UGVlck9wZW5MaXN0ZW5lciIsImNsaWVudENvbm5lY3Rpb24iLCJnZXRQZWVyQ29ubmVjdGlvbkJ5VXNlcklkIiwic2V0UGVlckNsb3NlZExpc3RlbmVyIiwiaXNDaHJvbWUiLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJpbmRleE9mIiwib2xkUlRDUGVlckNvbm5lY3Rpb24iLCJSVENQZWVyQ29ubmVjdGlvbiIsIlByb3h5IiwiY29uc3RydWN0IiwidGFyZ2V0IiwiYXJncyIsImxlbmd0aCIsInB1c2giLCJlbmNvZGVkSW5zZXJ0YWJsZVN0cmVhbXMiLCJwYyIsIm9sZFNldENvbmZpZ3VyYXRpb24iLCJwcm90b3R5cGUiLCJzZXRDb25maWd1cmF0aW9uIiwiYXJndW1lbnRzIiwiYXBwbHkiLCJDdXN0b21EYXRhRGV0ZWN0b3IiLCJDdXN0b21EYXRMZW5ndGhCeXRlQ291bnQiLCJzZW5kZXJDaGFubmVsIiwiTWVzc2FnZUNoYW5uZWwiLCJyZWNlaXZlckNoYW5uZWwiLCJfdmFkX2F1ZGlvVHJhY2siLCJfdm9pY2VBY3Rpdml0eURldGVjdGlvbkZyZXF1ZW5jeSIsIl92YWRfTWF4QXVkaW9TYW1wbGVzIiwiX3ZhZF9NYXhCYWNrZ3JvdW5kTm9pc2VMZXZlbCIsIl92YWRfU2lsZW5jZU9mZmVzZXQiLCJfdmFkX2F1ZGlvU2FtcGxlc0FyciIsIl92YWRfYXVkaW9TYW1wbGVzQXJyU29ydGVkIiwiX3ZhZF9leGNlZWRDb3VudCIsIl92YWRfZXhjZWVkQ291bnRUaHJlc2hvbGQiLCJfdmFkX2V4Y2VlZENvdW50VGhyZXNob2xkTG93IiwiX3ZvaWNlQWN0aXZpdHlEZXRlY3Rpb25JbnRlcnZhbCIsInNldFNlcnZlclVybCIsInVybCIsInNldFNvY2tldFVybCIsInNldEFwcCIsImFwcE5hbWUiLCJzZXRSb29tIiwianNvbiIsInJlcGxhY2UiLCJvYmoiLCJKU09OIiwicGFyc2UiLCJuYW1lIiwiQWdvcmFSVEMiLCJsb2FkTW9kdWxlIiwiU2VnUGx1Z2luIiwiam9pblJvb20iLCJzZXRXZWJSdGNPcHRpb25zIiwib3B0aW9ucyIsImVuYWJsZURhdGFDaGFubmVscyIsImRhdGFjaGFubmVsIiwidmlkZW8iLCJhdWRpbyIsImVuYWJsZVZpZGVvUmVjZWl2ZSIsImVuYWJsZUF1ZGlvUmVjZWl2ZSIsInNldFNlcnZlckNvbm5lY3RMaXN0ZW5lcnMiLCJzdWNjZXNzTGlzdGVuZXIiLCJmYWlsdXJlTGlzdGVuZXIiLCJjb25uZWN0U3VjY2VzcyIsImNvbm5lY3RGYWlsdXJlIiwic2V0Um9vbU9jY3VwYW50TGlzdGVuZXIiLCJvY2N1cGFudExpc3RlbmVyIiwicm9vbU5hbWUiLCJvY2N1cGFudHMiLCJwcmltYXJ5Iiwic2V0RGF0YUNoYW5uZWxMaXN0ZW5lcnMiLCJvcGVuTGlzdGVuZXIiLCJjbG9zZWRMaXN0ZW5lciIsIm1lc3NhZ2VMaXN0ZW5lciIsInNldERhdGFDaGFubmVsT3Blbkxpc3RlbmVyIiwic2V0RGF0YUNoYW5uZWxDbG9zZUxpc3RlbmVyIiwic2V0UGVlckxpc3RlbmVyIiwidXBkYXRlVGltZU9mZnNldCIsImNsaWVudFNlbnRUaW1lIiwiRGF0ZSIsIm5vdyIsImZldGNoIiwiZG9jdW1lbnQiLCJsb2NhdGlvbiIsImhyZWYiLCJtZXRob2QiLCJjYWNoZSIsInRoZW4iLCJyZXMiLCJwcmVjaXNpb24iLCJzZXJ2ZXJSZWNlaXZlZFRpbWUiLCJoZWFkZXJzIiwiZ2V0IiwiZ2V0VGltZSIsImNsaWVudFJlY2VpdmVkVGltZSIsInNlcnZlclRpbWUiLCJ0aW1lT2Zmc2V0IiwicmVkdWNlIiwiYWNjIiwib2Zmc2V0Iiwic2V0VGltZW91dCIsImNvbm5lY3QiLCJQcm9taXNlIiwiYWxsIiwicmVzb2x2ZSIsInJlamVjdCIsIl9jb25uZWN0IiwiXyIsIl9teVJvb21Kb2luVGltZSIsIl9nZXRSb29tSm9pblRpbWUiLCJjb25uZWN0QWdvcmEiLCJjYXRjaCIsInNob3VsZFN0YXJ0Q29ubmVjdGlvblRvIiwiY2xpZW50Iiwicm9vbUpvaW5UaW1lIiwic3RhcnRTdHJlYW1Db25uZWN0aW9uIiwiY2FsbCIsImNhbGxlciIsIm1lZGlhIiwiTkFGIiwid3JpdGUiLCJlcnJvckNvZGUiLCJlcnJvclRleHQiLCJlcnJvciIsIndhc0FjY2VwdGVkIiwiY2xvc2VTdHJlYW1Db25uZWN0aW9uIiwiaGFuZ3VwIiwic2VuZE1vY2FwIiwibW9jYXAiLCJwb3J0MSIsInBvc3RNZXNzYWdlIiwid2F0ZXJtYXJrIiwiY3JlYXRlRW5jb2RlciIsInNlbmRlciIsInN0cmVhbXMiLCJjcmVhdGVFbmNvZGVkU3RyZWFtcyIsInRleHRFbmNvZGVyIiwiVGV4dEVuY29kZXIiLCJ0aGF0IiwidHJhbnNmb3JtZXIiLCJUcmFuc2Zvcm1TdHJlYW0iLCJ0cmFuc2Zvcm0iLCJjaHVuayIsImNvbnRyb2xsZXIiLCJlbmNvZGUiLCJmcmFtZSIsImRhdGEiLCJVaW50OEFycmF5IiwiYnl0ZUxlbmd0aCIsInNldCIsImJ5dGVzIiwiZ2V0SW50Qnl0ZXMiLCJpIiwibWFnaWNJbmRleCIsImNoYXJDb2RlQXQiLCJidWZmZXIiLCJlbnF1ZXVlIiwicmVhZGFibGUiLCJwaXBlVGhyb3VnaCIsInBpcGVUbyIsIndyaXRhYmxlIiwid29ya2VyIiwiV29ya2VyIiwib25tZXNzYWdlIiwiZXZlbnQiLCJzZW5kZXJUcmFuc2Zvcm0iLCJSVENSdHBTY3JpcHRUcmFuc2Zvcm0iLCJwb3J0IiwicG9ydDIiLCJlIiwiY3JlYXRlRGVjb2RlciIsInJlY2VpdmVyIiwidGV4dERlY29kZXIiLCJUZXh0RGVjb2RlciIsInZpZXciLCJEYXRhVmlldyIsIm1hZ2ljRGF0YSIsIm1hZ2ljIiwibWFnaWNTdHJpbmciLCJTdHJpbmciLCJmcm9tQ2hhckNvZGUiLCJtb2NhcExlbiIsImdldFVpbnQzMiIsImZyYW1lU2l6ZSIsIm1vY2FwQnVmZmVyIiwiZGVjb2RlIiwicmVtb3RlTW9jYXAiLCJBcnJheUJ1ZmZlciIsInJlY2VpdmVyVHJhbnNmb3JtIiwicmVhZFN0YXRzIiwiX3VzZXJzIiwidSIsIl9tZWRpYVN0cmVhbVRyYWNrIiwiX3AycENoYW5uZWwiLCJjb25uZWN0aW9uIiwicGVlckNvbm5lY3Rpb24iLCJnZXRTdGF0cyIsInN0YXRzIiwiZm9yRWFjaCIsInJlcG9ydCIsInR5cGUiLCJraW5kIiwiaml0dGVyQnVmZmVyRGVsYXkiLCJ0b0ZpeGVkIiwiaXNOYU4iLCJzZW5kRGF0YSIsImRhdGFUeXBlIiwic2VuZERhdGFHdWFyYW50ZWVkIiwic2VuZERhdGFXUyIsImJyb2FkY2FzdERhdGEiLCJicm9hZGNhc3REYXRhR3VhcmFudGVlZCIsImRlc3RpbmF0aW9uIiwidGFyZ2V0Um9vbSIsImdldENvbm5lY3RTdGF0dXMiLCJzdGF0dXMiLCJJU19DT05ORUNURUQiLCJhZGFwdGVycyIsIk5PVF9DT05ORUNURUQiLCJDT05ORUNUSU5HIiwiZ2V0TWVkaWFTdHJlYW0iLCJzdHJlYW1OYW1lIiwiaGFzIiwiYXVkaW9Qcm9taXNlIiwid2FybiIsInByb21pc2UiLCJ2aWRlb1Byb21pc2UiLCJzdHJlYW1Qcm9taXNlIiwic2V0TWVkaWFTdHJlYW0iLCJzdHJlYW0iLCJjbGllbnRNZWRpYVN0cmVhbXMiLCJhdWRpb1RyYWNrcyIsImdldEF1ZGlvVHJhY2tzIiwiYXVkaW9TdHJlYW0iLCJNZWRpYVN0cmVhbSIsImFkZFRyYWNrIiwidmlkZW9UcmFja3MiLCJnZXRWaWRlb1RyYWNrcyIsInZpZGVvU3RyZWFtIiwieCIsImFkZExvY2FsTWVkaWFTdHJlYW0iLCJpZCIsInJlZ2lzdGVyM3JkUGFydHlMb2NhbE1lZGlhU3RyZWFtIiwiT2JqZWN0Iiwia2V5cyIsImFkZFN0cmVhbVRvQ2FsbCIsInJlbW92ZUxvY2FsTWVkaWFTdHJlYW0iLCJjbG9zZUxvY2FsTWVkaWFTdHJlYW0iLCJlbmFibGVNaWNyb3Bob25lIiwiZW5hYmxlZCIsImVuYWJsZUNhbWVyYSIsImRpc2Nvbm5lY3QiLCJoYW5kbGVVc2VyUHVibGlzaGVkIiwidXNlciIsIm1lZGlhVHlwZSIsImhhbmRsZVVzZXJVbnB1Ymxpc2hlZCIsImdldElucHV0TGV2ZWwiLCJhbmFseXNlciIsIl9zb3VyY2UiLCJ2b2x1bWVMZXZlbEFuYWx5c2VyIiwiYW5hbHlzZXJOb2RlIiwiYnVmZmVyTGVuZ3RoIiwiZnJlcXVlbmN5QmluQ291bnQiLCJnZXRCeXRlRnJlcXVlbmN5RGF0YSIsInZhbHVlcyIsImF2ZXJhZ2UiLCJNYXRoIiwiZmxvb3IiLCJ2b2ljZUFjdGl2aXR5RGV0ZWN0aW9uIiwiX2VuYWJsZWQiLCJhdWRpb0xldmVsIiwicmVtb3ZlZCIsInNoaWZ0IiwicmVtb3ZlZEluZGV4Iiwic3BsaWNlIiwic29ydCIsImEiLCJiIiwiYmFja2dyb3VuZCIsIl9zdGF0ZV9zdG9wX2F0IiwiY3JlYXRlQ2xpZW50IiwibW9kZSIsImNvZGVjIiwic2V0UGFyYW1ldGVyIiwic2V0SW50ZXJ2YWwiLCJzZXRDbGllbnRSb2xlIiwib24iLCJzdWJzY3JpYmUiLCJwbGF5IiwicXVlcnlTZWxlY3RvciIsInNyY09iamVjdCIsImVuY19pZCIsInJlY2VpdmVycyIsImdldFJlY2VpdmVycyIsImdldEVsZW1lbnRCeUlkIiwiY2FwdHVyZVN0cmVhbSIsImpvaW4iLCJjcmVhdGVNaWNyb3Bob25lQXVkaW9UcmFjayIsImNyZWF0ZUN1c3RvbVZpZGVvVHJhY2siLCJtZWRpYVN0cmVhbVRyYWNrIiwiY3JlYXRlQ2FtZXJhVmlkZW9UcmFjayIsImVuY29kZXJDb25maWciLCJhdWRpb190cmFjayIsImd1bV9zdHJlYW0iLCJjcmVhdGVDdXN0b21BdWRpb1RyYWNrIiwiY2FtcyIsImdldENhbWVyYXMiLCJsYWJlbCIsImRldmljZUlkIiwic2V0RGV2aWNlIiwiaW1nRWxlbWVudCIsImNyZWF0ZUVsZW1lbnQiLCJvbmxvYWQiLCJpbmplY3QiLCJzZXRPcHRpb25zIiwiZW5hYmxlIiwic3JjIiwiVmlydHVhbEJhY2tncm91bmRFeHRlbnNpb24iLCJyZWdpc3RlckV4dGVuc2lvbnMiLCJjcmVhdGVQcm9jZXNzb3IiLCJpbml0IiwiY29sb3IiLCJwdWJsaXNoIiwic2VuZGVycyIsImdldFNlbmRlcnMiLCJteVJvb21JZCIsImpvaW5UaW1lIiwiZ2V0Um9vbU9jY3VwYW50c0FzTWFwIiwiZ2V0U2VydmVyVGltZSIsInJlZ2lzdGVyIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdE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O0FBQ0EsWUFBTStILFVBQVVwVCxHQUFHcVQsVUFBSCxFQUFoQjtBQUNBLFVBQUkzSyxJQUFJLENBQVI7QUFDQSxXQUFLQSxJQUFJLENBQVQsRUFBWUEsSUFBSTBLLFFBQVF2VCxNQUF4QixFQUFnQzZJLEdBQWhDLEVBQXFDO0FBQ25DLFlBQUkwSyxRQUFRMUssQ0FBUixFQUFXbEssS0FBWCxJQUFxQjRVLFFBQVExSyxDQUFSLEVBQVdsSyxLQUFYLENBQWlCbU4sSUFBakIsSUFBeUIsT0FBbEQsRUFBNEQ7QUFDMUQsZUFBS3JFLGFBQUwsQ0FBbUI4TCxRQUFRMUssQ0FBUixDQUFuQjtBQUNEO0FBQ0Y7QUFDRjs7QUFFRDtBQUVEOztBQUVEOzs7O0FBSUEsUUFBTTlDLFFBQU4sQ0FBZTNDLGNBQWYsRUFBK0JDLGNBQS9CLEVBQStDO0FBQzdDLFFBQUkwRSxPQUFPLElBQVg7QUFDQSxVQUFNQSxLQUFLdEwsT0FBTCxDQUFhaUosT0FBYixDQUFxQnFDLEtBQUtsTCxHQUExQixFQUErQnVHLGNBQS9CLEVBQStDQyxjQUEvQyxDQUFOO0FBQ0Q7O0FBRUQ2QyxtQkFBaUJoSSxRQUFqQixFQUEyQjtBQUN6QixRQUFJdVYsV0FBVyxLQUFLM1csSUFBcEIsQ0FEeUIsQ0FDQztBQUMxQixRQUFJNFcsV0FBVyxLQUFLalgsT0FBTCxDQUFha1gscUJBQWIsQ0FBbUNGLFFBQW5DLEVBQTZDdlYsUUFBN0MsRUFBdURxSSxZQUF0RTtBQUNBLFdBQU9tTixRQUFQO0FBQ0Q7O0FBRURFLGtCQUFnQjtBQUNkLFdBQU94UCxLQUFLQyxHQUFMLEtBQWEsS0FBS3JGLGFBQXpCO0FBQ0Q7QUEzNEJtQjs7QUE4NEJ0QjRILElBQUlpRyxRQUFKLENBQWFnSCxRQUFiLENBQXNCLFVBQXRCLEVBQWtDdFgsZUFBbEM7O0FBRUF1WCxPQUFPQyxPQUFQLEdBQWlCeFgsZUFBakIsQyIsImZpbGUiOiJuYWYtYWdvcmEtYWRhcHRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL2luZGV4LmpzXCIpO1xuIiwiY2xhc3MgQWdvcmFSdGNBZGFwdGVyIHtcblxuICBjb25zdHJ1Y3RvcihlYXN5cnRjKSB7XG5cbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgY29uc3RydWN0b3IgXCIsIGVhc3lydGMpO1xuXG4gICAgdGhpcy5lYXN5cnRjID0gZWFzeXJ0YyB8fCB3aW5kb3cuZWFzeXJ0YztcbiAgICB0aGlzLmFwcCA9IFwiZGVmYXVsdFwiO1xuICAgIHRoaXMucm9vbSA9IFwiZGVmYXVsdFwiO1xuICAgIHRoaXMudXNlcmlkID0gMDtcbiAgICB0aGlzLmFwcGlkID0gbnVsbDtcbiAgICB0aGlzLm1vY2FwRGF0YSA9IFwiXCI7XG4gICAgdGhpcy5tb2NhcFByZXZEYXRhID0gXCJcIjtcbiAgICB0aGlzLmxvZ2kgPSAwO1xuICAgIHRoaXMubG9nbyA9IDA7XG4gICAgdGhpcy5tZWRpYVN0cmVhbXMgPSB7fTtcbiAgICB0aGlzLnJlbW90ZUNsaWVudHMgPSB7fTtcbiAgICB0aGlzLmF1ZGlvSml0dGVyID0ge307XG4gICAgdGhpcy5wZW5kaW5nTWVkaWFSZXF1ZXN0cyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLmVuYWJsZVZpZGVvID0gZmFsc2U7XG4gICAgdGhpcy5lbmFibGVWaWRlb0ZpbHRlcmVkID0gZmFsc2U7XG4gICAgdGhpcy5lbmFibGVBdWRpbyA9IGZhbHNlO1xuICAgIHRoaXMuZW5hYmxlQXZhdGFyID0gZmFsc2U7XG5cbiAgICB0aGlzLmxvY2FsVHJhY2tzID0geyB2aWRlb1RyYWNrOiBudWxsLCBhdWRpb1RyYWNrOiBudWxsIH07XG4gICAgd2luZG93LmxvY2FsVHJhY2tzID0gdGhpcy5sb2NhbFRyYWNrcztcbiAgICB0aGlzLnRva2VuID0gbnVsbDtcbiAgICB0aGlzLmNsaWVudElkID0gbnVsbDtcbiAgICB0aGlzLnVpZCA9IG51bGw7XG4gICAgdGhpcy52YmcgPSBmYWxzZTtcbiAgICB0aGlzLnZiZzAgPSBmYWxzZTtcbiAgICB0aGlzLnNob3dMb2NhbCA9IGZhbHNlO1xuICAgIHRoaXMudmlydHVhbEJhY2tncm91bmRJbnN0YW5jZSA9IG51bGw7XG4gICAgdGhpcy5leHRlbnNpb24gPSBudWxsO1xuICAgIHRoaXMucHJvY2Vzc29yID0gbnVsbDtcbiAgICB0aGlzLnBpcGVQcm9jZXNzb3IgPSAodHJhY2ssIHByb2Nlc3NvcikgPT4ge1xuICAgICAgdHJhY2sucGlwZShwcm9jZXNzb3IpLnBpcGUodHJhY2sucHJvY2Vzc29yRGVzdGluYXRpb24pO1xuICAgIH1cblxuICAgIHRoaXMuc2VydmVyVGltZVJlcXVlc3RzID0gMDtcbiAgICB0aGlzLnRpbWVPZmZzZXRzID0gW107XG4gICAgdGhpcy5hdmdUaW1lT2Zmc2V0ID0gMDtcbiAgICB0aGlzLmFnb3JhQ2xpZW50ID0gbnVsbDtcblxuICAgIHRoaXMuZWFzeXJ0Yy5zZXRQZWVyT3Blbkxpc3RlbmVyKGNsaWVudElkID0+IHtcbiAgICAgIGNvbnN0IGNsaWVudENvbm5lY3Rpb24gPSB0aGlzLmVhc3lydGMuZ2V0UGVlckNvbm5lY3Rpb25CeVVzZXJJZChjbGllbnRJZCk7XG4gICAgICB0aGlzLnJlbW90ZUNsaWVudHNbY2xpZW50SWRdID0gY2xpZW50Q29ubmVjdGlvbjtcbiAgICB9KTtcblxuICAgIHRoaXMuZWFzeXJ0Yy5zZXRQZWVyQ2xvc2VkTGlzdGVuZXIoY2xpZW50SWQgPT4ge1xuICAgICAgZGVsZXRlIHRoaXMucmVtb3RlQ2xpZW50c1tjbGllbnRJZF07XG4gICAgfSk7XG5cbiAgICB0aGlzLmlzQ2hyb21lID0gKG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignRmlyZWZveCcpID09PSAtMSAmJiBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJ0Nocm9tZScpID4gLTEpO1xuXG4gICAgaWYgKHRoaXMuaXNDaHJvbWUpIHtcbiAgICAgIHdpbmRvdy5vbGRSVENQZWVyQ29ubmVjdGlvbiA9IFJUQ1BlZXJDb25uZWN0aW9uO1xuICAgICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uID0gbmV3IFByb3h5KHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiwge1xuICAgICAgICBjb25zdHJ1Y3Q6IGZ1bmN0aW9uICh0YXJnZXQsIGFyZ3MpIHtcbiAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBhcmdzWzBdW1wiZW5jb2RlZEluc2VydGFibGVTdHJlYW1zXCJdID0gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXJncy5wdXNoKHsgZW5jb2RlZEluc2VydGFibGVTdHJlYW1zOiB0cnVlIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHBjID0gbmV3IHdpbmRvdy5vbGRSVENQZWVyQ29ubmVjdGlvbiguLi5hcmdzKTtcbiAgICAgICAgICByZXR1cm4gcGM7XG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICAgIGNvbnN0IG9sZFNldENvbmZpZ3VyYXRpb24gPSB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLnNldENvbmZpZ3VyYXRpb247XG4gICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLnNldENvbmZpZ3VyYXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnN0IGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgIGlmIChhcmdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBhcmdzWzBdW1wiZW5jb2RlZEluc2VydGFibGVTdHJlYW1zXCJdID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhcmdzLnB1c2goeyBlbmNvZGVkSW5zZXJ0YWJsZVN0cmVhbXM6IHRydWUgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBvbGRTZXRDb25maWd1cmF0aW9uLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBjdXN0b20gZGF0YSBhcHBlbmQgcGFyYW1zXG4gICAgdGhpcy5DdXN0b21EYXRhRGV0ZWN0b3IgPSAnQUdPUkFNT0NBUCc7XG4gICAgdGhpcy5DdXN0b21EYXRMZW5ndGhCeXRlQ291bnQgPSA0O1xuICAgIHRoaXMuc2VuZGVyQ2hhbm5lbCA9IG5ldyBNZXNzYWdlQ2hhbm5lbDtcbiAgICB0aGlzLnJlY2VpdmVyQ2hhbm5lbDtcbiAgICAvL3RoaXMucl9yZWNlaXZlcj1udWxsO1xuICAgIC8vdGhpcy5yX2NsaWVudElkPW51bGw7XG5cbiAgICB0aGlzLl92YWRfYXVkaW9UcmFjayA9IG51bGw7XG4gICAgdGhpcy5fdm9pY2VBY3Rpdml0eURldGVjdGlvbkZyZXF1ZW5jeSA9IDE1MDtcblxuICAgIHRoaXMuX3ZhZF9NYXhBdWRpb1NhbXBsZXMgPSA0MDA7XG4gICAgdGhpcy5fdmFkX01heEJhY2tncm91bmROb2lzZUxldmVsID0gMjA7XG4gICAgdGhpcy5fdmFkX1NpbGVuY2VPZmZlc2V0ID0gNDtcbiAgICB0aGlzLl92YWRfYXVkaW9TYW1wbGVzQXJyID0gW107XG4gICAgdGhpcy5fdmFkX2F1ZGlvU2FtcGxlc0FyclNvcnRlZCA9IFtdO1xuICAgIHRoaXMuX3ZhZF9leGNlZWRDb3VudCA9IDA7XG4gICAgdGhpcy5fdmFkX2V4Y2VlZENvdW50VGhyZXNob2xkID0gMjtcbiAgICB0aGlzLl92YWRfZXhjZWVkQ291bnRUaHJlc2hvbGRMb3cgPSAxO1xuICAgIHRoaXMuX3ZvaWNlQWN0aXZpdHlEZXRlY3Rpb25JbnRlcnZhbDtcbiAgICB3aW5kb3cuQWdvcmFSdGNBZGFwdGVyID0gdGhpcztcblxuICB9XG5cbiAgc2V0U2VydmVyVXJsKHVybCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXRTZXJ2ZXJVcmwgXCIsIHVybCk7XG4gICAgdGhpcy5lYXN5cnRjLnNldFNvY2tldFVybCh1cmwpO1xuICB9XG5cbiAgc2V0QXBwKGFwcE5hbWUpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0QXBwIFwiLCBhcHBOYW1lKTtcbiAgICB0aGlzLmFwcCA9IGFwcE5hbWU7XG4gICAgdGhpcy5hcHBpZCA9IGFwcE5hbWU7XG4gIH1cblxuICBhc3luYyBzZXRSb29tKGpzb24pIHtcbiAgICBqc29uID0ganNvbi5yZXBsYWNlKC8nL2csICdcIicpO1xuICAgIGNvbnN0IG9iaiA9IEpTT04ucGFyc2UoanNvbik7XG4gICAgdGhpcy5yb29tID0gb2JqLm5hbWU7XG5cbiAgICBpZiAob2JqLnZiZyAmJiBvYmoudmJnID09ICd0cnVlJykge1xuICAgICAgdGhpcy52YmcgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChvYmoudmJnMCAmJiBvYmoudmJnMCA9PSAndHJ1ZScpIHtcbiAgICAgIHRoaXMudmJnMCA9IHRydWU7XG4gICAgICBBZ29yYVJUQy5sb2FkTW9kdWxlKFNlZ1BsdWdpbiwge30pO1xuICAgIH1cblxuICAgIGlmIChvYmouZW5hYmxlQXZhdGFyICYmIG9iai5lbmFibGVBdmF0YXIgPT0gJ3RydWUnKSB7XG4gICAgICB0aGlzLmVuYWJsZUF2YXRhciA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKG9iai5zaG93TG9jYWwgJiYgb2JqLnNob3dMb2NhbCA9PSAndHJ1ZScpIHtcbiAgICAgIHRoaXMuc2hvd0xvY2FsID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAob2JqLmVuYWJsZVZpZGVvRmlsdGVyZWQgJiYgb2JqLmVuYWJsZVZpZGVvRmlsdGVyZWQgPT0gJ3RydWUnKSB7XG4gICAgICB0aGlzLmVuYWJsZVZpZGVvRmlsdGVyZWQgPSB0cnVlO1xuICAgIH1cbiAgICB0aGlzLmVhc3lydGMuam9pblJvb20odGhpcy5yb29tLCBudWxsKTtcbiAgfVxuXG4gIC8vIG9wdGlvbnM6IHsgZGF0YWNoYW5uZWw6IGJvb2wsIGF1ZGlvOiBib29sLCB2aWRlbzogYm9vbCB9XG4gIHNldFdlYlJ0Y09wdGlvbnMob3B0aW9ucykge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXRXZWJSdGNPcHRpb25zIFwiLCBvcHRpb25zKTtcbiAgICAvLyB0aGlzLmVhc3lydGMuZW5hYmxlRGVidWcodHJ1ZSk7XG4gICAgdGhpcy5lYXN5cnRjLmVuYWJsZURhdGFDaGFubmVscyhvcHRpb25zLmRhdGFjaGFubmVsKTtcblxuICAgIC8vIHVzaW5nIEFnb3JhXG4gICAgdGhpcy5lbmFibGVWaWRlbyA9IG9wdGlvbnMudmlkZW87XG4gICAgdGhpcy5lbmFibGVBdWRpbyA9IG9wdGlvbnMuYXVkaW87XG5cbiAgICAvLyBub3QgZWFzeXJ0Y1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVWaWRlbyhmYWxzZSk7XG4gICAgdGhpcy5lYXN5cnRjLmVuYWJsZUF1ZGlvKGZhbHNlKTtcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlVmlkZW9SZWNlaXZlKGZhbHNlKTtcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlQXVkaW9SZWNlaXZlKGZhbHNlKTtcbiAgfVxuXG4gIHNldFNlcnZlckNvbm5lY3RMaXN0ZW5lcnMoc3VjY2Vzc0xpc3RlbmVyLCBmYWlsdXJlTGlzdGVuZXIpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0U2VydmVyQ29ubmVjdExpc3RlbmVycyBcIiwgc3VjY2Vzc0xpc3RlbmVyLCBmYWlsdXJlTGlzdGVuZXIpO1xuICAgIHRoaXMuY29ubmVjdFN1Y2Nlc3MgPSBzdWNjZXNzTGlzdGVuZXI7XG4gICAgdGhpcy5jb25uZWN0RmFpbHVyZSA9IGZhaWx1cmVMaXN0ZW5lcjtcbiAgfVxuXG4gIHNldFJvb21PY2N1cGFudExpc3RlbmVyKG9jY3VwYW50TGlzdGVuZXIpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0Um9vbU9jY3VwYW50TGlzdGVuZXIgXCIsIG9jY3VwYW50TGlzdGVuZXIpO1xuXG4gICAgdGhpcy5lYXN5cnRjLnNldFJvb21PY2N1cGFudExpc3RlbmVyKGZ1bmN0aW9uIChyb29tTmFtZSwgb2NjdXBhbnRzLCBwcmltYXJ5KSB7XG4gICAgICBvY2N1cGFudExpc3RlbmVyKG9jY3VwYW50cyk7XG4gICAgfSk7XG4gIH1cblxuICBzZXREYXRhQ2hhbm5lbExpc3RlbmVycyhvcGVuTGlzdGVuZXIsIGNsb3NlZExpc3RlbmVyLCBtZXNzYWdlTGlzdGVuZXIpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0RGF0YUNoYW5uZWxMaXN0ZW5lcnMgIFwiLCBvcGVuTGlzdGVuZXIsIGNsb3NlZExpc3RlbmVyLCBtZXNzYWdlTGlzdGVuZXIpO1xuICAgIHRoaXMuZWFzeXJ0Yy5zZXREYXRhQ2hhbm5lbE9wZW5MaXN0ZW5lcihvcGVuTGlzdGVuZXIpO1xuICAgIHRoaXMuZWFzeXJ0Yy5zZXREYXRhQ2hhbm5lbENsb3NlTGlzdGVuZXIoY2xvc2VkTGlzdGVuZXIpO1xuICAgIHRoaXMuZWFzeXJ0Yy5zZXRQZWVyTGlzdGVuZXIobWVzc2FnZUxpc3RlbmVyKTtcbiAgfVxuXG4gIHVwZGF0ZVRpbWVPZmZzZXQoKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHVwZGF0ZVRpbWVPZmZzZXQgXCIpO1xuICAgIGNvbnN0IGNsaWVudFNlbnRUaW1lID0gRGF0ZS5ub3coKSArIHRoaXMuYXZnVGltZU9mZnNldDtcblxuICAgIHJldHVybiBmZXRjaChkb2N1bWVudC5sb2NhdGlvbi5ocmVmLCB7IG1ldGhvZDogXCJIRUFEXCIsIGNhY2hlOiBcIm5vLWNhY2hlXCIgfSkudGhlbihyZXMgPT4ge1xuICAgICAgdmFyIHByZWNpc2lvbiA9IDEwMDA7XG4gICAgICB2YXIgc2VydmVyUmVjZWl2ZWRUaW1lID0gbmV3IERhdGUocmVzLmhlYWRlcnMuZ2V0KFwiRGF0ZVwiKSkuZ2V0VGltZSgpICsgcHJlY2lzaW9uIC8gMjtcbiAgICAgIHZhciBjbGllbnRSZWNlaXZlZFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgdmFyIHNlcnZlclRpbWUgPSBzZXJ2ZXJSZWNlaXZlZFRpbWUgKyAoY2xpZW50UmVjZWl2ZWRUaW1lIC0gY2xpZW50U2VudFRpbWUpIC8gMjtcbiAgICAgIHZhciB0aW1lT2Zmc2V0ID0gc2VydmVyVGltZSAtIGNsaWVudFJlY2VpdmVkVGltZTtcblxuICAgICAgdGhpcy5zZXJ2ZXJUaW1lUmVxdWVzdHMrKztcblxuICAgICAgaWYgKHRoaXMuc2VydmVyVGltZVJlcXVlc3RzIDw9IDEwKSB7XG4gICAgICAgIHRoaXMudGltZU9mZnNldHMucHVzaCh0aW1lT2Zmc2V0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudGltZU9mZnNldHNbdGhpcy5zZXJ2ZXJUaW1lUmVxdWVzdHMgJSAxMF0gPSB0aW1lT2Zmc2V0O1xuICAgICAgfVxuXG4gICAgICB0aGlzLmF2Z1RpbWVPZmZzZXQgPSB0aGlzLnRpbWVPZmZzZXRzLnJlZHVjZSgoYWNjLCBvZmZzZXQpID0+IGFjYyArPSBvZmZzZXQsIDApIC8gdGhpcy50aW1lT2Zmc2V0cy5sZW5ndGg7XG5cbiAgICAgIGlmICh0aGlzLnNlcnZlclRpbWVSZXF1ZXN0cyA+IDEwKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy51cGRhdGVUaW1lT2Zmc2V0KCksIDUgKiA2MCAqIDEwMDApOyAvLyBTeW5jIGNsb2NrIGV2ZXJ5IDUgbWludXRlcy5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudXBkYXRlVGltZU9mZnNldCgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgY29ubmVjdCgpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgY29ubmVjdCBcIik7XG4gICAgUHJvbWlzZS5hbGwoW3RoaXMudXBkYXRlVGltZU9mZnNldCgpLCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLl9jb25uZWN0KHJlc29sdmUsIHJlamVjdCk7XG4gICAgfSldKS50aGVuKChbXywgY2xpZW50SWRdKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIkJXNzMgY29ubmVjdGVkIFwiICsgY2xpZW50SWQpO1xuICAgICAgdGhpcy5jbGllbnRJZCA9IGNsaWVudElkO1xuICAgICAgdGhpcy5fbXlSb29tSm9pblRpbWUgPSB0aGlzLl9nZXRSb29tSm9pblRpbWUoY2xpZW50SWQpO1xuICAgICAgdGhpcy5jb25uZWN0QWdvcmEoKTtcbiAgICAgIHRoaXMuY29ubmVjdFN1Y2Nlc3MoY2xpZW50SWQpO1xuICAgIH0pLmNhdGNoKHRoaXMuY29ubmVjdEZhaWx1cmUpO1xuICB9XG5cbiAgc2hvdWxkU3RhcnRDb25uZWN0aW9uVG8oY2xpZW50KSB7XG4gICAgcmV0dXJuIHRoaXMuX215Um9vbUpvaW5UaW1lIDw9IGNsaWVudC5yb29tSm9pblRpbWU7XG4gIH1cblxuICBzdGFydFN0cmVhbUNvbm5lY3Rpb24oY2xpZW50SWQpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc3RhcnRTdHJlYW1Db25uZWN0aW9uIFwiLCBjbGllbnRJZCk7XG4gICAgdGhpcy5lYXN5cnRjLmNhbGwoY2xpZW50SWQsIGZ1bmN0aW9uIChjYWxsZXIsIG1lZGlhKSB7XG4gICAgICBpZiAobWVkaWEgPT09IFwiZGF0YWNoYW5uZWxcIikge1xuICAgICAgICBOQUYubG9nLndyaXRlKFwiU3VjY2Vzc2Z1bGx5IHN0YXJ0ZWQgZGF0YWNoYW5uZWwgdG8gXCIsIGNhbGxlcik7XG4gICAgICB9XG4gICAgfSwgZnVuY3Rpb24gKGVycm9yQ29kZSwgZXJyb3JUZXh0KSB7XG4gICAgICBOQUYubG9nLmVycm9yKGVycm9yQ29kZSwgZXJyb3JUZXh0KTtcbiAgICB9LCBmdW5jdGlvbiAod2FzQWNjZXB0ZWQpIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwid2FzIGFjY2VwdGVkPVwiICsgd2FzQWNjZXB0ZWQpO1xuICAgIH0pO1xuICB9XG5cbiAgY2xvc2VTdHJlYW1Db25uZWN0aW9uKGNsaWVudElkKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGNsb3NlU3RyZWFtQ29ubmVjdGlvbiBcIiwgY2xpZW50SWQpO1xuICAgIHRoaXMuZWFzeXJ0Yy5oYW5ndXAoY2xpZW50SWQpO1xuICB9XG5cbiAgc2VuZE1vY2FwKG1vY2FwKSB7XG4gICAgaWYgKG1vY2FwID09IHRoaXMubW9jYXBQcmV2RGF0YSkge1xuICAgICAgLy8gICBjb25zb2xlLmxvZyhcImJsYW5rXCIpO1xuICAgICAgbW9jYXAgPSBcIlwiO1xuICAgIH1cblxuICAgIC8vIHNldCB0byBibGFuayBhZnRlciBzZW5kaW5nXG4gICAgaWYgKHRoaXMubW9jYXBEYXRhID09PSBcIlwiKSB7XG4gICAgICB0aGlzLm1vY2FwRGF0YSA9IG1vY2FwO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5pc0Nocm9tZSkge1xuICAgICAgdGhpcy5zZW5kZXJDaGFubmVsLnBvcnQxLnBvc3RNZXNzYWdlKHsgd2F0ZXJtYXJrOiBtb2NhcCB9KTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBjcmVhdGVFbmNvZGVyKHNlbmRlcikge1xuICAgIGlmICh0aGlzLmlzQ2hyb21lKSB7XG4gICAgICBjb25zdCBzdHJlYW1zID0gc2VuZGVyLmNyZWF0ZUVuY29kZWRTdHJlYW1zKCk7XG4gICAgICBjb25zdCB0ZXh0RW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgY29uc3QgdHJhbnNmb3JtZXIgPSBuZXcgVHJhbnNmb3JtU3RyZWFtKHtcbiAgICAgICAgdHJhbnNmb3JtKGNodW5rLCBjb250cm9sbGVyKSB7XG4gICAgICAgICAgY29uc3QgbW9jYXAgPSB0ZXh0RW5jb2Rlci5lbmNvZGUodGhhdC5tb2NhcERhdGEpO1xuICAgICAgLy8gICAgY29uc29sZS5lcnJvcihcImFwcGVuZGluZyBcIix0aGF0Lm1vY2FwRGF0YSk7XG4gICAgICAgICAgdGhhdC5tb2NhcFByZXZEYXRhID0gdGhhdC5tb2NhcERhdGE7XG4gICAgICAgICAgdGhhdC5tb2NhcERhdGEgPSBcIlwiO1xuICAgICAgICAgIGNvbnN0IGZyYW1lID0gY2h1bmsuZGF0YTtcbiAgICAgICAgICBjb25zdCBkYXRhID0gbmV3IFVpbnQ4QXJyYXkoY2h1bmsuZGF0YS5ieXRlTGVuZ3RoICsgbW9jYXAuYnl0ZUxlbmd0aCArIHRoYXQuQ3VzdG9tRGF0TGVuZ3RoQnl0ZUNvdW50ICsgdGhhdC5DdXN0b21EYXRhRGV0ZWN0b3IubGVuZ3RoKTtcbiAgICAgICAgICBkYXRhLnNldChuZXcgVWludDhBcnJheShmcmFtZSksIDApO1xuICAgICAgICAgIGRhdGEuc2V0KG1vY2FwLCBmcmFtZS5ieXRlTGVuZ3RoKTtcbiAgICAgICAgICB2YXIgYnl0ZXMgPSB0aGF0LmdldEludEJ5dGVzKG1vY2FwLmJ5dGVMZW5ndGgpO1xuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhhdC5DdXN0b21EYXRMZW5ndGhCeXRlQ291bnQ7IGkrKykge1xuICAgICAgICAgICAgZGF0YVtmcmFtZS5ieXRlTGVuZ3RoICsgbW9jYXAuYnl0ZUxlbmd0aCArIGldID0gYnl0ZXNbaV07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gU2V0IG1hZ2ljIHN0cmluZyBhdCB0aGUgZW5kXG4gICAgICAgICAgY29uc3QgbWFnaWNJbmRleCA9IGZyYW1lLmJ5dGVMZW5ndGggKyBtb2NhcC5ieXRlTGVuZ3RoICsgdGhhdC5DdXN0b21EYXRMZW5ndGhCeXRlQ291bnQ7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGF0LkN1c3RvbURhdGFEZXRlY3Rvci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZGF0YVttYWdpY0luZGV4ICsgaV0gPSB0aGF0LkN1c3RvbURhdGFEZXRlY3Rvci5jaGFyQ29kZUF0KGkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjaHVuay5kYXRhID0gZGF0YS5idWZmZXI7XG4vLyAgICAgICAgICB0cnkge1xuLy8gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwic2VuZGluZyBcIiwgbW9jYXAuYnl0ZUxlbmd0aCxcIiB0byBcIiwgY2h1bmsuZGF0YS5ieXRlTGVuZ3RoKTtcbiAgICAgICAgICAgIGNvbnRyb2xsZXIuZW5xdWV1ZShjaHVuayk7XG4gICAgICAgLy8gICAgY29uc29sZS5lcnJvcihcInNlbnQgXCIsIG1vY2FwLmJ5dGVMZW5ndGgsXCIgdG8gXCIsIGNodW5rLmRhdGEuYnl0ZUxlbmd0aCk7XG5cbi8vICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbi8vICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbi8vICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHN0cmVhbXMucmVhZGFibGUucGlwZVRocm91Z2godHJhbnNmb3JtZXIpLnBpcGVUbyhzdHJlYW1zLndyaXRhYmxlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgY29uc3Qgd29ya2VyID0gbmV3IFdvcmtlcignL2Rpc3Qvc2NyaXB0LXRyYW5zZm9ybS13b3JrZXIuanMnKTtcbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gd29ya2VyLm9ubWVzc2FnZSA9IChldmVudCkgPT4ge1xuICAgICAgICBpZiAoZXZlbnQuZGF0YSA9PT0gJ3JlZ2lzdGVyZWQnKSB7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGNvbnN0IHNlbmRlclRyYW5zZm9ybSA9IG5ldyBSVENSdHBTY3JpcHRUcmFuc2Zvcm0od29ya2VyLCB7IG5hbWU6ICdvdXRnb2luZycsIHBvcnQ6IHRoYXQuc2VuZGVyQ2hhbm5lbC5wb3J0MiB9LCBbdGhhdC5zZW5kZXJDaGFubmVsLnBvcnQyXSk7XG4gICAgICBzZW5kZXJUcmFuc2Zvcm0ucG9ydCA9IHRoYXQuc2VuZGVyQ2hhbm5lbC5wb3J0MTtcbiAgICAgIHNlbmRlci50cmFuc2Zvcm0gPSBzZW5kZXJUcmFuc2Zvcm07XG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHdvcmtlci5vbm1lc3NhZ2UgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LmRhdGEgPT09ICdzdGFydGVkJykge1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHNlbmRlclRyYW5zZm9ybS5wb3J0Lm9ubWVzc2FnZSA9IGUgPT4ge1xuICAgICAgICBpZiAoZS5kYXRhID09IFwiQ0xFQVJcIikge1xuICAgICAgICAgIHRoYXQubW9jYXBQcmV2RGF0YSA9IHRoYXQubW9jYXBEYXRhO1xuICAgICAgICAgIHRoYXQubW9jYXBEYXRhID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHRoYXQuc2VuZGVyQ2hhbm5lbC5wb3J0MS5wb3N0TWVzc2FnZSh7IHdhdGVybWFyazogdGhhdC5tb2NhcERhdGEgfSk7XG4gICAgfVxuICB9XG5cbiAgLypcbiAgYXN5bmMgcmVjcmVhdGVEZWNvZGVyKCl7XG4gICAgdGhpcy5jcmVhdGVEZWNvZGVyKHRoaXMucl9yZWNlaXZlcix0aGlzLnJfY2xpZW50SWQpO1xuICB9Ki9cblxuICBhc3luYyBjcmVhdGVEZWNvZGVyKHJlY2VpdmVyLCBjbGllbnRJZCkge1xuICAgIGlmICh0aGlzLmlzQ2hyb21lKSB7XG4gICAgICBjb25zdCBzdHJlYW1zID0gcmVjZWl2ZXIuY3JlYXRlRW5jb2RlZFN0cmVhbXMoKTtcbiAgICAgIGNvbnN0IHRleHREZWNvZGVyID0gbmV3IFRleHREZWNvZGVyKCk7XG4gICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgIGNvbnN0IHRyYW5zZm9ybWVyID0gbmV3IFRyYW5zZm9ybVN0cmVhbSh7XG4gICAgICAgIHRyYW5zZm9ybShjaHVuaywgY29udHJvbGxlcikge1xuICAgICAgICAgIGNvbnN0IHZpZXcgPSBuZXcgRGF0YVZpZXcoY2h1bmsuZGF0YSk7XG4gICAgICAgICAgY29uc3QgbWFnaWNEYXRhID0gbmV3IFVpbnQ4QXJyYXkoY2h1bmsuZGF0YSwgY2h1bmsuZGF0YS5ieXRlTGVuZ3RoIC0gdGhhdC5DdXN0b21EYXRhRGV0ZWN0b3IubGVuZ3RoLCB0aGF0LkN1c3RvbURhdGFEZXRlY3Rvci5sZW5ndGgpO1xuICAgICAgICAgIGxldCBtYWdpYyA9IFtdO1xuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhhdC5DdXN0b21EYXRhRGV0ZWN0b3IubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIG1hZ2ljLnB1c2gobWFnaWNEYXRhW2ldKTtcblxuICAgICAgICAgIH1cbiAgICAgICAgICBsZXQgbWFnaWNTdHJpbmcgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKC4uLm1hZ2ljKTtcbiAgICAgICAgICBpZiAobWFnaWNTdHJpbmcgPT09IHRoYXQuQ3VzdG9tRGF0YURldGVjdG9yKSB7XG4gICAgICAgICAgICBjb25zdCBtb2NhcExlbiA9IHZpZXcuZ2V0VWludDMyKGNodW5rLmRhdGEuYnl0ZUxlbmd0aCAtICh0aGF0LkN1c3RvbURhdExlbmd0aEJ5dGVDb3VudCArIHRoYXQuQ3VzdG9tRGF0YURldGVjdG9yLmxlbmd0aCksIGZhbHNlKTtcbiAgICAgICAgICAgIGNvbnN0IGZyYW1lU2l6ZSA9IGNodW5rLmRhdGEuYnl0ZUxlbmd0aCAtIChtb2NhcExlbiArIHRoYXQuQ3VzdG9tRGF0TGVuZ3RoQnl0ZUNvdW50ICsgdGhhdC5DdXN0b21EYXRhRGV0ZWN0b3IubGVuZ3RoKTtcbiAgICAgICAgICAgIGNvbnN0IG1vY2FwQnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoY2h1bmsuZGF0YSwgZnJhbWVTaXplLCBtb2NhcExlbik7XG4gICAgICAgICAgICBjb25zdCBtb2NhcCA9IHRleHREZWNvZGVyLmRlY29kZShtb2NhcEJ1ZmZlcilcbiAgICAgICAgICAgIGlmIChtb2NhcC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgIHdpbmRvdy5yZW1vdGVNb2NhcChtb2NhcCArIFwiLFwiICsgY2xpZW50SWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZnJhbWUgPSBjaHVuay5kYXRhO1xuICAgICAgICAgICAgY2h1bmsuZGF0YSA9IG5ldyBBcnJheUJ1ZmZlcihmcmFtZVNpemUpO1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IG5ldyBVaW50OEFycmF5KGNodW5rLmRhdGEpO1xuICAgICAgICAgICAgZGF0YS5zZXQobmV3IFVpbnQ4QXJyYXkoZnJhbWUsIDAsIGZyYW1lU2l6ZSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb250cm9sbGVyLmVucXVldWUoY2h1bmspO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHN0cmVhbXMucmVhZGFibGUucGlwZVRocm91Z2godHJhbnNmb3JtZXIpLnBpcGVUbyhzdHJlYW1zLndyaXRhYmxlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yZWNlaXZlckNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWw7XG4gICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICBjb25zdCB3b3JrZXIgPSBuZXcgV29ya2VyKCcvZGlzdC9zY3JpcHQtdHJhbnNmb3JtLXdvcmtlci5qcycpO1xuICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiB3b3JrZXIub25tZXNzYWdlID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldmVudC5kYXRhID09PSAncmVnaXN0ZXJlZCcpIHtcblxuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHJlY2VpdmVyVHJhbnNmb3JtID0gbmV3IFJUQ1J0cFNjcmlwdFRyYW5zZm9ybSh3b3JrZXIsIHsgbmFtZTogJ2luY29taW5nJywgcG9ydDogdGhhdC5yZWNlaXZlckNoYW5uZWwucG9ydDIgfSwgW3RoYXQucmVjZWl2ZXJDaGFubmVsLnBvcnQyXSk7XG5cbiAgICAgIHJlY2VpdmVyVHJhbnNmb3JtLnBvcnQgPSB0aGF0LnJlY2VpdmVyQ2hhbm5lbC5wb3J0MTtcbiAgICAgIHJlY2VpdmVyLnRyYW5zZm9ybSA9IHJlY2VpdmVyVHJhbnNmb3JtO1xuICAgICAgcmVjZWl2ZXJUcmFuc2Zvcm0ucG9ydC5vbm1lc3NhZ2UgPSBlID0+IHtcbiAgICAgICAgaWYgKGUuZGF0YS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgd2luZG93LnJlbW90ZU1vY2FwKGUuZGF0YSArIFwiLFwiICsgY2xpZW50SWQpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHdvcmtlci5vbm1lc3NhZ2UgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LmRhdGEgPT09ICdzdGFydGVkJykge1xuICAgICAgICAgIC8vICBjb25zb2xlLndhcm4oXCJpbmNvbWluZyA1YVwiLGNsaWVudElkLGV2ZW50LmRhdGEgKTtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gICBjb25zb2xlLndhcm4oXCJpbmNvbWluZyA1XCIsY2xpZW50SWQsZXZlbnQuZGF0YSApO1xuXG4gICAgICB9KTtcbiAgICAgIC8vICBjb25zb2xlLndhcm4oXCJpbmNvbWluZyA2XCIsY2xpZW50SWQgKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyByZWFkU3RhdHMoKSB7XG5cblxuICAgIGlmICghdGhpcy5hZ29yYUNsaWVudC5fdXNlcnMpe1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBmb3IgKHZhciB1ID0gMDsgdSA8IHRoaXMuYWdvcmFDbGllbnQuX3VzZXJzLmxlbmd0aDsgdSsrKSB7XG4gICAgICBpZiAodGhpcy5hZ29yYUNsaWVudC5fdXNlcnNbdV0uYXVkaW9UcmFjayAmJiB0aGlzLmFnb3JhQ2xpZW50Ll91c2Vyc1t1XS5hdWRpb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrKSB7XG4gICAgICBhd2FpdCB0aGlzLmFnb3JhQ2xpZW50Ll9wMnBDaGFubmVsLmNvbm5lY3Rpb24ucGVlckNvbm5lY3Rpb24uZ2V0U3RhdHModGhpcy5hZ29yYUNsaWVudC5fdXNlcnNbdV0uYXVkaW9UcmFjay5fbWVkaWFTdHJlYW1UcmFjaykudGhlbihhc3luYyBzdGF0cyA9PiB7XG4gICAgICAgIGF3YWl0IHN0YXRzLmZvckVhY2gocmVwb3J0ID0+IHtcbiAgICAgICAgICBpZiAocmVwb3J0LnR5cGUgPT09IFwiaW5ib3VuZC1ydHBcIiAmJiByZXBvcnQua2luZCA9PT0gXCJhdWRpb1wiKSB7ICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgaml0dGVyQnVmZmVyRGVsYXkgPSAocmVwb3J0W1wiaml0dGVyQnVmZmVyRGVsYXlcIl0vcmVwb3J0W1wiaml0dGVyQnVmZmVyRW1pdHRlZENvdW50XCJdKS50b0ZpeGVkKDMpO1xuICAgICAgICAgICAgaWYgKCFpc05hTihqaXR0ZXJCdWZmZXJEZWxheSkpIHtcbiAgICAgICAgICAgICAgdGhpcy5hdWRpb0ppdHRlclt0aGlzLmFnb3JhQ2xpZW50Ll91c2Vyc1t1XS51aWRdPWppdHRlckJ1ZmZlckRlbGF5KjEwMDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aGlzLmF1ZGlvSml0dGVyW3RoaXMuYWdvcmFDbGllbnQuX3VzZXJzW3VdLnVpZF09ODA7IC8vIGRlZmF1bHQgbXNcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzZW5kRGF0YShjbGllbnRJZCwgZGF0YVR5cGUsIGRhdGEpIHtcbiAgICAvLyAgY29uc29sZS5sb2coXCJCVzczIHNlbmREYXRhIFwiLCBjbGllbnRJZCwgZGF0YVR5cGUsIGRhdGEpO1xuICAgIC8vIHNlbmQgdmlhIHdlYnJ0YyBvdGhlcndpc2UgZmFsbGJhY2sgdG8gd2Vic29ja2V0c1xuICAgIHRoaXMuZWFzeXJ0Yy5zZW5kRGF0YShjbGllbnRJZCwgZGF0YVR5cGUsIGRhdGEpO1xuICB9XG5cbiAgc2VuZERhdGFHdWFyYW50ZWVkKGNsaWVudElkLCBkYXRhVHlwZSwgZGF0YSkge1xuICAgIC8vICBjb25zb2xlLmxvZyhcIkJXNzMgc2VuZERhdGFHdWFyYW50ZWVkIFwiLCBjbGllbnRJZCwgZGF0YVR5cGUsIGRhdGEpO1xuICAgIHRoaXMuZWFzeXJ0Yy5zZW5kRGF0YVdTKGNsaWVudElkLCBkYXRhVHlwZSwgZGF0YSk7XG4gIH1cblxuICBicm9hZGNhc3REYXRhKGRhdGFUeXBlLCBkYXRhKSB7XG4gICAgcmV0dXJuIHRoaXMuYnJvYWRjYXN0RGF0YUd1YXJhbnRlZWQoZGF0YVR5cGUsIGRhdGEpO1xuICAgIC8qXG4gICAgY29uc29sZS5sb2coXCJCVzczIGJyb2FkY2FzdERhdGEgXCIsIGRhdGFUeXBlLCBkYXRhKTtcbiAgICB2YXIgcm9vbU9jY3VwYW50cyA9IHRoaXMuZWFzeXJ0Yy5nZXRSb29tT2NjdXBhbnRzQXNNYXAodGhpcy5yb29tKTtcblxuICAgIC8vIEl0ZXJhdGUgb3ZlciB0aGUga2V5cyBvZiB0aGUgZWFzeXJ0YyByb29tIG9jY3VwYW50cyBtYXAuXG4gICAgLy8gZ2V0Um9vbU9jY3VwYW50c0FzQXJyYXkgdXNlcyBPYmplY3Qua2V5cyB3aGljaCBhbGxvY2F0ZXMgbWVtb3J5LlxuICAgIGZvciAodmFyIHJvb21PY2N1cGFudCBpbiByb29tT2NjdXBhbnRzKSB7XG4gICAgICBpZiAocm9vbU9jY3VwYW50c1tyb29tT2NjdXBhbnRdICYmIHJvb21PY2N1cGFudCAhPT0gdGhpcy5lYXN5cnRjLm15RWFzeXJ0Y2lkKSB7XG4gICAgICAgIC8vIHNlbmQgdmlhIHdlYnJ0YyBvdGhlcndpc2UgZmFsbGJhY2sgdG8gd2Vic29ja2V0c1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHRoaXMuZWFzeXJ0Yy5zZW5kRGF0YShyb29tT2NjdXBhbnQsIGRhdGFUeXBlLCBkYXRhKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICBjb25zb2xlLmVycm9yKFwic2VuZERhdGFcIixlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICAqL1xuICB9XG5cbiAgYnJvYWRjYXN0RGF0YUd1YXJhbnRlZWQoZGF0YVR5cGUsIGRhdGEpIHtcbiAgICAvLyBjb25zb2xlLmxvZyhcIkJXNzMgYnJvYWRjYXN0RGF0YUd1YXJhbnRlZWQgXCIsIGRhdGFUeXBlLCBkYXRhKTtcbiAgICB2YXIgZGVzdGluYXRpb24gPSB7IHRhcmdldFJvb206IHRoaXMucm9vbSB9O1xuICAgIHRoaXMuZWFzeXJ0Yy5zZW5kRGF0YVdTKGRlc3RpbmF0aW9uLCBkYXRhVHlwZSwgZGF0YSk7XG4gIH1cblxuICBnZXRDb25uZWN0U3RhdHVzKGNsaWVudElkKSB7XG4gICAgLy8gIGNvbnNvbGUubG9nKFwiQlc3MyBnZXRDb25uZWN0U3RhdHVzIFwiLCBjbGllbnRJZCk7XG4gICAgdmFyIHN0YXR1cyA9IHRoaXMuZWFzeXJ0Yy5nZXRDb25uZWN0U3RhdHVzKGNsaWVudElkKTtcblxuICAgIGlmIChzdGF0dXMgPT0gdGhpcy5lYXN5cnRjLklTX0NPTk5FQ1RFRCkge1xuICAgICAgcmV0dXJuIE5BRi5hZGFwdGVycy5JU19DT05ORUNURUQ7XG4gICAgfSBlbHNlIGlmIChzdGF0dXMgPT0gdGhpcy5lYXN5cnRjLk5PVF9DT05ORUNURUQpIHtcbiAgICAgIHJldHVybiBOQUYuYWRhcHRlcnMuTk9UX0NPTk5FQ1RFRDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIE5BRi5hZGFwdGVycy5DT05ORUNUSU5HO1xuICAgIH1cbiAgfVxuXG4gIGdldE1lZGlhU3RyZWFtKGNsaWVudElkLCBzdHJlYW1OYW1lID0gXCJhdWRpb1wiKSB7XG5cbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgZ2V0TWVkaWFTdHJlYW0gXCIsIGNsaWVudElkLCBzdHJlYW1OYW1lKTtcbiAgICAvLyBpZiAoIHN0cmVhbU5hbWUgPSBcImF1ZGlvXCIpIHtcbiAgICAvL3N0cmVhbU5hbWUgPSBcImJvZF9hdWRpb1wiO1xuICAgIC8vfVxuXG4gICAgaWYgKHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXSAmJiB0aGlzLm1lZGlhU3RyZWFtc1tjbGllbnRJZF1bc3RyZWFtTmFtZV0pIHtcbiAgICAgIE5BRi5sb2cud3JpdGUoYEFscmVhZHkgaGFkICR7c3RyZWFtTmFtZX0gZm9yICR7Y2xpZW50SWR9YCk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXVtzdHJlYW1OYW1lXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIE5BRi5sb2cud3JpdGUoYFdhaXRpbmcgb24gJHtzdHJlYW1OYW1lfSBmb3IgJHtjbGllbnRJZH1gKTtcblxuICAgICAgLy8gQ3JlYXRlIGluaXRpYWwgcGVuZGluZ01lZGlhUmVxdWVzdHMgd2l0aCBhdWRpb3x2aWRlbyBhbGlhc1xuICAgICAgaWYgKCF0aGlzLnBlbmRpbmdNZWRpYVJlcXVlc3RzLmhhcyhjbGllbnRJZCkpIHtcbiAgICAgICAgY29uc3QgcGVuZGluZ01lZGlhUmVxdWVzdHMgPSB7fTtcblxuICAgICAgICBjb25zdCBhdWRpb1Byb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHMuYXVkaW8gPSB7IHJlc29sdmUsIHJlamVjdCB9O1xuICAgICAgICB9KS5jYXRjaChlID0+IE5BRi5sb2cud2FybihgJHtjbGllbnRJZH0gZ2V0TWVkaWFTdHJlYW0gQXVkaW8gRXJyb3JgLCBlKSk7XG5cbiAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHMuYXVkaW8ucHJvbWlzZSA9IGF1ZGlvUHJvbWlzZTtcblxuICAgICAgICBjb25zdCB2aWRlb1Byb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHMudmlkZW8gPSB7IHJlc29sdmUsIHJlamVjdCB9O1xuICAgICAgICB9KS5jYXRjaChlID0+IE5BRi5sb2cud2FybihgJHtjbGllbnRJZH0gZ2V0TWVkaWFTdHJlYW0gVmlkZW8gRXJyb3JgLCBlKSk7XG4gICAgICAgIHBlbmRpbmdNZWRpYVJlcXVlc3RzLnZpZGVvLnByb21pc2UgPSB2aWRlb1Byb21pc2U7XG5cbiAgICAgICAgdGhpcy5wZW5kaW5nTWVkaWFSZXF1ZXN0cy5zZXQoY2xpZW50SWQsIHBlbmRpbmdNZWRpYVJlcXVlc3RzKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcGVuZGluZ01lZGlhUmVxdWVzdHMgPSB0aGlzLnBlbmRpbmdNZWRpYVJlcXVlc3RzLmdldChjbGllbnRJZCk7XG5cbiAgICAgIC8vIENyZWF0ZSBpbml0aWFsIHBlbmRpbmdNZWRpYVJlcXVlc3RzIHdpdGggc3RyZWFtTmFtZVxuICAgICAgaWYgKCFwZW5kaW5nTWVkaWFSZXF1ZXN0c1tzdHJlYW1OYW1lXSkge1xuICAgICAgICBjb25zdCBzdHJlYW1Qcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIHBlbmRpbmdNZWRpYVJlcXVlc3RzW3N0cmVhbU5hbWVdID0geyByZXNvbHZlLCByZWplY3QgfTtcbiAgICAgICAgfSkuY2F0Y2goZSA9PiBOQUYubG9nLndhcm4oYCR7Y2xpZW50SWR9IGdldE1lZGlhU3RyZWFtIFwiJHtzdHJlYW1OYW1lfVwiIEVycm9yYCwgZSkpO1xuICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0c1tzdHJlYW1OYW1lXS5wcm9taXNlID0gc3RyZWFtUHJvbWlzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucGVuZGluZ01lZGlhUmVxdWVzdHMuZ2V0KGNsaWVudElkKVtzdHJlYW1OYW1lXS5wcm9taXNlO1xuICAgIH1cbiAgfVxuXG4gIHNldE1lZGlhU3RyZWFtKGNsaWVudElkLCBzdHJlYW0sIHN0cmVhbU5hbWUpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0TWVkaWFTdHJlYW0gXCIsIGNsaWVudElkLCBzdHJlYW0sIHN0cmVhbU5hbWUpO1xuICAgIGNvbnN0IHBlbmRpbmdNZWRpYVJlcXVlc3RzID0gdGhpcy5wZW5kaW5nTWVkaWFSZXF1ZXN0cy5nZXQoY2xpZW50SWQpOyAvLyByZXR1cm4gdW5kZWZpbmVkIGlmIHRoZXJlIGlzIG5vIGVudHJ5IGluIHRoZSBNYXBcbiAgICBjb25zdCBjbGllbnRNZWRpYVN0cmVhbXMgPSB0aGlzLm1lZGlhU3RyZWFtc1tjbGllbnRJZF0gPSB0aGlzLm1lZGlhU3RyZWFtc1tjbGllbnRJZF0gfHwge307XG5cbiAgICBpZiAoc3RyZWFtTmFtZSA9PT0gJ2RlZmF1bHQnKSB7XG4gICAgICAvLyBTYWZhcmkgZG9lc24ndCBsaWtlIGl0IHdoZW4geW91IHVzZSBhIG1peGVkIG1lZGlhIHN0cmVhbSB3aGVyZSBvbmUgb2YgdGhlIHRyYWNrcyBpcyBpbmFjdGl2ZSwgc28gd2VcbiAgICAgIC8vIHNwbGl0IHRoZSB0cmFja3MgaW50byB0d28gc3RyZWFtcy5cbiAgICAgIC8vIEFkZCBtZWRpYVN0cmVhbXMgYXVkaW8gc3RyZWFtTmFtZSBhbGlhc1xuICAgICAgY29uc3QgYXVkaW9UcmFja3MgPSBzdHJlYW0uZ2V0QXVkaW9UcmFja3MoKTtcbiAgICAgIGlmIChhdWRpb1RyYWNrcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGF1ZGlvU3RyZWFtID0gbmV3IE1lZGlhU3RyZWFtKCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgYXVkaW9UcmFja3MuZm9yRWFjaCh0cmFjayA9PiBhdWRpb1N0cmVhbS5hZGRUcmFjayh0cmFjaykpO1xuICAgICAgICAgIGNsaWVudE1lZGlhU3RyZWFtcy5hdWRpbyA9IGF1ZGlvU3RyZWFtO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgTkFGLmxvZy53YXJuKGAke2NsaWVudElkfSBzZXRNZWRpYVN0cmVhbSBcImF1ZGlvXCIgYWxpYXMgRXJyb3JgLCBlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlc29sdmUgdGhlIHByb21pc2UgZm9yIHRoZSB1c2VyJ3MgbWVkaWEgc3RyZWFtIGF1ZGlvIGFsaWFzIGlmIGl0IGV4aXN0cy5cbiAgICAgICAgaWYgKHBlbmRpbmdNZWRpYVJlcXVlc3RzKSBwZW5kaW5nTWVkaWFSZXF1ZXN0cy5hdWRpby5yZXNvbHZlKGF1ZGlvU3RyZWFtKTtcbiAgICAgIH1cblxuICAgICAgLy8gQWRkIG1lZGlhU3RyZWFtcyB2aWRlbyBzdHJlYW1OYW1lIGFsaWFzXG4gICAgICBjb25zdCB2aWRlb1RyYWNrcyA9IHN0cmVhbS5nZXRWaWRlb1RyYWNrcygpO1xuICAgICAgaWYgKHZpZGVvVHJhY2tzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgdmlkZW9TdHJlYW0gPSBuZXcgTWVkaWFTdHJlYW0oKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB2aWRlb1RyYWNrcy5mb3JFYWNoKHRyYWNrID0+IHZpZGVvU3RyZWFtLmFkZFRyYWNrKHRyYWNrKSk7XG4gICAgICAgICAgY2xpZW50TWVkaWFTdHJlYW1zLnZpZGVvID0gdmlkZW9TdHJlYW07XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBOQUYubG9nLndhcm4oYCR7Y2xpZW50SWR9IHNldE1lZGlhU3RyZWFtIFwidmlkZW9cIiBhbGlhcyBFcnJvcmAsIGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVzb2x2ZSB0aGUgcHJvbWlzZSBmb3IgdGhlIHVzZXIncyBtZWRpYSBzdHJlYW0gdmlkZW8gYWxpYXMgaWYgaXQgZXhpc3RzLlxuICAgICAgICBpZiAocGVuZGluZ01lZGlhUmVxdWVzdHMpIHBlbmRpbmdNZWRpYVJlcXVlc3RzLnZpZGVvLnJlc29sdmUodmlkZW9TdHJlYW0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjbGllbnRNZWRpYVN0cmVhbXNbc3RyZWFtTmFtZV0gPSBzdHJlYW07XG5cbiAgICAgIC8vIFJlc29sdmUgdGhlIHByb21pc2UgZm9yIHRoZSB1c2VyJ3MgbWVkaWEgc3RyZWFtIGJ5IFN0cmVhbU5hbWUgaWYgaXQgZXhpc3RzLlxuICAgICAgaWYgKHBlbmRpbmdNZWRpYVJlcXVlc3RzICYmIHBlbmRpbmdNZWRpYVJlcXVlc3RzW3N0cmVhbU5hbWVdKSB7XG4gICAgICAgIHBlbmRpbmdNZWRpYVJlcXVlc3RzW3N0cmVhbU5hbWVdLnJlc29sdmUoc3RyZWFtKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXRJbnRCeXRlcyh4KSB7XG4gICAgdmFyIGJ5dGVzID0gW107XG4gICAgdmFyIGkgPSB0aGlzLkN1c3RvbURhdExlbmd0aEJ5dGVDb3VudDtcbiAgICBkbyB7XG4gICAgICBieXRlc1stLWldID0geCAmICgyNTUpO1xuICAgICAgeCA9IHggPj4gODtcbiAgICB9IHdoaWxlIChpKVxuICAgIHJldHVybiBieXRlcztcbiAgfVxuXG4gIGFkZExvY2FsTWVkaWFTdHJlYW0oc3RyZWFtLCBzdHJlYW1OYW1lKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGFkZExvY2FsTWVkaWFTdHJlYW0gXCIsIHN0cmVhbSwgc3RyZWFtTmFtZSk7XG4gICAgY29uc3QgZWFzeXJ0YyA9IHRoaXMuZWFzeXJ0YztcbiAgICBzdHJlYW1OYW1lID0gc3RyZWFtTmFtZSB8fCBzdHJlYW0uaWQ7XG4gICAgdGhpcy5zZXRNZWRpYVN0cmVhbShcImxvY2FsXCIsIHN0cmVhbSwgc3RyZWFtTmFtZSk7XG4gICAgZWFzeXJ0Yy5yZWdpc3RlcjNyZFBhcnR5TG9jYWxNZWRpYVN0cmVhbShzdHJlYW0sIHN0cmVhbU5hbWUpO1xuXG4gICAgLy8gQWRkIGxvY2FsIHN0cmVhbSB0byBleGlzdGluZyBjb25uZWN0aW9uc1xuICAgIE9iamVjdC5rZXlzKHRoaXMucmVtb3RlQ2xpZW50cykuZm9yRWFjaChjbGllbnRJZCA9PiB7XG4gICAgICBpZiAoZWFzeXJ0Yy5nZXRDb25uZWN0U3RhdHVzKGNsaWVudElkKSAhPT0gZWFzeXJ0Yy5OT1RfQ09OTkVDVEVEKSB7XG4gICAgICAgIGVhc3lydGMuYWRkU3RyZWFtVG9DYWxsKGNsaWVudElkLCBzdHJlYW1OYW1lKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHJlbW92ZUxvY2FsTWVkaWFTdHJlYW0oc3RyZWFtTmFtZSkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyByZW1vdmVMb2NhbE1lZGlhU3RyZWFtIFwiLCBzdHJlYW1OYW1lKTtcbiAgICB0aGlzLmVhc3lydGMuY2xvc2VMb2NhbE1lZGlhU3RyZWFtKHN0cmVhbU5hbWUpO1xuICAgIGRlbGV0ZSB0aGlzLm1lZGlhU3RyZWFtc1tcImxvY2FsXCJdW3N0cmVhbU5hbWVdO1xuICB9XG5cbiAgZW5hYmxlTWljcm9waG9uZShlbmFibGVkKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGVuYWJsZU1pY3JvcGhvbmUgXCIsIGVuYWJsZWQpO1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVNaWNyb3Bob25lKGVuYWJsZWQpO1xuICB9XG5cbiAgZW5hYmxlQ2FtZXJhKGVuYWJsZWQpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgZW5hYmxlQ2FtZXJhIFwiLCBlbmFibGVkKTtcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlQ2FtZXJhKGVuYWJsZWQpO1xuICB9XG5cbiAgZGlzY29ubmVjdCgpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgZGlzY29ubmVjdCBcIik7XG4gICAgdGhpcy5lYXN5cnRjLmRpc2Nvbm5lY3QoKTtcbiAgfVxuXG4gIGFzeW5jIGhhbmRsZVVzZXJQdWJsaXNoZWQodXNlciwgbWVkaWFUeXBlKSB7IH1cblxuICBoYW5kbGVVc2VyVW5wdWJsaXNoZWQodXNlciwgbWVkaWFUeXBlKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGhhbmRsZVVzZXJVblB1Ymxpc2hlZCBcIik7XG4gIH1cblxuICBnZXRJbnB1dExldmVsKHRyYWNrKSB7XG4gICAgdmFyIGFuYWx5c2VyID0gdHJhY2suX3NvdXJjZS52b2x1bWVMZXZlbEFuYWx5c2VyLmFuYWx5c2VyTm9kZTtcbiAgICAvL3ZhciBhbmFseXNlciA9IHRyYWNrLl9zb3VyY2UuYW5hbHlzZXJOb2RlO1xuICAgIGNvbnN0IGJ1ZmZlckxlbmd0aCA9IGFuYWx5c2VyLmZyZXF1ZW5jeUJpbkNvdW50O1xuICAgIHZhciBkYXRhID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyTGVuZ3RoKTtcbiAgICBhbmFseXNlci5nZXRCeXRlRnJlcXVlbmN5RGF0YShkYXRhKTtcbiAgICB2YXIgdmFsdWVzID0gMDtcbiAgICB2YXIgYXZlcmFnZTtcbiAgICB2YXIgbGVuZ3RoID0gZGF0YS5sZW5ndGg7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFsdWVzICs9IGRhdGFbaV07XG4gICAgfVxuICAgIGF2ZXJhZ2UgPSBNYXRoLmZsb29yKHZhbHVlcyAvIGxlbmd0aCk7XG4gICAgcmV0dXJuIGF2ZXJhZ2U7XG4gIH1cblxuICB2b2ljZUFjdGl2aXR5RGV0ZWN0aW9uKCkge1xuICAgIGlmICghdGhpcy5fdmFkX2F1ZGlvVHJhY2sgfHwgIXRoaXMuX3ZhZF9hdWRpb1RyYWNrLl9lbmFibGVkKVxuICAgICAgcmV0dXJuO1xuXG4gICAgdmFyIGF1ZGlvTGV2ZWwgPSB0aGlzLmdldElucHV0TGV2ZWwodGhpcy5fdmFkX2F1ZGlvVHJhY2spO1xuICAgIGlmIChhdWRpb0xldmVsIDw9IHRoaXMuX3ZhZF9NYXhCYWNrZ3JvdW5kTm9pc2VMZXZlbCkge1xuICAgICAgaWYgKHRoaXMuX3ZhZF9hdWRpb1NhbXBsZXNBcnIubGVuZ3RoID49IHRoaXMuX3ZhZF9NYXhBdWRpb1NhbXBsZXMpIHtcbiAgICAgICAgdmFyIHJlbW92ZWQgPSB0aGlzLl92YWRfYXVkaW9TYW1wbGVzQXJyLnNoaWZ0KCk7XG4gICAgICAgIHZhciByZW1vdmVkSW5kZXggPSB0aGlzLl92YWRfYXVkaW9TYW1wbGVzQXJyU29ydGVkLmluZGV4T2YocmVtb3ZlZCk7XG4gICAgICAgIGlmIChyZW1vdmVkSW5kZXggPiAtMSkge1xuICAgICAgICAgIHRoaXMuX3ZhZF9hdWRpb1NhbXBsZXNBcnJTb3J0ZWQuc3BsaWNlKHJlbW92ZWRJbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuX3ZhZF9hdWRpb1NhbXBsZXNBcnIucHVzaChhdWRpb0xldmVsKTtcbiAgICAgIHRoaXMuX3ZhZF9hdWRpb1NhbXBsZXNBcnJTb3J0ZWQucHVzaChhdWRpb0xldmVsKTtcbiAgICAgIHRoaXMuX3ZhZF9hdWRpb1NhbXBsZXNBcnJTb3J0ZWQuc29ydCgoYSwgYikgPT4gYSAtIGIpO1xuICAgIH1cbiAgICB2YXIgYmFja2dyb3VuZCA9IE1hdGguZmxvb3IoMyAqIHRoaXMuX3ZhZF9hdWRpb1NhbXBsZXNBcnJTb3J0ZWRbTWF0aC5mbG9vcih0aGlzLl92YWRfYXVkaW9TYW1wbGVzQXJyU29ydGVkLmxlbmd0aCAvIDIpXSAvIDIpO1xuICAgIGlmIChhdWRpb0xldmVsID4gYmFja2dyb3VuZCArIHRoaXMuX3ZhZF9TaWxlbmNlT2ZmZXNldCkge1xuICAgICAgdGhpcy5fdmFkX2V4Y2VlZENvdW50Kys7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3ZhZF9leGNlZWRDb3VudCA9IDA7XG4gICAgfVxuXG4gICBcbiAgICBpZiAodGhpcy5fdmFkX2V4Y2VlZENvdW50ID4gdGhpcy5fdmFkX2V4Y2VlZENvdW50VGhyZXNob2xkTG93KSB7XG4gICAgICAvL0Fnb3JhUlRDVXRpbEV2ZW50cy5lbWl0KFwiVm9pY2VBY3Rpdml0eURldGVjdGVkRmFzdFwiLCB0aGlzLl92YWRfZXhjZWVkQ291bnQpO1xuICAgICAgd2luZG93Ll9zdGF0ZV9zdG9wX2F0ID0gRGF0ZS5ub3coKTtcbiAgICAgIC8vY29uc29sZS5sb2coXCJCT09NXCIsIGF1ZGlvTGV2ZWwsIGJhY2tncm91bmQsIHRoaXMuX3ZhZF9TaWxlbmNlT2ZmZXNldCx0aGlzLl92YWRfZXhjZWVkQ291bnQsdGhpcy5fdmFkX2V4Y2VlZENvdW50VGhyZXNob2xkTG93KTtcbi8vICAgIH0gZWxzZSB7XG4vLyAgICAgIGNvbnNvbGUubG9nKGF1ZGlvTGV2ZWwsIGJhY2tncm91bmQsIHRoaXMuX3ZhZF9TaWxlbmNlT2ZmZXNldCx0aGlzLl92YWRfZXhjZWVkQ291bnQsdGhpcy5fdmFkX2V4Y2VlZENvdW50VGhyZXNob2xkTG93KTtcblxuICAgIH1cblxuICAgIGlmICh0aGlzLl92YWRfZXhjZWVkQ291bnQgPiB0aGlzLl92YWRfZXhjZWVkQ291bnRUaHJlc2hvbGQpIHtcbiAgICAgIC8vQWdvcmFSVENVdGlsRXZlbnRzLmVtaXQoXCJWb2ljZUFjdGl2aXR5RGV0ZWN0ZWRcIiwgdGhpcy5fdmFkX2V4Y2VlZENvdW50KTtcbiAgICAgIHRoaXMuX3ZhZF9leGNlZWRDb3VudCA9IDA7XG4gICAgICB3aW5kb3cuX3N0YXRlX3N0b3BfYXQgPSBEYXRlLm5vdygpO1xuICAgICAgLy8gICBjb25zb2xlLmVycm9yKFwiVkFEIFwiLERhdGUubm93KCktd2luZG93Ll9zdGF0ZV9zdG9wX2F0KTtcbiAgICB9XG5cbiAgfVxuXG4gIGFzeW5jIGNvbm5lY3RBZ29yYSgpIHtcbiAgICAvLyBBZGQgYW4gZXZlbnQgbGlzdGVuZXIgdG8gcGxheSByZW1vdGUgdHJhY2tzIHdoZW4gcmVtb3RlIHVzZXIgcHVibGlzaGVzLlxuICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgIHRoaXMuYWdvcmFDbGllbnQgPSBBZ29yYVJUQy5jcmVhdGVDbGllbnQoeyBtb2RlOiBcImxpdmVcIiwgY29kZWM6IFwidnA4XCIgfSk7XG4gICAgQWdvcmFSVEMuc2V0UGFyYW1ldGVyKCdTWU5DX0dST1VQJywgZmFsc2UpO1xuLy8gICAgQWdvcmFSVEMuc2V0UGFyYW1ldGVyKCdTVUJTQ1JJQkVfVFdDQycsIHRydWUpO1xuICAgIHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIHRoaXMucmVhZFN0YXRzKCk7XG4gICAgfSwgMTAwMCk7XG4gICAgXG5cbiAgICBpZiAodGhpcy5lbmFibGVWaWRlb0ZpbHRlcmVkIHx8IHRoaXMuZW5hYmxlVmlkZW8gfHwgdGhpcy5lbmFibGVBdWRpbykge1xuICAgICAgLy90aGlzLmFnb3JhQ2xpZW50ID0gQWdvcmFSVEMuY3JlYXRlQ2xpZW50KHsgbW9kZTogXCJydGNcIiwgY29kZWM6IFwidnA4XCIgfSk7XG4gICAgICAvL3RoaXMuYWdvcmFDbGllbnQgPSBBZ29yYVJUQy5jcmVhdGVDbGllbnQoeyBtb2RlOiBcImxpdmVcIiwgY29kZWM6IFwiaDI2NFwiIH0pO1xuICAgICAgdGhpcy5hZ29yYUNsaWVudC5zZXRDbGllbnRSb2xlKFwiaG9zdFwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy90aGlzLmFnb3JhQ2xpZW50ID0gQWdvcmFSVEMuY3JlYXRlQ2xpZW50KHsgbW9kZTogXCJsaXZlXCIsIGNvZGVjOiBcImgyNjRcIiB9KTtcbiAgICAgIC8vdGhpcy5hZ29yYUNsaWVudCA9IEFnb3JhUlRDLmNyZWF0ZUNsaWVudCh7IG1vZGU6IFwibGl2ZVwiLCBjb2RlYzogXCJ2cDhcIiB9KTtcbiAgICB9XG5cbiAgICB0aGlzLmFnb3JhQ2xpZW50Lm9uKFwidXNlci1qb2luZWRcIiwgYXN5bmMgKHVzZXIpID0+IHtcbiAgICAgIGNvbnNvbGUud2FybihcInVzZXItam9pbmVkXCIsIHVzZXIpO1xuICAgIH0pO1xuICAgIHRoaXMuYWdvcmFDbGllbnQub24oXCJ1c2VyLXB1Ymxpc2hlZFwiLCBhc3luYyAodXNlciwgbWVkaWFUeXBlKSA9PiB7XG5cbiAgICAgIGxldCBjbGllbnRJZCA9IHVzZXIudWlkO1xuICAgICAgY29uc29sZS5sb2coXCJCVzczIGhhbmRsZVVzZXJQdWJsaXNoZWQgXCIgKyBjbGllbnRJZCArIFwiIFwiICsgbWVkaWFUeXBlLCB0aGF0LmFnb3JhQ2xpZW50KTtcbiAgICAgIGF3YWl0IHRoYXQuYWdvcmFDbGllbnQuc3Vic2NyaWJlKHVzZXIsIG1lZGlhVHlwZSk7XG4gICAgICBjb25zb2xlLmxvZyhcIkJXNzMgaGFuZGxlVXNlclB1Ymxpc2hlZDIgXCIgKyBjbGllbnRJZCArIFwiIFwiICsgdGhhdC5hZ29yYUNsaWVudCk7XG5cbiAgICAgIGNvbnN0IHBlbmRpbmdNZWRpYVJlcXVlc3RzID0gdGhhdC5wZW5kaW5nTWVkaWFSZXF1ZXN0cy5nZXQoY2xpZW50SWQpO1xuICAgICAgY29uc3QgY2xpZW50TWVkaWFTdHJlYW1zID0gdGhhdC5tZWRpYVN0cmVhbXNbY2xpZW50SWRdID0gdGhhdC5tZWRpYVN0cmVhbXNbY2xpZW50SWRdIHx8IHt9O1xuXG4gICAgICBpZiAobWVkaWFUeXBlID09PSAnYXVkaW8nKSB7XG4gICAgICAgIHVzZXIuYXVkaW9UcmFjay5wbGF5KCk7XG5cbiAgICAgICAgY29uc3QgYXVkaW9TdHJlYW0gPSBuZXcgTWVkaWFTdHJlYW0oKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJ1c2VyLmF1ZGlvVHJhY2sgXCIsIHVzZXIuYXVkaW9UcmFjay5fbWVkaWFTdHJlYW1UcmFjayk7XG4gICAgICAgIC8vYXVkaW9TdHJlYW0uYWRkVHJhY2sodXNlci5hdWRpb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrKTtcbiAgICAgICAgY2xpZW50TWVkaWFTdHJlYW1zLmF1ZGlvID0gYXVkaW9TdHJlYW07XG4gICAgICAgIGlmIChwZW5kaW5nTWVkaWFSZXF1ZXN0cykgcGVuZGluZ01lZGlhUmVxdWVzdHMuYXVkaW8ucmVzb2x2ZShhdWRpb1N0cmVhbSk7XG4gICAgICB9XG5cbiAgICAgIGxldCB2aWRlb1N0cmVhbSA9IG51bGw7XG4gICAgICBpZiAobWVkaWFUeXBlID09PSAndmlkZW8nKSB7XG4gICAgICAgIHZpZGVvU3RyZWFtID0gbmV3IE1lZGlhU3RyZWFtKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwidXNlci52aWRlb1RyYWNrIFwiLCB1c2VyLnZpZGVvVHJhY2suX21lZGlhU3RyZWFtVHJhY2spO1xuICAgICAgICB2aWRlb1N0cmVhbS5hZGRUcmFjayh1c2VyLnZpZGVvVHJhY2suX21lZGlhU3RyZWFtVHJhY2spO1xuICAgICAgICBjbGllbnRNZWRpYVN0cmVhbXMudmlkZW8gPSB2aWRlb1N0cmVhbTtcbiAgICAgICAgaWYgKHBlbmRpbmdNZWRpYVJlcXVlc3RzKSBwZW5kaW5nTWVkaWFSZXF1ZXN0cy52aWRlby5yZXNvbHZlKHZpZGVvU3RyZWFtKTtcbiAgICAgICAgLy91c2VyLnZpZGVvVHJhY2tcbiAgICAgIH1cblxuICAgICAgaWYgKGNsaWVudElkID09ICdDQ0MnKSB7XG4gICAgICAgIGlmIChtZWRpYVR5cGUgPT09ICd2aWRlbycpIHtcbiAgICAgICAgICAvLyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInZpZGVvMzYwXCIpLnNyY09iamVjdD12aWRlb1N0cmVhbTtcbiAgICAgICAgICAvL2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdmlkZW8zNjBcIikuc2V0QXR0cmlidXRlKFwic3JjXCIsIHZpZGVvU3RyZWFtKTtcbiAgICAgICAgICAvL2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdmlkZW8zNjBcIikuc2V0QXR0cmlidXRlKFwic3JjXCIsIHVzZXIudmlkZW9UcmFjay5fbWVkaWFTdHJlYW1UcmFjayk7XG4gICAgICAgICAgLy9kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3ZpZGVvMzYwXCIpLnNyY09iamVjdD0gdXNlci52aWRlb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrO1xuICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdmlkZW8zNjBcIikuc3JjT2JqZWN0ID0gdmlkZW9TdHJlYW07XG4gICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN2aWRlbzM2MFwiKS5wbGF5KCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1lZGlhVHlwZSA9PT0gJ2F1ZGlvJykge1xuICAgICAgICAgIHVzZXIuYXVkaW9UcmFjay5wbGF5KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChjbGllbnRJZCA9PSAnREREJykge1xuICAgICAgICBpZiAobWVkaWFUeXBlID09PSAndmlkZW8nKSB7XG4gICAgICAgICAgdXNlci52aWRlb1RyYWNrLnBsYXkoXCJ2aWRlbzM2MFwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobWVkaWFUeXBlID09PSAnYXVkaW8nKSB7XG4gICAgICAgICAgdXNlci5hdWRpb1RyYWNrLnBsYXkoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG5cbiAgICAgIGxldCBlbmNfaWQgPSAnbmEnO1xuICAgICAgaWYgKG1lZGlhVHlwZSA9PT0gJ2F1ZGlvJykge1xuICAgICAgICBlbmNfaWQgPSB1c2VyLmF1ZGlvVHJhY2suX21lZGlhU3RyZWFtVHJhY2suaWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBlbmNfaWQ9dXNlci52aWRlb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrLmlkO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwYyA9IHRoaXMuYWdvcmFDbGllbnQuX3AycENoYW5uZWwuY29ubmVjdGlvbi5wZWVyQ29ubmVjdGlvbjtcbiAgICAgIGNvbnN0IHJlY2VpdmVycyA9IHBjLmdldFJlY2VpdmVycygpO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZWNlaXZlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHJlY2VpdmVyc1tpXS50cmFjayAmJiByZWNlaXZlcnNbaV0udHJhY2suaWQgPT09IGVuY19pZCkge1xuICAgICAgICAgIGNvbnNvbGUud2FybihcIk1hdGNoXCIsIG1lZGlhVHlwZSwgZW5jX2lkKTtcbiAgICAgICAgICAvLyAgICAgICAgICB0aGlzLnJfcmVjZWl2ZXI9cmVjZWl2ZXJzW2ldO1xuICAgICAgICAgIC8vdGhpcy5yX2NsaWVudElkPWNsaWVudElkO1xuICAgICAgICAgIHRoaXMuY3JlYXRlRGVjb2RlcihyZWNlaXZlcnNbaV0sIGNsaWVudElkKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICB0aGlzLmFnb3JhQ2xpZW50Lm9uKFwidXNlci11bnB1Ymxpc2hlZFwiLCB0aGF0LmhhbmRsZVVzZXJVbnB1Ymxpc2hlZCk7XG5cbiAgICBjb25zb2xlLmxvZyhcImNvbm5lY3QgYWdvcmEgXCIpO1xuICAgIC8vIEpvaW4gYSBjaGFubmVsIGFuZCBjcmVhdGUgbG9jYWwgdHJhY2tzLiBCZXN0IHByYWN0aWNlIGlzIHRvIHVzZSBQcm9taXNlLmFsbCBhbmQgcnVuIHRoZW0gY29uY3VycmVudGx5LlxuICAgIC8vIG9cblxuICAgIGlmICh0aGlzLmVuYWJsZUF2YXRhcikge1xuICAgICAgdmFyIHN0cmVhbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2FudmFzXCIpLmNhcHR1cmVTdHJlYW0oMzApO1xuICAgICAgW3RoaXMudXNlcmlkLCB0aGlzLmxvY2FsVHJhY2tzLmF1ZGlvVHJhY2ssIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFja10gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgIHRoaXMuYWdvcmFDbGllbnQuam9pbih0aGlzLmFwcGlkLCB0aGlzLnJvb20sIHRoaXMudG9rZW4gfHwgbnVsbCwgdGhpcy5jbGllbnRJZCB8fCBudWxsKSxcbiAgICAgICAgQWdvcmFSVEMuY3JlYXRlTWljcm9waG9uZUF1ZGlvVHJhY2soKSwgQWdvcmFSVEMuY3JlYXRlQ3VzdG9tVmlkZW9UcmFjayh7IG1lZGlhU3RyZWFtVHJhY2s6IHN0cmVhbS5nZXRWaWRlb1RyYWNrcygpWzBdIH0pXSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRoaXMuZW5hYmxlVmlkZW9GaWx0ZXJlZCAmJiB0aGlzLmVuYWJsZUF1ZGlvKSB7XG4gICAgICB2YXIgc3RyZWFtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYW52YXNfc2VjcmV0XCIpLmNhcHR1cmVTdHJlYW0oMzApO1xuICAgICAgW3RoaXMudXNlcmlkLCB0aGlzLmxvY2FsVHJhY2tzLmF1ZGlvVHJhY2ssIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFja10gPSBhd2FpdCBQcm9taXNlLmFsbChbdGhpcy5hZ29yYUNsaWVudC5qb2luKHRoaXMuYXBwaWQsIHRoaXMucm9vbSwgdGhpcy50b2tlbiB8fCBudWxsLCB0aGlzLmNsaWVudElkIHx8IG51bGwpLCBBZ29yYVJUQy5jcmVhdGVNaWNyb3Bob25lQXVkaW9UcmFjaygpLCBBZ29yYVJUQy5jcmVhdGVDdXN0b21WaWRlb1RyYWNrKHsgbWVkaWFTdHJlYW1UcmFjazogc3RyZWFtLmdldFZpZGVvVHJhY2tzKClbMF0gfSldKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodGhpcy5lbmFibGVWaWRlbyAmJiB0aGlzLmVuYWJsZUF1ZGlvKSB7XG4gICAgICBbdGhpcy51c2VyaWQsIHRoaXMubG9jYWxUcmFja3MuYXVkaW9UcmFjaywgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgdGhpcy5hZ29yYUNsaWVudC5qb2luKHRoaXMuYXBwaWQsIHRoaXMucm9vbSwgdGhpcy50b2tlbiB8fCBudWxsLCB0aGlzLmNsaWVudElkIHx8IG51bGwpLFxuICAgICAgICBBZ29yYVJUQy5jcmVhdGVNaWNyb3Bob25lQXVkaW9UcmFjaygpLCBBZ29yYVJUQy5jcmVhdGVDYW1lcmFWaWRlb1RyYWNrKHsgZW5jb2RlckNvbmZpZzogJzQ4MHBfMicgfSldKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuZW5hYmxlVmlkZW8pIHtcbiAgICAgIFt0aGlzLnVzZXJpZCwgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgLy8gSm9pbiB0aGUgY2hhbm5lbC5cbiAgICAgICAgdGhpcy5hZ29yYUNsaWVudC5qb2luKHRoaXMuYXBwaWQsIHRoaXMucm9vbSwgdGhpcy50b2tlbiB8fCBudWxsLCB0aGlzLmNsaWVudElkIHx8IG51bGwpLCBBZ29yYVJUQy5jcmVhdGVDYW1lcmFWaWRlb1RyYWNrKFwiMzYwcF80XCIpXSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmVuYWJsZUF1ZGlvKSB7XG4gICAgICBsZXQgYXVkaW9fdHJhY2s7XG4gICAgICBpZiAod2luZG93Lmd1bV9zdHJlYW0pIHsgLy8gYXZvaWQgZG91YmxlIGFsbG93IGlPc1xuXG4gICAgICAgIGF1ZGlvX3RyYWNrID0gQWdvcmFSVEMuY3JlYXRlQ3VzdG9tQXVkaW9UcmFjayh7IG1lZGlhU3RyZWFtVHJhY2s6IHdpbmRvdy5ndW1fc3RyZWFtLmdldEF1ZGlvVHJhY2tzKClbMF0gfSk7XG4gICAgICAgIGNvbnNvbGUud2FybihhdWRpb190cmFjaywgXCJhdWRpb190cmFja1wiKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBhdWRpb190cmFjayA9IEFnb3JhUlRDLmNyZWF0ZU1pY3JvcGhvbmVBdWRpb1RyYWNrKClcbiAgICAgIH1cblxuICAgICAgW3RoaXMudXNlcmlkLCB0aGlzLmxvY2FsVHJhY2tzLmF1ZGlvVHJhY2tdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAvLyBKb2luIHRoZSBjaGFubmVsLlxuICAgICAgICB0aGlzLmFnb3JhQ2xpZW50LmpvaW4odGhpcy5hcHBpZCwgdGhpcy5yb29tLCB0aGlzLnRva2VuIHx8IG51bGwsIHRoaXMuY2xpZW50SWQgfHwgbnVsbCksIGF1ZGlvX3RyYWNrXSk7XG4gICAgICAvL2NvbnNvbGUubG9nKFwiY3JlYXRlTWljcm9waG9uZUF1ZGlvVHJhY2tcIik7XG4gICAgICB0aGlzLl92YWRfYXVkaW9UcmFjayA9IHRoaXMubG9jYWxUcmFja3MuYXVkaW9UcmFjaztcbiAgICAgIGlmICghdGhpcy5fdm9pY2VBY3Rpdml0eURldGVjdGlvbkludGVydmFsKSB7XG4gICAgICAgIHRoaXMuX3ZvaWNlQWN0aXZpdHlEZXRlY3Rpb25JbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICB0aGlzLnZvaWNlQWN0aXZpdHlEZXRlY3Rpb24oKTtcbiAgICAgICAgfSwgdGhpcy5fdm9pY2VBY3Rpdml0eURldGVjdGlvbkZyZXF1ZW5jeSk7XG4gICAgICB9XG5cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy51c2VyaWQgPSBhd2FpdCB0aGlzLmFnb3JhQ2xpZW50LmpvaW4odGhpcy5hcHBpZCwgdGhpcy5yb29tLCB0aGlzLnRva2VuIHx8IG51bGwsIHRoaXMuY2xpZW50SWQgfHwgbnVsbCk7XG4gICAgfVxuXG5cbiAgICAvLyBzZWxlY3QgZmFjZXRpbWUgY2FtZXJhIGlmIGV4aXN0c1xuICAgIGlmICh0aGlzLmVuYWJsZVZpZGVvICYmICF0aGlzLmVuYWJsZVZpZGVvRmlsdGVyZWQpIHtcbiAgICAgIGxldCBjYW1zID0gYXdhaXQgQWdvcmFSVEMuZ2V0Q2FtZXJhcygpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChjYW1zW2ldLmxhYmVsLmluZGV4T2YoXCJGYWNlVGltZVwiKSA9PSAwKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJzZWxlY3QgRmFjZVRpbWUgY2FtZXJhXCIsIGNhbXNbaV0uZGV2aWNlSWQpO1xuICAgICAgICAgIGF3YWl0IHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjay5zZXREZXZpY2UoY2Ftc1tpXS5kZXZpY2VJZCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5lbmFibGVWaWRlbyAmJiB0aGlzLnNob3dMb2NhbCkge1xuICAgICAgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrLnBsYXkoXCJsb2NhbC1wbGF5ZXJcIik7XG4gICAgfVxuXG4gICAgLy8gRW5hYmxlIHZpcnR1YWwgYmFja2dyb3VuZCBPTEQgTWV0aG9kXG4gICAgaWYgKHRoaXMuZW5hYmxlVmlkZW8gJiYgdGhpcy52YmcwICYmIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjaykge1xuICAgICAgY29uc3QgaW1nRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuICAgICAgaW1nRWxlbWVudC5vbmxvYWQgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy52aXJ0dWFsQmFja2dyb3VuZEluc3RhbmNlKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJTRUcgSU5JVCBcIiwgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrKTtcbiAgICAgICAgICB0aGlzLnZpcnR1YWxCYWNrZ3JvdW5kSW5zdGFuY2UgPSBhd2FpdCBTZWdQbHVnaW4uaW5qZWN0KHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjaywgXCIvYXNzZXRzL3dhc21zMFwiKS5jYXRjaChjb25zb2xlLmVycm9yKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIlNFRyBJTklURURcIik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy52aXJ0dWFsQmFja2dyb3VuZEluc3RhbmNlLnNldE9wdGlvbnMoeyBlbmFibGU6IHRydWUsIGJhY2tncm91bmQ6IGltZ0VsZW1lbnQgfSk7XG4gICAgICB9O1xuICAgICAgaW1nRWxlbWVudC5zcmMgPSAnZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFBUUFBQUFEQ0FJQUFBQTdsam1SQUFBQUQwbEVRVlI0WG1OZytNK0FRRGc1QU9rOUMvVmtvbXpZQUFBQUFFbEZUa1N1UW1DQyc7XG4gICAgfVxuXG4gICAgLy8gRW5hYmxlIHZpcnR1YWwgYmFja2dyb3VuZCBOZXcgTWV0aG9kXG4gICAgaWYgKHRoaXMuZW5hYmxlVmlkZW8gJiYgdGhpcy52YmcgJiYgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrKSB7XG5cbiAgICAgIHRoaXMuZXh0ZW5zaW9uID0gbmV3IFZpcnR1YWxCYWNrZ3JvdW5kRXh0ZW5zaW9uKCk7XG4gICAgICBBZ29yYVJUQy5yZWdpc3RlckV4dGVuc2lvbnMoW3RoaXMuZXh0ZW5zaW9uXSk7XG4gICAgICB0aGlzLnByb2Nlc3NvciA9IHRoaXMuZXh0ZW5zaW9uLmNyZWF0ZVByb2Nlc3NvcigpO1xuICAgICAgYXdhaXQgdGhpcy5wcm9jZXNzb3IuaW5pdChcIi9hc3NldHMvd2FzbXNcIik7XG4gICAgICB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2sucGlwZSh0aGlzLnByb2Nlc3NvcikucGlwZSh0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2sucHJvY2Vzc29yRGVzdGluYXRpb24pO1xuICAgICAgYXdhaXQgdGhpcy5wcm9jZXNzb3Iuc2V0T3B0aW9ucyh7IHR5cGU6ICdjb2xvcicsIGNvbG9yOiBcIiMwMGZmMDBcIiB9KTtcbiAgICAgIGF3YWl0IHRoaXMucHJvY2Vzc29yLmVuYWJsZSgpO1xuICAgIH1cblxuICAgIHdpbmRvdy5sb2NhbFRyYWNrcyA9IHRoaXMubG9jYWxUcmFja3M7XG5cbiAgICAvLyBQdWJsaXNoIHRoZSBsb2NhbCB2aWRlbyBhbmQgYXVkaW8gdHJhY2tzIHRvIHRoZSBjaGFubmVsLlxuICAgIGlmICh0aGlzLmVuYWJsZVZpZGVvIHx8IHRoaXMuZW5hYmxlQXVkaW8gfHwgdGhpcy5lbmFibGVBdmF0YXIpIHtcbiAgICAgIGlmICh0aGlzLmxvY2FsVHJhY2tzLmF1ZGlvVHJhY2spXG4gICAgICAgIGF3YWl0IHRoaXMuYWdvcmFDbGllbnQucHVibGlzaCh0aGlzLmxvY2FsVHJhY2tzLmF1ZGlvVHJhY2spO1xuICAgICAgaWYgKHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjaylcbiAgICAgICAgYXdhaXQgdGhpcy5hZ29yYUNsaWVudC5wdWJsaXNoKHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjayk7XG5cbiAgICAgIGNvbnNvbGUubG9nKFwicHVibGlzaCBzdWNjZXNzXCIpO1xuICAgICAgY29uc3QgcGMgPSB0aGlzLmFnb3JhQ2xpZW50Ll9wMnBDaGFubmVsLmNvbm5lY3Rpb24ucGVlckNvbm5lY3Rpb247XG4gICAgICBjb25zdCBzZW5kZXJzID0gcGMuZ2V0U2VuZGVycygpO1xuICAgICAgbGV0IGkgPSAwO1xuICAgICAgZm9yIChpID0gMDsgaSA8IHNlbmRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHNlbmRlcnNbaV0udHJhY2sgJiYgKHNlbmRlcnNbaV0udHJhY2sua2luZCA9PSAnYXVkaW8nKSkge1xuICAgICAgICAgIHRoaXMuY3JlYXRlRW5jb2RlcihzZW5kZXJzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJUTVxuXG4gIH1cblxuICAvKipcbiAgICogUHJpdmF0ZXNcbiAgICovXG5cbiAgYXN5bmMgX2Nvbm5lY3QoY29ubmVjdFN1Y2Nlc3MsIGNvbm5lY3RGYWlsdXJlKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIGF3YWl0IHRoYXQuZWFzeXJ0Yy5jb25uZWN0KHRoYXQuYXBwLCBjb25uZWN0U3VjY2VzcywgY29ubmVjdEZhaWx1cmUpO1xuICB9XG5cbiAgX2dldFJvb21Kb2luVGltZShjbGllbnRJZCkge1xuICAgIHZhciBteVJvb21JZCA9IHRoaXMucm9vbTsgLy9OQUYucm9vbTtcbiAgICB2YXIgam9pblRpbWUgPSB0aGlzLmVhc3lydGMuZ2V0Um9vbU9jY3VwYW50c0FzTWFwKG15Um9vbUlkKVtjbGllbnRJZF0ucm9vbUpvaW5UaW1lO1xuICAgIHJldHVybiBqb2luVGltZTtcbiAgfVxuXG4gIGdldFNlcnZlclRpbWUoKSB7XG4gICAgcmV0dXJuIERhdGUubm93KCkgKyB0aGlzLmF2Z1RpbWVPZmZzZXQ7XG4gIH1cbn1cblxuTkFGLmFkYXB0ZXJzLnJlZ2lzdGVyKFwiYWdvcmFydGNcIiwgQWdvcmFSdGNBZGFwdGVyKTtcblxubW9kdWxlLmV4cG9ydHMgPSBBZ29yYVJ0Y0FkYXB0ZXI7XG4iXSwic291cmNlUm9vdCI6IiJ9