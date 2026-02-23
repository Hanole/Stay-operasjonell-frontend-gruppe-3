const nav = document.getElementById("mainNav");
const button = document.querySelector(".hamburger-button");

if (button) {
    button.addEventListener("click", () => {
        if (nav) {
            nav.classList.toggle("open");
        }
    });
}