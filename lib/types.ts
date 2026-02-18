export type UserRole = "client" | "trainer" | "admin";

export type Profile = {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  community_id: string | null;
  community_other: string | null;
  medical_notes: string | null;
  created_at: string;
};

export type Community = {
  id: string;
  name: string;
  area: string | null;
  is_active: boolean;
  created_at: string;
};

export type ClassType = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
};

export type ClassSession = {
  id: string;
  community_id: string | null;
  class_type_id: string;
  trainer_id: string | null;
  start_time: string;
  end_time: string;
  capacity: number;
  status: "scheduled" | "cancelled" | "completed";
  notes: string | null;
  created_at: string;
};

export type LeadType = "personal_training" | "new_community_class";

export type Lead = {
  id: string;
  client_id: string;
  type: LeadType;
  preferred_time: string | null;
  message: string | null;
  created_at: string;
};

export type Booking = {
  id: string;
  session_id: string;
  client_id: string;
  status: "confirmed" | "cancelled" | "attended" | "no_show";
  booked_at: string;
  created_at: string;
};

export type BookingWithSession = Booking & {
  class_sessions: ClassSession;
};

export type PaymentStatus = "pending" | "approved" | "rejected";

export type PaymentSubmission = {
  id: string;
  client_id: string;
  amount: number;
  upi_ref: string | null;
  session_id: string | null;
  community_id: string | null;
  screenshot_path: string | null;
  status: PaymentStatus;
  admin_note: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

export type PaymentWithProfile = PaymentSubmission & {
  profiles: Pick<Profile, "full_name" | "phone">;
};

// Session with computed spots
export type SessionWithSpots = ClassSession & {
  class_types?: ClassType;
  booked_count: number;
  remaining_spots: number;
};
