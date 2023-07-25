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

    // RTM
    this.agoraRTM = false;
    this.agoraRTM2 = false;
    this.rtmClient = null;
    this.rtmUid = null;
    this.rtmChannelName = null;
    this.rtmChannel = null;

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
    this.occupantListener = occupantListener;
    this.easyrtc.setRoomOccupantListener(function (roomName, occupants, primary) {
      occupantListener(occupants);
    });
  }

  setDataChannelListeners(openListener, closedListener, messageListener) {
    console.log("BW73 setDataChannelListeners  ", openListener, closedListener, messageListener);
    this.easyrtc.setDataChannelOpenListener(openListener);
    this.easyrtc.setDataChannelCloseListener(closedListener);
    this.easyrtc.setPeerListener(messageListener);
    this.openListener = openListener;
    this.messageListener = messageListener;
    this.closedListener = closedListener;
    //window.AgoraRtcAdapter.messageListener = messageListener;
    //console.error('messageListener 1', window.AgoraRtcAdapter.messageListener);
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
      /*
      if (this.rtmClient != null) {
        let msg = JSON.stringify({ dataType: dataType, data: data });
        this.rtmClient.sendMessageToPeer({text: msg}, destinationClientId);
        console.log("BW75 sendDataGuaranteed ", destinationClientId, dataType, data);
      } */
    } else {
      // console.log("BW72 DIRECT easyrtc.sendDataWS ",destinationClientId, dataType, data)
      // this.easyrtc.sendDataWS(destinationClientId, dataType, data);
      this.broadcastDataGuaranteed(dataType, data);
    }
  }

  broadcastData(dataType, data) {
    return this.broadcastDataGuaranteed(dataType, data);
  }

  async sendAgoraRTM(dataType, data) {

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
      //console.log("BW72 BROAD easyrtc.sendDataWS ",destination, dataType, data)
      //console.warn('sending Agora EASYRTC',dataType, data);
      this.easyrtc.sendDataWS(destination, dataType, data);
    }
  }

  getConnectStatus(clientId) {
    //console.error("BW73 getConnectStatus ", clientId);
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
      //this.agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      //this.agoraClient = AgoraRTC.createClient({ mode: "live", codec: "h264" });
      this.agoraClient.setClientRole("host");
    } else {
      //this.agoraClient = AgoraRTC.createClient({ mode: "live", codec: "h264" });
      //this.agoraClient = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
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

        audio_track = AgoraRTC.createCustomAudioTrack({ mediaStreamTrack: window.gum_stream.getAudioTracks()[0] });
        //console.warn(audio_track, "audio_track");
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
    if (this.agoraRTM) {
      if (this.clientId == null) {
        this.clientId = 'X' + this.userid;
      }
      this.rtmUid = this.clientId;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIl0sIm5hbWVzIjpbIkFnb3JhUnRjQWRhcHRlciIsImNvbnN0cnVjdG9yIiwiZWFzeXJ0YyIsImNvbnNvbGUiLCJsb2ciLCJ3aW5kb3ciLCJhcHAiLCJyb29tIiwidXNlcmlkIiwiYXBwaWQiLCJtb2NhcERhdGEiLCJtb2NhcFByZXZEYXRhIiwibG9naSIsImxvZ28iLCJtZWRpYVN0cmVhbXMiLCJyZW1vdGVDbGllbnRzIiwib2NjdXBhbnRMaXN0IiwiYXVkaW9KaXR0ZXIiLCJwZW5kaW5nTWVkaWFSZXF1ZXN0cyIsIk1hcCIsImVuYWJsZVZpZGVvIiwiZW5hYmxlVmlkZW9GaWx0ZXJlZCIsImVuYWJsZUF1ZGlvIiwiZW5hYmxlQXZhdGFyIiwibG9jYWxUcmFja3MiLCJ2aWRlb1RyYWNrIiwiYXVkaW9UcmFjayIsInRva2VuIiwiY2xpZW50SWQiLCJ1aWQiLCJ2YmciLCJ2YmcwIiwic2hvd0xvY2FsIiwidmlydHVhbEJhY2tncm91bmRJbnN0YW5jZSIsImV4dGVuc2lvbiIsInByb2Nlc3NvciIsInBpcGVQcm9jZXNzb3IiLCJ0cmFjayIsInBpcGUiLCJwcm9jZXNzb3JEZXN0aW5hdGlvbiIsInNlcnZlclRpbWVSZXF1ZXN0cyIsInRpbWVPZmZzZXRzIiwiYXZnVGltZU9mZnNldCIsImFnb3JhQ2xpZW50IiwiYWdvcmFSVE0iLCJhZ29yYVJUTTIiLCJydG1DbGllbnQiLCJydG1VaWQiLCJydG1DaGFubmVsTmFtZSIsInJ0bUNoYW5uZWwiLCJzZXRQZWVyT3Blbkxpc3RlbmVyIiwiY2xpZW50Q29ubmVjdGlvbiIsImdldFBlZXJDb25uZWN0aW9uQnlVc2VySWQiLCJzZXRQZWVyQ2xvc2VkTGlzdGVuZXIiLCJpc0Nocm9tZSIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsImluZGV4T2YiLCJvbGRSVENQZWVyQ29ubmVjdGlvbiIsIlJUQ1BlZXJDb25uZWN0aW9uIiwiUHJveHkiLCJjb25zdHJ1Y3QiLCJ0YXJnZXQiLCJhcmdzIiwibGVuZ3RoIiwicHVzaCIsImVuY29kZWRJbnNlcnRhYmxlU3RyZWFtcyIsInBjIiwib2xkU2V0Q29uZmlndXJhdGlvbiIsInByb3RvdHlwZSIsInNldENvbmZpZ3VyYXRpb24iLCJhcmd1bWVudHMiLCJhcHBseSIsIkN1c3RvbURhdGFEZXRlY3RvciIsIkN1c3RvbURhdExlbmd0aEJ5dGVDb3VudCIsInNlbmRlckNoYW5uZWwiLCJNZXNzYWdlQ2hhbm5lbCIsInJlY2VpdmVyQ2hhbm5lbCIsIl92YWRfYXVkaW9UcmFjayIsIl92b2ljZUFjdGl2aXR5RGV0ZWN0aW9uRnJlcXVlbmN5IiwiX3ZhZF9NYXhBdWRpb1NhbXBsZXMiLCJfdmFkX01heEJhY2tncm91bmROb2lzZUxldmVsIiwiX3ZhZF9TaWxlbmNlT2ZmZXNldCIsIl92YWRfYXVkaW9TYW1wbGVzQXJyIiwiX3ZhZF9hdWRpb1NhbXBsZXNBcnJTb3J0ZWQiLCJfdmFkX2V4Y2VlZENvdW50IiwiX3ZhZF9leGNlZWRDb3VudFRocmVzaG9sZCIsIl92YWRfZXhjZWVkQ291bnRUaHJlc2hvbGRMb3ciLCJfdm9pY2VBY3Rpdml0eURldGVjdGlvbkludGVydmFsIiwic2V0U2VydmVyVXJsIiwidXJsIiwic2V0U29ja2V0VXJsIiwic2V0QXBwIiwiYXBwTmFtZSIsInNldFJvb20iLCJqc29uIiwicmVwbGFjZSIsIm9iaiIsIkpTT04iLCJwYXJzZSIsIm5hbWUiLCJBZ29yYVJUQyIsImxvYWRNb2R1bGUiLCJTZWdQbHVnaW4iLCJqb2luUm9vbSIsInNldFdlYlJ0Y09wdGlvbnMiLCJvcHRpb25zIiwiZW5hYmxlRGF0YUNoYW5uZWxzIiwiZGF0YWNoYW5uZWwiLCJ2aWRlbyIsImF1ZGlvIiwiZW5hYmxlVmlkZW9SZWNlaXZlIiwiZW5hYmxlQXVkaW9SZWNlaXZlIiwic2V0U2VydmVyQ29ubmVjdExpc3RlbmVycyIsInN1Y2Nlc3NMaXN0ZW5lciIsImZhaWx1cmVMaXN0ZW5lciIsImNvbm5lY3RTdWNjZXNzIiwiY29ubmVjdEZhaWx1cmUiLCJzZXRSb29tT2NjdXBhbnRMaXN0ZW5lciIsIm9jY3VwYW50TGlzdGVuZXIiLCJyb29tTmFtZSIsIm9jY3VwYW50cyIsInByaW1hcnkiLCJzZXREYXRhQ2hhbm5lbExpc3RlbmVycyIsIm9wZW5MaXN0ZW5lciIsImNsb3NlZExpc3RlbmVyIiwibWVzc2FnZUxpc3RlbmVyIiwic2V0RGF0YUNoYW5uZWxPcGVuTGlzdGVuZXIiLCJzZXREYXRhQ2hhbm5lbENsb3NlTGlzdGVuZXIiLCJzZXRQZWVyTGlzdGVuZXIiLCJ1cGRhdGVUaW1lT2Zmc2V0IiwiY2xpZW50U2VudFRpbWUiLCJEYXRlIiwibm93IiwiZmV0Y2giLCJkb2N1bWVudCIsImxvY2F0aW9uIiwiaHJlZiIsIm1ldGhvZCIsImNhY2hlIiwidGhlbiIsInJlcyIsInByZWNpc2lvbiIsInNlcnZlclJlY2VpdmVkVGltZSIsImhlYWRlcnMiLCJnZXQiLCJnZXRUaW1lIiwiY2xpZW50UmVjZWl2ZWRUaW1lIiwic2VydmVyVGltZSIsInRpbWVPZmZzZXQiLCJyZWR1Y2UiLCJhY2MiLCJvZmZzZXQiLCJzZXRUaW1lb3V0IiwiY29ubmVjdCIsIlByb21pc2UiLCJhbGwiLCJyZXNvbHZlIiwicmVqZWN0IiwiZ2VuZXJhdGVJZCIsImNvbm5lY3RBZ29yYSIsIl9jb25uZWN0IiwiXyIsIl9teVJvb21Kb2luVGltZSIsIl9nZXRSb29tSm9pblRpbWUiLCJjYXRjaCIsInNob3VsZFN0YXJ0Q29ubmVjdGlvblRvIiwiY2xpZW50Iiwicm9vbUpvaW5UaW1lIiwic3RhcnRTdHJlYW1Db25uZWN0aW9uIiwiZXJyb3IiLCJjYWxsIiwiY2FsbGVyIiwibWVkaWEiLCJOQUYiLCJ3cml0ZSIsImVycm9yQ29kZSIsImVycm9yVGV4dCIsIndhc0FjY2VwdGVkIiwiY2xvc2VTdHJlYW1Db25uZWN0aW9uIiwiaW5mbyIsImhhbmd1cCIsInNlbmRNb2NhcCIsIm1vY2FwIiwicG9ydDEiLCJwb3N0TWVzc2FnZSIsIndhdGVybWFyayIsImNyZWF0ZUVuY29kZXIiLCJzZW5kZXIiLCJzdHJlYW1zIiwiY3JlYXRlRW5jb2RlZFN0cmVhbXMiLCJ0ZXh0RW5jb2RlciIsIlRleHRFbmNvZGVyIiwidGhhdCIsInRyYW5zZm9ybWVyIiwiVHJhbnNmb3JtU3RyZWFtIiwidHJhbnNmb3JtIiwiY2h1bmsiLCJjb250cm9sbGVyIiwiZW5jb2RlIiwiZnJhbWUiLCJkYXRhIiwiVWludDhBcnJheSIsImJ5dGVMZW5ndGgiLCJzZXQiLCJieXRlcyIsImdldEludEJ5dGVzIiwiaSIsIm1hZ2ljSW5kZXgiLCJjaGFyQ29kZUF0IiwiYnVmZmVyIiwiZW5xdWV1ZSIsInJlYWRhYmxlIiwicGlwZVRocm91Z2giLCJwaXBlVG8iLCJ3cml0YWJsZSIsIndvcmtlciIsIldvcmtlciIsIm9ubWVzc2FnZSIsImV2ZW50Iiwic2VuZGVyVHJhbnNmb3JtIiwiUlRDUnRwU2NyaXB0VHJhbnNmb3JtIiwicG9ydCIsInBvcnQyIiwiZSIsImNyZWF0ZURlY29kZXIiLCJyZWNlaXZlciIsInRleHREZWNvZGVyIiwiVGV4dERlY29kZXIiLCJ2aWV3IiwiRGF0YVZpZXciLCJtYWdpY0RhdGEiLCJtYWdpYyIsIm1hZ2ljU3RyaW5nIiwiU3RyaW5nIiwiZnJvbUNoYXJDb2RlIiwibW9jYXBMZW4iLCJnZXRVaW50MzIiLCJmcmFtZVNpemUiLCJtb2NhcEJ1ZmZlciIsImRlY29kZSIsInJlbW90ZU1vY2FwIiwiQXJyYXlCdWZmZXIiLCJyZWNlaXZlclRyYW5zZm9ybSIsInJlYWRTdGF0cyIsIl91c2VycyIsInUiLCJfbWVkaWFTdHJlYW1UcmFjayIsIl9wMnBDaGFubmVsIiwiY29ubmVjdGlvbiIsInBlZXJDb25uZWN0aW9uIiwiZ2V0U3RhdHMiLCJzdGF0cyIsImZvckVhY2giLCJyZXBvcnQiLCJ0eXBlIiwia2luZCIsImppdHRlckJ1ZmZlckRlbGF5IiwidG9GaXhlZCIsImlzTmFOIiwiaGFuZGxlUlRNIiwic2VuZGVySWQiLCJ0ZXh0IiwiZGF0YVR5cGUiLCJoYW5kbGVSVE0yIiwibXNnIiwibWVzc2FnZSIsInNlbmREYXRhIiwic2VuZERhdGFHdWFyYW50ZWVkIiwiZGVzdGluYXRpb25DbGllbnRJZCIsInNlbmRBZ29yYVJUTSIsImJyb2FkY2FzdERhdGFHdWFyYW50ZWVkIiwiYnJvYWRjYXN0RGF0YSIsInN0cmluZ2lmeSIsInBheWxvYWQiLCJwdWJsaXNoTWVzc2FnZSIsInB1Ymxpc2giLCJzZW5kTWVzc2FnZSIsImRlc3RpbmF0aW9uIiwidGFyZ2V0Um9vbSIsInNlbmREYXRhV1MiLCJnZXRDb25uZWN0U3RhdHVzIiwic3RhdHVzIiwiSVNfQ09OTkVDVEVEIiwiYWRhcHRlcnMiLCJOT1RfQ09OTkVDVEVEIiwiQ09OTkVDVElORyIsImdldE1lZGlhU3RyZWFtIiwic3RyZWFtTmFtZSIsImhhcyIsImF1ZGlvUHJvbWlzZSIsIndhcm4iLCJwcm9taXNlIiwidmlkZW9Qcm9taXNlIiwic3RyZWFtUHJvbWlzZSIsInNldE1lZGlhU3RyZWFtIiwic3RyZWFtIiwiY2xpZW50TWVkaWFTdHJlYW1zIiwiYXVkaW9UcmFja3MiLCJnZXRBdWRpb1RyYWNrcyIsImF1ZGlvU3RyZWFtIiwiTWVkaWFTdHJlYW0iLCJhZGRUcmFjayIsInZpZGVvVHJhY2tzIiwiZ2V0VmlkZW9UcmFja3MiLCJ2aWRlb1N0cmVhbSIsIngiLCJhZGRMb2NhbE1lZGlhU3RyZWFtIiwiaWQiLCJyZWdpc3RlcjNyZFBhcnR5TG9jYWxNZWRpYVN0cmVhbSIsIk9iamVjdCIsImtleXMiLCJhZGRTdHJlYW1Ub0NhbGwiLCJyZW1vdmVMb2NhbE1lZGlhU3RyZWFtIiwiY2xvc2VMb2NhbE1lZGlhU3RyZWFtIiwiZW5hYmxlTWljcm9waG9uZSIsImVuYWJsZWQiLCJlbmFibGVDYW1lcmEiLCJkaXNjb25uZWN0IiwiaGFuZGxlVXNlclB1Ymxpc2hlZCIsInVzZXIiLCJtZWRpYVR5cGUiLCJoYW5kbGVVc2VyVW5wdWJsaXNoZWQiLCJnZXRJbnB1dExldmVsIiwiYW5hbHlzZXIiLCJfc291cmNlIiwidm9sdW1lTGV2ZWxBbmFseXNlciIsImFuYWx5c2VyTm9kZSIsImJ1ZmZlckxlbmd0aCIsImZyZXF1ZW5jeUJpbkNvdW50IiwiZ2V0Qnl0ZUZyZXF1ZW5jeURhdGEiLCJ2YWx1ZXMiLCJhdmVyYWdlIiwiTWF0aCIsImZsb29yIiwicmVzdWx0IiwiY2hhcmFjdGVycyIsImNoYXJhY3RlcnNMZW5ndGgiLCJjb3VudGVyIiwiY2hhckF0IiwicmFuZG9tIiwidm9pY2VBY3Rpdml0eURldGVjdGlvbiIsIl9lbmFibGVkIiwiYXVkaW9MZXZlbCIsInJlbW92ZWQiLCJzaGlmdCIsInJlbW92ZWRJbmRleCIsInNwbGljZSIsInNvcnQiLCJhIiwiYiIsImJhY2tncm91bmQiLCJfc3RhdGVfc3RvcF9hdCIsInN1Y2Nlc3MiLCJmYWlsdXJlIiwiY3JlYXRlQ2xpZW50IiwibW9kZSIsImNvZGVjIiwic2V0UGFyYW1ldGVyIiwic2V0SW50ZXJ2YWwiLCJzZXRDbGllbnRSb2xlIiwib24iLCJjb3B5Iiwic3Vic2NyaWJlIiwicGxheSIsInF1ZXJ5U2VsZWN0b3IiLCJzcmNPYmplY3QiLCJlbmNfaWQiLCJyZWNlaXZlcnMiLCJnZXRSZWNlaXZlcnMiLCJnZXRFbGVtZW50QnlJZCIsImNhcHR1cmVTdHJlYW0iLCJqb2luIiwiY3JlYXRlTWljcm9waG9uZUF1ZGlvVHJhY2siLCJjcmVhdGVDdXN0b21WaWRlb1RyYWNrIiwibWVkaWFTdHJlYW1UcmFjayIsImNyZWF0ZUNhbWVyYVZpZGVvVHJhY2siLCJlbmNvZGVyQ29uZmlnIiwiYXVkaW9fdHJhY2siLCJndW1fc3RyZWFtIiwiY3JlYXRlQ3VzdG9tQXVkaW9UcmFjayIsImNhbXMiLCJnZXRDYW1lcmFzIiwibGFiZWwiLCJkZXZpY2VJZCIsInNldERldmljZSIsImltZ0VsZW1lbnQiLCJjcmVhdGVFbGVtZW50Iiwib25sb2FkIiwiaW5qZWN0Iiwic2V0T3B0aW9ucyIsImVuYWJsZSIsInNyYyIsIlZpcnR1YWxCYWNrZ3JvdW5kRXh0ZW5zaW9uIiwicmVnaXN0ZXJFeHRlbnNpb25zIiwiY3JlYXRlUHJvY2Vzc29yIiwiaW5pdCIsImNvbG9yIiwic2VuZGVycyIsImdldFNlbmRlcnMiLCJBZ29yYVJUTSIsInNldEFyZWEiLCJhcmVhQ29kZXMiLCJSVE0iLCJwcmVzZW5jZVRpbWVvdXQiLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnRBcmdzIiwicHVibGlzaGVyIiwicHJlc2VuY2UiLCJldmVudFR5cGUiLCJzbmFwc2hvdCIsInByZXNlbnQiLCJ1c2VySWQiLCJsb2dvdXQiLCJsb2dpbiIsImNyZWF0ZUluc3RhbmNlIiwibG9nRmlsdGVyIiwiTE9HX0ZJTFRFUl9PRkYiLCJuZXdTdGF0ZSIsInJlYXNvbiIsImNyZWF0ZUNoYW5uZWwiLCJtZW1iZXJJZCIsIm15Um9vbUlkIiwiam9pblRpbWUiLCJnZXRSb29tT2NjdXBhbnRzQXNNYXAiLCJnZXRTZXJ2ZXJUaW1lIiwicmVnaXN0ZXIiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiO1FBQUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7OztRQUdBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwwQ0FBMEMsZ0NBQWdDO1FBQzFFO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0Esd0RBQXdELGtCQUFrQjtRQUMxRTtRQUNBLGlEQUFpRCxjQUFjO1FBQy9EOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQSx5Q0FBeUMsaUNBQWlDO1FBQzFFLGdIQUFnSCxtQkFBbUIsRUFBRTtRQUNySTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDJCQUEyQiwwQkFBMEIsRUFBRTtRQUN2RCxpQ0FBaUMsZUFBZTtRQUNoRDtRQUNBO1FBQ0E7O1FBRUE7UUFDQSxzREFBc0QsK0RBQStEOztRQUVySDtRQUNBOzs7UUFHQTtRQUNBOzs7Ozs7Ozs7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QUF5QkMsSUFBekI7QUFDRCxhQUZEO0FBR0EyRixvQkFBUSxLQUFLclUsUUFBYixFQUpnQyxDQUlUO0FBQ3hCLFdBTEQsRUFLR3lJLEtBTEgsQ0FLU0ssU0FBUztBQUNoQnZLLG9CQUFRQyxHQUFSLENBQVksOEJBQVosRUFBNENzSyxLQUE1QztBQUNELFdBUEQ7QUFRRCxTQWRELEVBY0dMLEtBZEgsQ0FjU0ssU0FBUztBQUNoQnZLLGtCQUFRQyxHQUFSLENBQVksK0JBQVosRUFBNkNzSyxLQUE3QztBQUNELFNBaEJEO0FBaUJEO0FBQ0g7QUFDRDs7QUFFRDs7OztBQUlBLFFBQU1ULFFBQU4sQ0FBZTdDLGNBQWYsRUFBK0JDLGNBQS9CLEVBQStDO0FBQzdDLFFBQUk0RSxPQUFPLElBQVg7QUFDRDtBQUNDLFVBQU1BLEtBQUsvTCxPQUFMLENBQWF3SixPQUFiLENBQXFCdUMsS0FBSzNMLEdBQTFCLEVBQStCOEcsY0FBL0IsRUFBK0NDLGNBQS9DLENBQU47QUFDRDs7QUFFRCtDLG1CQUFpQnhJLFFBQWpCLEVBQTJCO0FBQ3pCLFFBQUkwWSxXQUFXLEtBQUsvWixJQUFwQixDQUR5QixDQUNDO0FBQzFCLFFBQUlnYSxXQUFXLEtBQUtyYSxPQUFMLENBQWFzYSxxQkFBYixDQUFtQ0YsUUFBbkMsRUFBNkMxWSxRQUE3QyxFQUF1RDRJLFlBQXRFO0FBQ0EsV0FBTytQLFFBQVA7QUFDRDs7QUFFREUsa0JBQWdCO0FBQ2QsV0FBT3JTLEtBQUtDLEdBQUwsS0FBYSxLQUFLM0YsYUFBekI7QUFDRDtBQW5rQ21COztBQXNrQ3RCb0ksSUFBSThHLFFBQUosQ0FBYThJLFFBQWIsQ0FBc0IsVUFBdEIsRUFBa0MxYSxlQUFsQztBQUNBMmEsT0FBT0MsT0FBUCxHQUFpQjVhLGVBQWpCLEMiLCJmaWxlIjoibmFmLWFnb3JhLWFkYXB0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9pbmRleC5qc1wiKTtcbiIsImNsYXNzIEFnb3JhUnRjQWRhcHRlciB7XG5cbiAgY29uc3RydWN0b3IoZWFzeXJ0Yykge1xuXG4gICAgY29uc29sZS5sb2coXCJCVzczIGNvbnN0cnVjdG9yIFwiLCBlYXN5cnRjKTtcblxuICAgIHRoaXMuZWFzeXJ0YyA9IGVhc3lydGMgfHwgd2luZG93LmVhc3lydGM7XG4gICAgdGhpcy5hcHAgPSBcImRlZmF1bHRcIjtcbiAgICB0aGlzLnJvb20gPSBcImRlZmF1bHRcIjtcbiAgICB0aGlzLnVzZXJpZCA9IDA7XG4gICAgdGhpcy5hcHBpZCA9IG51bGw7XG4gICAgdGhpcy5tb2NhcERhdGEgPSBcIlwiO1xuICAgIHRoaXMubW9jYXBQcmV2RGF0YSA9IFwiXCI7XG4gICAgdGhpcy5sb2dpID0gMDtcbiAgICB0aGlzLmxvZ28gPSAwO1xuICAgIHRoaXMubWVkaWFTdHJlYW1zID0ge307XG4gICAgdGhpcy5yZW1vdGVDbGllbnRzID0ge307XG4gICAgdGhpcy5vY2N1cGFudExpc3QgPSB7fTtcbiAgICB0aGlzLmF1ZGlvSml0dGVyID0ge307XG4gICAgdGhpcy5wZW5kaW5nTWVkaWFSZXF1ZXN0cyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLmVuYWJsZVZpZGVvID0gZmFsc2U7XG4gICAgdGhpcy5lbmFibGVWaWRlb0ZpbHRlcmVkID0gZmFsc2U7XG4gICAgdGhpcy5lbmFibGVBdWRpbyA9IGZhbHNlO1xuICAgIHRoaXMuZW5hYmxlQXZhdGFyID0gZmFsc2U7XG5cbiAgICB0aGlzLmxvY2FsVHJhY2tzID0geyB2aWRlb1RyYWNrOiBudWxsLCBhdWRpb1RyYWNrOiBudWxsIH07XG4gICAgd2luZG93LmxvY2FsVHJhY2tzID0gdGhpcy5sb2NhbFRyYWNrcztcbiAgICB0aGlzLnRva2VuID0gbnVsbDtcbiAgICB0aGlzLmNsaWVudElkID0gbnVsbDtcbiAgICB0aGlzLnVpZCA9IG51bGw7XG4gICAgdGhpcy52YmcgPSBmYWxzZTtcbiAgICB0aGlzLnZiZzAgPSBmYWxzZTtcbiAgICB0aGlzLnNob3dMb2NhbCA9IGZhbHNlO1xuICAgIHRoaXMudmlydHVhbEJhY2tncm91bmRJbnN0YW5jZSA9IG51bGw7XG4gICAgdGhpcy5leHRlbnNpb24gPSBudWxsO1xuICAgIHRoaXMucHJvY2Vzc29yID0gbnVsbDtcbiAgICB0aGlzLnBpcGVQcm9jZXNzb3IgPSAodHJhY2ssIHByb2Nlc3NvcikgPT4ge1xuICAgICAgdHJhY2sucGlwZShwcm9jZXNzb3IpLnBpcGUodHJhY2sucHJvY2Vzc29yRGVzdGluYXRpb24pO1xuICAgIH1cblxuICAgIHRoaXMuc2VydmVyVGltZVJlcXVlc3RzID0gMDtcbiAgICB0aGlzLnRpbWVPZmZzZXRzID0gW107XG4gICAgdGhpcy5hdmdUaW1lT2Zmc2V0ID0gMDtcbiAgICB0aGlzLmFnb3JhQ2xpZW50ID0gbnVsbDtcblxuICAgIC8vIFJUTVxuICAgIHRoaXMuYWdvcmFSVE0gPSBmYWxzZTtcbiAgICB0aGlzLmFnb3JhUlRNMiA9IGZhbHNlO1xuICAgIHRoaXMucnRtQ2xpZW50ID0gbnVsbDtcbiAgICB0aGlzLnJ0bVVpZCA9IG51bGw7XG4gICAgdGhpcy5ydG1DaGFubmVsTmFtZSA9IG51bGw7XG4gICAgdGhpcy5ydG1DaGFubmVsID0gbnVsbDtcblxuICAgIHRoaXMuZWFzeXJ0Yy5zZXRQZWVyT3Blbkxpc3RlbmVyKGNsaWVudElkID0+IHtcbiAgICAgIGNvbnN0IGNsaWVudENvbm5lY3Rpb24gPSB0aGlzLmVhc3lydGMuZ2V0UGVlckNvbm5lY3Rpb25CeVVzZXJJZChjbGllbnRJZCk7XG4gICAgICB0aGlzLnJlbW90ZUNsaWVudHNbY2xpZW50SWRdID0gY2xpZW50Q29ubmVjdGlvbjtcbiAgICB9KTtcblxuICAgIHRoaXMuZWFzeXJ0Yy5zZXRQZWVyQ2xvc2VkTGlzdGVuZXIoY2xpZW50SWQgPT4ge1xuICAgICAgZGVsZXRlIHRoaXMucmVtb3RlQ2xpZW50c1tjbGllbnRJZF07XG4gICAgfSk7XG5cbiAgICB0aGlzLmlzQ2hyb21lID0gKG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignRmlyZWZveCcpID09PSAtMSAmJiBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJ0Nocm9tZScpID4gLTEpO1xuXG4gICAgaWYgKHRoaXMuaXNDaHJvbWUpIHtcbiAgICAgIHdpbmRvdy5vbGRSVENQZWVyQ29ubmVjdGlvbiA9IFJUQ1BlZXJDb25uZWN0aW9uO1xuICAgICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uID0gbmV3IFByb3h5KHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiwge1xuICAgICAgICBjb25zdHJ1Y3Q6IGZ1bmN0aW9uICh0YXJnZXQsIGFyZ3MpIHtcbiAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBhcmdzWzBdW1wiZW5jb2RlZEluc2VydGFibGVTdHJlYW1zXCJdID0gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXJncy5wdXNoKHsgZW5jb2RlZEluc2VydGFibGVTdHJlYW1zOiB0cnVlIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHBjID0gbmV3IHdpbmRvdy5vbGRSVENQZWVyQ29ubmVjdGlvbiguLi5hcmdzKTtcbiAgICAgICAgICByZXR1cm4gcGM7XG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICAgIGNvbnN0IG9sZFNldENvbmZpZ3VyYXRpb24gPSB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLnNldENvbmZpZ3VyYXRpb247XG4gICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLnNldENvbmZpZ3VyYXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnN0IGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgIGlmIChhcmdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBhcmdzWzBdW1wiZW5jb2RlZEluc2VydGFibGVTdHJlYW1zXCJdID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhcmdzLnB1c2goeyBlbmNvZGVkSW5zZXJ0YWJsZVN0cmVhbXM6IHRydWUgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBvbGRTZXRDb25maWd1cmF0aW9uLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBjdXN0b20gZGF0YSBhcHBlbmQgcGFyYW1zXG4gICAgdGhpcy5DdXN0b21EYXRhRGV0ZWN0b3IgPSAnQUdPUkFNT0NBUCc7XG4gICAgdGhpcy5DdXN0b21EYXRMZW5ndGhCeXRlQ291bnQgPSA0O1xuICAgIHRoaXMuc2VuZGVyQ2hhbm5lbCA9IG5ldyBNZXNzYWdlQ2hhbm5lbDtcbiAgICB0aGlzLnJlY2VpdmVyQ2hhbm5lbDtcbiAgICAvL3RoaXMucl9yZWNlaXZlcj1udWxsO1xuICAgIC8vdGhpcy5yX2NsaWVudElkPW51bGw7XG5cbiAgICB0aGlzLl92YWRfYXVkaW9UcmFjayA9IG51bGw7XG4gICAgdGhpcy5fdm9pY2VBY3Rpdml0eURldGVjdGlvbkZyZXF1ZW5jeSA9IDE1MDtcblxuICAgIHRoaXMuX3ZhZF9NYXhBdWRpb1NhbXBsZXMgPSA0MDA7XG4gICAgdGhpcy5fdmFkX01heEJhY2tncm91bmROb2lzZUxldmVsID0gMjA7XG4gICAgdGhpcy5fdmFkX1NpbGVuY2VPZmZlc2V0ID0gNDtcbiAgICB0aGlzLl92YWRfYXVkaW9TYW1wbGVzQXJyID0gW107XG4gICAgdGhpcy5fdmFkX2F1ZGlvU2FtcGxlc0FyclNvcnRlZCA9IFtdO1xuICAgIHRoaXMuX3ZhZF9leGNlZWRDb3VudCA9IDA7XG4gICAgdGhpcy5fdmFkX2V4Y2VlZENvdW50VGhyZXNob2xkID0gMjtcbiAgICB0aGlzLl92YWRfZXhjZWVkQ291bnRUaHJlc2hvbGRMb3cgPSAxO1xuICAgIHRoaXMuX3ZvaWNlQWN0aXZpdHlEZXRlY3Rpb25JbnRlcnZhbDtcbiAgICB3aW5kb3cuQWdvcmFSdGNBZGFwdGVyID0gdGhpcztcblxuICB9XG5cbiAgc2V0U2VydmVyVXJsKHVybCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXRTZXJ2ZXJVcmwgXCIsIHVybCk7XG4gICAgdGhpcy5lYXN5cnRjLnNldFNvY2tldFVybCh1cmwpO1xuICB9XG5cbiAgc2V0QXBwKGFwcE5hbWUpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0QXBwIFwiLCBhcHBOYW1lKTtcbiAgICB0aGlzLmFwcCA9IGFwcE5hbWU7XG4gICAgdGhpcy5hcHBpZCA9IGFwcE5hbWU7XG4gIH1cblxuICBhc3luYyBzZXRSb29tKGpzb24pIHtcbiAgICBqc29uID0ganNvbi5yZXBsYWNlKC8nL2csICdcIicpO1xuICAgIGNvbnN0IG9iaiA9IEpTT04ucGFyc2UoanNvbik7XG4gICAgdGhpcy5yb29tID0gb2JqLm5hbWU7XG5cbiAgICBpZiAob2JqLnZiZyAmJiBvYmoudmJnID09ICd0cnVlJykge1xuICAgICAgdGhpcy52YmcgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChvYmoudmJnMCAmJiBvYmoudmJnMCA9PSAndHJ1ZScpIHtcbiAgICAgIHRoaXMudmJnMCA9IHRydWU7XG4gICAgICBBZ29yYVJUQy5sb2FkTW9kdWxlKFNlZ1BsdWdpbiwge30pO1xuICAgIH1cblxuICAgIGlmIChvYmouZW5hYmxlQXZhdGFyICYmIG9iai5lbmFibGVBdmF0YXIgPT0gJ3RydWUnKSB7XG4gICAgICB0aGlzLmVuYWJsZUF2YXRhciA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKG9iai5hZ29yYVJUTSAmJiBvYmouYWdvcmFSVE0gPT0gJ3RydWUnKSB7XG4gICAgICB0aGlzLmFnb3JhUlRNID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAob2JqLmFnb3JhUlRNMiAmJiBvYmouYWdvcmFSVE0yID09ICd0cnVlJykge1xuICAgICAgdGhpcy5hZ29yYVJUTTIgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChvYmouc2hvd0xvY2FsICYmIG9iai5zaG93TG9jYWwgPT0gJ3RydWUnKSB7XG4gICAgICB0aGlzLnNob3dMb2NhbCA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKG9iai5lbmFibGVWaWRlb0ZpbHRlcmVkICYmIG9iai5lbmFibGVWaWRlb0ZpbHRlcmVkID09ICd0cnVlJykge1xuICAgICAgdGhpcy5lbmFibGVWaWRlb0ZpbHRlcmVkID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLmFnb3JhUlRNKSB7XG4gICAgICB0aGlzLmVhc3lydGMuam9pblJvb20odGhpcy5yb29tLCBudWxsKTtcbiAgICB9XG4gIH1cblxuICAvLyBvcHRpb25zOiB7IGRhdGFjaGFubmVsOiBib29sLCBhdWRpbzogYm9vbCwgdmlkZW86IGJvb2wgfVxuICBzZXRXZWJSdGNPcHRpb25zKG9wdGlvbnMpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0V2ViUnRjT3B0aW9ucyBcIiwgb3B0aW9ucyk7XG4gICAgLy8gdGhpcy5lYXN5cnRjLmVuYWJsZURlYnVnKHRydWUpO1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVEYXRhQ2hhbm5lbHMob3B0aW9ucy5kYXRhY2hhbm5lbCk7XG5cbiAgICAvLyB1c2luZyBBZ29yYVxuICAgIHRoaXMuZW5hYmxlVmlkZW8gPSBvcHRpb25zLnZpZGVvO1xuICAgIHRoaXMuZW5hYmxlQXVkaW8gPSBvcHRpb25zLmF1ZGlvO1xuXG4gICAgLy8gbm90IGVhc3lydGNcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlVmlkZW8oZmFsc2UpO1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVBdWRpbyhmYWxzZSk7XG4gICAgdGhpcy5lYXN5cnRjLmVuYWJsZVZpZGVvUmVjZWl2ZShmYWxzZSk7XG4gICAgdGhpcy5lYXN5cnRjLmVuYWJsZUF1ZGlvUmVjZWl2ZShmYWxzZSk7XG4gIH1cblxuICBzZXRTZXJ2ZXJDb25uZWN0TGlzdGVuZXJzKHN1Y2Nlc3NMaXN0ZW5lciwgZmFpbHVyZUxpc3RlbmVyKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNldFNlcnZlckNvbm5lY3RMaXN0ZW5lcnMgXCIsIHN1Y2Nlc3NMaXN0ZW5lciwgZmFpbHVyZUxpc3RlbmVyKTtcbiAgICB0aGlzLmNvbm5lY3RTdWNjZXNzID0gc3VjY2Vzc0xpc3RlbmVyO1xuICAgIHRoaXMuY29ubmVjdEZhaWx1cmUgPSBmYWlsdXJlTGlzdGVuZXI7XG4gIH1cblxuICBzZXRSb29tT2NjdXBhbnRMaXN0ZW5lcihvY2N1cGFudExpc3RlbmVyKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNldFJvb21PY2N1cGFudExpc3RlbmVyIFwiLCBvY2N1cGFudExpc3RlbmVyKTtcbiAgICB0aGlzLm9jY3VwYW50TGlzdGVuZXI9b2NjdXBhbnRMaXN0ZW5lcjtcbiAgICB0aGlzLmVhc3lydGMuc2V0Um9vbU9jY3VwYW50TGlzdGVuZXIoZnVuY3Rpb24gKHJvb21OYW1lLCBvY2N1cGFudHMsIHByaW1hcnkpIHtcbiAgICAgIG9jY3VwYW50TGlzdGVuZXIob2NjdXBhbnRzKTtcbiAgICB9KTtcbiAgfVxuXG4gIHNldERhdGFDaGFubmVsTGlzdGVuZXJzKG9wZW5MaXN0ZW5lciwgY2xvc2VkTGlzdGVuZXIsIG1lc3NhZ2VMaXN0ZW5lcikge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXREYXRhQ2hhbm5lbExpc3RlbmVycyAgXCIsIG9wZW5MaXN0ZW5lciwgY2xvc2VkTGlzdGVuZXIsIG1lc3NhZ2VMaXN0ZW5lcik7XG4gICAgdGhpcy5lYXN5cnRjLnNldERhdGFDaGFubmVsT3Blbkxpc3RlbmVyKG9wZW5MaXN0ZW5lcik7XG4gICAgdGhpcy5lYXN5cnRjLnNldERhdGFDaGFubmVsQ2xvc2VMaXN0ZW5lcihjbG9zZWRMaXN0ZW5lcik7XG4gICAgdGhpcy5lYXN5cnRjLnNldFBlZXJMaXN0ZW5lcihtZXNzYWdlTGlzdGVuZXIpO1xuICAgIHRoaXMub3Blbkxpc3RlbmVyID0gb3Blbkxpc3RlbmVyO1xuICAgIHRoaXMubWVzc2FnZUxpc3RlbmVyID0gbWVzc2FnZUxpc3RlbmVyO1xuICAgIHRoaXMuY2xvc2VkTGlzdGVuZXIgPSBjbG9zZWRMaXN0ZW5lcjsgICAgXG4gICAgLy93aW5kb3cuQWdvcmFSdGNBZGFwdGVyLm1lc3NhZ2VMaXN0ZW5lciA9IG1lc3NhZ2VMaXN0ZW5lcjtcbiAgICAvL2NvbnNvbGUuZXJyb3IoJ21lc3NhZ2VMaXN0ZW5lciAxJywgd2luZG93LkFnb3JhUnRjQWRhcHRlci5tZXNzYWdlTGlzdGVuZXIpO1xuICB9XG5cbiAgdXBkYXRlVGltZU9mZnNldCgpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgdXBkYXRlVGltZU9mZnNldCBcIik7XG4gICAgY29uc3QgY2xpZW50U2VudFRpbWUgPSBEYXRlLm5vdygpICsgdGhpcy5hdmdUaW1lT2Zmc2V0O1xuXG4gICAgcmV0dXJuIGZldGNoKGRvY3VtZW50LmxvY2F0aW9uLmhyZWYsIHsgbWV0aG9kOiBcIkhFQURcIiwgY2FjaGU6IFwibm8tY2FjaGVcIiB9KS50aGVuKHJlcyA9PiB7XG4gICAgICB2YXIgcHJlY2lzaW9uID0gMTAwMDtcbiAgICAgIHZhciBzZXJ2ZXJSZWNlaXZlZFRpbWUgPSBuZXcgRGF0ZShyZXMuaGVhZGVycy5nZXQoXCJEYXRlXCIpKS5nZXRUaW1lKCkgKyBwcmVjaXNpb24gLyAyO1xuICAgICAgdmFyIGNsaWVudFJlY2VpdmVkVGltZSA9IERhdGUubm93KCk7XG4gICAgICB2YXIgc2VydmVyVGltZSA9IHNlcnZlclJlY2VpdmVkVGltZSArIChjbGllbnRSZWNlaXZlZFRpbWUgLSBjbGllbnRTZW50VGltZSkgLyAyO1xuICAgICAgdmFyIHRpbWVPZmZzZXQgPSBzZXJ2ZXJUaW1lIC0gY2xpZW50UmVjZWl2ZWRUaW1lO1xuXG4gICAgICB0aGlzLnNlcnZlclRpbWVSZXF1ZXN0cysrO1xuXG4gICAgICBpZiAodGhpcy5zZXJ2ZXJUaW1lUmVxdWVzdHMgPD0gMTApIHtcbiAgICAgICAgdGhpcy50aW1lT2Zmc2V0cy5wdXNoKHRpbWVPZmZzZXQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy50aW1lT2Zmc2V0c1t0aGlzLnNlcnZlclRpbWVSZXF1ZXN0cyAlIDEwXSA9IHRpbWVPZmZzZXQ7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYXZnVGltZU9mZnNldCA9IHRoaXMudGltZU9mZnNldHMucmVkdWNlKChhY2MsIG9mZnNldCkgPT4gYWNjICs9IG9mZnNldCwgMCkgLyB0aGlzLnRpbWVPZmZzZXRzLmxlbmd0aDtcblxuICAgICAgaWYgKHRoaXMuc2VydmVyVGltZVJlcXVlc3RzID4gMTApIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLnVwZGF0ZVRpbWVPZmZzZXQoKSwgNSAqIDYwICogMTAwMCk7IC8vIFN5bmMgY2xvY2sgZXZlcnkgNSBtaW51dGVzLlxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy51cGRhdGVUaW1lT2Zmc2V0KCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBjb25uZWN0KCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBjb25uZWN0IFwiKTtcbiAgICBQcm9taXNlLmFsbChbdGhpcy51cGRhdGVUaW1lT2Zmc2V0KCksIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGlmICh0aGlzLmFnb3JhUlRNKSB7XG4gICAgICAgIHRoaXMuY2xpZW50SWQ9dGhpcy5nZW5lcmF0ZUlkKDEwKTtcbiAgICAgICAgdGhpcy5jb25uZWN0QWdvcmEocmVzb2x2ZSwgcmVqZWN0KTsgLy9yZXNvbHZlLCByZWplY3QpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fY29ubmVjdChyZXNvbHZlLCByZWplY3QpO1xuICAgICAgfVxuICAgIH0pXSkudGhlbigoW18sIGNsaWVudElkXSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJCVzczIGNvbm5lY3RlZCBcIiArIGNsaWVudElkKTtcbiAgICAgIHRoaXMuY2xpZW50SWQgPSBjbGllbnRJZDtcbiAgICAgIGlmICghdGhpcy5hZ29yYVJUTSkge1xuICAgICAgICB0aGlzLl9teVJvb21Kb2luVGltZSA9IHRoaXMuX2dldFJvb21Kb2luVGltZShjbGllbnRJZCk7XG4gICAgICAgIHRoaXMuY29ubmVjdEFnb3JhKCk7XG4gICAgICB9XG4gICAgICB0aGlzLmNvbm5lY3RTdWNjZXNzKGNsaWVudElkKTtcbiAgICB9KS5jYXRjaCh0aGlzLmNvbm5lY3RGYWlsdXJlKTtcbiAgfVxuXG4gIHNob3VsZFN0YXJ0Q29ubmVjdGlvblRvKGNsaWVudCkge1xuICAgIHJldHVybiB0aGlzLl9teVJvb21Kb2luVGltZSA8PSBjbGllbnQucm9vbUpvaW5UaW1lO1xuICB9XG5cbiAgc3RhcnRTdHJlYW1Db25uZWN0aW9uKGNsaWVudElkKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkJXNzMgc3RhcnRTdHJlYW1Db25uZWN0aW9uIFwiLCBjbGllbnRJZCk7XG4gICAgdGhpcy5lYXN5cnRjLmNhbGwoY2xpZW50SWQsIGZ1bmN0aW9uIChjYWxsZXIsIG1lZGlhKSB7XG4gICAgICBpZiAobWVkaWEgPT09IFwiZGF0YWNoYW5uZWxcIikge1xuICAgICAgICBOQUYubG9nLndyaXRlKFwiU3VjY2Vzc2Z1bGx5IHN0YXJ0ZWQgZGF0YWNoYW5uZWwgdG8gXCIsIGNhbGxlcik7XG4gICAgICB9XG4gICAgfSwgZnVuY3Rpb24gKGVycm9yQ29kZSwgZXJyb3JUZXh0KSB7XG4gICAgICBOQUYubG9nLmVycm9yKGVycm9yQ29kZSwgZXJyb3JUZXh0KTtcbiAgICB9LCBmdW5jdGlvbiAod2FzQWNjZXB0ZWQpIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwid2FzIGFjY2VwdGVkPVwiICsgd2FzQWNjZXB0ZWQpO1xuICAgIH0pO1xuICB9XG5cbiAgY2xvc2VTdHJlYW1Db25uZWN0aW9uKGNsaWVudElkKSB7XG4gICAgY29uc29sZS5pbmZvKFwiQlc3MyBjbG9zZVN0cmVhbUNvbm5lY3Rpb24gXCIsIGNsaWVudElkKTtcbiAgICBpZiAodGhpcy5hZ29yYVJUTSkge1xuICAgICAgdGhpcy5jbG9zZWRMaXN0ZW5lcihjbGllbnRJZCk7ICBcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5lYXN5cnRjLmhhbmd1cChjbGllbnRJZCk7XG4gICAgfSAgICBcbiAgfVxuXG4gIHNlbmRNb2NhcChtb2NhcCkge1xuICAgIGlmIChtb2NhcCA9PSB0aGlzLm1vY2FwUHJldkRhdGEpIHtcbiAgICAgIC8vICAgY29uc29sZS5sb2coXCJibGFua1wiKTtcbiAgICAgIG1vY2FwID0gXCJcIjtcbiAgICB9XG5cbiAgICAvLyBzZXQgdG8gYmxhbmsgYWZ0ZXIgc2VuZGluZ1xuICAgIGlmICh0aGlzLm1vY2FwRGF0YSA9PT0gXCJcIikge1xuICAgICAgdGhpcy5tb2NhcERhdGEgPSBtb2NhcDtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuaXNDaHJvbWUpIHtcbiAgICAgIHRoaXMuc2VuZGVyQ2hhbm5lbC5wb3J0MS5wb3N0TWVzc2FnZSh7IHdhdGVybWFyazogbW9jYXAgfSk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgY3JlYXRlRW5jb2RlcihzZW5kZXIpIHtcbiAgICBpZiAodGhpcy5pc0Nocm9tZSkge1xuICAgICAgY29uc3Qgc3RyZWFtcyA9IHNlbmRlci5jcmVhdGVFbmNvZGVkU3RyZWFtcygpO1xuICAgICAgY29uc3QgdGV4dEVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgIGNvbnN0IHRyYW5zZm9ybWVyID0gbmV3IFRyYW5zZm9ybVN0cmVhbSh7XG4gICAgICAgIHRyYW5zZm9ybShjaHVuaywgY29udHJvbGxlcikge1xuICAgICAgICAgIGNvbnN0IG1vY2FwID0gdGV4dEVuY29kZXIuZW5jb2RlKHRoYXQubW9jYXBEYXRhKTtcbiAgICAgICAgICAvLyAgICBjb25zb2xlLmVycm9yKFwiYXBwZW5kaW5nIFwiLHRoYXQubW9jYXBEYXRhKTtcbiAgICAgICAgICB0aGF0Lm1vY2FwUHJldkRhdGEgPSB0aGF0Lm1vY2FwRGF0YTtcbiAgICAgICAgICB0aGF0Lm1vY2FwRGF0YSA9IFwiXCI7XG4gICAgICAgICAgY29uc3QgZnJhbWUgPSBjaHVuay5kYXRhO1xuICAgICAgICAgIGNvbnN0IGRhdGEgPSBuZXcgVWludDhBcnJheShjaHVuay5kYXRhLmJ5dGVMZW5ndGggKyBtb2NhcC5ieXRlTGVuZ3RoICsgdGhhdC5DdXN0b21EYXRMZW5ndGhCeXRlQ291bnQgKyB0aGF0LkN1c3RvbURhdGFEZXRlY3Rvci5sZW5ndGgpO1xuICAgICAgICAgIGRhdGEuc2V0KG5ldyBVaW50OEFycmF5KGZyYW1lKSwgMCk7XG4gICAgICAgICAgZGF0YS5zZXQobW9jYXAsIGZyYW1lLmJ5dGVMZW5ndGgpO1xuICAgICAgICAgIHZhciBieXRlcyA9IHRoYXQuZ2V0SW50Qnl0ZXMobW9jYXAuYnl0ZUxlbmd0aCk7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGF0LkN1c3RvbURhdExlbmd0aEJ5dGVDb3VudDsgaSsrKSB7XG4gICAgICAgICAgICBkYXRhW2ZyYW1lLmJ5dGVMZW5ndGggKyBtb2NhcC5ieXRlTGVuZ3RoICsgaV0gPSBieXRlc1tpXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBTZXQgbWFnaWMgc3RyaW5nIGF0IHRoZSBlbmRcbiAgICAgICAgICBjb25zdCBtYWdpY0luZGV4ID0gZnJhbWUuYnl0ZUxlbmd0aCArIG1vY2FwLmJ5dGVMZW5ndGggKyB0aGF0LkN1c3RvbURhdExlbmd0aEJ5dGVDb3VudDtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoYXQuQ3VzdG9tRGF0YURldGVjdG9yLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBkYXRhW21hZ2ljSW5kZXggKyBpXSA9IHRoYXQuQ3VzdG9tRGF0YURldGVjdG9yLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNodW5rLmRhdGEgPSBkYXRhLmJ1ZmZlcjtcbiAgICAgICAgICAvLyAgICAgICAgICB0cnkge1xuICAgICAgICAgIC8vICAgICAgICAgICAgY29uc29sZS5lcnJvcihcInNlbmRpbmcgXCIsIG1vY2FwLmJ5dGVMZW5ndGgsXCIgdG8gXCIsIGNodW5rLmRhdGEuYnl0ZUxlbmd0aCk7XG4gICAgICAgICAgY29udHJvbGxlci5lbnF1ZXVlKGNodW5rKTtcbiAgICAgICAgICAvLyAgICBjb25zb2xlLmVycm9yKFwic2VudCBcIiwgbW9jYXAuYnl0ZUxlbmd0aCxcIiB0byBcIiwgY2h1bmsuZGF0YS5ieXRlTGVuZ3RoKTtcblxuICAgICAgICAgIC8vICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAvLyAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgLy8gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgc3RyZWFtcy5yZWFkYWJsZS5waXBlVGhyb3VnaCh0cmFuc2Zvcm1lcikucGlwZVRvKHN0cmVhbXMud3JpdGFibGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICBjb25zdCB3b3JrZXIgPSBuZXcgV29ya2VyKCcvZGlzdC9zY3JpcHQtdHJhbnNmb3JtLXdvcmtlci5qcycpO1xuICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiB3b3JrZXIub25tZXNzYWdlID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldmVudC5kYXRhID09PSAncmVnaXN0ZXJlZCcpIHtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgY29uc3Qgc2VuZGVyVHJhbnNmb3JtID0gbmV3IFJUQ1J0cFNjcmlwdFRyYW5zZm9ybSh3b3JrZXIsIHsgbmFtZTogJ291dGdvaW5nJywgcG9ydDogdGhhdC5zZW5kZXJDaGFubmVsLnBvcnQyIH0sIFt0aGF0LnNlbmRlckNoYW5uZWwucG9ydDJdKTtcbiAgICAgIHNlbmRlclRyYW5zZm9ybS5wb3J0ID0gdGhhdC5zZW5kZXJDaGFubmVsLnBvcnQxO1xuICAgICAgc2VuZGVyLnRyYW5zZm9ybSA9IHNlbmRlclRyYW5zZm9ybTtcbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gd29ya2VyLm9ubWVzc2FnZSA9IChldmVudCkgPT4ge1xuICAgICAgICBpZiAoZXZlbnQuZGF0YSA9PT0gJ3N0YXJ0ZWQnKSB7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgc2VuZGVyVHJhbnNmb3JtLnBvcnQub25tZXNzYWdlID0gZSA9PiB7XG4gICAgICAgIGlmIChlLmRhdGEgPT0gXCJDTEVBUlwiKSB7XG4gICAgICAgICAgdGhhdC5tb2NhcFByZXZEYXRhID0gdGhhdC5tb2NhcERhdGE7XG4gICAgICAgICAgdGhhdC5tb2NhcERhdGEgPSBcIlwiO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgdGhhdC5zZW5kZXJDaGFubmVsLnBvcnQxLnBvc3RNZXNzYWdlKHsgd2F0ZXJtYXJrOiB0aGF0Lm1vY2FwRGF0YSB9KTtcbiAgICB9XG4gIH1cblxuXG4gIGFzeW5jIGNyZWF0ZURlY29kZXIocmVjZWl2ZXIsIGNsaWVudElkKSB7XG4gICAgaWYgKHRoaXMuaXNDaHJvbWUpIHtcbiAgICAgIGNvbnN0IHN0cmVhbXMgPSByZWNlaXZlci5jcmVhdGVFbmNvZGVkU3RyZWFtcygpO1xuICAgICAgY29uc3QgdGV4dERlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoKTtcbiAgICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgICAgY29uc3QgdHJhbnNmb3JtZXIgPSBuZXcgVHJhbnNmb3JtU3RyZWFtKHtcbiAgICAgICAgdHJhbnNmb3JtKGNodW5rLCBjb250cm9sbGVyKSB7XG4gICAgICAgICAgY29uc3QgdmlldyA9IG5ldyBEYXRhVmlldyhjaHVuay5kYXRhKTtcbiAgICAgICAgICBjb25zdCBtYWdpY0RhdGEgPSBuZXcgVWludDhBcnJheShjaHVuay5kYXRhLCBjaHVuay5kYXRhLmJ5dGVMZW5ndGggLSB0aGF0LkN1c3RvbURhdGFEZXRlY3Rvci5sZW5ndGgsIHRoYXQuQ3VzdG9tRGF0YURldGVjdG9yLmxlbmd0aCk7XG4gICAgICAgICAgbGV0IG1hZ2ljID0gW107XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGF0LkN1c3RvbURhdGFEZXRlY3Rvci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbWFnaWMucHVzaChtYWdpY0RhdGFbaV0pO1xuXG4gICAgICAgICAgfVxuICAgICAgICAgIGxldCBtYWdpY1N0cmluZyA9IFN0cmluZy5mcm9tQ2hhckNvZGUoLi4ubWFnaWMpO1xuICAgICAgICAgIGlmIChtYWdpY1N0cmluZyA9PT0gdGhhdC5DdXN0b21EYXRhRGV0ZWN0b3IpIHtcbiAgICAgICAgICAgIGNvbnN0IG1vY2FwTGVuID0gdmlldy5nZXRVaW50MzIoY2h1bmsuZGF0YS5ieXRlTGVuZ3RoIC0gKHRoYXQuQ3VzdG9tRGF0TGVuZ3RoQnl0ZUNvdW50ICsgdGhhdC5DdXN0b21EYXRhRGV0ZWN0b3IubGVuZ3RoKSwgZmFsc2UpO1xuICAgICAgICAgICAgY29uc3QgZnJhbWVTaXplID0gY2h1bmsuZGF0YS5ieXRlTGVuZ3RoIC0gKG1vY2FwTGVuICsgdGhhdC5DdXN0b21EYXRMZW5ndGhCeXRlQ291bnQgKyB0aGF0LkN1c3RvbURhdGFEZXRlY3Rvci5sZW5ndGgpO1xuICAgICAgICAgICAgY29uc3QgbW9jYXBCdWZmZXIgPSBuZXcgVWludDhBcnJheShjaHVuay5kYXRhLCBmcmFtZVNpemUsIG1vY2FwTGVuKTtcbiAgICAgICAgICAgIGNvbnN0IG1vY2FwID0gdGV4dERlY29kZXIuZGVjb2RlKG1vY2FwQnVmZmVyKVxuICAgICAgICAgICAgaWYgKG1vY2FwLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgd2luZG93LnJlbW90ZU1vY2FwKG1vY2FwICsgXCIsXCIgKyBjbGllbnRJZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBmcmFtZSA9IGNodW5rLmRhdGE7XG4gICAgICAgICAgICBjaHVuay5kYXRhID0gbmV3IEFycmF5QnVmZmVyKGZyYW1lU2l6ZSk7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gbmV3IFVpbnQ4QXJyYXkoY2h1bmsuZGF0YSk7XG4gICAgICAgICAgICBkYXRhLnNldChuZXcgVWludDhBcnJheShmcmFtZSwgMCwgZnJhbWVTaXplKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnRyb2xsZXIuZW5xdWV1ZShjaHVuayk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgc3RyZWFtcy5yZWFkYWJsZS5waXBlVGhyb3VnaCh0cmFuc2Zvcm1lcikucGlwZVRvKHN0cmVhbXMud3JpdGFibGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlY2VpdmVyQ2hhbm5lbCA9IG5ldyBNZXNzYWdlQ2hhbm5lbDtcbiAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgIGNvbnN0IHdvcmtlciA9IG5ldyBXb3JrZXIoJy9kaXN0L3NjcmlwdC10cmFuc2Zvcm0td29ya2VyLmpzJyk7XG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHdvcmtlci5vbm1lc3NhZ2UgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LmRhdGEgPT09ICdyZWdpc3RlcmVkJykge1xuXG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgY29uc3QgcmVjZWl2ZXJUcmFuc2Zvcm0gPSBuZXcgUlRDUnRwU2NyaXB0VHJhbnNmb3JtKHdvcmtlciwgeyBuYW1lOiAnaW5jb21pbmcnLCBwb3J0OiB0aGF0LnJlY2VpdmVyQ2hhbm5lbC5wb3J0MiB9LCBbdGhhdC5yZWNlaXZlckNoYW5uZWwucG9ydDJdKTtcblxuICAgICAgcmVjZWl2ZXJUcmFuc2Zvcm0ucG9ydCA9IHRoYXQucmVjZWl2ZXJDaGFubmVsLnBvcnQxO1xuICAgICAgcmVjZWl2ZXIudHJhbnNmb3JtID0gcmVjZWl2ZXJUcmFuc2Zvcm07XG4gICAgICByZWNlaXZlclRyYW5zZm9ybS5wb3J0Lm9ubWVzc2FnZSA9IGUgPT4ge1xuICAgICAgICBpZiAoZS5kYXRhLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB3aW5kb3cucmVtb3RlTW9jYXAoZS5kYXRhICsgXCIsXCIgKyBjbGllbnRJZCk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gd29ya2VyLm9ubWVzc2FnZSA9IChldmVudCkgPT4ge1xuICAgICAgICBpZiAoZXZlbnQuZGF0YSA9PT0gJ3N0YXJ0ZWQnKSB7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBhc3luYyByZWFkU3RhdHMoKSB7XG4gICAgaWYgKCF0aGlzLmFnb3JhQ2xpZW50Ll91c2Vycykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBmb3IgKHZhciB1ID0gMDsgdSA8IHRoaXMuYWdvcmFDbGllbnQuX3VzZXJzLmxlbmd0aDsgdSsrKSB7XG4gICAgICBpZiAodGhpcy5hZ29yYUNsaWVudC5fdXNlcnNbdV0uYXVkaW9UcmFjayAmJiB0aGlzLmFnb3JhQ2xpZW50Ll91c2Vyc1t1XS5hdWRpb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuYWdvcmFDbGllbnQuX3AycENoYW5uZWwuY29ubmVjdGlvbi5wZWVyQ29ubmVjdGlvbi5nZXRTdGF0cyh0aGlzLmFnb3JhQ2xpZW50Ll91c2Vyc1t1XS5hdWRpb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrKS50aGVuKGFzeW5jIHN0YXRzID0+IHtcbiAgICAgICAgICBhd2FpdCBzdGF0cy5mb3JFYWNoKHJlcG9ydCA9PiB7XG4gICAgICAgICAgICBpZiAocmVwb3J0LnR5cGUgPT09IFwiaW5ib3VuZC1ydHBcIiAmJiByZXBvcnQua2luZCA9PT0gXCJhdWRpb1wiKSB7XG4gICAgICAgICAgICAgIHZhciBqaXR0ZXJCdWZmZXJEZWxheSA9IChyZXBvcnRbXCJqaXR0ZXJCdWZmZXJEZWxheVwiXSAvIHJlcG9ydFtcImppdHRlckJ1ZmZlckVtaXR0ZWRDb3VudFwiXSkudG9GaXhlZCgzKTtcbiAgICAgICAgICAgICAgaWYgKCFpc05hTihqaXR0ZXJCdWZmZXJEZWxheSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmF1ZGlvSml0dGVyW3RoaXMuYWdvcmFDbGllbnQuX3VzZXJzW3VdLnVpZF0gPSBqaXR0ZXJCdWZmZXJEZWxheSAqIDEwMDA7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hdWRpb0ppdHRlclt0aGlzLmFnb3JhQ2xpZW50Ll91c2Vyc1t1XS51aWRdID0gODA7IC8vIGRlZmF1bHQgbXNcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGhhbmRsZVJUTShzZW5kZXJJZCwgdGV4dCkge1xuICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKHRleHQpO1xuICAgIGNvbnNvbGUubG9nKFwiQlc3NSBoYW5kbGVSVE1cIiwgc2VuZGVySWQsIGRhdGEpO1xuICAgIC8vY29uc29sZS5lcnJvcignbWVzc2FnZUxpc3RlbmVyIDInLCB3aW5kb3cuQWdvcmFSdGNBZGFwdGVyLm1lc3NhZ2VMaXN0ZW5lcik7XG4gICAgd2luZG93LkFnb3JhUnRjQWRhcHRlci5tZXNzYWdlTGlzdGVuZXIoc2VuZGVySWQsIGRhdGEuZGF0YVR5cGUsIGRhdGEuZGF0YSk7XG4gIH1cblxuICBoYW5kbGVSVE0yKHNlbmRlcklkLCB0ZXh0KSB7XG4gICAgY29uc3QgbXNnID0gSlNPTi5wYXJzZSh0ZXh0KTtcbiAgICBjb25zdCBkYXRhID0gSlNPTi5wYXJzZShtc2cubWVzc2FnZSk7XG4gICAgLy9jb25zb2xlLndhcm4oXCJCVzc1IGhhbmRsZVJUTTJcIiwgc2VuZGVySWQsIGRhdGEuZGF0YVR5cGUsIGRhdGEuZGF0YSk7XG4gICAgLy9jb25zb2xlLmVycm9yKCdtZXNzYWdlTGlzdGVuZXIgMicsIHdpbmRvdy5BZ29yYVJ0Y0FkYXB0ZXIubWVzc2FnZUxpc3RlbmVyKTtcbiAgICB3aW5kb3cuQWdvcmFSdGNBZGFwdGVyLm1lc3NhZ2VMaXN0ZW5lcihzZW5kZXJJZCwgZGF0YS5kYXRhVHlwZSwgZGF0YS5kYXRhKTtcbiAgfVxuXG4gIHNlbmREYXRhKGNsaWVudElkLCBkYXRhVHlwZSwgZGF0YSkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3NSBzZW5kRGF0YSBcIiwgY2xpZW50SWQsIGRhdGFUeXBlLCBkYXRhKTtcbiAgICByZXR1cm4gc2VuZERhdGFHdWFyYW50ZWVkKGNsaWVudElkLCBkYXRhVHlwZSwgZGF0YSk7XG4gIH1cblxuICBzZW5kRGF0YUd1YXJhbnRlZWQoZGVzdGluYXRpb25DbGllbnRJZCwgZGF0YVR5cGUsIGRhdGEpIHtcbiAgICBpZiAodGhpcy5hZ29yYVJUTSkge1xuICAgICAgdGhpcy5zZW5kQWdvcmFSVE0oZGF0YVR5cGUsIGRhdGEpO1xuICAgICAgLypcbiAgICAgIGlmICh0aGlzLnJ0bUNsaWVudCAhPSBudWxsKSB7XG4gICAgICAgIGxldCBtc2cgPSBKU09OLnN0cmluZ2lmeSh7IGRhdGFUeXBlOiBkYXRhVHlwZSwgZGF0YTogZGF0YSB9KTtcbiAgICAgICAgdGhpcy5ydG1DbGllbnQuc2VuZE1lc3NhZ2VUb1BlZXIoe3RleHQ6IG1zZ30sIGRlc3RpbmF0aW9uQ2xpZW50SWQpO1xuICAgICAgICBjb25zb2xlLmxvZyhcIkJXNzUgc2VuZERhdGFHdWFyYW50ZWVkIFwiLCBkZXN0aW5hdGlvbkNsaWVudElkLCBkYXRhVHlwZSwgZGF0YSk7XG4gICAgICB9ICovXG4gICAgfSBlbHNlIHtcbiAgICAgLy8gY29uc29sZS5sb2coXCJCVzcyIERJUkVDVCBlYXN5cnRjLnNlbmREYXRhV1MgXCIsZGVzdGluYXRpb25DbGllbnRJZCwgZGF0YVR5cGUsIGRhdGEpXG4gICAgIC8vIHRoaXMuZWFzeXJ0Yy5zZW5kRGF0YVdTKGRlc3RpbmF0aW9uQ2xpZW50SWQsIGRhdGFUeXBlLCBkYXRhKTtcbiAgICAgdGhpcy5icm9hZGNhc3REYXRhR3VhcmFudGVlZChkYXRhVHlwZSwgZGF0YSk7XG4gICAgfVxuICB9XG5cbiAgYnJvYWRjYXN0RGF0YShkYXRhVHlwZSwgZGF0YSkge1xuICAgIHJldHVybiB0aGlzLmJyb2FkY2FzdERhdGFHdWFyYW50ZWVkKGRhdGFUeXBlLCBkYXRhKTtcbiAgfVxuXG4gIGFzeW5jIHNlbmRBZ29yYVJUTShkYXRhVHlwZSwgZGF0YSkge1xuICAgIFxuICAgLy8gY29uc29sZS53YXJuKCdzZW5kaW5nIEFnb3JhIFJUTScsZGF0YVR5cGUsIGRhdGEpO1xuICAgIGxldCBtc2cgPSBKU09OLnN0cmluZ2lmeSh7IGRhdGFUeXBlOiBkYXRhVHlwZSwgZGF0YTogZGF0YSB9KTtcbiAgICBpZiAodGhpcy5hZ29yYVJUTTIpIHtcbiAgICAgIGlmICh0aGlzLnJ0bUNsaWVudCAhPSBudWxsKSB7ICAgXG4gICAgICAgIGNvbnN0IHBheWxvYWQgPSB7IHR5cGU6IFwidGV4dFwiLCBtZXNzYWdlOiBtc2cgfTtcbiAgICAgICAgY29uc3QgcHVibGlzaE1lc3NhZ2UgPSBKU09OLnN0cmluZ2lmeShwYXlsb2FkKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhd2FpdCB0aGlzLnJ0bUNsaWVudC5wdWJsaXNoKFxuICAgICAgICAgICAgdGhpcy5yb29tLFxuICAgICAgICAgICAgcHVibGlzaE1lc3NhZ2VcbiAgICAgICAgICApO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy9jb25zb2xlLmVycm9yKFwidW5hYmxlIHRvIHNlbmQgbWVzc2FnZSBSVE0yIFwiLGRhdGFUeXBlLGRhdGEpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5ydG1DaGFubmVsICE9IG51bGwpIHsgICBcbiAgICAgICAgdGhpcy5ydG1DaGFubmVsLnNlbmRNZXNzYWdlKHsgdGV4dDogbXNnIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiQlc3NSBicm9hZGNhc3REYXRhR3VhcmFudGVlZCBzZW50IFwiLCBkYXRhVHlwZSwgZGF0YSk7XG4gICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdBZ29yYVJUTSBzZW5kIGZhaWx1cmUgZm9yIHJ0bUNoYW5uZWwnLCBlcnJvcik7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy9jb25zb2xlLmVycm9yKFwidW5hYmxlIHRvIHNlbmQgbWVzc2FnZSBSVE0xIFwiLGRhdGFUeXBlLGRhdGEpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGJyb2FkY2FzdERhdGFHdWFyYW50ZWVkKGRhdGFUeXBlLCBkYXRhKSB7XG4gICAgaWYgKHRoaXMuYWdvcmFSVE0pIHtcbiAgICAgICAgdGhpcy5zZW5kQWdvcmFSVE0oZGF0YVR5cGUsIGRhdGEpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBkZXN0aW5hdGlvbiA9IHsgdGFyZ2V0Um9vbTogdGhpcy5yb29tIH07XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJCVzcyIEJST0FEIGVhc3lydGMuc2VuZERhdGFXUyBcIixkZXN0aW5hdGlvbiwgZGF0YVR5cGUsIGRhdGEpXG4gICAgICAgIC8vY29uc29sZS53YXJuKCdzZW5kaW5nIEFnb3JhIEVBU1lSVEMnLGRhdGFUeXBlLCBkYXRhKTtcbiAgICAgICAgdGhpcy5lYXN5cnRjLnNlbmREYXRhV1MoZGVzdGluYXRpb24sIGRhdGFUeXBlLCBkYXRhKTsgXG4gICAgfVxuICB9XG5cbiAgZ2V0Q29ubmVjdFN0YXR1cyhjbGllbnRJZCkge1xuICAgIC8vY29uc29sZS5lcnJvcihcIkJXNzMgZ2V0Q29ubmVjdFN0YXR1cyBcIiwgY2xpZW50SWQpO1xuICAgIHZhciBzdGF0dXMgPSB0aGlzLmVhc3lydGMuZ2V0Q29ubmVjdFN0YXR1cyhjbGllbnRJZCk7XG5cbiAgICBpZiAoc3RhdHVzID09IHRoaXMuZWFzeXJ0Yy5JU19DT05ORUNURUQpIHtcbiAgICAgIHJldHVybiBOQUYuYWRhcHRlcnMuSVNfQ09OTkVDVEVEO1xuICAgIH0gZWxzZSBpZiAoc3RhdHVzID09IHRoaXMuZWFzeXJ0Yy5OT1RfQ09OTkVDVEVEKSB7XG4gICAgICByZXR1cm4gTkFGLmFkYXB0ZXJzLk5PVF9DT05ORUNURUQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBOQUYuYWRhcHRlcnMuQ09OTkVDVElORztcbiAgICB9XG4gIH1cblxuICBnZXRNZWRpYVN0cmVhbShjbGllbnRJZCwgc3RyZWFtTmFtZSA9IFwiYXVkaW9cIikge1xuXG4gICAgY29uc29sZS5sb2coXCJCVzczIGdldE1lZGlhU3RyZWFtIFwiLCBjbGllbnRJZCwgc3RyZWFtTmFtZSk7XG4gICAgLy8gaWYgKCBzdHJlYW1OYW1lID0gXCJhdWRpb1wiKSB7XG4gICAgLy9zdHJlYW1OYW1lID0gXCJib2RfYXVkaW9cIjtcbiAgICAvL31cblxuICAgIGlmICh0aGlzLm1lZGlhU3RyZWFtc1tjbGllbnRJZF0gJiYgdGhpcy5tZWRpYVN0cmVhbXNbY2xpZW50SWRdW3N0cmVhbU5hbWVdKSB7XG4gICAgICBOQUYubG9nLndyaXRlKGBBbHJlYWR5IGhhZCAke3N0cmVhbU5hbWV9IGZvciAke2NsaWVudElkfWApO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLm1lZGlhU3RyZWFtc1tjbGllbnRJZF1bc3RyZWFtTmFtZV0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBOQUYubG9nLndyaXRlKGBXYWl0aW5nIG9uICR7c3RyZWFtTmFtZX0gZm9yICR7Y2xpZW50SWR9YCk7XG5cbiAgICAgIC8vIENyZWF0ZSBpbml0aWFsIHBlbmRpbmdNZWRpYVJlcXVlc3RzIHdpdGggYXVkaW98dmlkZW8gYWxpYXNcbiAgICAgIGlmICghdGhpcy5wZW5kaW5nTWVkaWFSZXF1ZXN0cy5oYXMoY2xpZW50SWQpKSB7XG4gICAgICAgIGNvbnN0IHBlbmRpbmdNZWRpYVJlcXVlc3RzID0ge307XG5cbiAgICAgICAgY29uc3QgYXVkaW9Qcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIHBlbmRpbmdNZWRpYVJlcXVlc3RzLmF1ZGlvID0geyByZXNvbHZlLCByZWplY3QgfTtcbiAgICAgICAgfSkuY2F0Y2goZSA9PiBOQUYubG9nLndhcm4oYCR7Y2xpZW50SWR9IGdldE1lZGlhU3RyZWFtIEF1ZGlvIEVycm9yYCwgZSkpO1xuXG4gICAgICAgIHBlbmRpbmdNZWRpYVJlcXVlc3RzLmF1ZGlvLnByb21pc2UgPSBhdWRpb1Byb21pc2U7XG5cbiAgICAgICAgY29uc3QgdmlkZW9Qcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIHBlbmRpbmdNZWRpYVJlcXVlc3RzLnZpZGVvID0geyByZXNvbHZlLCByZWplY3QgfTtcbiAgICAgICAgfSkuY2F0Y2goZSA9PiBOQUYubG9nLndhcm4oYCR7Y2xpZW50SWR9IGdldE1lZGlhU3RyZWFtIFZpZGVvIEVycm9yYCwgZSkpO1xuICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0cy52aWRlby5wcm9taXNlID0gdmlkZW9Qcm9taXNlO1xuXG4gICAgICAgIHRoaXMucGVuZGluZ01lZGlhUmVxdWVzdHMuc2V0KGNsaWVudElkLCBwZW5kaW5nTWVkaWFSZXF1ZXN0cyk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBlbmRpbmdNZWRpYVJlcXVlc3RzID0gdGhpcy5wZW5kaW5nTWVkaWFSZXF1ZXN0cy5nZXQoY2xpZW50SWQpO1xuXG4gICAgICAvLyBDcmVhdGUgaW5pdGlhbCBwZW5kaW5nTWVkaWFSZXF1ZXN0cyB3aXRoIHN0cmVhbU5hbWVcbiAgICAgIGlmICghcGVuZGluZ01lZGlhUmVxdWVzdHNbc3RyZWFtTmFtZV0pIHtcbiAgICAgICAgY29uc3Qgc3RyZWFtUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0c1tzdHJlYW1OYW1lXSA9IHsgcmVzb2x2ZSwgcmVqZWN0IH07XG4gICAgICAgIH0pLmNhdGNoKGUgPT4gTkFGLmxvZy53YXJuKGAke2NsaWVudElkfSBnZXRNZWRpYVN0cmVhbSBcIiR7c3RyZWFtTmFtZX1cIiBFcnJvcmAsIGUpKTtcbiAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHNbc3RyZWFtTmFtZV0ucHJvbWlzZSA9IHN0cmVhbVByb21pc2U7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnBlbmRpbmdNZWRpYVJlcXVlc3RzLmdldChjbGllbnRJZClbc3RyZWFtTmFtZV0ucHJvbWlzZTtcbiAgICB9XG4gIH1cblxuICBzZXRNZWRpYVN0cmVhbShjbGllbnRJZCwgc3RyZWFtLCBzdHJlYW1OYW1lKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNldE1lZGlhU3RyZWFtIFwiLCBjbGllbnRJZCwgc3RyZWFtLCBzdHJlYW1OYW1lKTtcbiAgICBjb25zdCBwZW5kaW5nTWVkaWFSZXF1ZXN0cyA9IHRoaXMucGVuZGluZ01lZGlhUmVxdWVzdHMuZ2V0KGNsaWVudElkKTsgLy8gcmV0dXJuIHVuZGVmaW5lZCBpZiB0aGVyZSBpcyBubyBlbnRyeSBpbiB0aGUgTWFwXG4gICAgY29uc3QgY2xpZW50TWVkaWFTdHJlYW1zID0gdGhpcy5tZWRpYVN0cmVhbXNbY2xpZW50SWRdID0gdGhpcy5tZWRpYVN0cmVhbXNbY2xpZW50SWRdIHx8IHt9O1xuXG4gICAgaWYgKHN0cmVhbU5hbWUgPT09ICdkZWZhdWx0Jykge1xuICAgICAgLy8gU2FmYXJpIGRvZXNuJ3QgbGlrZSBpdCB3aGVuIHlvdSB1c2UgYSBtaXhlZCBtZWRpYSBzdHJlYW0gd2hlcmUgb25lIG9mIHRoZSB0cmFja3MgaXMgaW5hY3RpdmUsIHNvIHdlXG4gICAgICAvLyBzcGxpdCB0aGUgdHJhY2tzIGludG8gdHdvIHN0cmVhbXMuXG4gICAgICAvLyBBZGQgbWVkaWFTdHJlYW1zIGF1ZGlvIHN0cmVhbU5hbWUgYWxpYXNcbiAgICAgIGNvbnN0IGF1ZGlvVHJhY2tzID0gc3RyZWFtLmdldEF1ZGlvVHJhY2tzKCk7XG4gICAgICBpZiAoYXVkaW9UcmFja3MubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBhdWRpb1N0cmVhbSA9IG5ldyBNZWRpYVN0cmVhbSgpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGF1ZGlvVHJhY2tzLmZvckVhY2godHJhY2sgPT4gYXVkaW9TdHJlYW0uYWRkVHJhY2sodHJhY2spKTtcbiAgICAgICAgICBjbGllbnRNZWRpYVN0cmVhbXMuYXVkaW8gPSBhdWRpb1N0cmVhbTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIE5BRi5sb2cud2FybihgJHtjbGllbnRJZH0gc2V0TWVkaWFTdHJlYW0gXCJhdWRpb1wiIGFsaWFzIEVycm9yYCwgZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZXNvbHZlIHRoZSBwcm9taXNlIGZvciB0aGUgdXNlcidzIG1lZGlhIHN0cmVhbSBhdWRpbyBhbGlhcyBpZiBpdCBleGlzdHMuXG4gICAgICAgIGlmIChwZW5kaW5nTWVkaWFSZXF1ZXN0cykgcGVuZGluZ01lZGlhUmVxdWVzdHMuYXVkaW8ucmVzb2x2ZShhdWRpb1N0cmVhbSk7XG4gICAgICB9XG5cbiAgICAgIC8vIEFkZCBtZWRpYVN0cmVhbXMgdmlkZW8gc3RyZWFtTmFtZSBhbGlhc1xuICAgICAgY29uc3QgdmlkZW9UcmFja3MgPSBzdHJlYW0uZ2V0VmlkZW9UcmFja3MoKTtcbiAgICAgIGlmICh2aWRlb1RyYWNrcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IHZpZGVvU3RyZWFtID0gbmV3IE1lZGlhU3RyZWFtKCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdmlkZW9UcmFja3MuZm9yRWFjaCh0cmFjayA9PiB2aWRlb1N0cmVhbS5hZGRUcmFjayh0cmFjaykpO1xuICAgICAgICAgIGNsaWVudE1lZGlhU3RyZWFtcy52aWRlbyA9IHZpZGVvU3RyZWFtO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgTkFGLmxvZy53YXJuKGAke2NsaWVudElkfSBzZXRNZWRpYVN0cmVhbSBcInZpZGVvXCIgYWxpYXMgRXJyb3JgLCBlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlc29sdmUgdGhlIHByb21pc2UgZm9yIHRoZSB1c2VyJ3MgbWVkaWEgc3RyZWFtIHZpZGVvIGFsaWFzIGlmIGl0IGV4aXN0cy5cbiAgICAgICAgaWYgKHBlbmRpbmdNZWRpYVJlcXVlc3RzKSBwZW5kaW5nTWVkaWFSZXF1ZXN0cy52aWRlby5yZXNvbHZlKHZpZGVvU3RyZWFtKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY2xpZW50TWVkaWFTdHJlYW1zW3N0cmVhbU5hbWVdID0gc3RyZWFtO1xuXG4gICAgICAvLyBSZXNvbHZlIHRoZSBwcm9taXNlIGZvciB0aGUgdXNlcidzIG1lZGlhIHN0cmVhbSBieSBTdHJlYW1OYW1lIGlmIGl0IGV4aXN0cy5cbiAgICAgIGlmIChwZW5kaW5nTWVkaWFSZXF1ZXN0cyAmJiBwZW5kaW5nTWVkaWFSZXF1ZXN0c1tzdHJlYW1OYW1lXSkge1xuICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0c1tzdHJlYW1OYW1lXS5yZXNvbHZlKHN0cmVhbSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0SW50Qnl0ZXMoeCkge1xuICAgIHZhciBieXRlcyA9IFtdO1xuICAgIHZhciBpID0gdGhpcy5DdXN0b21EYXRMZW5ndGhCeXRlQ291bnQ7XG4gICAgZG8ge1xuICAgICAgYnl0ZXNbLS1pXSA9IHggJiAoMjU1KTtcbiAgICAgIHggPSB4ID4+IDg7XG4gICAgfSB3aGlsZSAoaSlcbiAgICByZXR1cm4gYnl0ZXM7XG4gIH1cblxuICBhZGRMb2NhbE1lZGlhU3RyZWFtKHN0cmVhbSwgc3RyZWFtTmFtZSkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBhZGRMb2NhbE1lZGlhU3RyZWFtIFwiLCBzdHJlYW0sIHN0cmVhbU5hbWUpO1xuICAgIGNvbnN0IGVhc3lydGMgPSB0aGlzLmVhc3lydGM7XG4gICAgc3RyZWFtTmFtZSA9IHN0cmVhbU5hbWUgfHwgc3RyZWFtLmlkO1xuICAgIHRoaXMuc2V0TWVkaWFTdHJlYW0oXCJsb2NhbFwiLCBzdHJlYW0sIHN0cmVhbU5hbWUpO1xuICAgIGVhc3lydGMucmVnaXN0ZXIzcmRQYXJ0eUxvY2FsTWVkaWFTdHJlYW0oc3RyZWFtLCBzdHJlYW1OYW1lKTtcblxuICAgIC8vIEFkZCBsb2NhbCBzdHJlYW0gdG8gZXhpc3RpbmcgY29ubmVjdGlvbnNcbiAgICBPYmplY3Qua2V5cyh0aGlzLnJlbW90ZUNsaWVudHMpLmZvckVhY2goY2xpZW50SWQgPT4ge1xuICAgICAgaWYgKGVhc3lydGMuZ2V0Q29ubmVjdFN0YXR1cyhjbGllbnRJZCkgIT09IGVhc3lydGMuTk9UX0NPTk5FQ1RFRCkge1xuICAgICAgICBlYXN5cnRjLmFkZFN0cmVhbVRvQ2FsbChjbGllbnRJZCwgc3RyZWFtTmFtZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICByZW1vdmVMb2NhbE1lZGlhU3RyZWFtKHN0cmVhbU5hbWUpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgcmVtb3ZlTG9jYWxNZWRpYVN0cmVhbSBcIiwgc3RyZWFtTmFtZSk7XG4gICAgdGhpcy5lYXN5cnRjLmNsb3NlTG9jYWxNZWRpYVN0cmVhbShzdHJlYW1OYW1lKTtcbiAgICBkZWxldGUgdGhpcy5tZWRpYVN0cmVhbXNbXCJsb2NhbFwiXVtzdHJlYW1OYW1lXTtcbiAgfVxuXG4gIGVuYWJsZU1pY3JvcGhvbmUoZW5hYmxlZCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBlbmFibGVNaWNyb3Bob25lIFwiLCBlbmFibGVkKTtcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlTWljcm9waG9uZShlbmFibGVkKTtcbiAgfVxuXG4gIGVuYWJsZUNhbWVyYShlbmFibGVkKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGVuYWJsZUNhbWVyYSBcIiwgZW5hYmxlZCk7XG4gICAgdGhpcy5lYXN5cnRjLmVuYWJsZUNhbWVyYShlbmFibGVkKTtcbiAgfVxuXG4gIGRpc2Nvbm5lY3QoKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGRpc2Nvbm5lY3QgXCIpO1xuICAgIHRoaXMuZWFzeXJ0Yy5kaXNjb25uZWN0KCk7XG4gIH1cblxuICBhc3luYyBoYW5kbGVVc2VyUHVibGlzaGVkKHVzZXIsIG1lZGlhVHlwZSkgeyB9XG5cbiAgaGFuZGxlVXNlclVucHVibGlzaGVkKHVzZXIsIG1lZGlhVHlwZSkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBoYW5kbGVVc2VyVW5QdWJsaXNoZWQgXCIpO1xuICB9XG5cbiAgZ2V0SW5wdXRMZXZlbCh0cmFjaykge1xuICAgIHZhciBhbmFseXNlciA9IHRyYWNrLl9zb3VyY2Uudm9sdW1lTGV2ZWxBbmFseXNlci5hbmFseXNlck5vZGU7XG4gICAgLy92YXIgYW5hbHlzZXIgPSB0cmFjay5fc291cmNlLmFuYWx5c2VyTm9kZTtcbiAgICBjb25zdCBidWZmZXJMZW5ndGggPSBhbmFseXNlci5mcmVxdWVuY3lCaW5Db3VudDtcbiAgICB2YXIgZGF0YSA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlckxlbmd0aCk7XG4gICAgYW5hbHlzZXIuZ2V0Qnl0ZUZyZXF1ZW5jeURhdGEoZGF0YSk7XG4gICAgdmFyIHZhbHVlcyA9IDA7XG4gICAgdmFyIGF2ZXJhZ2U7XG4gICAgdmFyIGxlbmd0aCA9IGRhdGEubGVuZ3RoO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhbHVlcyArPSBkYXRhW2ldO1xuICAgIH1cbiAgICBhdmVyYWdlID0gTWF0aC5mbG9vcih2YWx1ZXMgLyBsZW5ndGgpO1xuICAgIHJldHVybiBhdmVyYWdlO1xuICB9XG5cbiAgIGdlbmVyYXRlSWQobGVuZ3RoKSB7XG4gICAgbGV0IHJlc3VsdCA9ICcnO1xuICAgIGNvbnN0IGNoYXJhY3RlcnMgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODknO1xuICAgIGNvbnN0IGNoYXJhY3RlcnNMZW5ndGggPSBjaGFyYWN0ZXJzLmxlbmd0aDtcbiAgICBsZXQgY291bnRlciA9IDA7XG4gICAgd2hpbGUgKGNvdW50ZXIgPCBsZW5ndGgpIHtcbiAgICAgIHJlc3VsdCArPSBjaGFyYWN0ZXJzLmNoYXJBdChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjaGFyYWN0ZXJzTGVuZ3RoKSk7XG4gICAgICBjb3VudGVyICs9IDE7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbiAgdm9pY2VBY3Rpdml0eURldGVjdGlvbigpIHtcbiAgICBpZiAoIXRoaXMuX3ZhZF9hdWRpb1RyYWNrIHx8ICF0aGlzLl92YWRfYXVkaW9UcmFjay5fZW5hYmxlZClcbiAgICAgIHJldHVybjtcblxuICAgIHZhciBhdWRpb0xldmVsID0gdGhpcy5nZXRJbnB1dExldmVsKHRoaXMuX3ZhZF9hdWRpb1RyYWNrKTtcbiAgICBpZiAoYXVkaW9MZXZlbCA8PSB0aGlzLl92YWRfTWF4QmFja2dyb3VuZE5vaXNlTGV2ZWwpIHtcbiAgICAgIGlmICh0aGlzLl92YWRfYXVkaW9TYW1wbGVzQXJyLmxlbmd0aCA+PSB0aGlzLl92YWRfTWF4QXVkaW9TYW1wbGVzKSB7XG4gICAgICAgIHZhciByZW1vdmVkID0gdGhpcy5fdmFkX2F1ZGlvU2FtcGxlc0Fyci5zaGlmdCgpO1xuICAgICAgICB2YXIgcmVtb3ZlZEluZGV4ID0gdGhpcy5fdmFkX2F1ZGlvU2FtcGxlc0FyclNvcnRlZC5pbmRleE9mKHJlbW92ZWQpO1xuICAgICAgICBpZiAocmVtb3ZlZEluZGV4ID4gLTEpIHtcbiAgICAgICAgICB0aGlzLl92YWRfYXVkaW9TYW1wbGVzQXJyU29ydGVkLnNwbGljZShyZW1vdmVkSW5kZXgsIDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLl92YWRfYXVkaW9TYW1wbGVzQXJyLnB1c2goYXVkaW9MZXZlbCk7XG4gICAgICB0aGlzLl92YWRfYXVkaW9TYW1wbGVzQXJyU29ydGVkLnB1c2goYXVkaW9MZXZlbCk7XG4gICAgICB0aGlzLl92YWRfYXVkaW9TYW1wbGVzQXJyU29ydGVkLnNvcnQoKGEsIGIpID0+IGEgLSBiKTtcbiAgICB9XG4gICAgdmFyIGJhY2tncm91bmQgPSBNYXRoLmZsb29yKDMgKiB0aGlzLl92YWRfYXVkaW9TYW1wbGVzQXJyU29ydGVkW01hdGguZmxvb3IodGhpcy5fdmFkX2F1ZGlvU2FtcGxlc0FyclNvcnRlZC5sZW5ndGggLyAyKV0gLyAyKTtcbiAgICBpZiAoYXVkaW9MZXZlbCA+IGJhY2tncm91bmQgKyB0aGlzLl92YWRfU2lsZW5jZU9mZmVzZXQpIHtcbiAgICAgIHRoaXMuX3ZhZF9leGNlZWRDb3VudCsrO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl92YWRfZXhjZWVkQ291bnQgPSAwO1xuICAgIH1cblxuXG4gICAgaWYgKHRoaXMuX3ZhZF9leGNlZWRDb3VudCA+IHRoaXMuX3ZhZF9leGNlZWRDb3VudFRocmVzaG9sZExvdykge1xuICAgICAgLy9BZ29yYVJUQ1V0aWxFdmVudHMuZW1pdChcIlZvaWNlQWN0aXZpdHlEZXRlY3RlZEZhc3RcIiwgdGhpcy5fdmFkX2V4Y2VlZENvdW50KTtcbiAgICAgIHdpbmRvdy5fc3RhdGVfc3RvcF9hdCA9IERhdGUubm93KCk7XG4gICAgICAvL2NvbnNvbGUubG9nKFwiQk9PTVwiLCBhdWRpb0xldmVsLCBiYWNrZ3JvdW5kLCB0aGlzLl92YWRfU2lsZW5jZU9mZmVzZXQsdGhpcy5fdmFkX2V4Y2VlZENvdW50LHRoaXMuX3ZhZF9leGNlZWRDb3VudFRocmVzaG9sZExvdyk7XG4gICAgICAvLyAgICB9IGVsc2Uge1xuICAgICAgLy8gICAgICBjb25zb2xlLmxvZyhhdWRpb0xldmVsLCBiYWNrZ3JvdW5kLCB0aGlzLl92YWRfU2lsZW5jZU9mZmVzZXQsdGhpcy5fdmFkX2V4Y2VlZENvdW50LHRoaXMuX3ZhZF9leGNlZWRDb3VudFRocmVzaG9sZExvdyk7XG5cbiAgICB9XG5cbiAgICBpZiAodGhpcy5fdmFkX2V4Y2VlZENvdW50ID4gdGhpcy5fdmFkX2V4Y2VlZENvdW50VGhyZXNob2xkKSB7XG4gICAgICAvL0Fnb3JhUlRDVXRpbEV2ZW50cy5lbWl0KFwiVm9pY2VBY3Rpdml0eURldGVjdGVkXCIsIHRoaXMuX3ZhZF9leGNlZWRDb3VudCk7XG4gICAgICB0aGlzLl92YWRfZXhjZWVkQ291bnQgPSAwO1xuICAgICAgd2luZG93Ll9zdGF0ZV9zdG9wX2F0ID0gRGF0ZS5ub3coKTtcbiAgICAgIC8vICAgY29uc29sZS5lcnJvcihcIlZBRCBcIixEYXRlLm5vdygpLXdpbmRvdy5fc3RhdGVfc3RvcF9hdCk7XG4gICAgfVxuXG4gIH1cblxuICBhc3luYyBjb25uZWN0QWdvcmEoc3VjY2VzcywgZmFpbHVyZSkge1xuICAgIC8vIEFkZCBhbiBldmVudCBsaXN0ZW5lciB0byBwbGF5IHJlbW90ZSB0cmFja3Mgd2hlbiByZW1vdGUgdXNlciBwdWJsaXNoZXMuXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgdGhpcy5hZ29yYUNsaWVudCA9IEFnb3JhUlRDLmNyZWF0ZUNsaWVudCh7IG1vZGU6IFwibGl2ZVwiLCBjb2RlYzogXCJ2cDhcIiB9KTtcbiAgICBBZ29yYVJUQy5zZXRQYXJhbWV0ZXIoJ1NZTkNfR1JPVVAnLCBmYWxzZSk7XG4gICAgLy8gICAgQWdvcmFSVEMuc2V0UGFyYW1ldGVyKCdTVUJTQ1JJQkVfVFdDQycsIHRydWUpO1xuICAgIHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIHRoaXMucmVhZFN0YXRzKCk7XG4gICAgfSwgMTAwMCk7XG5cblxuICAgIGlmICh0aGlzLmVuYWJsZVZpZGVvRmlsdGVyZWQgfHwgdGhpcy5lbmFibGVWaWRlbyB8fCB0aGlzLmVuYWJsZUF1ZGlvKSB7XG4gICAgICAvL3RoaXMuYWdvcmFDbGllbnQgPSBBZ29yYVJUQy5jcmVhdGVDbGllbnQoeyBtb2RlOiBcInJ0Y1wiLCBjb2RlYzogXCJ2cDhcIiB9KTtcbiAgICAgIC8vdGhpcy5hZ29yYUNsaWVudCA9IEFnb3JhUlRDLmNyZWF0ZUNsaWVudCh7IG1vZGU6IFwibGl2ZVwiLCBjb2RlYzogXCJoMjY0XCIgfSk7XG4gICAgICB0aGlzLmFnb3JhQ2xpZW50LnNldENsaWVudFJvbGUoXCJob3N0XCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvL3RoaXMuYWdvcmFDbGllbnQgPSBBZ29yYVJUQy5jcmVhdGVDbGllbnQoeyBtb2RlOiBcImxpdmVcIiwgY29kZWM6IFwiaDI2NFwiIH0pO1xuICAgICAgLy90aGlzLmFnb3JhQ2xpZW50ID0gQWdvcmFSVEMuY3JlYXRlQ2xpZW50KHsgbW9kZTogXCJsaXZlXCIsIGNvZGVjOiBcInZwOFwiIH0pO1xuICAgIH1cblxuICAgIHRoaXMuYWdvcmFDbGllbnQub24oXCJ1c2VyLWpvaW5lZFwiLCBhc3luYyAodXNlcikgPT4ge1xuICAgICAgaWYgKHRoaXMuYWdvcmFSVE0gJiYgIXRoaXMuYWdvcmFSVE0yKSB7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhcInVzZXItam9pbmVkXCIsIHVzZXIudWlkLCB0aGlzLm9jY3VwYW50TGlzdCk7XG4gICAgICAgIHRoaXMub2NjdXBhbnRMaXN0W3VzZXIudWlkXT11c2VyLnVpZDtcbiAgICAgICAgbGV0IGNvcHk9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5vY2N1cGFudExpc3QpKTtcbiAgICAgICAgdGhpcy5vY2N1cGFudExpc3RlbmVyKGNvcHkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuYWdvcmFDbGllbnQub24oXCJ1c2VyLWxlZnRcIiwgYXN5bmMgKHVzZXIpID0+IHsgICBcbiAgICAgIGlmICh0aGlzLmFnb3JhUlRNICYmICF0aGlzLmFnb3JhUlRNMikgeyAgIFxuICAgICAgICBjb25zb2xlLmluZm8oXCJ1c2VyLWxlZnRcIiwgdXNlci51aWQsIHRoaXMub2NjdXBhbnRMaXN0KTtcbiAgICAgICAgZGVsZXRlIHRoaXMub2NjdXBhbnRMaXN0W3VzZXIudWlkXTtcbiAgICAgICAgbGV0IGNvcHk9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5vY2N1cGFudExpc3QpKTtcbiAgICAgICAgdGhpcy5vY2N1cGFudExpc3RlbmVyKGNvcHkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIFxuICAgIHRoaXMuYWdvcmFDbGllbnQub24oXCJ1c2VyLXB1Ymxpc2hlZFwiLCBhc3luYyAodXNlciwgbWVkaWFUeXBlKSA9PiB7XG5cbiAgICAgIGxldCBjbGllbnRJZCA9IHVzZXIudWlkO1xuICAgICAgY29uc29sZS5sb2coXCJCVzczIGhhbmRsZVVzZXJQdWJsaXNoZWQgXCIgKyBjbGllbnRJZCArIFwiIFwiICsgbWVkaWFUeXBlLCB0aGF0LmFnb3JhQ2xpZW50KTtcbiAgICAgIGF3YWl0IHRoYXQuYWdvcmFDbGllbnQuc3Vic2NyaWJlKHVzZXIsIG1lZGlhVHlwZSk7XG4gICAgICBjb25zb2xlLmxvZyhcIkJXNzMgaGFuZGxlVXNlclB1Ymxpc2hlZDIgXCIgKyBjbGllbnRJZCArIFwiIFwiICsgdGhhdC5hZ29yYUNsaWVudCk7XG5cbiAgICAgIGNvbnN0IHBlbmRpbmdNZWRpYVJlcXVlc3RzID0gdGhhdC5wZW5kaW5nTWVkaWFSZXF1ZXN0cy5nZXQoY2xpZW50SWQpO1xuICAgICAgY29uc3QgY2xpZW50TWVkaWFTdHJlYW1zID0gdGhhdC5tZWRpYVN0cmVhbXNbY2xpZW50SWRdID0gdGhhdC5tZWRpYVN0cmVhbXNbY2xpZW50SWRdIHx8IHt9O1xuXG4gICAgICBpZiAobWVkaWFUeXBlID09PSAnYXVkaW8nKSB7XG4gICAgICAgIC8vaWYgKG5hdmlnYXRvci5wbGF0Zm9ybS5pbmRleE9mKCdpUGFkJyk+LTEgfHwgbmF2aWdhdG9yLnBsYXRmb3JtLmluZGV4T2YoJ2lQaG9uZScpPi0xKVxuICAgICAgICAvL3sgLy8gdG9vIHF1aWV0XG4gICAgICAgIC8vICAgICAgICAgIGNvbnNvbGUubG9nKFwiaU9TIHBsYXkgc3BlYWtlclwiKTtcbiAgICAgICAgICB1c2VyLmF1ZGlvVHJhY2sucGxheSgpO1xuICAgICAgICAvLyAgICAgIH1cblxuICAgICAgICBjb25zdCBhdWRpb1N0cmVhbSA9IG5ldyBNZWRpYVN0cmVhbSgpO1xuICAgICAgICBjb25zb2xlLmxvZyhcInVzZXIuYXVkaW9UcmFjayBcIiwgdXNlci5hdWRpb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrKTtcbiAgICAgICAgYXVkaW9TdHJlYW0uYWRkVHJhY2sodXNlci5hdWRpb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrKTtcbiAgICAgICAgY2xpZW50TWVkaWFTdHJlYW1zLmF1ZGlvID0gYXVkaW9TdHJlYW07XG4gICAgICAgIGlmIChwZW5kaW5nTWVkaWFSZXF1ZXN0cykgcGVuZGluZ01lZGlhUmVxdWVzdHMuYXVkaW8ucmVzb2x2ZShhdWRpb1N0cmVhbSk7XG4gICAgICB9XG5cbiAgICAgIGxldCB2aWRlb1N0cmVhbSA9IG51bGw7XG4gICAgICBpZiAobWVkaWFUeXBlID09PSAndmlkZW8nKSB7XG4gICAgICAgIHZpZGVvU3RyZWFtID0gbmV3IE1lZGlhU3RyZWFtKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwidXNlci52aWRlb1RyYWNrIFwiLCB1c2VyLnZpZGVvVHJhY2suX21lZGlhU3RyZWFtVHJhY2spO1xuICAgICAgICB2aWRlb1N0cmVhbS5hZGRUcmFjayh1c2VyLnZpZGVvVHJhY2suX21lZGlhU3RyZWFtVHJhY2spO1xuICAgICAgICBjbGllbnRNZWRpYVN0cmVhbXMudmlkZW8gPSB2aWRlb1N0cmVhbTtcbiAgICAgICAgaWYgKHBlbmRpbmdNZWRpYVJlcXVlc3RzKSBwZW5kaW5nTWVkaWFSZXF1ZXN0cy52aWRlby5yZXNvbHZlKHZpZGVvU3RyZWFtKTtcbiAgICAgICAgLy91c2VyLnZpZGVvVHJhY2tcbiAgICAgIH1cblxuICAgICAgaWYgKGNsaWVudElkID09ICdDQ0MnKSB7XG4gICAgICAgIGlmIChtZWRpYVR5cGUgPT09ICd2aWRlbycpIHtcbiAgICAgICAgICAvLyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInZpZGVvMzYwXCIpLnNyY09iamVjdD12aWRlb1N0cmVhbTtcbiAgICAgICAgICAvL2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdmlkZW8zNjBcIikuc2V0QXR0cmlidXRlKFwic3JjXCIsIHZpZGVvU3RyZWFtKTtcbiAgICAgICAgICAvL2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdmlkZW8zNjBcIikuc2V0QXR0cmlidXRlKFwic3JjXCIsIHVzZXIudmlkZW9UcmFjay5fbWVkaWFTdHJlYW1UcmFjayk7XG4gICAgICAgICAgLy9kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3ZpZGVvMzYwXCIpLnNyY09iamVjdD0gdXNlci52aWRlb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrO1xuICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdmlkZW8zNjBcIikuc3JjT2JqZWN0ID0gdmlkZW9TdHJlYW07XG4gICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN2aWRlbzM2MFwiKS5wbGF5KCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1lZGlhVHlwZSA9PT0gJ2F1ZGlvJykge1xuICAgICAgICAgIHVzZXIuYXVkaW9UcmFjay5wbGF5KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChjbGllbnRJZCA9PSAnREREJykge1xuICAgICAgICBpZiAobWVkaWFUeXBlID09PSAndmlkZW8nKSB7XG4gICAgICAgICAgdXNlci52aWRlb1RyYWNrLnBsYXkoXCJ2aWRlbzM2MFwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobWVkaWFUeXBlID09PSAnYXVkaW8nKSB7XG4gICAgICAgICAgdXNlci5hdWRpb1RyYWNrLnBsYXkoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG5cbiAgICAgIGxldCBlbmNfaWQgPSAnbmEnO1xuICAgICAgaWYgKG1lZGlhVHlwZSA9PT0gJ2F1ZGlvJykge1xuICAgICAgICBlbmNfaWQgPSB1c2VyLmF1ZGlvVHJhY2suX21lZGlhU3RyZWFtVHJhY2suaWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBlbmNfaWQ9dXNlci52aWRlb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrLmlkO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwYyA9IHRoaXMuYWdvcmFDbGllbnQuX3AycENoYW5uZWwuY29ubmVjdGlvbi5wZWVyQ29ubmVjdGlvbjtcbiAgICAgIGNvbnN0IHJlY2VpdmVycyA9IHBjLmdldFJlY2VpdmVycygpO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZWNlaXZlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHJlY2VpdmVyc1tpXS50cmFjayAmJiByZWNlaXZlcnNbaV0udHJhY2suaWQgPT09IGVuY19pZCkge1xuICAgICAgICAgIC8vY29uc29sZS53YXJuKFwiTWF0Y2hcIiwgbWVkaWFUeXBlLCBlbmNfaWQpO1xuICAgICAgICAgIC8vICAgICAgICAgIHRoaXMucl9yZWNlaXZlcj1yZWNlaXZlcnNbaV07XG4gICAgICAgICAgLy90aGlzLnJfY2xpZW50SWQ9Y2xpZW50SWQ7XG4gICAgICAgICAgdGhpcy5jcmVhdGVEZWNvZGVyKHJlY2VpdmVyc1tpXSwgY2xpZW50SWQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmFnb3JhQ2xpZW50Lm9uKFwidXNlci11bnB1Ymxpc2hlZFwiLCB0aGF0LmhhbmRsZVVzZXJVbnB1Ymxpc2hlZCk7XG5cbiAgICBjb25zb2xlLmxvZyhcImNvbm5lY3QgYWdvcmEgXCIgKyB0aGlzLmNsaWVudElkKTtcbiAgICAvLyBKb2luIGEgY2hhbm5lbCBhbmQgY3JlYXRlIGxvY2FsIHRyYWNrcy4gQmVzdCBwcmFjdGljZSBpcyB0byB1c2UgUHJvbWlzZS5hbGwgYW5kIHJ1biB0aGVtIGNvbmN1cnJlbnRseS5cbiAgICAvLyBvXG5cbiAgICBpZiAodGhpcy5lbmFibGVBdmF0YXIpIHtcbiAgICAgIHZhciBzdHJlYW0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbnZhc1wiKS5jYXB0dXJlU3RyZWFtKDMwKTtcbiAgICAgIFt0aGlzLnVzZXJpZCwgdGhpcy5sb2NhbFRyYWNrcy5hdWRpb1RyYWNrLCB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2tdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICB0aGlzLmFnb3JhQ2xpZW50LmpvaW4odGhpcy5hcHBpZCwgdGhpcy5yb29tLCB0aGlzLnRva2VuIHx8IG51bGwsIHRoaXMuY2xpZW50SWQgfHwgbnVsbCksXG4gICAgICAgIEFnb3JhUlRDLmNyZWF0ZU1pY3JvcGhvbmVBdWRpb1RyYWNrKCksIEFnb3JhUlRDLmNyZWF0ZUN1c3RvbVZpZGVvVHJhY2soeyBtZWRpYVN0cmVhbVRyYWNrOiBzdHJlYW0uZ2V0VmlkZW9UcmFja3MoKVswXSB9KV0pO1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLmVuYWJsZVZpZGVvRmlsdGVyZWQgJiYgdGhpcy5lbmFibGVBdWRpbykge1xuICAgICAgdmFyIHN0cmVhbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2FudmFzX3NlY3JldFwiKS5jYXB0dXJlU3RyZWFtKDMwKTtcbiAgICAgIFt0aGlzLnVzZXJpZCwgdGhpcy5sb2NhbFRyYWNrcy5hdWRpb1RyYWNrLCB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2tdID0gYXdhaXQgUHJvbWlzZS5hbGwoW3RoaXMuYWdvcmFDbGllbnQuam9pbih0aGlzLmFwcGlkLCB0aGlzLnJvb20sIHRoaXMudG9rZW4gfHwgbnVsbCwgdGhpcy5jbGllbnRJZCB8fCBudWxsKSwgQWdvcmFSVEMuY3JlYXRlTWljcm9waG9uZUF1ZGlvVHJhY2soKSwgQWdvcmFSVEMuY3JlYXRlQ3VzdG9tVmlkZW9UcmFjayh7IG1lZGlhU3RyZWFtVHJhY2s6IHN0cmVhbS5nZXRWaWRlb1RyYWNrcygpWzBdIH0pXSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRoaXMuZW5hYmxlVmlkZW8gJiYgdGhpcy5lbmFibGVBdWRpbykge1xuICAgICAgW3RoaXMudXNlcmlkLCB0aGlzLmxvY2FsVHJhY2tzLmF1ZGlvVHJhY2ssIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFja10gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgIHRoaXMuYWdvcmFDbGllbnQuam9pbih0aGlzLmFwcGlkLCB0aGlzLnJvb20sIHRoaXMudG9rZW4gfHwgbnVsbCwgdGhpcy5jbGllbnRJZCB8fCBudWxsKSxcbiAgICAgICAgQWdvcmFSVEMuY3JlYXRlTWljcm9waG9uZUF1ZGlvVHJhY2soKSwgQWdvcmFSVEMuY3JlYXRlQ2FtZXJhVmlkZW9UcmFjayh7IGVuY29kZXJDb25maWc6ICc0ODBwXzInIH0pXSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmVuYWJsZVZpZGVvKSB7XG4gICAgICBbdGhpcy51c2VyaWQsIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFja10gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgIC8vIEpvaW4gdGhlIGNoYW5uZWwuXG4gICAgICAgIHRoaXMuYWdvcmFDbGllbnQuam9pbih0aGlzLmFwcGlkLCB0aGlzLnJvb20sIHRoaXMudG9rZW4gfHwgbnVsbCwgdGhpcy5jbGllbnRJZCB8fCBudWxsKSwgQWdvcmFSVEMuY3JlYXRlQ2FtZXJhVmlkZW9UcmFjayhcIjM2MHBfNFwiKV0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5lbmFibGVBdWRpbykge1xuICAgICAgbGV0IGF1ZGlvX3RyYWNrO1xuICAgICAgaWYgKHdpbmRvdy5ndW1fc3RyZWFtKSB7IC8vIGF2b2lkIGRvdWJsZSBhbGxvdyBpT3NcblxuICAgICAgICBhdWRpb190cmFjayA9IEFnb3JhUlRDLmNyZWF0ZUN1c3RvbUF1ZGlvVHJhY2soeyBtZWRpYVN0cmVhbVRyYWNrOiB3aW5kb3cuZ3VtX3N0cmVhbS5nZXRBdWRpb1RyYWNrcygpWzBdIH0pO1xuICAgICAgICAvL2NvbnNvbGUud2FybihhdWRpb190cmFjaywgXCJhdWRpb190cmFja1wiKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBhdWRpb190cmFjayA9IEFnb3JhUlRDLmNyZWF0ZU1pY3JvcGhvbmVBdWRpb1RyYWNrKClcbiAgICAgIH1cblxuICAgICAgW3RoaXMudXNlcmlkLCB0aGlzLmxvY2FsVHJhY2tzLmF1ZGlvVHJhY2tdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAvLyBKb2luIHRoZSBjaGFubmVsLlxuICAgICAgICB0aGlzLmFnb3JhQ2xpZW50LmpvaW4odGhpcy5hcHBpZCwgdGhpcy5yb29tLCB0aGlzLnRva2VuIHx8IG51bGwsIHRoaXMuY2xpZW50SWQgfHwgbnVsbCksIGF1ZGlvX3RyYWNrXSk7XG4gICAgICAvL2NvbnNvbGUubG9nKFwiY3JlYXRlTWljcm9waG9uZUF1ZGlvVHJhY2tcIik7XG4gICAgICB0aGlzLl92YWRfYXVkaW9UcmFjayA9IHRoaXMubG9jYWxUcmFja3MuYXVkaW9UcmFjaztcbiAgICAgIGlmICghdGhpcy5fdm9pY2VBY3Rpdml0eURldGVjdGlvbkludGVydmFsKSB7XG4gICAgICAgIHRoaXMuX3ZvaWNlQWN0aXZpdHlEZXRlY3Rpb25JbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICB0aGlzLnZvaWNlQWN0aXZpdHlEZXRlY3Rpb24oKTtcbiAgICAgICAgfSwgdGhpcy5fdm9pY2VBY3Rpdml0eURldGVjdGlvbkZyZXF1ZW5jeSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudXNlcmlkID0gYXdhaXQgdGhpcy5hZ29yYUNsaWVudC5qb2luKHRoaXMuYXBwaWQsIHRoaXMucm9vbSwgdGhpcy50b2tlbiB8fCBudWxsLCB0aGlzLmNsaWVudElkIHx8IG51bGwpO1xuICAgIH1cblxuICAgIC8vIHNlbGVjdCBmYWNldGltZSBjYW1lcmEgaWYgZXhpc3RzXG4gICAgaWYgKHRoaXMuZW5hYmxlVmlkZW8gJiYgIXRoaXMuZW5hYmxlVmlkZW9GaWx0ZXJlZCkge1xuICAgICAgbGV0IGNhbXMgPSBhd2FpdCBBZ29yYVJUQy5nZXRDYW1lcmFzKCk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNhbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGNhbXNbaV0ubGFiZWwuaW5kZXhPZihcIkZhY2VUaW1lXCIpID09IDApIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcInNlbGVjdCBGYWNlVGltZSBjYW1lcmFcIiwgY2Ftc1tpXS5kZXZpY2VJZCk7XG4gICAgICAgICAgYXdhaXQgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrLnNldERldmljZShjYW1zW2ldLmRldmljZUlkKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmVuYWJsZVZpZGVvICYmIHRoaXMuc2hvd0xvY2FsKSB7XG4gICAgICB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2sucGxheShcImxvY2FsLXBsYXllclwiKTtcbiAgICB9XG5cbiAgICAvLyBFbmFibGUgdmlydHVhbCBiYWNrZ3JvdW5kIE9MRCBNZXRob2RcbiAgICBpZiAodGhpcy5lbmFibGVWaWRlbyAmJiB0aGlzLnZiZzAgJiYgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrKSB7XG4gICAgICBjb25zdCBpbWdFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG4gICAgICBpbWdFbGVtZW50Lm9ubG9hZCA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnZpcnR1YWxCYWNrZ3JvdW5kSW5zdGFuY2UpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIlNFRyBJTklUIFwiLCB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2spO1xuICAgICAgICAgIHRoaXMudmlydHVhbEJhY2tncm91bmRJbnN0YW5jZSA9IGF3YWl0IFNlZ1BsdWdpbi5pbmplY3QodGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrLCBcIi9hc3NldHMvd2FzbXMwXCIpLmNhdGNoKGNvbnNvbGUuZXJyb3IpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiU0VHIElOSVRFRFwiKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZpcnR1YWxCYWNrZ3JvdW5kSW5zdGFuY2Uuc2V0T3B0aW9ucyh7IGVuYWJsZTogdHJ1ZSwgYmFja2dyb3VuZDogaW1nRWxlbWVudCB9KTtcbiAgICAgIH07XG4gICAgICBpbWdFbGVtZW50LnNyYyA9ICdkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUFRQUFBQURDQUlBQUFBN2xqbVJBQUFBRDBsRVFWUjRYbU5nK00rQVFEZzVBT2s5Qy9Wa29tellBQUFBQUVsRlRrU3VRbUNDJztcbiAgICB9XG5cbiAgICAvLyBFbmFibGUgdmlydHVhbCBiYWNrZ3JvdW5kIE5ldyBNZXRob2RcbiAgICBpZiAodGhpcy5lbmFibGVWaWRlbyAmJiB0aGlzLnZiZyAmJiB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2spIHtcblxuICAgICAgdGhpcy5leHRlbnNpb24gPSBuZXcgVmlydHVhbEJhY2tncm91bmRFeHRlbnNpb24oKTtcbiAgICAgIEFnb3JhUlRDLnJlZ2lzdGVyRXh0ZW5zaW9ucyhbdGhpcy5leHRlbnNpb25dKTtcbiAgICAgIHRoaXMucHJvY2Vzc29yID0gdGhpcy5leHRlbnNpb24uY3JlYXRlUHJvY2Vzc29yKCk7XG4gICAgICBhd2FpdCB0aGlzLnByb2Nlc3Nvci5pbml0KFwiL2Fzc2V0cy93YXNtc1wiKTtcbiAgICAgIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjay5waXBlKHRoaXMucHJvY2Vzc29yKS5waXBlKHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjay5wcm9jZXNzb3JEZXN0aW5hdGlvbik7XG4gICAgICBhd2FpdCB0aGlzLnByb2Nlc3Nvci5zZXRPcHRpb25zKHsgdHlwZTogJ2NvbG9yJywgY29sb3I6IFwiIzAwZmYwMFwiIH0pO1xuICAgICAgYXdhaXQgdGhpcy5wcm9jZXNzb3IuZW5hYmxlKCk7XG4gICAgfVxuXG4gICAgd2luZG93LmxvY2FsVHJhY2tzID0gdGhpcy5sb2NhbFRyYWNrcztcblxuICAgIC8vIFB1Ymxpc2ggdGhlIGxvY2FsIHZpZGVvIGFuZCBhdWRpbyB0cmFja3MgdG8gdGhlIGNoYW5uZWwuXG4gICAgaWYgKHRoaXMuZW5hYmxlVmlkZW8gfHwgdGhpcy5lbmFibGVBdWRpbyB8fCB0aGlzLmVuYWJsZUF2YXRhcikge1xuICAgICAgaWYgKHRoaXMubG9jYWxUcmFja3MuYXVkaW9UcmFjaylcbiAgICAgICAgYXdhaXQgdGhpcy5hZ29yYUNsaWVudC5wdWJsaXNoKHRoaXMubG9jYWxUcmFja3MuYXVkaW9UcmFjayk7XG4gICAgICBpZiAodGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrKVxuICAgICAgICBhd2FpdCB0aGlzLmFnb3JhQ2xpZW50LnB1Ymxpc2godGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrKTtcblxuICAgICAgY29uc29sZS5sb2coXCJwdWJsaXNoIHN1Y2Nlc3NcIik7XG4gICAgICBjb25zdCBwYyA9IHRoaXMuYWdvcmFDbGllbnQuX3AycENoYW5uZWwuY29ubmVjdGlvbi5wZWVyQ29ubmVjdGlvbjtcbiAgICAgIGNvbnN0IHNlbmRlcnMgPSBwYy5nZXRTZW5kZXJzKCk7XG4gICAgICBsZXQgaSA9IDA7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgc2VuZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoc2VuZGVyc1tpXS50cmFjayAmJiAoc2VuZGVyc1tpXS50cmFjay5raW5kID09ICdhdWRpbycpKSB7XG4gICAgICAgICAgdGhpcy5jcmVhdGVFbmNvZGVyKHNlbmRlcnNbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUlRNXG4gICAgaWYgKHRoaXMuYWdvcmFSVE0pIHtcbiAgICAgIGlmICh0aGlzLmNsaWVudElkID09IG51bGwpIHtcbiAgICAgICAgdGhpcy5jbGllbnRJZCA9ICdYJyArIHRoaXMudXNlcmlkO1xuICAgICAgfVxuICAgICAgdGhpcy5ydG1VaWQgPSB0aGlzLmNsaWVudElkO1xuICAgICAgaWYgKHRoaXMuYWdvcmFSVE0yKSB7IC8vIDIueCBSVE1cbiAgICAgICAgQWdvcmFSVE0uc2V0QXJlYSh7IGFyZWFDb2RlczogW1wiR0xPQkFMXCJdIH0pOyAgICAgICAgXG4gICAgICAgIHRoaXMucnRtQ2xpZW50ID0gbmV3IEFnb3JhUlRNLlJUTSh0aGlzLmFwcGlkLCB0aGlzLnJ0bVVpZCwge3ByZXNlbmNlVGltZW91dDogNX0pOyBcbiAgICAgICAgdGhpcy5ydG1DbGllbnQuYWRkRXZlbnRMaXN0ZW5lcih7ICAgICAgICAgIFxuICAgICAgICAgIG1lc3NhZ2U6IChldmVudEFyZ3MpID0+IHsgLy8gTWVzc2FnZSBldmVudCBoYW5kbGVyXG4gICAgICAgICAgICB3aW5kb3cuQWdvcmFSdGNBZGFwdGVyLmhhbmRsZVJUTTIoZXZlbnRBcmdzLnB1Ymxpc2hlciwgZXZlbnRBcmdzLm1lc3NhZ2UpOyAgICAgICAgICAgIFxuICAgICAgICAgIH0sICAgICAgICAgIFxuICAgICAgICAgIHByZXNlbmNlOiAoZXZlbnRBcmdzKSA9PiB7IC8vIFByZXNlbmNlIGV2ZW50IGhhbmRsZXJcbiAgICAgICAgICAgIGlmIChldmVudEFyZ3MuZXZlbnRUeXBlID09PSBcIlNOQVBTSE9UXCIpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCB1PTA7IHU8ZXZlbnRBcmdzLnNuYXBzaG90Lmxlbmd0aDsgdSsrKXtcbiAgICAgICAgICAgICAgICAgIGxldCBwcmVzZW50PXRoaXMub2NjdXBhbnRMaXN0W2V2ZW50QXJncy5zbmFwc2hvdFt1XS51c2VySWRdO1xuICAgICAgICAgICAgICAgICAgdGhpcy5vY2N1cGFudExpc3RbZXZlbnRBcmdzLnNuYXBzaG90W3VdLnVzZXJJZF09ZXZlbnRBcmdzLnNuYXBzaG90W3VdLnVzZXJJZDtcbiAgICAgICAgICAgICAgICAgIGxldCBjb3B5PSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMub2NjdXBhbnRMaXN0KSk7XG4gICAgICAgICAgICAgICAgICB0aGlzLm9jY3VwYW50TGlzdGVuZXIoY29weSk7XG4gICAgICAgICAgICAgICAgICBpZiAoIXByZXNlbnQpe1xuICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUud2FybihcIm9wZW5MaXN0ZW5lclwiLGV2ZW50QXJncy5zbmFwc2hvdFt1XS51c2VySWQpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wZW5MaXN0ZW5lcihldmVudEFyZ3Muc25hcHNob3RbdV0udXNlcklkKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50QXJncy5ldmVudFR5cGUgPT09IFwiUkVNT1RFX0pPSU5cIikge1xuICAgICAgICAgICAgICAgICAgbGV0IHByZXNlbnQ9dGhpcy5vY2N1cGFudExpc3RbZXZlbnRBcmdzLnB1Ymxpc2hlcl07XG4gICAgICAgICAgICAgICAgICB0aGlzLm9jY3VwYW50TGlzdFtldmVudEFyZ3MucHVibGlzaGVyXT1ldmVudEFyZ3MucHVibGlzaGVyO1xuICAgICAgICAgICAgICAgICAgbGV0IGNvcHk9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5vY2N1cGFudExpc3QpKTtcbiAgICAgICAgICAgICAgICAgIHRoaXMub2NjdXBhbnRMaXN0ZW5lcihjb3B5KTtcbiAgICAgICAgICAgICAgICAgIGlmICghcHJlc2VudCl7XG4gICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS53YXJuKFwib3Blbkxpc3RlbmVyXCIsZXZlbnRBcmdzLnB1Ymxpc2hlcik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3Blbkxpc3RlbmVyKGV2ZW50QXJncy5wdWJsaXNoZXIpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChldmVudEFyZ3MuZXZlbnRUeXBlID09PSBcIlJFTU9URV9USU1FT1VUXCIgfHwgZXZlbnRBcmdzLmV2ZW50VHlwZSA9PT0gXCJSRU1PVEVfTEVBVkVcIikge1xuICAgICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMub2NjdXBhbnRMaXN0W2V2ZW50QXJncy5wdWJsaXNoZXJdO1xuICAgICAgICAgICAgICAgICAgbGV0IGNvcHk9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5vY2N1cGFudExpc3QpKTtcbiAgICAgICAgICAgICAgICAgIHRoaXMub2NjdXBhbnRMaXN0ZW5lcihjb3B5KTsgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSBcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcblxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImJlZm9yZXVubG9hZFwiLCAoKSA9PntcbiAgICAgICAgICB3aW5kb3cuQWdvcmFSdGNBZGFwdGVyLnJ0bUNsaWVudC5sb2dvdXQoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMucnRtQ2xpZW50LmxvZ2luKCk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnJ0bUNsaWVudC5zdWJzY3JpYmUodGhpcy5yb29tKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdydG0gTE9HSU4gU1VDQ0VTUyBmb3I6ICcrIHRoaXMucnRtVWlkLHJlc3VsdCk7XG4gICAgICAgICAgICBzdWNjZXNzKHRoaXMuY2xpZW50SWQpO1xuICAgICAgICB9IGNhdGNoIChzdGF0dXMpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ3J0bSBMT0dJTiBGQUlMRUQgZm9yOiAnKyB0aGlzLnJ0bVVpZCwgc3RhdHVzKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHsgIC8vIHJ0bSAxXG4gICAgICAgIHRoaXMucnRtQ2xpZW50ID0gQWdvcmFSVE0uY3JlYXRlSW5zdGFuY2UodGhpcy5hcHBpZCwgeyBsb2dGaWx0ZXI6IEFnb3JhUlRNLkxPR19GSUxURVJfT0ZGIH0pO1xuXG4gICAgICAgIHRoaXMucnRtQ2xpZW50Lm9uKCdDb25uZWN0aW9uU3RhdGVDaGFuZ2VkJywgKG5ld1N0YXRlLCByZWFzb24pID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZygndGhpcy5ydG1DbGllbnQgY29ubmVjdGlvbiBzdGF0ZSBjaGFuZ2VkIHRvICcgKyBuZXdTdGF0ZSArICcgcmVhc29uOiAnICsgcmVhc29uKTtcbiAgICAgICAgICBpZiAobmV3U3RhdGUgPT0gXCJDT05ORUNURURcIikge1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnJ0bUNsaWVudC5vbignTWVzc2FnZUZyb21QZWVyJywgKHsgdGV4dCB9LCBzZW5kZXJJZCkgPT4ge1xuICAgICAgICAgIHRoaXMuaGFuZGxlUlRNKHNlbmRlcklkLCB0ZXh0KTtcbiAgICAgICAgfSk7XG5cblxuICAgICAgICB0aGlzLnJ0bUNsaWVudC5sb2dpbih7IHRva2VuOiBudWxsLCB1aWQ6IHRoaXMucnRtVWlkIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHRoaXMucnRtQ2hhbm5lbCA9IHRoaXMucnRtQ2xpZW50LmNyZWF0ZUNoYW5uZWwodGhpcy5yb29tKTtcbiAgICAgICAgICB0aGlzLnJ0bUNoYW5uZWwub24oJ01lbWJlckpvaW5lZCcsIChtZW1iZXJJZCkgPT4ge1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMucnRtQ2hhbm5lbC5vbignTWVtYmVyTGVmdCcsIChtZW1iZXJJZCkgPT4ge1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMucnRtQ2hhbm5lbC5qb2luKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJ0bUNoYW5uZWwub24oJ0NoYW5uZWxNZXNzYWdlJywgKHsgdGV4dCB9LCBzZW5kZXJJZCkgPT4ge1xuICAgICAgICAgICAgICB0aGlzLmhhbmRsZVJUTShzZW5kZXJJZCwgdGV4dCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHN1Y2Nlc3ModGhpcy5jbGllbnRJZCk7Ly9bdGhpcy5jbGllbnRJZCx0aGlzLmNsaWVudElkXSk7XG4gICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0Fnb3JhUlRNIGNsaWVudCBqb2luIGZhaWx1cmUnLCBlcnJvcik7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnQWdvcmFSVE0gY2xpZW50IGxvZ2luIGZhaWx1cmUnLCBlcnJvcik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFByaXZhdGVzXG4gICAqL1xuXG4gIGFzeW5jIF9jb25uZWN0KGNvbm5lY3RTdWNjZXNzLCBjb25uZWN0RmFpbHVyZSkge1xuICAgIHZhciB0aGF0ID0gdGhpcztcbiAgIC8vIGxldCB4ID0gZnVuY3Rpb24gKCkgeyAvKiBlbXB0eSBiZWNhdXNlIC4uLiAqLyB9O1xuICAgIGF3YWl0IHRoYXQuZWFzeXJ0Yy5jb25uZWN0KHRoYXQuYXBwLCBjb25uZWN0U3VjY2VzcywgY29ubmVjdEZhaWx1cmUpO1xuICB9XG5cbiAgX2dldFJvb21Kb2luVGltZShjbGllbnRJZCkge1xuICAgIHZhciBteVJvb21JZCA9IHRoaXMucm9vbTsgLy9OQUYucm9vbTtcbiAgICB2YXIgam9pblRpbWUgPSB0aGlzLmVhc3lydGMuZ2V0Um9vbU9jY3VwYW50c0FzTWFwKG15Um9vbUlkKVtjbGllbnRJZF0ucm9vbUpvaW5UaW1lO1xuICAgIHJldHVybiBqb2luVGltZTtcbiAgfVxuXG4gIGdldFNlcnZlclRpbWUoKSB7XG4gICAgcmV0dXJuIERhdGUubm93KCkgKyB0aGlzLmF2Z1RpbWVPZmZzZXQ7XG4gIH1cbn1cblxuTkFGLmFkYXB0ZXJzLnJlZ2lzdGVyKFwiYWdvcmFydGNcIiwgQWdvcmFSdGNBZGFwdGVyKTtcbm1vZHVsZS5leHBvcnRzID0gQWdvcmFSdGNBZGFwdGVyO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==