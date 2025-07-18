export interface LeaderboardEntry {
  name: string
  score: number
  category: string
  difficulty: "easy" | "medium" | "hard"
  time: number
  date: string
}

const LEADERBOARD_KEY = "quiz-leaderboard"

export function getLeaderboard(): LeaderboardEntry[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(LEADERBOARD_KEY)
    if (!stored) return []

    const scores = JSON.parse(stored) as LeaderboardEntry[]
    return scores.sort((a, b) => {
      // Sort by score first (descending), then by time (ascending)
      if (b.score !== a.score) {
        return b.score - a.score
      }
      return a.time - b.time
    })
  } catch (error) {
    console.error("Error loading leaderboard:", error)
    return []
  }
}

export function saveScore(entry: LeaderboardEntry): void {
  if (typeof window === "undefined") return

  try {
    const currentScores = getLeaderboard()
    const newScores = [...currentScores, entry]

    // Keep only top 100 scores to prevent localStorage from getting too large
    const sortedScores = newScores
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score
        }
        return a.time - b.time
      })
      .slice(0, 100)

    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(sortedScores))
  } catch (error) {
    console.error("Error saving score:", error)
  }
}

export function clearLeaderboard(): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(LEADERBOARD_KEY)
  } catch (error) {
    console.error("Error clearing leaderboard:", error)
  }
}
