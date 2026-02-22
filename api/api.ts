export type Review = {
    id: number;
    userId: number;
    rating: number;
    comment: string;
    created: string;
    updated: string;
};

export type Room = {
    id: number,
    name: string;
    pricePrNight: number;
    description: string;
    features: string[];
    maxGuests: number;
    reviews: Review[];
    created: string;
    updated: string;
};

export type ApiData = {
    users: unknown[];
    rooms: Room[];
    bookings: unknown[];
}

export async function fetchData() {
    const response = await fetch('api/stay-api.json');

    const data = await response.json();
    return data; 
}
