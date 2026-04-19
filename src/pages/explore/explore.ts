/* Ole-Magnus Stallvik Hanole */
// 12.04.2026

import { fetchDb, type Room  } from '../../../api/api';
import './explore.css';

let allRooms: Room[] = [];

const form = document.querySelector(".explore-filters-form") as HTMLFormElement || null;
const toggleBtn = document.querySelector<HTMLButtonElement>(".explore-sidebar-toggle");
const sidebar = document.querySelector<HTMLBaseElement>("aside.explore-sidebar");

if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", () => {
        const isOpen = sidebar.classList.toggle("is-open");
        toggleBtn.setAttribute("aria-expanded", String(isOpen));
    });
}



async function startExplore() {
    try {
        const { rooms } = await fetchDb();
        allRooms = rooms;

        loadRooms(allRooms);
        sidebarFilters(allRooms);
        featureButtonClicks();

        form.addEventListener("submit", handleSubmit);

        saveDateValues();
    } catch (error) {
        console.error("Feil med API", error);
        allRooms = [];

        const container = document.querySelector('.explore-rooms');
        if (container) {
            container.innerHTML = `
                <div class="empty-state api-error">
                    <h3>Kunne ikke hente rom</h3>
                    <p>Noe gikk galt med å hente data. Prøv igjen senere.</p>
                    <button class="retry-button">Refresh</button>
                </div>
            `;

            const retryButton = container.querySelector('.retry-button');
            if (retryButton) {
                retryButton.addEventListener('click', startExplore);
            }
        }
    }


}

function resetAllFilters() {
    const sidebar = document.querySelector('.explore-sidebar-features');
    if (sidebar) {
        sidebar.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach(f => {
            f.checked = false;
        });
    }

    const form = document.querySelector('.explore-filters-form') as HTMLFormElement;
    if (form) {
        form.reset();
    }

    loadRooms(allRooms);
}

function loadRooms(rooms: Room[]) {
    const container = document.querySelector('.explore-rooms');
    if (!container) return;
    
    if (rooms.length === 0) {
        container.innerHTML = `
            <div class="empty-rooms">
                <h3>Ingen treff</h3>
                <p>Prøv andre filtre</p>
                <button class="reset-filters">Nullstill filtre</button>
            </div>
        `;

        const resetButton = container.querySelector('.reset-filters');
        if (resetButton) {
            resetButton.addEventListener('click', resetAllFilters);
        }
        return;
    }

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
                            <div class="explore-card-features">
                                ${room.features.map((f) => `<button type="button" class="explore-feature-button" data-feature="${f}">${f}</button>`).join("")}
                            </div>
                        </div>
                        <div class="explore-card-price">
                            <div class="explore-card-price-info">
                                <p>${room.pricePrNight} kr</p>
                                <p>Maks ${room.maxGuests} gjester</p>
                            </div>
                            <button class="explore-room-open">-></button>
                        </div>
                    </div>
                </div>
            `;


            // Denne sørger for at knappene lagrer rommet i localStorage, og sender brukeren til room-details.html
            const openRoomButton = card.querySelector<HTMLButtonElement>(".explore-room-open");

            if (openRoomButton) {
                openRoomButton.addEventListener("click", () => {
                    console.log(room);
                    localStorage.setItem("selectedRoom", JSON.stringify(room));
                    window.location.href = "room-details.html"
                    
                })
            }
        container.appendChild(card);
    });
}

function applyFeatureFilters(checkedFeature: string[]) {
    const filtered = 
        checkedFeature.length === 0
            ? allRooms
            : allRooms.filter((room) => 
                checkedFeature.every((f) => room.features.includes(f))
            );
        
        loadRooms(filtered);

        const buttons = document.querySelectorAll<HTMLButtonElement>(".explore-feature-button");

        buttons.forEach((button) => {
            const feature = button.dataset.feature;
            if (!feature) return;

            button.classList.toggle("is-active", checkedFeature.includes(feature));
        })
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
            sidebar.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked')
        ).map((input) => input.value);

        applyFeatureFilters(checkedFeature);
    });

    const resetButton = document.querySelector('.explore-sidebar-reset');
    if (resetButton) {
        resetButton.addEventListener('click', resetAllFilters);
    }
}

function featureButtonClicks() {
    const container = document.querySelector(".explore-rooms");
    const sidebar = document.querySelector(".explore-sidebar-features");

    if (!container || !sidebar) return;

    container.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;

        const button = target.closest(".explore-feature-button") as HTMLButtonElement | null;
        if (!button) return;

        const feature = button.dataset.feature;
        if (!feature) return;

        const checkbox = sidebar.querySelector<HTMLInputElement>(`input[type="checkbox"][value="${feature}"]`);
        if (!checkbox) return;

        checkbox.checked = !checkbox.checked;

        const checkedFeature = Array.from(sidebar.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked')).map((input) => input.value);

        applyFeatureFilters(checkedFeature);
    })
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

function saveDateValues() {
    const fromDates = document.getElementById("filter-from") as HTMLInputElement;
    const toDates = document.getElementById("filter-to") as HTMLInputElement;

    fromDates?.addEventListener('change', () => {
        sessionStorage.setItem("filter-from-date", fromDates.value);
    });

    toDates?.addEventListener("change", () => {
        sessionStorage.setItem("filter-to-date", toDates.value);
    });

}


startExplore();
