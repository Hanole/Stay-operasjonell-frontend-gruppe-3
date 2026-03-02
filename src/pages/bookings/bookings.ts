const bookingForm = document.getElementById("booking-form");
const bookingRoomId = document.getElementById("booking-room-id");
const checkInDate = document.getElementById(
  "check-in-date",
) as HTMLInputElement;
const checkOutDate = document.getElementById(
  "check-out-date",
) as HTMLInputElement;
const message = document.getElementById("message") as HTMLTextAreaElement;

const roomImage = document.getElementById("room-image");
const roomName = document.getElementById("room-name");
const roomInfoText = document.getElementById("room-info-text");
const roomPrice = document.getElementById("room-price");

const bookingContainer = document.getElementById("booking-container");
const noBookingsMessage = document.getElementById("no-bookings");

const editModal = document.getElementById("edit-modal");
const editForm = document.getElementById("edit-form");
const editBookingId = document.getElementById("edit-booking-id");
const editCheckInDate = document.getElementById("edit-check-in-date");
const editCheckOutDate = document.getElementById("edit-check-out-date");
const editMessage = document.getElementById("edit-message");
const cancelEditButton = document.getElementById("cancel-edit");

const deleteModal = document.getElementById("delete-modal");
const confirmDeleteButton = document.getElementById("confirm-delete");
const cancelDeleteButton = document.getElementById("cancel-delete");

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
  return card;
}
