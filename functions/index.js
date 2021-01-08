const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// auth trigger (new user signup)
exports.newUserSignUp = functions.auth.user().onCreate(user => {
  // for background triggers you must return a value/promise
  return admin.firestore().collection('users').doc(user.uid).set({
    email: user.email,
    access: "0",
    discord_name:"",
    paid:[],
    devices:[],
    log:[]
  });
});

// auth trigger (user deleted)
exports.userDelete = functions.auth.user().onDelete(user => {
  // for background triggers you must return a value/promise
  return admin.firestore().collection('users').doc(user.uid).delete();
});

// http callable function (When user login)
exports.login = functions.https.onCall((data, context) => {

  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'only authenticated users can add requests'
    );
  }

  const url = 'https://sneakieaco.web.app/dashboard.html';
    const uid = context.auth.uid;
    console.log("Login UID: " + uid);
    console.log("Link Sent");
    return `${url}`;
});

//********************************************************************************************************

// Extension: api
exports.api = functions.https.onCall((data, context) => {
  
  // Initialize variables from request
  const command = data.command;
  const key = data.key;
  const device = data.device;

  if (key === "") {
    console.log('User key cannot be blank!');
    throw new functions.https.HttpsError(
      'not-found',
      'User not found'
    )
  }
  console.log("Getting user details");
  const user = admin.firestore().collection('users').doc(key);

  return user.get().then(doc => {

    // Initialize variables from firestore
    const email = doc.data().email;
    const access = doc.data().access;
    const devices = doc.data().devices;
    let deviceAmount;

    // Check if user exist
    if (!doc.exists) {
      console.log('No such document!');
      throw new functions.https.HttpsError(
        'not-found',
        'User not found'
      )
    }
    
    // logging
    console.log("logging...");
    user.update({
      log: admin.firestore.FieldValue.arrayUnion(data)
    });

    // Check if user is permitted
    if(access === "0"){
      console.log("User not activated");
      throw new functions.https.HttpsError(
        'permission-denied',
        'Please wait for the account to be activated'
      )
    }
    // Check for devices

    // Client privilege
    if(access === "1") {
      deviceAmount = 2;
    }
    // Admin privilege
    else if (access === "2") {
      deviceAmount = 10;
    }

    // No device registered
    if (devices.length === 0) {
      console.log(email + " First device!");
      user.update({
        devices: admin.firestore.FieldValue.arrayUnion(device)
      });
    }
    console.log(email + " currently has " + devices.length + " devices!");
    // Got device registered
    let match = false;
    // Scan through registered device
    console.log("Scanning through devices...");
    for (let i = 0; i < devices.length; i++) {
      // Theres existing device
      if (device.cpu === devices[i].cpu && device.memory === devices[i].memory) {
        match = true;
      }
    }
    console.log("Device match = " + match);
    // If device did not match
    if (match === false) {
      // Check for privilege
      console.log("Checking for privilege...");
      console.log("Devices = " + devices.length + " Privilege = " + deviceAmount + " Result: " + (devices.length > deviceAmount));
      if (devices.length >= deviceAmount) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'Max number of devices has reached'
        )
      }
      else {
        // Add a device
        user.update({
          devices: admin.firestore.FieldValue.arrayUnion(device)
        });
        console.log(email + " + 1 device!");
      }
    }

    if (command === "verifyKey") {
      console.log("Verified key");
      const url = "../nike.html";
      return `${url}`
    }
    else if (command === "getTime") {
      console.log("Getting time");
      // Get current date
      let tdyDate = data.data.timeZone;
      console.log("Today date: " + tdyDate);
      let year = tdyDate.getFullYear();
      let month = tdyDate.getMonth() + 1;
      let day = tdyDate.getDate();


      console.log("Year: " + year + " Month: " + month + " day: " + day);

      if (data.data.tomorrow) {
        day = day + 1;
      }

      if (day < 10)
      {
        day = "0" + day;
      }

      if (month < 10) {
        month = "0" + month;
      }

      console.log("Year: " + year + " Month: " + month + " day: " + day);

      let timerOnTime = year + "-" + month + "-" + day + "T" + data.data.time + ".000+08:00";
      let timeUTC = Date.parse(timerOnTime);
      let timeNow = tdyDate.getTime();

      console.log("Time now: " + timeNow);

      if (timeUTC < timeNow) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          "Time selected is history!"
        )
      }
      return `${timeUTC}`
    }
    else if (command === "getLink") {
      console.log("Getting link");
      const earlyLink = data.data.url + "?productId=" + data.data.shoe.productID + "&size=" + data.data.shoeSize;
      return `${earlyLink}`
    }
    else if (command === "getGif") {
      console.log("Getting Gif");
      const gifLink = "https://media.giphy.com/media/zaqclXyLz3Uoo/giphy.gif";
      return `${gifLink}`
    }
    
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Invalid argument'
    )

  });
});
