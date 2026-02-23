const nav = document.getElementById("mainNav");
const button = document.querySelector(".hamburger-button");

const toggleNav =() => {
    if (!nav) return;
    nav.classList.toggle("open");
};

if (button) {
    button.addEventListener("click", toggleNav);
}