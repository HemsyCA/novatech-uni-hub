export interface Printer {
  id: string;
  name: string;
  type: "filament" | "resin";
  cost_per_gram: number;
  cost_per_hour: number;
  is_available: boolean;
}

export interface PrintMaterial {
  id: string;
  name: string;
  cost_per_gram: number;
  cost_per_hour: number;
  print_speed_g_per_hour: number;
  is_default: boolean;
  is_active: boolean;
}

export interface Reservation {
  id: string;
  user_id: string | null;
  project_name: string;
  description: string | null;
  estimated_grams: number;
  estimated_hours: number;
  estimated_cost: number;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  notes: string | null;
  design_file_path: string | null;
  material_id: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
  printers: { name: string } | null;
  print_materials?: { name: string } | null;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  image_url: string;
  is_active?: boolean;
}

export interface Order {
  id: string;
  user_id?: string;
  total: number;
  status: string;
  transaction_code?: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  quantity: number;
  unit_price: number;
}

export type AppRole = "superadmin" | "directiva";

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Robot {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RobotOwner {
  id: string;
  robot_id: string;
  full_name: string;
  team_role: string | null;
  user_id: string | null;
  created_at: string;
}

export interface Competition {
  id: string;
  name: string;
  organizer: string | null;
  location: string | null;
  event_date: string | null;
  description: string | null;
  created_at: string;
}

export interface RobotCompetition {
  id: string;
  robot_id: string;
  competition_id: string;
  result: string | null;
  notes: string | null;
  created_at: string;
  competitions?: Competition;
}

export interface Award {
  id: string;
  robot_competition_id: string;
  title: string;
  description: string | null;
  awarded_date: string | null;
  image_url: string | null;
  created_at: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}
