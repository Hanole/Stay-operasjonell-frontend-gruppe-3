import { fetchDb, type Room  } from '../../../api/api';
import './explore.css';

let allRooms: Room[] = [];

const form = document.querySelector<HTMLFormElement>(".explore-filters-form");
const toggleBtn = document.querySelector<HTMLButtonElement>(".explore-sidebar-toggle");
const sidebar = document.querySelector<HTMLBaseElement>("aside.explore-sidebar");

if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", () => {
        const isOpen = sidebar.classList.toggle("is-open");
        toggleBtn.setAttribute("aria-expanded", String(isOpen));
    });
}


async function startExplore() {
    const { rooms } = await fetchDb();

    allRooms = rooms;
    console.log(allRooms);

    loadRooms(allRooms);
    sidebarFilters(allRooms);

    form.addEventListener("submit", handleSubmit);

}

function loadRooms(rooms: Room[]) {
    const container = document.querySelector('.explore-rooms');
    if (!container) return;
    
    container.innerHTML = '';

    rooms.forEach((room) => {
        const card = document.createElement("div");
        card.className = "explore-room-card";

        card.innerHTML = `
            <div class="explore-room-card">
                    <img src="/assets/rooms/Rectangle 14.png">
                    <div class="explore-card-details">
                        <div class="explore-card-bio">
                            <h2>${room.name}</h2>
                            <p>${room.description}</p>
                            <div>
                                ${room.features.map((f) => `<button>${f}</button>`).join("")}
                            </div>
                        </div>
                        <div class="explore-card-price">
                            <div class="explore-card-price-info">
                                <p>${room.pricePrNight} kr</p>
                                <p>Maks ${room.maxGuests} gjester</p>
                            </div>
                            <button>-></button>
                        </div>
                    </div>
                </div>
            `;
        container.appendChild(card);
    });
}

function sidebarFilters(rooms: Room[]) {
    const allFeatures = rooms.flatMap((room) => room.features);
    const sidebarFeatures = [...new Set(allFeatures)];

    const sidebar = document.querySelector('.explore-sidebar-features');
    if (!sidebar) return;

    sidebar.innerHTML = '';

    sidebarFeatures.forEach((feature) => {
        const label = document.createElement('label');
        label.innerHTML = `
        <input type="checkbox" value="${feature}">
        ${feature}
        `;
        sidebar.appendChild(label);
    });

    sidebar.addEventListener('change', () => {
        const checkedFeature = Array.from(
            sidebar.querySelectorAll('input[type="checkbox"]:checked')
        ).map((input) => input.value);

        const filtered = 
        checkedFeature.length === 0
        ? allRooms
        : allRooms.filter((room) => 
            checkedFeature.every((f) => room.features.includes(f))
        );

        loadRooms(filtered);
    });

    const resetButton = document.querySelector('.explore-sidebar-reset');
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            sidebar
                .querySelectorAll('input[type="checkbox"]:checked')
                .forEach((input) => {
                    input.checked = false;
                });
            loadRooms(allRooms);
        })
    }
}

function handleSubmit(e: Event) {
    e.preventDefault();

    const { where, guests } = getFormValues();
    const filteredRooms = filterRooms(allRooms, where, guests);

    loadRooms(filteredRooms);

}

function getFormValues() {
    const where = (document.getElementById("filter-where") as HTMLInputElement).value.trim();
    const fromDate = (document.getElementById("filter-from") as HTMLInputElement).value.trim();
    const toDate = (document.getElementById("filter-to") as HTMLInputElement).value.trim();
    const guestsString = (document.getElementById("filter-guests") as HTMLInputElement).value.trim();

    const guests = guestsString ? parseInt(guestsString, 10) : null;

    return { where, fromDate, toDate, guests };
}

function filterRooms(rooms: Room[], where, guests) {
    return rooms.filter((room) => {
        if (where) {
            const searchable = `${room.name} ${room.description}`.toLowerCase();
            if (!searchable.includes(where.toLowerCase())) {
                return false;
            }
        }
        if (guests !== null && room.maxGuests < guests) {
            return false;
        }
        return true;
    })
}


startExplore();
