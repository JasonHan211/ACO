const signInForm = document.querySelector('.signInForm');

// Check if user is signed in
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in
    signInForm.querySelector('.error').textContent = "logging in " + user.email + " please wait...";
      // get function reference
      const login = firebase.functions().httpsCallable('login');
      // call the function and pass data
      login().then(result => {
        window.location.replace(result.data);
      })
  }
});

// Sign In Event
signInForm.addEventListener('submit', (e)=>{
  e.preventDefault();

  // Get username and password
  const email = signInForm.signInEmail.value;
  const password = signInForm.signInPassword.value;

  // Verify email and password
  if (email == '' | password == '')
  {
    signInForm.querySelector('.error').textContent = 'Email or password is invalid.';
  }
  else
  {
      firebase.auth().signInWithEmailAndPassword(email, password)
    .then(user => {
      // User is signed in
      signInForm.querySelector('.error').textContent = "logging in " + user.user.email + " please wait...";
      // get function reference
      const login = firebase.functions().httpsCallable('login');
      // call the function and pass data
      login().then(result => {
        window.location.replace(result.data);
      })
      .catch(error => {
        signInForm.querySelector('.error').textContent = error.message;
      })
    })
    .catch(error => {
      signInForm.querySelector('.error').textContent = error.message;
    });
  };
});