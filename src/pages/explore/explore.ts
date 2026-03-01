import { fetchRooms } from '../../../api/api';
import './explore.css';

let allRooms = [];

async function startExplore() {
    allRooms = await fetchRooms();
    console.log(allRooms);
    loadRooms(allRooms);
    sidebarFilters(allRooms);

}

function loadRooms(rooms) {
    const container = document.querySelector('.explore-rooms');
    if (!container) return;
    
    container.innerHTML = '';

    rooms.forEach((room) => {
        const card = document.createElement('div');
        card.className = 'explore-room-card';

        card.innerHTML = `
            <div class="explore-room-card">
                    <img src="/assets/rooms/Rectangle 14.png">
                    <div class="explore-card-details">
                        <div class="explore-card-bio">
                            <h2>${room.name}</h2>
                            <p>${room.description}</p>
                            <div>
                                ${room.features.map((f) => `<button>${f}</button>`).join('')}
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

function sidebarFilters(rooms) {
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

startExplore();