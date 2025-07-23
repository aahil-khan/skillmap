# 🧠 SkillMap — Personalized Learning Engine (v0)

**SkillMap** is an AI-powered tool that helps you identify skill gaps and prioritize your learning goals based on your resume and intent. It uses LLMs and vector search to extract, structure, and reason about your current skill profile.

---

## 🔍 What It Does (v0)

> 🎯 Input → Your resume + your learning goal
> 🧹 Output → A categorized list of skill gaps that you should focus on tailored to your intent

### ↺ How it works:

1. **Upload Resume** — PDF is parsed and converted into structured JSON (skills, experience, projects)
2. **Infer Skill Levels** — LLM guesses beginner/intermediate/advanced levels, which the user can tweak manually
3. **User Sets Intent** — e.g., “I want to focus on DSA”
4. **Gap Detection Engine**:

   * Filters the global skill taxonomy using semantic similarity to the goal
   * Compares it with your current profile
   * Categorizes missing or underdeveloped skills by priority

---

## 🧰 Tech Stack

| Layer               | Tools Used                                              |
| ------------------- | ------------------------------------------------------- |
| **Frontend**        | Next.js, Tailwind CSS                                   |
| **Backend**         | Node.js, Express, Qdrant                                |
| **LLM Ops**         | GPT-3.5-turbo (Chat Completion), OpenAI Embeddings      |
| **PDF Parsing**     | `fpdf`, custom parser                                   |
| **Vector DB**       | Qdrant (for both skill taxonomy & user profile storage) |
| **Matching Engine** | Cosine similarity + category filters                    |

---

## 🧠 Architecture Overview

```
User PDF ─▶ PDF Parser ─▶ GPT-3.5-turbo Resume → JSON
                                │
                     Inferred Skill Levels
                                ▼
             [ Manual Tweaking on UI (WIP) ]
                                ▼
      User Intent (e.g., "I want to learn DSA")
                                ▼
   ┌───────────────────────────────────────────────┐
   │     Gap Detection Engine (Semantic Search)   │
   │     • Qdrant filter on goal-related skills   │
   │     • Compare against profile + levels       │
   │     • Categorize into Gaps & Priorities      │
   └───────────────────────────────────────────────┘
                                ▼
                  🎯 Personalized Learning Path
```

---

## 🔮 Future Scope (v1+)

* ✨ Add peer matching based on overlapping strengths and gaps
* 📊 Dashboard for users to set goals and update skills
* 🔗 Connect to LeetCode to auto-update profile with solved problems
* 🧠 Fine-tune the engine for more accurate recommendations
* 🧑‍🤝‍🧑 Friend system for peer connection (DMs, profile sync)
* 🧹 Chrome extension for live peer recommendations on LeetCode

  * One-click option to message a peer directly from the extension (like sharing a reel)

---

## 🚀 Why This Matters

Most learning platforms throw generic roadmaps at users. **SkillMap** aims to:

* Reverse-engineer your *existing* knowledge
* Tie it directly to your *goals*
* Help you *prioritize learning efficiently*
* Connect you to peers who complement your skillset

## 👨‍💻 Built by

- [Aahil Khan](https://github.com/aahil-khan)
- [Anoushka Awasthi](https://github.com/anoushkawasthi)
