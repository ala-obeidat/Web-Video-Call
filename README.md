# Video Chat Application
* Deployed at https://alfajer.herokuapp.com
* Only two persons can join in one room
## Running the app on development server
* `npm init`
* `npm i`
* `node start`
* open `localhost:3000`

## Obtaining TURN/STUN credentials using Xiysys
* Do not use the credentials provided
* Go to https://xirsys.com/
* Sign Up 
* Log in to your account
* Click on `+` beside `MyFirstApp`
* Click on `static TURN Credentials` Button located below `Account Type`.
* Accept the warning by click on `+` that appears just after you clicked on `static TURN Credentials`.
* Copy the text(begins with `iceservers`) that appears below `static TURN Credentials`  and paste in `config.js` as shown in `config.js`.
