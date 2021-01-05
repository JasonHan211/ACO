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

// verify key from extension
exports.verifyKey = functions.https.onCall((data, context) => {

  console.log(data);

  if (data.key === "") {
    console.log('User key cannot be blank!');
    throw new functions.https.HttpsError(
      'not-found',
      'User not found'
    )
  }

  const user = admin.firestore().collection('users').doc(data.key);

  user.get().then(doc => {

    if (!doc.exists) {
      console.log('No such document!');
      throw new functions.https.HttpsError(
        'not-found',
        'User not found'
      )
    }
    else {

      console.log('Document data:', doc.data());

      // check if user is permitted
      if(doc.data().access === "0"){
        throw new functions.https.HttpsError(
          'unauthenticated',
          'Please wait for the account to be activated'
        )
      }

      const url = "nike.html";
      return `${url}`

    }
  });
});
