// Free text — these are just suggestions shown while typing, not an
// enforced list. Any category name can be typed.
export const SUGGESTED_CATEGORIES = ["Bridal", "Aso-ebi", "Casual"];

export type OrderStatus =
  | "requested"
  | "confirmed"
  | "fabric_received"
  | "cutting"
  | "sewing"
  | "ready_for_fitting"
  | "ready_for_pickup"
  | "completed"
  | "cancelled";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  requested: "Requested",
  confirmed: "Confirmed",
  fabric_received: "Fabric received",
  cutting: "Cutting",
  sewing: "Sewing",
  ready_for_fitting: "Ready for fitting",
  ready_for_pickup: "Ready for pickup",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
  "requested",
  "confirmed",
  "fabric_received",
  "cutting",
  "sewing",
  "ready_for_fitting",
  "ready_for_pickup",
  "completed",
];

export interface Design {
  id: string;
  reference: string;
  title: string;
  category: string;
  description: string | null;
  labour_price: number | null;
  estimated_yards: number | null;
  cover_photo_url: string | null;
  photos: string[];
  videos: string[];
  active: boolean;
  display_order: number;
  created_at: string;
}

export interface Material {
  id: string;
  name: string;
  type: string | null;
  photo_url: string | null;
  price_per_yard: number;
  in_stock: boolean;
}

export interface CapacitySettings {
  accepting_orders: boolean;
  booked_until: string | null;
  chat_read_receipts_enabled: boolean;
}

export interface Client {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  user_id: string | null;
  created_at: string;
}

export interface WaitlistEntry {
  id: string;
  full_name: string;
  phone: string;
  design_reference: string | null;
  notes: string | null;
  contacted: boolean;
  created_at: string;
}

export interface Measurement {
  id: string;
  client_id: string;
  source: "client" | "designer";
  verified: boolean;
  bust: number | null;
  waist: number | null;
  hip: number | null;
  shoulder: number | null;
  sleeve_length: number | null;
  back_length: number | null;
  inseam: number | null;
  notes: string | null;
  taken_at: string;
}

export interface ChatMessage {
  id: string;
  client_id: string;
  sender_role: "client" | "admin";
  body: string;
  media_url: string | null;
  read_by_client: boolean;
  read_by_admin: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  reference: string;
  client_id: string;
  design_id: string | null;
  measurement_id: string | null;
  material_id: string | null;
  own_fabric: boolean;
  event_date: string | null;
  budget_note: string | null;
  estimated_price: number | null;
  final_price: number | null;
  status: OrderStatus;
  created_at: string;
}

export interface SavedDesign {
  id: string;
  client_id: string;
  design_id: string;
  created_at: string;
}

export interface Review {
  id: string;
  client_id: string | null;
  order_id: string | null;
  design_id: string | null;
  reviewer_name: string;
  rating: number;
  body: string | null;
  photo_url: string | null;
  source: "buyer" | "admin";
  published: boolean;
  created_at: string;
}
