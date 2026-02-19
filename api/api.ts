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

export async function fetchData(): Promise<ApiData> {
    const response = await fetch('api/stay-api.json');
    if (!response.ok) {
        throw new Error('Error, couldnt fetch')
    }
    const data: ApiData = await response.json();
    return data; 
}
