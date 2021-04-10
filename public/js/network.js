const intervalToCheckInSeconds = 10;
const speedDisplay = document.getElementById("speed");
const statusDisplay = document.getElementById("status");

const checkSlowConnection =  (seconds) => {  
    
	let speed="Excellent";
	if(seconds > 1 && seconds < 3)
		speed= "Good";
	if(seconds > 3 && seconds < 10)
		speed= "Poor";
	if(seconds > 10)
		speed= "Slow"; 
	if(seconds < 0)
		speed= "No"; 
	speedDisplay.textContent = speed + ' Connection';
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
};
const SetStatusDisplayContet = async () => {
let result= await checkOnlineStatus() ? "Online" : "OFFline";
statusDisplay.textContent = result;
statusDisplay.className = 'result-'+result;
}
setInterval(async () => { 
  await SetStatusDisplayContet();
}, intervalToCheckInSeconds * 1000); 

// forgot to include async load event listener in the video! 
window.addEventListener("load", async (event) => { 
  await SetStatusDisplayContet();
});
