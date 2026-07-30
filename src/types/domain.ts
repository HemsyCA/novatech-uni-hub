export interface Printer {
  id: string;
  name: string;
  type: "filament" | "resin";
  cost_per_gram: number;
  cost_per_hour: number;
  is_available: boolean;
}

export interface Reservation {
  id: string;
  project_name: string;
  estimated_grams: number;
  estimated_hours: number;
  estimated_cost: number;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  created_at: string;
  printers: { name: string } | null;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  image_url: string;
}

export interface Order {
  id: string;
  total: number;
  status: string;
  transaction_code?: string;
  created_at: string;
}
