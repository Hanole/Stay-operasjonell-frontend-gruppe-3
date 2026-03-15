export async function fetchDb() {
    const response = await fetch('http://localhost:3000/api/db');
    if (!response.ok) throw new Error(`Feil: ${response.status}`);
    return response.json();
}

// export type Review = {
//     id: number;
//     userId: number;
//     rating: number;
//     comment: string;
//     created: string;
//     updated: string;
// };

// export type Room = {
//     id: number,
//     name: string;
//     pricePrNight: number;
//     description: string;
//     features: string[];
//     maxGuests: number;
//     reviews: Review[];
//     created: string;
//     updated: string;
// };

// export type ApiData = {
//     users: unknown[];
//     rooms: Room[];
//     bookings: unknown[];
// }
