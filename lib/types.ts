export type Status = "pending" | "in-progress" | "done";

export interface Entry {
  id: string;
  created_at: string;
  updated_at: string;
  date: string;
  category: string;
  reference_number: string;
  village: string;
  recipient_name: string;
  contact_number: string;
  description: string;
  deadline: string | null;
  status: Status;
}

export const CATEGORIES = ["Speed Post", "Registered", "Parcel", "EMS", "Other"];
