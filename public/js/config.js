var pcConfig = {
    iceServers: [{   urls: [ "stun:eu-turn3.xirsys.com" ]}, {   username: "_q0ZW4MhyW4-czZ5Uz3uDvy9GGeJuSCNjxrllSw5SUUSFzCW7w_eecHkzh-jMbD6AAAAAGBiWNNvYmVpZGF0OTE=",   credential: "a262b0dc-90e0-11eb-a5fc-0242ac140004",   urls: [       "turn:eu-turn3.xirsys.com:80?transport=udp",       "turn:eu-turn3.xirsys.com:3478?transport=udp",       "turn:eu-turn3.xirsys.com:80?transport=tcp",       "turn:eu-turn3.xirsys.com:3478?transport=tcp",       "turns:eu-turn3.xirsys.com:443?transport=tcp",       "turns:eu-turn3.xirsys.com:5349?transport=tcp"   ]}]
}
var localStreamConstraints = {
    audio: true,
    video: true
  };
var baseUrl=window.location.origin;
//Defining some global utility variables
var isChannelReady = false;
var isInitiator = false;
var isStarted = false;
var localStream;
var pc;
var remoteStream;
var turnReady;
var socket =null;
//Initialize turn/stun server here
  //Displaying Local Stream and Remote Stream on webpage
  var localVideo = document.querySelector('#localVideo');
  var remoteVideo = document.querySelector('#remoteVideo');
var shareBtn=document.getElementById('shareViaWhatsApp');
var _isVideo=true;
var _videoBtn=document.getElementById('muteVideoBtn');
var _videoIcon = document.getElementById('muteVideoIcon');
var _audioBtn= document.getElementById('muteAudioBtn');
var _audioIcon= document.getElementById('muteAudioIcon');
var _isAudio=true;
var _callEnded=false;
var room = '';