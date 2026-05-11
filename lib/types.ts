export type Role = 'candidate' | 'employer' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  avatar_url: string;
  role: Role;
  date_of_birth: string | null;
  address: string;
  bio: string;
  is_verified: boolean;
  university: string;
  major: string;
  gpa: number | null;
  graduation_year: number | null;
  linkedin_url: string;
  portfolio_url: string;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  description: string;
  industry: string;
  company_size: string;
  website_url: string;
  address: string;
  tax_code: string;
  is_verified: boolean;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  company_id: string;
  title: string;
  description: string;
  requirements: string;
  benefits: string;
  job_type: 'fulltime' | 'parttime' | 'internship' | 'freelance';
  category: string;
  salary_min: number;
  salary_max: number;
  currency: string;
  address: string;
  is_remote: boolean;
  experience_level: 'entry' | 'junior' | 'mid' | 'senior' | 'lead';
  status: 'draft' | 'active' | 'paused' | 'closed';
  application_deadline: string | null;
  posted_by: string;
  created_at: string;
  updated_at: string;
  company?: Company;
  job_skills?: JobSkill[];
}

export interface JobSkill {
  id: string;
  job_id: string;
  skill_id: string;
  importance: number;
  skill?: Skill;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  created_at: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  created_at: string;
  skill?: Skill;
}

export interface Application {
  id: string;
  job_id: string;
  user_id: string;
  cover_letter: string;
  status: 'applied' | 'screening' | 'interview' | 'offered' | 'rejected' | 'withdrawn';
  match_score: number;
  is_unlocked: boolean;
  created_at: string;
  updated_at: string;
  job?: Job;
  profile?: Profile;
}

export interface MatchScore {
  id: string;
  user_id: string;
  job_id: string;
  score: number;
  skill_match: Record<string, unknown>;
  analyzed_at: string;
}

export interface Project {
  id: string;
  company_id: string | null;
  title: string;
  description: string;
  budget_min: number;
  budget_max: number;
  currency: string;
  category: string;
  skills_required: string[];
  status: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled';
  deadline: string | null;
  posted_by: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceBoard {
  id: string;
  project_id: string;
  title: string;
  created_at: string;
}

export interface WorkspaceColumn {
  id: string;
  board_id: string;
  title: string;
  sort_order: number;
  created_at: string;
  tasks?: WorkspaceTask[];
}

export interface WorkspaceTask {
  id: string;
  column_id: string;
  assignee_id: string | null;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  sort_order: number;
  due_date: string | null;
  estimated_hours: number;
  created_at: string;
  updated_at: string;
}

export interface TimeLog {
  id: string;
  task_id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number;
  description: string;
  created_at: string;
}

export interface EscrowTransaction {
  id: string;
  project_id: string;
  payer_id: string;
  payee_id: string;
  amount: number;
  platform_fee: number;
  status: 'deposited' | 'milestone_completed' | 'approved' | 'disbursed' | 'refunded' | 'disputed';
  milestone_description: string;
  created_at: string;
  updated_at: string;
}

export interface CreditBalance {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: 'purchase' | 'spend' | 'refund' | 'bonus';
  description: string;
  reference_id: string | null;
  reference_type: string;
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  badge_type: 'skill' | 'achievement' | 'certification';
  skill_id: string | null;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  awarded_at: string;
  badge?: Badge;
}

export interface SkillTest {
  id: string;
  skill_id: string;
  title: string;
  description: string;
  test_type: 'quiz' | 'coding';
  duration_minutes: number;
  passing_score: number;
  is_active: boolean;
  created_at: string;
  skill?: Skill;
}

export interface SkillTestAttempt {
  id: string;
  test_id: string;
  user_id: string;
  answers: Record<string, unknown>;
  score: number;
  passed: boolean;
  started_at: string;
  completed_at: string | null;
}

export interface CVUpload {
  id: string;
  user_id: string;
  file_url: string;
  file_name: string;
  file_type: 'pdf' | 'docx';
  ai_analysis: Record<string, unknown>;
  is_primary: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  ip_address: string;
  created_at: string;
}

export interface PrivacyConsent {
  id: string;
  user_id: string;
  consent_type: 'data_processing' | 'marketing' | 'third_party_sharing' | 'right_to_be_forgotten';
  is_granted: boolean;
  granted_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  link: string;
  is_read: boolean;
  created_at: string;
}

export interface EKYCVerification {
  id: string;
  user_id: string;
  id_card_front_url: string;
  id_card_back_url: string;
  selfie_url: string;
  id_number: string;
  full_name_on_id: string;
  date_of_birth_on_id: string | null;
  status: 'pending' | 'processing' | 'approved' | 'rejected';
  rejection_reason: string;
  verified_at: string | null;
  created_at: string;
}

export interface WebhookEndpoint {
  id: string;
  company_id: string;
  url: string;
  events: string[];
  secret: string;
  is_active: boolean;
  created_at: string;
}
