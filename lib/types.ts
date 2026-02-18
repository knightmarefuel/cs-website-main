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
