firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    document.querySelector('#emailDisplay').innerHTML = user.email;
    document.querySelector('#mainContent').innerHTML = "Key: " + user.uid;
  } else {
    window.location.replace('index.html');
  }
});

const logoutBtn = document.querySelector('#logoutBtn');

logoutBtn.addEventListener('click', e =>{
  firebase.auth().signOut().then(function() {
    // Sign-out successful.
  }).catch(function(error) {
    // An error happened.
  });
});