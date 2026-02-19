import { fetchData } from '../../../api/api';
import './explore.css';

async function startExplore() {
    const { rooms } = await fetchData();
    loadRooms(rooms);

}

function loadRooms (rooms: Room[]) {
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

startExplore();