# Frontend API Proxy Routes for User Data

All user data endpoints are now accessible through the Next.js API routes at `/api/user-data/*`

## Available Endpoints

### 1. GET /api/user-data/profile
Get complete user profile with all related data.

**Response:**
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "uuid",
      "userid": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "inferred_areas_of_strength": ["Full-stack", "AI"]
    },
    "technical_skills": [
      {
        "category": "Programming Languages",
        "skills": [
          {"name": "Python", "level": "advanced"}
        ]
      }
    ],
    "work_experience": [...],
    "projects": [...],
    "education": [...],
    "learning_goals": [...],
    "resume": {...},
    "leetcode": {...}
  }
}
```

### 2. GET /api/user-data/skills
Get user's technical skills grouped by category.

### 3. GET /api/user-data/experience
Get user's work experience ordered by date.

### 4. GET /api/user-data/projects
Get user's projects.

### 5. GET /api/user-data/education
Get user's education history.

### 6. GET /api/user-data/goals
Get user's learning goals.
**Query params:** 
- `status` (optional): 'active', 'completed', or 'archived'. Default: 'active'

### 7. GET /api/user-data/resume
Get user's resume data including ATS score.

### 8. GET /api/user-data/leetcode
Get user's LeetCode profile and stats.

### 9. GET /api/user-data/ats-history
Get user's ATS score history for tracking improvement.
**Query params:**
- `limit` (optional): Number of records to return. Default: 10

### 10. GET /api/user-data/skill-gap-analysis
Get user's latest skill gap analysis.

## Usage Example (from React components)

```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

async function fetchUserProfile() {
  // Get auth token
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    console.error('No session found');
    return;
  }

  // Fetch user profile
  const response = await fetch('/api/user-data/profile', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    }
  });

  const result = await response.json();
  
  if (result.success) {
    console.log('User profile:', result.data);
    return result.data;
  } else {
    console.error('Error:', result.error);
  }
}
```

## Migration Path from localStorage

**Current state (using localStorage):**
```typescript
const profileData = localStorage.getItem('profile-data');
const skills = localStorage.getItem('user-skills');
```

**Future state (using database):**
```typescript
const profileData = await fetchUserProfile();
const skills = profileData.technical_skills;
```

## Notes

- All endpoints require authentication (Bearer token in Authorization header)
- The backend validates the token and extracts the user ID automatically
- Data is fetched from Supabase tables, not localStorage
- Endpoints return empty arrays/null if no data exists (not 404 errors)
- Data persistence survives browser cache clears
