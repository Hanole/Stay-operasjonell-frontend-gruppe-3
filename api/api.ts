export async function fetchDb() {
    const response = await fetch('http://localhost:3000/api/db');
    if (!response.ok) throw new Error(`Feil: ${response.status}`);
    return response.json();
}