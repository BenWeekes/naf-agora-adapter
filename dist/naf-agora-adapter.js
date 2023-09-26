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
    this.occupantList = {};
    this.audioJitter = {};
    this.pendingMediaRequests = new Map();
    this.enableVideo = false;
    this.enableVideoFiltered = false;
    this.enableAudio = false;
    this.enableAvatar = false;
    this.remoteAudioTrack = null;

    this.localTracks = { videoTrack: null, audioTrack: null, musicTrack: null };
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

    // RTM
    this.syncObjects = true;
    this.agoraRTM = false;
    this.agoraRTM2 = false;
    this.rtmClient = null;
    this.rtmUid = null;
    this.rtmChannelName = null;
    this.rtmChannel = null;

    if (this.easyrtc) {
      this.easyrtc.setPeerOpenListener(clientId => {
        const clientConnection = this.easyrtc.getPeerConnectionByUserId(clientId);
        this.remoteClients[clientId] = clientConnection;
      });

      this.easyrtc.setPeerClosedListener(clientId => {
        delete this.remoteClients[clientId];
      });
    }

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
    if (this.easyrtc) {
      this.easyrtc.setSocketUrl(url);
    }
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

    if (obj.syncObjects && obj.syncObjects == 'false') {
      this.syncObjects = false;
    }

    if (obj.agoraRTM && obj.agoraRTM == 'true') {
      this.agoraRTM = true;
    }

    if (obj.agoraRTM2 && obj.agoraRTM2 == 'true') {
      this.agoraRTM2 = true;
    }

    if (obj.showLocal && obj.showLocal == 'true') {
      this.showLocal = true;
    }

    if (obj.enableVideoFiltered && obj.enableVideoFiltered == 'true') {
      this.enableVideoFiltered = true;
    }
    if (!this.agoraRTM) {
      this.easyrtc.joinRoom(this.room, null);
    }
  }

  // options: { datachannel: bool, audio: bool, video: bool }
  setWebRtcOptions(options) {
    // using Agora
    this.enableVideo = options.video;
    this.enableAudio = options.audio;

    if (!this.easyrtc) {
      return;
    }
    console.log("BW73 setWebRtcOptions ", options);
    // this.easyrtc.enableDebug(true);
    this.easyrtc.enableDataChannels(options.datachannel);
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
    this.occupantListener = occupantListener;

    if (!this.easyrtc) {
      return;
    }
    this.easyrtc.setRoomOccupantListener(function (roomName, occupants, primary) {
      occupantListener(occupants);
    });
  }

  setDataChannelListeners(openListener, closedListener, messageListener) {
    console.log("BW73 setDataChannelListeners  ", openListener, closedListener, messageListener);

    this.openListener = openListener;
    this.messageListener = messageListener;
    this.closedListener = closedListener;
    if (!this.easyrtc) {
      return;
    }
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

    console.log("BW73 connect");
    Promise.all([this.updateTimeOffset(), new Promise((resolve, reject) => {
      if (this.agoraRTM) {
        this.clientId = this.generateId(10);
        this.connectAgora(resolve, reject); //resolve, reject);
      } else {
        this._connect(resolve, reject);
      }
    })]).then(([_, clientId]) => {
      console.log("BW73 connected " + clientId);
      this.clientId = clientId;
      if (!this.agoraRTM) {
        this._myRoomJoinTime = this._getRoomJoinTime(clientId);
        this.connectAgora();
      }
      this.connectSuccess(clientId);
    }).catch(this.connectFailure);
  }

  shouldStartConnectionTo(client) {
    return this._myRoomJoinTime <= client.roomJoinTime;
  }

  startStreamConnection(clientId) {
    if (!this.easyrtc) {
      return;
    }
    console.error("BW73 startStreamConnection ", clientId);
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
    console.info("BW73 closeStreamConnection ", clientId);
    if (this.agoraRTM) {
      this.closedListener(clientId);
    } else {
      this.easyrtc.hangup(clientId);
    }
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
          let d = chunk.data;
          let v = chunk.data.byteLength;
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
          let y = chunk.data.byteLength;
          if (y >= 1000) {
            console.warn('audio frame too large, skipping... ', v, y, y - v, that.mocapPrevData);
            chunk.data = d;
          }
          // console.warn(v,y,y-v);
          // console.warn(v,y,y-v);
          controller.enqueue(chunk);
        }
      });

      streams.readable.pipeThrough(transformer).pipeTo(streams.writable);
    } else {
      var that = this;
      const worker = new Worker('./dist/script-transform-worker.js');
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

  async createDecoder(receiver, clientId) {
    if (this.isChrome) {
      const streams = receiver.createEncodedStreams();
      const textDecoder = new TextDecoder();
      var that = this;

      const transformer = new TransformStream({
        transform(chunk, controller) {
          if (chunk.data.byteLength - that.CustomDataDetector.length > 0) {
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
          }
          controller.enqueue(chunk);
        }
      });
      streams.readable.pipeThrough(transformer).pipeTo(streams.writable);
    } else {
      this.receiverChannel = new MessageChannel();
      var that = this;
      // const worker = new Worker('/dist/script-transform-worker.js');
      const worker = new Worker('./dist/script-transform-worker.js');
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
          resolve();
        }
      });
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

  handleRTM(senderId, text) {
    const data = JSON.parse(text);
    console.log("BW75 handleRTM", senderId, data);
    //console.error('messageListener 2', window.AgoraRtcAdapter.messageListener);
    window.AgoraRtcAdapter.messageListener(senderId, data.dataType, data.data);
  }

  handleRTM2(senderId, text) {
    const msg = JSON.parse(text);
    const data = JSON.parse(msg.message);
    //console.warn("BW75 handleRTM2", senderId, data.dataType, data.data);
    //console.error('messageListener 2', window.AgoraRtcAdapter.messageListener);
    window.AgoraRtcAdapter.messageListener(senderId, data.dataType, data.data);
  }

  sendData(clientId, dataType, data) {
    console.log("BW75 sendData ", clientId, dataType, data);
    return sendDataGuaranteed(clientId, dataType, data);
  }

  sendDataGuaranteed(destinationClientId, dataType, data) {
    if (this.agoraRTM) {
      this.sendAgoraRTM(dataType, data);
    } else {
      this.broadcastDataGuaranteed(dataType, data);
    }
  }

  broadcastData(dataType, data) {
    return this.broadcastDataGuaranteed(dataType, data);
  }

  async sendAgoraRTM(dataType, data) {
    if (!this.syncObjects) {
      return;
    }
    // console.warn('sending Agora RTM',dataType, data);
    let msg = JSON.stringify({ dataType: dataType, data: data });
    if (this.agoraRTM2) {
      if (this.rtmClient != null) {
        const payload = { type: "text", message: msg };
        const publishMessage = JSON.stringify(payload);
        try {
          await this.rtmClient.publish(this.room, publishMessage);
        } catch (error) {
          console.log(error);
        }
      } else {
        //console.error("unable to send message RTM2 ",dataType,data);
      }
    } else {
      if (this.rtmChannel != null) {
        this.rtmChannel.sendMessage({ text: msg }).then(() => {
          console.log("BW75 broadcastDataGuaranteed sent ", dataType, data);
        }).catch(error => {
          console.error('AgoraRTM send failure for rtmChannel', error);
        });
      } else {
        //console.error("unable to send message RTM1 ",dataType,data);
      }
    }
  }

  broadcastDataGuaranteed(dataType, data) {
    if (this.agoraRTM) {
      this.sendAgoraRTM(dataType, data);
    } else {
      var destination = { targetRoom: this.room };
      this.easyrtc.sendDataWS(destination, dataType, data);
    }
  }

  getConnectStatus(clientId) {
    if (!this.easyrtc) {
      //console.trace();
      return NAF.adapters.IS_CONNECTED;
    }
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
    if (!this.easyrtc) {
      return;
    }
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
    delete this.mediaStreams["local"][streamName];
    if (!this.easyrtc) {
      return;
    }
    console.log("BW73 removeLocalMediaStream ", streamName);
    this.easyrtc.closeLocalMediaStream(streamName);
  }

  enableMicrophone(enabled) {
    if (!this.easyrtc) {
      return;
    }
    this.easyrtc.enableMicrophone(enabled);
  }

  enableCamera(enabled) {
    if (!this.easyrtc) {
      return;
    }
    this.easyrtc.enableCamera(enabled);
  }

  disconnect() {
    if (!this.easyrtc) {
      return;
    }
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

  generateId(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
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
      window._state_stop_at = Date.now();
    }

    if (this._vad_exceedCount > this._vad_exceedCountThreshold) {
      //AgoraRTCUtilEvents.emit("VoiceActivityDetected", this._vad_exceedCount);
      this._vad_exceedCount = 0;
      window._state_stop_at = Date.now();
      //   console.error("VAD ",Date.now()-window._state_stop_at);
    }
  }

  async stopMusic() {
    if (this.localTracks.musicTrack) {
      this.localTracks.musicTrack.stop();
      await this.agoraClient.unpublish(this.localTracks.musicTrack);
    }
  }

  async stopTrack() {
    if (this.localTracks.musicTrack) {
      this.localTracks.musicTrack.stop();
      await this.agoraClient.unpublish(this.localTracks.musicTrack);
    }
  }

  async playMusic(path, volume) {
    if (this.localTracks.musicTrack) {
      this.localTracks.musicTrack.stop();
      await this.agoraClient.unpublish(this.localTracks.musicTrack);
    }
    this.localTracks.musicTrack = await AgoraRTC.createBufferSourceAudioTrack({
      source: path, encoderConfig: { bitrate: 110, stereo: true }
    });
    this.localTracks.musicTrack.setVolume(volume);
    await this.agoraClient.publish(this.localTracks.musicTrack);
    this.localTracks.musicTrack.play();
    this.localTracks.musicTrack.startProcessAudioBuffer({ cycle: 1 });
  }

  async playTrack(track, volume) {
    if (this.localTracks.musicTrack) {
      this.localTracks.musicTrack.stop();
      await this.agoraClient.unpublish(this.localTracks.musicTrack);
    }
    this.localTracks.musicTrack = await AgoraRTC.createCustomAudioTrack({
      mediaStreamTrack: track
    });
    this.localTracks.musicTrack.setVolume(volume);
    await this.agoraClient.publish(this.localTracks.musicTrack);
    //this.localTracks.musicTrack.play();
  }

  async connectAgora(success, failure) {
    // Add an event listener to play remote tracks when remote user publishes.
    var that = this;

    this.agoraClient = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
    AgoraRTC.setParameter('SYNC_GROUP', false);
    //    AgoraRTC.setParameter('SUBSCRIBE_TWCC', true);
    setInterval(() => {
      this.readStats();
    }, 1000);

    if (this.enableVideoFiltered || this.enableVideo || this.enableAudio) {
      this.agoraClient.setClientRole("host");
    }

    this.agoraClient.on("user-joined", async user => {
      if (this.agoraRTM && !this.agoraRTM2) {
        console.info("user-joined", user.uid, this.occupantList);
        this.occupantList[user.uid] = user.uid;
        let copy = JSON.parse(JSON.stringify(this.occupantList));
        this.occupantListener(copy);
      }
    });
    this.agoraClient.on("user-left", async user => {
      if (this.agoraRTM && !this.agoraRTM2) {
        console.info("user-left", user.uid, this.occupantList);
        delete this.occupantList[user.uid];
        let copy = JSON.parse(JSON.stringify(this.occupantList));
        this.occupantListener(copy);
      }
    });

    this.agoraClient.on("user-published", async (user, mediaType) => {

      let clientId = user.uid;
      console.log("BW73 handleUserPublished " + clientId + " " + mediaType, that.agoraClient);
      await that.agoraClient.subscribe(user, mediaType);
      console.log("BW73 handleUserPublished2 " + clientId + " " + that.agoraClient);

      const pendingMediaRequests = that.pendingMediaRequests.get(clientId);
      const clientMediaStreams = that.mediaStreams[clientId] = that.mediaStreams[clientId] || {};

      if (mediaType === 'audio') {
        //if (navigator.platform.indexOf('iPad')>-1 || navigator.platform.indexOf('iPhone')>-1)
        //{ // too quiet
        //          console.log("iOS play speaker");
        user.audioTrack.play();
        that.remoteAudioTrack = user.audioTrack;
        //      }

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
          //console.warn("Match", mediaType, enc_id);
          //          this.r_receiver=receivers[i];
          //this.r_clientId=clientId;
          this.createDecoder(receivers[i], clientId);
        }
      }
    });

    this.agoraClient.on("user-unpublished", that.handleUserUnpublished);

    console.log("connect agora " + this.clientId);
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
        // audio_track = AgoraRTC.createCustomAudioTrack({ mediaStreamTrack: window.gum_stream.getAudioTracks()[0],  encoderConfig: { bitrate:180, stereo:false} });
        audio_track = AgoraRTC.createCustomAudioTrack({ mediaStreamTrack: window.gum_stream.getAudioTracks()[0], encoderConfig: { bitrate: 180, stereo: false } });
        //console.warn(audio_track, "audio_track");
      } else {
        //audio_track = AgoraRTC.createMicrophoneAudioTrack({encoderConfig: {bitrate:128, stereo:true}})
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
    if (this.agoraRTM) {
      if (this.clientId == null) {
        this.clientId = 'X' + this.userid;
      }
      this.rtmUid = this.clientId;
      if (!this.syncObjects) {
        return;
      }
      if (this.agoraRTM2) {
        // 2.x RTM
        AgoraRTM.setArea({ areaCodes: ["GLOBAL"] });
        this.rtmClient = new AgoraRTM.RTM(this.appid, this.rtmUid, { presenceTimeout: 5 });
        this.rtmClient.addEventListener({
          message: eventArgs => {
            // Message event handler
            window.AgoraRtcAdapter.handleRTM2(eventArgs.publisher, eventArgs.message);
          },
          presence: eventArgs => {
            // Presence event handler
            if (eventArgs.eventType === "SNAPSHOT") {
              for (let u = 0; u < eventArgs.snapshot.length; u++) {
                let present = this.occupantList[eventArgs.snapshot[u].userId];
                this.occupantList[eventArgs.snapshot[u].userId] = eventArgs.snapshot[u].userId;
                let copy = JSON.parse(JSON.stringify(this.occupantList));
                this.occupantListener(copy);
                if (!present) {
                  // console.warn("openListener",eventArgs.snapshot[u].userId);
                  this.openListener(eventArgs.snapshot[u].userId);
                }
              }
            } else if (eventArgs.eventType === "REMOTE_JOIN") {
              let present = this.occupantList[eventArgs.publisher];
              this.occupantList[eventArgs.publisher] = eventArgs.publisher;
              let copy = JSON.parse(JSON.stringify(this.occupantList));
              this.occupantListener(copy);
              if (!present) {
                // console.warn("openListener",eventArgs.publisher);
                this.openListener(eventArgs.publisher);
              }
            } else if (eventArgs.eventType === "REMOTE_TIMEOUT" || eventArgs.eventType === "REMOTE_LEAVE") {
              delete this.occupantList[eventArgs.publisher];
              let copy = JSON.parse(JSON.stringify(this.occupantList));
              this.occupantListener(copy);
            }
          }
        });

        window.addEventListener("beforeunload", () => {
          window.AgoraRtcAdapter.rtmClient.logout();
        });

        try {
          const result = await this.rtmClient.login();
          await this.rtmClient.subscribe(this.room);
          console.log('rtm LOGIN SUCCESS for: ' + this.rtmUid, result);
          success(this.clientId);
        } catch (status) {
          console.error('rtm LOGIN FAILED for: ' + this.rtmUid, status);
        }
      } else {
        // rtm 1
        this.rtmClient = AgoraRTM.createInstance(this.appid, { logFilter: AgoraRTM.LOG_FILTER_OFF });

        this.rtmClient.on('ConnectionStateChanged', (newState, reason) => {
          console.log('this.rtmClient connection state changed to ' + newState + ' reason: ' + reason);
          if (newState == "CONNECTED") {} else {}
        });

        this.rtmClient.on('MessageFromPeer', ({ text }, senderId) => {
          this.handleRTM(senderId, text);
        });

        this.rtmClient.login({ token: null, uid: this.rtmUid }).then(() => {
          this.rtmChannel = this.rtmClient.createChannel(this.room);
          this.rtmChannel.on('MemberJoined', memberId => {});
          this.rtmChannel.on('MemberLeft', memberId => {});
          this.rtmChannel.join().then(() => {
            this.rtmChannel.on('ChannelMessage', ({ text }, senderId) => {
              this.handleRTM(senderId, text);
            });
            success(this.clientId); //[this.clientId,this.clientId]);
          }).catch(error => {
            console.log('AgoraRTM client join failure', error);
          });
        }).catch(error => {
          console.log('AgoraRTM client login failure', error);
        });
      }
    }
  }

  /**
   * Privates
   */

  async _connect(connectSuccess, connectFailure) {
    var that = this;
    // let x = function () { /* empty because ... */ };
    if (!this.easyrtc) {
      return;
    }
    await that.easyrtc.connect(that.app, connectSuccess, connectFailure);
  }

  _getRoomJoinTime(clientId) {
    var myRoomId = this.room; //NAF.room;
    if (!this.easyrtc) {
      return;
    }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIl0sIm5hbWVzIjpbIkFnb3JhUnRjQWRhcHRlciIsImNvbnN0cnVjdG9yIiwiZWFzeXJ0YyIsImNvbnNvbGUiLCJsb2ciLCJ3aW5kb3ciLCJhcHAiLCJyb29tIiwidXNlcmlkIiwiYXBwaWQiLCJtb2NhcERhdGEiLCJtb2NhcFByZXZEYXRhIiwibG9naSIsImxvZ28iLCJtZWRpYVN0cmVhbXMiLCJyZW1vdGVDbGllbnRzIiwib2NjdXBhbnRMaXN0IiwiYXVkaW9KaXR0ZXIiLCJwZW5kaW5nTWVkaWFSZXF1ZXN0cyIsIk1hcCIsImVuYWJsZVZpZGVvIiwiZW5hYmxlVmlkZW9GaWx0ZXJlZCIsImVuYWJsZUF1ZGlvIiwiZW5hYmxlQXZhdGFyIiwicmVtb3RlQXVkaW9UcmFjayIsImxvY2FsVHJhY2tzIiwidmlkZW9UcmFjayIsImF1ZGlvVHJhY2siLCJtdXNpY1RyYWNrIiwidG9rZW4iLCJjbGllbnRJZCIsInVpZCIsInZiZyIsInZiZzAiLCJzaG93TG9jYWwiLCJ2aXJ0dWFsQmFja2dyb3VuZEluc3RhbmNlIiwiZXh0ZW5zaW9uIiwicHJvY2Vzc29yIiwicGlwZVByb2Nlc3NvciIsInRyYWNrIiwicGlwZSIsInByb2Nlc3NvckRlc3RpbmF0aW9uIiwic2VydmVyVGltZVJlcXVlc3RzIiwidGltZU9mZnNldHMiLCJhdmdUaW1lT2Zmc2V0IiwiYWdvcmFDbGllbnQiLCJzeW5jT2JqZWN0cyIsImFnb3JhUlRNIiwiYWdvcmFSVE0yIiwicnRtQ2xpZW50IiwicnRtVWlkIiwicnRtQ2hhbm5lbE5hbWUiLCJydG1DaGFubmVsIiwic2V0UGVlck9wZW5MaXN0ZW5lciIsImNsaWVudENvbm5lY3Rpb24iLCJnZXRQZWVyQ29ubmVjdGlvbkJ5VXNlcklkIiwic2V0UGVlckNsb3NlZExpc3RlbmVyIiwiaXNDaHJvbWUiLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJpbmRleE9mIiwib2xkUlRDUGVlckNvbm5lY3Rpb24iLCJSVENQZWVyQ29ubmVjdGlvbiIsIlByb3h5IiwiY29uc3RydWN0IiwidGFyZ2V0IiwiYXJncyIsImxlbmd0aCIsInB1c2giLCJlbmNvZGVkSW5zZXJ0YWJsZVN0cmVhbXMiLCJwYyIsIm9sZFNldENvbmZpZ3VyYXRpb24iLCJwcm90b3R5cGUiLCJzZXRDb25maWd1cmF0aW9uIiwiYXJndW1lbnRzIiwiYXBwbHkiLCJDdXN0b21EYXRhRGV0ZWN0b3IiLCJDdXN0b21EYXRMZW5ndGhCeXRlQ291bnQiLCJzZW5kZXJDaGFubmVsIiwiTWVzc2FnZUNoYW5uZWwiLCJyZWNlaXZlckNoYW5uZWwiLCJfdmFkX2F1ZGlvVHJhY2siLCJfdm9pY2VBY3Rpdml0eURldGVjdGlvbkZyZXF1ZW5jeSIsIl92YWRfTWF4QXVkaW9TYW1wbGVzIiwiX3ZhZF9NYXhCYWNrZ3JvdW5kTm9pc2VMZXZlbCIsIl92YWRfU2lsZW5jZU9mZmVzZXQiLCJfdmFkX2F1ZGlvU2FtcGxlc0FyciIsIl92YWRfYXVkaW9TYW1wbGVzQXJyU29ydGVkIiwiX3ZhZF9leGNlZWRDb3VudCIsIl92YWRfZXhjZWVkQ291bnRUaHJlc2hvbGQiLCJfdmFkX2V4Y2VlZENvdW50VGhyZXNob2xkTG93IiwiX3ZvaWNlQWN0aXZpdHlEZXRlY3Rpb25JbnRlcnZhbCIsInNldFNlcnZlclVybCIsInVybCIsInNldFNvY2tldFVybCIsInNldEFwcCIsImFwcE5hbWUiLCJzZXRSb29tIiwianNvbiIsInJlcGxhY2UiLCJvYmoiLCJKU09OIiwicGFyc2UiLCJuYW1lIiwiQWdvcmFSVEMiLCJsb2FkTW9kdWxlIiwiU2VnUGx1Z2luIiwiam9pblJvb20iLCJzZXRXZWJSdGNPcHRpb25zIiwib3B0aW9ucyIsInZpZGVvIiwiYXVkaW8iLCJlbmFibGVEYXRhQ2hhbm5lbHMiLCJkYXRhY2hhbm5lbCIsImVuYWJsZVZpZGVvUmVjZWl2ZSIsImVuYWJsZUF1ZGlvUmVjZWl2ZSIsInNldFNlcnZlckNvbm5lY3RMaXN0ZW5lcnMiLCJzdWNjZXNzTGlzdGVuZXIiLCJmYWlsdXJlTGlzdGVuZXIiLCJjb25uZWN0U3VjY2VzcyIsImNvbm5lY3RGYWlsdXJlIiwic2V0Um9vbU9jY3VwYW50TGlzdGVuZXIiLCJvY2N1cGFudExpc3RlbmVyIiwicm9vbU5hbWUiLCJvY2N1cGFudHMiLCJwcmltYXJ5Iiwic2V0RGF0YUNoYW5uZWxMaXN0ZW5lcnMiLCJvcGVuTGlzdGVuZXIiLCJjbG9zZWRMaXN0ZW5lciIsIm1lc3NhZ2VMaXN0ZW5lciIsInNldERhdGFDaGFubmVsT3Blbkxpc3RlbmVyIiwic2V0RGF0YUNoYW5uZWxDbG9zZUxpc3RlbmVyIiwic2V0UGVlckxpc3RlbmVyIiwidXBkYXRlVGltZU9mZnNldCIsImNsaWVudFNlbnRUaW1lIiwiRGF0ZSIsIm5vdyIsImZldGNoIiwiZG9jdW1lbnQiLCJsb2NhdGlvbiIsImhyZWYiLCJtZXRob2QiLCJjYWNoZSIsInRoZW4iLCJyZXMiLCJwcmVjaXNpb24iLCJzZXJ2ZXJSZWNlaXZlZFRpbWUiLCJoZWFkZXJzIiwiZ2V0IiwiZ2V0VGltZSIsImNsaWVudFJlY2VpdmVkVGltZSIsInNlcnZlclRpbWUiLCJ0aW1lT2Zmc2V0IiwicmVkdWNlIiwiYWNjIiwib2Zmc2V0Iiwic2V0VGltZW91dCIsImNvbm5lY3QiLCJQcm9taXNlIiwiYWxsIiwicmVzb2x2ZSIsInJlamVjdCIsImdlbmVyYXRlSWQiLCJjb25uZWN0QWdvcmEiLCJfY29ubmVjdCIsIl8iLCJfbXlSb29tSm9pblRpbWUiLCJfZ2V0Um9vbUpvaW5UaW1lIiwiY2F0Y2giLCJzaG91bGRTdGFydENvbm5lY3Rpb25UbyIsImNsaWVudCIsInJvb21Kb2luVGltZSIsInN0YXJ0U3RyZWFtQ29ubmVjdGlvbiIsImVycm9yIiwiY2FsbCIsImNhbGxlciIsIm1lZGlhIiwiTkFGIiwid3JpdGUiLCJlcnJvckNvZGUiLCJlcnJvclRleHQiLCJ3YXNBY2NlcHRlZCIsImNsb3NlU3RyZWFtQ29ubmVjdGlvbiIsImluZm8iLCJoYW5ndXAiLCJzZW5kTW9jYXAiLCJtb2NhcCIsInBvcnQxIiwicG9zdE1lc3NhZ2UiLCJ3YXRlcm1hcmsiLCJjcmVhdGVFbmNvZGVyIiwic2VuZGVyIiwic3RyZWFtcyIsImNyZWF0ZUVuY29kZWRTdHJlYW1zIiwidGV4dEVuY29kZXIiLCJUZXh0RW5jb2RlciIsInRoYXQiLCJ0cmFuc2Zvcm1lciIsIlRyYW5zZm9ybVN0cmVhbSIsInRyYW5zZm9ybSIsImNodW5rIiwiY29udHJvbGxlciIsImQiLCJkYXRhIiwidiIsImJ5dGVMZW5ndGgiLCJlbmNvZGUiLCJmcmFtZSIsIlVpbnQ4QXJyYXkiLCJzZXQiLCJieXRlcyIsImdldEludEJ5dGVzIiwiaSIsIm1hZ2ljSW5kZXgiLCJjaGFyQ29kZUF0IiwiYnVmZmVyIiwieSIsIndhcm4iLCJlbnF1ZXVlIiwicmVhZGFibGUiLCJwaXBlVGhyb3VnaCIsInBpcGVUbyIsIndyaXRhYmxlIiwid29ya2VyIiwiV29ya2VyIiwib25tZXNzYWdlIiwiZXZlbnQiLCJzZW5kZXJUcmFuc2Zvcm0iLCJSVENSdHBTY3JpcHRUcmFuc2Zvcm0iLCJwb3J0IiwicG9ydDIiLCJlIiwiY3JlYXRlRGVjb2RlciIsInJlY2VpdmVyIiwidGV4dERlY29kZXIiLCJUZXh0RGVjb2RlciIsInZpZXciLCJEYXRhVmlldyIsIm1hZ2ljRGF0YSIsIm1hZ2ljIiwibWFnaWNTdHJpbmciLCJTdHJpbmciLCJmcm9tQ2hhckNvZGUiLCJtb2NhcExlbiIsImdldFVpbnQzMiIsImZyYW1lU2l6ZSIsIm1vY2FwQnVmZmVyIiwiZGVjb2RlIiwicmVtb3RlTW9jYXAiLCJBcnJheUJ1ZmZlciIsInJlY2VpdmVyVHJhbnNmb3JtIiwicmVhZFN0YXRzIiwiX3VzZXJzIiwidSIsIl9tZWRpYVN0cmVhbVRyYWNrIiwiX3AycENoYW5uZWwiLCJjb25uZWN0aW9uIiwicGVlckNvbm5lY3Rpb24iLCJnZXRTdGF0cyIsInN0YXRzIiwiZm9yRWFjaCIsInJlcG9ydCIsInR5cGUiLCJraW5kIiwiaml0dGVyQnVmZmVyRGVsYXkiLCJ0b0ZpeGVkIiwiaXNOYU4iLCJoYW5kbGVSVE0iLCJzZW5kZXJJZCIsInRleHQiLCJkYXRhVHlwZSIsImhhbmRsZVJUTTIiLCJtc2ciLCJtZXNzYWdlIiwic2VuZERhdGEiLCJzZW5kRGF0YUd1YXJhbnRlZWQiLCJkZXN0aW5hdGlvbkNsaWVudElkIiwic2VuZEFnb3JhUlRNIiwiYnJvYWRjYXN0RGF0YUd1YXJhbnRlZWQiLCJicm9hZGNhc3REYXRhIiwic3RyaW5naWZ5IiwicGF5bG9hZCIsInB1Ymxpc2hNZXNzYWdlIiwicHVibGlzaCIsInNlbmRNZXNzYWdlIiwiZGVzdGluYXRpb24iLCJ0YXJnZXRSb29tIiwic2VuZERhdGFXUyIsImdldENvbm5lY3RTdGF0dXMiLCJhZGFwdGVycyIsIklTX0NPTk5FQ1RFRCIsInN0YXR1cyIsIk5PVF9DT05ORUNURUQiLCJDT05ORUNUSU5HIiwiZ2V0TWVkaWFTdHJlYW0iLCJzdHJlYW1OYW1lIiwiaGFzIiwiYXVkaW9Qcm9taXNlIiwicHJvbWlzZSIsInZpZGVvUHJvbWlzZSIsInN0cmVhbVByb21pc2UiLCJzZXRNZWRpYVN0cmVhbSIsInN0cmVhbSIsImNsaWVudE1lZGlhU3RyZWFtcyIsImF1ZGlvVHJhY2tzIiwiZ2V0QXVkaW9UcmFja3MiLCJhdWRpb1N0cmVhbSIsIk1lZGlhU3RyZWFtIiwiYWRkVHJhY2siLCJ2aWRlb1RyYWNrcyIsImdldFZpZGVvVHJhY2tzIiwidmlkZW9TdHJlYW0iLCJ4IiwiYWRkTG9jYWxNZWRpYVN0cmVhbSIsImlkIiwicmVnaXN0ZXIzcmRQYXJ0eUxvY2FsTWVkaWFTdHJlYW0iLCJPYmplY3QiLCJrZXlzIiwiYWRkU3RyZWFtVG9DYWxsIiwicmVtb3ZlTG9jYWxNZWRpYVN0cmVhbSIsImNsb3NlTG9jYWxNZWRpYVN0cmVhbSIsImVuYWJsZU1pY3JvcGhvbmUiLCJlbmFibGVkIiwiZW5hYmxlQ2FtZXJhIiwiZGlzY29ubmVjdCIsImhhbmRsZVVzZXJQdWJsaXNoZWQiLCJ1c2VyIiwibWVkaWFUeXBlIiwiaGFuZGxlVXNlclVucHVibGlzaGVkIiwiZ2V0SW5wdXRMZXZlbCIsImFuYWx5c2VyIiwiX3NvdXJjZSIsInZvbHVtZUxldmVsQW5hbHlzZXIiLCJhbmFseXNlck5vZGUiLCJidWZmZXJMZW5ndGgiLCJmcmVxdWVuY3lCaW5Db3VudCIsImdldEJ5dGVGcmVxdWVuY3lEYXRhIiwidmFsdWVzIiwiYXZlcmFnZSIsIk1hdGgiLCJmbG9vciIsInJlc3VsdCIsImNoYXJhY3RlcnMiLCJjaGFyYWN0ZXJzTGVuZ3RoIiwiY291bnRlciIsImNoYXJBdCIsInJhbmRvbSIsInZvaWNlQWN0aXZpdHlEZXRlY3Rpb24iLCJfZW5hYmxlZCIsImF1ZGlvTGV2ZWwiLCJyZW1vdmVkIiwic2hpZnQiLCJyZW1vdmVkSW5kZXgiLCJzcGxpY2UiLCJzb3J0IiwiYSIsImIiLCJiYWNrZ3JvdW5kIiwiX3N0YXRlX3N0b3BfYXQiLCJzdG9wTXVzaWMiLCJzdG9wIiwidW5wdWJsaXNoIiwic3RvcFRyYWNrIiwicGxheU11c2ljIiwicGF0aCIsInZvbHVtZSIsImNyZWF0ZUJ1ZmZlclNvdXJjZUF1ZGlvVHJhY2siLCJzb3VyY2UiLCJlbmNvZGVyQ29uZmlnIiwiYml0cmF0ZSIsInN0ZXJlbyIsInNldFZvbHVtZSIsInBsYXkiLCJzdGFydFByb2Nlc3NBdWRpb0J1ZmZlciIsImN5Y2xlIiwicGxheVRyYWNrIiwiY3JlYXRlQ3VzdG9tQXVkaW9UcmFjayIsIm1lZGlhU3RyZWFtVHJhY2siLCJzdWNjZXNzIiwiZmFpbHVyZSIsImNyZWF0ZUNsaWVudCIsIm1vZGUiLCJjb2RlYyIsInNldFBhcmFtZXRlciIsInNldEludGVydmFsIiwic2V0Q2xpZW50Um9sZSIsIm9uIiwiY29weSIsInN1YnNjcmliZSIsInF1ZXJ5U2VsZWN0b3IiLCJzcmNPYmplY3QiLCJlbmNfaWQiLCJyZWNlaXZlcnMiLCJnZXRSZWNlaXZlcnMiLCJnZXRFbGVtZW50QnlJZCIsImNhcHR1cmVTdHJlYW0iLCJqb2luIiwiY3JlYXRlTWljcm9waG9uZUF1ZGlvVHJhY2siLCJjcmVhdGVDdXN0b21WaWRlb1RyYWNrIiwiY3JlYXRlQ2FtZXJhVmlkZW9UcmFjayIsImF1ZGlvX3RyYWNrIiwiZ3VtX3N0cmVhbSIsImNhbXMiLCJnZXRDYW1lcmFzIiwibGFiZWwiLCJkZXZpY2VJZCIsInNldERldmljZSIsImltZ0VsZW1lbnQiLCJjcmVhdGVFbGVtZW50Iiwib25sb2FkIiwiaW5qZWN0Iiwic2V0T3B0aW9ucyIsImVuYWJsZSIsInNyYyIsIlZpcnR1YWxCYWNrZ3JvdW5kRXh0ZW5zaW9uIiwicmVnaXN0ZXJFeHRlbnNpb25zIiwiY3JlYXRlUHJvY2Vzc29yIiwiaW5pdCIsImNvbG9yIiwic2VuZGVycyIsImdldFNlbmRlcnMiLCJBZ29yYVJUTSIsInNldEFyZWEiLCJhcmVhQ29kZXMiLCJSVE0iLCJwcmVzZW5jZVRpbWVvdXQiLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnRBcmdzIiwicHVibGlzaGVyIiwicHJlc2VuY2UiLCJldmVudFR5cGUiLCJzbmFwc2hvdCIsInByZXNlbnQiLCJ1c2VySWQiLCJsb2dvdXQiLCJsb2dpbiIsImNyZWF0ZUluc3RhbmNlIiwibG9nRmlsdGVyIiwiTE9HX0ZJTFRFUl9PRkYiLCJuZXdTdGF0ZSIsInJlYXNvbiIsImNyZWF0ZUNoYW5uZWwiLCJtZW1iZXJJZCIsIm15Um9vbUlkIiwiam9pblRpbWUiLCJnZXRSb29tT2NjdXBhbnRzQXNNYXAiLCJnZXRTZXJ2ZXJUaW1lIiwicmVnaXN0ZXIiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiO1FBQUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7OztRQUdBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwwQ0FBMEMsZ0NBQWdDO1FBQzFFO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0Esd0RBQXdELGtCQUFrQjtRQUMxRTtRQUNBLGlEQUFpRCxjQUFjO1FB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dC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL2luZGV4LmpzXCIpO1xuIiwiY2xhc3MgQWdvcmFSdGNBZGFwdGVyIHtcblxuICBjb25zdHJ1Y3RvcihlYXN5cnRjKSB7XG5cbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgY29uc3RydWN0b3IgXCIsIGVhc3lydGMpO1xuXG4gICAgdGhpcy5lYXN5cnRjID0gZWFzeXJ0YyB8fCB3aW5kb3cuZWFzeXJ0YztcbiAgICB0aGlzLmFwcCA9IFwiZGVmYXVsdFwiO1xuICAgIHRoaXMucm9vbSA9IFwiZGVmYXVsdFwiO1xuICAgIHRoaXMudXNlcmlkID0gMDtcbiAgICB0aGlzLmFwcGlkID0gbnVsbDtcbiAgICB0aGlzLm1vY2FwRGF0YSA9IFwiXCI7XG4gICAgdGhpcy5tb2NhcFByZXZEYXRhID0gXCJcIjtcbiAgICB0aGlzLmxvZ2kgPSAwO1xuICAgIHRoaXMubG9nbyA9IDA7XG4gICAgdGhpcy5tZWRpYVN0cmVhbXMgPSB7fTtcbiAgICB0aGlzLnJlbW90ZUNsaWVudHMgPSB7fTtcbiAgICB0aGlzLm9jY3VwYW50TGlzdCA9IHt9O1xuICAgIHRoaXMuYXVkaW9KaXR0ZXIgPSB7fTtcbiAgICB0aGlzLnBlbmRpbmdNZWRpYVJlcXVlc3RzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuZW5hYmxlVmlkZW8gPSBmYWxzZTtcbiAgICB0aGlzLmVuYWJsZVZpZGVvRmlsdGVyZWQgPSBmYWxzZTtcbiAgICB0aGlzLmVuYWJsZUF1ZGlvID0gZmFsc2U7XG4gICAgdGhpcy5lbmFibGVBdmF0YXIgPSBmYWxzZTtcbiAgICB0aGlzLnJlbW90ZUF1ZGlvVHJhY2sgPSBudWxsO1xuXG4gICAgdGhpcy5sb2NhbFRyYWNrcyA9IHsgdmlkZW9UcmFjazogbnVsbCwgYXVkaW9UcmFjazogbnVsbCwgbXVzaWNUcmFjazogbnVsbCB9O1xuICAgIHdpbmRvdy5sb2NhbFRyYWNrcyA9IHRoaXMubG9jYWxUcmFja3M7XG4gICAgdGhpcy50b2tlbiA9IG51bGw7XG4gICAgdGhpcy5jbGllbnRJZCA9IG51bGw7XG4gICAgdGhpcy51aWQgPSBudWxsO1xuICAgIHRoaXMudmJnID0gZmFsc2U7XG4gICAgdGhpcy52YmcwID0gZmFsc2U7XG4gICAgdGhpcy5zaG93TG9jYWwgPSBmYWxzZTtcbiAgICB0aGlzLnZpcnR1YWxCYWNrZ3JvdW5kSW5zdGFuY2UgPSBudWxsO1xuICAgIHRoaXMuZXh0ZW5zaW9uID0gbnVsbDtcbiAgICB0aGlzLnByb2Nlc3NvciA9IG51bGw7XG4gICAgdGhpcy5waXBlUHJvY2Vzc29yID0gKHRyYWNrLCBwcm9jZXNzb3IpID0+IHtcbiAgICAgIHRyYWNrLnBpcGUocHJvY2Vzc29yKS5waXBlKHRyYWNrLnByb2Nlc3NvckRlc3RpbmF0aW9uKTtcbiAgICB9XG5cbiAgICB0aGlzLnNlcnZlclRpbWVSZXF1ZXN0cyA9IDA7XG4gICAgdGhpcy50aW1lT2Zmc2V0cyA9IFtdO1xuICAgIHRoaXMuYXZnVGltZU9mZnNldCA9IDA7XG4gICAgdGhpcy5hZ29yYUNsaWVudCA9IG51bGw7XG5cbiAgICAvLyBSVE1cbiAgICB0aGlzLnN5bmNPYmplY3RzID0gdHJ1ZTtcbiAgICB0aGlzLmFnb3JhUlRNID0gZmFsc2U7XG4gICAgdGhpcy5hZ29yYVJUTTIgPSBmYWxzZTtcbiAgICB0aGlzLnJ0bUNsaWVudCA9IG51bGw7XG4gICAgdGhpcy5ydG1VaWQgPSBudWxsO1xuICAgIHRoaXMucnRtQ2hhbm5lbE5hbWUgPSBudWxsO1xuICAgIHRoaXMucnRtQ2hhbm5lbCA9IG51bGw7XG5cbiAgICBpZiAodGhpcy5lYXN5cnRjKSB7XG4gICAgICB0aGlzLmVhc3lydGMuc2V0UGVlck9wZW5MaXN0ZW5lcihjbGllbnRJZCA9PiB7XG4gICAgICAgIGNvbnN0IGNsaWVudENvbm5lY3Rpb24gPSB0aGlzLmVhc3lydGMuZ2V0UGVlckNvbm5lY3Rpb25CeVVzZXJJZChjbGllbnRJZCk7XG4gICAgICAgIHRoaXMucmVtb3RlQ2xpZW50c1tjbGllbnRJZF0gPSBjbGllbnRDb25uZWN0aW9uO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuZWFzeXJ0Yy5zZXRQZWVyQ2xvc2VkTGlzdGVuZXIoY2xpZW50SWQgPT4ge1xuICAgICAgICBkZWxldGUgdGhpcy5yZW1vdGVDbGllbnRzW2NsaWVudElkXTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMuaXNDaHJvbWUgPSAobmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCdGaXJlZm94JykgPT09IC0xICYmIG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignQ2hyb21lJykgPiAtMSk7XG5cbiAgICBpZiAodGhpcy5pc0Nocm9tZSkge1xuICAgICAgd2luZG93Lm9sZFJUQ1BlZXJDb25uZWN0aW9uID0gUlRDUGVlckNvbm5lY3Rpb247XG4gICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24gPSBuZXcgUHJveHkod2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLCB7XG4gICAgICAgIGNvbnN0cnVjdDogZnVuY3Rpb24gKHRhcmdldCwgYXJncykge1xuICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGFyZ3NbMF1bXCJlbmNvZGVkSW5zZXJ0YWJsZVN0cmVhbXNcIl0gPSB0cnVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhcmdzLnB1c2goeyBlbmNvZGVkSW5zZXJ0YWJsZVN0cmVhbXM6IHRydWUgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgcGMgPSBuZXcgd2luZG93Lm9sZFJUQ1BlZXJDb25uZWN0aW9uKC4uLmFyZ3MpO1xuICAgICAgICAgIHJldHVybiBwYztcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgICAgY29uc3Qgb2xkU2V0Q29uZmlndXJhdGlvbiA9IHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuc2V0Q29uZmlndXJhdGlvbjtcbiAgICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuc2V0Q29uZmlndXJhdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc3QgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgaWYgKGFyZ3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGFyZ3NbMF1bXCJlbmNvZGVkSW5zZXJ0YWJsZVN0cmVhbXNcIl0gPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFyZ3MucHVzaCh7IGVuY29kZWRJbnNlcnRhYmxlU3RyZWFtczogdHJ1ZSB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIG9sZFNldENvbmZpZ3VyYXRpb24uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIGN1c3RvbSBkYXRhIGFwcGVuZCBwYXJhbXNcbiAgICB0aGlzLkN1c3RvbURhdGFEZXRlY3RvciA9ICdBR09SQU1PQ0FQJztcbiAgICB0aGlzLkN1c3RvbURhdExlbmd0aEJ5dGVDb3VudCA9IDQ7XG4gICAgdGhpcy5zZW5kZXJDaGFubmVsID0gbmV3IE1lc3NhZ2VDaGFubmVsO1xuICAgIHRoaXMucmVjZWl2ZXJDaGFubmVsO1xuICAgIC8vdGhpcy5yX3JlY2VpdmVyPW51bGw7XG4gICAgLy90aGlzLnJfY2xpZW50SWQ9bnVsbDtcblxuICAgIHRoaXMuX3ZhZF9hdWRpb1RyYWNrID0gbnVsbDtcbiAgICB0aGlzLl92b2ljZUFjdGl2aXR5RGV0ZWN0aW9uRnJlcXVlbmN5ID0gMTUwO1xuXG4gICAgdGhpcy5fdmFkX01heEF1ZGlvU2FtcGxlcyA9IDQwMDtcbiAgICB0aGlzLl92YWRfTWF4QmFja2dyb3VuZE5vaXNlTGV2ZWwgPSAyMDtcbiAgICB0aGlzLl92YWRfU2lsZW5jZU9mZmVzZXQgPSA0O1xuICAgIHRoaXMuX3ZhZF9hdWRpb1NhbXBsZXNBcnIgPSBbXTtcbiAgICB0aGlzLl92YWRfYXVkaW9TYW1wbGVzQXJyU29ydGVkID0gW107XG4gICAgdGhpcy5fdmFkX2V4Y2VlZENvdW50ID0gMDtcbiAgICB0aGlzLl92YWRfZXhjZWVkQ291bnRUaHJlc2hvbGQgPSAyO1xuICAgIHRoaXMuX3ZhZF9leGNlZWRDb3VudFRocmVzaG9sZExvdyA9IDE7XG4gICAgdGhpcy5fdm9pY2VBY3Rpdml0eURldGVjdGlvbkludGVydmFsO1xuICAgIHdpbmRvdy5BZ29yYVJ0Y0FkYXB0ZXIgPSB0aGlzO1xuXG4gIH1cblxuICBzZXRTZXJ2ZXJVcmwodXJsKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNldFNlcnZlclVybCBcIiwgdXJsKTtcbiAgICBpZiAodGhpcy5lYXN5cnRjKSB7XG4gICAgICB0aGlzLmVhc3lydGMuc2V0U29ja2V0VXJsKHVybCk7XG4gICAgfVxuICB9XG5cbiAgc2V0QXBwKGFwcE5hbWUpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0QXBwIFwiLCBhcHBOYW1lKTtcbiAgICB0aGlzLmFwcCA9IGFwcE5hbWU7XG4gICAgdGhpcy5hcHBpZCA9IGFwcE5hbWU7XG4gIH1cblxuICBhc3luYyBzZXRSb29tKGpzb24pIHtcbiAgICBqc29uID0ganNvbi5yZXBsYWNlKC8nL2csICdcIicpO1xuICAgIGNvbnN0IG9iaiA9IEpTT04ucGFyc2UoanNvbik7XG4gICAgdGhpcy5yb29tID0gb2JqLm5hbWU7XG5cbiAgICBpZiAob2JqLnZiZyAmJiBvYmoudmJnID09ICd0cnVlJykge1xuICAgICAgdGhpcy52YmcgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChvYmoudmJnMCAmJiBvYmoudmJnMCA9PSAndHJ1ZScpIHtcbiAgICAgIHRoaXMudmJnMCA9IHRydWU7XG4gICAgICBBZ29yYVJUQy5sb2FkTW9kdWxlKFNlZ1BsdWdpbiwge30pO1xuICAgIH1cblxuICAgIGlmIChvYmouZW5hYmxlQXZhdGFyICYmIG9iai5lbmFibGVBdmF0YXIgPT0gJ3RydWUnKSB7XG4gICAgICB0aGlzLmVuYWJsZUF2YXRhciA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKG9iai5zeW5jT2JqZWN0cyAmJiBvYmouc3luY09iamVjdHMgPT0gJ2ZhbHNlJykge1xuICAgICAgdGhpcy5zeW5jT2JqZWN0cyA9IGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChvYmouYWdvcmFSVE0gJiYgb2JqLmFnb3JhUlRNID09ICd0cnVlJykge1xuICAgICAgdGhpcy5hZ29yYVJUTSA9IHRydWU7XG4gICAgfVxuXG5cbiAgICBpZiAob2JqLmFnb3JhUlRNMiAmJiBvYmouYWdvcmFSVE0yID09ICd0cnVlJykge1xuICAgICAgdGhpcy5hZ29yYVJUTTIgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChvYmouc2hvd0xvY2FsICYmIG9iai5zaG93TG9jYWwgPT0gJ3RydWUnKSB7XG4gICAgICB0aGlzLnNob3dMb2NhbCA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKG9iai5lbmFibGVWaWRlb0ZpbHRlcmVkICYmIG9iai5lbmFibGVWaWRlb0ZpbHRlcmVkID09ICd0cnVlJykge1xuICAgICAgdGhpcy5lbmFibGVWaWRlb0ZpbHRlcmVkID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLmFnb3JhUlRNKSB7XG4gICAgICB0aGlzLmVhc3lydGMuam9pblJvb20odGhpcy5yb29tLCBudWxsKTtcbiAgICB9XG4gIH1cblxuICAvLyBvcHRpb25zOiB7IGRhdGFjaGFubmVsOiBib29sLCBhdWRpbzogYm9vbCwgdmlkZW86IGJvb2wgfVxuICBzZXRXZWJSdGNPcHRpb25zKG9wdGlvbnMpIHtcbiAgLy8gdXNpbmcgQWdvcmFcbiAgICB0aGlzLmVuYWJsZVZpZGVvID0gb3B0aW9ucy52aWRlbztcbiAgICB0aGlzLmVuYWJsZUF1ZGlvID0gb3B0aW9ucy5hdWRpbztcblxuICAgIGlmICghdGhpcy5lYXN5cnRjKXtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNldFdlYlJ0Y09wdGlvbnMgXCIsIG9wdGlvbnMpO1xuICAgIC8vIHRoaXMuZWFzeXJ0Yy5lbmFibGVEZWJ1Zyh0cnVlKTtcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlRGF0YUNoYW5uZWxzKG9wdGlvbnMuZGF0YWNoYW5uZWwpO1xuICAgIC8vIG5vdCBlYXN5cnRjXG4gICAgdGhpcy5lYXN5cnRjLmVuYWJsZVZpZGVvKGZhbHNlKTtcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlQXVkaW8oZmFsc2UpO1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVWaWRlb1JlY2VpdmUoZmFsc2UpO1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVBdWRpb1JlY2VpdmUoZmFsc2UpO1xuICB9XG5cbiAgc2V0U2VydmVyQ29ubmVjdExpc3RlbmVycyhzdWNjZXNzTGlzdGVuZXIsIGZhaWx1cmVMaXN0ZW5lcikge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXRTZXJ2ZXJDb25uZWN0TGlzdGVuZXJzIFwiLCBzdWNjZXNzTGlzdGVuZXIsIGZhaWx1cmVMaXN0ZW5lcik7XG4gICAgdGhpcy5jb25uZWN0U3VjY2VzcyA9IHN1Y2Nlc3NMaXN0ZW5lcjtcbiAgICB0aGlzLmNvbm5lY3RGYWlsdXJlID0gZmFpbHVyZUxpc3RlbmVyO1xuICB9XG5cbiAgc2V0Um9vbU9jY3VwYW50TGlzdGVuZXIob2NjdXBhbnRMaXN0ZW5lcikge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXRSb29tT2NjdXBhbnRMaXN0ZW5lciBcIiwgb2NjdXBhbnRMaXN0ZW5lcik7XG4gICAgdGhpcy5vY2N1cGFudExpc3RlbmVyPW9jY3VwYW50TGlzdGVuZXI7XG5cbiAgICBpZiAoIXRoaXMuZWFzeXJ0Yyl7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuZWFzeXJ0Yy5zZXRSb29tT2NjdXBhbnRMaXN0ZW5lcihmdW5jdGlvbiAocm9vbU5hbWUsIG9jY3VwYW50cywgcHJpbWFyeSkge1xuICAgICAgb2NjdXBhbnRMaXN0ZW5lcihvY2N1cGFudHMpO1xuICAgIH0pO1xuICB9XG5cbiAgc2V0RGF0YUNoYW5uZWxMaXN0ZW5lcnMob3Blbkxpc3RlbmVyLCBjbG9zZWRMaXN0ZW5lciwgbWVzc2FnZUxpc3RlbmVyKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNldERhdGFDaGFubmVsTGlzdGVuZXJzICBcIiwgb3Blbkxpc3RlbmVyLCBjbG9zZWRMaXN0ZW5lciwgbWVzc2FnZUxpc3RlbmVyKTtcblxuXG4gICAgdGhpcy5vcGVuTGlzdGVuZXIgPSBvcGVuTGlzdGVuZXI7XG4gICAgdGhpcy5tZXNzYWdlTGlzdGVuZXIgPSBtZXNzYWdlTGlzdGVuZXI7XG4gICAgdGhpcy5jbG9zZWRMaXN0ZW5lciA9IGNsb3NlZExpc3RlbmVyOyAgICBcbiAgICBpZiAoIXRoaXMuZWFzeXJ0Yyl7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuZWFzeXJ0Yy5zZXREYXRhQ2hhbm5lbE9wZW5MaXN0ZW5lcihvcGVuTGlzdGVuZXIpO1xuICAgIHRoaXMuZWFzeXJ0Yy5zZXREYXRhQ2hhbm5lbENsb3NlTGlzdGVuZXIoY2xvc2VkTGlzdGVuZXIpO1xuICAgIHRoaXMuZWFzeXJ0Yy5zZXRQZWVyTGlzdGVuZXIobWVzc2FnZUxpc3RlbmVyKTtcbiAgfVxuXG4gIHVwZGF0ZVRpbWVPZmZzZXQoKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHVwZGF0ZVRpbWVPZmZzZXQgXCIpO1xuICAgIGNvbnN0IGNsaWVudFNlbnRUaW1lID0gRGF0ZS5ub3coKSArIHRoaXMuYXZnVGltZU9mZnNldDtcblxuICAgIHJldHVybiBmZXRjaChkb2N1bWVudC5sb2NhdGlvbi5ocmVmLCB7IG1ldGhvZDogXCJIRUFEXCIsIGNhY2hlOiBcIm5vLWNhY2hlXCIgfSkudGhlbihyZXMgPT4ge1xuICAgICAgdmFyIHByZWNpc2lvbiA9IDEwMDA7XG4gICAgICB2YXIgc2VydmVyUmVjZWl2ZWRUaW1lID0gbmV3IERhdGUocmVzLmhlYWRlcnMuZ2V0KFwiRGF0ZVwiKSkuZ2V0VGltZSgpICsgcHJlY2lzaW9uIC8gMjtcbiAgICAgIHZhciBjbGllbnRSZWNlaXZlZFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgdmFyIHNlcnZlclRpbWUgPSBzZXJ2ZXJSZWNlaXZlZFRpbWUgKyAoY2xpZW50UmVjZWl2ZWRUaW1lIC0gY2xpZW50U2VudFRpbWUpIC8gMjtcbiAgICAgIHZhciB0aW1lT2Zmc2V0ID0gc2VydmVyVGltZSAtIGNsaWVudFJlY2VpdmVkVGltZTtcblxuICAgICAgdGhpcy5zZXJ2ZXJUaW1lUmVxdWVzdHMrKztcblxuICAgICAgaWYgKHRoaXMuc2VydmVyVGltZVJlcXVlc3RzIDw9IDEwKSB7XG4gICAgICAgIHRoaXMudGltZU9mZnNldHMucHVzaCh0aW1lT2Zmc2V0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudGltZU9mZnNldHNbdGhpcy5zZXJ2ZXJUaW1lUmVxdWVzdHMgJSAxMF0gPSB0aW1lT2Zmc2V0O1xuICAgICAgfVxuXG4gICAgICB0aGlzLmF2Z1RpbWVPZmZzZXQgPSB0aGlzLnRpbWVPZmZzZXRzLnJlZHVjZSgoYWNjLCBvZmZzZXQpID0+IGFjYyArPSBvZmZzZXQsIDApIC8gdGhpcy50aW1lT2Zmc2V0cy5sZW5ndGg7XG5cbiAgICAgIGlmICh0aGlzLnNlcnZlclRpbWVSZXF1ZXN0cyA+IDEwKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy51cGRhdGVUaW1lT2Zmc2V0KCksIDUgKiA2MCAqIDEwMDApOyAvLyBTeW5jIGNsb2NrIGV2ZXJ5IDUgbWludXRlcy5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudXBkYXRlVGltZU9mZnNldCgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgY29ubmVjdCgpIHtcblxuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBjb25uZWN0XCIpO1xuICAgIFByb21pc2UuYWxsKFt0aGlzLnVwZGF0ZVRpbWVPZmZzZXQoKSwgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgaWYgKHRoaXMuYWdvcmFSVE0pIHtcbiAgICAgICAgdGhpcy5jbGllbnRJZD10aGlzLmdlbmVyYXRlSWQoMTApO1xuICAgICAgICB0aGlzLmNvbm5lY3RBZ29yYShyZXNvbHZlLCByZWplY3QpOyAvL3Jlc29sdmUsIHJlamVjdCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9jb25uZWN0KHJlc29sdmUsIHJlamVjdCk7XG4gICAgICB9XG4gICAgfSldKS50aGVuKChbXywgY2xpZW50SWRdKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIkJXNzMgY29ubmVjdGVkIFwiICsgY2xpZW50SWQpO1xuICAgICAgdGhpcy5jbGllbnRJZCA9IGNsaWVudElkO1xuICAgICAgaWYgKCF0aGlzLmFnb3JhUlRNKSB7XG4gICAgICAgIHRoaXMuX215Um9vbUpvaW5UaW1lID0gdGhpcy5fZ2V0Um9vbUpvaW5UaW1lKGNsaWVudElkKTtcbiAgICAgICAgdGhpcy5jb25uZWN0QWdvcmEoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY29ubmVjdFN1Y2Nlc3MoY2xpZW50SWQpO1xuICAgIH0pLmNhdGNoKHRoaXMuY29ubmVjdEZhaWx1cmUpO1xuICB9XG5cbiAgc2hvdWxkU3RhcnRDb25uZWN0aW9uVG8oY2xpZW50KSB7XG4gICAgcmV0dXJuIHRoaXMuX215Um9vbUpvaW5UaW1lIDw9IGNsaWVudC5yb29tSm9pblRpbWU7XG4gIH1cblxuICBzdGFydFN0cmVhbUNvbm5lY3Rpb24oY2xpZW50SWQpIHtcbiAgICBpZiAoIXRoaXMuZWFzeXJ0Yyl7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnNvbGUuZXJyb3IoXCJCVzczIHN0YXJ0U3RyZWFtQ29ubmVjdGlvbiBcIiwgY2xpZW50SWQpO1xuICAgIHRoaXMuZWFzeXJ0Yy5jYWxsKGNsaWVudElkLCBmdW5jdGlvbiAoY2FsbGVyLCBtZWRpYSkge1xuICAgICAgaWYgKG1lZGlhID09PSBcImRhdGFjaGFubmVsXCIpIHtcbiAgICAgICAgTkFGLmxvZy53cml0ZShcIlN1Y2Nlc3NmdWxseSBzdGFydGVkIGRhdGFjaGFubmVsIHRvIFwiLCBjYWxsZXIpO1xuICAgICAgfVxuICAgIH0sIGZ1bmN0aW9uIChlcnJvckNvZGUsIGVycm9yVGV4dCkge1xuICAgICAgTkFGLmxvZy5lcnJvcihlcnJvckNvZGUsIGVycm9yVGV4dCk7XG4gICAgfSwgZnVuY3Rpb24gKHdhc0FjY2VwdGVkKSB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIndhcyBhY2NlcHRlZD1cIiArIHdhc0FjY2VwdGVkKTtcbiAgICB9KTtcbiAgfVxuXG4gIGNsb3NlU3RyZWFtQ29ubmVjdGlvbihjbGllbnRJZCkge1xuICAgIGNvbnNvbGUuaW5mbyhcIkJXNzMgY2xvc2VTdHJlYW1Db25uZWN0aW9uIFwiLCBjbGllbnRJZCk7XG4gICAgaWYgKHRoaXMuYWdvcmFSVE0pIHtcbiAgICAgIHRoaXMuY2xvc2VkTGlzdGVuZXIoY2xpZW50SWQpOyAgXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZWFzeXJ0Yy5oYW5ndXAoY2xpZW50SWQpO1xuICAgIH0gICAgXG4gIH1cblxuXG5cbiAgc2VuZE1vY2FwKG1vY2FwKSB7XG4gICAgaWYgKG1vY2FwID09IHRoaXMubW9jYXBQcmV2RGF0YSkge1xuICAgICAgLy8gICBjb25zb2xlLmxvZyhcImJsYW5rXCIpO1xuICAgICAgbW9jYXAgPSBcIlwiO1xuICAgIH1cblxuICAgIC8vIHNldCB0byBibGFuayBhZnRlciBzZW5kaW5nXG4gICAgaWYgKHRoaXMubW9jYXBEYXRhID09PSBcIlwiKSB7XG4gICAgICB0aGlzLm1vY2FwRGF0YSA9IG1vY2FwO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5pc0Nocm9tZSkge1xuICAgICAgdGhpcy5zZW5kZXJDaGFubmVsLnBvcnQxLnBvc3RNZXNzYWdlKHsgd2F0ZXJtYXJrOiBtb2NhcCB9KTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBjcmVhdGVFbmNvZGVyKHNlbmRlcikge1xuICAgIGlmICh0aGlzLmlzQ2hyb21lKSB7XG4gICAgICBjb25zdCBzdHJlYW1zID0gc2VuZGVyLmNyZWF0ZUVuY29kZWRTdHJlYW1zKCk7XG4gICAgICBjb25zdCB0ZXh0RW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgY29uc3QgdHJhbnNmb3JtZXIgPSBuZXcgVHJhbnNmb3JtU3RyZWFtKHtcbiAgICAgICAgdHJhbnNmb3JtKGNodW5rLCBjb250cm9sbGVyKSB7XG4gICAgICAgICAgbGV0IGQ9Y2h1bmsuZGF0YTtcbiAgICAgICAgICBsZXQgdj1jaHVuay5kYXRhLmJ5dGVMZW5ndGg7XG4gICAgICAgICAgY29uc3QgbW9jYXAgPSB0ZXh0RW5jb2Rlci5lbmNvZGUodGhhdC5tb2NhcERhdGEpO1xuICAgICAgICAgIC8vICAgIGNvbnNvbGUuZXJyb3IoXCJhcHBlbmRpbmcgXCIsdGhhdC5tb2NhcERhdGEpO1xuICAgICAgICAgIHRoYXQubW9jYXBQcmV2RGF0YSA9IHRoYXQubW9jYXBEYXRhO1xuICAgICAgICAgIHRoYXQubW9jYXBEYXRhID0gXCJcIjtcbiAgICAgICAgICBjb25zdCBmcmFtZSA9IGNodW5rLmRhdGE7XG4gICAgICAgICAgY29uc3QgZGF0YSA9IG5ldyBVaW50OEFycmF5KGNodW5rLmRhdGEuYnl0ZUxlbmd0aCArIG1vY2FwLmJ5dGVMZW5ndGggKyB0aGF0LkN1c3RvbURhdExlbmd0aEJ5dGVDb3VudCArIHRoYXQuQ3VzdG9tRGF0YURldGVjdG9yLmxlbmd0aCk7XG4gICAgICAgICAgZGF0YS5zZXQobmV3IFVpbnQ4QXJyYXkoZnJhbWUpLCAwKTtcbiAgICAgICAgICBkYXRhLnNldChtb2NhcCwgZnJhbWUuYnl0ZUxlbmd0aCk7XG4gICAgICAgICAgdmFyIGJ5dGVzID0gdGhhdC5nZXRJbnRCeXRlcyhtb2NhcC5ieXRlTGVuZ3RoKTtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoYXQuQ3VzdG9tRGF0TGVuZ3RoQnl0ZUNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIGRhdGFbZnJhbWUuYnl0ZUxlbmd0aCArIG1vY2FwLmJ5dGVMZW5ndGggKyBpXSA9IGJ5dGVzW2ldO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFNldCBtYWdpYyBzdHJpbmcgYXQgdGhlIGVuZFxuICAgICAgICAgIGNvbnN0IG1hZ2ljSW5kZXggPSBmcmFtZS5ieXRlTGVuZ3RoICsgbW9jYXAuYnl0ZUxlbmd0aCArIHRoYXQuQ3VzdG9tRGF0TGVuZ3RoQnl0ZUNvdW50O1xuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhhdC5DdXN0b21EYXRhRGV0ZWN0b3IubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGRhdGFbbWFnaWNJbmRleCArIGldID0gdGhhdC5DdXN0b21EYXRhRGV0ZWN0b3IuY2hhckNvZGVBdChpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY2h1bmsuZGF0YSA9IGRhdGEuYnVmZmVyO1xuICAgICAgICAgIGxldCB5PWNodW5rLmRhdGEuYnl0ZUxlbmd0aDtcbiAgICAgICAgICBpZiAoeT49MTAwMCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdhdWRpbyBmcmFtZSB0b28gbGFyZ2UsIHNraXBwaW5nLi4uICcsdix5LHktdiwgdGhhdC5tb2NhcFByZXZEYXRhKTtcbiAgICAgICAgICAgIGNodW5rLmRhdGE9ZDtcbiAgICAgICAgICB9IFxuICAgICAgICAgLy8gY29uc29sZS53YXJuKHYseSx5LXYpO1xuICAgICAgICAgLy8gY29uc29sZS53YXJuKHYseSx5LXYpO1xuICAgICAgICAgIGNvbnRyb2xsZXIuZW5xdWV1ZShjaHVuayk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBzdHJlYW1zLnJlYWRhYmxlLnBpcGVUaHJvdWdoKHRyYW5zZm9ybWVyKS5waXBlVG8oc3RyZWFtcy53cml0YWJsZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgIGNvbnN0IHdvcmtlciA9IG5ldyBXb3JrZXIoJy4vZGlzdC9zY3JpcHQtdHJhbnNmb3JtLXdvcmtlci5qcycpO1xuICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiB3b3JrZXIub25tZXNzYWdlID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldmVudC5kYXRhID09PSAncmVnaXN0ZXJlZCcpIHtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgY29uc3Qgc2VuZGVyVHJhbnNmb3JtID0gbmV3IFJUQ1J0cFNjcmlwdFRyYW5zZm9ybSh3b3JrZXIsIHsgbmFtZTogJ291dGdvaW5nJywgcG9ydDogdGhhdC5zZW5kZXJDaGFubmVsLnBvcnQyIH0sIFt0aGF0LnNlbmRlckNoYW5uZWwucG9ydDJdKTtcbiAgICAgIHNlbmRlclRyYW5zZm9ybS5wb3J0ID0gdGhhdC5zZW5kZXJDaGFubmVsLnBvcnQxO1xuICAgICAgc2VuZGVyLnRyYW5zZm9ybSA9IHNlbmRlclRyYW5zZm9ybTtcbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gd29ya2VyLm9ubWVzc2FnZSA9IChldmVudCkgPT4ge1xuICAgICAgICBpZiAoZXZlbnQuZGF0YSA9PT0gJ3N0YXJ0ZWQnKSB7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgc2VuZGVyVHJhbnNmb3JtLnBvcnQub25tZXNzYWdlID0gZSA9PiB7XG4gICAgICAgIGlmIChlLmRhdGEgPT0gXCJDTEVBUlwiKSB7XG4gICAgICAgICAgdGhhdC5tb2NhcFByZXZEYXRhID0gdGhhdC5tb2NhcERhdGE7XG4gICAgICAgICAgdGhhdC5tb2NhcERhdGEgPSBcIlwiO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgdGhhdC5zZW5kZXJDaGFubmVsLnBvcnQxLnBvc3RNZXNzYWdlKHsgd2F0ZXJtYXJrOiB0aGF0Lm1vY2FwRGF0YSB9KTtcbiAgICB9XG4gIH1cblxuXG4gIGFzeW5jIGNyZWF0ZURlY29kZXIocmVjZWl2ZXIsIGNsaWVudElkKSB7XG4gICAgaWYgKHRoaXMuaXNDaHJvbWUpIHtcbiAgICAgIGNvbnN0IHN0cmVhbXMgPSByZWNlaXZlci5jcmVhdGVFbmNvZGVkU3RyZWFtcygpO1xuICAgICAgY29uc3QgdGV4dERlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoKTtcbiAgICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgICAgY29uc3QgdHJhbnNmb3JtZXIgPSBuZXcgVHJhbnNmb3JtU3RyZWFtKHtcbiAgICAgICAgdHJhbnNmb3JtKGNodW5rLCBjb250cm9sbGVyKSB7XG4gICAgICAgICAgICBpZiAoY2h1bmsuZGF0YS5ieXRlTGVuZ3RoIC0gdGhhdC5DdXN0b21EYXRhRGV0ZWN0b3IubGVuZ3RoPjApIHtcbiAgICAgICAgICAgIGNvbnN0IHZpZXcgPSBuZXcgRGF0YVZpZXcoY2h1bmsuZGF0YSk7XG4gICAgICAgICAgICBjb25zdCBtYWdpY0RhdGEgPSBuZXcgVWludDhBcnJheShjaHVuay5kYXRhLCBjaHVuay5kYXRhLmJ5dGVMZW5ndGggLSB0aGF0LkN1c3RvbURhdGFEZXRlY3Rvci5sZW5ndGgsIHRoYXQuQ3VzdG9tRGF0YURldGVjdG9yLmxlbmd0aCk7XG4gICAgICAgICAgICBsZXQgbWFnaWMgPSBbXTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhhdC5DdXN0b21EYXRhRGV0ZWN0b3IubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgbWFnaWMucHVzaChtYWdpY0RhdGFbaV0pO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgbWFnaWNTdHJpbmcgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKC4uLm1hZ2ljKTtcbiAgICAgICAgICAgIGlmIChtYWdpY1N0cmluZyA9PT0gdGhhdC5DdXN0b21EYXRhRGV0ZWN0b3IpIHtcbiAgICAgICAgICAgICAgY29uc3QgbW9jYXBMZW4gPSB2aWV3LmdldFVpbnQzMihjaHVuay5kYXRhLmJ5dGVMZW5ndGggLSAodGhhdC5DdXN0b21EYXRMZW5ndGhCeXRlQ291bnQgKyB0aGF0LkN1c3RvbURhdGFEZXRlY3Rvci5sZW5ndGgpLCBmYWxzZSk7XG4gICAgICAgICAgICAgIGNvbnN0IGZyYW1lU2l6ZSA9IGNodW5rLmRhdGEuYnl0ZUxlbmd0aCAtIChtb2NhcExlbiArIHRoYXQuQ3VzdG9tRGF0TGVuZ3RoQnl0ZUNvdW50ICsgdGhhdC5DdXN0b21EYXRhRGV0ZWN0b3IubGVuZ3RoKTtcbiAgICAgICAgICAgICAgY29uc3QgbW9jYXBCdWZmZXIgPSBuZXcgVWludDhBcnJheShjaHVuay5kYXRhLCBmcmFtZVNpemUsIG1vY2FwTGVuKTtcbiAgICAgICAgICAgICAgY29uc3QgbW9jYXAgPSB0ZXh0RGVjb2Rlci5kZWNvZGUobW9jYXBCdWZmZXIpXG4gICAgICAgICAgICAgIGlmIChtb2NhcC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LnJlbW90ZU1vY2FwKG1vY2FwICsgXCIsXCIgKyBjbGllbnRJZCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY29uc3QgZnJhbWUgPSBjaHVuay5kYXRhO1xuICAgICAgICAgICAgICBjaHVuay5kYXRhID0gbmV3IEFycmF5QnVmZmVyKGZyYW1lU2l6ZSk7XG4gICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBuZXcgVWludDhBcnJheShjaHVuay5kYXRhKTtcbiAgICAgICAgICAgICAgZGF0YS5zZXQobmV3IFVpbnQ4QXJyYXkoZnJhbWUsIDAsIGZyYW1lU2l6ZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBjb250cm9sbGVyLmVucXVldWUoY2h1bmspO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHN0cmVhbXMucmVhZGFibGUucGlwZVRocm91Z2godHJhbnNmb3JtZXIpLnBpcGVUbyhzdHJlYW1zLndyaXRhYmxlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yZWNlaXZlckNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWw7XG4gICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgIC8vIGNvbnN0IHdvcmtlciA9IG5ldyBXb3JrZXIoJy9kaXN0L3NjcmlwdC10cmFuc2Zvcm0td29ya2VyLmpzJyk7XG4gICAgICBjb25zdCB3b3JrZXIgPSBuZXcgV29ya2VyKCcuL2Rpc3Qvc2NyaXB0LXRyYW5zZm9ybS13b3JrZXIuanMnKTtcbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gd29ya2VyLm9ubWVzc2FnZSA9IChldmVudCkgPT4ge1xuICAgICAgICBpZiAoZXZlbnQuZGF0YSA9PT0gJ3JlZ2lzdGVyZWQnKSB7XG5cbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCByZWNlaXZlclRyYW5zZm9ybSA9IG5ldyBSVENSdHBTY3JpcHRUcmFuc2Zvcm0od29ya2VyLCB7IG5hbWU6ICdpbmNvbWluZycsIHBvcnQ6IHRoYXQucmVjZWl2ZXJDaGFubmVsLnBvcnQyIH0sIFt0aGF0LnJlY2VpdmVyQ2hhbm5lbC5wb3J0Ml0pO1xuXG4gICAgICByZWNlaXZlclRyYW5zZm9ybS5wb3J0ID0gdGhhdC5yZWNlaXZlckNoYW5uZWwucG9ydDE7XG4gICAgICByZWNlaXZlci50cmFuc2Zvcm0gPSByZWNlaXZlclRyYW5zZm9ybTtcbiAgICAgIHJlY2VpdmVyVHJhbnNmb3JtLnBvcnQub25tZXNzYWdlID0gZSA9PiB7XG4gICAgICAgIGlmIChlLmRhdGEubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHdpbmRvdy5yZW1vdGVNb2NhcChlLmRhdGEgKyBcIixcIiArIGNsaWVudElkKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiB3b3JrZXIub25tZXNzYWdlID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldmVudC5kYXRhID09PSAnc3RhcnRlZCcpIHtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHJlYWRTdGF0cygpIHtcbiAgICBpZiAoIXRoaXMuYWdvcmFDbGllbnQuX3VzZXJzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGZvciAodmFyIHUgPSAwOyB1IDwgdGhpcy5hZ29yYUNsaWVudC5fdXNlcnMubGVuZ3RoOyB1KyspIHtcbiAgICAgIGlmICh0aGlzLmFnb3JhQ2xpZW50Ll91c2Vyc1t1XS5hdWRpb1RyYWNrICYmIHRoaXMuYWdvcmFDbGllbnQuX3VzZXJzW3VdLmF1ZGlvVHJhY2suX21lZGlhU3RyZWFtVHJhY2spIHtcbiAgICAgICAgYXdhaXQgdGhpcy5hZ29yYUNsaWVudC5fcDJwQ2hhbm5lbC5jb25uZWN0aW9uLnBlZXJDb25uZWN0aW9uLmdldFN0YXRzKHRoaXMuYWdvcmFDbGllbnQuX3VzZXJzW3VdLmF1ZGlvVHJhY2suX21lZGlhU3RyZWFtVHJhY2spLnRoZW4oYXN5bmMgc3RhdHMgPT4ge1xuICAgICAgICAgIGF3YWl0IHN0YXRzLmZvckVhY2gocmVwb3J0ID0+IHtcbiAgICAgICAgICAgIGlmIChyZXBvcnQudHlwZSA9PT0gXCJpbmJvdW5kLXJ0cFwiICYmIHJlcG9ydC5raW5kID09PSBcImF1ZGlvXCIpIHtcbiAgICAgICAgICAgICAgdmFyIGppdHRlckJ1ZmZlckRlbGF5ID0gKHJlcG9ydFtcImppdHRlckJ1ZmZlckRlbGF5XCJdIC8gcmVwb3J0W1wiaml0dGVyQnVmZmVyRW1pdHRlZENvdW50XCJdKS50b0ZpeGVkKDMpO1xuICAgICAgICAgICAgICBpZiAoIWlzTmFOKGppdHRlckJ1ZmZlckRlbGF5KSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYXVkaW9KaXR0ZXJbdGhpcy5hZ29yYUNsaWVudC5fdXNlcnNbdV0udWlkXSA9IGppdHRlckJ1ZmZlckRlbGF5ICogMTAwMDtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmF1ZGlvSml0dGVyW3RoaXMuYWdvcmFDbGllbnQuX3VzZXJzW3VdLnVpZF0gPSA4MDsgLy8gZGVmYXVsdCBtc1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlUlRNKHNlbmRlcklkLCB0ZXh0KSB7XG4gICAgY29uc3QgZGF0YSA9IEpTT04ucGFyc2UodGV4dCk7XG4gICAgY29uc29sZS5sb2coXCJCVzc1IGhhbmRsZVJUTVwiLCBzZW5kZXJJZCwgZGF0YSk7XG4gICAgLy9jb25zb2xlLmVycm9yKCdtZXNzYWdlTGlzdGVuZXIgMicsIHdpbmRvdy5BZ29yYVJ0Y0FkYXB0ZXIubWVzc2FnZUxpc3RlbmVyKTtcbiAgICB3aW5kb3cuQWdvcmFSdGNBZGFwdGVyLm1lc3NhZ2VMaXN0ZW5lcihzZW5kZXJJZCwgZGF0YS5kYXRhVHlwZSwgZGF0YS5kYXRhKTtcbiAgfVxuXG4gIGhhbmRsZVJUTTIoc2VuZGVySWQsIHRleHQpIHtcbiAgICBjb25zdCBtc2cgPSBKU09OLnBhcnNlKHRleHQpO1xuICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKG1zZy5tZXNzYWdlKTtcbiAgICAvL2NvbnNvbGUud2FybihcIkJXNzUgaGFuZGxlUlRNMlwiLCBzZW5kZXJJZCwgZGF0YS5kYXRhVHlwZSwgZGF0YS5kYXRhKTtcbiAgICAvL2NvbnNvbGUuZXJyb3IoJ21lc3NhZ2VMaXN0ZW5lciAyJywgd2luZG93LkFnb3JhUnRjQWRhcHRlci5tZXNzYWdlTGlzdGVuZXIpO1xuICAgIHdpbmRvdy5BZ29yYVJ0Y0FkYXB0ZXIubWVzc2FnZUxpc3RlbmVyKHNlbmRlcklkLCBkYXRhLmRhdGFUeXBlLCBkYXRhLmRhdGEpO1xuICB9XG5cbiAgc2VuZERhdGEoY2xpZW50SWQsIGRhdGFUeXBlLCBkYXRhKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzc1IHNlbmREYXRhIFwiLCBjbGllbnRJZCwgZGF0YVR5cGUsIGRhdGEpO1xuICAgIHJldHVybiBzZW5kRGF0YUd1YXJhbnRlZWQoY2xpZW50SWQsIGRhdGFUeXBlLCBkYXRhKTtcbiAgfVxuXG4gIHNlbmREYXRhR3VhcmFudGVlZChkZXN0aW5hdGlvbkNsaWVudElkLCBkYXRhVHlwZSwgZGF0YSkge1xuICAgIGlmICh0aGlzLmFnb3JhUlRNKSB7XG4gICAgICAgIHRoaXMuc2VuZEFnb3JhUlRNKGRhdGFUeXBlLCBkYXRhKTsgICAgICBcbiAgICB9IGVsc2Uge1xuICAgICAgIHRoaXMuYnJvYWRjYXN0RGF0YUd1YXJhbnRlZWQoZGF0YVR5cGUsIGRhdGEpO1xuICAgIH1cbiAgfVxuXG4gIGJyb2FkY2FzdERhdGEoZGF0YVR5cGUsIGRhdGEpIHtcbiAgICByZXR1cm4gdGhpcy5icm9hZGNhc3REYXRhR3VhcmFudGVlZChkYXRhVHlwZSwgZGF0YSk7XG4gIH1cblxuICBhc3luYyBzZW5kQWdvcmFSVE0oZGF0YVR5cGUsIGRhdGEpIHtcbiAgICBpZiAoIXRoaXMuc3luY09iamVjdHMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAvLyBjb25zb2xlLndhcm4oJ3NlbmRpbmcgQWdvcmEgUlRNJyxkYXRhVHlwZSwgZGF0YSk7XG4gICAgbGV0IG1zZyA9IEpTT04uc3RyaW5naWZ5KHsgZGF0YVR5cGU6IGRhdGFUeXBlLCBkYXRhOiBkYXRhIH0pO1xuICAgIGlmICh0aGlzLmFnb3JhUlRNMikge1xuICAgICAgaWYgKHRoaXMucnRtQ2xpZW50ICE9IG51bGwpIHsgICBcbiAgICAgICAgY29uc3QgcGF5bG9hZCA9IHsgdHlwZTogXCJ0ZXh0XCIsIG1lc3NhZ2U6IG1zZyB9O1xuICAgICAgICBjb25zdCBwdWJsaXNoTWVzc2FnZSA9IEpTT04uc3RyaW5naWZ5KHBheWxvYWQpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGF3YWl0IHRoaXMucnRtQ2xpZW50LnB1Ymxpc2goXG4gICAgICAgICAgICB0aGlzLnJvb20sXG4gICAgICAgICAgICBwdWJsaXNoTWVzc2FnZVxuICAgICAgICAgICk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvL2NvbnNvbGUuZXJyb3IoXCJ1bmFibGUgdG8gc2VuZCBtZXNzYWdlIFJUTTIgXCIsZGF0YVR5cGUsZGF0YSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLnJ0bUNoYW5uZWwgIT0gbnVsbCkgeyAgIFxuICAgICAgICB0aGlzLnJ0bUNoYW5uZWwuc2VuZE1lc3NhZ2UoeyB0ZXh0OiBtc2cgfSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJCVzc1IGJyb2FkY2FzdERhdGFHdWFyYW50ZWVkIHNlbnQgXCIsIGRhdGFUeXBlLCBkYXRhKTtcbiAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Fnb3JhUlRNIHNlbmQgZmFpbHVyZSBmb3IgcnRtQ2hhbm5lbCcsIGVycm9yKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvL2NvbnNvbGUuZXJyb3IoXCJ1bmFibGUgdG8gc2VuZCBtZXNzYWdlIFJUTTEgXCIsZGF0YVR5cGUsZGF0YSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYnJvYWRjYXN0RGF0YUd1YXJhbnRlZWQoZGF0YVR5cGUsIGRhdGEpIHtcbiAgICBpZiAodGhpcy5hZ29yYVJUTSkge1xuICAgICAgICB0aGlzLnNlbmRBZ29yYVJUTShkYXRhVHlwZSwgZGF0YSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGRlc3RpbmF0aW9uID0geyB0YXJnZXRSb29tOiB0aGlzLnJvb20gfTtcbiAgICAgICAgdGhpcy5lYXN5cnRjLnNlbmREYXRhV1MoZGVzdGluYXRpb24sIGRhdGFUeXBlLCBkYXRhKTsgXG4gICAgfVxuICB9XG5cbiAgZ2V0Q29ubmVjdFN0YXR1cyhjbGllbnRJZCkge1xuICAgIGlmICghdGhpcy5lYXN5cnRjKXtcbiAgICAgIC8vY29uc29sZS50cmFjZSgpO1xuICAgICAgcmV0dXJuICBOQUYuYWRhcHRlcnMuSVNfQ09OTkVDVEVEO1xuICAgIH1cbiAgICB2YXIgc3RhdHVzID0gdGhpcy5lYXN5cnRjLmdldENvbm5lY3RTdGF0dXMoY2xpZW50SWQpO1xuXG4gICAgaWYgKHN0YXR1cyA9PSB0aGlzLmVhc3lydGMuSVNfQ09OTkVDVEVEKSB7XG4gICAgICByZXR1cm4gTkFGLmFkYXB0ZXJzLklTX0NPTk5FQ1RFRDtcbiAgICB9IGVsc2UgaWYgKHN0YXR1cyA9PSB0aGlzLmVhc3lydGMuTk9UX0NPTk5FQ1RFRCkge1xuICAgICAgcmV0dXJuIE5BRi5hZGFwdGVycy5OT1RfQ09OTkVDVEVEO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gTkFGLmFkYXB0ZXJzLkNPTk5FQ1RJTkc7XG4gICAgfVxuICB9XG5cbiAgZ2V0TWVkaWFTdHJlYW0oY2xpZW50SWQsIHN0cmVhbU5hbWUgPSBcImF1ZGlvXCIpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgZ2V0TWVkaWFTdHJlYW0gXCIsIGNsaWVudElkLCBzdHJlYW1OYW1lKTtcbiAgICBpZiAodGhpcy5tZWRpYVN0cmVhbXNbY2xpZW50SWRdICYmIHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXVtzdHJlYW1OYW1lXSkge1xuICAgICAgTkFGLmxvZy53cml0ZShgQWxyZWFkeSBoYWQgJHtzdHJlYW1OYW1lfSBmb3IgJHtjbGllbnRJZH1gKTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5tZWRpYVN0cmVhbXNbY2xpZW50SWRdW3N0cmVhbU5hbWVdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgTkFGLmxvZy53cml0ZShgV2FpdGluZyBvbiAke3N0cmVhbU5hbWV9IGZvciAke2NsaWVudElkfWApO1xuXG4gICAgICAvLyBDcmVhdGUgaW5pdGlhbCBwZW5kaW5nTWVkaWFSZXF1ZXN0cyB3aXRoIGF1ZGlvfHZpZGVvIGFsaWFzXG4gICAgICBpZiAoIXRoaXMucGVuZGluZ01lZGlhUmVxdWVzdHMuaGFzKGNsaWVudElkKSkge1xuICAgICAgICBjb25zdCBwZW5kaW5nTWVkaWFSZXF1ZXN0cyA9IHt9O1xuXG4gICAgICAgIGNvbnN0IGF1ZGlvUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0cy5hdWRpbyA9IHsgcmVzb2x2ZSwgcmVqZWN0IH07XG4gICAgICAgIH0pLmNhdGNoKGUgPT4gTkFGLmxvZy53YXJuKGAke2NsaWVudElkfSBnZXRNZWRpYVN0cmVhbSBBdWRpbyBFcnJvcmAsIGUpKTtcblxuICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0cy5hdWRpby5wcm9taXNlID0gYXVkaW9Qcm9taXNlO1xuXG4gICAgICAgIGNvbnN0IHZpZGVvUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0cy52aWRlbyA9IHsgcmVzb2x2ZSwgcmVqZWN0IH07XG4gICAgICAgIH0pLmNhdGNoKGUgPT4gTkFGLmxvZy53YXJuKGAke2NsaWVudElkfSBnZXRNZWRpYVN0cmVhbSBWaWRlbyBFcnJvcmAsIGUpKTtcbiAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHMudmlkZW8ucHJvbWlzZSA9IHZpZGVvUHJvbWlzZTtcblxuICAgICAgICB0aGlzLnBlbmRpbmdNZWRpYVJlcXVlc3RzLnNldChjbGllbnRJZCwgcGVuZGluZ01lZGlhUmVxdWVzdHMpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwZW5kaW5nTWVkaWFSZXF1ZXN0cyA9IHRoaXMucGVuZGluZ01lZGlhUmVxdWVzdHMuZ2V0KGNsaWVudElkKTtcblxuICAgICAgLy8gQ3JlYXRlIGluaXRpYWwgcGVuZGluZ01lZGlhUmVxdWVzdHMgd2l0aCBzdHJlYW1OYW1lXG4gICAgICBpZiAoIXBlbmRpbmdNZWRpYVJlcXVlc3RzW3N0cmVhbU5hbWVdKSB7XG4gICAgICAgIGNvbnN0IHN0cmVhbVByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHNbc3RyZWFtTmFtZV0gPSB7IHJlc29sdmUsIHJlamVjdCB9O1xuICAgICAgICB9KS5jYXRjaChlID0+IE5BRi5sb2cud2FybihgJHtjbGllbnRJZH0gZ2V0TWVkaWFTdHJlYW0gXCIke3N0cmVhbU5hbWV9XCIgRXJyb3JgLCBlKSk7XG4gICAgICAgIHBlbmRpbmdNZWRpYVJlcXVlc3RzW3N0cmVhbU5hbWVdLnByb21pc2UgPSBzdHJlYW1Qcm9taXNlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5wZW5kaW5nTWVkaWFSZXF1ZXN0cy5nZXQoY2xpZW50SWQpW3N0cmVhbU5hbWVdLnByb21pc2U7XG4gICAgfVxuICB9XG5cbiAgc2V0TWVkaWFTdHJlYW0oY2xpZW50SWQsIHN0cmVhbSwgc3RyZWFtTmFtZSkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXRNZWRpYVN0cmVhbSBcIiwgY2xpZW50SWQsIHN0cmVhbSwgc3RyZWFtTmFtZSk7XG4gICAgY29uc3QgcGVuZGluZ01lZGlhUmVxdWVzdHMgPSB0aGlzLnBlbmRpbmdNZWRpYVJlcXVlc3RzLmdldChjbGllbnRJZCk7IC8vIHJldHVybiB1bmRlZmluZWQgaWYgdGhlcmUgaXMgbm8gZW50cnkgaW4gdGhlIE1hcFxuICAgIGNvbnN0IGNsaWVudE1lZGlhU3RyZWFtcyA9IHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXSA9IHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXSB8fCB7fTtcblxuICAgIGlmIChzdHJlYW1OYW1lID09PSAnZGVmYXVsdCcpIHtcbiAgICAgIC8vIFNhZmFyaSBkb2Vzbid0IGxpa2UgaXQgd2hlbiB5b3UgdXNlIGEgbWl4ZWQgbWVkaWEgc3RyZWFtIHdoZXJlIG9uZSBvZiB0aGUgdHJhY2tzIGlzIGluYWN0aXZlLCBzbyB3ZVxuICAgICAgLy8gc3BsaXQgdGhlIHRyYWNrcyBpbnRvIHR3byBzdHJlYW1zLlxuICAgICAgLy8gQWRkIG1lZGlhU3RyZWFtcyBhdWRpbyBzdHJlYW1OYW1lIGFsaWFzXG4gICAgICBjb25zdCBhdWRpb1RyYWNrcyA9IHN0cmVhbS5nZXRBdWRpb1RyYWNrcygpO1xuICAgICAgaWYgKGF1ZGlvVHJhY2tzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgYXVkaW9TdHJlYW0gPSBuZXcgTWVkaWFTdHJlYW0oKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhdWRpb1RyYWNrcy5mb3JFYWNoKHRyYWNrID0+IGF1ZGlvU3RyZWFtLmFkZFRyYWNrKHRyYWNrKSk7XG4gICAgICAgICAgY2xpZW50TWVkaWFTdHJlYW1zLmF1ZGlvID0gYXVkaW9TdHJlYW07XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBOQUYubG9nLndhcm4oYCR7Y2xpZW50SWR9IHNldE1lZGlhU3RyZWFtIFwiYXVkaW9cIiBhbGlhcyBFcnJvcmAsIGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVzb2x2ZSB0aGUgcHJvbWlzZSBmb3IgdGhlIHVzZXIncyBtZWRpYSBzdHJlYW0gYXVkaW8gYWxpYXMgaWYgaXQgZXhpc3RzLlxuICAgICAgICBpZiAocGVuZGluZ01lZGlhUmVxdWVzdHMpIHBlbmRpbmdNZWRpYVJlcXVlc3RzLmF1ZGlvLnJlc29sdmUoYXVkaW9TdHJlYW0pO1xuICAgICAgfVxuXG4gICAgICAvLyBBZGQgbWVkaWFTdHJlYW1zIHZpZGVvIHN0cmVhbU5hbWUgYWxpYXNcbiAgICAgIGNvbnN0IHZpZGVvVHJhY2tzID0gc3RyZWFtLmdldFZpZGVvVHJhY2tzKCk7XG4gICAgICBpZiAodmlkZW9UcmFja3MubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCB2aWRlb1N0cmVhbSA9IG5ldyBNZWRpYVN0cmVhbSgpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHZpZGVvVHJhY2tzLmZvckVhY2godHJhY2sgPT4gdmlkZW9TdHJlYW0uYWRkVHJhY2sodHJhY2spKTtcbiAgICAgICAgICBjbGllbnRNZWRpYVN0cmVhbXMudmlkZW8gPSB2aWRlb1N0cmVhbTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIE5BRi5sb2cud2FybihgJHtjbGllbnRJZH0gc2V0TWVkaWFTdHJlYW0gXCJ2aWRlb1wiIGFsaWFzIEVycm9yYCwgZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZXNvbHZlIHRoZSBwcm9taXNlIGZvciB0aGUgdXNlcidzIG1lZGlhIHN0cmVhbSB2aWRlbyBhbGlhcyBpZiBpdCBleGlzdHMuXG4gICAgICAgIGlmIChwZW5kaW5nTWVkaWFSZXF1ZXN0cykgcGVuZGluZ01lZGlhUmVxdWVzdHMudmlkZW8ucmVzb2x2ZSh2aWRlb1N0cmVhbSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNsaWVudE1lZGlhU3RyZWFtc1tzdHJlYW1OYW1lXSA9IHN0cmVhbTtcblxuICAgICAgLy8gUmVzb2x2ZSB0aGUgcHJvbWlzZSBmb3IgdGhlIHVzZXIncyBtZWRpYSBzdHJlYW0gYnkgU3RyZWFtTmFtZSBpZiBpdCBleGlzdHMuXG4gICAgICBpZiAocGVuZGluZ01lZGlhUmVxdWVzdHMgJiYgcGVuZGluZ01lZGlhUmVxdWVzdHNbc3RyZWFtTmFtZV0pIHtcbiAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHNbc3RyZWFtTmFtZV0ucmVzb2x2ZShzdHJlYW0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldEludEJ5dGVzKHgpIHtcbiAgICB2YXIgYnl0ZXMgPSBbXTtcbiAgICB2YXIgaSA9IHRoaXMuQ3VzdG9tRGF0TGVuZ3RoQnl0ZUNvdW50O1xuICAgIGRvIHtcbiAgICAgIGJ5dGVzWy0taV0gPSB4ICYgKDI1NSk7XG4gICAgICB4ID0geCA+PiA4O1xuICAgIH0gd2hpbGUgKGkpXG4gICAgcmV0dXJuIGJ5dGVzO1xuICB9XG5cbiAgYWRkTG9jYWxNZWRpYVN0cmVhbShzdHJlYW0sIHN0cmVhbU5hbWUpIHtcbiAgICBpZiAoIXRoaXMuZWFzeXJ0Yyl7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBhZGRMb2NhbE1lZGlhU3RyZWFtIFwiLCBzdHJlYW0sIHN0cmVhbU5hbWUpO1xuICAgIGNvbnN0IGVhc3lydGMgPSB0aGlzLmVhc3lydGM7XG4gICAgc3RyZWFtTmFtZSA9IHN0cmVhbU5hbWUgfHwgc3RyZWFtLmlkO1xuICAgIHRoaXMuc2V0TWVkaWFTdHJlYW0oXCJsb2NhbFwiLCBzdHJlYW0sIHN0cmVhbU5hbWUpO1xuICAgIGVhc3lydGMucmVnaXN0ZXIzcmRQYXJ0eUxvY2FsTWVkaWFTdHJlYW0oc3RyZWFtLCBzdHJlYW1OYW1lKTtcblxuICAgIC8vIEFkZCBsb2NhbCBzdHJlYW0gdG8gZXhpc3RpbmcgY29ubmVjdGlvbnNcbiAgICBPYmplY3Qua2V5cyh0aGlzLnJlbW90ZUNsaWVudHMpLmZvckVhY2goY2xpZW50SWQgPT4ge1xuICAgICAgaWYgKGVhc3lydGMuZ2V0Q29ubmVjdFN0YXR1cyhjbGllbnRJZCkgIT09IGVhc3lydGMuTk9UX0NPTk5FQ1RFRCkge1xuICAgICAgICBlYXN5cnRjLmFkZFN0cmVhbVRvQ2FsbChjbGllbnRJZCwgc3RyZWFtTmFtZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICByZW1vdmVMb2NhbE1lZGlhU3RyZWFtKHN0cmVhbU5hbWUpIHtcbiAgICBkZWxldGUgdGhpcy5tZWRpYVN0cmVhbXNbXCJsb2NhbFwiXVtzdHJlYW1OYW1lXTtcbiAgICBpZiAoIXRoaXMuZWFzeXJ0Yyl7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKFwiQlc3MyByZW1vdmVMb2NhbE1lZGlhU3RyZWFtIFwiLCBzdHJlYW1OYW1lKTtcbiAgICB0aGlzLmVhc3lydGMuY2xvc2VMb2NhbE1lZGlhU3RyZWFtKHN0cmVhbU5hbWUpO1xuXG4gIH1cblxuICBlbmFibGVNaWNyb3Bob25lKGVuYWJsZWQpIHtcbiAgICBpZiAoIXRoaXMuZWFzeXJ0Yyl7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVNaWNyb3Bob25lKGVuYWJsZWQpO1xuICB9XG5cbiAgZW5hYmxlQ2FtZXJhKGVuYWJsZWQpIHtcbiAgICBpZiAoIXRoaXMuZWFzeXJ0Yyl7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVDYW1lcmEoZW5hYmxlZCk7XG4gIH1cblxuICBkaXNjb25uZWN0KCkge1xuICAgIGlmICghdGhpcy5lYXN5cnRjKXtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5lYXN5cnRjLmRpc2Nvbm5lY3QoKTtcbiAgfVxuXG4gIGFzeW5jIGhhbmRsZVVzZXJQdWJsaXNoZWQodXNlciwgbWVkaWFUeXBlKSB7IH1cblxuICBoYW5kbGVVc2VyVW5wdWJsaXNoZWQodXNlciwgbWVkaWFUeXBlKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGhhbmRsZVVzZXJVblB1Ymxpc2hlZCBcIik7XG4gIH1cblxuICBnZXRJbnB1dExldmVsKHRyYWNrKSB7XG4gICAgdmFyIGFuYWx5c2VyID0gdHJhY2suX3NvdXJjZS52b2x1bWVMZXZlbEFuYWx5c2VyLmFuYWx5c2VyTm9kZTtcbiAgICAvL3ZhciBhbmFseXNlciA9IHRyYWNrLl9zb3VyY2UuYW5hbHlzZXJOb2RlO1xuICAgIGNvbnN0IGJ1ZmZlckxlbmd0aCA9IGFuYWx5c2VyLmZyZXF1ZW5jeUJpbkNvdW50O1xuICAgIHZhciBkYXRhID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyTGVuZ3RoKTtcbiAgICBhbmFseXNlci5nZXRCeXRlRnJlcXVlbmN5RGF0YShkYXRhKTtcbiAgICB2YXIgdmFsdWVzID0gMDtcbiAgICB2YXIgYXZlcmFnZTtcbiAgICB2YXIgbGVuZ3RoID0gZGF0YS5sZW5ndGg7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFsdWVzICs9IGRhdGFbaV07XG4gICAgfVxuICAgIGF2ZXJhZ2UgPSBNYXRoLmZsb29yKHZhbHVlcyAvIGxlbmd0aCk7XG4gICAgcmV0dXJuIGF2ZXJhZ2U7XG4gIH1cblxuICAgZ2VuZXJhdGVJZChsZW5ndGgpIHtcbiAgICBsZXQgcmVzdWx0ID0gJyc7XG4gICAgY29uc3QgY2hhcmFjdGVycyA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSc7XG4gICAgY29uc3QgY2hhcmFjdGVyc0xlbmd0aCA9IGNoYXJhY3RlcnMubGVuZ3RoO1xuICAgIGxldCBjb3VudGVyID0gMDtcbiAgICB3aGlsZSAoY291bnRlciA8IGxlbmd0aCkge1xuICAgICAgcmVzdWx0ICs9IGNoYXJhY3RlcnMuY2hhckF0KE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGNoYXJhY3RlcnNMZW5ndGgpKTtcbiAgICAgIGNvdW50ZXIgKz0gMTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuICB2b2ljZUFjdGl2aXR5RGV0ZWN0aW9uKCkge1xuICAgIGlmICghdGhpcy5fdmFkX2F1ZGlvVHJhY2sgfHwgIXRoaXMuX3ZhZF9hdWRpb1RyYWNrLl9lbmFibGVkKVxuICAgICAgcmV0dXJuO1xuXG4gICAgdmFyIGF1ZGlvTGV2ZWwgPSB0aGlzLmdldElucHV0TGV2ZWwodGhpcy5fdmFkX2F1ZGlvVHJhY2spO1xuICAgIGlmIChhdWRpb0xldmVsIDw9IHRoaXMuX3ZhZF9NYXhCYWNrZ3JvdW5kTm9pc2VMZXZlbCkge1xuICAgICAgaWYgKHRoaXMuX3ZhZF9hdWRpb1NhbXBsZXNBcnIubGVuZ3RoID49IHRoaXMuX3ZhZF9NYXhBdWRpb1NhbXBsZXMpIHtcbiAgICAgICAgdmFyIHJlbW92ZWQgPSB0aGlzLl92YWRfYXVkaW9TYW1wbGVzQXJyLnNoaWZ0KCk7XG4gICAgICAgIHZhciByZW1vdmVkSW5kZXggPSB0aGlzLl92YWRfYXVkaW9TYW1wbGVzQXJyU29ydGVkLmluZGV4T2YocmVtb3ZlZCk7XG4gICAgICAgIGlmIChyZW1vdmVkSW5kZXggPiAtMSkge1xuICAgICAgICAgIHRoaXMuX3ZhZF9hdWRpb1NhbXBsZXNBcnJTb3J0ZWQuc3BsaWNlKHJlbW92ZWRJbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuX3ZhZF9hdWRpb1NhbXBsZXNBcnIucHVzaChhdWRpb0xldmVsKTtcbiAgICAgIHRoaXMuX3ZhZF9hdWRpb1NhbXBsZXNBcnJTb3J0ZWQucHVzaChhdWRpb0xldmVsKTtcbiAgICAgIHRoaXMuX3ZhZF9hdWRpb1NhbXBsZXNBcnJTb3J0ZWQuc29ydCgoYSwgYikgPT4gYSAtIGIpO1xuICAgIH1cbiAgICB2YXIgYmFja2dyb3VuZCA9IE1hdGguZmxvb3IoMyAqIHRoaXMuX3ZhZF9hdWRpb1NhbXBsZXNBcnJTb3J0ZWRbTWF0aC5mbG9vcih0aGlzLl92YWRfYXVkaW9TYW1wbGVzQXJyU29ydGVkLmxlbmd0aCAvIDIpXSAvIDIpO1xuICAgIGlmIChhdWRpb0xldmVsID4gYmFja2dyb3VuZCArIHRoaXMuX3ZhZF9TaWxlbmNlT2ZmZXNldCkge1xuICAgICAgdGhpcy5fdmFkX2V4Y2VlZENvdW50Kys7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3ZhZF9leGNlZWRDb3VudCA9IDA7XG4gICAgfVxuXG5cbiAgICBpZiAodGhpcy5fdmFkX2V4Y2VlZENvdW50ID4gdGhpcy5fdmFkX2V4Y2VlZENvdW50VGhyZXNob2xkTG93KSB7XG4gICAgICAgd2luZG93Ll9zdGF0ZV9zdG9wX2F0ID0gRGF0ZS5ub3coKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fdmFkX2V4Y2VlZENvdW50ID4gdGhpcy5fdmFkX2V4Y2VlZENvdW50VGhyZXNob2xkKSB7XG4gICAgICAvL0Fnb3JhUlRDVXRpbEV2ZW50cy5lbWl0KFwiVm9pY2VBY3Rpdml0eURldGVjdGVkXCIsIHRoaXMuX3ZhZF9leGNlZWRDb3VudCk7XG4gICAgICB0aGlzLl92YWRfZXhjZWVkQ291bnQgPSAwO1xuICAgICAgd2luZG93Ll9zdGF0ZV9zdG9wX2F0ID0gRGF0ZS5ub3coKTtcbiAgICAgIC8vICAgY29uc29sZS5lcnJvcihcIlZBRCBcIixEYXRlLm5vdygpLXdpbmRvdy5fc3RhdGVfc3RvcF9hdCk7XG4gICAgfVxuICB9XG5cbiAgICBhc3luYyBzdG9wTXVzaWMoKSB7XG4gICAgICBpZiAodGhpcy5sb2NhbFRyYWNrcy5tdXNpY1RyYWNrKSB7XG4gICAgICAgIHRoaXMubG9jYWxUcmFja3MubXVzaWNUcmFjay5zdG9wKCk7XG4gICAgICAgIGF3YWl0IHRoaXMuYWdvcmFDbGllbnQudW5wdWJsaXNoKHRoaXMubG9jYWxUcmFja3MubXVzaWNUcmFjayk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgc3RvcFRyYWNrKCkge1xuICAgICAgaWYgKHRoaXMubG9jYWxUcmFja3MubXVzaWNUcmFjaykge1xuICAgICAgICB0aGlzLmxvY2FsVHJhY2tzLm11c2ljVHJhY2suc3RvcCgpO1xuICAgICAgICBhd2FpdCB0aGlzLmFnb3JhQ2xpZW50LnVucHVibGlzaCh0aGlzLmxvY2FsVHJhY2tzLm11c2ljVHJhY2spO1xuICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIHBsYXlNdXNpYyhwYXRoLHZvbHVtZSkge1xuICAgICAgaWYgKHRoaXMubG9jYWxUcmFja3MubXVzaWNUcmFjaykge1xuICAgICAgICB0aGlzLmxvY2FsVHJhY2tzLm11c2ljVHJhY2suc3RvcCgpO1xuICAgICAgICBhd2FpdCB0aGlzLmFnb3JhQ2xpZW50LnVucHVibGlzaCh0aGlzLmxvY2FsVHJhY2tzLm11c2ljVHJhY2spO1xuICAgICAgfVxuICAgICAgdGhpcy5sb2NhbFRyYWNrcy5tdXNpY1RyYWNrID0gYXdhaXQgQWdvcmFSVEMuY3JlYXRlQnVmZmVyU291cmNlQXVkaW9UcmFjayh7XG4gICAgICAgIHNvdXJjZTogcGF0aCwgZW5jb2RlckNvbmZpZzogeyBiaXRyYXRlOjExMCwgc3RlcmVvOnRydWV9XG4gICAgICB9KTtcbiAgICAgIHRoaXMubG9jYWxUcmFja3MubXVzaWNUcmFjay5zZXRWb2x1bWUodm9sdW1lKTtcbiAgICAgIGF3YWl0IHRoaXMuYWdvcmFDbGllbnQucHVibGlzaCh0aGlzLmxvY2FsVHJhY2tzLm11c2ljVHJhY2spO1xuICAgICAgdGhpcy5sb2NhbFRyYWNrcy5tdXNpY1RyYWNrLnBsYXkoKTtcbiAgICAgIHRoaXMubG9jYWxUcmFja3MubXVzaWNUcmFjay5zdGFydFByb2Nlc3NBdWRpb0J1ZmZlcih7IGN5Y2xlOiAxIH0pO1xuICAgIH1cblxuXG4gICAgYXN5bmMgcGxheVRyYWNrKHRyYWNrLHZvbHVtZSkge1xuICAgICAgaWYgKHRoaXMubG9jYWxUcmFja3MubXVzaWNUcmFjaykge1xuICAgICAgICB0aGlzLmxvY2FsVHJhY2tzLm11c2ljVHJhY2suc3RvcCgpO1xuICAgICAgICBhd2FpdCB0aGlzLmFnb3JhQ2xpZW50LnVucHVibGlzaCh0aGlzLmxvY2FsVHJhY2tzLm11c2ljVHJhY2spO1xuICAgICAgfVxuICAgICAgdGhpcy5sb2NhbFRyYWNrcy5tdXNpY1RyYWNrID0gYXdhaXQgQWdvcmFSVEMuY3JlYXRlQ3VzdG9tQXVkaW9UcmFjayh7XG4gICAgICAgIG1lZGlhU3RyZWFtVHJhY2s6IHRyYWNrXG4gICAgICB9KTtcbiAgICAgIHRoaXMubG9jYWxUcmFja3MubXVzaWNUcmFjay5zZXRWb2x1bWUodm9sdW1lKTtcbiAgICAgIGF3YWl0IHRoaXMuYWdvcmFDbGllbnQucHVibGlzaCh0aGlzLmxvY2FsVHJhY2tzLm11c2ljVHJhY2spO1xuICAgICAgLy90aGlzLmxvY2FsVHJhY2tzLm11c2ljVHJhY2sucGxheSgpO1xuICAgIH1cblxuXG4gIGFzeW5jIGNvbm5lY3RBZ29yYShzdWNjZXNzLCBmYWlsdXJlKSB7XG4gICAgLy8gQWRkIGFuIGV2ZW50IGxpc3RlbmVyIHRvIHBsYXkgcmVtb3RlIHRyYWNrcyB3aGVuIHJlbW90ZSB1c2VyIHB1Ymxpc2hlcy5cbiAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICB0aGlzLmFnb3JhQ2xpZW50ID0gQWdvcmFSVEMuY3JlYXRlQ2xpZW50KHsgbW9kZTogXCJsaXZlXCIsIGNvZGVjOiBcInZwOFwiIH0pO1xuICAgIEFnb3JhUlRDLnNldFBhcmFtZXRlcignU1lOQ19HUk9VUCcsIGZhbHNlKTtcbiAgICAvLyAgICBBZ29yYVJUQy5zZXRQYXJhbWV0ZXIoJ1NVQlNDUklCRV9UV0NDJywgdHJ1ZSk7XG4gICAgc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgdGhpcy5yZWFkU3RhdHMoKTtcbiAgICB9LCAxMDAwKTtcblxuXG4gICAgaWYgKHRoaXMuZW5hYmxlVmlkZW9GaWx0ZXJlZCB8fCB0aGlzLmVuYWJsZVZpZGVvIHx8IHRoaXMuZW5hYmxlQXVkaW8pIHtcbiAgICAgIHRoaXMuYWdvcmFDbGllbnQuc2V0Q2xpZW50Um9sZShcImhvc3RcIik7XG4gICAgfSBcblxuICAgIHRoaXMuYWdvcmFDbGllbnQub24oXCJ1c2VyLWpvaW5lZFwiLCBhc3luYyAodXNlcikgPT4ge1xuICAgICAgaWYgKHRoaXMuYWdvcmFSVE0gJiYgIXRoaXMuYWdvcmFSVE0yKSB7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhcInVzZXItam9pbmVkXCIsIHVzZXIudWlkLCB0aGlzLm9jY3VwYW50TGlzdCk7XG4gICAgICAgIHRoaXMub2NjdXBhbnRMaXN0W3VzZXIudWlkXT11c2VyLnVpZDtcbiAgICAgICAgbGV0IGNvcHk9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5vY2N1cGFudExpc3QpKTtcbiAgICAgICAgdGhpcy5vY2N1cGFudExpc3RlbmVyKGNvcHkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuYWdvcmFDbGllbnQub24oXCJ1c2VyLWxlZnRcIiwgYXN5bmMgKHVzZXIpID0+IHsgICBcbiAgICAgIGlmICh0aGlzLmFnb3JhUlRNICYmICF0aGlzLmFnb3JhUlRNMikgeyAgIFxuICAgICAgICBjb25zb2xlLmluZm8oXCJ1c2VyLWxlZnRcIiwgdXNlci51aWQsIHRoaXMub2NjdXBhbnRMaXN0KTtcbiAgICAgICAgZGVsZXRlIHRoaXMub2NjdXBhbnRMaXN0W3VzZXIudWlkXTtcbiAgICAgICAgbGV0IGNvcHk9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5vY2N1cGFudExpc3QpKTtcbiAgICAgICAgdGhpcy5vY2N1cGFudExpc3RlbmVyKGNvcHkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIFxuICAgIHRoaXMuYWdvcmFDbGllbnQub24oXCJ1c2VyLXB1Ymxpc2hlZFwiLCBhc3luYyAodXNlciwgbWVkaWFUeXBlKSA9PiB7XG5cbiAgICAgIGxldCBjbGllbnRJZCA9IHVzZXIudWlkO1xuICAgICAgY29uc29sZS5sb2coXCJCVzczIGhhbmRsZVVzZXJQdWJsaXNoZWQgXCIgKyBjbGllbnRJZCArIFwiIFwiICsgbWVkaWFUeXBlLCB0aGF0LmFnb3JhQ2xpZW50KTtcbiAgICAgIGF3YWl0IHRoYXQuYWdvcmFDbGllbnQuc3Vic2NyaWJlKHVzZXIsIG1lZGlhVHlwZSk7XG4gICAgICBjb25zb2xlLmxvZyhcIkJXNzMgaGFuZGxlVXNlclB1Ymxpc2hlZDIgXCIgKyBjbGllbnRJZCArIFwiIFwiICsgdGhhdC5hZ29yYUNsaWVudCk7XG5cbiAgICAgIGNvbnN0IHBlbmRpbmdNZWRpYVJlcXVlc3RzID0gdGhhdC5wZW5kaW5nTWVkaWFSZXF1ZXN0cy5nZXQoY2xpZW50SWQpO1xuICAgICAgY29uc3QgY2xpZW50TWVkaWFTdHJlYW1zID0gdGhhdC5tZWRpYVN0cmVhbXNbY2xpZW50SWRdID0gdGhhdC5tZWRpYVN0cmVhbXNbY2xpZW50SWRdIHx8IHt9O1xuXG4gICAgICBpZiAobWVkaWFUeXBlID09PSAnYXVkaW8nKSB7XG4gICAgICAgIC8vaWYgKG5hdmlnYXRvci5wbGF0Zm9ybS5pbmRleE9mKCdpUGFkJyk+LTEgfHwgbmF2aWdhdG9yLnBsYXRmb3JtLmluZGV4T2YoJ2lQaG9uZScpPi0xKVxuICAgICAgICAvL3sgLy8gdG9vIHF1aWV0XG4gICAgICAgIC8vICAgICAgICAgIGNvbnNvbGUubG9nKFwiaU9TIHBsYXkgc3BlYWtlclwiKTtcbiAgICAgICAgICB1c2VyLmF1ZGlvVHJhY2sucGxheSgpO1xuICAgICAgICAgIHRoYXQucmVtb3RlQXVkaW9UcmFjaz11c2VyLmF1ZGlvVHJhY2s7XG4gICAgICAgIC8vICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGF1ZGlvU3RyZWFtID0gbmV3IE1lZGlhU3RyZWFtKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwidXNlci5hdWRpb1RyYWNrIFwiLCB1c2VyLmF1ZGlvVHJhY2suX21lZGlhU3RyZWFtVHJhY2spO1xuICAgICAgICBhdWRpb1N0cmVhbS5hZGRUcmFjayh1c2VyLmF1ZGlvVHJhY2suX21lZGlhU3RyZWFtVHJhY2spO1xuICAgICAgICBjbGllbnRNZWRpYVN0cmVhbXMuYXVkaW8gPSBhdWRpb1N0cmVhbTtcbiAgICAgICAgaWYgKHBlbmRpbmdNZWRpYVJlcXVlc3RzKSBwZW5kaW5nTWVkaWFSZXF1ZXN0cy5hdWRpby5yZXNvbHZlKGF1ZGlvU3RyZWFtKTtcbiAgICAgIH1cblxuICAgICAgbGV0IHZpZGVvU3RyZWFtID0gbnVsbDtcbiAgICAgIGlmIChtZWRpYVR5cGUgPT09ICd2aWRlbycpIHtcbiAgICAgICAgdmlkZW9TdHJlYW0gPSBuZXcgTWVkaWFTdHJlYW0oKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJ1c2VyLnZpZGVvVHJhY2sgXCIsIHVzZXIudmlkZW9UcmFjay5fbWVkaWFTdHJlYW1UcmFjayk7XG4gICAgICAgIHZpZGVvU3RyZWFtLmFkZFRyYWNrKHVzZXIudmlkZW9UcmFjay5fbWVkaWFTdHJlYW1UcmFjayk7XG4gICAgICAgIGNsaWVudE1lZGlhU3RyZWFtcy52aWRlbyA9IHZpZGVvU3RyZWFtO1xuICAgICAgICBpZiAocGVuZGluZ01lZGlhUmVxdWVzdHMpIHBlbmRpbmdNZWRpYVJlcXVlc3RzLnZpZGVvLnJlc29sdmUodmlkZW9TdHJlYW0pO1xuICAgICAgICAvL3VzZXIudmlkZW9UcmFja1xuICAgICAgfVxuXG4gICAgICBpZiAoY2xpZW50SWQgPT0gJ0NDQycpIHtcbiAgICAgICAgaWYgKG1lZGlhVHlwZSA9PT0gJ3ZpZGVvJykge1xuICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdmlkZW8zNjBcIikuc3JjT2JqZWN0ID0gdmlkZW9TdHJlYW07XG4gICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN2aWRlbzM2MFwiKS5wbGF5KCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1lZGlhVHlwZSA9PT0gJ2F1ZGlvJykge1xuICAgICAgICAgIHVzZXIuYXVkaW9UcmFjay5wbGF5KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChjbGllbnRJZCA9PSAnREREJykge1xuICAgICAgICBpZiAobWVkaWFUeXBlID09PSAndmlkZW8nKSB7XG4gICAgICAgICAgdXNlci52aWRlb1RyYWNrLnBsYXkoXCJ2aWRlbzM2MFwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobWVkaWFUeXBlID09PSAnYXVkaW8nKSB7XG4gICAgICAgICAgdXNlci5hdWRpb1RyYWNrLnBsYXkoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG5cbiAgICAgIGxldCBlbmNfaWQgPSAnbmEnO1xuICAgICAgaWYgKG1lZGlhVHlwZSA9PT0gJ2F1ZGlvJykge1xuICAgICAgICBlbmNfaWQgPSB1c2VyLmF1ZGlvVHJhY2suX21lZGlhU3RyZWFtVHJhY2suaWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBlbmNfaWQ9dXNlci52aWRlb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrLmlkO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwYyA9IHRoaXMuYWdvcmFDbGllbnQuX3AycENoYW5uZWwuY29ubmVjdGlvbi5wZWVyQ29ubmVjdGlvbjtcbiAgICAgIGNvbnN0IHJlY2VpdmVycyA9IHBjLmdldFJlY2VpdmVycygpO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZWNlaXZlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHJlY2VpdmVyc1tpXS50cmFjayAmJiByZWNlaXZlcnNbaV0udHJhY2suaWQgPT09IGVuY19pZCkge1xuICAgICAgICAgIC8vY29uc29sZS53YXJuKFwiTWF0Y2hcIiwgbWVkaWFUeXBlLCBlbmNfaWQpO1xuICAgICAgICAgIC8vICAgICAgICAgIHRoaXMucl9yZWNlaXZlcj1yZWNlaXZlcnNbaV07XG4gICAgICAgICAgLy90aGlzLnJfY2xpZW50SWQ9Y2xpZW50SWQ7XG4gICAgICAgICAgdGhpcy5jcmVhdGVEZWNvZGVyKHJlY2VpdmVyc1tpXSwgY2xpZW50SWQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmFnb3JhQ2xpZW50Lm9uKFwidXNlci11bnB1Ymxpc2hlZFwiLCB0aGF0LmhhbmRsZVVzZXJVbnB1Ymxpc2hlZCk7XG5cbiAgICBjb25zb2xlLmxvZyhcImNvbm5lY3QgYWdvcmEgXCIgKyB0aGlzLmNsaWVudElkKTtcbiAgICAvLyBKb2luIGEgY2hhbm5lbCBhbmQgY3JlYXRlIGxvY2FsIHRyYWNrcy4gQmVzdCBwcmFjdGljZSBpcyB0byB1c2UgUHJvbWlzZS5hbGwgYW5kIHJ1biB0aGVtIGNvbmN1cnJlbnRseS5cbiAgICAvLyBvXG5cbiAgICBpZiAodGhpcy5lbmFibGVBdmF0YXIpIHtcbiAgICAgIHZhciBzdHJlYW0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbnZhc1wiKS5jYXB0dXJlU3RyZWFtKDMwKTtcbiAgICAgIFt0aGlzLnVzZXJpZCwgdGhpcy5sb2NhbFRyYWNrcy5hdWRpb1RyYWNrLCB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2tdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICB0aGlzLmFnb3JhQ2xpZW50LmpvaW4odGhpcy5hcHBpZCwgdGhpcy5yb29tLCB0aGlzLnRva2VuIHx8IG51bGwsIHRoaXMuY2xpZW50SWQgfHwgbnVsbCksXG4gICAgICAgIEFnb3JhUlRDLmNyZWF0ZU1pY3JvcGhvbmVBdWRpb1RyYWNrKCksIEFnb3JhUlRDLmNyZWF0ZUN1c3RvbVZpZGVvVHJhY2soeyBtZWRpYVN0cmVhbVRyYWNrOiBzdHJlYW0uZ2V0VmlkZW9UcmFja3MoKVswXSB9KV0pO1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLmVuYWJsZVZpZGVvRmlsdGVyZWQgJiYgdGhpcy5lbmFibGVBdWRpbykge1xuICAgICAgdmFyIHN0cmVhbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2FudmFzX3NlY3JldFwiKS5jYXB0dXJlU3RyZWFtKDMwKTtcbiAgICAgIFt0aGlzLnVzZXJpZCwgdGhpcy5sb2NhbFRyYWNrcy5hdWRpb1RyYWNrLCB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2tdID0gYXdhaXQgUHJvbWlzZS5hbGwoW3RoaXMuYWdvcmFDbGllbnQuam9pbih0aGlzLmFwcGlkLCB0aGlzLnJvb20sIHRoaXMudG9rZW4gfHwgbnVsbCwgdGhpcy5jbGllbnRJZCB8fCBudWxsKSwgQWdvcmFSVEMuY3JlYXRlTWljcm9waG9uZUF1ZGlvVHJhY2soKSwgQWdvcmFSVEMuY3JlYXRlQ3VzdG9tVmlkZW9UcmFjayh7IG1lZGlhU3RyZWFtVHJhY2s6IHN0cmVhbS5nZXRWaWRlb1RyYWNrcygpWzBdIH0pXSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRoaXMuZW5hYmxlVmlkZW8gJiYgdGhpcy5lbmFibGVBdWRpbykge1xuICAgICAgW3RoaXMudXNlcmlkLCB0aGlzLmxvY2FsVHJhY2tzLmF1ZGlvVHJhY2ssIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFja10gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgIHRoaXMuYWdvcmFDbGllbnQuam9pbih0aGlzLmFwcGlkLCB0aGlzLnJvb20sIHRoaXMudG9rZW4gfHwgbnVsbCwgdGhpcy5jbGllbnRJZCB8fCBudWxsKSxcbiAgICAgICAgQWdvcmFSVEMuY3JlYXRlTWljcm9waG9uZUF1ZGlvVHJhY2soKSwgQWdvcmFSVEMuY3JlYXRlQ2FtZXJhVmlkZW9UcmFjayh7IGVuY29kZXJDb25maWc6ICc0ODBwXzInIH0pXSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmVuYWJsZVZpZGVvKSB7XG4gICAgICBbdGhpcy51c2VyaWQsIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFja10gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgIC8vIEpvaW4gdGhlIGNoYW5uZWwuXG4gICAgICAgIHRoaXMuYWdvcmFDbGllbnQuam9pbih0aGlzLmFwcGlkLCB0aGlzLnJvb20sIHRoaXMudG9rZW4gfHwgbnVsbCwgdGhpcy5jbGllbnRJZCB8fCBudWxsKSwgQWdvcmFSVEMuY3JlYXRlQ2FtZXJhVmlkZW9UcmFjayhcIjM2MHBfNFwiKV0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5lbmFibGVBdWRpbykge1xuICAgICAgbGV0IGF1ZGlvX3RyYWNrO1xuICAgICAgaWYgKHdpbmRvdy5ndW1fc3RyZWFtKSB7IC8vIGF2b2lkIGRvdWJsZSBhbGxvdyBpT3NcbiAgICAgICAvLyBhdWRpb190cmFjayA9IEFnb3JhUlRDLmNyZWF0ZUN1c3RvbUF1ZGlvVHJhY2soeyBtZWRpYVN0cmVhbVRyYWNrOiB3aW5kb3cuZ3VtX3N0cmVhbS5nZXRBdWRpb1RyYWNrcygpWzBdLCAgZW5jb2RlckNvbmZpZzogeyBiaXRyYXRlOjE4MCwgc3RlcmVvOmZhbHNlfSB9KTtcbiAgICAgICBhdWRpb190cmFjayA9IEFnb3JhUlRDLmNyZWF0ZUN1c3RvbUF1ZGlvVHJhY2soeyBtZWRpYVN0cmVhbVRyYWNrOiB3aW5kb3cuZ3VtX3N0cmVhbS5nZXRBdWRpb1RyYWNrcygpWzBdLCAgZW5jb2RlckNvbmZpZzogeyBiaXRyYXRlOjE4MCwgc3RlcmVvOmZhbHNlfSB9KTtcbiAgICAgICAgLy9jb25zb2xlLndhcm4oYXVkaW9fdHJhY2ssIFwiYXVkaW9fdHJhY2tcIik7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgLy9hdWRpb190cmFjayA9IEFnb3JhUlRDLmNyZWF0ZU1pY3JvcGhvbmVBdWRpb1RyYWNrKHtlbmNvZGVyQ29uZmlnOiB7Yml0cmF0ZToxMjgsIHN0ZXJlbzp0cnVlfX0pXG4gICAgICAgIGF1ZGlvX3RyYWNrID0gQWdvcmFSVEMuY3JlYXRlTWljcm9waG9uZUF1ZGlvVHJhY2soKTtcbiAgICAgIH1cblxuICAgICAgW3RoaXMudXNlcmlkLCB0aGlzLmxvY2FsVHJhY2tzLmF1ZGlvVHJhY2tdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAvLyBKb2luIHRoZSBjaGFubmVsLlxuICAgICAgICB0aGlzLmFnb3JhQ2xpZW50LmpvaW4odGhpcy5hcHBpZCwgdGhpcy5yb29tLCB0aGlzLnRva2VuIHx8IG51bGwsIHRoaXMuY2xpZW50SWQgfHwgbnVsbCksIGF1ZGlvX3RyYWNrXSk7XG4gICAgICAvL2NvbnNvbGUubG9nKFwiY3JlYXRlTWljcm9waG9uZUF1ZGlvVHJhY2tcIik7XG4gICAgICB0aGlzLl92YWRfYXVkaW9UcmFjayA9IHRoaXMubG9jYWxUcmFja3MuYXVkaW9UcmFjaztcbiAgICAgIGlmICghdGhpcy5fdm9pY2VBY3Rpdml0eURldGVjdGlvbkludGVydmFsKSB7XG4gICAgICAgIHRoaXMuX3ZvaWNlQWN0aXZpdHlEZXRlY3Rpb25JbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICB0aGlzLnZvaWNlQWN0aXZpdHlEZXRlY3Rpb24oKTtcbiAgICAgICAgfSwgdGhpcy5fdm9pY2VBY3Rpdml0eURldGVjdGlvbkZyZXF1ZW5jeSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudXNlcmlkID0gYXdhaXQgdGhpcy5hZ29yYUNsaWVudC5qb2luKHRoaXMuYXBwaWQsIHRoaXMucm9vbSwgdGhpcy50b2tlbiB8fCBudWxsLCB0aGlzLmNsaWVudElkIHx8IG51bGwpO1xuICAgIH1cblxuICAgIC8vIHNlbGVjdCBmYWNldGltZSBjYW1lcmEgaWYgZXhpc3RzXG4gICAgaWYgKHRoaXMuZW5hYmxlVmlkZW8gJiYgIXRoaXMuZW5hYmxlVmlkZW9GaWx0ZXJlZCkge1xuICAgICAgbGV0IGNhbXMgPSBhd2FpdCBBZ29yYVJUQy5nZXRDYW1lcmFzKCk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNhbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGNhbXNbaV0ubGFiZWwuaW5kZXhPZihcIkZhY2VUaW1lXCIpID09IDApIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcInNlbGVjdCBGYWNlVGltZSBjYW1lcmFcIiwgY2Ftc1tpXS5kZXZpY2VJZCk7XG4gICAgICAgICAgYXdhaXQgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrLnNldERldmljZShjYW1zW2ldLmRldmljZUlkKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmVuYWJsZVZpZGVvICYmIHRoaXMuc2hvd0xvY2FsKSB7XG4gICAgICB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2sucGxheShcImxvY2FsLXBsYXllclwiKTtcbiAgICB9XG5cbiAgICAvLyBFbmFibGUgdmlydHVhbCBiYWNrZ3JvdW5kIE9MRCBNZXRob2RcbiAgICBpZiAodGhpcy5lbmFibGVWaWRlbyAmJiB0aGlzLnZiZzAgJiYgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrKSB7XG4gICAgICBjb25zdCBpbWdFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG4gICAgICBpbWdFbGVtZW50Lm9ubG9hZCA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnZpcnR1YWxCYWNrZ3JvdW5kSW5zdGFuY2UpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIlNFRyBJTklUIFwiLCB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2spO1xuICAgICAgICAgIHRoaXMudmlydHVhbEJhY2tncm91bmRJbnN0YW5jZSA9IGF3YWl0IFNlZ1BsdWdpbi5pbmplY3QodGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrLCBcIi9hc3NldHMvd2FzbXMwXCIpLmNhdGNoKGNvbnNvbGUuZXJyb3IpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiU0VHIElOSVRFRFwiKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZpcnR1YWxCYWNrZ3JvdW5kSW5zdGFuY2Uuc2V0T3B0aW9ucyh7IGVuYWJsZTogdHJ1ZSwgYmFja2dyb3VuZDogaW1nRWxlbWVudCB9KTtcbiAgICAgIH07XG4gICAgICBpbWdFbGVtZW50LnNyYyA9ICdkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUFRQUFBQURDQUlBQUFBN2xqbVJBQUFBRDBsRVFWUjRYbU5nK00rQVFEZzVBT2s5Qy9Wa29tellBQUFBQUVsRlRrU3VRbUNDJztcbiAgICB9XG5cbiAgICAvLyBFbmFibGUgdmlydHVhbCBiYWNrZ3JvdW5kIE5ldyBNZXRob2RcbiAgICBpZiAodGhpcy5lbmFibGVWaWRlbyAmJiB0aGlzLnZiZyAmJiB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2spIHtcblxuICAgICAgdGhpcy5leHRlbnNpb24gPSBuZXcgVmlydHVhbEJhY2tncm91bmRFeHRlbnNpb24oKTtcbiAgICAgIEFnb3JhUlRDLnJlZ2lzdGVyRXh0ZW5zaW9ucyhbdGhpcy5leHRlbnNpb25dKTtcbiAgICAgIHRoaXMucHJvY2Vzc29yID0gdGhpcy5leHRlbnNpb24uY3JlYXRlUHJvY2Vzc29yKCk7XG4gICAgICBhd2FpdCB0aGlzLnByb2Nlc3Nvci5pbml0KFwiL2Fzc2V0cy93YXNtc1wiKTtcbiAgICAgIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjay5waXBlKHRoaXMucHJvY2Vzc29yKS5waXBlKHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjay5wcm9jZXNzb3JEZXN0aW5hdGlvbik7XG4gICAgICBhd2FpdCB0aGlzLnByb2Nlc3Nvci5zZXRPcHRpb25zKHsgdHlwZTogJ2NvbG9yJywgY29sb3I6IFwiIzAwZmYwMFwiIH0pO1xuICAgICAgYXdhaXQgdGhpcy5wcm9jZXNzb3IuZW5hYmxlKCk7XG4gICAgfVxuXG4gICAgd2luZG93LmxvY2FsVHJhY2tzID0gdGhpcy5sb2NhbFRyYWNrcztcblxuICAgIC8vIFB1Ymxpc2ggdGhlIGxvY2FsIHZpZGVvIGFuZCBhdWRpbyB0cmFja3MgdG8gdGhlIGNoYW5uZWwuXG4gICAgaWYgKHRoaXMuZW5hYmxlVmlkZW8gfHwgdGhpcy5lbmFibGVBdWRpbyB8fCB0aGlzLmVuYWJsZUF2YXRhcikge1xuICAgICAgaWYgKHRoaXMubG9jYWxUcmFja3MuYXVkaW9UcmFjaylcbiAgICAgICAgYXdhaXQgdGhpcy5hZ29yYUNsaWVudC5wdWJsaXNoKHRoaXMubG9jYWxUcmFja3MuYXVkaW9UcmFjayk7XG4gICAgICBpZiAodGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrKVxuICAgICAgICBhd2FpdCB0aGlzLmFnb3JhQ2xpZW50LnB1Ymxpc2godGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrKTtcblxuICAgICAgY29uc29sZS5sb2coXCJwdWJsaXNoIHN1Y2Nlc3NcIik7XG4gICAgICBjb25zdCBwYyA9IHRoaXMuYWdvcmFDbGllbnQuX3AycENoYW5uZWwuY29ubmVjdGlvbi5wZWVyQ29ubmVjdGlvbjtcbiAgICAgIGNvbnN0IHNlbmRlcnMgPSBwYy5nZXRTZW5kZXJzKCk7XG4gICAgICBsZXQgaSA9IDA7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgc2VuZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoc2VuZGVyc1tpXS50cmFjayAmJiAoc2VuZGVyc1tpXS50cmFjay5raW5kID09ICdhdWRpbycpKSB7XG4gICAgICAgICAgdGhpcy5jcmVhdGVFbmNvZGVyKHNlbmRlcnNbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUlRNXG4gICAgaWYgKHRoaXMuYWdvcmFSVE0pIHtcbiAgICAgIGlmICh0aGlzLmNsaWVudElkID09IG51bGwpIHtcbiAgICAgICAgdGhpcy5jbGllbnRJZCA9ICdYJyArIHRoaXMudXNlcmlkO1xuICAgICAgfVxuICAgICAgdGhpcy5ydG1VaWQgPSB0aGlzLmNsaWVudElkO1xuICAgICAgaWYgKCF0aGlzLnN5bmNPYmplY3RzKXtcbiAgICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5hZ29yYVJUTTIpIHsgLy8gMi54IFJUTVxuICAgICAgICBBZ29yYVJUTS5zZXRBcmVhKHsgYXJlYUNvZGVzOiBbXCJHTE9CQUxcIl0gfSk7ICAgICAgICBcbiAgICAgICAgdGhpcy5ydG1DbGllbnQgPSBuZXcgQWdvcmFSVE0uUlRNKHRoaXMuYXBwaWQsIHRoaXMucnRtVWlkLCB7cHJlc2VuY2VUaW1lb3V0OiA1fSk7IFxuICAgICAgICB0aGlzLnJ0bUNsaWVudC5hZGRFdmVudExpc3RlbmVyKHsgICAgICAgICAgXG4gICAgICAgICAgbWVzc2FnZTogKGV2ZW50QXJncykgPT4geyAvLyBNZXNzYWdlIGV2ZW50IGhhbmRsZXJcbiAgICAgICAgICAgIHdpbmRvdy5BZ29yYVJ0Y0FkYXB0ZXIuaGFuZGxlUlRNMihldmVudEFyZ3MucHVibGlzaGVyLCBldmVudEFyZ3MubWVzc2FnZSk7ICAgICAgICAgICAgXG4gICAgICAgICAgfSwgICAgICAgICAgXG4gICAgICAgICAgcHJlc2VuY2U6IChldmVudEFyZ3MpID0+IHsgLy8gUHJlc2VuY2UgZXZlbnQgaGFuZGxlclxuICAgICAgICAgICAgaWYgKGV2ZW50QXJncy5ldmVudFR5cGUgPT09IFwiU05BUFNIT1RcIikge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IHU9MDsgdTxldmVudEFyZ3Muc25hcHNob3QubGVuZ3RoOyB1Kyspe1xuICAgICAgICAgICAgICAgICAgbGV0IHByZXNlbnQ9dGhpcy5vY2N1cGFudExpc3RbZXZlbnRBcmdzLnNuYXBzaG90W3VdLnVzZXJJZF07XG4gICAgICAgICAgICAgICAgICB0aGlzLm9jY3VwYW50TGlzdFtldmVudEFyZ3Muc25hcHNob3RbdV0udXNlcklkXT1ldmVudEFyZ3Muc25hcHNob3RbdV0udXNlcklkO1xuICAgICAgICAgICAgICAgICAgbGV0IGNvcHk9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5vY2N1cGFudExpc3QpKTtcbiAgICAgICAgICAgICAgICAgIHRoaXMub2NjdXBhbnRMaXN0ZW5lcihjb3B5KTtcbiAgICAgICAgICAgICAgICAgIGlmICghcHJlc2VudCl7XG4gICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS53YXJuKFwib3Blbkxpc3RlbmVyXCIsZXZlbnRBcmdzLnNuYXBzaG90W3VdLnVzZXJJZCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3Blbkxpc3RlbmVyKGV2ZW50QXJncy5zbmFwc2hvdFt1XS51c2VySWQpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnRBcmdzLmV2ZW50VHlwZSA9PT0gXCJSRU1PVEVfSk9JTlwiKSB7XG4gICAgICAgICAgICAgICAgICBsZXQgcHJlc2VudD10aGlzLm9jY3VwYW50TGlzdFtldmVudEFyZ3MucHVibGlzaGVyXTtcbiAgICAgICAgICAgICAgICAgIHRoaXMub2NjdXBhbnRMaXN0W2V2ZW50QXJncy5wdWJsaXNoZXJdPWV2ZW50QXJncy5wdWJsaXNoZXI7XG4gICAgICAgICAgICAgICAgICBsZXQgY29weT0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLm9jY3VwYW50TGlzdCkpO1xuICAgICAgICAgICAgICAgICAgdGhpcy5vY2N1cGFudExpc3RlbmVyKGNvcHkpO1xuICAgICAgICAgICAgICAgICAgaWYgKCFwcmVzZW50KXtcbiAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLndhcm4oXCJvcGVuTGlzdGVuZXJcIixldmVudEFyZ3MucHVibGlzaGVyKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcGVuTGlzdGVuZXIoZXZlbnRBcmdzLnB1Ymxpc2hlcik7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50QXJncy5ldmVudFR5cGUgPT09IFwiUkVNT1RFX1RJTUVPVVRcIiB8fCBldmVudEFyZ3MuZXZlbnRUeXBlID09PSBcIlJFTU9URV9MRUFWRVwiKSB7XG4gICAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5vY2N1cGFudExpc3RbZXZlbnRBcmdzLnB1Ymxpc2hlcl07XG4gICAgICAgICAgICAgICAgICBsZXQgY29weT0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLm9jY3VwYW50TGlzdCkpO1xuICAgICAgICAgICAgICAgICAgdGhpcy5vY2N1cGFudExpc3RlbmVyKGNvcHkpOyAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9IFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiYmVmb3JldW5sb2FkXCIsICgpID0+e1xuICAgICAgICAgIHdpbmRvdy5BZ29yYVJ0Y0FkYXB0ZXIucnRtQ2xpZW50LmxvZ291dCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5ydG1DbGllbnQubG9naW4oKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucnRtQ2xpZW50LnN1YnNjcmliZSh0aGlzLnJvb20pO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ3J0bSBMT0dJTiBTVUNDRVNTIGZvcjogJysgdGhpcy5ydG1VaWQscmVzdWx0KTtcbiAgICAgICAgICAgIHN1Y2Nlc3ModGhpcy5jbGllbnRJZCk7XG4gICAgICAgIH0gY2F0Y2ggKHN0YXR1cykge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcigncnRtIExPR0lOIEZBSUxFRCBmb3I6ICcrIHRoaXMucnRtVWlkLCBzdGF0dXMpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgeyAgLy8gcnRtIDFcbiAgICAgICAgdGhpcy5ydG1DbGllbnQgPSBBZ29yYVJUTS5jcmVhdGVJbnN0YW5jZSh0aGlzLmFwcGlkLCB7IGxvZ0ZpbHRlcjogQWdvcmFSVE0uTE9HX0ZJTFRFUl9PRkYgfSk7XG5cbiAgICAgICAgdGhpcy5ydG1DbGllbnQub24oJ0Nvbm5lY3Rpb25TdGF0ZUNoYW5nZWQnLCAobmV3U3RhdGUsIHJlYXNvbikgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCd0aGlzLnJ0bUNsaWVudCBjb25uZWN0aW9uIHN0YXRlIGNoYW5nZWQgdG8gJyArIG5ld1N0YXRlICsgJyByZWFzb246ICcgKyByZWFzb24pO1xuICAgICAgICAgIGlmIChuZXdTdGF0ZSA9PSBcIkNPTk5FQ1RFRFwiKSB7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMucnRtQ2xpZW50Lm9uKCdNZXNzYWdlRnJvbVBlZXInLCAoeyB0ZXh0IH0sIHNlbmRlcklkKSA9PiB7XG4gICAgICAgICAgdGhpcy5oYW5kbGVSVE0oc2VuZGVySWQsIHRleHQpO1xuICAgICAgICB9KTtcblxuXG4gICAgICAgIHRoaXMucnRtQ2xpZW50LmxvZ2luKHsgdG9rZW46IG51bGwsIHVpZDogdGhpcy5ydG1VaWQgfSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgdGhpcy5ydG1DaGFubmVsID0gdGhpcy5ydG1DbGllbnQuY3JlYXRlQ2hhbm5lbCh0aGlzLnJvb20pO1xuICAgICAgICAgIHRoaXMucnRtQ2hhbm5lbC5vbignTWVtYmVySm9pbmVkJywgKG1lbWJlcklkKSA9PiB7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy5ydG1DaGFubmVsLm9uKCdNZW1iZXJMZWZ0JywgKG1lbWJlcklkKSA9PiB7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy5ydG1DaGFubmVsLmpvaW4oKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucnRtQ2hhbm5lbC5vbignQ2hhbm5lbE1lc3NhZ2UnLCAoeyB0ZXh0IH0sIHNlbmRlcklkKSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMuaGFuZGxlUlRNKHNlbmRlcklkLCB0ZXh0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc3VjY2Vzcyh0aGlzLmNsaWVudElkKTsvL1t0aGlzLmNsaWVudElkLHRoaXMuY2xpZW50SWRdKTtcbiAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQWdvcmFSVE0gY2xpZW50IGpvaW4gZmFpbHVyZScsIGVycm9yKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdBZ29yYVJUTSBjbGllbnQgbG9naW4gZmFpbHVyZScsIGVycm9yKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICB9XG4gIH1cblxuICAvKipcbiAgICogUHJpdmF0ZXNcbiAgICovXG5cbiAgYXN5bmMgX2Nvbm5lY3QoY29ubmVjdFN1Y2Nlc3MsIGNvbm5lY3RGYWlsdXJlKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgLy8gbGV0IHggPSBmdW5jdGlvbiAoKSB7IC8qIGVtcHR5IGJlY2F1c2UgLi4uICovIH07XG4gICBpZiAoIXRoaXMuZWFzeXJ0Yyl7XG4gICAgcmV0dXJuO1xuICB9XG4gICAgYXdhaXQgdGhhdC5lYXN5cnRjLmNvbm5lY3QodGhhdC5hcHAsIGNvbm5lY3RTdWNjZXNzLCBjb25uZWN0RmFpbHVyZSk7XG4gIH1cblxuICBfZ2V0Um9vbUpvaW5UaW1lKGNsaWVudElkKSB7XG4gICAgdmFyIG15Um9vbUlkID0gdGhpcy5yb29tOyAvL05BRi5yb29tO1xuICAgIGlmICghdGhpcy5lYXN5cnRjKXtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIGpvaW5UaW1lID0gdGhpcy5lYXN5cnRjLmdldFJvb21PY2N1cGFudHNBc01hcChteVJvb21JZClbY2xpZW50SWRdLnJvb21Kb2luVGltZTtcbiAgICByZXR1cm4gam9pblRpbWU7XG4gIH1cblxuICBnZXRTZXJ2ZXJUaW1lKCkge1xuICAgIHJldHVybiBEYXRlLm5vdygpICsgdGhpcy5hdmdUaW1lT2Zmc2V0O1xuICB9XG59XG5cbk5BRi5hZGFwdGVycy5yZWdpc3RlcihcImFnb3JhcnRjXCIsIEFnb3JhUnRjQWRhcHRlcik7XG5tb2R1bGUuZXhwb3J0cyA9IEFnb3JhUnRjQWRhcHRlcjtcbiJdLCJzb3VyY2VSb290IjoiIn0=