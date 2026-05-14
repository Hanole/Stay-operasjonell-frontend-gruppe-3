/* Ole-Magnus Stallvik Hanole */
// 19.04.2026

import { apiKey, fetchDb, type Room, type SavedSearch, type SavedSearchItem  } from '../../../api/api';
import { renderRoomCardSkeleton } from '../../components/loadingState';
import './explore.css';

let allRooms: Room[] = [];
let savedSearches: SavedSearchItem[] = [];

const form = document.querySelector(".explore-filters-form") as HTMLFormElement || null;
const toggleBtn = document.querySelector<HTMLButtonElement>(".explore-sidebar-toggle");
const sidebar = document.querySelector<HTMLBaseElement>("aside.explore-sidebar");
const saveSearchButton = document.querySelector<HTMLButtonElement>(".save-search-button");
const roomsContainer = document.querySelector<HTMLDivElement>(".explore-rooms");
const breakpoint = window.matchMedia("(max-width: 1024px)");

if (toggleBtn && sidebar && roomsContainer) {
    toggleBtn.addEventListener("click", () => {
        const isOpen = sidebar.classList.toggle("is-open");
        roomsContainer.classList.toggle("is-blurred", isOpen);
        toggleBtn.setAttribute("aria-expanded", String(isOpen));
    });
    breakpoint.addEventListener("change", sidebarStates);
    sidebarStates();
}

function sidebarStates() {
    if (!toggleBtn || !sidebar || !roomsContainer) return;

    if (!breakpoint.matches) {
        sidebar.classList.remove("is-open");
        roomsContainer.classList.remove("is-blurred");
        toggleBtn.setAttribute("aria-expanded", "false");
    }
}

async function startExplore() {
    const container = document.querySelector(".explore-rooms");
    if (!container) return;

    container.setAttribute("aria-busy", "true");
    container.replaceChildren(...renderRoomCardSkeleton(6));


    try {
        const { rooms, savedSearches: fetchedSavedSearches } = await fetchDb();
        allRooms = rooms;
        savedSearches = fetchedSavedSearches;

        loadRooms(allRooms);
        sidebarFilters(allRooms);
        featureButtonClicks();
        listenForSavedSearch();
        renderSavedSearches();

        form.addEventListener("submit", handleSubmit);

        saveDateValues();
        saveSearchButton?.addEventListener("click", () => {
            saveSearch();
        })
        
    } catch (error) {
        console.error("Feil med API", error);
        allRooms = [];

        const container = document.querySelector('.explore-rooms');
        if (container) {
            container.innerHTML = `
                <div class="empty-state api-error">
                    <h3>Kunne ikke hente rom</h3>
                    <p>Noe gikk galt med å hente data. Prøv igjen senere.</p>
                    <button class="retry-button">Last inn på nytt</button>
                </div>
            `;

        const retryButton = container.querySelector('.retry-button');
        retryButton?.addEventListener('click', startExplore) 
    } finally {
        container.setAttribute("aria-busy", "false");
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

    const maxPriceInput = document.getElementById("max-price") as HTMLInputElement | null;
    const maxPriceValue = document.getElementById("max-price-value");
    if (maxPriceInput) {
        maxPriceInput.value = maxPriceInput.max;
    }
    if (maxPriceInput && maxPriceValue) {
        maxPriceValue.textContent = maxPriceInput.value;
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
                    <img src="${room.imageUrl || '/assets/rooms/Rectangle 14.png'}" alt="${room.name}">
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

function applyAllFilters() {
    const { searchField, guests, maxPrice } = getFormValues();

    const featuresSidebar = document.querySelector(".explore-sidebar-features");
    const checkedFeatures = featuresSidebar ? Array.from(featuresSidebar.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked'))
    .map((input) => input.value) : [];

    const filteredRooms = allRooms.filter((room) => {
        if (searchField) {
            const searchable = `${room.name} ${room.description}`.toLowerCase();
            if (!searchable.includes(searchField.toLowerCase())) {
                return false;
            }
        }

        if (guests !== null && room.maxGuests < guests) {
            return false;
        }

        if (maxPrice !== null && room.pricePrNight > maxPrice) {
            return false;
        }

        if (!checkedFeatures.every((feature) => room.features.includes(feature))) {
            return false;
        }

        return true;
    });

    loadRooms(filteredRooms);
    updateActiveFeatureButtons(checkedFeatures);
}

function updateActiveFeatureButtons(checkedFeatures: string[]) {
    const buttons = document.querySelectorAll<HTMLButtonElement>(".explore-feature-button");

    buttons.forEach((button) => {
        const feature = button.dataset.feature;
        if(!feature) return;

        button.classList.toggle("is-active", checkedFeatures.includes(feature));
    })
}


function sidebarFilters(rooms: Room[]) {
    const allFeatures = rooms.flatMap((room) => room.features);
    const sidebarFeatures = [...new Set(allFeatures)];
    const highestPrice = Math.max(...rooms.map((room) => room.pricePrNight));

    const maxPrice = document.querySelector(".explore-sidebar-maxprice");
    if (!maxPrice) return;

    const sidebar = document.querySelector('.explore-sidebar-features');
    if (!sidebar) return;

    sidebar.innerHTML = '';

    sidebarFeatures.forEach((feature) => {
        const label = document.createElement('label');
        label.innerHTML = `
        <input class="explore-sidebar-input" type="checkbox" value="${feature}">
        ${feature}
        `;
        sidebar.appendChild(label);
    });

    sidebar.addEventListener('change', () => {
        applyAllFilters();
    });
    
    maxPrice.innerHTML = `
        <h2>Maks pris per natt</h2>
        <input id="max-price" type="range" min="0" max="${highestPrice}" step="100" value="${highestPrice}" aria-label="Velg maks pris med skyveknappen">
        <p>Opptil <span id="max-price-value">${highestPrice}</span> kr</p>
    `

    const maxPriceInput = document.getElementById("max-price") as HTMLInputElement;
    const maxPriceValue = document.getElementById("max-price-value");

    maxPriceInput.addEventListener("input", () => {
        if(maxPriceValue) {
            maxPriceValue.textContent = maxPriceInput.value;
        }

        applyAllFilters();
    })

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
        applyAllFilters();
    })
}

function handleSubmit(e: Event) {
    e.preventDefault();
    applyAllFilters();

}

function getFormValues() {
    const searchField = (document.getElementById("filter-freesearch") as HTMLInputElement).value.trim();
    const guestsString = (document.getElementById("filter-guests") as HTMLInputElement).value.trim();
    const maxPriceString = (document.getElementById("max-price") as HTMLInputElement | null)?.value ?? "";

    const guests = guestsString ? parseInt(guestsString, 10) : null;
    const maxPrice = maxPriceString ? parseInt(maxPriceString, 10) : null;

    return { searchField, guests, maxPrice };
}

function saveDateValues() {
    const fromDates = document.getElementById("from-date") as HTMLInputElement;
    const toDates = document.getElementById("to-date") as HTMLInputElement;

    fromDates?.addEventListener('change', () => {
        sessionStorage.setItem("store-from-date", fromDates.value);
    });

    toDates?.addEventListener("change", () => {
        sessionStorage.setItem("store-to-date", toDates.value);
    });

}

function getSavedSearch(): SavedSearch {
    const { guests, maxPrice } = getFormValues();

    const featuresSidebar = document.querySelector('.explore-sidebar-features');
    const features = featuresSidebar ? Array.from(featuresSidebar.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked')).map((input) => input.value) : [];

    return {
        
        guests,
        features,
        maxPrice,
    } 
}

async function saveSearch() {
    const savedSearch = getSavedSearch();

    try {
        const response = await fetch(`http://localhost:3000/api/savedSearches`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization":  `Bearer ${apiKey}`
            },
            body: JSON.stringify(savedSearch)
        });

        if (!response.ok) {
            throw new Error(`Feil ved lagring av søk: ${response.status}`);
        }

        const createdSearch = await response.json();
        console.log("lagret søøk:", createdSearch);

        savedSearches.push(createdSearch);
        renderSavedSearches();
    } catch (error) {
        console.error("Klarte ikke å lagre søk:", error);
    }
}

async function updateSavedSearch(savedSearch: SavedSearchItem) {

    try {
        const response = await fetch(`http://localhost:3000/api/savedSearches/${savedSearch.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify(savedSearch)
        });

        if (!response.ok) {
            throw new Error(`Kunne ikke oppdatere søk: ${response.status}`)
        }

        const updatedSearch = await response.json();

        savedSearches = savedSearches.map((search) => 
            search.id === updatedSearch.id ? updatedSearch : search
        );
        renderSavedSearches();
    } catch (error){
        console.error("Kunne ikke oppdatere søk:", error)
    }
}

function showSavedSearch(savedSearch: SavedSearchItem) {
    const container = document.querySelector(".explore-saved-searches");
    if (!container) return;

    container.innerHTML += `
        <div class="saved-search-item" data-search-id="${savedSearch.id}">
            <input type="radio" class="saved-search-checkbox" data-search-id="${savedSearch.id}">
            <span class="saved-search-text">${savedSearch.guests ?? 0} gjester, ${savedSearch.features.join(", ") || "ingen egenskaper"}, maks ${savedSearch.maxPrice ?? "ingen"} Kr</span>
            <button type="button" class="saved-search-update" data-search-id="${savedSearch.id}">Oppdater</button> 
            <button type="button" class="saved-search-delete" data-search-id="${savedSearch.id}">Slett</button>
        </div>
    `
}

function applySavedSearch(savedSearch: SavedSearch) {
    const guestsInput = document.getElementById("filter-guests") as HTMLInputElement | null;
    const maxPriceInput = document.getElementById("max-price") as HTMLInputElement | null;
    const maxPriceValue = document.getElementById("max-price-value");
    const featuresSidebar = document.querySelector(".explore-sidebar-features");
    
    if (guestsInput) {
        guestsInput.value = savedSearch.guests !== null ? String(savedSearch.guests) : "";
    }

    if (maxPriceInput) {
        maxPriceInput.value = savedSearch.maxPrice !== null ? String(savedSearch.maxPrice) : maxPriceInput.max;
    }

    if (maxPriceInput && maxPriceValue) {
        maxPriceValue.textContent = maxPriceInput.value;
    }

    if (featuresSidebar) {
        const checkboxes = featuresSidebar.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
        checkboxes.forEach((checkbox) => {
            checkbox.checked = savedSearch.features.includes(checkbox.value);
        });
    }

    applyAllFilters();
}

async function deleteSearch(searchId: number) {
    try {
        const response = await fetch(`http://localhost:3000/api/savedSearches/${searchId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${apiKey}`
            }
        });

        if (!response.ok) {
            throw new Error(`Feil ved sletting av søk: ${response.status}`);
        }

        savedSearches = savedSearches.filter((search) => search.id !== searchId);
        renderSavedSearches();

        const item = document.querySelector(`.saved-search-delete[data-search-id="${searchId}"]`)?.closest(".saved-search-item");
        item?.remove();
    } catch (error) {
        console.error("Kunne ikke slette søk:", error);
    }
    
}

function renderSavedSearches() {
    const container = document.querySelector(".explore-saved-searches");
    if (!container) return;

    container.innerHTML = "";
    savedSearches.forEach((search) => showSavedSearch(search));
}

function listenForSavedSearch() {
    const container = document.querySelector(".explore-saved-searches");
    if (!container) return;

    container.addEventListener("click", (event) => {
        const target = event.target as HTMLElement;

        if (target.classList.contains("saved-search-checkbox")) {
            const checkbox = target as HTMLInputElement;
            const idAt = checkbox.dataset.searchId;
            const id = idAt ? parseInt(idAt, 10) : NaN;

            const savedSearch = savedSearches.find((search) => search.id === id);

            if (checkbox.checked) {
                const allCheckboxes = container.querySelectorAll<HTMLInputElement>(".saved-search-checkbox");
                allCheckboxes.forEach((item) => {
                    if (item !== checkbox) {
                        item.checked = false;
                    }
                });
                
                if (savedSearch) {
                    applySavedSearch(savedSearch);
                }
            }
            return;
        }

        if (target.classList.contains("saved-search-update")) {
            const button = target as HTMLButtonElement;
            const idAt = button.dataset.searchId;
            const id = idAt ? parseInt(idAt, 10) : NaN;
            if (Number.isNaN(id)) return;

            const { guests, maxPrice } = getFormValues();
            const featuresSidebar = document.querySelector(".explore-sidebar-features");
            const features = featuresSidebar ? Array.from(
                featuresSidebar.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked')
            ).map((input) => input.value) : [];

            const existing = savedSearches.find((saved) => saved.id === id);
            if (!existing) return;

            const updated: SavedSearchItem = {
                ...existing,
                guests,
                maxPrice,
                features
            };

            updateSavedSearch(updated);
            return;
        }
        
        if (target.classList.contains("saved-search-delete")) {
            const button = target as HTMLButtonElement;
            const idAt = button.dataset.searchId;
            const id = idAt ? parseInt(idAt, 10) : NaN;
            if (!Number.isNaN(id)) {
                deleteSearch(id);
            }
        }

    })
}


startExplore();
