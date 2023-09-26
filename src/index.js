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
    }

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

    this.isChrome = (navigator.userAgent.indexOf('Firefox') === -1 && navigator.userAgent.indexOf('Chrome') > -1);

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
        },
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
    this.senderChannel = new MessageChannel;
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

    if (!this.easyrtc){
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
    this.occupantListener=occupantListener;

    if (!this.easyrtc){
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
    if (!this.easyrtc){
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
        this.clientId=this.generateId(10);
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
    if (!this.easyrtc){
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
          let d=chunk.data;
          let v=chunk.data.byteLength;
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
          let y=chunk.data.byteLength;
          if (y>=1000) {
            console.warn('audio frame too large, skipping... ',v,y,y-v, that.mocapPrevData);
            chunk.data=d;
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
      await new Promise(resolve => worker.onmessage = (event) => {
        if (event.data === 'registered') {
          resolve();
        }
      });
      const senderTransform = new RTCRtpScriptTransform(worker, { name: 'outgoing', port: that.senderChannel.port2 }, [that.senderChannel.port2]);
      senderTransform.port = that.senderChannel.port1;
      sender.transform = senderTransform;
      await new Promise(resolve => worker.onmessage = (event) => {
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
            if (chunk.data.byteLength - that.CustomDataDetector.length>0) {
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
              const mocap = textDecoder.decode(mocapBuffer)
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
      this.receiverChannel = new MessageChannel;
      var that = this;
     // const worker = new Worker('/dist/script-transform-worker.js');
      const worker = new Worker('./dist/script-transform-worker.js');
      await new Promise(resolve => worker.onmessage = (event) => {
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

      await new Promise(resolve => worker.onmessage = (event) => {
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
          })
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
          await this.rtmClient.publish(
            this.room,
            publishMessage
          );
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
    if (!this.easyrtc){
      //console.trace();
      return  NAF.adapters.IS_CONNECTED;
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
      bytes[--i] = x & (255);
      x = x >> 8;
    } while (i)
    return bytes;
  }

  addLocalMediaStream(stream, streamName) {
    if (!this.easyrtc){
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
    if (!this.easyrtc){
      return;
    }
    console.log("BW73 removeLocalMediaStream ", streamName);
    this.easyrtc.closeLocalMediaStream(streamName);

  }

  enableMicrophone(enabled) {
    if (!this.easyrtc){
      return;
    }
    this.easyrtc.enableMicrophone(enabled);
  }

  enableCamera(enabled) {
    if (!this.easyrtc){
      return;
    }
    this.easyrtc.enableCamera(enabled);
  }

  disconnect() {
    if (!this.easyrtc){
      return;
    }
    this.easyrtc.disconnect();
  }

  async handleUserPublished(user, mediaType) { }

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
    if (!this._vad_audioTrack || !this._vad_audioTrack._enabled)
      return;

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

    async playMusic(path,volume) {
      if (this.localTracks.musicTrack) {
        this.localTracks.musicTrack.stop();
        await this.agoraClient.unpublish(this.localTracks.musicTrack);
      }
      this.localTracks.musicTrack = await AgoraRTC.createBufferSourceAudioTrack({
        source: path, encoderConfig: { bitrate:110, stereo:true}
      });
      this.localTracks.musicTrack.setVolume(volume);
      await this.agoraClient.publish(this.localTracks.musicTrack);
      this.localTracks.musicTrack.play();
      this.localTracks.musicTrack.startProcessAudioBuffer({ cycle: 1 });
    }


    async playTrack(track,volume) {
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

    this.agoraClient.on("user-joined", async (user) => {
      if (this.agoraRTM && !this.agoraRTM2) {
        console.info("user-joined", user.uid, this.occupantList);
        this.occupantList[user.uid]=user.uid;
        let copy= JSON.parse(JSON.stringify(this.occupantList));
        this.occupantListener(copy);
      }
    });
    this.agoraClient.on("user-left", async (user) => {   
      if (this.agoraRTM && !this.agoraRTM2) {   
        console.info("user-left", user.uid, this.occupantList);
        delete this.occupantList[user.uid];
        let copy= JSON.parse(JSON.stringify(this.occupantList));
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
          that.remoteAudioTrack=user.audioTrack;
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
      [this.userid, this.localTracks.audioTrack, this.localTracks.videoTrack] = await Promise.all([
        this.agoraClient.join(this.appid, this.room, this.token || null, this.clientId || null),
        AgoraRTC.createMicrophoneAudioTrack(), AgoraRTC.createCustomVideoTrack({ mediaStreamTrack: stream.getVideoTracks()[0] })]);
    }
    else if (this.enableVideoFiltered && this.enableAudio) {
      var stream = document.getElementById("canvas_secret").captureStream(30);
      [this.userid, this.localTracks.audioTrack, this.localTracks.videoTrack] = await Promise.all([this.agoraClient.join(this.appid, this.room, this.token || null, this.clientId || null), AgoraRTC.createMicrophoneAudioTrack(), AgoraRTC.createCustomVideoTrack({ mediaStreamTrack: stream.getVideoTracks()[0] })]);
    }
    else if (this.enableVideo && this.enableAudio) {
      [this.userid, this.localTracks.audioTrack, this.localTracks.videoTrack] = await Promise.all([
        this.agoraClient.join(this.appid, this.room, this.token || null, this.clientId || null),
        AgoraRTC.createMicrophoneAudioTrack(), AgoraRTC.createCameraVideoTrack({ encoderConfig: '480p_2' })]);
    } else if (this.enableVideo) {
      [this.userid, this.localTracks.videoTrack] = await Promise.all([
        // Join the channel.
        this.agoraClient.join(this.appid, this.room, this.token || null, this.clientId || null), AgoraRTC.createCameraVideoTrack("360p_4")]);
    } else if (this.enableAudio) {
      let audio_track;
      if (window.gum_stream) { // avoid double allow iOs
       // audio_track = AgoraRTC.createCustomAudioTrack({ mediaStreamTrack: window.gum_stream.getAudioTracks()[0],  encoderConfig: { bitrate:180, stereo:false} });
       audio_track = AgoraRTC.createCustomAudioTrack({ mediaStreamTrack: window.gum_stream.getAudioTracks()[0],  encoderConfig: { bitrate:180, stereo:false} });
        //console.warn(audio_track, "audio_track");
      }
      else {
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
      if (this.localTracks.audioTrack)
        await this.agoraClient.publish(this.localTracks.audioTrack);
      if (this.localTracks.videoTrack)
        await this.agoraClient.publish(this.localTracks.videoTrack);

      console.log("publish success");
      const pc = this.agoraClient._p2pChannel.connection.peerConnection;
      const senders = pc.getSenders();
      let i = 0;
      for (i = 0; i < senders.length; i++) {
        if (senders[i].track && (senders[i].track.kind == 'audio')) {
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
      if (!this.syncObjects){
          return;
      }
      if (this.agoraRTM2) { // 2.x RTM
        AgoraRTM.setArea({ areaCodes: ["GLOBAL"] });        
        this.rtmClient = new AgoraRTM.RTM(this.appid, this.rtmUid, {presenceTimeout: 5}); 
        this.rtmClient.addEventListener({          
          message: (eventArgs) => { // Message event handler
            window.AgoraRtcAdapter.handleRTM2(eventArgs.publisher, eventArgs.message);            
          },          
          presence: (eventArgs) => { // Presence event handler
            if (eventArgs.eventType === "SNAPSHOT") {
                for (let u=0; u<eventArgs.snapshot.length; u++){
                  let present=this.occupantList[eventArgs.snapshot[u].userId];
                  this.occupantList[eventArgs.snapshot[u].userId]=eventArgs.snapshot[u].userId;
                  let copy= JSON.parse(JSON.stringify(this.occupantList));
                  this.occupantListener(copy);
                  if (!present){
                   // console.warn("openListener",eventArgs.snapshot[u].userId);
                    this.openListener(eventArgs.snapshot[u].userId);
                  }
                }
            } else if (eventArgs.eventType === "REMOTE_JOIN") {
                  let present=this.occupantList[eventArgs.publisher];
                  this.occupantList[eventArgs.publisher]=eventArgs.publisher;
                  let copy= JSON.parse(JSON.stringify(this.occupantList));
                  this.occupantListener(copy);
                  if (!present){
                   // console.warn("openListener",eventArgs.publisher);
                    this.openListener(eventArgs.publisher);
                  }
            } else if (eventArgs.eventType === "REMOTE_TIMEOUT" || eventArgs.eventType === "REMOTE_LEAVE") {
                  delete this.occupantList[eventArgs.publisher];
                  let copy= JSON.parse(JSON.stringify(this.occupantList));
                  this.occupantListener(copy);              
            } 
          },
        });

        window.addEventListener("beforeunload", () =>{
          window.AgoraRtcAdapter.rtmClient.logout();
        });

        try {
            const result = await this.rtmClient.login();
            await this.rtmClient.subscribe(this.room);
            console.log('rtm LOGIN SUCCESS for: '+ this.rtmUid,result);
            success(this.clientId);
        } catch (status) {
            console.error('rtm LOGIN FAILED for: '+ this.rtmUid, status);
        }
      } else {  // rtm 1
        this.rtmClient = AgoraRTM.createInstance(this.appid, { logFilter: AgoraRTM.LOG_FILTER_OFF });

        this.rtmClient.on('ConnectionStateChanged', (newState, reason) => {
          console.log('this.rtmClient connection state changed to ' + newState + ' reason: ' + reason);
          if (newState == "CONNECTED") {
          } else {
          }
        });

        this.rtmClient.on('MessageFromPeer', ({ text }, senderId) => {
          this.handleRTM(senderId, text);
        });


        this.rtmClient.login({ token: null, uid: this.rtmUid }).then(() => {
          this.rtmChannel = this.rtmClient.createChannel(this.room);
          this.rtmChannel.on('MemberJoined', (memberId) => {
          });
          this.rtmChannel.on('MemberLeft', (memberId) => {
          });
          this.rtmChannel.join().then(() => {
            this.rtmChannel.on('ChannelMessage', ({ text }, senderId) => {
              this.handleRTM(senderId, text);
            });
            success(this.clientId);//[this.clientId,this.clientId]);
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
   if (!this.easyrtc){
    return;
  }
    await that.easyrtc.connect(that.app, connectSuccess, connectFailure);
  }

  _getRoomJoinTime(clientId) {
    var myRoomId = this.room; //NAF.room;
    if (!this.easyrtc){
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
