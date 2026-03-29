// Daniel Barø
import { fetchDb } from "../../../api/api";

let currentEditingCard: number | null = null;

const bookingForm = document.getElementById("booking-form") as HTMLFormElement;
const roomIdInput = document.getElementById("booking-room-id") as HTMLFormElement;
const checkInDate = document.getElementById("check-in-date") as HTMLInputElement;
const checkOutDate = document.getElementById("check-out-date") as HTMLInputElement;
const message = document.getElementById("message") as HTMLTextAreaElement;
const bookingContainer = document.getElementById("booking-container");
const totalPrice = document.getElementById("total-price");

const roomImage = document.getElementById("room-image");
const roomName = document.getElementById("room-name");
const roomInfoText = document.getElementById("room-info-text");
const roomPrice = document.getElementById("room-price");

const editModal = document.getElementById("edit-modal");
const editForm = document.getElementById("edit-form");
const editCheckInDate = document.getElementById("edit-check-in-date");
const editCheckOutDate = document.getElementById("edit-check-out-date");
const editMessage = document.getElementById("edit-message");
const cancelEditButton = document.getElementById("cancel-edit");

let currentroomPrice: number = 0;

async function startBookingPage() {
  console.log("startBookingPAge har startet....");
  const data = await fetchDb();
  console.log("data hentet fra API:", data);

  const savedRoom = localStorage.getItem("selectedRoom");
  if (savedRoom) {
    const selectedRoom = JSON.parse(savedRoom);

    const room = data.rooms.find((r: any) => r.id === selectedRoom.id);
    displayRoomData(room);
  }
}

function displayRoomData(room: any) {
  if (!room) return;
  if (roomName) roomName.textContent = room.name;
  if (roomInfoText) roomInfoText.textContent = room.description;
  if (roomPrice) roomPrice.textContent = `${room.pricePrNight} Kr per natt`;

  if (roomImage && room.image) {
    (roomImage as HTMLImageElement).src = room.image;
  }
  currentroomPrice = room.pricePrNight;

  console.log("rom data vises:", room.name);
}

document.addEventListener("DOMContentLoaded", startBookingPage);

bookingForm?.addEventListener("submit", function (event) {
  event?.preventDefault();

  const checkIn = checkInDate.value;
  const checkOut = checkOutDate.value;
  const msg = message.value;

  const currentName = roomName?.textContent || "feil..";
  const currentImg = (roomImage as HTMLImageElement).src || "";

  const card = createBookingCard(checkIn, checkOut, msg, currentName, currentImg);
  bookingContainer?.appendChild(card);

  bookingForm.reset();
});

function createBookingCard(checkIn: string, checkOut: string, msg: string, currentName: string, currentImg: string) {
  const card = document.createElement("div");
  card.className = "booking-item";

  card.dataset.checkin = checkIn;
  card.dataset.checkout = checkOut;
  card.dataset.message = msg;

  card.innerHTML = `
    <img src="${currentImg}" alt="Room image" />
    <div class="booking-info">
      <div class="booking-header">
     <h3 id="booking-title">${currentName}</h3>
        <span class="status pending">Pending</span>
      </div>
      <p class="booking-dates">${checkIn}-${checkOut}</p>
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

  if (!checkIn || !checkOut || currentroomPrice === 0) return;
  const nights = nightBooked(checkIn, checkOut);

  if (nights <= 0) {
    totalPrice!.textContent = "Ugyldige datoer";
    return;
  }
  const total = nights * currentroomPrice;
  totalPrice!.textContent = `${nights} netter x ${currentroomPrice} Kr = Total: ${total} Kr`;
}
checkInDate.addEventListener("change", totalPriceUpdate);
checkOutDate.addEventListener("change", totalPriceUpdate);
