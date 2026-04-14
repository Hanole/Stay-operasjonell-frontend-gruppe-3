const signupForm = document.querySelector(".signup") as HTMLFormElement;
const loginForm = document.querySelector(".login") as HTMLFormElement;

signupForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const signUpData = new FormData(signupForm);
  const username = signUpData.get("username") as string;
  const email = signUpData.get("email") as string;
  const password = signUpData.get("password") as string;

  const newUser = {
    username: username,
    email: email,
    password: password,
  };

  localStorage.setItem("user", JSON.stringify(newUser));
});
