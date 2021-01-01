const signUpForm = document.querySelector('.signUpForm');

// Sign Up Event
signUpForm.addEventListener('submit', (e)=>{
  e.preventDefault();

  // Get username and password
  const email = signUpForm.signUpEmail.value;
  const password = signUpForm.signUpPassword.value;
  const confirmPassword = signUpForm.signUpConfirmPassword.value;

  // Verify email and password
  if (email == '' | password == '' | confirmPassword == '')
  {
    signUpForm.querySelector('.error').textContent = 'Email or password is invalid.';
  }
  else
  {
    if (password == confirmPassword) 
    {
      firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(user => {
      console.log('registered', user.user.email);
    })
    .catch(error => {
      signUpForm.querySelector('.error').textContent = error.message;
    });
    }
    else 
    {
      signUpForm.querySelector('.error').textContent = 'Password does not match.';
    };
  };
});