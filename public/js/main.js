'use strict';

//Defining some global utility variables
var isChannelReady = false;
var isInitiator = false;
var isStarted = false;
var localStream;
var pc;
var remoteStream;
var turnReady;

//Initialize turn/stun server here
var pcConfig = turnConfig;

var localStreamConstraints = {
    audio: true,
    video: true
  };


//Not prompting for room name
//var room = 'foo';

// Prompting for room name:

var room = '';
const urlParams = new URLSearchParams(window.location.search);
room = urlParams.get('room');
if(!room)
  room=prompt('Enter room name:'); 
//Initializing socket.io
var socket =null;


if (room !== '' && room !== null) {
  socket=io.connect('https://alaobeidat.tk', {secure: true});
  socket.emit('create or join', room);
  console.log('Attempted to create or  join room', room);
document.getElementById('roomText').innerHTML=room;
  socket.on('created', function(room) {
    console.log('Created room ' + room);
    isInitiator = true;
  });
  
  socket.on('full', function(room) {
    console.log('Room ' + room + ' is full');
  });
  
  socket.on('join', function (room){
    console.log('Another peer made a request to join room ' + room);
    addInfo('Another user try to connect to your room');
    console.log('This peer is the initiator of room ' + room + '!');
    isChannelReady = true;
  });
  
  socket.on('joined', function(room) {
    console.log('joined: ' + room);
    isChannelReady = true;
  });
  
  socket.on('log', function(array) {
    console.log.apply(console, array);
  });
  
  
  //Driver code
  socket.on('message', function(message, room) {
      console.log('Client received message:', message,  room);
      if (message === 'got user media') {
        maybeStart();
      } else if (message.type === 'offer') {
        if (!isInitiator && !isStarted) {
          maybeStart();
        }
        pc.setRemoteDescription(new RTCSessionDescription(message));
        doAnswer();
      } else if (message.type === 'answer' && isStarted) {
        pc.setRemoteDescription(new RTCSessionDescription(message));
      } else if (message.type === 'candidate' && isStarted) {
        var candidate = new RTCIceCandidate({
          sdpMLineIndex: message.label,
          candidate: message.candidate
        });
        pc.addIceCandidate(candidate);
      } else if (message === 'bye' && isStarted) {
        handleRemoteHangup();
      }
  });
    
  
  
  
  //Displaying Local Stream and Remote Stream on webpage
  var localVideo = document.querySelector('#localVideo');
  var remoteVideo = document.querySelector('#remoteVideo');
  console.log("Going to find Local media");
  navigator.mediaDevices.getUserMedia(localStreamConstraints)
  .then(gotStream)
  .catch(function(e) {
    alert('getUserMedia() error: ' + e.name);
  });
  

  
console.log('Getting user media with constraints', localStreamConstraints);
}
else{
  endTheCall()
}
var _callEnded=false;
function endTheCall(){
  _callEnded=true;
  sendMessage('bye', room);
  document.getElementById('networkStatus').innerHTML='<button onclick="location.reload()" style="font-size: 135px;  margin: 26px !important; width: 100%;  border-radius: 104px;">Call Again</button>';
  document.getElementById('video_display').innerHTML="<h1 style='font-size:65px'>Thanks for Using Ala's products</h1>";
  isChannelReady=false;

}

function shareWhatsApp(){
  window.open('whatsapp://send?text= Join Me for Video call via link https://alaobeidat.tk?room='+room); 

}
let infoItem =document.getElementById('info');
function addInfo(text){
  var oldHtml=infoItem.innerHTML;
  let newHtml=`${oldHtml}<br /><span>${text} ...</span>`;
  infoItem.innerHTML=newHtml;
}
//Defining socket connections for signalling

//If found local stream
function gotStream(stream) {
  console.log('Adding local stream.');
  localStream = stream;
  localVideo.srcObject = stream;
  sendMessage('got user media', room);
  if (isInitiator) {
    maybeStart();
  }
}

//Function to send message in a room
function sendMessage(message, room) {
  console.log('Client sending message: ', message, room);
  if(socket)
    socket.emit('message', message, room);
}




//If initiator, create the peer connection
function maybeStart() {
  console.log('>>>>>>> maybeStart() ', isStarted, localStream, isChannelReady);
  if (!isStarted && typeof localStream !== 'undefined' && isChannelReady) {
    console.log('>>>>>> creating peer connection');
    createPeerConnection();
    pc.addStream(localStream);
    isStarted = true;
    console.log('isInitiator', isInitiator);
    if (isInitiator) {
      doCall();
    }
  }
}

//Sending bye if user closes the window
window.onbeforeunload = function() {
  
  endTheCall();
};


//Creating peer connection
function createPeerConnection() {
  try {
    pc = new RTCPeerConnection(pcConfig);
    pc.onicecandidate = handleIceCandidate;
    pc.onaddstream = handleRemoteStreamAdded;
    pc.onremovestream = handleRemoteStreamRemoved;
    console.log('Created RTCPeerConnnection');
  } catch (e) {
    console.log('Failed to create PeerConnection, exception: ' + e.message);
    alert('Cannot create RTCPeerConnection object.');
    return;
  }
}

//Function to handle Ice candidates
function handleIceCandidate(event) {
  console.log('icecandidate event: ', event);
  if (event.candidate) {
    sendMessage({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate
    }, room);
  } else {
    console.log('End of candidates.');
  }
}

function handleCreateOfferError(event) {
  console.log('createOffer() error: ', event);
}

function doCall() {
  console.log('Sending offer to peer');
  pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
}

function doAnswer() {
  console.log('Sending answer to peer.');
  pc.createAnswer().then(
    setLocalAndSendMessage,
    onCreateSessionDescriptionError
  );
}

function setLocalAndSendMessage(sessionDescription) {
  pc.setLocalDescription(sessionDescription);
  console.log('setLocalAndSendMessage sending message', sessionDescription);
  addInfo('User joined your room');
  sendMessage(sessionDescription, room);
}

function onCreateSessionDescriptionError(error) {
  trace('Failed to create session description: ' + error.toString());
}


function handleRemoteStreamAdded(event) {
  console.log('Remote stream added.');
  remoteStream = event.stream;
  remoteVideo.srcObject = remoteStream;
}

function handleRemoteStreamRemoved(event) {
  console.log('Remote stream removed. Event: ', event);
}

function hangup() {
  console.log('Hanging up.');
  localVideo.pause();
  stop();
  endTheCall();
  alert('Call Ended'); 
  
}

function handleRemoteHangup() {
  console.log('Session terminated.'); 
  stop();
  isInitiator = false;
  alert('User end the call'); 
  endTheCall();
}

function stop() {
  isStarted = false;
  if(pc)
  pc.close();
  pc = null;
}
var _isAudio=true;
function muteAudio(){ 
  if(_isAudio)
  {
    _audioBtn.innerHTML='Unmute Audio';
  }
  else{
    _audioBtn.innerHTML='Mute Audio';
  }
  _isAudio=!_isAudio;
  localStream.getAudioTracks()[0].enabled = _isAudio
}
var _isVideo=true;
var _videoBtn=document.getElementById('muteVideoBtn');
var _audioBtn= document.getElementById('muteAudioBtn');

const capture = async facingMode => {
  const options = {
    audio: false,
    video: {
      facingMode,
    },
  };

  try {
    if (localStream) {
      const tracks = localStream.getTracks();
      tracks.forEach(track => track.stop());
    }
    localStream = await navigator.mediaDevices.getUserMedia(options);
  } catch (e) {
    alert(e);
    return;
  }
  localVideo.srcObject = null;
  localVideo.srcObject = localStream;
  localVideo.play();
}
var invirunment ='user';
function flipCamera(){
  const supports = navigator.mediaDevices.getSupportedConstraints();
if (!supports['facingMode']) {
    alert('This browser does not support facingMode!');
    return;
}
if(invirunment=='user')
invirunment='environment';
else
invirunment='user';
capture(invirunment);
}
function muteVideo(){
  if(_isVideo)
 {
     
    _videoBtn.innerHTML='Unmute Video';
}
  else
{
    
  _videoBtn.innerHTML='Mute Video';
}
_isVideo=!_isVideo;
localStream.getVideoTracks()[0].enabled = _isVideo;
}
