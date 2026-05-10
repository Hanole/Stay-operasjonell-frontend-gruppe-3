import { apiKey } from "../../../api/api";

const signupForm = document.querySelector("#signup .index-form") as HTMLFormElement;
const loginForm = document.querySelector(".login") as HTMLFormElement;

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const signupData = new FormData(signupForm);

  const newUser = {
    userName: signupData.get("username") as string,
    email: signupData.get("email") as string,
    password: signupData.get("password") as string,
    created: new Date().toISOString(),
  };

  try {
    const resp = await fetch("http://localhost:3000/api/users", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(newUser),
    });

    if (resp.ok) {
      alert("bruker opprettet");
      signupForm.reset();
    } else {
      console.error(resp.status);
    }
  } catch (error) {
    console.error("feil med internett eller server nede", error);
  }
});
