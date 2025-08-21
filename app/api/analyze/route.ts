import { type NextRequest, NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateText, embed } from "ai"

// Mock skill taxonomy for semantic matching
const SKILL_CATEGORIES = {
  "Web Development": [
    "HTML",
    "CSS",
    "JavaScript",
    "TypeScript",
    "React",
    "Vue.js",
    "Angular",
    "Next.js",
    "Node.js",
    "Express.js",
    "REST APIs",
    "GraphQL",
    "MongoDB",
    "PostgreSQL",
    "Git",
    "Testing",
    "Responsive Design",
    "Web Performance",
  ],
  "Backend Development": [
    "Node.js",
    "Python",
    "Java",
    "C#",
    "Express.js",
    "Django",
    "Flask",
    "Spring Boot",
    "REST APIs",
    "GraphQL",
    "PostgreSQL",
    "MongoDB",
    "Redis",
    "Docker",
    "AWS",
    "System Design",
    "Testing",
  ],
  "Data Science": [
    "Python",
    "R",
    "SQL",
    "Pandas",
    "NumPy",
    "Matplotlib",
    "Seaborn",
    "Jupyter",
    "Machine Learning",
    "Statistics",
    "Data Visualization",
    "TensorFlow",
    "PyTorch",
    "Scikit-learn",
  ],
  "Mobile Development": [
    "React Native",
    "Flutter",
    "Swift",
    "Kotlin",
    "JavaScript",
    "TypeScript",
    "REST APIs",
    "Mobile UI/UX",
    "App Store Deployment",
    "Testing",
  ],
  DevOps: [
    "Docker",
    "Kubernetes",
    "AWS",
    "Azure",
    "GCP",
    "CI/CD",
    "Jenkins",
    "Git",
    "Linux",
    "Monitoring",
    "Infrastructure as Code",
    "Security",
  ],
}

interface UserSkill {
  name: string
  level: "beginner" | "intermediate" | "advanced"
}

interface AnalyzeRequest {
  skills: UserSkill[]
  projects?: string
  goal: string
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json()
    const { skills, projects, goal } = body

    if (!goal || !skills) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Step 1: Use embeddings to find the most relevant skill category
    const { embedding: goalEmbedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: goal,
    })

    // For demo purposes, we'll use simple keyword matching
    // In production, you'd compare embeddings with category descriptions
    const category = findBestCategory(goal)
    const requiredSkills = SKILL_CATEGORIES[category as keyof typeof SKILL_CATEGORIES]

    // Step 2: Analyze skill gaps
    const userSkillNames = skills.map((s) => s.name)
    const userSkillLevels = skills.reduce((acc, s) => ({ ...acc, [s.name]: s.level }), {} as Record<string, string>)

    const gaps = []
    const known = []

    for (const skill of requiredSkills) {
      if (userSkillNames.includes(skill)) {
        const level = userSkillLevels[skill]
        if (level === "beginner") {
          gaps.push({ skill, status: "weak", level })
        } else {
          known.push(skill)
        }
      } else {
        gaps.push({ skill, status: "missing" })
      }
    }

    // Step 3: Generate personalized feedback with GPT
    const structuredData = {
      goal,
      category,
      gaps: gaps.slice(0, 8), // Limit for context
      known: known.slice(0, 10),
      projects: projects || "No projects mentioned",
    }

    const { text: feedback } = await generateText({
      model: openai("gpt-4o"),
      system: `You are a career mentor for developers. Provide personalized, actionable advice based on skill gap analysis. Be encouraging but realistic. Format your response in markdown with clear sections.`,
      prompt: `
Analyze this developer's skill profile and provide personalized recommendations:

**Goal:** ${goal}
**Target Category:** ${category}
**Strong Skills:** ${known.join(", ") || "None identified"}
**Skills to Strengthen:** ${
        gaps
          .filter((g) => g.status === "weak")
          .map((g) => `${g.skill} (${g.level})`)
          .join(", ") || "None"
      }
**Missing Skills:** ${
        gaps
          .filter((g) => g.status === "missing")
          .map((g) => g.skill)
          .join(", ") || "None"
      }
**Experience:** ${projects}

Provide:
1. A brief assessment of their current position
2. Priority skills to focus on (max 3-4)
3. Specific learning path recommendations
4. Suggested projects or next steps
5. Encouragement and realistic timeline

Keep it concise but actionable. Use a supportive, mentoring tone.
      `,
    })

    return NextResponse.json({
      goal,
      category,
      gaps,
      known,
      feedback,
      analysis: structuredData,
    })
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze skills" }, { status: 500 })
  }
}

function findBestCategory(goal: string): string {
  const goalLower = goal.toLowerCase()

  if (goalLower.includes("backend") || goalLower.includes("server") || goalLower.includes("api")) {
    return "Backend Development"
  } else if (
    goalLower.includes("data") ||
    goalLower.includes("machine learning") ||
    goalLower.includes("ai") ||
    goalLower.includes("analytics")
  ) {
    return "Data Science"
  } else if (
    goalLower.includes("mobile") ||
    goalLower.includes("app") ||
    goalLower.includes("ios") ||
    goalLower.includes("android")
  ) {
    return "Mobile Development"
  } else if (
    goalLower.includes("devops") ||
    goalLower.includes("deployment") ||
    goalLower.includes("infrastructure") ||
    goalLower.includes("cloud")
  ) {
    return "DevOps"
  } else {
    return "Web Development" // default
  }
}
