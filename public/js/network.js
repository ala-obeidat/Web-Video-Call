const intervalToCheckInSeconds = 5;
const speedDisplay = document.getElementById("speed"); 

const checkSlowConnection =  (seconds) => {  
    
	let speed="Excellent";
	let speedAr = 'ممتازة';
	if(seconds > 1 && seconds < 3)
		{speed= "Good";
		speedAr = 'جيدة';
	}
	if(seconds > 3 && seconds < 10)
		{speed= "Poor";
		speedAr = 'ضعيفة';}
	if(seconds > 10)
		{speed= "Slow"; 
		speedAr = 'ضعيفة جداً';
	}

	if(seconds < 0)
		{speed= "No"; 
		speedAr = 'انقطع الاتصال';
	}
	speedDisplay.textContent = speedAr;
    speedDisplay.className = 'speed-'+speed;
}

const checkOnlineStatus = async () => {
  try {
  let countDownDate = new Date().getTime();
    const online = await fetch("https://i.ibb.co/BBJv1Ff/FF4-D00-0-8-1.png",{mode: "no-cors"});
	let newDate = new Date().getTime();
	 let distance = newDate - countDownDate;
	 let seconds = Math.floor((distance % (1000 * 60)) / 1000);
	 checkSlowConnection(seconds);
    return online.status ==0;
  } catch (err) {
  checkSlowConnection(-1);
    return false; // definitely offline
  }
  finally{
	  if(!_callEnded)
		setTimeout(SetStatusDisplayContet,intervalToCheckInSeconds * 1000);
  }
};
const SetStatusDisplayContet = async () => {
 await checkOnlineStatus()
}

// forgot to include async load event listener in the video! 
// window.addEventListener("load", async (event) => { 
//   await SetStatusDisplayContet();
// });
