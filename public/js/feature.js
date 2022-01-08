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

  
  function stop() {
    isStarted = false;
    if(pc)
    pc.close();
    pc = null;
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

  
function shareWhatsApp(){
    window.open('whatsapp://send?text= Join my room via link: '+baseUrl+'?room='+room); 
  }