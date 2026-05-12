/* Nathalia Ferreira Ramos */

// const modal = document.getElementById ('review-modal') as HTMLElement;
// const writeBtn = document.getElementById('write-a-review-btn') as HTMLButtonElement;

// writeBtn.addEventListener('click', () => {
//     console.log('write-a-review-btn clicked');
//     modal.classList.add ('active')});

// modal.addEventListener('click', (e) => {
//     console.log('modal closed', e.target);
//     if (e.target === modal)
//     { modal.classList.remove ('active'); }
// });

const stars = document.querySelectorAll<HTMLSpanElement>('.review-stars span');

let selectedrating = 0;

stars.forEach((star) => {
    star.addEventListener('click', () => {
        selectedrating = Number (star.dataset.value);
        updateStars(selectedrating);
    });
});

function updateStars(rating:number) {
    stars.forEach((star)=> {
        const value= Number (star.dataset.value);
        if (value <= rating) {
            star.classList.add('active');
        }
        else{ star.classList.remove ('active');

        }
    })
}

// Ole-Magnus Stallvik | Hanole

import "./roomDetails.css";

const roomName = document.getElementById("room-details-name");
const pricePrNight = document.querySelector(".price");
const guests = document.querySelector(".guests");
const reviews = document.querySelector(".reviews");

const storedRoom = localStorage.getItem("selectedRoom");

if (storedRoom && roomName && pricePrNight && guests && reviews) {

        const selectedRoom = JSON.parse(storedRoom);
        roomName.textContent = selectedRoom.name;
        pricePrNight.textContent = `${selectedRoom.pricePrNight} kr`;
        guests.textContent = `maks ${selectedRoom.maxGuests} gjester`;
        
        const reviewCount = selectedRoom.reviews.length;
        const totalRating = selectedRoom.reviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0);
        const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;

        reviews.textContent = `${averageRating.toFixed(1)} (${reviewCount} anmeldelser)`;
        
}

