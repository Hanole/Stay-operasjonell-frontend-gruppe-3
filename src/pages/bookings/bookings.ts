// Daniel Barø
import { fetchDb, type Booking, type Room } from "../../../api/api";
import { apiKey } from "../../../api/api";

let currentroomPrice: number = 0;

const bookingForm = document.getElementById("booking-form") as HTMLFormElement;
const checkInDate = document.getElementById("check-in-date") as HTMLInputElement;
const checkOutDate = document.getElementById("check-out-date") as HTMLInputElement;
const message = document.getElementById("message") as HTMLTextAreaElement;
const bookingContainer = document.getElementById("booking-container") as HTMLElement;
const noBookings = document.getElementById("no-bookings") as HTMLElement;
const totalPrice = document.getElementById("total-price") as HTMLElement;

const roomName = document.getElementById("room-name");
const roomInfoText = document.getElementById("room-info-text");
const roomPrice = document.getElementById("room-price");

const editModal = document.getElementById("edit-modal") as HTMLElement;
const editForm = document.getElementById("edit-form") as HTMLFormElement;
const editBookingId = document.getElementById("edit-booking-id") as HTMLInputElement;
const editCheckInDate = document.getElementById("edit-check-in-date") as HTMLInputElement;
const editCheckOutDate = document.getElementById("edit-check-out-date") as HTMLInputElement;
const editMessage = document.getElementById("edit-message") as HTMLTextAreaElement;
const cancelEditBtn = document.getElementById("cancel-edit") as HTMLButtonElement;

async function fetchBookings() {
  try {
    const response = await fetch("http://localhost:3000/api/db", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("API feil", response.status, response.statusText);
      return;
    }
    const data = await response.json();
    const bookings: Booking[] = data.bookings;
    const rooms: Room[] = data.rooms;

    bookingContainer.innerHTML = "";
    noBookings.classList.toggle("hidden", bookings.length > 0);

    bookings.forEach((booking) => {
      const room = rooms.find((r: Room) => r.id === booking.roomId);
      if (room) bookingContainer.appendChild(createBookingCard(booking, room));
    });
  } catch (error) {
    console.error("oh no.", error);
  }
}

bookingForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const savedRoom = localStorage.getItem("selectedRoom");

  if (!savedRoom) return;
  const selectedRoom = JSON.parse(savedRoom);

  const newBooking = {
    userId: 1, // eller null pga scope
    roomId: selectedRoom.id,
    fromDate: checkInDate.value,
    toDate: checkOutDate.value,
    message: message.value,
    status: "pending",
  };

  try {
    const response = await fetch("http://localhost:3000/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(newBooking),
    });
    if (!response.ok) {
      console.error("API feil", response.status);
      return;
    }
    bookingForm.reset();
    await fetchBookings();
  } catch (error) {
    console.error("oh no.", error);
  }
});

// Modal knapp
cancelEditBtn.addEventListener("click", () => {
  editModal.classList.add("hidden");
});

editForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const id = editBookingId.value;

  const updatedBooking = {
    fromDate: editCheckInDate.value,
    toDate: editCheckOutDate.value,
    message: editMessage.value,
  };

  try {
    const response = await fetch(`http://localhost:3000/api/bookings/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(updatedBooking),
    });

    if (!response.ok) {
      console.error("Endring av booking Failet", response.status);
      return;
    }

    editModal.classList.add("hidden");
    await fetchBookings();
  } catch (error) {
    console.error("Update failet", error);
  }
});

function createBookingCard(booking: Booking, room: Room): HTMLElement {
  const card = document.createElement("div");
  card.className = "booking-item";

  const currentName = room.name;

  const actionButton = booking.status === "cancelled" ? `<button class="btn-delete">Slett permanent</button>` : `<button class="btn-cancel">Avbestill</button>`;

  card.innerHTML = `
    <div class="booking-info">
      <div class="booking-header">
        <h3>${currentName}</h3>
        <span class="status">${booking.status}</span>
      </div>
      <p class="booking-dates">${booking.fromDate} - ${booking.toDate}</p>
      <p class="booking-message">${booking.message}</p>
        <div class="booking-actions">
          <button class="btn-edit">Rediger</button> 
            ${actionButton}
        </div>
     </div>  
  `;

  card.querySelector(".btn-cancel")?.addEventListener("click", async () => {
    if (!confirm("Vil du avbestille")) return;

    const response = await fetch(`http://localhost:3000/api/bookings/${booking.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ status: "cancelled" }),
    });

    if (response.ok) {
      await fetchBookings();
    }
  });

  card.querySelector(".btn-delete")?.addEventListener("click", async () => {
    if (!confirm("vil du slette permanent?")) return;

    const response = await fetch(`http://localhost:3000/api/bookings/${booking.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });
    if (response.ok) {
      await fetchBookings();
    }
  });

  card.querySelector(".btn-edit")?.addEventListener("click", () => {
    editBookingId.value = String(booking.id);
    editCheckInDate.value = booking.fromDate;
    editCheckOutDate.value = booking.toDate;
    editMessage.value = booking.message;
    editModal.classList.remove("hidden");
  });
  return card;
}

async function startBookingPage() {
  await fetchBookings();

  const savedRoom = localStorage.getItem("selectedRoom");
  if (savedRoom) {
    const room: Room = JSON.parse(savedRoom);
    displayRoomData(room);
  }
}

function displayRoomData(room: Room) {
  if (!room) return;
  if (roomName) roomName.textContent = room.name;
  if (roomInfoText) roomInfoText.textContent = room.description;
  if (roomPrice) roomPrice.textContent = `${room.pricePrNight} Kr per natt`;
  currentroomPrice = room.pricePrNight;
}
document.addEventListener("DOMContentLoaded", startBookingPage);

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
    totalPrice.textContent = "Ugyldige datoer";
    return;
  }
  const total = nights * currentroomPrice;
  totalPrice.textContent = `${nights} netter x ${currentroomPrice} Kr = Total: ${total} Kr`;
}
checkInDate.addEventListener("change", totalPriceUpdate);
checkOutDate.addEventListener("change", totalPriceUpdate);
