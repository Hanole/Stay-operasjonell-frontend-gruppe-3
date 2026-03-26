// Daniel Barø 

const API_URL = "http://localhost:3000/bookings";
const room = await response.json();

console.log("API-KOBLING VELLYKKET!", room);
console.log("Navn på rom fra API:", room.name);
console.log("Pris fra API:", room.pricePrNight);

const bookingForm = document.getElementById("booking-form") as HTMLFormElement; 
const bookingRoomId = document.getElementById("booking-room-id") as HTMLFormElement ;
const checkInDate = document.getElementById("check-in-date") as HTMLInputElement;
const checkOutDate = document.getElementById("check-out-date") as HTMLInputElement;
const message = document.getElementById("message") as HTMLTextAreaElement;

const roomImage = document.getElementById("room-image");
const roomName = document.getElementById("room-name");
const roomInfoText = document.getElementById("room-info-text");
const roomPrice = document.getElementById("room-price");

const bookingContainer = document.getElementById("booking-container");

let currentEditingCard: HTMLElement | null = null;

const editModal = document.getElementById("edit-modal");
const editForm = document.getElementById("edit-form");
const editCheckInDate = document.getElementById("edit-check-in-date");
const editCheckOutDate = document.getElementById("edit-check-out-date");
const editMessage = document.getElementById("edit-message");
const cancelEditButton = document.getElementById("cancel-edit");

const totalPrice = document.getElementById("total-price");

bookingForm?.addEventListener("submit", function (event) {
  event?.preventDefault();

  const checkIn = checkInDate.value;
  const checkOut = checkOutDate.value;
  const msg = message.value;

  const card = createBookingCard(checkIn, checkOut, msg);
  bookingContainer?.appendChild(card);

  bookingForm.reset();

  console.log("check-in", checkIn);
  console.log("check-out", checkOut);
  console.log("message:", msg);
});

function createBookingCard(checkIn: string, checkOut: string, msg: string) {
  const card = document.createElement("div");
  card.className = "booking-item";
  card.dataset.checkin = checkIn;
  card.dataset.checkout = checkOut;
  card.dataset.message = msg;

  card.innerHTML = `
    <img src="" alt="Room image" />
    <div class="booking-info">
      <div class="booking-header">
     <h3>[Room Name]</h3>
        <span class="status pending">Pending</span>
      </div>
      <p class="booking-dates">${checkIn} - ${checkOut}</p>
      <p class="booking-message">${msg}</p>
      <div class="booking-actions">
        <button class="btn-edit">Edit</button>
        <button class="btn-cancel">Cancel</button>
      </div>
    </div>
  `;

  const editBtn = card.querySelector(".btn-edit") as HTMLButtonElement;

  editBtn?.addEventListener("click", () => {
    openEditModal(card, checkIn, checkOut, msg);
  });

  card.querySelector(".btn-cancel")?.addEventListener("click", () => {
    if (confirm("Er du sikker på du vil avbestille denne bookingen?")) {
      card.remove(); // til senere en funksjon som sletter deletebookings(id)
    }
  });
  return card;
}

function openEditModal(card: HTMLElement, checkIn: string, checkOut: string, msg: string) {
  currentEditingCard = card;

  (document.getElementById("edit-check-in-date") as HTMLInputElement).value = checkIn;
  (document.getElementById("edit-check-out-date") as HTMLInputElement).value = checkOut;
  (document.getElementById("edit-message") as HTMLTextAreaElement).value = msg;

  editModal?.classList.remove("hidden");
}
cancelEditButton?.addEventListener("click", () => {
  editModal?.classList.add("hidden");
});

editForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  const newCheckIn = (document.getElementById("edit-check-in-date") as HTMLInputElement).value;
  const newCheckOut = (document.getElementById("edit-check-out-date") as HTMLInputElement).value;
  const newMsg = (document.getElementById("edit-message") as HTMLTextAreaElement).value;

  if (currentEditingCard) {
    currentEditingCard.querySelector(".booking-dates")!.textContent = `${newCheckIn} - ${newCheckOut}`;
    currentEditingCard.querySelector(".booking-message")!.textContent = newMsg;
  }

  editModal?.classList.remove("hidden");
});

function nightBooked(checkIn: string, checkOut: string) {
  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);

  const diffTime = endDate.getTime() - startDate.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays;
}

function totalPriceUpdate() {
  const checkIn = checkInDate.value;
  const checkOut = checkOutDate.value;

  if (!checkIn || !checkOut) {
    return;
  }
  const nights = nightBooked(checkIn, checkOut);
  if (nights <= 0) {
    totalPrice!.textContent = "Ugyldige datoer";
    return;
  }

  const pricePerNight = 500; // hard kodet for nå// 

  const total = nights * pricePerNight;

  totalPrice!.textContent = `${nights} netter x ${pricePerNight} Kr = Total: ${total} Kr`;
}
checkInDate.addEventListener("change", totalPriceUpdate);
checkOutDate.addEventListener("change", totalPriceUpdate);

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch(API_URL);
    const bookings = await response.json();

    bookings.forEach((b: any) => {
      const card = createBookingCard(b.fromDate, b.toDate, b.message, b.id);
      bookingContainer?.appendChild(card);
    });

  }
});