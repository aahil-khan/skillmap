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

// ============================================
// PEER MATCHING API CALLS
// ============================================

export interface PeerProfile {
  userid: string;
  display_name: string;
  title: string;
  bio: string;
  experience_level: 'Entry Level' | '1-3 years' | '3-5 years' | '5+ years' | 'Student';
  availability: 'Full-time' | 'Part-time' | 'Weekends only' | 'Evenings' | 'Flexible';
  looking_for: ('project' | 'dsa' | 'mentorship')[];
  skill_tags: string[];
  interest_areas: string[];
  is_open_to_connections: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PeerMatch {
  peerUserId: string;
  displayName: string;
  title: string;
  bio: string;
  experienceLevel: string;
  availability: string;
  lookingFor: string[];
  skillTags: string[];
  interestAreas: string[];
  overallScore: number;
  sharedSkills: string[];
  complementarySkills: string[];
  leetcodeStats?: {
    username: string;
    total_solved: number;
    easy_solved: number;
    medium_solved: number;
    hard_solved: number;
  };
}

export interface PeerConnection {
  id: string;
  sender_userid: string;
  receiver_userid: string;
  connection_type: 'project' | 'dsa' | 'mentorship';
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  sender_message?: string;
  responded_at?: string;
  created_at: string;
  sender_profile?: PeerProfile;
  receiver_profile?: PeerProfile;
}

export interface CreatePeerProfileData {
  display_name: string;
  title: string;
  bio: string;
  experience_level: 'Entry Level' | '1-3 years' | '3-5 years' | '5+ years' | 'Student';
  availability: 'Full-time' | 'Part-time' | 'Weekends only' | 'Evenings' | 'Flexible';
  looking_for: ('project' | 'dsa' | 'mentorship')[];
}

export interface SendConnectionData {
  receiverId: string;
  connectionType: 'project_partner' | 'study_partner' | 'mentorship' | 'general';
  message?: string;
}

/**
 * Create or update peer profile
 */
export async function upsertPeerProfile(profileData: CreatePeerProfileData): Promise<PeerProfile> {
  return apiRequest<PeerProfile>('/peer/profile', {
    method: 'POST',
    body: JSON.stringify(profileData),
  });
}

/**
 * Get current user's peer profile
 */
export async function getPeerProfile(): Promise<PeerProfile | null> {
  try {
    return await apiRequest<PeerProfile>('/peer/profile');
  } catch (error) {
    // Profile might not exist yet
    return null;
  }
}

/**
 * Deactivate peer profile
 */
export async function deactivatePeerProfile(): Promise<{ success: boolean; message: string }> {
  return apiRequest<{ success: boolean; message: string }>('/peer/profile', {
    method: 'DELETE',
  });
}

/**
 * Get recommended peer matches
 */
export async function getRecommendedMatches(
  matchType: 'project' | 'dsa' | 'both' = 'both',
  limit: number = 20
): Promise<PeerMatch[]> {
  const response = await apiRequest<{ matches: any[]; total: number; match_type: string }>(
    `/peer/matches?type=${matchType}&limit=${limit}`
  );
  
  // Transform backend response to frontend structure
  const matches = response.matches || [];
  
  return matches.map((match: any) => ({
    peerUserId: match.peer_profile?.userid || '',
    displayName: match.peer_profile?.display_name || '',
    title: match.peer_profile?.title || '',
    bio: match.peer_profile?.bio || '',
    experienceLevel: match.peer_profile?.experience_level || '',
    availability: match.peer_profile?.availability || '',
    lookingFor: match.peer_profile?.looking_for || [],
    skillTags: match.peer_profile?.skill_tags || [],
    interestAreas: match.peer_profile?.interest_areas || [],
    overallScore: match.match_score || 0,
    sharedSkills: match.shared_skills || [],
    complementarySkills: match.complementary_skills || [],
    leetcodeStats: match.peer_profile?.leetcode_stats || undefined,
  }));
}

/**
 * Send connection request to a peer
 */
export async function sendConnectionRequest(data: SendConnectionData): Promise<PeerConnection> {
  console.log('[API CLIENT] sendConnectionRequest called with:', data);
  return apiRequest<PeerConnection>('/peer/connect', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Skip a peer (track interaction)
 */
export async function skipPeer(peerUserId: string, matchScore: number): Promise<{ success: boolean; message: string }> {
  return apiRequest<{ success: boolean; message: string }>('/peer/skip', {
    method: 'POST',
    body: JSON.stringify({ peerUserId, matchScore }),
  });
}

/**
 * Get user's connections
 */
export async function getUserConnections(
  status?: 'pending' | 'accepted' | 'declined' | 'blocked'
): Promise<PeerConnection[]> {
  const queryString = status ? `?status=${status}` : '';
  return apiRequest<PeerConnection[]>(`/peer/connections${queryString}`);
}

/**
 * Respond to a connection request
 */
export async function respondToConnection(
  connectionId: string,
  response: 'accept' | 'decline'
): Promise<PeerConnection> {
  return apiRequest<PeerConnection>(`/peer/connections/${connectionId}/respond`, {
    method: 'POST',
    body: JSON.stringify({ response }),
  });
}

// ============================================
// NEW: CONNECTIONS & MESSAGING API
// ============================================

export interface PeerConnectionWithProfile {
  id: string;
  sender_userid: string;
  receiver_userid: string;
  connection_type: 'project_partner' | 'study_partner' | 'mentorship' | 'general';
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  sender_message?: string;
  created_at: string;
  responded_at?: string;
  unread_count: number;
  // Profile data
  sender_profile?: {
    display_name: string;
    title: string;
    bio: string;
    experience_level: string;
    availability: string;
    looking_for: string[];
  };
  receiver_profile?: {
    display_name: string;
    title: string;
    bio: string;
    experience_level: string;
    availability: string;
    looking_for: string[];
  };
}

export interface ConnectionsResponse {
  sent: PeerConnectionWithProfile[];
  received: PeerConnectionWithProfile[];
  accepted: PeerConnectionWithProfile[];
  pending_sent: PeerConnectionWithProfile[];
  pending_received: PeerConnectionWithProfile[];
}

export interface Message {
  id: string;
  connection_id: string;
  sender_userid: string;
  receiver_userid: string;
  message_text: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  sender_profile?: {
    display_name: string;
  };
}

/**
 * Get all connections for the current user
 */
export async function getConnections(status?: string): Promise<ConnectionsResponse> {
  const queryString = status ? `?status=${status}` : '';
  return apiRequest<ConnectionsResponse>(`/peer/connections${queryString}`);
}

/**
 * Respond to a connection request (accept/decline)
 */
export async function respondToConnectionRequest(
  connectionId: string,
  action: 'accept' | 'decline'
): Promise<{ success: boolean; data: PeerConnectionWithProfile; message: string }> {
  return apiRequest<{ success: boolean; data: PeerConnectionWithProfile; message: string }>(
    `/peer/connections/${connectionId}/respond`,
    {
      method: 'POST',
      body: JSON.stringify({ action }),
    }
  );
}

/**
 * Get messages for a connection
 */
export async function getConnectionMessages(
  connectionId: string,
  limit?: number
): Promise<{ connection_id: string; messages: Message[]; count: number }> {
  const queryString = limit ? `?limit=${limit}` : '';
  return apiRequest<{ connection_id: string; messages: Message[]; count: number }>(
    `/peer/connections/${connectionId}/messages${queryString}`
  );
}

/**
 * Send a message in a connection
 */
export async function sendConnectionMessage(
  connectionId: string,
  message: string
): Promise<{ success: boolean; data: Message; message: string }> {
  return apiRequest<{ success: boolean; data: Message; message: string }>(
    `/peer/connections/${connectionId}/messages`,
    {
      method: 'POST',
      body: JSON.stringify({ message }),
    }
  );
}

/**
 * Get unread message count
 */
export async function getUnreadMessageCount(): Promise<{ unread_count: number }> {
  return apiRequest<{ unread_count: number }>('/peer/connections/unread-count');
}
