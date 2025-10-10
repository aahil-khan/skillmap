/**
 * API utility functions for fetching user data from backend
 * Replaces localStorage with database-backed API calls
 * Uses Next.js API routes as proxy to avoid CORS issues
 */

// Use Next.js API routes (proxy) instead of direct backend calls
const API_BASE_URL = '/api';

/**
 * Get authentication token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sb-jwt');
}

/**
 * Make authenticated API request through Next.js API proxy
 */
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No authentication token found. Please log in.');
  }

  // Use Next.js API routes (already includes /api prefix)
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  
  // Handle wrapped responses
  if (data.success && data.data) {
    return data.data as T;
  }
  
  return data as T;
}

// ============================================
// USER DATA API CALLS
// ============================================

export interface UserProfile {
  userid: string;
  name: string;
  email?: string;
  inferred_areas_of_strength?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Skill {
  id: string;
  userid: string;
  skill_name: string;
  skill_level: 'beginner' | 'intermediate' | 'advanced';
  skill_category: string;
  created_at?: string;
}

export interface SkillCategory {
  category: string;
  skills: Array<{
    id: string;
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    created_at?: string;
  }>;
}

export interface WorkExperience {
  id: string;
  userid: string;
  job_title: string;
  company: string;
  duration?: string;
  description?: string;
  responsibilities?: string[];
  technologies?: string[];
  achievements?: string[];
  display_order?: number;
}

export interface Project {
  id: string;
  userid: string;
  project_name: string;
  description?: string;
  technologies?: string[];
  github_url?: string;
  live_url?: string;
  display_order?: number;
}

export interface Education {
  id: string;
  userid: string;
  degree: string;
  institution: string;
  field_of_study?: string;
  graduation_year?: string;
  gpa?: string;
  display_order?: number;
}

export interface LearningGoal {
  id: string;
  userid: string;
  original_goal: string;
  refined_goal: string;
  goal_category?: string;
  status: 'active' | 'in_progress' | 'completed' | 'archived';
  priority?: 'low' | 'medium' | 'high';
  created_at?: string;
}

export interface Resume {
  id: string;
  userid: string;
  file_name: string;
  ats_score?: number;
  created_at?: string;
}

export interface LeetCodeProfile {
  id: string;
  userid: string;
  leetcode_username: string;
  total_solved: number;
  easy_solved: number;
  medium_solved: number;
  hard_solved: number;
  profile_data?: any;
}

export interface ATSHistory {
  id: string;
  userid: string;
  overall_score: number;
  skills_match?: number;
  experience_match?: number;
  education_match?: number;
  strengths?: string[];
  improvements?: string[];
  created_at?: string;
}

export interface SkillGapAnalysis {
  id: string;
  userid: string;
  goal_category: string;
  current_skills?: string[];
  required_skills?: string[];
  missing_skills?: string[];
  skills_to_improve?: string[];
  strengths?: string[];
  learning_path?: any;
  created_at?: string;
}

export interface CompleteUserProfile {
  profile: UserProfile | null;
  technical_skills: SkillCategory[];
  work_experience: WorkExperience[];
  projects: Project[];
  education: Education[];
  learning_goals: LearningGoal[];
  resume: Resume | null;
  leetcode: LeetCodeProfile | null;
}

/**
 * Fetch complete user profile (all data combined)
 */
export async function getUserProfile(): Promise<CompleteUserProfile> {
  return apiRequest<CompleteUserProfile>('/user-data/profile');
}

/**
 * Fetch user skills only
 */
export async function getUserSkills(): Promise<SkillCategory[]> {
  return apiRequest<SkillCategory[]>('/user-data/skills');
}

/**
 * Fetch work experience
 */
export async function getWorkExperience(): Promise<WorkExperience[]> {
  return apiRequest<WorkExperience[]>('/user-data/experience');
}

/**
 * Fetch projects
 */
export async function getProjects(): Promise<Project[]> {
  return apiRequest<Project[]>('/user-data/projects');
}

/**
 * Fetch education
 */
export async function getEducation(): Promise<Education[]> {
  return apiRequest<Education[]>('/user-data/education');
}

/**
 * Fetch learning goals
 */
export async function getLearningGoals(): Promise<LearningGoal[]> {
  return apiRequest<LearningGoal[]>('/user-data/goals');
}

/**
 * Fetch resume metadata
 */
export async function getResume(): Promise<Resume | null> {
  try {
    return await apiRequest<Resume>('/user-data/resume');
  } catch (error) {
    // Resume might not exist yet
    return null;
  }
}

/**
 * Fetch LeetCode profile
 */
export async function getLeetCodeProfile(): Promise<LeetCodeProfile | null> {
  try {
    return await apiRequest<LeetCodeProfile>('/user-data/leetcode');
  } catch (error) {
    // LeetCode profile might not exist yet
    return null;
  }
}

/**
 * Fetch ATS score history
 */
export async function getATSHistory(): Promise<ATSHistory[]> {
  return apiRequest<ATSHistory[]>('/user-data/ats-history');
}

/**
 * Fetch latest skill gap analysis
 */
export async function getSkillGapAnalysis(): Promise<SkillGapAnalysis | null> {
  try {
    return await apiRequest<SkillGapAnalysis>('/user-data/skill-gap-analysis');
  } catch (error) {
    // Analysis might not exist yet
    return null;
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Clear all localStorage data (except auth)
 */
export function clearLocalStorageData() {
  if (typeof window === 'undefined') return;
  
  const keysToRemove = [
    'profile-data',
    'extracted-skills',
    'user-skills',
    'skill-analysis',
    'user-intent',
    'skillmap-data',
    'skillmap-user',
    'leetcode-connected',
    'leetcode-username',
    'leetcode-profile',
  ];
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
}

/**
 * Format skills from API response for UI
 */
export function formatSkillsForUI(skills: Skill[]): SkillCategory[] {
  const grouped: { [key: string]: Skill[] } = {};
  
  skills.forEach(skill => {
    if (!grouped[skill.skill_category]) {
      grouped[skill.skill_category] = [];
    }
    grouped[skill.skill_category].push(skill);
  });
  
  return Object.entries(grouped).map(([category, categorySkills]) => ({
    category,
    skills: categorySkills.map(s => ({
      id: s.id,
      name: s.skill_name,
      level: s.skill_level,
      created_at: s.created_at
    }))
  }));
}

/**
 * Check if user has completed profile setup
 */
export async function hasCompletedSetup(): Promise<boolean> {
  try {
    const profile = await getUserProfile();
    return !!(profile.profile && profile.technical_skills.length > 0);
  } catch (error) {
    return false;
  }
}
