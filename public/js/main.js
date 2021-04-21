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
var shareBtn=document.getElementById('shareViaWhatsApp');
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

if(room)  {
  shareBtn.style='display:none';
}
else{
  room = prompt('ادخل رقم الغرفة،أو اتركها فارغة لإنشاء غرفة جديدة');
  if(!room)
  room=uuid();
  
}
//Initializing socket.io
var socket =null;


if (room !== '' && room !== null) {
  socket=io.connect('https://alaobeidat.tk', {secure: true});
  socket.emit('create or join', room);
  console.log('Attempted to create or  join room', room); 
  socket.on('created', function(room) {
    console.log('Created room ' + room);
    addInfo('تم انشاء الغرفة رقم '+ room);
    isInitiator = true;
  });
  
  socket.on('full', function(room) {
    alert('غرفة مغلقة');
    console.log('Room ' + room + ' is full');
  });
  
  socket.on('join', function (room){
    console.log('Another peer made a request to join room ' + room);
    addInfo('هناك شخص يحاول الانضام للمكالمة في هذه الغرفة');
    console.log('This peer is the initiator of room ' + room + '!');
    isChannelReady = true;
  });
  socket.on('ready', function (room){
    addInfo('تم إغلاق الغرفة');
    shareBtn.style='display:none';
  });

 
  
  socket.on('joined', function(room) {
    console.log('joined: ' + room);
    isChannelReady = true;
    addInfo('تم انضمامك  للمكالمة'); 
    shareBtn.style='display:none';
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
  document.getElementById('callAgain').innerHTML='<button onclick="location.reload()" style="font-size: 135px;  margin: 26px !important; width: 100%;  border-radius: 104px;">معاودة الاتصال</button>';
  document.getElementById('video_display').innerHTML="<h1 style='font-size:65px'>شكراً لإستخدامك منتجات علاء عبيدات</h1>";
  isChannelReady=false;
  window.history.pushState({}, document.title, "https://alaobeidat.tk");
}
function uuid() {
  return makeid(6);
}
function makeid(length) {
  var result           = [];
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result.push(characters.charAt(Math.floor(Math.random() * 
charactersLength)));
 }
 return result.join('');
}

function shareWhatsApp(){
  window.open('whatsapp://send?text= Join my room via link: https://alaobeidat.tk?room='+room); 

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
  alert('تم انهاء المكالمة'); 
  
}

function handleRemoteHangup() {
  console.log('Session terminated.'); 
  stop();
  isInitiator = false;
  alert('قام الطرف الآخر بإنهاء المكالمة'); 
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
     
    _audioIcon.className='fas fa-microphone-slash';
    _audioBtn.className='btn_option';
     
  }
    else
  {
    _audioIcon.className='fas fa-microphone';
      _audioBtn.className='btn_option active';  
   
  }
  _isAudio=!_isAudio;
  localStream.getAudioTracks()[0].enabled = _isAudio
}
var _isVideo=true;
var _videoBtn=document.getElementById('muteVideoBtn');
var _videoIcon = document.getElementById('muteVideoIcon');
var _audioBtn= document.getElementById('muteAudioBtn');
var _audioIcon= document.getElementById('muteAudioIcon');

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
function muteVideo(){
  if(_isVideo)
 {
     
  _videoIcon.className='fas fa-video-slash';
  _videoBtn.className='btn_option';
   
}
  else
{
  _videoBtn.className='btn_option active';
    _videoIcon.className='fas fa-video';  
 
}
_isVideo=!_isVideo;
localStream.getVideoTracks()[0].enabled = _isVideo;
}
