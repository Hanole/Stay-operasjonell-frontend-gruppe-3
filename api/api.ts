export async function fetchRooms() {
    const response = await fetch('http://localhost:3000/api/rooms');
    if (!response.ok) throw new Error(`Feil: ${response.status}`);
    return response.json();
}