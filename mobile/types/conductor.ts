export interface ConductorProfile {
  id: string;
  full_name: string;
  nic_number: string | null;
  employee_id: string;
  phone_number: string | null;
  depot: string | null;
  role: 'CONDUCTOR';
  pin_hash: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}