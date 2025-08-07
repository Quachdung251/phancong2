// Types cho ứng dụng quản lý phân công án

export interface Prosecutor {
  id: string;
  name: string;
  position: 'Kiểm sát viên' | 'Kiểm tra viên' | 'Chuyên viên';
  experience_years: number;
  specialization_tags: string[];
  current_cases: number;
  current_defendants: number;
  last_assignment_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Leader {
  id: string;
  name: string;
  cases_this_year: number;
  created_at: string;
  updated_at: string;
}

export interface Case {
  id: string;
  case_number: string;
  case_name: string;
  case_type: 'Hình sự' | 'Dân sự' | 'Hành chính' | 'Kinh tế';
  law_articles: string;
  defendants_count: number;
  assigned_prosecutor_id?: string;
  assigned_leader_id?: string;
  status: 'Chờ phân công' | 'Đang giải quyết' | 'Hoàn thành' | 'Tạm đình chỉ';
  description?: string;
  created_at: string;
  updated_at: string;
  assigned_at?: string;
}

export interface AssignmentHistory {
  id: string;
  case_id: string;
  prosecutor_id: string;
  assigned_at: string;
  assigned_by: string;
  notes?: string;
  case?: Case;
  prosecutor?: Prosecutor;
}

export interface CaseAssignmentSuggestion {
  prosecutor: Prosecutor;
  score: number;
  reasons: string[];
}

export interface DashboardStats {
  total_prosecutors: number;
  total_active_cases: number;
  total_defendants: number;
  pending_assignments: number;
  assignments_this_month: number;
  average_cases_per_prosecutor: number;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  full_name?: string;
}

export interface FilterCriteria {
  position?: string;
  specialization?: string;
  experience_min?: number;
  experience_max?: number;
  search_term?: string;
  workload_max?: number;
}
