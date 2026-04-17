export async function fetchDb(): Promise<ApiData> {
  const response = await fetch("http://localhost:3000/api/db");
  if (!response.ok) throw new Error(`Feil: ${response.status}`);
  return response.json();
}

export type Booking = {
  id: number; 
  userId: number;
  roomId: number;
  fromDate: string; 
  toDate: string;
  message: string;
  created: string;
  updated: string;
}

export type User = {
  id: number;
  userName: string;
  email: string;
  password: string;
  created: string;
  updated: string;
};

export type Review = {
  id: number;
  userId: number;
  rating: number;
  comment: string;
  created: string;
  updated: string;
};

export type Room = {
  id: number;
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
};
